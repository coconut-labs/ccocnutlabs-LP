import { expect, test } from "@playwright/test";

test("reduced motion route walk", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.getByLabel("Primary").getByRole("link", { name: "Research" }).click();
  await expect(page.getByRole("heading", { name: "Research" })).toBeVisible();
  await expect(page.locator(".route-transition")).toHaveCount(0);
});
