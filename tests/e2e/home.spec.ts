import { expect, test } from "@playwright/test";

test("home renders the full composition in the new order", async ({ page }) => {
  await page.goto("/");

  // Hero
  await expect(page.getByRole("heading", { name: "Coconut Labs" })).toBeVisible();
  await expect(page.getByText(/KVWarden Gate 2/i).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Read the launch/i }).first()).toBeVisible();

  // Strips — Projects above Research
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent research" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Two people, close to the work." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jay Patel" })).toBeVisible();

  // Contact strip
  await expect(page.getByText("Building something at this layer?")).toBeVisible();
  await expect(page.getByRole("link", { name: /info@coconutlabs.org/i })).toHaveAttribute(
    "href",
    "mailto:info@coconutlabs.org",
  );

  // LiveSignals — permanent banner (matches the lowercase mono variant specifically)
  await expect(page.getByText(/kvwarden gate 2 · 1\.14× solo/)).toBeVisible();
});
