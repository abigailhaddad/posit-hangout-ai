"use client";

import { useState, useMemo } from "react";
import Timeline from "./Timeline";
import FilterBar, { type Filters } from "./FilterBar";
import QuoteCard from "./QuoteCard";
import StatStrip from "./StatStrip";
import type { Mention } from "@/lib/types";

function initFilters(): Filters {
  return {
    tools: new Set(),
    keywords: new Set(),
    highlightsOnly: false,
    selectedMonth: null,
  };
}

export default function MentionsExplorer({ mentions }: { mentions: Mention[] }) {
  const [filters, setFilters] = useState<Filters>(initFilters);

  const allTools = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mentions) {
      for (const t of m.tools_mentioned ?? []) {
        counts[t] = (counts[t] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
  }, [mentions]);

  const allKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mentions) {
      for (const k of m.keyword_tags ?? []) {
        counts[k] = (counts[k] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k);
  }, [mentions]);

  const filtered = useMemo(() => {
    return mentions.filter((m) => {
      if (filters.tools.size > 0) {
        if (!(m.tools_mentioned ?? []).some((t) => filters.tools.has(t))) return false;
      }
      if (filters.keywords.size > 0) {
        if (!(m.keyword_tags ?? []).some((k) => filters.keywords.has(k))) return false;
      }
      if (filters.highlightsOnly && m.quality < 3) return false;
      if (filters.selectedMonth && !m.date.startsWith(filters.selectedMonth)) return false;
      return true;
    });
  }, [mentions, filters]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (b.quality !== a.quality) return b.quality - a.quality;
        return b.date.localeCompare(a.date);
      }),
    [filtered]
  );

  const toggle = <T,>(set: Set<T>, item: T): Set<T> => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  };

  return (
    <div className="space-y-6">
      <StatStrip mentions={filtered.length === mentions.length ? mentions : filtered} />

      <Timeline
        mentions={mentions}
        selectedMonth={filters.selectedMonth}
        onMonthClick={(m) => setFilters((f) => ({ ...f, selectedMonth: m }))}
      />

      <FilterBar
        filters={filters}
        allTools={allTools}
        allKeywords={allKeywords}
        totalCount={mentions.length}
        filteredCount={filtered.length}
        onToggleTool={(t) => setFilters((f) => ({ ...f, tools: toggle(f.tools, t) }))}
        onToggleKeyword={(k) => setFilters((f) => ({ ...f, keywords: toggle(f.keywords, k) }))}
        onToggleHighlights={() => setFilters((f) => ({ ...f, highlightsOnly: !f.highlightsOnly }))}
        onClearMonth={() => setFilters((f) => ({ ...f, selectedMonth: null }))}
        onClearAll={() => setFilters(initFilters)}
      />

      {sorted.length === 0 ? (
        <div className="text-center py-24 text-stone-400">
          No mentions match these filters.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-0">
          {sorted.map((m, i) => (
            <div key={`${m.video_id}-${i}`} className="break-inside-avoid mb-4">
              <QuoteCard m={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
