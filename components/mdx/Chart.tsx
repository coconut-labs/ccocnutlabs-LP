export function Chart({ title, value }: { title: string; value: string }) {
  return (
    <figure className="rounded-lg border border-rule bg-bg-1 p-5">
      <p className="font-mono text-xs uppercase text-ink-2">{title}</p>
      <p className="mt-3 font-mono text-5xl text-accent">{value}</p>
    </figure>
  );
}
