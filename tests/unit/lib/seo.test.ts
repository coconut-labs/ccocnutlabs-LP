import { describe, expect, it } from "vitest";
import { buildMetadata, scholarlyArticleJsonLd } from "@/lib/seo";

describe("seo helpers", () => {
  it("builds canonical metadata", () => {
    const metadata = buildMetadata({
      title: "Research · Coconut Labs",
      description: "Notes.",
      path: "/research",
    });
    expect(metadata.alternates?.canonical).toBe("https://coconutlabs.org/research");
  });

  it("builds ScholarlyArticle JSON-LD", () => {
    const json = scholarlyArticleJsonLd({
      title: "A note",
      description: "A dek",
      slug: "a-note",
      date: "2026-04-25",
      authors: ["Shrey Patel"],
    });
    expect(json["@type"]).toBe("ScholarlyArticle");
    expect(json.mainEntityOfPage).toBe("https://coconutlabs.org/research/a-note");
  });
});
