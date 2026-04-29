import Link from "next/link";
import { CoconutLabsLogo } from "@/components/primitives/CoconutLabsLogo";

type WordmarkProps = {
  href?: string;
  className?: string;
  /** Smaller font-size (header-friendly). Default false. */
  compact?: boolean;
  /**
   * If true, the lockup plays its entry animation each time the wordmark
   * mounts (i.e., on every page load — fresh tab, hard refresh, external
   * link, or initial layout mount). Within an SPA session, the layout
   * stays mounted across route changes so the animation does not re-fire
   * on internal nav. Default false.
   */
  animateOnFirstVisit?: boolean;
};

export function Wordmark({
  href = "/",
  className = "",
  compact = false,
  animateOnFirstVisit = false,
}: WordmarkProps) {
  const fontSize = compact ? "1.3rem" : "1.4rem";

  return (
    <Link
      aria-label="Coconut Labs"
      className={`focus-ring inline-flex items-center rounded-sm text-ink-0 ${className}`.trim()}
      href={href}
    >
      <CoconutLabsLogo animate={animateOnFirstVisit} style={{ fontSize }} />
    </Link>
  );
}
