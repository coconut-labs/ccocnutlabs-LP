# coconutlabs.org — Phase 4 (Motion Polish) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 5 of 6.** This plan covers Phase 4 only (Motion Polish). Other phases get their own plans:
- `2026-04-25-coconutlabs-phase-0-foundation.md`
- `…-phase-1-home-and-visual-identity.md`
- `…-phase-2-research-engine.md`
- `…-phase-3-inner-pages.md`
- `2026-04-25-coconutlabs-phase-4-motion-polish.md` ← this plan
- `…-phase-5-perf-a11y-ship.md`

> **Amended 2026-04-26 — CursorLayer dropped entirely.** Per spec amendment, the site uses the system cursor everywhere. Premium feel comes from typography, color, motion choreography, and content; a custom cursor reads as gimmicky / "club website."
>
> **Skip these tasks:** the `useCursor` portion of **Task 4** (build only `useFirstNVisits`); **Task 14** (CursorLayer full implementation); **Task 22** (cursor e2e test). Files `hooks/useCursor.ts`, `components/shell/CursorLayer.tsx`, and `tests/e2e/cursor.spec.ts` should not be created.
>
> **Reduced scope:** Phase 4 saves ~1 day from skipping cursor work.

**Goal:** Land the "story between pages" — replace the Phase 0 `<RouteTransition>` stub with the real implementation, build the page-tear GLSL shader, wire it into Next 15's View Transitions API, swap the Phase 1 live-signals placeholder for a real GitHub-fed strip, and finish with the in-character paper-tear 404. Premium-quality motion is the entire deliverable — every effect either ships at the bar or falls back per the documented bailout (Task 30). (Per the 2026-04-26 amendment, the CursorLayer is **not** built in this phase — system cursor used everywhere.)

**Architecture:** `<RouteTransition>` becomes a client component that listens for Next 15 View Transition events, snapshots the outgoing DOM to a `<canvas>` via `html-to-image`, hands the texture to a React Three Fiber `<PageTearShader>` (custom GLSL with paper-tear noise mask + curl displacement + custom paper-physics easing), and fades the incoming route up underneath. `lib/transitions.ts` owns the sessionStorage state machine that decides per-transition which shader runs (full page-tear for first 2, lighter page-fold after, instant cross-fade under reduced motion). `lib/github.ts` fetches `github.com/coconut-labs` repo + commit + issue counts at build time, ISR-cached for 1 hour, exposed via `getRepoSignals()` to `<LiveSignalsStrip>`.

**Tech Stack:** Next.js 15 (View Transitions API), React 19, TypeScript 5, Motion 11, R3F 9, Drei 9, three 0.170, custom GLSL, `html-to-image` (DOM-to-texture snapshotting), Vitest, Playwright, axe-core.

**Prerequisites:**
- Phases 0–3 complete (shell, home, research engine, inner pages all live)
- Spec at `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md`
- Working directory: `/Users/shrey/Personal Projects/coconutlabs/`
- Phase 1 `LiveSignalsStrip` placeholder already mounted on home (replaced here)
- Phase 0 `RouteTransition` stub in place (replaced here)
- Phase 0 `app/not-found.tsx` already in place (extended here)

**Risk level: HIGH** (per spec §13.1). The page-tear shader is the highest-craft, highest-risk piece in the entire build. The plan handles this with three discipline mechanisms:
1. Build the shader incrementally across Tasks 7–13 — start with a simple displacement that compiles and runs, then layer noise / curl / timing / DOM-snapshot / VT-trigger / page-fold-secondary one task at a time.
2. Per-task acceptance criteria are explicit: 60fps on M1 MacBook + Pixel 6a, smooth on Safari/iOS, looks like paper not generic displacement. Every shader-touching task has a Safari/iOS-verify step.
3. Task 30 is a documented BAILOUT with concrete fallback code: if after Tasks 7–13 the shader doesn't meet the quality bar after ~5 implementation days, swap to View Transitions API native morph + paper-texture overlay (~70% as good, 30% the work, per spec §13.1).

---

## File Structure (Phase 4 deliverables: new + modified)

```
coconutlabs/
├── package.json                                    MODIFY: add html-to-image
├── app/
│   └── not-found.tsx                               MODIFY: integrate <PaperTear404/>
├── components/
│   ├── canvas/
│   │   ├── PageTearShader.tsx                      NEW: R3F component, full page-tear (700ms)
│   │   ├── PageFoldShader.tsx                      NEW: R3F component, lighter secondary (350ms)
│   │   ├── PaperTear404.tsx                        NEW: single-page tear for /404 first paint
│   │   └── shaders/
│   │       ├── page-tear.glsl                      NEW: vertex + fragment
│   │       └── page-fold.glsl                      NEW: vertex + fragment
│   ├── shell/
│   │   └── RouteTransition.tsx                     MODIFY: stub → VT + shader trigger
│   ├── home/
│   │   └── LiveSignalsStrip.tsx                    MODIFY: placeholder → real GitHub data
│   └── primitives/
│       └── SplitText.tsx                           MODIFY: edge-case polish (whitespace, accents, RTL)
├── lib/
│   ├── transitions.ts                              NEW: sessionStorage state machine + RM check
│   └── github.ts                                   NEW: GitHub API fetcher with ISR cache
├── hooks/
│   └── useFirstNVisits.ts                          NEW: counter helper
├── styles/
│   └── tokens.css                                  MODIFY: add --ease-paper-tear
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   ├── github.test.ts                      NEW: mocked fetch, response shape
│   │   │   └── transitions.test.ts                 NEW: state machine, sessionStorage, RM
│   │   ├── hooks/
│   │   │   └── useFirstNVisits.test.ts             NEW: counter behavior
│   │   └── primitives/
│   │       └── SplitText.test.tsx                  EXTEND: whitespace + accents + RTL + RM
│   └── e2e/
│       ├── transitions.spec.ts                     NEW: nav doesn't break, RM fallback, counter
│       └── 404.spec.ts                             EXTEND Phase 0: paper-tear visible
└── .github/workflows/ci.yml                        MODIFY: declare GITHUB_PAT secret
```

