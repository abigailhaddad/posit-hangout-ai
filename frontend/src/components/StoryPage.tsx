"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Play, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList,
  LineChart, Line, Legend,
} from "recharts";
import { youtubeUrl } from "@/lib/utils";
import InfoTip from "./InfoTip";
import type { Mention } from "@/lib/types";
import type { CoverageYear, ToolYear } from "@/lib/types";
import { TIMELINE_EVENTS, CHAPTERS, findMention } from "@/lib/story-data";
import type { Chapter } from "@/lib/story-data";

// ── Timeline ──────────────────────────────────────────────────────────────────
// TIMELINE_EVENTS lives in @/lib/story-data so it can be unit-tested directly.

function TimelinePlayer({ videoId, startTime }: { videoId: string; startTime: number }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&autoplay=1&rel=0&modestbranding=1`;
  const thumbUrl = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const timestamp = `${Math.floor(startTime / 60)}:${String(Math.floor(startTime % 60)).padStart(2, "0")}`;

  return playing ? (
    <div className="relative mt-3 rounded-lg overflow-hidden aspect-video">
      <iframe src={embedUrl} title="YouTube clip" className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
      <button
        onClick={() => setPlaying(false)}
        className="absolute top-1.5 right-1.5 z-10 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
        aria-label="Close player"
      >
        <X size={9} className="text-white" />
      </button>
    </div>
  ) : (
    <button
      onClick={() => setPlaying(true)}
      className="flex items-center gap-2 mt-3 group"
      aria-label="Play clip"
    >
      <div className="relative w-20 rounded-md overflow-hidden flex-shrink-0 border border-white/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={thumbUrl} alt="" loading="lazy" className="w-full aspect-video object-cover" />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
            <Play size={9} className="text-white ml-0.5" fill="white" />
          </div>
        </div>
      </div>
      <span className="text-white/30 text-xs group-hover:text-white/50 transition-colors">Watch at {timestamp}</span>
    </button>
  );
}

function Timeline() {
  const [scrollActive, setScrollActive] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // Items whose quote has been revealed by scrolling. Sticky: once expanded we
  // never collapse, since resizing content above the viewport reads as jarring
  // vertical jumps on iOS Safari (no scroll-anchoring support).
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeIndex = hovered ?? scrollActive;

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setScrollActive(i);
            setExpandedSet((prev) => prev.has(i) ? prev : new Set(prev).add(i));
          } else {
            setScrollActive((prev) => (prev === i ? null : prev));
          }
        },
        { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <div className="relative max-w-2xl mx-auto px-6 py-4">
      <div className="absolute left-[7.5rem] top-0 bottom-0 w-px bg-white/10" />
      <div className="space-y-10">
        {TIMELINE_EVENTS.map((e, i) => {
          const isActive = activeIndex === i;
          const isOpen = hovered === i || expandedSet.has(i);
          return (
            <div
              key={i}
              ref={(el) => { itemRefs.current[i] = el; }}
              className="flex gap-5 items-start group relative"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="w-24 flex-shrink-0 text-right pt-0.5">
                <span className="text-white/30 text-xs font-mono tracking-tight">{e.date}</span>
              </div>
              <div className="flex-shrink-0 mt-1.5 relative z-10">
                <div className={`w-2 h-2 rounded-full border transition-colors duration-150 ${isActive ? "bg-indigo-400 border-indigo-300" : "bg-indigo-400/50 border-indigo-400/70"}`} />
              </div>
              <div className="flex-1 pb-1">
                <p className={`text-sm font-medium leading-snug transition-colors duration-150 ${isActive ? "text-white" : "text-white/75"}`}>
                  {e.label}
                </p>
                {e.context && (
                  <p className="text-white/25 text-xs mt-0.5">{e.context}</p>
                )}
                <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-72 opacity-100 mt-2" : "max-h-0 opacity-0"}`}>
                  <div className="p-3 rounded-xl bg-white/8 border border-white/10 text-white/70 text-xs leading-relaxed">
                    &ldquo;{e.fullQuote}&rdquo;
                    {e.video_id && e.start_time != null && (
                      <TimelinePlayer videoId={e.video_id} startTime={e.start_time} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Coverage chart ────────────────────────────────────────────────────────────

function CoverageChart({ data }: { data: CoverageYear[] }) {
  const chartData = data.map((d) => ({
    year: d.year,
    "Mentioned AI": d.with_ai,
    "No mention": d.total - d.with_ai,
    pct: d.pct,
  }));

  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">
        Episodes mentioning AI, by year
      </p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip contentStyle={{ background: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 12 }} />
          <Bar dataKey="No mention" stackId="a" fill="rgba(255,255,255,0.08)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="Mentioned AI" stackId="a" fill="#6366F1" radius={[4, 4, 0, 0]}>
            <LabelList
              dataKey="pct"
              position="top"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => `${v}%`}
              style={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-white/25 text-xs">Indigo = mentioned AI · Gray = silent · % labeled above</p>
    </div>
  );
}

// ── Tool timeline chart ───────────────────────────────────────────────────────

function ToolTimelineChart({ data }: { data: ToolYear[] }) {
  return (
    <div className="space-y-3">
      <p className="text-white/40 text-xs uppercase tracking-widest">
        Named tool mentions by year
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <XAxis dataKey="year" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#1e1e35", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "white", fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }} />
          <Line type="monotone" dataKey="ChatGPT" stroke="#818CF8" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="GitHub Copilot" stroke="#34D399" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Claude" stroke="#F472B6" strokeWidth={2} dot={{ r: 3 }} />
          <Line type="monotone" dataKey="Claude Code" stroke="#FB923C" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-white/25 text-xs">Based on explicit tool names in extracted quotes</p>
    </div>
  );
}

// ── YouTube quote card ────────────────────────────────────────────────────────

function BoldedText({ text, boldChunk }: { text: string; boldChunk?: string }) {
  if (!boldChunk?.trim()) return <>{text}</>;
  const escaped = boldChunk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === boldChunk.toLowerCase() ? (
          <strong key={i} className="font-semibold text-white/95">{part}</strong>
        ) : (
          <span key={i} className="text-white/60">{part}</span>
        )
      )}
    </>
  );
}

