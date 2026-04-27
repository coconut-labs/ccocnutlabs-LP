import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Markdown, parseMarkdown } from "@/lib/markdown";

describe("markdown renderer", () => {
  it("parses headings, paragraphs, lists, quotes, and code", () => {
    const blocks = parseMarkdown("## Heading\n\nText\n\n- one\n- two\n\n> quote\n\n```ts\nconst x = 1;\n```");
    expect(blocks.map((block) => block.type)).toEqual(["heading", "paragraph", "list", "quote", "code"]);
  });

  it("renders inline code and links", () => {
    render(<Markdown content="A `scheduler` with [numbers](https://example.com)." />);
    expect(screen.getByText("scheduler")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "numbers" })).toHaveAttribute("href", "https://example.com");
  });
});
