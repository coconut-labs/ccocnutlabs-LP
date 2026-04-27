import { expect, test } from "@playwright/test";

test("research post includes scholarly article schema", async ({ page }) => {
  await page.goto("/research/tenant-fairness-on-shared-inference");
  const json = await page.locator('script[type="application/ld+json"]').textContent();
  expect(json).toContain("ScholarlyArticle");
});
