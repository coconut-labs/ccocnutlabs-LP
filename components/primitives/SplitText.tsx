"use client";

import { motion, useReducedMotion } from "motion/react";

type SplitTextProps = {
  text: string;
  mode?: "word" | "char";
  className?: string;
};

export function SplitText({ text, mode = "word", className = "" }: SplitTextProps) {
  const reducedMotion = useReducedMotion();
  const parts = mode === "word" ? text.split(/(\s+)/) : Array.from(text);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {parts.map((part, index) => {
          const whitespace = /^\s+$/.test(part);
          if (whitespace) {
            return <span key={`${index}-space`}>{part}</span>;
          }

          return (
            <motion.span
              className="inline-block"
              initial={reducedMotion ? false : { opacity: 0, y: "0.35em" }}
              key={`${part}-${index}`}
              transition={{ delay: reducedMotion ? 0 : index * 0.018, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {part}
            </motion.span>
          );
        })}
      </span>
    </span>
  );
}
