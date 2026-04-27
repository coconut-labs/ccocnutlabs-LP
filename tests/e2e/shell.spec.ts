import { expect, test } from "@playwright/test";

test("header and footer render", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("link", { name: /contact coconut labs/i })).toBeVisible();
});
