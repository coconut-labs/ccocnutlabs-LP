"use client";

import { Check, Copy, Mail, Twitter } from "lucide-react";
import { useState } from "react";

export function ShareRow({ title, doi }: { title: string; doi?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <div className="no-print mx-auto flex max-w-[62ch] flex-wrap gap-3 px-[var(--space-page-x)] pb-24 font-mono text-xs">
      <button
        className="focus-ring inline-flex h-10 items-center gap-2 rounded border border-rule bg-bg-1 px-3 text-ink-0 hover:border-accent"
        onClick={copyLink}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={14} /> : <Copy aria-hidden="true" size={14} />}
        Copy link
      </button>
      <a
        className="focus-ring inline-flex h-10 items-center gap-2 rounded border border-rule bg-bg-1 px-3 hover:border-accent"
        href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(typeof window === "undefined" ? "" : window.location.href)}`}
      >
        <Twitter aria-hidden="true" size={14} />
        X/Twitter
      </a>
      <a
        className="focus-ring inline-flex h-10 items-center gap-2 rounded border border-rule bg-bg-1 px-3 hover:border-accent"
        href={`mailto:?subject=${encodeURIComponent(title)}`}
      >
        <Mail aria-hidden="true" size={14} />
        Email
      </a>
      {doi ? <span className="inline-flex h-10 items-center rounded border border-rule bg-bg-2 px-3">DOI {doi}</span> : null}
    </div>
  );
}
