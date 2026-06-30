"use client";

import { useState } from "react";
import { ExternalLink, Play, X } from "lucide-react";
import { TOOL_COLORS, KEYWORD_COLORS, youtubeUrl } from "@/lib/utils";
import type { Mention } from "@/lib/types";

function HighlightText({ text, query }: { text: string; query?: string }) {
  if (!query?.trim()) return <>{text}</>;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-indigo-400/30 text-white rounded px-0.5 not-italic">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

function InlinePlayer({ videoId, startTime }: { videoId: string; startTime: number }) {
  const [playing, setPlaying] = useState(false);
  const embedUrl = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(startTime)}&autoplay=1&rel=0&modestbranding=1`;
  const timestamp = `${Math.floor(startTime / 60)}:${String(Math.floor(startTime % 60)).padStart(2, "0")}`;

  if (playing) {
    return (
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
    );
  }

  return (
    <button
      onClick={() => setPlaying(true)}
      className="flex-shrink-0 flex items-center text-white/30 hover:text-white/60 transition-colors"
      aria-label={`Play at ${timestamp}`}
    >
      <Play size={13} fill="currentColor" />
    </button>
  );
}

export default function QuoteCard({
  m,
  searchQuery,
}: {
  m: Mention;
  searchQuery?: string;
}) {
  const [hovered, setHovered] = useState(false);
  const hasContext = !!(m.context_before || m.context_after);
  const canPlay = m.start_time != null;

  return (
    <div
      className="bg-white/4 rounded-xl border border-white/8 p-5 flex flex-col gap-3 transition-colors duration-200 cursor-default"
      style={{ borderColor: hovered ? "rgba(255,255,255,0.14)" : undefined, background: hovered ? "rgba(255,255,255,0.06)" : undefined }}
      onMouseEnter={() => hasContext && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Context before */}
      {m.context_before && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: hovered ? "200px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <p className="text-xs leading-relaxed text-white/45 italic pb-2 border-b border-white/5">
            {m.context_before}
          </p>
        </div>
      )}

      {/* Main quote */}
      <blockquote
        className="text-sm leading-relaxed font-light transition-colors duration-200"
        style={{ color: hovered ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.7)" }}
      >
        <HighlightText text={m.quote} query={searchQuery} />
      </blockquote>

      {/* Context after */}
      {m.context_after && (
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{ maxHeight: hovered ? "200px" : "0px", opacity: hovered ? 1 : 0 }}
        >
          <p className="text-xs leading-relaxed text-white/45 italic pt-2 border-t border-white/5">
            {m.context_after}
          </p>
        </div>
      )}

      {/* Inline player */}
      {canPlay && <InlinePlayer videoId={m.video_id} startTime={m.start_time!} />}

      {/* Footer */}
      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-white/30 truncate min-w-0">
            {m.date}
            <span className="mx-1.5">·</span>
            <span>ep. with </span>
            <span className="font-medium text-white/40">{m.guest}</span>
          </p>
          <a
            href={youtubeUrl(m.video_id, m.start_time)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 flex items-center gap-1 text-xs text-white/20 hover:text-white/60 transition-colors"
          >
            <ExternalLink size={11} />
            Watch
          </a>
        </div>

        {((m.tools_mentioned?.length ?? 0) > 0 || (m.keyword_tags?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {(m.tools_mentioned ?? []).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ background: TOOL_COLORS[tool] ?? "#6366F1" }}
              >
                {tool}
              </span>
            ))}
            {(m.keyword_tags ?? []).map((kw) => (
              <span
                key={kw}
                className="px-2 py-0.5 rounded-full text-xs font-medium border"
                style={{
                  borderColor: KEYWORD_COLORS[kw] ? `${KEYWORD_COLORS[kw]}60` : "rgba(255,255,255,0.15)",
                  color: KEYWORD_COLORS[kw] ?? "rgba(255,255,255,0.4)",
                  background: "transparent",
                }}
              >
                {kw}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
