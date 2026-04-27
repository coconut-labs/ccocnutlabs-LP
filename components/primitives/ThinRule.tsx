"use client";

import { motion, useReducedMotion } from "motion/react";

export function ThinRule({ className = "" }: { className?: string }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      aria-hidden="true"
      className={`h-px w-full origin-left bg-rule ${className}`}
      initial={reducedMotion ? false : { scaleX: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      viewport={{ once: true, margin: "-120px" }}
      whileInView={{ scaleX: 1 }}
    />
  );
}
