import { describe, expect, it } from "vitest";
import { getRepoSignals } from "@/lib/github";

describe("github signals", () => {
  it("maps repo API results", async () => {
    const fetcher = async () =>
      new Response(
        JSON.stringify([
          { pushed_at: new Date().toISOString(), open_issues_count: 2 },
          { pushed_at: "2026-04-01T00:00:00Z", open_issues_count: 1 },
        ]),
        { status: 200 },
      );

    const signals = await getRepoSignals(fetcher as typeof fetch);
    expect(signals.repos).toBe(2);
    expect(signals.openIssues).toBe(3);
  });

  it("falls back on request failure", async () => {
    const signals = await getRepoSignals((async () => new Response("", { status: 500 })) as typeof fetch);
    expect(signals.repos).toBe(3);
  });
});
