import { expect, test } from "@playwright/test";

const routes = [
  ["/work", "Work"],
  ["/papers", "Papers"],
  ["/podcasts", "Podcasts"],
  ["/projects/kvwarden", "KVWarden"],
  ["/projects/weft", "Weft"],
  ["/joinus", "Build with us."],
  ["/about", "A small lab for shared inference."],
  ["/contact", "Write the lab."],
  ["/colophon", "How this page is made."],
] as const;

for (const [route, heading] of routes) {
  test(`${route} renders`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  });
}

test("/about renders both founders", async ({ page }) => {
  await page.goto("/about", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: "Shrey Patel" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Jay Patel" })).toBeVisible();
  await expect(page.getByText("Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems")).toBeVisible();
});

test("/contact exposes the amended email split", async ({ page }) => {
  await page.goto("/contact", { waitUntil: "domcontentloaded" });
  const main = page.getByRole("main");

  await expect(main.getByRole("link", { name: /shreypatel@coconutlabs.org/i })).toHaveAttribute(
    "href",
    "mailto:shreypatel@coconutlabs.org?subject=Collaborate",
  );
  await expect(main.getByRole("link", { name: /jaypatel@coconutlabs.org/i })).toHaveAttribute(
    "href",
    "mailto:jaypatel@coconutlabs.org?subject=Press",
  );
  await expect(main.getByRole("link", { name: /info@coconutlabs.org/i })).toHaveAttribute(
    "href",
    "mailto:info@coconutlabs.org",
  );
  await expect(main.getByRole("button", { name: "Copy shreypatel@coconutlabs.org" })).toBeVisible();
  await expect(main.getByRole("button", { name: "Copy jaypatel@coconutlabs.org" })).toBeVisible();
  await expect(main.getByRole("button", { name: "Copy info@coconutlabs.org" })).toBeVisible();
});
