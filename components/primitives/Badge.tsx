import type { ReactNode } from "react";

type BadgeTone = "amber" | "sage" | "rose" | "ink";

const tones: Record<BadgeTone, string> = {
  amber: "border-accent/40 bg-accent/10 text-accent",
  sage: "border-accent-2/40 bg-accent-2/10 text-accent-2",
  rose: "border-accent-3/40 bg-accent-3/10 text-accent-3",
  ink: "border-ink-0/30 bg-ink-0/5 text-ink-0",
};

export function Badge({ children, tone = "ink" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span className={`inline-flex rounded border px-2 py-1 font-mono text-[0.68rem] uppercase ${tones[tone]}`}>
      {children}
    </span>
  );
}
