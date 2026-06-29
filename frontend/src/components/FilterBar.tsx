"use client";

import { X } from "lucide-react";
import { TOOL_COLORS, KEYWORD_COLORS } from "@/lib/utils";

export interface Filters {
  tools: Set<string>;
  keywords: Set<string>;
  highlightsOnly: boolean;
  selectedMonth: string | null;
}

interface Props {
  filters: Filters;
  allTools: string[];
  allKeywords: string[];
  totalCount: number;
  filteredCount: number;
  onToggleTool: (t: string) => void;
  onToggleKeyword: (k: string) => void;
  onToggleHighlights: () => void;
  onClearMonth: () => void;
  onClearAll: () => void;
}

export default function FilterBar({
  filters,
  allTools,
  allKeywords,
  totalCount,
  filteredCount,
  onToggleTool,
  onToggleKeyword,
  onToggleHighlights,
  onClearMonth,
  onClearAll,
}: Props) {
  const hasAnyFilter =
    filters.tools.size > 0 ||
    filters.keywords.size > 0 ||
    filters.highlightsOnly ||
    filters.selectedMonth;

  return (
    <div className="sticky top-0 z-20 bg-[#F7F6F2]/95 backdrop-blur-sm border-b border-stone-200 py-3 px-0">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Highlights toggle */}
        <button
          onClick={onToggleHighlights}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
          style={
            filters.highlightsOnly
              ? { background: "#1A1A2E", borderColor: "#1A1A2E", color: "white" }
              : { background: "white", borderColor: "#E2E0DB", color: "#555" }
          }
        >
          ★ Highlights
        </button>

        {(allTools.length > 0 || allKeywords.length > 0) && (
          <div className="w-px h-5 bg-stone-300 mx-1" />
        )}

        {/* Tool filters */}
        {allTools.map((tool) => {
          const active = filters.tools.has(tool);
          const color = TOOL_COLORS[tool] ?? "#334155";
          return (
            <button
              key={tool}
              onClick={() => onToggleTool(tool)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={
                active
                  ? { background: color, borderColor: color, color: "white" }
                  : { background: "white", borderColor: "#E2E0DB", color: "#555" }
              }
            >
              {tool}
            </button>
          );
        })}

        {allTools.length > 0 && allKeywords.length > 0 && (
          <div className="w-px h-5 bg-stone-300 mx-1" />
        )}

        {/* Keyword filters */}
        {allKeywords.map((kw) => {
          const active = filters.keywords.has(kw);
          const color = KEYWORD_COLORS[kw] ?? "#64748B";
          return (
            <button
              key={kw}
              onClick={() => onToggleKeyword(kw)}
              className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
              style={
                active
                  ? { background: color, borderColor: color, color: "white" }
                  : { background: "white", borderColor: "#E2E0DB", color: "#555" }
              }
            >
              {kw}
            </button>
          );
        })}

        {/* Active month chip */}
        {filters.selectedMonth && (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-[#1A1A2E]/10 rounded-full text-xs text-[#1A1A2E] font-medium">
            {filters.selectedMonth}
            <button onClick={onClearMonth} className="hover:opacity-70">
              <X size={10} />
            </button>
          </span>
        )}

        {/* Count + clear */}
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-stone-400">
            {filteredCount === totalCount
              ? `${totalCount} mentions`
              : `${filteredCount} of ${totalCount}`}
          </span>
          {hasAnyFilter && (
            <button
              onClick={onClearAll}
              className="text-xs text-stone-400 hover:text-stone-700 underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
