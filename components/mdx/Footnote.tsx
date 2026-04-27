export function Footnote({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-sm text-ink-1">[{children}]</span>;
}
