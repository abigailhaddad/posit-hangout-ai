export interface Mention {
  video_id: string;
  title: string;
  date: string;
  guest: string;
  quote: string;
  context_before?: string | null;
  context_after?: string | null;
  is_guest_speaking: boolean;
  tools_mentioned: string[];
  keyword_tags: string[];
  quality: number;
  start_time?: number | null;
  end_time?: number | null;
}

export interface TimelinePoint {
  month: string;
  count: number;
}

export interface ToolPoint {
  month: string;
  [tool: string]: number | string;
}

export interface CoverageYear {
  year: string;
  total: number;
  with_ai: number;
  pct: number;
}

export interface ToolYear {
  year: string;
  ChatGPT: number;
  "GitHub Copilot": number;
  Claude: number;
  "Claude Code": number;
}
