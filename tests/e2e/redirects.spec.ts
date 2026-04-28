import { test, expect } from "@playwright/test";

test.describe("legacy route redirects", () => {
  test("/work redirects to /projects#tools", async ({ page }) => {
    const response = await page.goto("/work");
    expect(response?.status()).toBe(200);
    expect(page.url()).toMatch(/\/projects(#tools)?$/);
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
