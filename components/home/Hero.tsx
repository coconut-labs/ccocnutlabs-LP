import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { getLatestPostSlug } from "@/lib/content";

export async function Hero() {
  const latestSlug = await getLatestPostSlug();

  return (
    <section className="relative grid min-h-[calc(100svh-var(--header-height))] place-items-center overflow-hidden px-[var(--space-page-x)] py-20">
      <HeroCanvas />
      <div className="mx-auto max-w-[88rem]">
        <p className="mb-5 font-mono text-xs uppercase text-accent-2">independent inference research</p>
        <h1
          className="max-w-5xl font-serif text-[clamp(4.8rem,13vw,9.8rem)] leading-[0.92] text-ink-0"
          style={{ animation: "hero-breathe 8s ease-in-out infinite alternate", letterSpacing: 0 }}
        >
          Coconut Labs
        </h1>
        <p className="mt-8 max-w-2xl font-sans text-xl leading-8 text-ink-1 md:text-2xl">
          Schedulers, systems notes, and reproducible measurements for shared inference.
        </p>
        <p className="mt-6 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          KVWarden Gate 2: 1.14× of solo TTFT under load. 26× better than FIFO.
        </p>
        <div className="mt-8">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded border border-accent bg-accent px-5 py-3 font-mono text-xs uppercase tracking-wide text-bg-0 transition hover:bg-accent-2 hover:border-accent-2"
            data-cta="hero"
            href={`/research/${latestSlug}`}
          >
            Read the launch <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
