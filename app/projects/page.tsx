import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { loadProject, loadWork } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Projects · Coconut Labs",
  description: "Two projects, in different stages. Plus the small things that keep the lab honest.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const [kvwarden, weft, work] = await Promise.all([
    loadProject("kvwarden"),
    loadProject("weft"),
    loadWork(),
  ]);

  // Filter the tools list — flagships are projects, not tools.
  const tools = work.filter((entry) => !["KVWarden", "Weft"].includes(entry.name));

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">projects</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Projects</h1>
        <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          Two projects, in different stages. Plus the small things that keep the lab honest.
        </p>

        {/* KVWarden — large card */}
        <article className="mt-16 rounded-lg border border-rule bg-bg-1/70 p-8 transition hover:shadow-[var(--shadow-paper)] md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-accent-2/40 bg-accent-2/10 px-3 py-1 font-mono text-xs uppercase text-accent-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-2"></span>
            Live
          </div>
          <h2 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-none">{kvwarden.name}</h2>
          <p className="mt-3 font-mono text-xs uppercase text-ink-2">{kvwarden.tagline}</p>
          <p className="mt-8 font-mono text-[clamp(1.6rem,3.5vw,3.2rem)] leading-tight text-ink-0">
            {kvwarden.result}
          </p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-1">{kvwarden.content}</p>
          <div className="mt-8 flex flex-wrap gap-5 font-mono text-xs">
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent"
              href="/research/tenant-fairness-on-shared-inference"
            >
              Read the launch <ArrowRight aria-hidden="true" size={14} />
            </Link>
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-sm text-ink-1 hover:text-accent"
              href="/projects/kvwarden"
            >
              Project page <ArrowRight aria-hidden="true" size={14} />
            </Link>
            <a
              className="focus-ring inline-flex items-center gap-2 rounded-sm text-ink-1 hover:text-accent"
              href="https://github.com/coconut-labs/kvwarden"
            >
              GitHub <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </div>
        </article>

        {/* Weft — medium card */}
        <article className="mt-10 rounded-lg border border-rule bg-bg-1/40 p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs uppercase text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
            In research
          </div>
          <h2 className="font-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-none">{weft.name}</h2>
          <p className="mt-3 font-mono text-xs uppercase text-ink-2">{weft.tagline}</p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-1">{weft.content}</p>
          {weft.probeWindow ? (
            <p className="mt-5 font-mono text-xs text-ink-2">Probe window: {weft.probeWindow}.</p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-5 font-mono text-xs">
            <Link
              className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent"
              href="/projects/weft"
            >
              Project page <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </article>

        {/* Tools & experiments */}
        <div className="mt-16 border-t border-rule pt-10" id="tools">
          <p className="font-mono text-xs uppercase text-accent-2">tools and experiments</p>
          <p className="mt-4 max-w-2xl font-mono text-sm leading-7 text-ink-1">
            Smaller things, mostly the scaffolding behind the public work.
          </p>
          {tools.length === 0 ? (
            <p className="mt-8 font-mono text-xs text-ink-2">// nothing here yet — see github.com/coconut-labs.</p>
          ) : (
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {tools.map((tool) => (
                <li className="border-l-2 border-rule pl-4" key={tool.name}>
                  <a
                    className="focus-ring inline-flex items-baseline gap-3 rounded-sm font-serif text-2xl text-ink-0 hover:text-accent"
                    href={tool.repo_url}
                  >
                    {tool.name}
                    <span className="font-mono text-xs uppercase text-ink-2">{tool.language}</span>
                  </a>
                  <p className="mt-2 max-w-prose text-sm leading-6 text-ink-1">{tool.description}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 font-mono text-xs text-ink-2">RSS for new entries: /rss.xml</p>
        </div>
      </div>
    </section>
  );
}
