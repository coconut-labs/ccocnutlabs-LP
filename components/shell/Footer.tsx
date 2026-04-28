import Link from "next/link";
import { ExternalLink, Rss } from "lucide-react";
import { EmailLink } from "@/components/primitives/EmailLink";
import { Wordmark } from "@/components/primitives/Wordmark";
import { ROUTES } from "@/lib/routes";

const footerRoutes = ROUTES.filter((route) => !route.href.includes("["));

const socials = [
  { label: "GitHub", href: "https://github.com/coconut-labs" },
  { label: "X/Twitter", href: "https://x.com/coconutlabs" },
  { label: "Hugging Face", href: "https://huggingface.co/coconut-labs" },
  { label: "arXiv", href: "https://arxiv.org" },
  { label: "Google Scholar", href: "https://scholar.google.com" },
];

export function Footer() {
  return (
    <footer className="border-t border-rule bg-bg-1/70 px-[var(--space-page-x)] py-14">
      <div className="mx-auto grid max-w-[92rem] gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Wordmark />
          <p className="mt-5 max-w-sm font-mono text-xs leading-6 text-ink-1">
            Coconut Labs · Made on a quiet workstation · 2026.
          </p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-3 font-mono text-xs text-ink-1">
          {footerRoutes.map((route) => (
            <Link className="focus-ring rounded-sm transition hover:text-accent" href={route.href} key={route.href}>
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="space-y-5 font-mono text-xs text-ink-1">
          <div className="grid gap-3">
            {socials.map((item) => (
              <a
                className="focus-ring inline-flex w-fit items-center gap-2 rounded-sm transition hover:text-accent"
                href={item.href}
                key={item.label}
                rel="noreferrer"
                target="_blank"
              >
                {item.label}
                <ExternalLink aria-hidden="true" size={13} />
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-4 border-t border-rule pt-5">
            <a className="focus-ring inline-flex items-center gap-2 rounded-sm hover:text-accent" href="/rss.xml">
              <Rss aria-hidden="true" size={13} />
              RSS
            </a>
            <EmailLink email="info@coconutlabs.org" label="Email" />
            <Link className="focus-ring rounded-sm hover:text-accent" href="/colophon">
              Colophon
            </Link>
            <a className="focus-ring rounded-sm hover:text-accent" href="/humans.txt">
              humans.txt
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
