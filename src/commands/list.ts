import { findSessionsDirectory, getSessionFiles, sortSessions } from '../utils/sessions.js';
import { isDateInRange, formatTimeRange } from '../utils/datetime.js';
import type { SortOrder, ListFormat, SessionMetadata } from '../types.js';
import type { TimeRange } from '../utils/datetime.js';

export async function listSessions(projectPath: string, sortOrder: SortOrder, format: ListFormat = 'table', timeRange?: TimeRange, limit?: number): Promise<void> {
  const sessionsPath = await findSessionsDirectory(projectPath);
  let sessions = await getSessionFiles(sessionsPath);

  // Filter sessions by time range if specified
  if (timeRange && (timeRange.from || timeRange.to)) {
    sessions = sessions.filter(session => {
      // Use endTime for filtering, fall back to startTime, then lastModified
      const sessionTime = session.endTime || session.startTime || session.lastModified;
      return isDateInRange(sessionTime, timeRange);
    });
  }

  const sortedSessions = sortSessions(sessions, sortOrder);

  if (sortedSessions.length === 0) {
    if (timeRange && (timeRange.from || timeRange.to)) {
      console.log(`No Claude Code sessions found in this project ${formatTimeRange(timeRange)}.`);
    } else {
      console.log('No Claude Code sessions found in this project.');
    }
    return;
  }

  // Apply limit if specified
  const limitedSessions = limit ? sortedSessions.slice(0, limit) : sortedSessions;

  if (format === 'csv') {
    outputAsCsv(limitedSessions);
  } else {
    outputAsTable(limitedSessions, projectPath, sortOrder, timeRange, limit, sortedSessions.length);
  }
}

function outputAsCsv(sessions: SessionMetadata[]): void {
  // Print CSV header
  console.log('Session ID,Start Time,End Time,Duration');

  for (const session of sessions) {
    const sessionId = session.sessionId;

    const startTime = session.startTime
      ? session.startTime.toISOString()
      : '';

    const endTime = session.endTime
      ? session.endTime.toISOString()
      : '';

    let duration = '';
    if (session.startTime && session.endTime) {
      const durationMs = session.endTime.getTime() - session.startTime.getTime();
      duration = formatDuration(durationMs) || '0s';
    }

    // Escape any commas in the data by wrapping in quotes if needed
    const escapeCsv = (value: string) => {
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    console.log(`${escapeCsv(sessionId)},${escapeCsv(startTime)},${escapeCsv(endTime)},${escapeCsv(duration)}`);
  }
}

function outputAsTable(sessions: SessionMetadata[], projectPath: string, sortOrder: SortOrder, timeRange?: TimeRange, limit?: number, totalCount?: number): void {
  const displayCount = sessions.length;
  const total = totalCount || displayCount;

  if (limit && displayCount < total) {
    console.log(`Showing ${displayCount} of ${total} session(s) in ${projectPath}:`);
  } else {
    console.log(`Found ${displayCount} session(s) in ${projectPath}:`);
  }

  let sortInfo = `Sorted by session time (${sortOrder}ending)`;
  if (timeRange && (timeRange.from || timeRange.to)) {
    sortInfo += ` • Filtered ${formatTimeRange(timeRange)}`;
  }
  console.log(`${sortInfo}\n`);

  // Calculate column widths - use fixed widths for consistent alignment
  const maxIdLength = Math.max(12, ...sessions.map(s => s.sessionId.length));
  const dateTimeWidth = 22; // Fixed width for "9/22/2025, 11:54:10 AM" format
  const durationWidth = 8; // Fixed width for duration like "2d 7h"

  // Print header
  const sessionHeader = 'Session ID'.padEnd(maxIdLength);
  const startHeader = 'Start Time'.padEnd(dateTimeWidth);
  const endHeader = 'End Time'.padEnd(dateTimeWidth);
  const durationHeader = 'Duration'.padEnd(durationWidth);

  console.log(`${sessionHeader} │ ${startHeader} │ ${endHeader} │ ${durationHeader}`);
  console.log('─'.repeat(maxIdLength + 3 + dateTimeWidth + 3 + dateTimeWidth + 3 + durationWidth));

  for (const session of sessions) {
    const sessionId = session.sessionId.padEnd(maxIdLength);

    let startTime = 'N/A';
    if (session.startTime) {
      startTime = session.startTime.toLocaleString();
    }
    startTime = startTime.padEnd(dateTimeWidth);

    let endTime = 'N/A';
    if (session.endTime) {
      endTime = session.endTime.toLocaleString();
    }
    endTime = endTime.padEnd(dateTimeWidth);

    let duration = 'N/A';
    if (session.startTime && session.endTime) {
      const durationMs = session.endTime.getTime() - session.startTime.getTime();
      duration = formatDuration(durationMs) || '0s';
    }
    duration = duration.padEnd(durationWidth);

    console.log(`${sessionId} │ ${startTime} │ ${endTime} │ ${duration}`);
  }
}

function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else if (seconds > 30) {
    return `${seconds}s`;
  } else {
    return '';
  }
}