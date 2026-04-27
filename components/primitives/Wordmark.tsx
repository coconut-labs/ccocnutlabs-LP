import Link from "next/link";

type WordmarkProps = {
  href?: string;
  className?: string;
  compact?: boolean;
};

export function Wordmark({ href = "/", className = "", compact = false }: WordmarkProps) {
  const mark = (
    <span className={`inline-flex items-center gap-3 text-ink-0 ${className}`}>
      <svg
        aria-hidden="true"
        className="h-10 w-10 shrink-0 overflow-visible"
        fill="none"
        viewBox="0 0 64 64"
      >
        <path
          d="M15.5 37.5c0-14.7 12.1-25.1 25.7-22.1 10.9 2.4 18.9 12.1 18.9 23.3 0 13.2-10.7 23.8-23.8 23.8-11.5 0-20.8-9.3-20.8-25Z"
          fill="var(--bg-1)"
          stroke="currentColor"
          strokeWidth="3.2"
        />
        <path
          d="M31.5 13.5C33.2 7.4 38.8 3.2 47 2.6c-1 7.8-5.7 12.8-14.1 15"
          stroke="var(--accent-2)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3.2"
        />
        <path
          d="M25 30.5c3.9-4.3 10.8-5.2 16.2-2.1 5.6 3.2 8.2 9.9 6.1 15.9"
          stroke="var(--accent)"
          strokeLinecap="round"
          strokeWidth="3"
        />
        <path
          d="M24 43.5c5.1 5.4 14.4 6 20.2 1.2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="3"
        />
      </svg>
      <span className={compact ? "hidden leading-none sm:block" : "block leading-none"}>
        <span className="block font-serif text-2xl leading-none tracking-normal text-ink-0">Coconut</span>
        <span className="mt-0.5 block font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-1">Labs</span>
      </span>
    </span>
  );

  return (
    <Link aria-label="Coconut Labs" className="focus-ring rounded-sm" href={href}>
      {mark}
    </Link>
  );
}
