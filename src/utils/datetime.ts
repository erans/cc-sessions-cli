export interface TimeRange {
  from?: Date;
  to?: Date;
}

export function parseTimeInput(input: string): Date {
  if (input.toLowerCase() === 'now') {
    return new Date();
  }

  // Check if it's a relative time (e.g., 1d, 10m, 2h, 30s)
  const relativeMatch = input.match(/^(-?)(\d+)([smhd])$/);
  if (relativeMatch) {
    const [, sign, amount, unit] = relativeMatch;
    const now = new Date();
    const value = parseInt(amount);
    const isNegative = sign === '-';

    let milliseconds = 0;
    switch (unit) {
      case 's': milliseconds = value * 1000; break;
      case 'm': milliseconds = value * 60 * 1000; break;
      case 'h': milliseconds = value * 60 * 60 * 1000; break;
      case 'd': milliseconds = value * 24 * 60 * 60 * 1000; break;
    }

    if (isNegative) {
      return new Date(now.getTime() - milliseconds);
    } else {
      return new Date(now.getTime() + milliseconds);
    }
  }

  // Try to parse as absolute datetime
  const absoluteDate = new Date(input);
  if (isNaN(absoluteDate.getTime())) {
    throw new Error(`Invalid datetime format: "${input}". Use formats like "2023-12-15", "2023-12-15 14:30", "1d", "10m", "-2h", or "now"`);
  }

  return absoluteDate;
}

export function parseTimeRange(from?: string, to?: string): TimeRange {
  const range: TimeRange = {};

  if (from) {
    range.from = parseTimeInput(from);
  }

  if (to) {
    range.to = parseTimeInput(to);
  }

  // Validate range
  if (range.from && range.to && range.from > range.to) {
    throw new Error('Invalid time range: "from" time must be before "to" time');
  }

  return range;
}

export function isDateInRange(date: Date, range: TimeRange): boolean {
  if (range.from && date < range.from) {
    return false;
  }

  if (range.to && date > range.to) {
    return false;
  }

  return true;
}

export function formatTimeRange(range: TimeRange): string {
  const parts: string[] = [];

  if (range.from) {
    parts.push(`from ${range.from.toLocaleString()}`);
  }

  if (range.to) {
    parts.push(`to ${range.to.toLocaleString()}`);
  }

  return parts.join(' ');
}