import { test, expect } from "@playwright/test";

test.describe("legacy route redirects", () => {
  test("/work redirects to /projects#tools (404 until projects hub lands)", async ({ page }) => {
    await page.goto("/work");
    expect(page.url()).toMatch(/\/projects/);
    // 404 is expected here until Task 9; once /projects/page.tsx exists, change to expect(response?.status()).toBe(200)
  });

  test("/papers redirects to /research?type=papers", async ({ page }) => {
    const response = await page.goto("/papers");
    expect(response?.status()).toBe(200);
    expect(page.url()).toMatch(/\/research\?type=papers$/);
  });

  test("/podcasts redirects to /research?type=podcasts", async ({ page }) => {
    const response = await page.goto("/podcasts");
    expect(response?.status()).toBe(200);
    expect(page.url()).toMatch(/\/research\?type=podcasts$/);
  });
});
