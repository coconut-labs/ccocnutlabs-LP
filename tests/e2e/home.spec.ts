import { expect, test } from "@playwright/test";

test("home renders the full composition", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Coconut Labs" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Recent research" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Two people, close to the work." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jay Patel" })).toBeVisible();
  await expect(page.getByText("Building something at this layer?")).toBeVisible();
  await expect(page.getByRole("link", { name: /info@coconutlabs.org/i })).toHaveAttribute(
    "href",
    "mailto:info@coconutlabs.org",
  );
});
