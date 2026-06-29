import { test, expect } from "@playwright/test";

test.describe("Story page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and shows the first chapter headline", async ({ page }) => {
    await expect(page.getByText("In 2022, AI meant machine learning")).toBeVisible();
  });

  test("shows multiple chapter headlines", async ({ page }) => {
    await expect(page.getByText("ChatGPT arrives by name")).toBeVisible();
    await expect(page.getByText("Watch what you put in there")).toBeVisible();
    await expect(page.getByText("Should you be learning this?")).toBeVisible();
  });

  test("shows the timeline section", async ({ page }) => {
    await expect(page.getByText("GPT-3 comes up")).toBeVisible();
    await expect(page.getByText("Claude Code first mentioned")).toBeVisible();
  });

  test("timeline event expands on click to show quote", async ({ page }) => {
    const event = page.getByText("First mention of hallucination");
    await event.click();
    await expect(page.getByText(/hallucinations/)).toBeVisible();
  });

  test("all nine chapter headlines are rendered", async ({ page }) => {
    const headlines = [
      "In 2022, AI meant machine learning",
      "ChatGPT arrives by name",
      "Watch what you put in there",
      "Yes, I personally pay for this",
      "Pushback on hype, vendors, and the terminology",
      "Can I automate myself out of a job?",
      "Should you be learning this?",
    ];
    for (const text of headlines) {
      await expect(page.getByText(text)).toBeVisible();
    }
  });

  test("coverage chart section renders", async ({ page }) => {
    await expect(page.getByText(/episodes/i).first()).toBeVisible();
  });

  test("has a link to the explore page", async ({ page }) => {
    const exploreLink = page.getByRole("link", { name: /explore/i });
    await expect(exploreLink.first()).toBeVisible();
  });

  test("footer shows GitHub link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /posit-hangout-ai/i })).toBeVisible();
  });
});
