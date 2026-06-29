import { describe, it, expect } from "vitest";
import { youtubeUrl, TOOL_COLORS, KEYWORD_COLORS } from "@/lib/utils";

describe("youtubeUrl", () => {
  it("returns a basic watch URL when no start_time", () => {
    const url = youtubeUrl("abc123", null);
    expect(url).toBe("https://www.youtube.com/watch?v=abc123");
  });

  it("includes t= param when start_time is provided", () => {
    const url = youtubeUrl("abc123", 90.5);
    expect(url).toBe("https://www.youtube.com/watch?v=abc123&t=90s");
  });

  it("floors fractional seconds", () => {
    const url = youtubeUrl("xyz", 61.9);
    expect(url).toContain("t=61s");
  });
});

describe("TOOL_COLORS", () => {
  it("has an entry for ChatGPT", () => {
    expect(TOOL_COLORS["ChatGPT"]).toBeDefined();
  });

  it("has an entry for Claude", () => {
    expect(TOOL_COLORS["Claude"]).toBeDefined();
  });
});

describe("KEYWORD_COLORS", () => {
  it("has an entry for hallucination", () => {
    expect(KEYWORD_COLORS["hallucination"]).toBeDefined();
  });
});
