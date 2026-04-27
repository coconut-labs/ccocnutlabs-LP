"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

export function Card({
  children,
  className = "",
  tilt = false,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      className={`rounded-lg border border-rule bg-bg-1/72 p-6 shadow-[var(--shadow-soft)] ${className}`}
      whileHover={tilt && !reducedMotion ? { rotateX: 1.5, rotateY: -1.5, y: -4 } : undefined}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
