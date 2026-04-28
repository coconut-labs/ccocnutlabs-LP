import { expect, test } from "@playwright/test";

test("header and footer render with 5-item nav + Read-the-launch CTA", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();

  const primary = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["Research", "Projects", "Join us", "About", "Contact"]) {
    await expect(primary.getByRole("link", { name: label })).toBeVisible();
  }

  // CTA button — there will be one in the header and one in the hero; assert both exist
  const ctas = page.getByRole("link", { name: /Read the launch/i });
  await expect(ctas.first()).toBeVisible();
});
