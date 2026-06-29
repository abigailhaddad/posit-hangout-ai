import { test, expect } from "@playwright/test";

test.describe("Explore page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/explore");
  });

  test("loads and shows quote cards", async ({ page }) => {
    await expect(page.locator("blockquote").first()).toBeVisible();
  });

  test("shows total count of mentions", async ({ page }) => {
    await expect(page.getByText(/1,0\d\d/).first()).toBeVisible();
  });

  test("search filters results", async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill("hallucination");
    await expect(page.locator("blockquote").first()).toContainText(/hallucin/i);
    await expect(page.getByText(/of 1,039/).first()).toBeVisible();
  });

  test("clearing search restores full results", async ({ page }) => {
    const search = page.getByPlaceholder(/search/i);
    await search.fill("hallucination");
    await search.clear();
    await expect(page.getByText(/1,0\d\d/).first()).toBeVisible();
  });

  test("tool filter button filters results", async ({ page }) => {
    await page.getByRole("button", { name: /ChatGPT/ }).click();
    const cards = page.locator("blockquote");
    await expect(cards.first()).toBeVisible();
    const firstText = await cards.first().textContent();
    expect(firstText?.toLowerCase()).toContain("chatgpt");
  });

  test("play buttons appear on cards", async ({ page }) => {
    const playButtons = page.getByRole("button", { name: /Play at/i });
    await expect(playButtons.first()).toBeVisible();
  });

  test("play button opens inline video player", async ({ page }) => {
    const playBtn = page.getByRole("button", { name: /Play at/i }).first();
    await playBtn.click();
    await expect(page.locator("iframe")).toBeVisible();
  });

  test("pagination works", async ({ page }) => {
    const nextBtn = page.getByRole("button", { name: "Next →" });
    await expect(nextBtn).toBeVisible();
    await nextBtn.click();
    await expect(page.getByText(/^2 \//)).toBeVisible();
  });

  test("footer shows GitHub link", async ({ page }) => {
    await expect(page.getByRole("link", { name: /posit-hangout-ai/i })).toBeVisible();
  });
});
