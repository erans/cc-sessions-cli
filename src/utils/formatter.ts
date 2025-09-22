import chalk from 'chalk';
import type { SessionMessage, ToolCall } from '../types.js';

export function formatSessionAsLlm(messages: SessionMessage[], sessionId: string): string {
  const output: string[] = [];

  output.push(`Session: ${sessionId}`);

  if (messages.length > 0) {
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    if (firstMessage.timestamp && lastMessage.timestamp) {
      const startTime = new Date(firstMessage.timestamp);
      const endTime = new Date(lastMessage.timestamp);
      const duration = formatDuration(endTime.getTime() - startTime.getTime());

      output.push(`Date: ${startTime.toLocaleString()}`);
      output.push(`Duration: ${duration}`);
    }

    output.push(`Messages: ${messages.length}`);
  }

  output.push('');

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const isUser = message.role === 'user';
    const roleName = isUser ? 'User' : 'Assistant';

    output.push(`== ${roleName.toUpperCase()} ==`);
    output.push('');

    const contentLines = message.content.split('\n');
    for (const line of contentLines) {
      output.push(line);
    }

    if (message.tools_used && message.tools_used.length > 0) {
      output.push('');
      output.push('Tools used:');
      for (const tool of message.tools_used) {
        output.push(`- ${formatToolCall(tool)}`);
      }
    }

    if (i < messages.length - 1) {
      output.push('');
      output.push('---');
      output.push('');
    }
  }

  return output.join('\n');
}

export function formatSessionAsHuman(messages: SessionMessage[], sessionId: string): string {
  const output: string[] = [];

  output.push(chalk.bold.cyan(`Session: ${sessionId}`));

  if (messages.length > 0) {
    const firstMessage = messages[0];
    const lastMessage = messages[messages.length - 1];

    if (firstMessage.timestamp && lastMessage.timestamp) {
      const startTime = new Date(firstMessage.timestamp);
      const endTime = new Date(lastMessage.timestamp);
      const duration = formatDuration(endTime.getTime() - startTime.getTime());

      output.push(chalk.gray(`Date: ${startTime.toLocaleString()}`));
      output.push(chalk.gray(`Duration: ${duration}`));
    }

    output.push(chalk.gray(`Messages: ${messages.length}`));
  }

  output.push('');

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i];
    const isUser = message.role === 'user';

    // Add timestamp if available
    if (message.timestamp) {
      const timestamp = new Date(message.timestamp);
      output.push(chalk.gray(`[${timestamp.toLocaleTimeString()}]`));
    }

    if (isUser) {
      output.push(chalk.bold.blue('👤 USER'));
    } else {
      output.push(chalk.bold.green('🤖 ASSISTANT'));
    }

    output.push('');

    const contentLines = message.content.split('\n');
    for (const line of contentLines) {
      if (isUser) {
        output.push(chalk.blue(line));
      } else {
        output.push(line); // Keep assistant messages in default color for readability
      }
    }

    if (message.tools_used && message.tools_used.length > 0) {
      output.push('');
      output.push(chalk.yellow.bold('🔧 Tools used:'));
      for (const tool of message.tools_used) {
        output.push(chalk.yellow(`  • ${formatToolCall(tool)}`));
      }
    }

    if (i < messages.length - 1) {
      output.push('');
      output.push(chalk.gray('─'.repeat(50)));
      output.push('');
    }
  }

  return output.join('\n');
}

function formatToolCall(tool: ToolCall): string {
  let result = `[Tool: ${tool.tool}]`;

  if (tool.description) {
    result += ` - ${tool.description}`;
  }

  if (tool.file_path) {
    result += ` - ${tool.file_path}`;
    if (tool.line_number) {
      result += `:${tool.line_number}`;
    }
  }

  return result;
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}