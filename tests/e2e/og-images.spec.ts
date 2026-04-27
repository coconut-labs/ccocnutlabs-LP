import { expect, test } from "@playwright/test";

test("og image route returns an image", async ({ request }) => {
  const response = await request.get("/api/og?title=Coconut%20Labs");
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image");
});
