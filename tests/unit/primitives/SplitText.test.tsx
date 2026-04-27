import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SplitText } from "@/components/primitives/SplitText";

describe("SplitText", () => {
  it("keeps the accessible label intact", () => {
    render(<SplitText text="quiet tenant" />);
    expect(screen.getByText("quiet tenant")).toBeInTheDocument();
  });

  it("handles accents and RTL text", () => {
    render(<SplitText mode="char" text="café שלום" />);
    expect(screen.getByText("café שלום")).toBeInTheDocument();
  });
});
