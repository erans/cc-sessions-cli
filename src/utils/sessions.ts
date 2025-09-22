import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { getSessionTimestamps } from './parser.js';
import type { SessionMetadata, SortOrder } from '../types.js';

function getClaudeProjectsDirectory(): string {
  const home = homedir();
  // On Windows, Claude might use %APPDATA% instead of home directory
  if (process.platform === 'win32') {
    const appdata = process.env.APPDATA;
    if (appdata) {
      return join(appdata, 'claude', 'projects');
    }
  }
  return join(home, '.claude', 'projects');
}

function convertProjectPathToDirectoryName(projectPath: string): string {
  // Convert absolute path to directory name by replacing / or \ with -
  // e.g., /home/user/project -> -home-user-project
  // e.g., C:\Users\user\project -> C--Users-user-project
  return projectPath.replace(/[/\\]/g, '-');
}

export async function findSessionsDirectory(projectPath: string): Promise<string> {
  const claudeProjectsDir = getClaudeProjectsDirectory();
  const projectDirName = convertProjectPathToDirectoryName(projectPath);
  const projectSessionsPath = join(claudeProjectsDir, projectDirName);

  try {
    const stats = await stat(projectSessionsPath);
    if (!stats.isDirectory()) {
      throw new Error(`Sessions path exists but is not a directory: ${projectSessionsPath}`);
    }
    return projectSessionsPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Claude Code sessions not found for project: ${projectPath}\nLooked in: ${projectSessionsPath}`);
    }
    throw error;
  }
}

export async function getSessionFiles(sessionsPath: string): Promise<SessionMetadata[]> {
  try {
    const files = await readdir(sessionsPath);
    const jsonlFiles = files.filter(file => file.endsWith('.jsonl'));

    const sessions: SessionMetadata[] = [];

    for (const file of jsonlFiles) {
      const filePath = join(sessionsPath, file);
      const stats = await stat(filePath);
      const sessionId = file.replace('.jsonl', '');

      // Get timestamps from JSONL content
      const timestamps = await getSessionTimestamps(filePath);

      sessions.push({
        sessionId,
        filePath,
        lastModified: stats.mtime,
        startTime: timestamps.startTime,
        endTime: timestamps.endTime,
        messageCount: 0, // Will be calculated when needed
      });
    }

    return sessions;
  } catch (error) {
    throw new Error(`Failed to read sessions directory: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function sortSessions(sessions: SessionMetadata[], order: SortOrder): SessionMetadata[] {
  return sessions.sort((a, b) => {
    // Prefer endTime for sorting, fall back to startTime, then file modification time
    const aTime = a.endTime || a.startTime || a.lastModified;
    const bTime = b.endTime || b.startTime || b.lastModified;

    const comparison = aTime.getTime() - bTime.getTime();
    return order === 'asc' ? comparison : -comparison;
  });
}