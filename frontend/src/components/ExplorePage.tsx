"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Search, X, LayoutGrid, List } from "lucide-react";
import QuoteCard from "./QuoteCard";
import { TOOL_COLORS, KEYWORD_COLORS, youtubeUrl } from "@/lib/utils";
import type { Mention } from "@/lib/types";

const PER_PAGE = 48;

interface Filters {
  query: string;
  tools: Set<string>;
  keywords: Set<string>;
}

function initFilters(): Filters {
  return { query: "", tools: new Set(), keywords: new Set() };
}

// ── Episode row in list view ──────────────────────────────────────────────────

function EpisodeRow({ episode, quotes }: { episode: { date: string; guest: string; video_id: string }; quotes: Mention[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/4 transition-colors"
      >
        <div className="flex items-center gap-4 min-w-0">
          <span className="text-xs text-white/30 shrink-0">{episode.date}</span>
          <span className="text-sm font-medium text-white/70 truncate">{episode.guest}</span>
          <span className="text-xs text-white/25 shrink-0">{quotes.length} mention{quotes.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <a
            href={youtubeUrl(episode.video_id)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-xs text-white/20 hover:text-white/60 transition-colors"
          >
            ↗
          </a>
          <span className="text-white/25 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5 divide-y divide-white/5">
          {quotes.map((m, i) => (
            <div key={i} className="px-5 py-3">
              <p className="text-sm text-white/60 leading-relaxed">{m.quote}</p>
              {(m.tools_mentioned?.length > 0 || m.keyword_tags?.length > 0) && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(m.tools_mentioned ?? []).map((t) => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ background: TOOL_COLORS[t] ?? "#6366F1" }}>{t}</span>
                  ))}
                  {(m.keyword_tags ?? []).map((kw) => (
                    <span key={kw} className="px-2 py-0.5 rounded-full text-xs font-medium border" style={{ borderColor: KEYWORD_COLORS[kw] ? `${KEYWORD_COLORS[kw]}60` : "rgba(255,255,255,0.15)", color: KEYWORD_COLORS[kw] ?? "rgba(255,255,255,0.4)" }}>{kw}</span>
                  ))}
                </div>
              )}
              {m.start_time != null && (
                <a href={youtubeUrl(m.video_id, m.start_time)} target="_blank" rel="noopener noreferrer" className="text-xs text-white/20 hover:text-white/50 transition-colors mt-1 inline-block">
                  Watch at {Math.floor(m.start_time / 60)}:{String(Math.floor(m.start_time % 60)).padStart(2, "0")} ↗
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ExplorePage({ mentions }: { mentions: Mention[] }) {
  const [filters, setFilters] = useState<Filters>(initFilters);
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"cards" | "episodes">("cards");
  const topRef = useRef<HTMLDivElement>(null);

  const allTools = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mentions) {
      for (const t of m.tools_mentioned ?? []) counts[t] = (counts[t] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t);
  }, [mentions]);

  const allKeywords = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of mentions) {
      for (const k of m.keyword_tags ?? []) counts[k] = (counts[k] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [mentions]);

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase().trim();
    return mentions.filter((m) => {
      if (q && !m.quote.toLowerCase().includes(q)) return false;
      if (filters.tools.size > 0 && !(m.tools_mentioned ?? []).some((t) => filters.tools.has(t))) return false;
      if (filters.keywords.size > 0 && !(m.keyword_tags ?? []).some((k) => filters.keywords.has(k))) return false;
      return true;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [mentions, filters]);

  // Group by episode for the episode view
  const episodes = useMemo(() => {
    const map = new Map<string, { date: string; guest: string; video_id: string; quotes: Mention[] }>();
    for (const m of filtered) {
      if (!map.has(m.video_id)) map.set(m.video_id, { date: m.date, guest: m.guest, video_id: m.video_id, quotes: [] });
      map.get(m.video_id)!.quotes.push(m);
    }
    return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [filtered]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggle = <T,>(set: Set<T>, item: T): Set<T> => {
    const next = new Set(set);
    next.has(item) ? next.delete(item) : next.add(item);
    return next;
  };

  const updateFilter = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
  };

  const hasAnyFilter = !!filters.query || filters.tools.size > 0 || filters.keywords.size > 0;

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0D0D1A]/85 backdrop-blur-sm">
        <Link href="/" className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={13} />
          Story
        </Link>
        <span className="text-white/15 text-xs hidden sm:block">Posit Data Science Hangout</span>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">Explore the data</h1>
          <p className="text-white/40 mt-1.5 text-sm max-w-xl">
            Quotes from the{" "}
            <a
              href="https://posit.co/data-science-hangout/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70 transition-colors"
            >
              Posit Data Science Hangout
            </a>
            {" "}— weekly community call for data people.
            These {mentions.length.toLocaleString()} sentences came up in keyword search across{" "}
            {new Set(mentions.map((m) => m.video_id)).size} auto-generated YouTube transcripts.{" "}
            <a
              href="https://github.com/abigailhaddad/posit-hangout-ai/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white/70 transition-colors"
            >
              Download all transcripts ↓
            </a>
          </p>
        </div>

        {mentions.length === 0 ? (
          <div className="text-white/30 text-sm">No data loaded — run the pipeline first.</div>
        ) : (
          <>
            {/* Search + view toggle */}
            <div ref={topRef} className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="text"
                  value={filters.query}
                  onChange={(e) => updateFilter({ query: e.target.value })}
                  placeholder="Search quotes…"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-white/10 bg-white/5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 focus:border-indigo-400/40"
                />
                {filters.query && (
                  <button onClick={() => updateFilter({ query: "" })} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* View toggle */}
              <div className="flex border border-white/10 rounded-xl overflow-hidden">
                <button
                  onClick={() => setView("cards")}
                  className="px-3 py-2.5 transition-colors"
                  style={{ background: view === "cards" ? "rgba(255,255,255,0.1)" : "transparent", color: view === "cards" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}
                  title="Card view"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setView("episodes")}
                  className="px-3 py-2.5 transition-colors border-l border-white/10"
                  style={{ background: view === "episodes" ? "rgba(255,255,255,0.1)" : "transparent", color: view === "episodes" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)" }}
                  title="Episode view"
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* Filter bar */}
            <div className="sticky top-[45px] z-20 bg-[#0D0D1A]/95 backdrop-blur-sm border-b border-white/5 py-3 mb-6">
              {/* Pills: scroll horizontally on mobile, wrap on md+ */}
              <div className="flex gap-2 items-center overflow-x-auto md:flex-wrap md:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allTools.length > 0 && (
                  <>
                    {allTools.map((tool) => {
                      const active = filters.tools.has(tool);
                      const color = TOOL_COLORS[tool] ?? "#6366F1";
                      return (
                        <button
                          key={tool}
                          onClick={() => updateFilter({ tools: toggle(filters.tools, tool) })}
                          className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                          style={active ? { background: color, borderColor: color, color: "white" } : { background: "transparent", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
                        >
                          {tool}
                        </button>
                      );
                    })}
                    {allKeywords.length > 0 && <div className="flex-shrink-0 w-px h-5 bg-white/10 mx-1" />}
                  </>
                )}

                {allKeywords.map((kw) => {
                  const active = filters.keywords.has(kw);
                  const color = KEYWORD_COLORS[kw] ?? "#818CF8";
                  return (
                    <button
                      key={kw}
                      onClick={() => updateFilter({ keywords: toggle(filters.keywords, kw) })}
                      className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                      style={active ? { background: color, borderColor: color, color: "white" } : { background: "transparent", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
                    >
                      {kw}
                    </button>
                  );
                })}

                {/* Count + clear: right-aligned on md+, hidden on mobile (shown below) */}
                <div className="ml-auto hidden md:flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-white/25">
                    {view === "episodes"
                      ? `${episodes.length} episode${episodes.length !== 1 ? "s" : ""}`
                      : filtered.length === mentions.length
                        ? `${mentions.length.toLocaleString()} mentions`
                        : `${filtered.length.toLocaleString()} of ${mentions.length.toLocaleString()}`}
                  </span>
                  {hasAnyFilter && (
                    <button onClick={() => { setFilters(initFilters()); setPage(1); }} className="text-xs text-white/30 hover:text-white/60 underline">
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              {/* Count + clear row: mobile only */}
              <div className="flex md:hidden items-center justify-between mt-2">
                <span className="text-xs text-white/25">
                  {view === "episodes"
                    ? `${episodes.length} episode${episodes.length !== 1 ? "s" : ""}`
                    : filtered.length === mentions.length
                      ? `${mentions.length.toLocaleString()} mentions`
                      : `${filtered.length.toLocaleString()} of ${mentions.length.toLocaleString()}`}
                </span>
                {hasAnyFilter && (
                  <button onClick={() => { setFilters(initFilters()); setPage(1); }} className="text-xs text-white/30 hover:text-white/60 underline">
                    Clear all
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            {view === "episodes" ? (
              /* Episode list */
              episodes.length === 0 ? (
                <div className="text-center py-24 text-white/30">No mentions match these filters.</div>
              ) : (
                <div className="space-y-2">
                  {episodes.map((ep) => (
                    <EpisodeRow key={ep.video_id} episode={ep} quotes={ep.quotes} />
                  ))}
                </div>
              )
            ) : (
              /* Card grid */
              paged.length === 0 ? (
                <div className="text-center py-24 text-white/30">No mentions match these filters.</div>
              ) : (
                <>
                  <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                    {paged.map((m, i) => (
                      <div key={`${m.video_id}-${i}`} className="break-inside-avoid mb-4">
                        <QuoteCard m={m} searchQuery={filters.query} />
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-10 pb-6">
                      <button
                        onClick={() => { setPage((p) => Math.max(1, p - 1)); topRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/50 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      >
                        ← Prev
                      </button>
                      <span className="text-sm text-white/25">{page} / {totalPages}</span>
                      <button
                        onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); topRef.current?.scrollIntoView({ behavior: "smooth" }); }}
                        disabled={page === totalPages}
                        className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-white/50 hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      >
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )
            )}
          </>
        )}
      </div>
      <footer className="py-6 text-center border-t border-white/5 flex flex-col items-center gap-3">
        <a
          href="https://github.com/abigailhaddad/posit-hangout-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-sm"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
          abigailhaddad/posit-hangout-ai
        </a>
        <p className="text-white/20 text-xs">Posit Data Science Hangout · unofficial fan project · not affiliated with Posit PBC</p>
      </footer>
    </div>
  );
}
