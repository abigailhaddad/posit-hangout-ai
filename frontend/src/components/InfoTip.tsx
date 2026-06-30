"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Inline tooltip that works on touch as well as desktop. Native `title=` /
 * `<abbr>` tooltips never appear on touch devices, so the explanatory text was
 * invisible on phones. This toggles a popover on tap/click, closes on outside
 * click or Escape, and still reveals on hover for mouse users.
 */
export default function InfoTip({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span ref={wrapRef} className="relative inline-block group">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="underline decoration-dotted underline-offset-2 cursor-help"
        aria-expanded={open}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className={`absolute left-0 top-full mt-1.5 z-30 w-64 max-w-[80vw] rounded-lg border border-white/15 bg-zinc-900 p-3 text-left text-xs font-normal leading-relaxed text-white/70 shadow-xl transition-opacity duration-150 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        } group-hover:pointer-events-auto group-hover:opacity-100`}
      >
        {text}
      </span>
    </span>
  );
}
