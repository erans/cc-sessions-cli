import { readFile, stat } from 'fs/promises';
import { join } from 'path';
import { findSessionsDirectory } from '../utils/sessions.js';
import { parseJsonlSession } from '../utils/parser.js';
import { formatSessionAsLlm, formatSessionAsHuman } from '../utils/formatter.js';
import { isDateInRange, formatTimeRange } from '../utils/datetime.js';
import type { OutputFormat } from '../types.js';
import type { TimeRange } from '../utils/datetime.js';

export async function viewSession(projectPath: string, sessionId: string, format: OutputFormat, timeRange?: TimeRange): Promise<void> {
  const sessionsPath = await findSessionsDirectory(projectPath);
  const sessionFile = join(sessionsPath, `${sessionId}.jsonl`);

  try {
    await stat(sessionFile);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Session file not found: ${sessionId}.jsonl`);
    }
    throw error;
  }

  if (format === 'jsonl') {
    const content = await readFile(sessionFile, 'utf-8');
    if (timeRange && (timeRange.from || timeRange.to)) {
      // Filter JSONL lines by timestamp for raw output
      const filteredLines = content.split('\n')
        .filter(line => {
          if (!line.trim()) return false;
          try {
            const parsed = JSON.parse(line);
            if (parsed.timestamp) {
              const messageTime = new Date(parsed.timestamp);
              return isDateInRange(messageTime, timeRange);
            }
          } catch {
            // Keep malformed lines in raw output
          }
          return true;
        });
      console.log(filteredLines.join('\n'));
    } else {
      console.log(content);
    }
    return;
  }

  let messages = await parseJsonlSession(sessionFile);

  // Filter messages by time range if specified
  if (timeRange && (timeRange.from || timeRange.to)) {
    messages = messages.filter(message => {
      if (message.timestamp) {
        const messageTime = new Date(message.timestamp);
        return isDateInRange(messageTime, timeRange);
      }
      return false; // Exclude messages without timestamps when filtering
    });
  }

  if (messages.length === 0) {
    if (timeRange && (timeRange.from || timeRange.to)) {
      console.log(`No messages found in session ${sessionId} ${formatTimeRange(timeRange)}.`);
    } else {
      console.log(`Session ${sessionId} appears to be empty or contains no valid messages.`);
    }
    return;
  }

  let formattedOutput: string;
  if (format === 'human') {
    formattedOutput = formatSessionAsHuman(messages, sessionId);
  } else {
    formattedOutput = formatSessionAsLlm(messages, sessionId);
  }

  console.log(formattedOutput);
}