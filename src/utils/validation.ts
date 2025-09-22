import { access, stat } from 'fs/promises';
import { resolve } from 'path';

export async function validateProjectPath(projectPath: string): Promise<string> {
  const resolvedPath = resolve(projectPath);

  try {
    await access(resolvedPath);
    const stats = await stat(resolvedPath);

    if (!stats.isDirectory()) {
      throw new Error(`Path is not a directory: ${resolvedPath}`);
    }

    return resolvedPath;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Project path does not exist: ${resolvedPath}`);
    }
    throw error;
  }
}

export function validateSessionId(sessionId: string): void {
  if (!sessionId || sessionId.trim().length === 0) {
    throw new Error('Session ID cannot be empty');
  }

  if (sessionId.includes('/') || sessionId.includes('\\')) {
    throw new Error('Session ID cannot contain path separators');
  }

  if (sessionId.includes('.')) {
    throw new Error('Session ID should not include file extension');
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(sessionId)) {
    throw new Error('Session ID can only contain alphanumeric characters, hyphens, and underscores');
  }
}