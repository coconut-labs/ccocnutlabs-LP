import Link from "next/link";
import { Mail } from "lucide-react";
import { Wordmark } from "@/components/primitives/Wordmark";
import { ROUTES } from "@/lib/routes";

const navRoutes = ROUTES.filter((route) => route.nav);

export function Header() {
  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule/70 bg-bg-1/80 backdrop-blur-xl">
      <div
        className="mx-auto flex h-[var(--header-height)] max-w-[92rem] items-center justify-between gap-6 px-[var(--space-page-x)]"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Wordmark compact />
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
          aria-label="Contact Coconut Labs"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded border border-rule bg-bg-0 text-ink-0 transition hover:border-accent hover:text-accent"
          href="/contact"
        >
          <Mail aria-hidden="true" size={17} />
        </Link>
      </div>
    </header>
  );
}
