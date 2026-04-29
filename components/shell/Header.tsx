import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/primitives/Wordmark";
import { ROUTES } from "@/lib/routes";
import { getLatestPostSlug } from "@/lib/content";

const navRoutes = ROUTES.filter((route) => route.nav);

export async function Header() {
  const latestSlug = await getLatestPostSlug();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule/70 bg-bg-1/80 backdrop-blur-xl">
      <div
        className="mx-auto flex h-[var(--header-height)] max-w-[92rem] items-center justify-between gap-6 px-[var(--space-page-x)]"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Wordmark compact animateOnFirstVisit />

        <nav aria-label="Primary" className="hidden items-center gap-5 md:flex">
          {navRoutes.map((route) => (
            <Link
              className="focus-ring rounded-sm font-mono text-[0.74rem] uppercase text-ink-1 transition hover:text-ink-0"
              href={route.href}
              key={route.href}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <Link
          className="focus-ring inline-flex items-center gap-2 rounded border border-accent bg-accent px-4 py-2 font-mono text-[0.74rem] uppercase tracking-wide text-bg-0 transition hover:bg-accent-2 hover:border-accent-2"
          data-cta="primary"
          href={`/research/${latestSlug}`}
        >
          Read the launch <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
      </div>
    </header>
  );
}
