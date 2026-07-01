import { describe, it, expect } from "vitest";
import { TIMELINE_EVENTS } from "@/lib/story-data";

describe("TIMELINE_EVENTS video integrity", () => {
  // The timeline player only renders when BOTH video_id and start_time are
  // present (see TimelinePlayer usage in StoryPage.tsx). An event that cites a
  // video_id but has no start_time shows its quote with no video — the exact
  // regression this test guards against.
  it("every event that cites a video also has a start_time", () => {
    const broken = TIMELINE_EVENTS.filter(
      (e) => e.video_id != null && e.start_time == null
    ).map((e) => `${e.date} — ${e.label}`);

    expect(
      broken,
      `Timeline events citing a video but missing start_time (video won't render):\n${broken.join("\n")}`
    ).toEqual([]);
  });

  it("start_time is a non-negative finite number when present", () => {
    for (const e of TIMELINE_EVENTS) {
      if (e.start_time != null) {
        expect(Number.isFinite(e.start_time), `${e.label} start_time`).toBe(true);
        expect(e.start_time, `${e.label} start_time`).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("video_id, when present, looks like an 11-char YouTube id", () => {
    for (const e of TIMELINE_EVENTS) {
      if (e.video_id != null) {
        expect(e.video_id, `${e.label} video_id`).toMatch(/^[A-Za-z0-9_-]{11}$/);
      }
    }
  });
});
