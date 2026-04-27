export type TransitionKind = "page-tear" | "page-fold" | "cross-fade";

const KEY = "coconutlabs.transition-count";

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function readTransitionCount(storage: Storage = window.sessionStorage): number {
  const value = storage.getItem(KEY);
  const count = value ? Number.parseInt(value, 10) : 0;
  return Number.isFinite(count) ? count : 0;
}

export function incrementTransitionCount(storage: Storage = window.sessionStorage): number {
  const next = readTransitionCount(storage) + 1;
  storage.setItem(KEY, String(next));
  return next;
}

export function pickTransition(count: number, reducedMotion: boolean): TransitionKind {
  if (reducedMotion) {
    return "cross-fade";
  }
  if (count <= 2) {
    return "page-tear";
  }
  return "page-fold";
}

export function nextTransition(storage: Storage = window.sessionStorage): TransitionKind {
  const next = incrementTransitionCount(storage);
  return pickTransition(next, prefersReducedMotion());
}
