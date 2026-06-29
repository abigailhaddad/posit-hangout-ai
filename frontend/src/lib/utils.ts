import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Mention, TimelinePoint, ToolPoint } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const TOOL_COLORS: Record<string, string> = {
  "GitHub Copilot": "#0EA5E9",
  "ChatGPT":        "#10B981",
  "Claude":         "#F59E0B",
  "Claude Code":    "#EF4444",
  "Cursor":         "#8B5CF6",
  "Gemini":         "#EC4899",
  "Windsurf":       "#06B6D4",
  "Perplexity":     "#84CC16",
};

export const KEYWORD_COLORS: Record<string, string> = {
  "hallucination": "#DC2626",
  "vibe coding":   "#7C3AED",
  "agents":        "#2563EB",
  "jobs/careers":  "#D97706",
  "trust":         "#059669",
  "hype":          "#DB2777",
  "productivity":  "#0891B2",
  "learning":      "#65A30D",
};

export function buildTimeline(mentions: Mention[]): TimelinePoint[] {
  const byMonth: Record<string, number> = {};
  for (const m of mentions) {
    const month = m.date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + 1;
  }
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export function buildToolTimeline(mentions: Mention[]): { points: ToolPoint[]; tools: string[] } {
  const TOP_TOOLS = ["GitHub Copilot", "ChatGPT", "Claude", "Claude Code", "Cursor", "Gemini"];
  const byMonth: Record<string, ToolPoint> = {};

  for (const m of mentions) {
    const month = m.date.slice(0, 7);
    if (!byMonth[month]) {
      byMonth[month] = { month };
      TOP_TOOLS.forEach((t) => (byMonth[month][t] = 0));
    }
    for (const tool of m.tools_mentioned ?? []) {
      const canonical = TOP_TOOLS.find(
        (t) =>
          t.toLowerCase() === tool.toLowerCase() ||
          tool.toLowerCase().includes(t.toLowerCase().split(" ")[0])
      );
      if (canonical) (byMonth[month][canonical] as number)++;
    }
  }

  const points = Object.values(byMonth).sort((a, b) =>
    (a.month as string).localeCompare(b.month as string)
  );
  const activeTools = TOP_TOOLS.filter((t) => points.some((p) => (p[t] as number) > 0));
  return { points, tools: activeTools };
}

export function formatMonth(m: string): string {
  const [year, month] = m.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function youtubeUrl(videoId: string, startTime?: number | null): string {
  const base = `https://www.youtube.com/watch?v=${videoId}`;
  if (startTime != null && startTime > 0) {
    return `${base}&t=${Math.floor(startTime)}s`;
  }
  return base;
}
