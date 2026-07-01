import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import { CHAPTERS, findMention } from "@/lib/story-data";
import type { Mention } from "@/lib/types";

// The app loads mentions from public/data/regex_mentions.json (see app/page.tsx)
// and renders a chapter quote ONLY if findMention() resolves it. A quote_prefix
// that no longer matches a mention silently disappears — same class of bug as a
// timeline video with no start_time. This test reuses the real findMention so it
// can't drift from what the page actually does.
const mentions: Mention[] = JSON.parse(
  readFileSync(
    join(process.cwd(), "public", "data", "regex_mentions.json"),
    "utf-8"
  )
);

const allQuotes = CHAPTERS.flatMap((ch) =>
  ch.quotes.map((q) => ({ chapter: ch.id, ...q }))
);

describe("CHAPTERS quote resolution", () => {
  it("has quotes to check", () => {
    expect(allQuotes.length).toBeGreaterThan(0);
  });

  it("every chapter quote resolves to a real mention", () => {
    const unresolved = allQuotes
      .filter((q) => !findMention(mentions, q))
      .map((q) => `[${q.chapter}] ${q.video_id} :: "${q.quote_prefix.slice(0, 40)}"`);

    expect(
      unresolved,
      `Chapter quotes that no longer match a mention (they render nothing):\n${unresolved.join("\n")}`
    ).toEqual([]);
  });

  it("every chapter quote cites an 11-char YouTube id", () => {
    for (const q of allQuotes) {
      expect(q.video_id, `[${q.chapter}] video_id`).toMatch(/^[A-Za-z0-9_-]{11}$/);
    }
  });
});
