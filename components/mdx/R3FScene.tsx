"use client";

import dynamic from "next/dynamic";

const PaperFoldSculpture = dynamic(
  () => import("@/components/canvas/PaperFoldSculpture").then((mod) => mod.PaperFoldSculpture),
  { ssr: false },
);

export function R3FScene() {
  return (
    <div className="h-[360px] overflow-hidden rounded-lg border border-rule bg-bg-2">
      <PaperFoldSculpture />
    </div>
  );
}
