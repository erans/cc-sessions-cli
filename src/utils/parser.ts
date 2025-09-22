import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { open } from 'fs/promises';
import type { SessionMessage, ToolCall, ClaudeSessionEntry } from '../types.js';

export async function parseJsonlSession(filePath: string): Promise<SessionMessage[]> {
  try {
    const messages: SessionMessage[] = [];
    const entryMap = new Map<string, ClaudeSessionEntry>();

    // First pass: read and parse entries
    const fileStream = createReadStream(filePath, { encoding: 'utf-8' });
    const rl = createInterface({
      input: fileStream,
      crlfDelay: Infinity // Handle Windows line endings
    });

    const entries: ClaudeSessionEntry[] = [];

    for await (const line of rl) {
      if (!line.trim()) continue;

      try {
        const parsed = JSON.parse(line) as ClaudeSessionEntry;
        entries.push(parsed);

        if (parsed.uuid) {
          entryMap.set(parsed.uuid, parsed);
        }
      } catch {
        console.warn(`Warning: Skipping malformed JSON line: ${line.substring(0, 100)}...`);
      }
    }

    // Process entries to extract messages
    for (const entry of entries) {
      if (entry.type === 'user' && entry.message) {
        const message: SessionMessage = {
          role: 'user',
          content: extractContent(entry.message.content),
          timestamp: entry.timestamp || '',
          uuid: entry.uuid || '',
          parentUuid: entry.parentUuid || undefined,
        };

        // Check if this is a tool result
        if (entry.toolUseResult) {
          const toolOutput = formatToolResult(entry.toolUseResult);
          if (toolOutput) {
            message.content = toolOutput;
          }
        }

        messages.push(message);
      } else if (entry.type === 'assistant' && entry.message) {
        const content = extractContent(entry.message.content);
        const tools = extractToolsFromContent(entry.message.content);

        const message: SessionMessage = {
          role: 'assistant',
          content,
          timestamp: entry.timestamp || '',
          uuid: entry.uuid || '',
          parentUuid: entry.parentUuid || undefined,
          tools_used: tools.length > 0 ? tools : undefined,
        };

        messages.push(message);
      }
    }

    return messages;
  } catch (error) {
    throw new Error(`Failed to read session file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractContent(content: string | Array<{ type?: string; text?: string; name?: string; input?: Record<string, unknown>; content?: string }>): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map(item => {
        if (typeof item === 'string') return item;
        if (item.type === 'text') return item.text || '';
        if (item.type === 'tool_use') {
          return `[Tool: ${item.name}]${item.input?.description ? ` - ${item.input.description}` : ''}`;
        }
        if (item.type === 'tool_result') {
          return formatToolResultContent(item.content || '');
        }
        return '';
      })
      .filter(Boolean)
      .join('\n');
  }

  return '';
}

function extractToolsFromContent(content: string | Array<{ type?: string; name?: string; input?: Record<string, unknown> }>): ToolCall[] {
  const tools: ToolCall[] = [];

  if (Array.isArray(content)) {
    for (const item of content) {
      if (item.type === 'tool_use') {
        tools.push({
          tool: item.name || 'unknown',
          description: typeof item.input?.description === 'string' ? item.input.description : undefined,
          input: item.input,
        });
      }
    }
  }

  return tools;
}

function formatToolResult(toolResult: { stdout?: string; stderr?: string; interrupted?: boolean }): string {
  const parts: string[] = [];

  if (toolResult.stdout) {
    parts.push(`Output: ${toolResult.stdout}`);
  }

  if (toolResult.stderr) {
    parts.push(`Error: ${toolResult.stderr}`);
  }

  if (toolResult.interrupted) {
    parts.push('(Interrupted)');
  }

  return parts.join('\n');
}

function formatToolResultContent(content: string): string {
  return content || '';
}

export function extractToolCalls(content: string): ToolCall[] {
  const tools: ToolCall[] = [];
  const toolRegex = /\[Tool:\s*(\w+)\](?:\s*-\s*(.+?))?(?:\s*-\s*(.+?))?/gi;

  let match;
  while ((match = toolRegex.exec(content)) !== null) {
    const tool: ToolCall = {
      tool: match[1],
      description: match[2]?.trim(),
    };

    if (match[3]?.includes(':')) {
      const [filePath, lineNumber] = match[3].split(':');
      tool.file_path = filePath.trim();
      tool.line_number = lineNumber ? parseInt(lineNumber.trim()) : undefined;
    }

    tools.push(tool);
  }

  return tools;
}

export async function getSessionTimestamps(filePath: string): Promise<{ startTime?: Date; endTime?: Date }> {
  try {
    const fileHandle = await open(filePath, 'r');

    let firstTimestamp: string | undefined;
    let lastTimestamp: string | undefined;

    try {
      // Read multiple lines from the beginning to find first timestamp
      const firstLinesStream = createReadStream(filePath, { encoding: 'utf-8', end: 8192 });
      const firstLinesInterface = createInterface({
        input: firstLinesStream,
        crlfDelay: Infinity
      });

      for await (const line of firstLinesInterface) {
        if (line.trim()) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.timestamp) {
              firstTimestamp = parsed.timestamp;
              break; // Found first timestamp, stop looking
            }
          } catch {
            // Skip malformed lines and continue
          }
        }
      }

      // Read from the end to find last timestamp
      const stats = await fileHandle.stat();
      const fileSize = stats.size;

      // Read the last 8KB to capture multiple lines
      const bufferSize = Math.min(8192, fileSize);
      const buffer = Buffer.alloc(bufferSize);

      await fileHandle.read(buffer, 0, bufferSize, fileSize - bufferSize);
      const lastChunk = buffer.toString('utf-8');

      // Split into lines and check from last to first for timestamp
      const lines = lastChunk.split('\n').filter(line => line.trim());

      // Check lines from end to beginning until we find a timestamp
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const parsed = JSON.parse(lines[i]);
          if (parsed.timestamp) {
            lastTimestamp = parsed.timestamp;
            break; // Found last timestamp, stop looking
          }
        } catch {
          // Skip malformed lines and continue
        }
      }
    } finally {
      await fileHandle.close();
    }

    return {
      startTime: firstTimestamp ? new Date(firstTimestamp) : undefined,
      endTime: lastTimestamp ? new Date(lastTimestamp) : undefined
    };
  } catch (error) {
    console.warn(`Warning: Could not read timestamps from ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
    return {};
  }
}