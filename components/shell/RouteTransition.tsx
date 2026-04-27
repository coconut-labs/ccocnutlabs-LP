"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { nextTransition, type TransitionKind } from "@/lib/transitions";

function label(kind: TransitionKind): string {
  if (kind === "page-tear") {
    return "translateY(0)";
  }
  if (kind === "page-fold") {
    return "scaleY(1)";
  }
  return "none";
}

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const previous = useRef(pathname);
  const [kind, setKind] = useState<TransitionKind | null>(null);

  useEffect(() => {
    if (previous.current === pathname) {
      return;
    }
    previous.current = pathname;
    const transition = nextTransition();
    setKind(transition);
    const timeout = window.setTimeout(() => setKind(null), transition === "page-tear" ? 700 : 360);
    return () => window.clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      {children}
      {kind ? (
        <div
          aria-hidden="true"
          className="route-transition pointer-events-none fixed inset-0 z-[120] bg-bg-1"
          data-transition-kind={kind}
          style={{
            clipPath: kind === "page-tear" ? "polygon(0 0, 100% 0, 94% 38%, 100% 100%, 0 100%, 7% 55%)" : undefined,
            opacity: kind === "cross-fade" ? 0.35 : 0.72,
            transform: label(kind),
            transition: "opacity 700ms var(--ease-paper-tear), transform 700ms var(--ease-paper-tear)",
          }}
        />
      ) : null}
    </>
  );
}
