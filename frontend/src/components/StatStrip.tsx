import type { Mention } from "@/lib/types";

export default function StatStrip({ mentions }: { mentions: Mention[] }) {
  const total = mentions.length;
  const guests = mentions.filter((m) => m.is_guest_speaking).length;
  const highlights = mentions.filter((m) => m.quality === 3).length;
  const videos = new Set(mentions.map((m) => m.video_id)).size;

  const toolCounts: Record<string, number> = {};
  for (const m of mentions) {
    for (const t of m.tools_mentioned ?? []) {
      toolCounts[t] = (toolCounts[t] ?? 0) + 1;
    }
  }
  const topTool = Object.entries(toolCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="flex flex-wrap gap-6 py-4">
      <Stat value={total} label="mentions" />
      <Stat value={videos} label="episodes" />
      <Stat value={highlights} label="highlights" accent />
      {total > 0 && <Stat value={`${Math.round((guests / total) * 100)}%`} label="from guests" />}
      {topTool && <Stat value={topTool[0]} label="top tool" />}
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: string | number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className="text-2xl font-bold tracking-tight"
        style={{ color: accent ? "#D97706" : "#1A1A2E" }}
      >
        {value}
      </span>
      <span className="text-xs text-stone-400 uppercase tracking-wide">{label}</span>
    </div>
  );
}
