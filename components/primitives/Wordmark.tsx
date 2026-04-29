"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CoconutLabsLogo } from "@/components/primitives/CoconutLabsLogo";

type WordmarkProps = {
  href?: string;
  className?: string;
  /** Smaller width (header-friendly). Default false. */
  compact?: boolean;
  /**
   * If true, the logo plays its entry animation on first visit per session
   * (gated via sessionStorage). Subsequent renders show the static state.
   * Default false — set true for the header's first-paint hero moment.
   */
  animateOnFirstVisit?: boolean;
};

const SESSION_KEY = "cl-logo-played";

export function Wordmark({
  href = "/",
  className = "",
  compact = false,
  animateOnFirstVisit = false,
}: WordmarkProps) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!animateOnFirstVisit) return;
    if (typeof window === "undefined") return;
    try {
      const played = sessionStorage.getItem(SESSION_KEY);
      if (!played) {
        sessionStorage.setItem(SESSION_KEY, "1");
        setAnimate(true);
      }
    } catch {
      // sessionStorage unavailable — fail closed (no animation).
    }
  }, [animateOnFirstVisit]);

  const width = compact ? 175 : 220;

  return (
    <Link
      aria-label="Coconut Labs"
      className={`focus-ring inline-flex items-center rounded-sm text-ink-0 ${className}`.trim()}
      href={href}
    >
      <CoconutLabsLogo animate={animate} width={width} />
    </Link>
  );
}
