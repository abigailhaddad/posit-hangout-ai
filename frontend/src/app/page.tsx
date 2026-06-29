import { readFileSync } from "fs";
import { join } from "path";
import StoryPage from "@/components/StoryPage";
import type { Mention, CoverageYear, ToolYear } from "@/lib/types";

function loadMentions(): Mention[] {
  try {
    const p = join(process.cwd(), "public", "data", "regex_mentions.json");
    return JSON.parse(readFileSync(p, "utf-8"));
  } catch {
    return [];
  }
}

function loadCoverage(): CoverageYear[] {
  try {
    const p = join(process.cwd(), "public", "data", "_index.json");
    const index: { id: string; date?: string; status?: string }[] = JSON.parse(
      readFileSync(p, "utf-8")
    );
    const mentions: { video_id: string }[] = JSON.parse(
      readFileSync(join(process.cwd(), "public", "data", "regex_mentions.json"), "utf-8")
    );
    const mentionedIds = new Set(mentions.map((m) => m.video_id));

    const byYear: Record<string, { total: number; with_ai: number }> = {};
    for (const v of index) {
      if (v.status !== "ok" || !v.date) continue;
      const year = v.date.slice(0, 4);
      if (year < "2022") continue;
      if (!byYear[year]) byYear[year] = { total: 0, with_ai: 0 };
      byYear[year].total += 1;
      if (mentionedIds.has(v.id)) byYear[year].with_ai += 1;
    }

    return Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, d]) => ({
        year,
        total: d.total,
        with_ai: d.with_ai,
        pct: Math.round((d.with_ai / d.total) * 100),
      }));
  } catch {
    return [];
  }
}

function loadToolTimeline(): ToolYear[] {
  try {
    const mentions: { video_id: string; tools_mentioned?: string[] }[] = JSON.parse(
      readFileSync(join(process.cwd(), "public", "data", "regex_mentions.json"), "utf-8")
    );
    const index: { id: string; date?: string }[] = JSON.parse(
      readFileSync(join(process.cwd(), "public", "data", "_index.json"), "utf-8")
    );
    const dateById: Record<string, string> = {};
    for (const v of index) {
      if (v.id && v.date) dateById[v.id] = v.date;
    }

    const TRACKED = ["ChatGPT", "GitHub Copilot", "Claude", "Claude Code"] as const;
    const byYear: Record<string, Record<string, number>> = {};
    for (const m of mentions) {
      const year = (dateById[m.video_id] || "").slice(0, 4);
      if (year < "2022") continue;
      if (!byYear[year])
        byYear[year] = { ChatGPT: 0, "GitHub Copilot": 0, Claude: 0, "Claude Code": 0 };
      for (const t of m.tools_mentioned ?? []) {
        if ((TRACKED as readonly string[]).includes(t))
          byYear[year][t] = (byYear[year][t] || 0) + 1;
      }
    }
    return Object.entries(byYear)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([year, d]) => ({
        year,
        ChatGPT: d.ChatGPT,
        "GitHub Copilot": d["GitHub Copilot"],
        Claude: d.Claude,
        "Claude Code": d["Claude Code"],
      }));
  } catch {
    return [];
  }
}

export default function Home() {
  const mentions = loadMentions();
  const coverage = loadCoverage();
  const toolTimeline = loadToolTimeline();
  return <StoryPage mentions={mentions} coverage={coverage} toolTimeline={toolTimeline} />;
}
