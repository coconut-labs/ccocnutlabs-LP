"use client";

import { usePathname } from "next/navigation";
import { routeIndex } from "@/lib/routes";

export function PageNumber() {
  const pathname = usePathname();
  const { page, total } = routeIndex(pathname);

  return (
    <div
      aria-hidden="true"
      className="page-number pointer-events-none fixed bottom-4 right-4 z-40 hidden font-mono text-[0.68rem] text-ink-2 md:block"
    >
      p. {String(page).padStart(2, "0")} of {String(total).padStart(2, "0")}
    </div>
  );
}