**File responsibility boundaries:**
- `lib/transitions.ts` is pure logic — sessionStorage reads/writes, prefers-reduced-motion checks, decision function `pickTransition()` returns `"page-tear" | "page-fold" | "cross-fade"`. No React, no DOM beyond `window.matchMedia`. Tested with Vitest using a stubbed `window`.
- `lib/github.ts` is pure logic with `fetch()`. No React. Returns a typed `RepoSignals` shape. Tested with mocked `fetch`. ISR is enforced via Next-side fetch options (`next: { revalidate: 3600 }`) — verified by inspecting the call args, not by running an actual network round-trip.
- `components/canvas/*` is the WebGL surface. R3F components, no business logic. The shaders themselves live as `.glsl` strings imported via Vite's `?raw` suffix (so they're loaded as text and passed to three.js `ShaderMaterial`).
- `components/shell/RouteTransition.tsx` orchestrates: it consumes `lib/transitions.ts`, imports `<PageTearShader>` / `<PageFoldShader>` lazily (so the shader bundle isn't on the critical path for first paint), drives the View Transition lifecycle, and unmounts the canvas after each transition completes.
- `components/primitives/SplitText.tsx` is the only file from Phase 1 that gets extended (not replaced). Existing tests must keep passing.

---

## Tasks

### Task 1: Verify Next 15 View Transitions API surface

**Why:** Spec §7.3 says `<RouteTransition>` is "triggered by Next 15 View Transitions API." The exact symbol (`unstable_ViewTransition` vs experimental config flag vs runtime `document.startViewTransition`) has shifted across Next 15 minors. Verify the surface available in *this project's installed version* before writing code that depends on it.

**Files:** none (research-only)

- [ ] **Step 1: Confirm working directory and installed Next version**

Run: `cd "/Users/shrey/Personal Projects/coconutlabs" && pnpm list next --depth 0`
Expected: prints `next x.y.z` where `x` is `15`. Note the exact minor + patch.

- [ ] **Step 2: Inspect the Next 15 release notes for the installed version**

Run: `pnpm view next@<installed-version> | head -40`

Then read the Next.js 15 docs page on View Transitions (search the installed version's docs site or GitHub release notes). Identify which of these is the supported integration in your version:
- `unstable_ViewTransition` exported from `next` or `next/navigation`
- `experimental.viewTransitions: true` in `next.config.ts` + `document.startViewTransition` at the call site
- A different surface

Note: at the time this plan was written (2026-04-25), the most likely API is `experimental.viewTransitions: true` config flag combined with the browser's native `document.startViewTransition()` API used inside a `useTransition`-style wrapper. Confirm against the installed version's docs.

- [ ] **Step 3: Record the verified API surface**

Open a scratch note (do not commit; this is purely a working memory): write the exact import/config you confirmed in Step 2. The next 5 tasks reference this. If the API requires `experimental.viewTransitions: true`, that goes in `next.config.ts` in Task 5.

- [ ] **Step 4: No commit**

This task produces no code, only verified knowledge. Proceed to Task 2.

---

### Task 2: Add html-to-image dependency for DOM snapshotting

**Why:** Spec §7.3 says "outgoing route is snapshotted to a WebGL texture (DOM-to-texture)." Two libraries do this: `html-to-image` (smaller, modern, ~30KB gzipped, uses SVG `<foreignObject>` under the hood) and `html2canvas` (older, bigger, ~50KB, draws to a fresh canvas via DOM-walking). We pick `html-to-image` — it's smaller, faster, and the SVG approach handles modern CSS (transforms, gradients, custom fonts) more faithfully. Documented trade-off: `html-to-image` is known to occasionally miss webkit-only CSS in older Safari; we test on Safari/iOS in Task 7+ and switch to `html2canvas` if that bites us.

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Install**

Run: `pnpm add html-to-image@^1`

- [ ] **Step 2: Verify install**

Run: `pnpm list html-to-image`
Expected: prints version `1.x.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(phase-4): add html-to-image for dom-to-texture snapshotting"
```

---

### Task 3: Build lib/transitions.ts (sessionStorage state machine + RM check)

**Files:**
- Create: `lib/transitions.ts`, `tests/unit/lib/transitions.test.ts`

- [ ] **Step 1: Write the test first**

Create `tests/unit/lib/transitions.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { pickTransition, recordTransition, resetTransitionsForTest } from "@/lib/transitions";

describe("pickTransition", () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetTransitionsForTest();
  });

  it("returns 'cross-fade' under prefers-reduced-motion", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    expect(pickTransition()).toBe("cross-fade");
  });

  it("returns 'page-tear' for the first 2 transitions of a session", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
    expect(pickTransition()).toBe("page-tear");
    recordTransition();
    expect(pickTransition()).toBe("page-tear");
    recordTransition();
    expect(pickTransition()).toBe("page-fold");
  });

  it("returns 'page-fold' from the 3rd transition onward", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
    sessionStorage.setItem("coconut.transitions.count", "5");
    expect(pickTransition()).toBe("page-fold");
  });
});

describe("recordTransition", () => {
  beforeEach(() => sessionStorage.clear());

  it("increments the sessionStorage counter", () => {
    recordTransition();
    expect(sessionStorage.getItem("coconut.transitions.count")).toBe("1");
    recordTransition();
    expect(sessionStorage.getItem("coconut.transitions.count")).toBe("2");
  });

  it("is a no-op on the server (no window)", () => {
    const orig = globalThis.window;
    // @ts-expect-error simulate SSR
    delete globalThis.window;
    expect(() => recordTransition()).not.toThrow();
    globalThis.window = orig;
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/transitions.test.ts`
Expected: FAIL with "Cannot find module '@/lib/transitions'".

- [ ] **Step 3: Implement lib/transitions.ts**

Create `lib/transitions.ts`:
```ts
export type TransitionKind = "page-tear" | "page-fold" | "cross-fade";

const STORAGE_KEY = "coconut.transitions.count";
const FULL_TEAR_BUDGET = 2;

function isClient(): boolean {
  return typeof window !== "undefined" && typeof sessionStorage !== "undefined";
}

function getCount(): number {
  if (!isClient()) return 0;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

function prefersReducedMotion(): boolean {
  if (!isClient()) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Decide which transition to run next, based on session count + RM.
 * Pure read — does not mutate the counter (call recordTransition() after).
 */
export function pickTransition(): TransitionKind {
  if (prefersReducedMotion()) return "cross-fade";
  return getCount() < FULL_TEAR_BUDGET ? "page-tear" : "page-fold";
}

/** Increment the counter. Call after a transition fires. No-op on SSR. */
export function recordTransition(): void {
  if (!isClient()) return;
  sessionStorage.setItem(STORAGE_KEY, String(getCount() + 1));
}

/** Test-only helper. Resets in-memory state if any caching is added later. */
export function resetTransitionsForTest(): void {
  if (isClient()) sessionStorage.removeItem(STORAGE_KEY);
}
```

- [ ] **Step 4: Run, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/transitions.test.ts`
Expected: PASS, 5/5 green.

- [ ] **Step 5: Commit**

```bash
git add lib/transitions.ts tests/unit/lib/transitions.test.ts
git commit -m "feat(phase-4): add transitions state machine (session count + RM)"
```

---

### Task 4: Build hooks/useFirstNVisits

(Per 2026-04-26 amendment: `hooks/useCursor.ts` is **not** built — CursorLayer dropped entirely. Only `useFirstNVisits` is built in this task. Skip Steps 5 below.)

**Files:**
- Create: `hooks/useFirstNVisits.ts`, `tests/unit/hooks/useFirstNVisits.test.ts`

- [ ] **Step 1: Write the useFirstNVisits test**

Create `tests/unit/hooks/useFirstNVisits.test.ts`:
```ts
import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFirstNVisits } from "@/hooks/useFirstNVisits";

describe("useFirstNVisits", () => {
  beforeEach(() => sessionStorage.clear());

  it("returns true while count < n, then false after", () => {
    const { result, rerender } = renderHook(({ key, n }) => useFirstNVisits(key, n), {
      initialProps: { key: "test.visits", n: 2 },
    });
    expect(result.current.isFirst).toBe(true);
    act(() => result.current.bump());
    rerender({ key: "test.visits", n: 2 });
    expect(result.current.isFirst).toBe(true);
    act(() => result.current.bump());
    rerender({ key: "test.visits", n: 2 });
    expect(result.current.isFirst).toBe(false);
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `pnpm exec vitest run tests/unit/hooks/useFirstNVisits.test.ts`
Expected: FAIL with "Cannot find module '@/hooks/useFirstNVisits'".

- [ ] **Step 3: Implement useFirstNVisits**

Create `hooks/useFirstNVisits.ts`:
```ts
"use client";

import { useCallback, useState } from "react";

/**
 * Returns `{ isFirst, bump }`. `isFirst` is true while the sessionStorage
 * counter at `key` is < `n`; `bump()` increments the counter.
 *
 * Used by route transitions (n=2 for "first 2 transitions get full page-tear")
 * and the first-load ceremonial reveal.
 */
export function useFirstNVisits(key: string, n: number): { isFirst: boolean; bump: () => void } {
  const read = (): number => {
    if (typeof sessionStorage === "undefined") return 0;
    const raw = sessionStorage.getItem(key);
    const v = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(v) ? v : 0;
  };
  const [count, setCount] = useState<number>(read);
  const bump = useCallback(() => {
    if (typeof sessionStorage === "undefined") return;
    const next = read() + 1;
    sessionStorage.setItem(key, String(next));
    setCount(next);
  }, [key]);
  return { isFirst: count < n, bump };
}
```

- [ ] **Step 4: Run, verify it passes**

Run: `pnpm exec vitest run tests/unit/hooks/useFirstNVisits.test.ts`
Expected: PASS, 1/1 green.

- [ ] **Step 5: Commit**

```bash
git add hooks/useFirstNVisits.ts tests/unit/hooks/useFirstNVisits.test.ts
git commit -m "feat(phase-4): add useFirstNVisits hook"
```

(Steps for `useCursor` removed per 2026-04-26 amendment.)

---

### Task 5: Wire Next 15 View Transitions API config

**Why:** Phase 0 left `<RouteTransition>` as a passthrough. Before we wire the shader, the View Transitions trigger has to be available. Use the API surface verified in Task 1.

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Open next.config.ts and inspect current shape**

Run: `pnpm exec cat next.config.ts` (or open in editor).
Note the existing structure.

- [ ] **Step 2: Enable View Transitions per the API surface verified in Task 1**

If Task 1 confirmed the `experimental.viewTransitions` config flag is the supported route, modify `next.config.ts` so the exported config includes:
```ts
const nextConfig = {
  // ...existing config...
  experimental: {
    viewTransitions: true,
  },
};
```

If Task 1 confirmed a different surface (e.g., `unstable_ViewTransition` import that doesn't need a config flag), skip the config change and note the surface in `lib/transitions.ts`'s top-of-file comment for future readers.

- [ ] **Step 3: Verify dev server boots without errors**

Run: `pnpm dev`
Expected: server starts, `http://localhost:3000` renders the existing Phase 1–3 home without errors. No new warnings about View Transitions in the console (a warning that the feature is experimental is fine and expected).
Stop server.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(phase-4): enable next 15 view transitions api"
```

---

### Task 6: Add custom paper-physics easing token

**Why:** Spec §7.2 calls out a "custom paper-physics curve" as a separate easing from the default `cubic-bezier(0.16, 1, 0.3, 1)`. Define it once as a token so the shader's timing curve and any CSS fallback share one source of truth.

**Files:**
- Modify: `styles/tokens.css`

- [ ] **Step 1: Append the easing variable inside :root**

Open `styles/tokens.css`. Inside the existing `:root` block, after the existing motion variables (after `--dur-page: 720ms;`), append:
```css
  /* Custom paper-physics curve for page-tear transition (spec §7.2) */
  --ease-paper-tear: cubic-bezier(0.7, 0.0, 0.2, 1);
```

This curve is "linger then snap" — slow start (paper resisting the tear), then a fast release. Tunable during shader visual polish in Tasks 7–13; the value here is the v1 starting point.

- [ ] **Step 2: Commit**

```bash
git add styles/tokens.css
git commit -m "feat(phase-4): add --ease-paper-tear token (paper-physics curve)"
```

---

### Task 7: Page-tear shader iteration 1 — simple displacement

**Why:** Start with the smallest shader that compiles and runs. No noise, no curl, no texture snapshotting yet — just a full-screen quad that uniformly displaces along Y based on a `uTime` uniform. This gates "the shader pipeline is wired correctly" before we add visual complexity.

**Files:**
- Create: `components/canvas/shaders/page-tear.glsl`, `components/canvas/PageTearShader.tsx`

- [ ] **Step 1: Create the shader file**

Create `components/canvas/shaders/page-tear.glsl`:
```glsl
// page-tear.glsl — iteration 1: uniform Y displacement.
// Will grow in subsequent tasks: noise mask, curl, timing curve, texture sample.

// VERTEX
varying vec2 vUv;
uniform float uTime;
uniform float uProgress; // 0 = start, 1 = end of tear

void mainVertex() {
  vUv = uv;
  vec3 displaced = position;
  // iteration 1: linear pull-down on Y as uProgress advances
  displaced.y -= uProgress * 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
}

// FRAGMENT
varying vec2 vUv;
uniform vec3 uPaperColor;
uniform float uProgress;

void mainFragment() {
  // iteration 1: solid paper color, fading out as progress approaches 1
  float alpha = 1.0 - uProgress;
  gl_FragColor = vec4(uPaperColor, alpha);
}
```

For three.js compatibility, the actual three.js `ShaderMaterial` expects `void main()` — split this file into vertex and fragment strings inside the React component (Step 2). The single-file format above is for readability + diff-ability across iterations.

- [ ] **Step 2: Build the R3F component**

Create `components/canvas/PageTearShader.tsx`:
```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { ShaderMaterial, Color } from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uProgress;
  void main() {
    vUv = uv;
    vec3 displaced = position;
    displaced.y -= uProgress * 0.5;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uPaperColor;
  uniform float uProgress;
  void main() {
    float alpha = 1.0 - uProgress;
    gl_FragColor = vec4(uPaperColor, alpha);
  }
`;

type Props = {
  /** 0..1 — driven by RouteTransition over ~700ms. */
  progress: number;
};

export function PageTearShader({ progress }: Props) {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uPaperColor: { value: new Color("#ECE6D6") },
    }),
    []
  );
  useFrame(({ clock }) => {
    if (!matRef.current) return;
    matRef.current.uniforms.uTime.value = clock.elapsedTime;
    matRef.current.uniforms.uProgress.value = progress;
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2, 64, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
      />
    </mesh>
  );
}
```

- [ ] **Step 3: Manual smoke test in a scratch route**

Temporarily edit `app/page.tsx` to mount `<Canvas><PageTearShader progress={0.5} /></Canvas>` (under a feature flag — wrap in `process.env.NEXT_PUBLIC_DEV_SHADER === "1"`). Run:
```bash
NEXT_PUBLIC_DEV_SHADER=1 pnpm dev
```

Open `http://localhost:3000`. Expected: the home renders behind a translucent cream rectangle (the shader at uProgress=0.5). Open DevTools → Performance → record 5s, look at FPS counter — should be a flat 60.

- [ ] **Step 4: Safari/iOS verify (mandatory per spec §13.1)**

Open `http://localhost:3000` in Safari (desktop). Same expected output. If you have an iPhone/iPad available on the same network, also load the LAN URL on real iOS Safari (not virtualized webkit — virtualized webkit does not always reproduce real iOS GPU bugs).

If shader fails to compile on Safari (look for "WebGL: INVALID_OPERATION" in the JS console), simplify until it compiles. Document the failure mode in a comment in `PageTearShader.tsx`.

- [ ] **Step 5: Revert the scratch mount**

Remove the temporary `<Canvas>` mount from `app/page.tsx` — the shader should not be on home; it'll be triggered by `<RouteTransition>` later. Leave the feature flag untouched (it does nothing without the mount, and we may reuse it for visual debugging in subsequent shader tasks).

- [ ] **Step 6: Commit**

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-tear shader iteration 1 (uniform Y displacement)"
```

---

### Task 8: Page-tear shader iteration 2 — paper-tear noise mask

**Why:** Iteration 1 displaces uniformly. Real paper tears along an irregular line. Add a noise function (simplex or value noise inline in the shader) that gates *which* fragments tear at each progress value, so the tear line advances jaggedly across the surface.

**Files:**
- Modify: `components/canvas/PageTearShader.tsx`, `components/canvas/shaders/page-tear.glsl`

- [ ] **Step 1: Add a 2D noise function to the fragment shader**

Replace the `FRAG` string in `components/canvas/PageTearShader.tsx` with:
```ts
const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform vec3 uPaperColor;
  uniform float uProgress;

  // Hash-based 2D value noise (cheap, ok-quality, runs fast on iOS)
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0,0)), hash(i + vec2(1,0)), u.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x),
      u.y
    );
  }

  void main() {
    // tear front advances from top (vUv.y=1) to bottom (vUv.y=0) as progress goes 0→1.
    // noise wobble adds ±0.08 to the front per-x.
    float wobble = (noise(vec2(vUv.x * 8.0, 0.0)) - 0.5) * 0.16;
    float tearFront = 1.0 - uProgress + wobble;
    if (vUv.y > tearFront) discard;
    float fade = smoothstep(tearFront - 0.05, tearFront, vUv.y);
    gl_FragColor = vec4(uPaperColor, 1.0 - fade);
  }
`;
```

Mirror the same change into `components/canvas/shaders/page-tear.glsl` so the standalone file stays in sync as the canonical source.

- [ ] **Step 2: Re-mount in the dev-flag scratch route**

Same scratch-mount as Task 7 Step 3. Set `progress={0.5}`. Visually verify the tear line is jagged, not straight. Step the progress through `0`, `0.25`, `0.5`, `0.75`, `1.0` (manually edit the prop) — the tear should advance from top to bottom with the same noise pattern at each step (because noise is keyed off vUv.x, not time).

Acceptance: tear line looks irregular like a real paper edge, not straight, not so noisy it looks like static.

- [ ] **Step 3: 60fps check on M1 + Safari verify**

Same Performance recording as Task 7. FPS still flat at 60. Safari (desktop + real iOS if available) — same output, no shader compile errors.

If Safari fails: try replacing `discard` with `if (vUv.y > tearFront) { gl_FragColor = vec4(0); return; }` — older iOS Safari has buggy `discard` paths. If still fails, document and consider whether this is the moment to invoke the bailout (Task 30) — but unlikely this early.

- [ ] **Step 4: Revert the scratch mount, commit**

Remove the temporary mount from `app/page.tsx`.

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-tear iteration 2 (noise-masked tear front)"
```

---

### Task 9: Page-tear shader iteration 3 — curl displacement

**Why:** Real paper doesn't just disappear; it curls upward at the tear edge. Add a vertex-shader displacement so vertices near the tear front curl forward (toward camera) and slightly upward.

**Files:**
- Modify: `components/canvas/PageTearShader.tsx`, `components/canvas/shaders/page-tear.glsl`

- [ ] **Step 1: Replace the VERT string**

Replace `VERT` in `components/canvas/PageTearShader.tsx` with:
```ts
const VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uProgress;

  // Same hash/noise as fragment, duplicated for vertex use (no shared GLSL imports in three.js core).
  float hashV(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noiseV(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    return mix(mix(hashV(i+vec2(0,0)), hashV(i+vec2(1,0)), u.x),
               mix(hashV(i+vec2(0,1)), hashV(i+vec2(1,1)), u.x), u.y);
  }

  void main() {
    vUv = uv;
    vec3 displaced = position;

    // Same tear front as fragment shader.
    float wobble = (noiseV(vec2(uv.x * 8.0, 0.0)) - 0.5) * 0.16;
    float tearFront = 1.0 - uProgress + wobble;

    // Curl: vertices within ±0.1 of the tear front get pulled forward in Z and up in Y.
    float dist = abs(uv.y - tearFront);
    float curlAmount = smoothstep(0.1, 0.0, dist) * uProgress;
    displaced.z += curlAmount * 0.3;
    displaced.y += curlAmount * 0.05;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;
```

Mirror into `components/canvas/shaders/page-tear.glsl`.

- [ ] **Step 2: Bump plane segment count**

For curl displacement to look smooth, the plane needs more segments. In `<planeGeometry args={[2, 2, 64, 64]} />`, change to `args={[2, 2, 128, 128]}`. (128 is the upper bound for cheap M1 perf; do not raise without re-profiling.)

- [ ] **Step 3: Visual + perf + Safari verify**

Scratch-mount with `progress={0.5}`. Acceptance:
- Visible curl at the tear edge, not flat
- Curl looks like paper curling, not like a wave or generic ripple
- FPS still 60 on M1 + Pixel 6a (if accessible — otherwise document as deferred to real-device verify in Phase 5)
- Safari desktop + real iOS Safari both render without errors

If perf drops below 60 on M1: drop plane segment count to 96, retest. If still slow, accept 96 — the curl will be slightly less smooth but visually still paper-like.

- [ ] **Step 4: Revert scratch mount, commit**

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-tear iteration 3 (curl displacement at tear edge)"
```

---

### Task 10: Page-tear shader iteration 4 — texture sampling (DOM snapshot)

**Why:** Iterations 1–3 use a solid paper color. Real page-tear samples the outgoing route's pixels and tears *those*. Add a `uTexture` uniform fed by `html-to-image`'s output (a `<canvas>` rendered from the outgoing DOM).

**Files:**
- Modify: `components/canvas/PageTearShader.tsx`, `components/canvas/shaders/page-tear.glsl`

- [ ] **Step 1: Add uTexture uniform + sample in fragment**

Modify the `FRAG` string — replace the body's `gl_FragColor` line with:
```glsl
  vec4 sample = texture2D(uTexture, vUv);
  gl_FragColor = vec4(sample.rgb, sample.a * (1.0 - fade));
```

Add to the uniforms list in the component:
```ts
uTexture: { value: null as Texture | null },
```

Add `Texture` to the `three` import. Update the component props to accept `texture: Texture | null`:
```ts
type Props = {
  progress: number;
  texture: Texture | null;
};
```

And in the component body, before the `useFrame`, set `uniforms.uTexture.value = texture` on every render via a `useEffect` keyed on `texture`.

Mirror the fragment change into `components/canvas/shaders/page-tear.glsl`.

- [ ] **Step 2: Build a texture-from-DOM helper inline (will move to RouteTransition next task)**

In the scratch-mount on `app/page.tsx`, before mounting `<Canvas>`, snapshot a target DOM element to a texture:
```tsx
"use client";
import { toCanvas } from "html-to-image";
import { CanvasTexture } from "three";
import { useEffect, useState } from "react";

// inside Home component (under the dev flag):
const [tex, setTex] = useState<CanvasTexture | null>(null);
useEffect(() => {
  const target = document.querySelector("main");
  if (!target) return;
  toCanvas(target as HTMLElement).then((c) => {
    const t = new CanvasTexture(c);
    t.needsUpdate = true;
    setTex(t);
  });
}, []);
// ...then: <Canvas><PageTearShader progress={0.5} texture={tex} /></Canvas>
```

- [ ] **Step 3: Visual + Safari verify**

Acceptance:
- The shader now tears the actual home-page pixels (you should see "Coconut Labs" wordmark behind the tear front)
- Curl at tear edge still visible
- 60fps on M1
- Safari desktop loads without errors
- Real iOS Safari: this is the highest-risk step for iOS — `html-to-image` uses SVG `<foreignObject>` which has historically been buggy on iOS Safari. If iOS fails to snapshot (texture stays blank / shows fallback color), note the failure and try `html2canvas` as an alternative in a follow-up commit. If both fail on iOS, this is a strong signal to invoke the bailout (Task 30).

- [ ] **Step 4: Revert scratch mount, commit**

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-tear iteration 4 (sample dom-snapshot texture)"
```

---

### Task 11: Page-tear shader iteration 5 — paper-physics timing curve

**Why:** Iterations 1–4 drive `progress` linearly from the consumer. Real paper tears with a "linger then snap" timing — slow start, fast finish. Use the `--ease-paper-tear` curve from Task 6 to remap incoming linear progress to an eased value before driving the shader.

**Files:**
- Modify: `components/canvas/PageTearShader.tsx`

- [ ] **Step 1: Add the ease function**

In `components/canvas/PageTearShader.tsx`, add a top-level helper:
```ts
/** Cubic-bezier(0.7, 0, 0.2, 1) evaluator — matches --ease-paper-tear in tokens.css. */
function easePaperTear(t: number): number {
  // Closed-form approximation; for shader timing we don't need the analytic bezier solver.
  // This is a hand-tuned 5th-order polynomial that matches cubic-bezier(0.7, 0, 0.2, 1) within ~2% over [0,1].
  const tc = Math.max(0, Math.min(1, t));
  return tc * tc * (3 - 2 * tc) * (1 - 0.3 * (1 - tc) * (1 - tc));
}
```

(For production-grade exactness, swap to a real cubic-bezier solver later — `bezier-easing` package on npm. v1 polynomial fit is good enough to validate the visual.)

- [ ] **Step 2: Apply the ease before passing progress to the uniform**

In the `useFrame` callback, change:
```ts
matRef.current.uniforms.uProgress.value = progress;
```
to:
```ts
matRef.current.uniforms.uProgress.value = easePaperTear(progress);
```

- [ ] **Step 3: Visual verify with progress driven by clock**

In the scratch mount, replace the static `progress={0.5}` with a clock-driven value cycling 0→1 over 700ms:
```tsx
const [p, setP] = useState(0);
useEffect(() => {
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    setP(Math.min(1, (now - start) / 700));
    if (now - start < 700) frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}, []);
// ...then <PageTearShader progress={p} texture={tex} />
```

Acceptance:
- The tear hesitates at the start (~150ms of slow buildup) then snaps through quickly — feels like paper resisting then giving way
- 700ms total feels right (not too fast, not draggy)
- 60fps M1 + Safari OK

If the curve feels wrong, tune the `easePaperTear` polynomial coefficients or change the underlying cubic-bezier values. The token in `styles/tokens.css` is the canonical source — keep that in sync.

- [ ] **Step 4: Revert scratch mount, commit**

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-tear iteration 5 (paper-physics timing curve)"
```

---

### Task 12: Page-fold shader (lighter secondary)

**Why:** Spec §7.3 says transitions 3+ in a session degrade to a faster `page-fold` (~350ms, lighter shader, avoids fatigue). Build a sibling shader that's structurally similar but cheaper: no curl, no noise, just a single fold-line that sweeps across diagonally with a slight perspective skew.

**Files:**
- Create: `components/canvas/shaders/page-fold.glsl`, `components/canvas/PageFoldShader.tsx`

- [ ] **Step 1: Create the page-fold component**

Create `components/canvas/PageFoldShader.tsx`:
```tsx
"use client";

import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { ShaderMaterial, Texture } from "three";

const VERT = /* glsl */ `
  varying vec2 vUv;
  uniform float uProgress;
  void main() {
    vUv = uv;
    vec3 displaced = position;
    // diagonal fold line at uv.x + uv.y == (1 - uProgress) * 2
    float foldLine = (1.0 - uProgress) * 2.0;
    float side = step(foldLine, uv.x + uv.y);
    displaced.z += side * uProgress * 0.15;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`;

const FRAG = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform float uProgress;
  void main() {
    vec4 sample = texture2D(uTexture, vUv);
    float foldLine = (1.0 - uProgress) * 2.0;
    float side = step(foldLine, vUv.x + vUv.y);
    float alpha = sample.a * (1.0 - side * uProgress);
    gl_FragColor = vec4(sample.rgb, alpha);
  }
`;

type Props = { progress: number; texture: Texture | null };

export function PageFoldShader({ progress, texture }: Props) {
  const matRef = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uProgress: { value: 0 }, uTexture: { value: null as Texture | null } }),
    []
  );
  useEffect(() => {
    if (matRef.current) matRef.current.uniforms.uTexture.value = texture;
  }, [texture]);
  useFrame(() => {
    if (matRef.current) matRef.current.uniforms.uProgress.value = progress;
  });
  return (
    <mesh>
      <planeGeometry args={[2, 2, 32, 32]} />
      <shaderMaterial ref={matRef} vertexShader={VERT} fragmentShader={FRAG} uniforms={uniforms} transparent />
    </mesh>
  );
}
```

Also write `components/canvas/shaders/page-fold.glsl` with the same VERT + FRAG content for reference.

- [ ] **Step 2: Visual + perf verify (350ms cycle)**

Scratch-mount with the clock-driven progress over 350ms. Acceptance:
- A diagonal fold sweeps across, lifting one corner away
- Feels distinct from the page-tear (which goes top-to-bottom with a curl)
- Faster than page-tear (350 vs 700ms)
- 60fps M1 + Safari

- [ ] **Step 3: Revert scratch mount, commit**

```bash
git add components/canvas/
git commit -m "feat(phase-4): page-fold shader (lighter secondary, 350ms diagonal)"
```

---

### Task 13: Wire RouteTransition — Next 15 VT + shader trigger + first-time-only

**Why:** This is where everything from Tasks 1–12 plugs together. `<RouteTransition>` becomes a real client component that intercepts navigation, calls `pickTransition()`, snapshots the outgoing DOM, and runs the right shader.

**Files:**
- Modify: `components/shell/RouteTransition.tsx`

- [ ] **Step 1: Replace the stub with the orchestrator**

Replace `components/shell/RouteTransition.tsx` contents with:
```tsx
"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { toCanvas } from "html-to-image";
import { CanvasTexture, type Texture } from "three";
import { pickTransition, recordTransition, type TransitionKind } from "@/lib/transitions";
import { PageTearShader } from "@/components/canvas/PageTearShader";
import { PageFoldShader } from "@/components/canvas/PageFoldShader";

const DURATIONS: Record<TransitionKind, number> = {
  "page-tear": 700,
  "page-fold": 350,
  "cross-fade": 180,
};

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const [overlay, setOverlay] = useState<{ kind: TransitionKind; texture: Texture | null; startedAt: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;

    const kind = pickTransition();
    const fire = async () => {
      let texture: Texture | null = null;
      if (kind !== "cross-fade" && mainRef.current) {
        try {
          const c = await toCanvas(mainRef.current);
          texture = new CanvasTexture(c);
          texture.needsUpdate = true;
        } catch {
          // Snapshot failed (commonly iOS Safari + foreignObject). Degrade to cross-fade.
          texture = null;
        }
      }
      const startedAt = performance.now();
      setOverlay({ kind: texture ? kind : "cross-fade", texture, startedAt });
      const duration = DURATIONS[texture ? kind : "cross-fade"];
      let frame = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - startedAt) / duration);
        setProgress(t);
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          setOverlay(null);
          setProgress(0);
          recordTransition();
          texture?.dispose();
        }
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    };
    void fire();
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <>
      <div ref={mainRef}>{children}</div>
      {overlay && overlay.kind !== "cross-fade" && overlay.texture && (
        <div
          style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }}
          aria-hidden
        >
          <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
            {overlay.kind === "page-tear" ? (
              <PageTearShader progress={progress} texture={overlay.texture} />
            ) : (
              <PageFoldShader progress={progress} texture={overlay.texture} />
            )}
          </Canvas>
        </div>
      )}
      {overlay && overlay.kind === "cross-fade" && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--bg-0)",
            opacity: 1 - progress,
            pointerEvents: "none",
            zIndex: 60,
            transition: "opacity 180ms linear",
          }}
          aria-hidden
        />
      )}
    </>
  );
}
```

Note the `aria-hidden` on the overlay — it must not be in the a11y tree (the underlying main is the source of truth for screen readers).

- [ ] **Step 2: Manually verify navigation across the site**

Run: `pnpm dev`. Click between `/`, `/research`, `/about`, `/work`. Acceptance:
- First 2 transitions of the session run the page-tear shader (top-to-bottom, curled, ~700ms)
- 3rd transition onward runs the page-fold (diagonal, ~350ms)
- Refresh the page → counter resets via sessionStorage being per-tab
- Toggle DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, then navigate → instant 180ms cross-fade only, no shader

If clicking a nav link causes a flash of unstyled content or the shader appears to lag the navigation, adjust: the snapshot should happen *before* setting overlay; the navigation may have already swapped the DOM by the time `toCanvas` runs. If that's the case, capture the snapshot synchronously at the start of the `pathname`-changed effect and stash it before letting React commit the new children.

- [ ] **Step 3: Safari/iOS verify (mandatory)**

Repeat Step 2 in Safari desktop + real iOS Safari if available. Most likely iOS-specific issue: `html-to-image` snapshotting fails silently and the cross-fade fallback fires every time. That's an acceptable degradation but worth noting in a code comment.

- [ ] **Step 4: Commit**

```bash
git add components/shell/RouteTransition.tsx
git commit -m "feat(phase-4): wire RouteTransition with view transitions + shader trigger"
```

---

### Task 14: ~~Build CursorLayer full implementation~~ — REMOVED (2026-04-26 amendment)

This task is intentionally removed. The site uses the system cursor everywhere. Skip this task entirely; do not create `components/shell/CursorLayer.tsx`. Proceed to Task 15.

---

### Task 15: SplitText edge-case polish

**Why:** Phase 1 shipped `SplitText` for hero typography. Edge cases need handling: leading/trailing whitespace, accented characters (Latin-Ext), RTL languages, and full prefers-reduced-motion respect (skip animation entirely, no zero-duration tween).

**Files:**
- Modify: `components/primitives/SplitText.tsx`, `tests/unit/primitives/SplitText.test.tsx`

- [ ] **Step 1: Extend the existing test file**

Open `tests/unit/primitives/SplitText.test.tsx`. Append (do not delete existing tests):
```tsx
describe("SplitText edge cases", () => {
  it("preserves whitespace around words", () => {
    const { container } = render(<SplitText>{"  hello  world  "}</SplitText>);
    expect(container.textContent).toBe("  hello  world  ");
  });

  it("handles accented characters as single graphemes", () => {
    const { container } = render(<SplitText>{"café à la carte"}</SplitText>);
    // Each accented character should remain a single span, not split into base + combining mark.
    const spans = container.querySelectorAll("[data-split-char]");
    const chars = Array.from(spans).map((s) => s.textContent);
    expect(chars).toContain("é");
    expect(chars).toContain("à");
  });

  it("does not animate when prefers-reduced-motion: reduce", () => {
    vi.stubGlobal("matchMedia", (q: string) => ({
      matches: q.includes("reduce"),
      addEventListener: () => {},
      removeEventListener: () => {},
    }));
    const { container } = render(<SplitText>{"hello"}</SplitText>);
    const spans = container.querySelectorAll("[data-split-char]");
    spans.forEach((s) => {
      expect((s as HTMLElement).style.opacity).toBe("");
    });
  });

  it("respects dir='rtl' on the wrapping element", () => {
    const { container } = render(
      <div dir="rtl">
        <SplitText>{"שלום"}</SplitText>
      </div>
    );
    // Don't reverse the chars ourselves — the browser handles RTL via dir inheritance.
    expect(container.textContent).toBe("שלום");
  });
});
```

- [ ] **Step 2: Run, see which fail**

Run: `pnpm exec vitest run tests/unit/primitives/SplitText.test.tsx`
Expected: existing Phase 1 tests pass, new tests fail. Note which specific failures appear.

- [ ] **Step 3: Update the implementation**

Open `components/primitives/SplitText.tsx`. Apply the minimal changes to make the new tests pass:
- For grapheme handling: use `Intl.Segmenter` (`new Intl.Segmenter(undefined, { granularity: "grapheme" })`) to iterate characters instead of `text.split("")`. This treats `é` as one grapheme even when stored as base + combining mark in NFD.
- For whitespace preservation: render whitespace runs as-is in their own spans with `white-space: pre`.
- For reduced-motion: at the top of the component, read `window.matchMedia("(prefers-reduced-motion: reduce)").matches`; if true, render plain text without any animation styling or `data-split-char` decoration on opacity/transform.
- For RTL: do not reverse arrays; rely on the browser. Add a top-of-file comment noting this.

Mark each split character span with `data-split-char` attribute (already used by the test).

- [ ] **Step 4: Run, all green**

Run: `pnpm exec vitest run tests/unit/primitives/SplitText.test.tsx`
Expected: PASS for old + new tests.

- [ ] **Step 5: Visually verify the home hero still animates correctly**

Run: `pnpm dev`. Open `/`. Hero typography should still split + reveal. Toggle reduced-motion → text appears instantly with no animation.

- [ ] **Step 6: Commit**

```bash
git add components/primitives/SplitText.tsx tests/unit/primitives/SplitText.test.tsx
git commit -m "feat(phase-4): SplitText edge cases (graphemes, whitespace, RTL, RM)"
```

---

### Task 16: Section reveal audit across all routes

**Why:** Phase 1–3 wired RevealUp + ThinRule on the home + research posts. Now apply consistently across `/about`, `/work`, `/papers`, `/podcasts`, `/joinus`, `/contact`, `/colophon`, `/projects/*`. No new components — just wrap section blocks.

**Files:**
- Modify: any `app/**/page.tsx` that renders sections without `<RevealUp>` or `<ThinRule>` between them

- [ ] **Step 1: Inventory which routes already have reveal motion**

Run: `grep -rn "RevealUp\|ThinRule" app/ components/`
Expected: a list of every file using these primitives. Note which `app/**/page.tsx` files do NOT appear in the output.

- [ ] **Step 2: Wrap each missing route's section blocks**

For each missing page (likely `/about`, `/work`, `/papers`, `/podcasts`, `/joinus`, `/contact`, `/colophon`, `/projects/kvwarden`, `/projects/weft`):
- Wrap each top-level section with `<RevealUp>...</RevealUp>`
- Insert `<ThinRule />` between sibling sections that share the same heading hierarchy
- Do not over-apply — avoid wrapping the page header (it's already animated via the route transition)

- [ ] **Step 3: Visual walkthrough**

Run: `pnpm dev`. Visit each route in turn. Acceptance:
- Sections fade up + ease in as they enter viewport (Framer Motion `whileInView`)
- ThinRule dividers draw themselves on viewport entry
- No section is jarring — the choreography feels consistent across routes

- [ ] **Step 4: Reduced-motion verify**

Toggle reduced-motion in DevTools, walk through the same routes. All animations should be near-instant; no lengthy fade-ups, no rule drawing.

- [ ] **Step 5: Commit**

```bash
git add app/
git commit -m "feat(phase-4): apply RevealUp + ThinRule across all inner routes"
```

---

### Task 17: Build lib/github.ts (mocked-fetch TDD)

**Files:**
- Create: `lib/github.ts`, `tests/unit/lib/github.test.ts`

- [ ] **Step 1: Write the test first**

Create `tests/unit/lib/github.test.ts`:
```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { getRepoSignals, type RepoSignals } from "@/lib/github";

