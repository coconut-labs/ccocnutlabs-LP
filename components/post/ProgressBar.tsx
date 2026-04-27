"use client";

import { useEffect, useState } from "react";

export function ProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max <= 0 ? 1 : window.scrollY / max);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div aria-hidden="true" className="no-print fixed left-0 top-0 z-[80] h-px w-full bg-transparent">
      <div className="h-px bg-accent" style={{ transform: `scaleX(${progress})`, transformOrigin: "left" }} />
    </div>
  );
}
