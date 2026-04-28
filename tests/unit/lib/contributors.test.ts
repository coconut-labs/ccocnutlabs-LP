import { describe, it, expect, vi } from "vitest";
import { loadContributors } from "@/lib/contributors";

describe("loadContributors", () => {
  it("returns an empty array when the CONTRIBUTORS file is empty", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual([]);
  });

  it("parses newline-delimited handles, skipping empty lines and comments", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "ada-lovelace\n# comment\n\nk-thompson\n  m-jones-22  \n",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual(["ada-lovelace", "k-thompson", "m-jones-22"]);
  });

  it("returns an empty array on fetch failure", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "Not Found",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual([]);
  });
});
