import { getRepoSignals } from "@/lib/github";

export async function LiveSignalsStrip() {
  const signals = await getRepoSignals();
  const items = [
    signals.updatedLabel,
    `${signals.commitsThisWeek} commits this week`,
    `${signals.repos} repos tracked`,
    `${signals.openIssues} RFC open`,
  ];

  return (
    <section className="px-[var(--space-page-x)] pb-12">
      <div className="content-inner flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-5 font-mono text-[0.72rem] uppercase text-ink-2">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
