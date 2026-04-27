import { HeroCanvas } from "@/components/home/HeroCanvas";

export function Hero() {
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
      </div>
    </section>
  );
}
