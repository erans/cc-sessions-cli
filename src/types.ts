export interface SessionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tools_used?: ToolCall[];
  uuid: string;
  parentUuid?: string;
}

export interface ToolCall {
  tool: string;
  description?: string;
  file_path?: string;
  line_number?: number;
  input?: any;
  output?: string;
}

export interface ClaudeSessionEntry {
  type: string;
  uuid?: string;
  parentUuid?: string | null;
  timestamp?: string;
  sessionId?: string;
  message?: {
    role: string;
    content: string | any[];
    id?: string;
    type?: string;
  };
  toolUseResult?: {
    stdout?: string;
    stderr?: string;
    interrupted?: boolean;
  };
  summary?: string;
}

export interface SessionMetadata {
  sessionId: string;
  filePath: string;
  lastModified: Date;
  startTime?: Date;
  endTime?: Date;
  messageCount: number;
  duration?: string;
}

export type SortOrder = 'asc' | 'desc';
export type OutputFormat = 'llm' | 'human' | 'jsonl';
export type ListFormat = 'table' | 'csv';