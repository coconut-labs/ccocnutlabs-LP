"use client";

import { useEffect, useState } from "react";

export function useFirstNVisits(key: string, limit: number): boolean {
  const [withinLimit, setWithinLimit] = useState(false);

  useEffect(() => {
    const value = window.sessionStorage.getItem(key);
    const current = value ? Number.parseInt(value, 10) : 0;
    const next = current + 1;
    window.sessionStorage.setItem(key, String(next));
    setWithinLimit(next <= limit);
  }, [key, limit]);

  return withinLimit;
}
