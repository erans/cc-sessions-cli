#!/usr/bin/env node

import { Command } from 'commander';
import { listSessions } from './commands/list.js';
import { viewSession } from './commands/view.js';
import { validateProjectPath, validateSessionId } from './utils/validation.js';
import { parseTimeRange } from './utils/datetime.js';
import type { SortOrder, OutputFormat, ListFormat } from './types.js';

const program = new Command();

program
  .name('cc-sessions')
  .description('CLI tool to manage and view Claude Code sessions')
  .version('1.0.0');

program
  .command('list')
  .description('List all sessions for the project')
  .argument('<project-path>', 'Full path to the Claude Code project')
  .option('--sort <order>', 'Sort order: asc or desc', 'desc')
  .option('--format <format>', 'Output format: table or csv', 'table')
  .option('--from <time>', 'Filter sessions from this time (e.g., "2023-12-15", "1d", "-10m")')
  .option('--to <time>', 'Filter sessions to this time (e.g., "now", "2023-12-15 14:30", "1h")')
  .option('--limit <number>', 'Limit the number of results (no limit by default)')
  .action(async (projectPath, options) => {
    const sortOrder = options.sort as SortOrder;
    const format = options.format as ListFormat;

    if (!['asc', 'desc'].includes(sortOrder)) {
      console.error('Error: --sort must be either "asc" or "desc"');
      process.exit(1);
    }

    if (!['table', 'csv'].includes(format)) {
      console.error('Error: --format must be either "table" or "csv"');
      process.exit(1);
    }

    let limit: number | undefined;
    if (options.limit) {
      limit = parseInt(options.limit, 10);
      if (isNaN(limit) || limit <= 0) {
        console.error('Error: --limit must be a positive number');
        process.exit(1);
      }
    }

    try {
      const validatedProjectPath = await validateProjectPath(projectPath);
      const timeRange = parseTimeRange(options.from, options.to);
      await listSessions(validatedProjectPath, sortOrder, format, timeRange, limit);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('view')
  .description('View a specific session')
  .argument('<project-path>', 'Full path to the Claude Code project')
  .argument('<session-id>', 'Session ID (filename without .jsonl extension)')
  .option('--format <format>', 'Output format: llm, human, or jsonl', 'llm')
  .option('--from <time>', 'Filter messages from this time (e.g., "2023-12-15", "1d", "-10m")')
  .option('--to <time>', 'Filter messages to this time (e.g., "now", "2023-12-15 14:30", "1h")')
  .action(async (projectPath, sessionId, options) => {
    const format = options.format as OutputFormat;

    if (!['llm', 'human', 'jsonl'].includes(format)) {
      console.error('Error: --format must be either "llm", "human", or "jsonl"');
      process.exit(1);
    }

    try {
      const validatedProjectPath = await validateProjectPath(projectPath);
      validateSessionId(sessionId);
      const timeRange = parseTimeRange(options.from, options.to);
      await viewSession(validatedProjectPath, sessionId, format, timeRange);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();