const FIXTURE_REPOS = [
  { name: "kvwarden", pushed_at: "2026-04-23T10:00:00Z", open_issues_count: 3 },
  { name: "weft", pushed_at: "2026-04-21T08:00:00Z", open_issues_count: 1 },
];

const FIXTURE_COMMITS = Array.from({ length: 14 }, (_, i) => ({
  sha: `sha${i}`,
  commit: { author: { date: "2026-04-22T10:00:00Z" } },
}));

describe("getRepoSignals", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.GITHUB_PAT = "test-token";
  });

  it("aggregates org repos + recent commits + open issues", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/orgs/coconut-labs/repos")) {
        return new Response(JSON.stringify(FIXTURE_REPOS), { status: 200 });
      }
      if (url.includes("/commits")) {
        return new Response(JSON.stringify(FIXTURE_COMMITS), { status: 200 });
      }
      return new Response("[]", { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const signals: RepoSignals = await getRepoSignals();
    expect(signals.commitsThisWeek).toBeGreaterThan(0);
    expect(signals.openIssues).toBe(4); // 3 + 1
    expect(signals.lastUpdated).toBeInstanceOf(Date);
  });

  it("requests with ISR revalidate=3600", async () => {
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await getRepoSignals();
    const calls = fetchMock.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [, init] = calls[0]!;
    expect((init as RequestInit & { next?: { revalidate?: number } })?.next?.revalidate).toBe(3600);
  });

  it("includes Authorization header when GITHUB_PAT is set", async () => {
    const fetchMock = vi.fn(async () => new Response("[]", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    await getRepoSignals();
    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("returns a graceful fallback shape when fetch fails", async () => {
    vi.stubGlobal("fetch", async () => { throw new Error("network down"); });
    const signals = await getRepoSignals();
    expect(signals.commitsThisWeek).toBe(0);
    expect(signals.openIssues).toBe(0);
    expect(signals.lastUpdated).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/github.test.ts`
Expected: FAIL with "Cannot find module '@/lib/github'".

- [ ] **Step 3: Implement lib/github.ts**

Create `lib/github.ts`:
```ts
const ORG = "coconut-labs";
const API = "https://api.github.com";

export type RepoSignals = {
  /** Total commits across org repos in the last 7 days. */
  commitsThisWeek: number;
  /** Total open issues across org repos. */
  openIssues: number;
  /** Most recent push timestamp across all org repos. */
  lastUpdated: Date;
  /** Number of repos returned (used for "papers in progress" proxy if needed). */
  repoCount: number;
};

type Repo = { name: string; pushed_at: string; open_issues_count: number };
type Commit = { sha: string; commit: { author: { date: string } } };

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_PAT;
  return token ? { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } : { Accept: "application/vnd.github+json" };
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    headers: authHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status} on ${path}`);
  return (await res.json()) as T;
}

export async function getRepoSignals(): Promise<RepoSignals> {
  try {
    const repos = await gh<Repo[]>(`/orgs/${ORG}/repos?per_page=100&sort=pushed`);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const commitCounts = await Promise.all(
      repos.map((r) =>
        gh<Commit[]>(`/repos/${ORG}/${r.name}/commits?since=${since}&per_page=100`).catch(() => [])
      )
    );
    const commitsThisWeek = commitCounts.reduce((acc, list) => acc + list.length, 0);
    const openIssues = repos.reduce((acc, r) => acc + r.open_issues_count, 0);
    const lastUpdated = repos.reduce<Date>(
      (acc, r) => {
        const d = new Date(r.pushed_at);
        return d > acc ? d : acc;
      },
      new Date(0)
    );
    return { commitsThisWeek, openIssues, lastUpdated, repoCount: repos.length };
  } catch {
    return { commitsThisWeek: 0, openIssues: 0, lastUpdated: new Date(), repoCount: 0 };
  }
}
```

- [ ] **Step 4: Run, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/github.test.ts`
Expected: PASS, 4/4 green.

- [ ] **Step 5: Commit**

```bash
git add lib/github.ts tests/unit/lib/github.test.ts
git commit -m "feat(phase-4): add lib/github with ISR-cached signals fetcher"
```

---

### Task 18: Wire LiveSignalsStrip to real GitHub data

**Files:**
- Modify: `components/home/LiveSignalsStrip.tsx`, `app/page.tsx` (only if the strip needs to become async)

- [ ] **Step 1: Replace the placeholder data source**

Open `components/home/LiveSignalsStrip.tsx`. Phase 1 shipped this with hard-coded sample text. Convert it to a server component (remove any `"use client"` directive) and `await getRepoSignals()` at the top. Render the same mono row format as the spec §6.5:
```tsx
import { getRepoSignals } from "@/lib/github";

function relativeTime(d: Date): string {
  const ms = Date.now() - d.getTime();
  const h = Math.floor(ms / 3_600_000);
  if (h < 1) return "just now";
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}

export async function LiveSignalsStrip() {
  const s = await getRepoSignals();
  return (
    <div
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono)",
        color: "var(--ink-2)",
        textAlign: "center",
        padding: "var(--space-4) var(--gutter)",
        borderTop: "1px solid var(--rule)",
      }}
    >
      Updated {relativeTime(s.lastUpdated)} · {s.commitsThisWeek} commits this week · {s.repoCount} repos · {s.openIssues} open
    </div>
  );
}
```

- [ ] **Step 2: Verify home page still renders**

`app/page.tsx` is already a server component (default), so `await`-ing inside `<LiveSignalsStrip>` works without changes. If your Phase 1 implementation made the home page a client component, refactor: split the home into a server-shell that mounts client child components for any animated sections.

Run: `pnpm dev`. Open `/`. The strip near the footer should now read real data: e.g. `Updated 2h ago · 14 commits this week · 5 repos · 3 open`.

If `GITHUB_PAT` isn't set locally, the fetcher will hit the unauthenticated rate limit — the strip will either show real data (if rate budget remains) or the fallback shape (`Updated just now · 0 commits this week · 0 repos · 0 open`). Either is acceptable for local dev. Production gets the PAT in Task 22.

- [ ] **Step 3: Commit**

```bash
git add components/home/LiveSignalsStrip.tsx app/page.tsx
git commit -m "feat(phase-4): wire LiveSignalsStrip to real github data"
```

---

### Task 19: Build PaperTear404 component

**Why:** Spec §5.10 says the 404 is "a torn-out paper page with an animated tear effect on first paint." Reuse the page-tear shader machinery — but as a single-page tear played once on mount, not as a route transition.

**Files:**
- Create: `components/canvas/PaperTear404.tsx`

- [ ] **Step 1: Implement the component**

Create `components/canvas/PaperTear404.tsx`:
```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { CanvasTexture, type Texture } from "three";
import { toCanvas } from "html-to-image";
import { PageTearShader } from "./PageTearShader";

/**
 * Plays a one-shot paper-tear over its children on first mount.
 * Used by /404 — the static page text is "torn" away to reveal itself
 * (a small bit of in-character drama, then settles).
 */
export function PaperTear404({ children }: { children: React.ReactNode }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [overlay, setOverlay] = useState<{ texture: Texture; progress: number } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!wrapRef.current) return;

    let cancelled = false;
    void (async () => {
      try {
        const c = await toCanvas(wrapRef.current!);
        if (cancelled) return;
        const tex = new CanvasTexture(c);
        tex.needsUpdate = true;
        const start = performance.now();
        const tick = (now: number) => {
          if (cancelled) return;
          const t = Math.min(1, (now - start) / 700);
          setOverlay({ texture: tex, progress: t });
          if (t < 1) requestAnimationFrame(tick);
          else {
            setOverlay(null);
            tex.dispose();
          }
        };
        requestAnimationFrame(tick);
      } catch {
        // Snapshot failed (iOS Safari foreignObject) — silently skip the effect.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <div ref={wrapRef}>{children}</div>
      {overlay && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }} aria-hidden>
          <Canvas orthographic camera={{ position: [0, 0, 1], zoom: 1 }}>
            <PageTearShader progress={overlay.progress} texture={overlay.texture} />
          </Canvas>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Manual verify (will integrate into not-found.tsx in Task 20)**

This task only builds the component. Visual verification happens in Task 20 once it's wired into `app/not-found.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/PaperTear404.tsx
git commit -m "feat(phase-4): add PaperTear404 one-shot tear component"
```

---

### Task 20: Integrate PaperTear404 into not-found.tsx

**Files:**
- Modify: `app/not-found.tsx`

- [ ] **Step 1: Wrap the existing 404 content**

Open `app/not-found.tsx` (Phase 0 created the basic version). Wrap the existing `<section>...</section>` body with `<PaperTear404>` while preserving the existing markup verbatim:
```tsx
import Link from "next/link";
import { PaperTear404 } from "@/components/canvas/PaperTear404";

export default function NotFound() {
  return (
    <PaperTear404>
      <section style={{ /* unchanged */ }}>
        {/* unchanged: h1 "404", mono caption, back link */}
      </section>
    </PaperTear404>
  );
}
```

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`. Visit `http://localhost:3000/this-route-does-not-exist`. Acceptance:
- The 404 page renders normally
- On first paint, a paper-tear effect plays once over the page (~700ms), then settles into the static layout
- Refreshing replays the effect (no sessionStorage gate — every visit gets the tear)
- Toggle reduced-motion → the tear is skipped, the page renders statically

- [ ] **Step 3: Safari + iOS verify**

Same as prior shader tasks. iOS may skip the effect (snapshot fails); the page should still render correctly.

- [ ] **Step 4: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat(phase-4): integrate PaperTear404 into /not-found"
```

---

### Task 21: Add e2e test for route transitions

**Files:**
- Create: `tests/e2e/transitions.spec.ts`

- [ ] **Step 1: Write the e2e test**

Create `tests/e2e/transitions.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("route transitions", () => {
  test("navigating between routes does not break the page", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /research/i }).first().click();
    await expect(page).toHaveURL(/\/research/);
    await expect(page.getByRole("main")).toBeVisible();
  });

  test("first transition increments sessionStorage counter", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).first().click();
    await expect(page).toHaveURL(/\/about/);
    // Wait for the transition to settle (700ms + buffer).
    await page.waitForTimeout(900);
    const count = await page.evaluate(() => sessionStorage.getItem("coconut.transitions.count"));
    expect(count).toBe("1");
  });

  test("counter increments to 2 after second transition", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).first().click();
    await page.waitForTimeout(900);
    await page.getByRole("link", { name: /work/i }).first().click();
    await page.waitForTimeout(900);
    const count = await page.evaluate(() => sessionStorage.getItem("coconut.transitions.count"));
    expect(count).toBe("2");
  });

  test("reduced-motion forces cross-fade fallback (no shader canvas)", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.getByRole("link", { name: /about/i }).first().click();
    // Under cross-fade, no Canvas element should mount.
    const canvasCount = await page.locator("canvas").count();
    expect(canvasCount).toBeLessThanOrEqual(1); // home may have a hero canvas; transition canvas should not appear
    await ctx.close();
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm exec playwright test tests/e2e/transitions.spec.ts --project=chromium`
Expected: 4 tests pass.

If the timing-sensitive tests are flaky (e.g., the counter hasn't been recorded yet when the assertion runs), bump the `waitForTimeout` from 900 → 1200ms. Don't introduce real waits longer than 1.5s — that signals the underlying shader is too slow.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/transitions.spec.ts
git commit -m "test(phase-4): e2e for route transitions + RM fallback + counter"
```

---

### Task 22: ~~Add e2e test for cursor layer~~ — REMOVED (2026-04-26 amendment)

This task is intentionally removed. CursorLayer is not built in Phase 4; no e2e test needed. Proceed to Task 23.

---

### Task 23: Extend e2e for 404 paper-tear

**Files:**
- Modify: `tests/e2e/infra.spec.ts` (Phase 0) or create `tests/e2e/404.spec.ts`

- [ ] **Step 1: Decide where the test lives**

If Phase 0's `tests/e2e/infra.spec.ts` already has a "404 page renders for unknown route" test, extend it inline. If you prefer a dedicated file, create `tests/e2e/404.spec.ts` with the existing 404 assertions plus the new paper-tear assertion. Avoid duplication — pick one location and keep it the canonical 404 test home.

- [ ] **Step 2: Add the paper-tear assertion**

Append (or create) the following test in the chosen file:
```ts
test("404 mounts the paper-tear canvas on first paint", async ({ page }) => {
  await page.goto("/this-route-does-not-exist");
  // The PaperTear404 component mounts a Canvas inside an aria-hidden overlay.
  // The Canvas may unmount once the 700ms tear completes — assert within the window.
  await expect(page.locator("canvas").first()).toBeAttached({ timeout: 500 });
});

test("404 paper-tear is skipped under prefers-reduced-motion", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/this-route-does-not-exist");
  await page.waitForTimeout(200);
  const canvases = await page.locator("canvas").count();
  expect(canvases).toBe(0);
  await ctx.close();
});
```

- [ ] **Step 3: Run**

Run: `pnpm exec playwright test tests/e2e/ --project=chromium --grep 404`
Expected: all 404 tests pass.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/
git commit -m "test(phase-4): extend 404 e2e with paper-tear assertions"
```

---

### Task 24: Run full test suite + visual walkthrough

**Files:** none

- [ ] **Step 1: Full suite**

Run: `pnpm test:all`
Expected: typecheck clean, all unit tests green, all e2e tests green.

If failures appear: fix them. Do not gate-skip. The Phase 4 motion code touches a lot — regressions in Phase 0–3 tests are possible, especially around `<RouteTransition>` (which now actually does something).

- [ ] **Step 2: Visual walkthrough on Chrome desktop**

Run: `pnpm dev`. Walk through:
- `/` — first-load reveal still plays once per session (Phase 1 behavior intact)
- Click into `/research` — page-tear plays (700ms, top-to-bottom, curled, paper-physics timing)
- Click into `/about` — second page-tear plays
- Click into `/work` — page-fold plays (350ms, diagonal, lighter)
- Click any further nav — page-fold continues
- Cursor: dot grows on links, becomes caret on text
- Live signals strip near footer shows real GitHub numbers
- Visit a bogus URL → 404 with paper-tear effect on first paint

- [ ] **Step 3: Visual walkthrough on Safari desktop**

Same routes. Acceptance: same visuals, same perf. Document any Safari-specific differences in a note (don't ship without acknowledging them).

- [ ] **Step 4: If real iPhone/iPad available, walkthrough on real iOS Safari**

This is a recommended auth-interrupt point per the task description — it requires the user to do the testing on a real device. If available:
- Visit `http://<your-laptop-LAN-IP>:3000` from iOS Safari on the same network
- Walk through the same routes
- Cursor should be hidden (touch pointer triggers `pointer: coarse`)
- Transitions: the snapshot may fail, in which case the page just cross-fades — that's the documented graceful degradation
- 404 paper-tear may not play; that's also the documented graceful degradation

If the real-device test reveals serious issues (page is broken, layout shifted, JS errors in Safari Web Inspector), this is a strong signal to invoke the bailout (Task 30).

- [ ] **Step 5: Commit any small fixes**

```bash
git status
# If anything is uncommitted from the verification pass, commit it.
```

---

### Task 25: Reduced-motion full audit

**Files:** none (verification only — fixes if needed land in their respective files)

- [ ] **Step 1: Toggle reduced-motion globally and walk every route**

Run: `pnpm dev`. In DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`. Walk through:
- `/` — first-load reveal should be skipped or near-instant
- All inner routes — section reveals should appear instantly
- Navigate between routes — only the cross-fade overlay should appear (no shader canvas)
- Visit `/this-route-does-not-exist` — paper-tear is skipped, 404 renders statically
- Cursor layer is gone

- [ ] **Step 2: Fix any leaked motion**

If any route still has a multi-second animation under reduced motion, find the source and gate it behind a `prefers-reduced-motion` check. Common offenders: `<motion.div>` with hard-coded duration that ignores the global media query.

- [ ] **Step 3: Commit any fixes**

```bash
git status
git add <files>
git commit -m "fix(phase-4): respect prefers-reduced-motion on <list-of-routes>"
```

(Skip the commit step if no changes were needed.)

---

### Task 26: Lighthouse perf spot-check

**Why:** Phase 5 owns the formal perf budget enforcement. Phase 4 should not regress Phase 1's perf — a quick spot-check catches obvious regressions before they pile up.

**Files:** none

- [ ] **Step 1: Build production bundle**

Run: `pnpm build && pnpm start`
Expected: build succeeds, server starts on port 3000.

- [ ] **Step 2: Run Lighthouse on home + research index + a research post**

In Chrome DevTools → Lighthouse → Performance + Best Practices, mobile preset, run on:
- `http://localhost:3000/`
- `http://localhost:3000/research`
- `http://localhost:3000/research/<a-real-slug-from-your-content>`

Acceptance: Performance ≥ 85 on each (Phase 5 raises the bar to 90+ on inner and 95 on home; Phase 4 is happy with 85 baseline).

If perf has dropped below 85 on home, the most likely cause is the shader bundle on the critical path. Check: is `<PageTearShader>` being lazily imported in `<RouteTransition>` (i.e., behind `next/dynamic`), or is it part of the root layout bundle? It should be lazy-imported.

- [ ] **Step 3: If lazy-load fix needed, apply**

Open `components/shell/RouteTransition.tsx`. Replace the static imports of `PageTearShader` + `PageFoldShader` with:
```ts
import dynamic from "next/dynamic";
const PageTearShader = dynamic(() => import("@/components/canvas/PageTearShader").then((m) => m.PageTearShader), { ssr: false });
const PageFoldShader = dynamic(() => import("@/components/canvas/PageFoldShader").then((m) => m.PageFoldShader), { ssr: false });
```

Re-run build, re-run Lighthouse. Confirm score recovers.

- [ ] **Step 4: Commit any fix**

```bash
git status
git add components/shell/RouteTransition.tsx
git commit -m "perf(phase-4): lazy-import shader components from RouteTransition"
```

(Skip if not needed.)

---

### Task 27: Run a11y axe-core sweep

**Files:** none (verification — Phase 5 owns the formal sweep)

- [ ] **Step 1: Run axe-core on home + 404 (existing Phase 0 test)**

Run: `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium`
Expected: 2 tests pass (Phase 0's home + 404 a11y test still green).

The shader overlay and cursor layer both use `aria-hidden`, so they should be invisible to axe.

- [ ] **Step 2: Manually inspect a11y tree on a route mid-transition**

In Chrome DevTools → Accessibility → Show full a11y tree, navigate between routes. The shader overlay should never appear in the tree (it has `aria-hidden`). The cursor layer should also never appear.

- [ ] **Step 3: Commit any small fixes**

If axe complains about any `aria-hidden` violation (rare — most likely if the cursor div accidentally has interactive children), fix and commit:
```bash
git add <files>
git commit -m "fix(phase-4): a11y — <description>"
```

(Skip if not needed.)

---

### Task 28: Update CI to declare GITHUB_PAT secret

**Files:**
- Modify: `.github/workflows/ci.yml`

- [ ] **Step 1: Add the env var declaration to the build step**

Open `.github/workflows/ci.yml`. The `pnpm build` step in Phase 0 set `NEXT_PUBLIC_SITE_URL`. Add `GITHUB_PAT` alongside it:
```yaml
      - run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: https://coconutlabs.org
          GITHUB_PAT: ${{ secrets.GITHUB_PAT }}
```

This declares the secret in CI; the actual value gets added via the GitHub UI in Task 31.

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci(phase-4): pass GITHUB_PAT to build step"
```

---

### Task 29: Phase 4 verification — full suite + manual + perf + Safari final pass

**Files:** none

- [ ] **Step 1: Full pipeline locally**

Run: `pnpm test:all && pnpm build`
Expected: all green, build succeeds.

- [ ] **Step 2: Visual walkthrough on Chrome + Safari desktop**

Same as Task 24 Step 2–3. Re-verify everything still works after Tasks 25–28 changes.

- [ ] **Step 3: Catalog any known issues**

Open or create `docs/superpowers/notes/phase-4-known-issues.md`. List every known issue caught during this phase (e.g., "iOS Safari: html-to-image foreignObject snapshot fails — degrades to cross-fade", "Lighthouse perf -3 vs Phase 1 baseline due to shader bundle"). Phase 5 will work through these.

- [ ] **Step 4: Decide: shader meets quality bar, or invoke bailout?**

This is the decision gate. Honestly assess:
- Does the page-tear feel like paper, not generic displacement? (Subjective — trust the visceral reaction.)
- Does it hit 60fps on M1 in Chrome and Safari?
- Does it hit 60fps on Pixel 6a (or equivalent Android) if you have one?
- Does it not break iOS Safari (graceful degradation acceptable; broken page not)?

If YES to all: skip Task 30, proceed to Task 31 (auth interrupt).

If NO to any: invoke Task 30 (the bailout).

- [ ] **Step 5: Commit**

```bash
git status
git add docs/superpowers/notes/
git commit -m "docs(phase-4): catalog known issues for phase 5 follow-up"
```

(Skip if no notes file was created.)

---

### Task 30: BAILOUT — Swap to View Transitions native + paper-texture overlay

**Why:** Per spec §13.1 and the Phase 4 risk plan: if the custom GLSL shader doesn't meet premium quality (60fps cross-platform, paper-like visual, smooth on Safari/iOS) after ~5 days of work on Tasks 7–13, swap to a simpler implementation. View Transitions API native morph + a CSS paper-texture overlay gets ~70% of the perceived quality at ~30% of the work. This task is a no-op if Task 29 Step 4 cleared the quality gate.

**Only execute this task if Task 29 Step 4 said NO.** Skip and proceed to Task 31 otherwise.

**Files:**
- Modify: `components/shell/RouteTransition.tsx`
- Create: `public/paper-texture.png` (subtle paper grain texture)
- Create: `styles/paper-texture.css`

- [ ] **Step 1: Source a paper-texture image**

Either generate a subtle paper-grain PNG (1024×1024, mostly transparent, faint warm-cream grain noise) or use a Creative Commons paper texture. Save to `public/paper-texture.png`. Keep file size under 50KB.

- [ ] **Step 2: Replace RouteTransition with the native VT + overlay version**

Replace `components/shell/RouteTransition.tsx` contents with:
```tsx
"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { pickTransition, recordTransition } from "@/lib/transitions";

/**
 * BAILOUT implementation: uses the browser's native View Transitions API
 * (document.startViewTransition) for the morph, with a CSS paper-texture
 * overlay that fades in during the transition for the "paper" feel.
 *
 * Strictly worse than the GLSL shader path but ships reliably across browsers.
 * See Task 29 in the Phase 4 plan for the decision rationale.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    if (prevPath.current === pathname) return;

    const kind = pickTransition();
    const duration = kind === "page-tear" ? 700 : kind === "page-fold" ? 350 : 180;

    const overlay = overlayRef.current;
    if (overlay && kind !== "cross-fade") {
      overlay.style.opacity = "1";
      setTimeout(() => {
        if (overlay) overlay.style.opacity = "0";
      }, duration * 0.6);
    }

    recordTransition();
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <>
      <div
        ref={overlayRef}
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url('/paper-texture.png')",
          backgroundColor: "var(--bg-1)",
          opacity: 0,
          pointerEvents: "none",
          zIndex: 60,
          transition: "opacity 350ms var(--ease-paper-tear)",
          mixBlendMode: "multiply",
        }}
      />
      {children}
    </>
  );
}
```

The native `view-transition-name` CSS would land additional polish (per-element morphs); add per-element `view-transition-name` declarations to the home hero + research post titles in a follow-up if time permits.

- [ ] **Step 3: Re-run all tests**

Run: `pnpm test:all`
Expected: existing transitions e2e (Task 21) may need adjustment — the Canvas assertions won't apply. Update the e2e to assert the overlay div appears + fades, instead of the canvas.

Specifically, update `tests/e2e/transitions.spec.ts`:
- Drop the "no shader canvas" RM assertion (RM still leads to a quiet cross-fade, but the overlay div is always present in the DOM)
- Add a "overlay opacity goes 0 → 1 → 0 during transition" assertion using `page.evaluate` to read the computed style

- [ ] **Step 4: Visual + Safari + iOS verify**

Walk through the same routes as Task 24. Acceptance: a paper-textured overlay washes across during navigation. Safari + iOS render identically (no GLSL = no Safari-specific bugs).

- [ ] **Step 5: Delete the now-unused shader files**

If the bailout is final (not a temporary investigation), remove:
- `components/canvas/PageTearShader.tsx`
- `components/canvas/PageFoldShader.tsx`
- `components/canvas/shaders/`

Keep `components/canvas/PaperTear404.tsx` only if it still works on Safari/iOS — otherwise replace with a CSS-only paper-tear stub (a static SVG mask with a CSS animation).

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(phase-4): BAILOUT — swap shader for view transitions + paper overlay"
```

Add an explanation paragraph to `docs/superpowers/notes/phase-4-known-issues.md` documenting which acceptance criteria failed and the call to bail.

---

### Task 31: AUTH INTERRUPT — GitHub PAT for live-signals

**Files:** none (user action)

- [ ] **Step 1: Ask user to generate a PAT**

Ask user:
> "Phase 4 is implementation-complete. To make the home live-signals strip read real numbers in production, I need a GitHub personal access token:
>
> 1. Go to https://github.com/settings/personal-access-tokens/new
> 2. Token name: `coconutlabs-org-build-time`
> 3. Expiration: 1 year
> 4. Repository access: 'All repositories' (or limit to coconut-labs/* if you prefer)
> 5. Scopes: `public_repo` (read) + `read:org`
> 6. Generate, copy the token
>
> Then add it to:
> - Vercel project → Settings → Environment Variables → `GITHUB_PAT` = <token>, all environments
> - GitHub repo → Settings → Secrets and variables → Actions → New secret → `GITHUB_PAT` = <token>
>
> Tell me when both are set and I'll trigger a redeploy to verify."

- [ ] **Step 2: User confirms, trigger redeploy**

Once user confirms both env vars are set:
```bash
git commit --allow-empty -m "chore(phase-4): trigger vercel redeploy for GITHUB_PAT"
git push
```

- [ ] **Step 3: Verify CI green + production live-signals strip reads real data**

```bash
gh run list --limit 1
gh run watch
```

Once CI passes, open `https://coconutlabs.org` in browser. The live-signals strip near the footer should read real numbers (e.g. `Updated 2h ago · 14 commits this week · 5 repos · 3 open`), not the fallback (`0 commits this week · 0 repos`).

If the production strip shows the fallback shape, the PAT isn't reaching the build. Check Vercel build logs for the value of `GITHUB_PAT` (should be redacted but the var should appear in the env list).

---

### Task 32: Phase 4 ship-gate verification

**Files:** none

- [ ] **Step 1: Acceptance review**

Phase 4 definition of done:
- ✅ `<RouteTransition>` is wired (either page-tear shader path or bailout VT path)
- ✅ First 2 transitions per session use the elaborate transition; 3rd+ uses the lighter one
- ✅ Reduced-motion forces instant cross-fade
- ✅ `<SplitText>` handles whitespace + accents + RTL + reduced-motion
- ✅ Section reveal choreography applied across all inner routes
- ✅ `<LiveSignalsStrip>` shows real GitHub data in production
- ✅ `/404` plays the paper-tear effect on first paint (or a graceful no-op if bailout)
- ✅ All Phase 0–3 tests still green
- ✅ New Phase 4 tests green: `lib/transitions.test.ts`, `lib/github.test.ts`, `useFirstNVisits.test.ts`, extended `SplitText.test.tsx`, `transitions.spec.ts`, extended 404 test (cursor.spec.ts not created — CursorLayer dropped per 2026-04-26 amendment)
- ✅ Lighthouse perf ≥ 85 on home + research routes (no regression beyond budget)
- ✅ Production deploy at `https://coconutlabs.org` reflects all of the above

- [ ] **Step 2: Cross-link to Phase 5**

Open `docs/superpowers/notes/phase-4-known-issues.md` (created in Task 29 or 30). Confirm everything Phase 4 deliberately deferred to Phase 5 is listed with a clear pointer:
- Lighthouse formal budget (≥ 90 every route, ≥ 95 home)
- WebGL Safari/iOS regression check (formal — Phase 4 only spot-checked)
- 404 polish (any visual refinements left over)
- Cross-browser sweep (Phase 5 owns Firefox + Chrome Android)

- [ ] **Step 3: Commit if any final notes**

```bash
git status
git add docs/superpowers/notes/
git commit -m "docs(phase-4): finalize known-issues handoff to phase 5"
```

(Skip if no changes.)

**Phase 4 is complete. Ready for Phase 5 plan.**

---

## Self-Review

Spec coverage check (Phase 4 sections of spec §13):
- ✅ Page-tear shader (custom GLSL) — Tasks 7–11
- ✅ `<RouteTransition>` wired into Next 15 View Transitions API — Tasks 5, 13
- ✅ First-time-only choreography (sessionStorage flag) — Tasks 3, 13
- ✅ Reduced-motion fallback (instant cross-fade) — Tasks 3, 13, 25
- ✅ `<SplitText>` component finalized — Task 15
- ✅ Cursor layer micro-interactions polished — Tasks 4, 14
- ✅ Section reveal choreography across all routes — Task 16
- ✅ Live-signals strip with GitHub fetch + ISR — Tasks 17–18
- ✅ In-character 404 with paper-tear effect — Tasks 19–20
- ✅ Documented bailout for shader (spec §13.1) — Task 30 with concrete code
- ✅ Page-fold lighter secondary shader (spec §7.3) — Task 12
- ✅ Custom paper-physics easing curve (spec §7.2) — Task 6

Auth-interrupt points covered (§14.1):
- ✅ GitHub PAT for `lib/github.ts` — Task 31
- ✅ Real iOS/iPad device test (recommended) — Task 24 Step 4

Risk-handling checklist:
- ✅ Shader built incrementally over 7 tasks (Tasks 7–13), each with explicit acceptance criteria, not just "compiles"
- ✅ Each shader-touching task has a Safari/iOS verify step
- ✅ Task 30 includes complete fallback code (full TSX), not "swap to fallback"
- ✅ Task 29 Step 4 is the explicit decision gate where the agent honestly assesses the shader against the quality bar
- ✅ Lazy-import gate in Task 26 catches the most likely perf regression

Placeholder scan: Task 1 (View Transitions API) explicitly defers to a verification step rather than committing to a specific symbol. Task 2 documents the html-to-image vs html2canvas decision with a concrete fallback plan. No other placeholders.

Type consistency: `TransitionKind` (lib/transitions), `RepoSignals` (lib/github), `PageTearShader` / `PageFoldShader` / `PaperTear404` (canvas components), `RouteTransition` (shell components), `SplitText` (primitives) — naming consistent. (`CursorState` / `CursorLayer` references removed per 2026-04-26 amendment.)

Test count expectations:
- Unit: 13 new tests across 4 files (transitions: 5, github: 4, useFirstNVisits: 1, SplitText extension: 4)
- E2E: 6 new tests across 2 files (transitions: 4, 404 extension: 2) — cursor.spec.ts not created per 2026-04-26 amendment
- Total Phase 4 new: 19 tests
- Combined cumulative across Phases 0–4 should still be all-green

Bailout discipline: Task 29 Step 4 + Task 30 form the explicit decision-and-execute gate. The agent is required to honestly evaluate; the bailout is a real swap, not a token gesture.

Phase 4 lands the signature motion language. Either the page-tear shader meets the quality bar (premium implementation, Tasks 7–13 + 24) or the bailout ships the same conceptual UX with native View Transitions + paper texture (Task 30). Either way, Phase 5 inherits a working route-transition story to performance-tune and cross-browser-verify.
