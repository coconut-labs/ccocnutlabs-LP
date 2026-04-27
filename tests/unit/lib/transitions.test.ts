import { describe, expect, it } from "vitest";
import { incrementTransitionCount, pickTransition, readTransitionCount } from "@/lib/transitions";

describe("transition state", () => {
  it("picks reduced-motion fallback", () => {
    expect(pickTransition(1, true)).toBe("cross-fade");
  });

  it("uses page tear for first two transitions", () => {
    expect(pickTransition(1, false)).toBe("page-tear");
    expect(pickTransition(2, false)).toBe("page-tear");
    expect(pickTransition(3, false)).toBe("page-fold");
  });

  it("stores counts in session storage shape", () => {
    const storage = new Map<string, string>();
    const shim = {
      get length() {
        return storage.size;
      },
      clear: () => storage.clear(),
      getItem: (key: string) => storage.get(key) ?? null,
      key: (index: number) => Array.from(storage.keys())[index] ?? null,
      removeItem: (key: string) => storage.delete(key),
      setItem: (key: string, value: string) => storage.set(key, value),
    } as unknown as Storage;

    expect(readTransitionCount(shim)).toBe(0);
    expect(incrementTransitionCount(shim)).toBe(1);
    expect(readTransitionCount(shim)).toBe(1);
  });
});
