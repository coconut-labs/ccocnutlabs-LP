import { ArrowUpRight } from "lucide-react";
import { IndexCard } from "@/components/index/IndexCard";
import { loadWork } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join us · Coconut Labs",
  description: "Contributor information for Coconut Labs.",
  path: "/joinus",
});

export default async function JoinUsPage() {
  const work = await loadWork();

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">contributors</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Build with us.</h1>
        <p className="mt-7 max-w-2xl text-xl leading-9 text-ink-1">
          The best way in is through a small reproducible artifact: a trace, a failing case, a benchmark, or a patch.
        </p>
        <div className="mt-14 grid gap-5">
          {work.map((entry) => (
            <IndexCard entry={entry} key={entry.name} />
          ))}
        </div>
        <div className="mt-16 grid gap-6 rounded-lg border border-rule bg-bg-1/70 p-7 md:grid-cols-3">
          {[
            ["Contributing", "https://github.com/coconut-labs"],
            ["Code of conduct", "https://github.com/coconut-labs"],
            ["Discussions", "https://github.com/coconut-labs"],
          ].map(([label, href]) => (
            <a className="focus-ring inline-flex items-center gap-2 rounded-sm font-mono text-sm text-accent" href={href} key={label}>
              {label} <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
