"use client";

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { PaperFoldSvgFallback } from "@/components/canvas/PaperFoldSvgFallback";

const PaperFoldSculpture = dynamic(
  () => import("@/components/canvas/PaperFoldSculpture").then((mod) => mod.PaperFoldSculpture),
  { ssr: false, loading: () => <PaperFoldSvgFallback /> },
);

export function HeroCanvas() {
  const { ref, inView } = useInView({ rootMargin: "240px", triggerOnce: true });
  const variant = process.env.NEXT_PUBLIC_PAPER_FOLD_VARIANT ?? "svg";

  return (
    <div ref={ref} className="absolute inset-0 -z-10 opacity-80">
      {variant === "webgl" && inView ? <PaperFoldSculpture /> : <PaperFoldSvgFallback />}
    </div>
  );
}