function StoryQuote({ m, highlight, extendedQuote }: { m: Mention; highlight?: string; extendedQuote?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const fadeObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.05 }
    );
    // Expand once, just before the card scrolls up into view (the +25% bottom
    // margin fires it while still below the fold), then stay expanded. Doing the
    // resize off-screen and never collapsing avoids the aggressive vertical jumps
    // iOS Safari shows when content above the viewport changes height (no
    // scroll-anchoring support there).
    const expandObs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setExpanded(true); expandObs.disconnect(); } },
      { rootMargin: "0px 0px 25% 0px", threshold: 0 }
    );
    fadeObs.observe(el);
    expandObs.observe(el);
    return () => { fadeObs.disconnect(); expandObs.disconnect(); };
  }, []);

  const preview = highlight ?? (m.quote.length > 80 ? m.quote.slice(0, 80) + "…" : m.quote);

  const thumbUrl = `https://img.youtube.com/vi/${m.video_id}/mqdefault.jpg`;
  const endParam = m.end_time ? `&end=${Math.ceil(m.end_time)}` : "";
  const embedUrl = `https://www.youtube.com/embed/${m.video_id}?start=${Math.floor(m.start_time ?? 0)}${endParam}&autoplay=1&rel=0&modestbranding=1`;

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {/* Collapsed: just the key phrase */}
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-0 opacity-0" : "max-h-16 opacity-100"}`}>
        <p className="text-white/30 text-sm italic leading-relaxed">
          &ldquo;{preview}&rdquo;
        </p>
      </div>

      {/* Expanded: full card with thumbnail + attribution */}
      <div className={`overflow-hidden transition-all duration-500 ${expanded ? "max-h-[900px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col sm:flex-row gap-4 pt-1">
          {/* Thumbnail / player */}
          <div className="sm:w-48 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 self-start">
            {playing ? (
              <div className="relative aspect-video">
                <iframe src={embedUrl} title="YouTube clip" className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
                <button
                  onClick={() => setPlaying(false)}
                  className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors"
                  aria-label="Close player"
                >
                  <X size={11} className="text-white" />
                </button>
              </div>
            ) : (
              <button onClick={() => setPlaying(true)} className="relative w-full aspect-video block group overflow-hidden" aria-label="Play clip">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbUrl} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-white/15 border border-white/30 flex items-center justify-center group-hover:bg-white/25 transition-colors">
                    <Play size={14} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                {m.start_time != null && (
                  <div className="absolute bottom-1.5 right-1.5 text-xs text-white/50 bg-black/50 px-1.5 py-0.5 rounded">
                    {Math.floor(m.start_time / 60)}:{String(Math.floor(m.start_time % 60)).padStart(2, "0")}
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Quote text */}
          <div className="flex-1 flex flex-col justify-center py-1 min-w-0">
            <blockquote className="text-base leading-relaxed font-light">
              <BoldedText text={extendedQuote ?? m.quote} boldChunk={highlight} />
            </blockquote>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="text-white/50 text-sm font-medium">{m.is_guest_speaking ? m.guest : "Host"}</span>
              <span className="text-white/25 text-xs">{m.date}</span>
              <a
                href={youtubeUrl(m.video_id, m.start_time)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/20 hover:text-white/50 transition-colors ml-auto"
              >
                ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AI_KEYWORDS_TOOLTIP =
  "ChatGPT, Claude, Gemini, GitHub Copilot, Cursor, Windsurf, LLM, generative AI, hallucination, vibe coding, prompt engineering, and related phrases like 'about AI', 'AI tool', 'AI governance'";

function StatText({ text }: { text: string }) {
  const parts = text.split("AI keywords");
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts[0]}
      <InfoTip text={AI_KEYWORDS_TOOLTIP}>AI keywords</InfoTip>
      {parts[1]}
    </>
  );
}

// ── Chapter section ───────────────────────────────────────────────────────────


function ChapterSection({
  chapter,
  mentions,
  index,
  onVisible,
  coverage,
  toolTimeline,
}: {
  chapter: Chapter;
  mentions: Mention[];
  index: number;
  onVisible: (id: string) => void;
  coverage: CoverageYear[];
  toolTimeline: ToolYear[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const handleVisible = useCallback(() => onVisible(chapter.id), [chapter.id, onVisible]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) handleVisible(); },
      { rootMargin: "-35% 0px -35% 0px", threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [handleVisible]);

  return (
    <section id={chapter.id} ref={ref} className="py-16 px-6 md:px-8">
      <div className="max-w-3xl mx-auto w-full space-y-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-indigo-400/60 text-xs font-mono">{String(index + 1).padStart(2, "0")}</span>
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-white/20 text-xs uppercase tracking-widest">{chapter.year}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">{chapter.headline}</h2>
          {chapter.subhead && <p className="text-white/35 text-base mt-2">{chapter.subhead}</p>}
        </div>

        {chapter.chart === "coverage" && coverage.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <CoverageChart data={coverage} />
          </div>
        )}

        {chapter.chart === "tools" && toolTimeline.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
            <ToolTimelineChart data={toolTimeline} />
          </div>
        )}

        {chapter.stat && (
          <div className="border-l-2 border-indigo-400/40 pl-4 max-w-2xl">
            <p className="text-indigo-300/70 text-sm font-medium"><StatText text={chapter.stat} /></p>
          </div>
        )}

        <p className="text-white/65 text-base leading-relaxed max-w-2xl">{chapter.narrative}</p>

        {chapter.quotes.length > 0 && (
          <div className="space-y-7 pt-2">
            {chapter.quotes.map((ref, i) => {
              const m = findMention(mentions, ref);
              if (!m) return null;
              return <StoryQuote key={`${m.video_id}-${i}`} m={m} highlight={ref.highlight} extendedQuote={ref.extendedQuote} />;
            })}
          </div>
        )}
      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function StoryPage({
  mentions,
  coverage,
  toolTimeline,
}: {
  mentions: Mention[];
  coverage: CoverageYear[];
  toolTimeline: ToolYear[];
}) {
  const [activeChapter, setActiveChapter] = useState(CHAPTERS[0].id);

  return (
    <div className="min-h-screen bg-[#0D0D1A] text-white">
      {/* Fixed sidebar */}
      <nav className="fixed left-5 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col gap-2.5">
        {CHAPTERS.filter(ch => ch.id !== "end").map((ch) => {
          const active = activeChapter === ch.id;
          return (
            <button
              key={ch.id}
              onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth" })}
              className="group flex items-center gap-3 text-left"
            >
              <div className={`w-1.5 rounded-full transition-all duration-300 ${active ? "h-6 bg-indigo-400" : "h-1.5 bg-white/15 group-hover:bg-white/35"}`} />
              <span className={`text-xs transition-all duration-300 whitespace-nowrap ${active ? "text-white/70" : "text-transparent group-hover:text-white/30"}`}>
                {ch.year}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Top bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#0D0D1A]/85 backdrop-blur-sm">
        <Link href="/explore" className="flex items-center gap-2 text-white/35 hover:text-white/70 transition-colors text-sm">
          <ArrowLeft size={13} />
          Explore data
        </Link>
        <div className="hidden md:flex items-center gap-5">
          {CHAPTERS.filter(ch => ch.id !== "end").map((ch) => (
            <button
              key={ch.id}
              onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: "smooth" })}
              className={`text-xs uppercase tracking-wider transition-colors ${activeChapter === ch.id ? "text-white/70" : "text-white/20 hover:text-white/45"}`}
            >
              {ch.year}
            </button>
          ))}
        </div>
        <span className="text-white/15 text-xs hidden sm:block">Posit Data Science Hangout</span>
      </div>

      {/* Hero */}
      <div className="text-center pt-24 pb-10 px-6">
        <p className="text-white/25 text-xs uppercase tracking-widest mb-5">
          224 episodes · 2021–2026
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl mx-auto">
          How data scientists talked about AI — 2022 to 2026
        </h1>
        <p className="text-white/50 text-lg mt-5 max-w-2xl mx-auto leading-relaxed">
          The{" "}
          <a
            href="https://posit.co/data-science-hangout/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 transition-colors"
          >
            Posit Data Science Hangout
          </a>{" "}
          is a weekly community call for data people.
        </p>
        <p className="text-white/20 text-sm mt-4 max-w-xl mx-auto">
          Unofficial fan project — not affiliated with or endorsed by Posit PBC.
        </p>
      </div>

      {/* Timeline */}
      <Timeline />


      {/* Chapters */}
      {CHAPTERS.map((ch, i) => (
        <ChapterSection
          key={ch.id}
          chapter={ch}
          mentions={mentions}
          index={i}
          onVisible={setActiveChapter}
          coverage={coverage}
          toolTimeline={toolTimeline}
        />
      ))}

      {/* CTA */}
      <div className="py-24 px-6 text-center border-t border-white/8">
        <p className="text-white/30 text-xs uppercase tracking-widest mb-4">
          224 episodes · 2021–2026
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          1,039 quotes, searchable
        </h2>
        <p className="text-white/40 text-base mb-10 max-w-md mx-auto">
          Filter by tool or topic, search by keyword, and click any quote to watch the original episode.
        </p>
        <Link
          href="/explore"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-xl transition-colors text-base"
        >
          Explore all quotes →
        </Link>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center px-6 border-t border-white/5 flex flex-col items-center gap-3">
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
