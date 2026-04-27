"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";

export function buildMailtoHref(email: string, subject?: string): string {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${params}`;
}

export function EmailLink({
  email,
  subject,
  label,
  className = "",
}: {
  email: string;
  subject?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const href = buildMailtoHref(email, subject);

  async function copyEmail() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <a className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent" href={href}>
        {label ?? email} <Mail aria-hidden="true" size={14} />
      </a>
      <button
        aria-label={`Copy ${email}`}
        className="focus-ring inline-flex h-8 w-8 items-center justify-center rounded border border-rule bg-bg-1 text-ink-1 transition hover:border-accent hover:text-accent"
        onClick={copyEmail}
        title={copied ? "Copied" : `Copy ${email}`}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={13} /> : <Copy aria-hidden="true" size={13} />}
      </button>
    </span>
  );
}
