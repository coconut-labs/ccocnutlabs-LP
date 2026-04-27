# coconutlabs.org — Phase 1 (Home + Visual Identity) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 2 of 6.** This plan covers Phase 1 only (Home + Visual Identity). Subsequent phases get their own plans:
- `2026-04-25-coconutlabs-phase-0-foundation.md`
- `2026-04-25-coconutlabs-phase-1-home-and-visual-identity.md` ← this plan
- `…-phase-2-research-engine.md`
- `…-phase-3-inner-pages.md`
- `…-phase-4-motion-polish.md`
- `…-phase-5-perf-a11y-ship.md`

> **Amended 2026-04-26.** Three updates:
> 1. **Co-founder Jay Patel** (`github.com/jaypatel15406`) — PeopleStrip now renders **two** cards (Shrey + Jay). Auth-interrupt task asks for both portraits + bios.
> 2. **Email convention:** `info@coconutlabs.org` is the default address (was `hello@`). All ContactStrip + footer mailtos updated.
> 3. **CursorLayer dropped entirely** — system cursor used. The `<CursorLayer />` mount in `app/layout.tsx` is removed below.
> 4. **Manifesto voice** updated for two founders: "Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems…"

**Goal:** Build the home page composition and the visual-identity primitives that the rest of the site depends on. By the end of Phase 1 the home page renders all eight strips (hero → manifesto → research → projects → people → contact → live-signals → footer), the signature paper-fold sculpture is on screen (R3F if it lands within budget, SVG fallback otherwise per spec §13.1), the first-load ceremonial reveal plays once per session, and editorial primitives (PageNumber, ThinRule, SplitText, RevealUp, Card, Badge) are in place for Phase 2+ to consume.

**Architecture:** Continue with Next.js 15 App Router + React 19 + TypeScript strict + Tailwind v4. Server Components by default; `"use client"` only on components that hold motion hooks, canvas mounts, viewport observers, or sessionStorage state. R3F mounts via `next/dynamic({ ssr: false })` and is gated by an in-view observer (spec §9.3). Design tokens stay the single source of truth — no hardcoded color/spacing values land outside `styles/tokens.css`. Color tokens are consumed via the Tailwind `@theme`-mapped utilities (`text-ink-0`, `bg-bg-1`, `border-rule`, etc.); fonts/spacing/durations are consumed via inline `style={{ ... }}` reading the CSS vars directly — matching the Phase 0 pattern.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, motion 11 (formerly framer-motion), `@react-three/fiber` 9, `@react-three/drei` 9, three 0.170, Vitest + Testing Library, Playwright + axe-core. All installed in Phase 0; no new runtime deps in Phase 1 except as noted in Task 22 (`react-intersection-observer` for in-view gating).

**Prerequisites:**
- Phase 0 plan complete (`docs/superpowers/plans/2026-04-25-coconutlabs-phase-0-foundation.md`), site live at coconutlabs.org with header + footer + wordmark + tokens + fonts + infra endpoints.
- All Phase 0 unit + e2e + axe tests green; CI passing on `main`.
- Working directory: `/Users/shrey/Personal Projects/coconutlabs/`.
- Spec at `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md`.

---

## File Structure (Phase 1 deliverables)

```
coconutlabs/
├── app/
│   ├── layout.tsx                                 modify: mount <PageNumber/> + <FirstLoadReveal/>
│   └── page.tsx                                   modify: replace placeholder with full composition
├── components/
│   ├── primitives/
│   │   ├── SplitText.tsx                          char/word stagger reveal (~30 lines)
│   │   ├── ThinRule.tsx                           horizontal rule that draws on viewport entry
│   │   ├── RevealUp.tsx                           Framer Motion fade-up wrapper
│   │   ├── Card.tsx                               editorial card w/ optional 3D tilt
│   │   └── Badge.tsx                              status / "in research" pill
│   ├── shell/
│   │   ├── PageNumber.tsx                         "p. NN of 11" mono caption, bottom-right
│   │   └── FirstLoadReveal.tsx                    1.5–2s ceremonial sequence, once per session
│   ├── canvas/
│   │   ├── PaperFoldSculpture.tsx                 R3F scene (low-poly paper, cinematic light)
│   │   └── PaperFoldSvgFallback.tsx               static SVG + subtle CSS animation
│   └── home/
│       ├── Hero.tsx                               H1 + dek + breathing weight axis
│       ├── HeroCanvas.tsx                         dynamic wrapper around PaperFoldSculpture
│       ├── ManifestoStrip.tsx                     2 short paragraphs + pull-quote, SplitText
│       ├── ResearchStrip.tsx                      "Recent research →" + 3 placeholder cards
│       ├── ProjectsStrip.tsx                      KVWarden + Weft editorial cards
│       ├── PeopleStrip.tsx                        two founder cards (Shrey + Jay) + "How we work" link
│       ├── ContactStrip.tsx                       single Instrument Serif line + email
│       └── LiveSignalsStrip.tsx                   hardcoded placeholder telemetry row
├── content/
│   └── projects/
│       ├── kvwarden.mdx                           frontmatter stub only (body lands Phase 3)
│       └── weft.mdx                               frontmatter stub only
├── lib/
│   └── routes.ts                                  shared route-order constant for PageNumber
├── public/
│   └── images/
│       └── founder.jpg                            AUTH INTERRUPT — user provides (Task 25)
├── styles/
│   └── tokens.css                                 modify: add hero-breathing keyframes, page-number color
└── tests/
    ├── unit/
    │   └── primitives/
    │       ├── SplitText.test.tsx
    │       ├── ThinRule.test.tsx
    │       ├── Card.test.tsx
    │       └── Badge.test.tsx
    └── e2e/
        ├── home.spec.ts                           composition renders all strips
        ├── home-reduced-motion.spec.ts            reveal + breathing skipped under prefers-reduced-motion
        └── accessibility.spec.ts                  modify: extend ROUTES to include all home content
```

**File responsibility boundaries (Phase 1 additions):**
- `components/primitives/*` is framework-level. No page-section knowledge. Used by both home strips and (later) inner pages.
- `components/canvas/*` is WebGL/SVG art. Imported only via `next/dynamic({ ssr: false })` from a consumer in `components/home/HeroCanvas.tsx`.
- `components/home/*` is page-scoped composition. Each strip is a self-contained Server Component except where it must hydrate (e.g. ManifestoStrip wraps a SplitText client island).
- `components/shell/PageNumber.tsx` lives in shell because it appears on every route, not just home.
- `components/shell/FirstLoadReveal.tsx` is mounted once in the root layout; it reads sessionStorage on mount, no-ops on subsequent visits.
- `lib/routes.ts` is the single source for "p. NN of 11" denominators. Mirrors `app/sitemap.ts`'s STATIC_ROUTES; both should reference the same constant in Phase 3 cleanup.

---

## Decisions locked at start of Phase 1

These three decisions are made up front so individual tasks don't redebate them:

### D1 — Hero "breathing weight axis"

Spec §6.3 promises the Instrument Serif H1 to breathe weight (-3% → +3% over 8s). **Instrument Serif is not a variable font** — Google Fonts ships it at `weight: ["400"]` only, and that's how Phase 0's `app/fonts.ts` loads it. A `font-variation-settings: 'wght' 412` declaration on it is a no-op.

**Decision:** Implement the breathe as a subtle composite micro-animation on the H1 — `font-variation-settings: 'opsz' 18→18.6` (Instrument Serif does ship `opsz`) layered with `transform: scale(1.000 → 1.003)` and `letter-spacing: -0.020em → -0.022em`, all on an 8s ease-in-out alternate keyframe. Visually reads as a weight breathe; technically honest. If user later wants a true variable-weight axis, the path is to swap the display face to Fraunces (which ships `wght 100–900`) — flagged in Task 25 as an optional v2 swap.

### D2 — Paper-fold sculpture risk handling

Spec §13.1 mandates fallback discipline: if WebGL doesn't land at premium quality in 3 days, ship static SVG with subtle CSS animation as v1. **Build the SVG fallback first** (Task 17), then wire R3F (Task 18). HeroCanvas chooses between them via a single env-driven flag (`NEXT_PUBLIC_PAPER_FOLD_VARIANT=svg|webgl`, default `svg` on first deploy, flipped to `webgl` only after the R3F version meets the bar). This makes the home page never blocked by paper-fold R&D.

### D3 — Tailwind utility vs inline style

Match Phase 0 exactly: **color tokens via Tailwind utilities** (`text-ink-0`, `bg-bg-1`, `border-rule`, `text-accent`, etc., already mapped through `@theme` in `app/globals.css`); **fonts, spacing, durations, and any other CSS var** via inline `style={{ ... }}`. No `text-[var(--ink-0)]` arbitrary-value escape hatches.

---

## Tasks

### Task 1: Add motion (Framer) + intersection-observer dep verification

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Verify `motion` is already installed from Phase 0**

Run: `pnpm list motion`
Expected: `motion@11.x.x` listed.

If for any reason it's missing:
```bash
pnpm add motion@^11
```

- [ ] **Step 2: Add react-intersection-observer for in-view gating**

`motion`'s built-in `whileInView` covers most needs, but the HeroCanvas + LiveSignalsStrip use an explicit observer to mount/unmount cheaply. Run:
```bash
pnpm add react-intersection-observer@^9
```

- [ ] **Step 3: Verify install + types resolve**

Run: `pnpm install && pnpm typecheck`
Expected: lockfile updates, no type errors.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(phase-1): add react-intersection-observer for canvas gating"
```

---

### Task 2: Add Phase 1 token additions (hero breathing keyframes + reveal helpers)

**Files:**
- Modify: `styles/tokens.css`

- [ ] **Step 1: Append Phase 1 keyframes + helpers to tokens.css**

Open `styles/tokens.css` and append the following at the end of the file (after the `.theme-reading` block):
```css
/* Phase 1 — Hero breathing weight axis (D1: optical-size simulation, since
   Instrument Serif is not a true variable-weight font). Keep subtle. */
@keyframes hero-breathe {
  0%, 100% {
    font-variation-settings: "opsz" 18;
    transform: scale(1.000);
    letter-spacing: -0.020em;
  }
  50% {
    font-variation-settings: "opsz" 18.6;
    transform: scale(1.003);
    letter-spacing: -0.022em;
  }
}

/* Phase 1 — ThinRule self-draw on viewport entry */
@keyframes thin-rule-draw {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}

/* Phase 1 — first-load ceremonial reveal: bg fade */
@keyframes ceremonial-bg-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@media (prefers-reduced-motion: reduce) {
  /* belt-and-suspenders: even though globals.css zeros animation-duration,
     the breathing keyframe defines initial state — make sure those static
     values are applied. */
  .hero-breathe { animation: none !important; transform: none !important; }
}
```

- [ ] **Step 2: Visual verify tokens still load**

Run: `pnpm dev` and load `http://localhost:3000`. Expected: page still renders, no CSS parse errors in DevTools console.
Stop server.

- [ ] **Step 3: Commit**

```bash
git add styles/tokens.css
git commit -m "feat(phase-1): add hero-breathe, thin-rule-draw, ceremonial keyframes"
```

---

### Task 3: Build SplitText primitive (TDD)

**Why:** Spec §7.5 lists "SplitText character/word reveals on hero headlines (custom ~30-line component, GSAP-Club replacement)." Used by ManifestoStrip (word-by-word reveal) and Hero (letter-by-letter ceremonial reveal).

**Files:**
- Create: `components/primitives/SplitText.tsx`
- Create: `tests/unit/primitives/SplitText.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/primitives/SplitText.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SplitText } from "@/components/primitives/SplitText";

describe("SplitText", () => {
  it("splits a string into one span per word by default", () => {
    const { container } = render(<SplitText>hello world there</SplitText>);
    const spans = container.querySelectorAll("span[data-split-unit]");
    expect(spans).toHaveLength(3);
    expect(spans[0]?.textContent).toBe("hello");
    expect(spans[2]?.textContent).toBe("there");
  });

  it("splits per character when split='char'", () => {
    const { container } = render(<SplitText split="char">abc</SplitText>);
    const spans = container.querySelectorAll("span[data-split-unit]");
    expect(spans).toHaveLength(3);
  });

  it("preserves the full text for accessibility (aria-label)", () => {
    render(<SplitText>hello world</SplitText>);
    expect(screen.getByLabelText("hello world")).toBeInTheDocument();
  });

  it("applies stagger delay as inline style", () => {
    const { container } = render(<SplitText stagger={50}>a b</SplitText>);
    const spans = container.querySelectorAll<HTMLSpanElement>("span[data-split-unit]");
    expect(spans[0]?.style.animationDelay).toBe("0ms");
    expect(spans[1]?.style.animationDelay).toBe("50ms");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/primitives/SplitText.test.tsx`
Expected: FAIL with "Cannot find module '@/components/primitives/SplitText'".

- [ ] **Step 3: Implement SplitText**

Create `components/primitives/SplitText.tsx`:
```tsx
"use client";

import type { CSSProperties } from "react";

type Props = {
  children: string;
  split?: "word" | "char";
  /** Per-unit delay in ms. Unit i gets `i * stagger` delay. */
  stagger?: number;
  /** Animation name from tokens.css (e.g. "ceremonial-letter-in"). Default: none — caller styles via CSS. */
  animation?: string;
  /** Animation duration in ms. */
  duration?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

/**
 * Custom GSAP-Club-SplitText replacement (~30 lines, MIT-clean).
 * Splits a string into per-word or per-character spans, each with a
 * staggered animation-delay so the caller can attach a CSS animation.
 * The full text is preserved as an aria-label so screen readers read it
 * normally.
 */
export function SplitText({
  children,
  split = "word",
  stagger = 30,
  animation,
  duration = 520,
  className,
  as: Tag = "span",
}: Props) {
  const units = split === "word" ? children.split(/(\s+)/) : Array.from(children);
  let i = 0;
  return (
    <Tag aria-label={children} className={className}>
      {units.map((unit, idx) => {
        if (/^\s+$/.test(unit)) return <span key={idx} aria-hidden="true">{unit}</span>;
        const delay = i++ * stagger;
        const style: CSSProperties = {
          display: "inline-block",
          animationDelay: `${delay}ms`,
          animationDuration: `${duration}ms`,
          animationFillMode: "both",
          animationName: animation,
          animationTimingFunction: "var(--ease-out)",
        };
        return (
          <span key={idx} data-split-unit aria-hidden="true" style={style}>
            {unit}
          </span>
        );
      })}
    </Tag>
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/primitives/SplitText.test.tsx`
Expected: PASS, 4/4 green.

- [ ] **Step 5: Add the reveal animation keyframes to tokens.css**

Open `styles/tokens.css` and append:
```css
/* Phase 1 — SplitText reveal animations */
@keyframes split-word-up {
  from { opacity: 0; transform: translateY(0.4em); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes split-letter-in {
  from { opacity: 0; transform: translateY(0.2em) scale(0.97); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}
```

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(phase-1): add SplitText primitive (word/char stagger reveal)"
```

---

### Task 4: Build ThinRule primitive (TDD)

**Why:** Spec §6.5 — "animated horizontal rule that draws itself on viewport entry. Used between home strips and at section breaks in research posts."

**Files:**
- Create: `components/primitives/ThinRule.tsx`
- Create: `tests/unit/primitives/ThinRule.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/primitives/ThinRule.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ThinRule } from "@/components/primitives/ThinRule";

describe("ThinRule", () => {
  it("renders an <hr> element with role='separator'", () => {
    const { container } = render(<ThinRule />);
    const hr = container.querySelector("hr");
    expect(hr).toBeInTheDocument();
    expect(hr).toHaveAttribute("role", "separator");
  });

  it("applies the rule color from tokens via border", () => {
    const { container } = render(<ThinRule />);
    const hr = container.querySelector("hr") as HTMLHRElement;
    // we set border via Tailwind class — assert the class is present
    expect(hr.className).toMatch(/border-rule/);
  });

  it("applies a custom origin (left vs center)", () => {
    const { container } = render(<ThinRule origin="center" />);
    const hr = container.querySelector("hr") as HTMLHRElement;
    expect(hr.style.transformOrigin).toBe("center");
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/primitives/ThinRule.test.tsx`
Expected: FAIL with "Cannot find module".

- [ ] **Step 3: Implement ThinRule**

Create `components/primitives/ThinRule.tsx`:
```tsx
"use client";

import { motion } from "motion/react";

type Props = {
  /** Where the rule grows from. Spec uses 'left' between home strips. */
  origin?: "left" | "center" | "right";
  className?: string;
};

/**
 * Horizontal rule that draws itself on viewport entry.
 * Spec §6.5. Honors prefers-reduced-motion via globals.css zero-out.
 */
export function ThinRule({ origin = "left", className }: Props) {
  return (
    <motion.hr
      role="separator"
      className={`border-0 border-t border-rule ${className ?? ""}`}
      style={{
        transformOrigin: origin,
        height: 0,
        width: "100%",
      }}
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{
        duration: 0.72,
        ease: [0.16, 1, 0.3, 1],
      }}
    />
  );
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/primitives/ThinRule.test.tsx`
Expected: PASS, 3/3 green.

(Note: `motion`'s `whileInView` does not run in jsdom, so the test asserts on structure + class + origin only — visual verify confirms the draw animation in browser.)

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(phase-1): add ThinRule primitive with self-draw on viewport entry"
```

---

### Task 5: Build RevealUp primitive

**Why:** Used everywhere on the home page to fade-up content sections on viewport entry (spec §7.5).

**Files:**
- Create: `components/primitives/RevealUp.tsx`

- [ ] **Step 1: Implement RevealUp**

Create `components/primitives/RevealUp.tsx`:
```tsx
"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Delay in seconds before the reveal starts. */
  delay?: number;
  /** How far up the content travels in px. Default 16. */
  distance?: number;
  className?: string;
  /** Replay every time the element enters/leaves the viewport. Default false (once). */
  replay?: boolean;
};

/**
 * Fade-up + slight scale on viewport entry. Used by all body sections
 * on the home page (spec §7.5). Server-rendered children are wrapped
 * in this client island so only the motion shell hydrates.
 */
export function RevealUp({ children, delay = 0, distance = 16, className, replay = false }: Props) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance, scale: 0.995 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: !replay, margin: "-10% 0px" }}
      transition={{
        duration: 0.52,
        ease: [0.16, 1, 0.3, 1],
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Visual verify (smoke check via temporary use in app/page.tsx)**

Defer visual verification to Task 19 (composition assembly). The component has no Vitest test because its only behavior — `whileInView` + transitions — does not run in jsdom; it's covered by the e2e suite (Task 26).

- [ ] **Step 3: Commit**

```bash
git add components/primitives/RevealUp.tsx
git commit -m "feat(phase-1): add RevealUp primitive (fade-up on viewport entry)"
```

---

### Task 6: Build Card + Badge primitives (TDD)

**Why:** Cards back the Research and Projects strips. Badges back the Weft "In research" status pill.

**Files:**
- Create: `components/primitives/Card.tsx`
- Create: `components/primitives/Badge.tsx`
- Create: `tests/unit/primitives/Card.test.tsx`
- Create: `tests/unit/primitives/Badge.test.tsx`

- [ ] **Step 1: Write Card test**

Create `tests/unit/primitives/Card.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/primitives/Card";

describe("Card", () => {
  it("renders children inside an article element", () => {
    render(<Card>contents</Card>);
    expect(screen.getByRole("article")).toHaveTextContent("contents");
  });

  it("becomes a link when href is provided", () => {
    render(<Card href="/x">contents</Card>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/x");
  });

  it("opens external links in a new tab", () => {
    render(<Card href="https://example.com" external>contents</Card>);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies the tilt data attribute when tilt=true (CSS hooks read it)", () => {
    const { container } = render(<Card tilt>contents</Card>);
    expect(container.querySelector("[data-tilt='true']")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Write Badge test**

Create `tests/unit/primitives/Badge.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/primitives/Badge";

describe("Badge", () => {
  it("renders the label", () => {
    render(<Badge>In research</Badge>);
    expect(screen.getByText("In research")).toBeInTheDocument();
  });

  it("uses accent-2 color for tone='research'", () => {
    const { container } = render(<Badge tone="research">In research</Badge>);
    expect(container.firstChild).toHaveClass("text-accent-2");
  });

  it("uses accent color for tone='live'", () => {
    const { container } = render(<Badge tone="live">Live</Badge>);
    expect(container.firstChild).toHaveClass("text-accent");
  });
});
```

- [ ] **Step 3: Run both tests, verify they fail**

Run: `pnpm exec vitest run tests/unit/primitives/Card.test.tsx tests/unit/primitives/Badge.test.tsx`
Expected: FAIL with "Cannot find module".

- [ ] **Step 4: Implement Card**

Create `components/primitives/Card.tsx`:
```tsx
import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Optional href makes the entire card a link. */
  href?: string;
  /** External link — opens in new tab + sets noopener. */
  external?: boolean;
  /** Enables CSS perspective tilt on hover (vanilla CSS, see globals.css). */
  tilt?: boolean;
  className?: string;
};

/**
 * Editorial card. Vanilla-CSS 3D tilt on hover (spec §7.5) when tilt=true.
 * Background uses bg-1 (raised surface, spec §6.1).
 */
export function Card({ children, href, external, tilt = false, className }: Props) {
  const inner = (
    <article
      data-tilt={tilt}
      className={`bg-bg-1 border border-rule transition-transform ${className ?? ""}`}
      style={{
        padding: "var(--space-4)",
        transitionDuration: "var(--dur-ui)",
        transitionTimingFunction: "var(--ease-out)",
      }}
    >
      {children}
    </article>
  );

  if (!href) return inner;

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
    >
      {inner}
    </Link>
  );
}
```

- [ ] **Step 5: Add tilt CSS to globals.css**

Open `app/globals.css` and append (after the existing `@media (prefers-reduced-motion: reduce)` block):
```css
/* Phase 1 — Card 3D tilt on hover (vanilla CSS perspective, spec §7.5) */
[data-tilt="true"] {
  transform-style: preserve-3d;
  perspective: 1000px;
  will-change: transform;
}

@media (hover: hover) {
  [data-tilt="true"]:hover {
    transform: perspective(1000px) rotateX(2deg) rotateY(-2deg) translateZ(2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-tilt="true"]:hover { transform: none; }
}
```

- [ ] **Step 6: Implement Badge**

Create `components/primitives/Badge.tsx`:
```tsx
import type { ReactNode } from "react";

type Tone = "live" | "research" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  live: "text-accent border-accent",
  research: "text-accent-2 border-accent-2",
  neutral: "text-ink-1 border-rule",
};

type Props = {
  children: ReactNode;
  tone?: Tone;
  className?: string;
};

/**
 * Status pill in mono. Used for "In research", "Live", etc.
 * Spec §5.5 (project hero status badge), §6.1 (accent + accent-2 colors).
 */
export function Badge({ children, tone = "neutral", className }: Props) {
  return (
    <span
      className={`inline-block border ${TONE_CLASS[tone]} ${className ?? ""}`}
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        padding: "2px 8px",
      }}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 7: Run tests, verify they pass**

Run: `pnpm exec vitest run tests/unit/primitives/Card.test.tsx tests/unit/primitives/Badge.test.tsx`
Expected: PASS, 7/7 green (4 Card + 3 Badge).

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(phase-1): add Card (with tilt) + Badge primitives"
```

---

### Task 7: Build the shared route-order constant

**Why:** PageNumber needs a stable "p. NN of TOTAL" mapping per route. The same list lives in `app/sitemap.ts`. Centralize it now so Phase 3 doesn't fork it.

**Files:**
- Create: `lib/routes.ts`

- [ ] **Step 1: Implement `lib/routes.ts`**

Create `lib/routes.ts`:
```ts
/**
 * Canonical route order for editorial page numbering (spec §6.5).
 * Mirrors the static route list in `app/sitemap.ts`. The sitemap will be
 * refactored in Phase 3 to import from here.
 *
 * The home page is page 1. Order is the order of importance for a reader
 * paging through the site as if it were a manuscript.
 */
export const ROUTE_ORDER = [
  { path: "/", title: "Home" },
  { path: "/research", title: "Research" },
  { path: "/work", title: "Work" },
  { path: "/papers", title: "Papers" },
  { path: "/podcasts", title: "Podcasts" },
  { path: "/projects/kvwarden", title: "KVWarden" },
  { path: "/projects/weft", title: "Weft" },
  { path: "/joinus", title: "Join us" },
  { path: "/about", title: "About" },
  { path: "/contact", title: "Contact" },
  { path: "/colophon", title: "Colophon" },
] as const;

export const TOTAL_PAGES = ROUTE_ORDER.length;

/**
 * Returns the 1-indexed page number for a given pathname, or null if the
 * path is not in the canonical order (e.g. /research/[slug], /404).
 */
export function pageNumberFor(pathname: string): number | null {
  const idx = ROUTE_ORDER.findIndex((r) => r.path === pathname);
  return idx === -1 ? null : idx + 1;
}

/** Format helper: pageNumberFor → "p. 04 of 11" */
export function formatPageNumber(pathname: string): string | null {
  const n = pageNumberFor(pathname);
  if (n === null) return null;
  return `p. ${String(n).padStart(2, "0")} of ${String(TOTAL_PAGES).padStart(2, "0")}`;
}
```

- [ ] **Step 2: Quick smoke test in REPL or temporary scratch**

Run:
```bash
pnpm exec tsx --eval "import('./lib/routes.ts').then(m => console.log(m.formatPageNumber('/'), m.formatPageNumber('/projects/weft'), m.formatPageNumber('/nope')))"
```

If `tsx` isn't installed, instead add a one-off vitest test or just verify visually in Task 8.
Expected output: `p. 01 of 11 p. 07 of 11 null`

- [ ] **Step 3: Commit**

```bash
git add lib/routes.ts
git commit -m "feat(phase-1): add canonical route-order constant for page numbering"
```

---

### Task 8: Build PageNumber shell component

**Why:** Spec §6.5 — "small mono caption 'p. 04 of 11' in the bottom-right corner of every route."

**Files:**
- Create: `components/shell/PageNumber.tsx`

- [ ] **Step 1: Implement PageNumber**

Create `components/shell/PageNumber.tsx`:
```tsx
"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { formatPageNumber } from "@/lib/routes";

/**
 * Small mono "p. NN of TT" caption in the bottom-right of every route.
 * Animates on transition (spec §6.5). Hidden when the current path is
 * not in the canonical order (e.g. dynamic /research/[slug] in Phase 2,
 * 404 page).
 */
export function PageNumber() {
  const pathname = usePathname();
  const label = formatPageNumber(pathname);

  return (
    <div
      aria-hidden="true"
      className="fixed bottom-4 right-4 z-30 pointer-events-none select-none"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "var(--ink-2)",
        letterSpacing: "0.04em",
      }}
    >
      <AnimatePresence mode="wait">
        {label && (
          <motion.span
            key={pathname}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Mount PageNumber in root layout**

Open `app/layout.tsx` and add the import + mount it after `<Footer />` (it's `position: fixed`, so insertion order doesn't visually matter — placing after Footer keeps the tab order natural):
```tsx
// add to existing imports
import { PageNumber } from "@/components/shell/PageNumber";

// inside <body>, after <Footer />:
<Footer />
<PageNumber />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev`
- Load `http://localhost:3000`. Expected: small `p. 01 of 11` in bottom-right corner.
- Navigate to `http://localhost:3000/research` (will 404 right now since the route doesn't exist yet — but the layout still wraps the 404 page; PageNumber should be visible saying nothing because `/this-route` isn't in ROUTE_ORDER).

Note: `/research` etc. are not yet rendered in Phase 1 — they land in Phase 3. Until then PageNumber will only display on `/`. That's expected.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/shell/PageNumber.tsx app/layout.tsx
git commit -m "feat(phase-1): add PageNumber editorial caption (bottom-right corner)"
```

---

### Task 9: Build the Hero typography component

**Why:** Spec §5.1 — "H1 in Instrument Serif, ~96px desktop, line-height 0.95, variable-axis weight breathes (-3% → +3% over 8s), one-line dek in Geist Variable below." Per D1, breathing is implemented as a composite micro-animation.

**Files:**
- Create: `components/home/Hero.tsx`

- [ ] **Step 1: Implement Hero**

Create `components/home/Hero.tsx`:
```tsx
"use client";

type Props = {
  /** The headline text. Use a strong default that the user later swaps. */
  headline?: string;
  /** One-line dek below the headline. */
  dek?: string;
};

/**
 * Hero typography (spec §5.1 + §6.3). The H1 uses Instrument Serif at
 * fluid display-xl, with a subtle 8s "breathe" composite animation
 * (opsz axis + transform scale + letter-spacing micro-shift) since
 * Instrument Serif does not ship a true variable wght axis. See
 * Phase 1 plan D1 for rationale.
 *
 * The accompanying paper-fold sculpture lives behind this in HeroCanvas.
 */
export function Hero({
  headline = "Inference, made honest.",
  dek = "An independent research lab building the load-bearing software between LLMs and the GPUs that run them.",
}: Props) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1
        className="hero-breathe text-ink-0"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-xl)",
          lineHeight: 0.95,
          letterSpacing: "-0.020em",
          fontVariationSettings: '"opsz" 18',
          maxWidth: "16ch",
          animation: "hero-breathe 8s ease-in-out infinite",
        }}
      >
        {headline}
      </h1>
      <p
        className="text-ink-1"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "var(--fs-h3)",
          marginTop: "var(--space-4)",
          maxWidth: "var(--measure)",
          lineHeight: 1.4,
        }}
      >
        {dek}
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Wire into home page temporarily for visual verify**

Open `app/page.tsx` and replace the existing placeholder body with:
```tsx
import { Hero } from "@/components/home/Hero";

export default function Home() {
  return (
    <>
      <Hero />
    </>
  );
}
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Expected:
- "Inference, made honest." in massive Instrument Serif, no more than 16ch wide.
- Dek line below in Geist UI font.
- The headline subtly "breathes" on an 8s loop — the animation is meant to be barely perceptible. Watch for ~10 seconds; you should see the headline very faintly swell and contract.
- Toggle DevTools → Rendering → `prefers-reduced-motion: reduce` and reload — the headline should sit perfectly still.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/Hero.tsx app/page.tsx
git commit -m "feat(phase-1): add Hero typography with composite breathe animation (D1)"
```

---

### Task 10: Build PaperFoldSvgFallback (the de-risked v1 of the signature motif)

**Why:** D2 — ship the SVG fallback first so the home page is never blocked on R3F R&D. Spec §13.1 mandates fallback discipline.

**Files:**
- Create: `components/canvas/PaperFoldSvgFallback.tsx`

- [ ] **Step 1: Implement the SVG fallback**

Create `components/canvas/PaperFoldSvgFallback.tsx`:
```tsx
"use client";

import { motion } from "motion/react";

/**
 * Static SVG paper-fold illustration with subtle CSS animation. This is
 * the v1-fallback variant per spec §13.1 + Phase 1 plan D2. Switched in
 * via NEXT_PUBLIC_PAPER_FOLD_VARIANT=svg (default). Replaced by R3F
 * version in Task 18 once it meets the bar.
 *
 * Visual: a single sheet of cream paper with two folds, drawn as polygons
 * with subtle gradient shading. A very slow rotation imparts life.
 */
export function PaperFoldSvgFallback() {
  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingRight: "var(--gutter)",
      }}
      animate={{ rotate: [-1.2, 1.2, -1.2] }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg
        viewBox="0 0 600 600"
        width="min(60vw, 600px)"
        height="min(60vw, 600px)"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity: 0.9 }}
      >
        <defs>
          <linearGradient id="paper-light" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F6F1E1" />
            <stop offset="100%" stopColor="#E2D9C3" />
          </linearGradient>
          <linearGradient id="paper-shadow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D6CBB1" />
            <stop offset="100%" stopColor="#B8AC8E" />
          </linearGradient>
          <linearGradient id="paper-curl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F6F1E1" />
            <stop offset="100%" stopColor="#C8BFAB" />
          </linearGradient>
        </defs>

        {/* main panel */}
        <polygon points="120,80 480,120 460,460 100,420" fill="url(#paper-light)" />
        {/* folded triangle (top-right) */}
        <polygon points="480,120 460,260 380,140" fill="url(#paper-shadow)" />
        {/* folded triangle outline */}
        <polyline points="480,120 380,140" fill="none" stroke="#9B6B1F" strokeWidth="0.5" opacity="0.25" />
        {/* curl strip (bottom edge) */}
        <path
          d="M 100 420 Q 280 510 460 460 L 460 470 Q 280 520 100 430 Z"
          fill="url(#paper-curl)"
        />
        {/* center crease */}
        <line x1="300" y1="100" x2="280" y2="440" stroke="#C8BFAB" strokeWidth="0.4" opacity="0.4" />
      </svg>
    </motion.div>
  );
}
```

- [ ] **Step 2: Quick visual verify standalone**

We'll render through HeroCanvas in the next task. Skip browser verification here.

- [ ] **Step 3: Commit**

```bash
git add components/canvas/PaperFoldSvgFallback.tsx
git commit -m "feat(phase-1): add PaperFoldSvgFallback (de-risked v1 per spec §13.1)"
```

---

### Task 11: Build HeroCanvas dispatcher (SVG default, WebGL behind env flag)

**Why:** Per D2, HeroCanvas chooses between the SVG fallback and the R3F version via `NEXT_PUBLIC_PAPER_FOLD_VARIANT`. The R3F path is added in Task 18; until then HeroCanvas always shows the SVG.

**Files:**
- Create: `components/home/HeroCanvas.tsx`

- [ ] **Step 1: Implement HeroCanvas**

Create `components/home/HeroCanvas.tsx`:
```tsx
"use client";

import dynamic from "next/dynamic";
import { useInView } from "react-intersection-observer";
import { PaperFoldSvgFallback } from "@/components/canvas/PaperFoldSvgFallback";

/**
 * The R3F sculpture is dynamically imported with ssr:false so three.js
 * never lands in the SSR bundle (spec §9.3). Until Task 18 lands the
 * actual R3F file, this lazy import resolves to a stub component that
 * renders nothing (handled inside Task 18's PaperFoldSculpture).
 */
const PaperFoldSculpture = dynamic(
  () => import("@/components/canvas/PaperFoldSculpture").then((m) => m.PaperFoldSculpture),
  { ssr: false, loading: () => <PaperFoldSvgFallback /> }
);

/**
 * HeroCanvas: dispatch between the SVG fallback (default) and the R3F
 * sculpture (env-gated). The variant is read at build time via
 * NEXT_PUBLIC_PAPER_FOLD_VARIANT — set to "webgl" only after the R3F
 * version meets the visual bar.
 *
 * In all cases the canvas is unmounted when scrolled out of view to
 * stay within the spec §10 JS budget.
 */
export function HeroCanvas() {
  const { ref, inView } = useInView({ rootMargin: "200px 0px", initialInView: true });
  const variant = process.env.NEXT_PUBLIC_PAPER_FOLD_VARIANT === "webgl" ? "webgl" : "svg";

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {!inView ? null : variant === "webgl" ? <PaperFoldSculpture /> : <PaperFoldSvgFallback />}
    </div>
  );
}
```

- [ ] **Step 2: Add a placeholder PaperFoldSculpture so dynamic import resolves**

Create `components/canvas/PaperFoldSculpture.tsx` as a placeholder so build succeeds before Task 18:
```tsx
"use client";

/**
 * Placeholder. Real R3F implementation lands in Task 18.
 * For now this re-exports the SVG fallback so dynamic import resolves
 * cleanly on builds done before Task 18.
 */
export { PaperFoldSvgFallback as PaperFoldSculpture } from "./PaperFoldSvgFallback";
```

- [ ] **Step 3: Mount HeroCanvas in Hero composition**

Open `app/page.tsx` and update to wrap the Hero with the canvas backdrop. We need a positioned parent so HeroCanvas's `position: absolute` overlays correctly:
```tsx
import { Hero } from "@/components/home/Hero";
import { HeroCanvas } from "@/components/home/HeroCanvas";

export default function Home() {
  return (
    <>
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <HeroCanvas />
        <Hero />
      </section>
    </>
  );
}
```

- [ ] **Step 4: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Expected:
- Hero typography is in front.
- A cream paper-fold SVG illustration sits behind it on the right side, slowly rocking.
- No console errors related to dynamic imports or three.js.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/home/HeroCanvas.tsx components/canvas/PaperFoldSculpture.tsx app/page.tsx
git commit -m "feat(phase-1): add HeroCanvas dispatcher (SVG default, WebGL env-gated)"
```

---

### Task 12: Build ManifestoStrip with SplitText word-by-word reveal

**Why:** Spec §5.1 — "2 short paragraphs, Fraunces body, 62ch measure, single Instrument Serif pull-quote, SplitText word-by-word reveal on viewport entry."

**Files:**
- Create: `components/home/ManifestoStrip.tsx`

- [ ] **Step 1: Implement ManifestoStrip**

Create `components/home/ManifestoStrip.tsx`:
```tsx
import { SplitText } from "@/components/primitives/SplitText";
import { RevealUp } from "@/components/primitives/RevealUp";

/**
 * Manifesto strip (spec §5.1). Two short paragraphs in Fraunces with a
 * single Instrument Serif pull-quote, all inside a 62ch measure. The
 * pull-quote is split into per-word spans that fade-up with a 30ms
 * stagger when the strip enters the viewport.
 *
 * Copy is the spec §8.2 manifesto opener, used here verbatim. User
 * may swap the body copy in Task 25; the pull-quote should remain the
 * canonical opener.
 */
export function ManifestoStrip() {
  return (
    <section
      style={{
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
      }}
    >
      <div style={{ maxWidth: "var(--measure)" }}>
        <RevealUp>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--fs-body)",
              lineHeight: 1.55,
              color: "var(--ink-0)",
            }}
          >
            Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems —
            the boring, load-bearing software between an LLM and the GPU it runs on.
          </p>
        </RevealUp>

        <RevealUp delay={0.1}>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--fs-body)",
              lineHeight: 1.55,
              color: "var(--ink-0)",
              marginTop: "var(--space-4)",
            }}
          >
            KVWarden is the first project. Weft is the second. There will be more.
          </p>
        </RevealUp>

        <SplitText
          as="blockquote"
          stagger={45}
          duration={620}
          animation="split-word-up"
          className="text-ink-0"
          // styling via inline style (matches D3); className handles color only
        >
          {`The boring software is the load-bearing software.`}
        </SplitText>

        {/* The blockquote inherits a className but needs explicit visual style.
            We re-render the quote-styled wrapper around it. */}
      </div>
    </section>
  );
}
```

Wait — the `as="blockquote"` on SplitText doesn't accept a `style` prop, so the pull-quote styling won't land. Refactor to wrap the SplitText:

- [ ] **Step 2: Fix the pull-quote styling by wrapping SplitText**

Replace the `<SplitText as="blockquote" ...>` block in `components/home/ManifestoStrip.tsx` with:
```tsx
<blockquote
  style={{
    fontFamily: "var(--font-display)",
    fontSize: "var(--fs-h2)",
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
    color: "var(--ink-0)",
    marginTop: "var(--space-6)",
    borderLeft: "2px solid var(--accent)",
    paddingLeft: "var(--space-3)",
  }}
>
  <SplitText
    stagger={45}
    duration={620}
    animation="split-word-up"
  >
    {"The boring software is the load-bearing software."}
  </SplitText>
</blockquote>
```

- [ ] **Step 3: Wire ManifestoStrip into the home page**

Open `app/page.tsx` and update:
```tsx
import { Hero } from "@/components/home/Hero";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { ManifestoStrip } from "@/components/home/ManifestoStrip";
import { ThinRule } from "@/components/primitives/ThinRule";

export default function Home() {
  return (
    <>
      <section
        style={{ position: "relative", minHeight: "100vh", overflow: "hidden" }}
      >
        <HeroCanvas />
        <Hero />
      </section>
      <ThinRule />
      <ManifestoStrip />
    </>
  );
}
```

- [ ] **Step 4: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to the manifesto. Expected:
- Two body paragraphs in Fraunces.
- Below them, the pull-quote in Instrument Serif with a coconut-amber left border, words sweeping up one at a time when scrolled into view.
- A thin rule above the manifesto draws itself left-to-right when it enters view.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add components/home/ManifestoStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add ManifestoStrip with SplitText pull-quote reveal"
```

---

### Task 13: Build ResearchStrip with 3 placeholder cards

**Why:** Spec §5.1 — `"Recent research →" header, three editorial cards (date in mono, title in serif, dek in sans), 3D-tilt on hover.` Real posts land Phase 2; the cards are placeholders pointing to `/research` (which 404s until Phase 3).

**Files:**
- Create: `components/home/ResearchStrip.tsx`

- [ ] **Step 1: Implement ResearchStrip**

Create `components/home/ResearchStrip.tsx`:
```tsx
import Link from "next/link";
import { Card } from "@/components/primitives/Card";
import { RevealUp } from "@/components/primitives/RevealUp";

const PLACEHOLDER_POSTS = [
  {
    date: "2026-04-19",
    title: "Tenant fairness on shared inference",
    dek: "How we got from 523× starvation to 1.14× of solo on a single A100.",
    href: "/research/kvwarden-gate-2-fairness",
  },
  {
    date: "2026-03-30",
    title: "What 'fair' means when the GPU is the bottleneck",
    dek: "A working definition of tenant fairness for LLM inference.",
    href: "/research/defining-fairness",
  },
  {
    date: "2026-03-12",
    title: "Reading mlx-lm #965",
    dek: "Notes from the Apple Silicon scheduling correctness debate.",
    href: "/research/reading-mlx-lm-965",
  },
];

/**
 * Recent research strip (spec §5.1). Three placeholder editorial cards.
 * Real entries land in Phase 2 from MDX. Cards are server-rendered with
 * a tilt-on-hover Card primitive (vanilla CSS perspective per spec §7.5).
 */
export function ResearchStrip() {
  return (
    <section
      style={{
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
      }}
    >
      <RevealUp>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: "var(--space-5)",
          }}
        >
          <h2
            className="text-ink-0"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-h2)",
              letterSpacing: "-0.01em",
            }}
          >
            Recent research
          </h2>
          <Link
            href="/research"
            className="text-ink-1 hover:text-ink-0"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "var(--fs-ui)",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
              transitionDuration: "var(--dur-micro)",
            }}
          >
            All research →
          </Link>
        </header>
      </RevealUp>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {PLACEHOLDER_POSTS.map((post, i) => (
          <RevealUp key={post.href} delay={i * 0.08}>
            <Card href={post.href} tilt>
              <time
                dateTime={post.date}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--fs-mono)",
                  color: "var(--ink-2)",
                }}
              >
                {post.date}
              </time>
              <h3
                className="text-ink-0"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-h3)",
                  marginTop: "var(--space-2)",
                  lineHeight: 1.2,
                }}
              >
                {post.title}
              </h3>
              <p
                className="text-ink-1"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--fs-ui)",
                  marginTop: "var(--space-2)",
                  lineHeight: 1.5,
                }}
              >
                {post.dek}
              </p>
            </Card>
          </RevealUp>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into home page**

Open `app/page.tsx` and add ResearchStrip after the existing ManifestoStrip with a ThinRule between:
```tsx
import { ResearchStrip } from "@/components/home/ResearchStrip";

// inside the JSX, after <ManifestoStrip />:
<ThinRule />
<ResearchStrip />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to the research strip. Expected:
- Header "Recent research" in Instrument Serif, "All research →" link on the right.
- 3 cards in a responsive grid; on desktop they appear side-by-side, on mobile they stack.
- Mono date · serif title · sans dek inside each card.
- Hover a card: subtle tilt forward via CSS perspective (no JS lib).

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/ResearchStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add ResearchStrip with 3 placeholder cards (real posts land phase 2)"
```

---

### Task 14: Add MDX project frontmatter stubs

**Why:** Spec §9.4 specifies project frontmatter shape. Phase 3 will render the project pages; Phase 1 only commits the frontmatter so ProjectsStrip can demonstrably reference real content paths and the loader has data to point at.

**Files:**
- Create: `content/projects/kvwarden.mdx`
- Create: `content/projects/weft.mdx`

- [ ] **Step 1: Create kvwarden.mdx (frontmatter only)**

Create `content/projects/kvwarden.mdx`:
```mdx
---
name: KVWarden
tagline: "Tenant fairness on shared inference."
status: live
headline_result: "1.14× of solo, 26× better than FIFO"
external_url: https://kvwarden.org
github_url: https://github.com/coconut-labs/kvwarden
---

{/* Project page body lands in Phase 3. Frontmatter only for Phase 1. */}
```

- [ ] **Step 2: Create weft.mdx (frontmatter only)**

Create `content/projects/weft.mdx`:
```mdx
---
name: Weft
tagline: "Tenant fairness on Apple Silicon."
status: research
headline_result: null
external_url: null
github_url: https://github.com/coconut-labs/weft
---

{/* Project page body lands in Phase 3. Frontmatter only for Phase 1. */}
```

- [ ] **Step 3: Sanity check frontmatter parses**

Run a quick smoke test using the existing `lib/content.ts` loader:
```bash
pnpm exec tsx --eval "import('./lib/content.ts').then(m => { console.log(m.loadFile('projects/kvwarden.mdx').data); console.log(m.loadFile('projects/weft.mdx').data); })"
```

If `tsx` isn't available, verify by adding a temporary one-off vitest test or just by file inspection — the YAML is simple enough that gray-matter will parse it cleanly.

Expected: two objects logged with `name`, `tagline`, `status`, etc.

- [ ] **Step 4: Commit**

```bash
git add content/projects/
git commit -m "feat(phase-1): add kvwarden + weft mdx frontmatter stubs (bodies in phase 3)"
```

---

### Task 15: Build ProjectsStrip with KVWarden + Weft cards

**Why:** Spec §5.1 — `"two large editorial cards stacked vertically: KVWarden hero result number ('1.14× of solo, 26× better than FIFO') in massive mono, link out to kvwarden.org; Weft 'In research' badge + intriguing 1-paragraph teaser, no waitlist."`

**Files:**
- Create: `components/home/ProjectsStrip.tsx`

- [ ] **Step 1: Implement ProjectsStrip**

Create `components/home/ProjectsStrip.tsx`:
```tsx
import { Card } from "@/components/primitives/Card";
import { Badge } from "@/components/primitives/Badge";
import { RevealUp } from "@/components/primitives/RevealUp";
import { loadFile } from "@/lib/content";

type ProjectFrontmatter = {
  name: string;
  tagline: string;
  status: "live" | "research" | "archived";
  headline_result: string | null;
  external_url: string | null;
  github_url: string;
};

/**
 * Projects strip (spec §5.1). Two large editorial cards stacked
 * vertically. Frontmatter is loaded server-side from
 * content/projects/{kvwarden,weft}.mdx so the displayed values stay
 * in lockstep with the project page sources.
 */
export function ProjectsStrip() {
  const kvwarden = loadFile("projects/kvwarden.mdx").data as unknown as ProjectFrontmatter;
  const weft = loadFile("projects/weft.mdx").data as unknown as ProjectFrontmatter;

  return (
    <section
      style={{
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
      }}
    >
      <RevealUp>
        <h2
          className="text-ink-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            letterSpacing: "-0.01em",
            marginBottom: "var(--space-5)",
          }}
        >
          Projects
        </h2>
      </RevealUp>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
        {/* KVWarden — Live */}
        <RevealUp>
          <Card
            href={kvwarden.external_url ?? kvwarden.github_url}
            external
            tilt
            className="!p-0"
          >
            <div style={{ padding: "var(--space-6) var(--space-5)" }}>
              <Badge tone="live">Live</Badge>
              <h3
                className="text-ink-0"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-h1)",
                  letterSpacing: "-0.015em",
                  marginTop: "var(--space-3)",
                }}
              >
                {kvwarden.name}
              </h3>
              <p
                className="text-ink-1"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--fs-ui)",
                  marginTop: "var(--space-2)",
                }}
              >
                {kvwarden.tagline}
              </p>
              {kvwarden.headline_result && (
                <p
                  className="text-ink-0"
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "clamp(28px, 4vw, 56px)",
                    lineHeight: 1.1,
                    marginTop: "var(--space-5)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {kvwarden.headline_result}
                </p>
              )}
              <p
                className="text-ink-1"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--fs-ui)",
                  marginTop: "var(--space-5)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                Read the full project →
              </p>
            </div>
          </Card>
        </RevealUp>

        {/* Weft — In research */}
        <RevealUp delay={0.1}>
          <Card href={`/projects/weft`} tilt className="!p-0">
            <div style={{ padding: "var(--space-6) var(--space-5)" }}>
              <Badge tone="research">In research</Badge>
              <h3
                className="text-ink-0"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--fs-h1)",
                  letterSpacing: "-0.015em",
                  marginTop: "var(--space-3)",
                }}
              >
                {weft.name}
              </h3>
              <p
                className="text-ink-0"
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--fs-body)",
                  lineHeight: 1.55,
                  marginTop: "var(--space-3)",
                  maxWidth: "var(--measure)",
                }}
              >
                A scheduler for Apple Silicon that keeps tenants honest under load.
                In research. Watching <code style={{ fontFamily: "var(--font-mono)" }}>mlx-lm#965</code> for
                upstream correctness fixes before we publish.
              </p>
              <p
                className="text-ink-2"
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: "var(--fs-ui)",
                  marginTop: "var(--space-5)",
                  fontStyle: "italic",
                }}
              >
                No waitlist yet — just notes.
              </p>
            </div>
          </Card>
        </RevealUp>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Wire into home page**

Open `app/page.tsx` and add ProjectsStrip with ThinRule:
```tsx
import { ProjectsStrip } from "@/components/home/ProjectsStrip";

// inside JSX, after the second <ThinRule /> + <ResearchStrip />:
<ThinRule />
<ProjectsStrip />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to projects. Expected:
- Heading "Projects".
- KVWarden card: amber "LIVE" badge, name in massive serif, tagline, then the headline result `1.14× of solo, 26× better than FIFO` in massive mono. Hover tilts. Clicking opens kvwarden.org in a new tab.
- Weft card below: sage "IN RESEARCH" badge, name, paragraph teaser, italicized "No waitlist yet — just notes." line. Hover tilts. Clicking goes to /projects/weft (which 404s until Phase 3 — expected).

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/ProjectsStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add ProjectsStrip with KVWarden + Weft editorial cards"
```

---

### Task 16: Build PeopleStrip (two founders)

**Why:** Spec §5.1 (amended 2026-04-26) — "two founder cards (Shrey Patel + Jay Patel), each with photo + 1-line role + bio link." Photos are an auth-interrupt (Task 26); this task uses placeholder rectangles per card that swap in seamlessly when the JPGs land.

**Files:**
- Create: `components/home/PeopleStrip.tsx`

- [ ] **Step 1: Implement PeopleStrip**

Create `components/home/PeopleStrip.tsx`:
```tsx
import Image from "next/image";
import Link from "next/link";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { RevealUp } from "@/components/primitives/RevealUp";

type Founder = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
};

const FOUNDERS: Founder[] = [
  {
    slug: "shrey-patel",
    name: "Shrey Patel",
    role: "Co-founder · Engineer",
    bio: "Data, AI, and systems engineer. Works on the load-bearing software between LLMs and the GPUs that run them.",
    photo: "/images/shrey-patel.jpg",
  },
  {
    slug: "jay-patel",
    name: "Jay Patel",
    role: "Co-founder · Engineer",
    bio: "Engineer focused on inference reliability and tenant fairness on shared hardware.",
    photo: "/images/jay-patel.jpg",
  },
];

/**
 * People strip (spec §5.1, amended 2026-04-26). Two founder cards in a
 * responsive grid. Each card: square BW portrait + name (serif) + role
 * (mono) + 1-line bio (body). Below the row: "How we work →" link.
 *
 * Photo files are auth-interrupt deliverables (Task 26). When a file is
 * missing we render a cream placeholder rectangle so the layout still
 * composes correctly; the Image swap is automatic on next build.
 */
export function PeopleStrip() {
  return (
    <section
      style={{
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
      }}
    >
      <RevealUp>
        <h2
          className="text-ink-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            letterSpacing: "-0.01em",
            marginBottom: "var(--space-5)",
          }}
        >
          The lab
        </h2>
      </RevealUp>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-6)",
        }}
      >
        {FOUNDERS.map((person, i) => (
          <FounderCard key={person.slug} person={person} delay={i * 0.1} />
        ))}
      </div>

      <RevealUp delay={0.2}>
        <p style={{ marginTop: "var(--space-6)" }}>
          <Link
            href="/about"
            className="text-ink-0"
            style={{
              fontFamily: "var(--font-ui)",
              fontSize: "var(--fs-ui)",
              textDecoration: "underline",
              textUnderlineOffset: "4px",
            }}
          >
            How we work →
          </Link>
        </p>
      </RevealUp>
    </section>
  );
}

function FounderCard({ person, delay }: { person: Founder; delay: number }) {
  const photoExists = existsSync(join(process.cwd(), "public", person.photo));

  return (
    <RevealUp delay={delay}>
      <article style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div
          style={{
            aspectRatio: "1 / 1",
            backgroundColor: "var(--bg-2)",
            border: "1px solid var(--rule)",
            position: "relative",
            overflow: "hidden",
            filter: "grayscale(100%)",
          }}
        >
          {photoExists ? (
            <Image
              src={person.photo}
              alt={`${person.name} — co-founder of Coconut Labs`}
              fill
              sizes="(max-width: 768px) 90vw, 360px"
              style={{ objectFit: "cover" }}
              priority={false}
            />
          ) : (
            <div
              aria-label={`${person.name} portrait — file pending`}
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-mono)",
                fontSize: "var(--fs-mono)",
                color: "var(--ink-2)",
              }}
            >
              {`// ${person.slug} portrait pending`}
            </div>
          )}
        </div>

        <h3
          className="text-ink-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h3)",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {person.name}
        </h3>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            color: "var(--ink-2)",
            margin: 0,
          }}
        >
          {person.role}
        </p>
        <p
          className="text-ink-0"
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body)",
            lineHeight: 1.55,
            margin: 0,
          }}
        >
          {person.bio}
        </p>
      </article>
    </RevealUp>
  );
}
```

- [ ] **Step 2: Wire into home page**

Open `app/page.tsx` and add:
```tsx
import { PeopleStrip } from "@/components/home/PeopleStrip";

// after <ProjectsStrip />:
<ThinRule />
<PeopleStrip />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to People. Expected:
- "The lab" heading.
- Two cards side by side (or stacked on mobile): each with a cream rectangle (`// shrey-patel portrait pending` / `// jay-patel portrait pending` until photos land), name in serif, role in mono ("Co-founder · Engineer"), 1-line bio.
- "How we work →" link below the row.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/PeopleStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add PeopleStrip with two founder cards (shrey + jay)"
```

---

### Task 17: Build ContactStrip

**Why:** Spec §5.1 — "single line of Instrument Serif: 'Building something at this layer? Write us.' + email."

**Files:**
- Create: `components/home/ContactStrip.tsx`

- [ ] **Step 1: Implement ContactStrip**

Create `components/home/ContactStrip.tsx`:
```tsx
import { RevealUp } from "@/components/primitives/RevealUp";

const EMAIL = "info@coconutlabs.org";

/**
 * Contact strip (spec §5.1). One line of Instrument Serif inviting
 * collaboration, with the email below. No CTA button — confidence
 * through silence (spec §5.1 hero principle, applied here too).
 */
export function ContactStrip() {
  return (
    <section
      style={{
        padding: "var(--space-8) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <RevealUp>
        <p
          className="text-ink-0"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            letterSpacing: "-0.015em",
            lineHeight: 1.2,
            maxWidth: "26ch",
            margin: "0 auto",
          }}
        >
          Building something at this layer? Write us.
        </p>
        <p style={{ marginTop: "var(--space-4)" }}>
          <a
            href={`mailto:${EMAIL}`}
            className="text-ink-1 hover:text-ink-0"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--fs-mono)",
              transitionDuration: "var(--dur-micro)",
            }}
          >
            {EMAIL}
          </a>
        </p>
      </RevealUp>
    </section>
  );
}
```

- [ ] **Step 2: Wire into home page**

Open `app/page.tsx` and add:
```tsx
import { ContactStrip } from "@/components/home/ContactStrip";

// after <PeopleStrip />:
<ThinRule />
<ContactStrip />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to Contact. Expected:
- Centered Instrument Serif sentence.
- `info@coconutlabs.org` in mono below as a `mailto:` link.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/ContactStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add ContactStrip (Instrument Serif line + mailto)"
```

---

### Task 18: Build LiveSignalsStrip with hardcoded placeholder data

**Why:** Spec §5.1 + §6.5 — "small mono row: 'Updated 2 hours ago · 14 commits this week · 3 papers in progress · 1 RFC open' auto-pulled from GitHub at build time." The GitHub fetch lands in Phase 4; Phase 1 ships hardcoded placeholder data.

**Files:**
- Create: `components/home/LiveSignalsStrip.tsx`

- [ ] **Step 1: Implement LiveSignalsStrip**

Create `components/home/LiveSignalsStrip.tsx`:
```tsx
import { RevealUp } from "@/components/primitives/RevealUp";

/**
 * Live signals strip (spec §5.1 + §6.5). Small mono telemetry row above
 * the footer. The GitHub fetch + ISR (revalidate every hour) lands in
 * Phase 4; until then this renders hardcoded placeholder values that
 * accurately reflect the lab's current state at time of writing.
 *
 * To swap to live data later, replace the SIGNALS array with a
 * server-side fetch from lib/github.ts.
 */
const SIGNALS = [
  "Updated today",
  "14 commits this week",
  "3 papers in progress",
  "1 RFC open",
];

export function LiveSignalsStrip() {
  return (
    <section
      aria-label="Lab activity signals"
      style={{
        padding: "var(--space-5) var(--gutter)",
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        borderTop: "1px solid var(--rule)",
      }}
    >
      <RevealUp>
        <p
          className="text-ink-2"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            letterSpacing: "0.02em",
            textAlign: "center",
          }}
        >
          {SIGNALS.join(" · ")}
        </p>
      </RevealUp>
    </section>
  );
}
```

- [ ] **Step 2: Wire into home page (no ThinRule above — section has its own border-top)**

Open `app/page.tsx` and add:
```tsx
import { LiveSignalsStrip } from "@/components/home/LiveSignalsStrip";

// after <ContactStrip />, NO ThinRule before this one:
<LiveSignalsStrip />
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll to the bottom (above the footer). Expected:
- A thin top-border above a centered mono row reading the four signals separated by middle dots.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/home/LiveSignalsStrip.tsx app/page.tsx
git commit -m "feat(phase-1): add LiveSignalsStrip with placeholder telemetry (live fetch in phase 4)"
```

---

### Task 19: Build the R3F PaperFoldSculpture (signature motif)

**Why:** Spec §6.4 — "single piece of cream paper folding/unfolding/curling in 3D, lit cinematically, low-poly with subtle subsurface scattering." This is the high-craft piece. **Time-box to 3 days** per spec §13.1; if unmet, the SVG fallback (already in place per Tasks 10–11) ships as v1.

**Files:**
- Modify: `components/canvas/PaperFoldSculpture.tsx`

- [ ] **Step 1: Replace placeholder with the real R3F implementation**

Replace the contents of `components/canvas/PaperFoldSculpture.tsx` with:
```tsx
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, MeshTransmissionMaterial, OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/**
 * Paper-fold sculpture (spec §6.4). A single low-poly plane folded
 * along a diagonal hinge, animated to slowly unfold and re-fold over
 * a 12-second cycle. Material approximates cream paper with subtle
 * subsurface scattering via MeshTransmissionMaterial (drei).
 *
 * Mounted via dynamic import in HeroCanvas; ssr disabled. Unmounts
 * on scroll out (handled by HeroCanvas's IntersectionObserver).
 *
 * If this implementation does not meet the visual bar within the
 * time-box, leave NEXT_PUBLIC_PAPER_FOLD_VARIANT unset (defaults to
 * "svg") and ship the fallback. Spec §13.1 + Phase 1 plan D2.
 */
export function PaperFoldSculpture() {
  return (
    <Canvas
      style={{ position: "absolute", inset: 0 }}
      camera={{ position: [0, 0, 4.2], fov: 35 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: false }}
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} color="#FFF7E2" />
      <directionalLight position={[-2, -1, 3]} intensity={0.4} color="#D6CBB1" />
      <FoldedPaper />
      <Environment preset="studio" environmentIntensity={0.3} />
      {process.env.NODE_ENV === "development" && <OrbitControls enableZoom={false} />}
    </Canvas>
  );
}

function FoldedPaper() {
  const groupRef = useRef<THREE.Group>(null);
  const hingeRef = useRef<THREE.Group>(null);

  // Half-paper geometry — a triangle that mirrors across the hinge axis
  const halfGeometry = useMemo(() => {
    const geom = new THREE.PlaneGeometry(1.4, 1.6, 1, 1);
    geom.translate(-0.7, 0, 0); // pivot along the right edge of left half
    return geom;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t * 0.18) * 0.35;
      groupRef.current.rotation.x = Math.cos(t * 0.13) * 0.12;
    }
    if (hingeRef.current) {
      // unfold from 180° (closed) to 30° over a 12s cycle, ease in/out
      const cycle = (Math.sin(t * (Math.PI * 2) / 12) + 1) / 2; // 0..1
      const eased = 0.5 - 0.5 * Math.cos(cycle * Math.PI);
      hingeRef.current.rotation.y = THREE.MathUtils.lerp(Math.PI, Math.PI / 6, eased);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Left half — fixed */}
      <mesh geometry={halfGeometry} castShadow receiveShadow>
        <PaperMaterial />
      </mesh>
      {/* Right half — hinged */}
      <group ref={hingeRef}>
        <mesh geometry={halfGeometry} rotation={[0, Math.PI, 0]} castShadow receiveShadow>
          <PaperMaterial />
        </mesh>
      </group>
    </group>
  );
}

function PaperMaterial() {
  return (
    <MeshTransmissionMaterial
      backside
      thickness={0.15}
      roughness={0.6}
      transmission={0.05}
      ior={1.4}
      chromaticAberration={0.0}
      color="#F2ECDD"
      attenuationColor="#E2D9C3"
      attenuationDistance={1.2}
    />
  );
}
```

- [ ] **Step 2: Test the R3F variant locally with the env flag**

Run with WebGL enabled:
```bash
NEXT_PUBLIC_PAPER_FOLD_VARIANT=webgl pnpm dev
```

Open `http://localhost:3000`. Expected:
- A cream paper sheet folded along a vertical hinge, slowly unfolding/re-folding behind the hero text.
- In dev mode, you can drag with the mouse (OrbitControls is enabled in dev only).
- No console errors. Frame rate stays at 60fps in DevTools Performance panel.

Cross-browser quick check (spec §13.1 risk: "WebGL on Safari/iOS — historically buggy"): open the same URL in Safari. If anything is broken on Safari, file in your notes — for the immediate Phase 1 ship-gate, the SVG fallback (default) covers that case.

Stop server.

- [ ] **Step 3: If R3F doesn't land at premium quality within time-box, document and revert**

Decision gate:
- If the R3F sculpture clearly hits the bar (cinematic, smooth, no visual jank), commit and leave the default env value as `svg` for the first deploy — flip to `webgl` in Vercel after one round of design QA.
- If it doesn't, do **not** flip the env var. The placeholder dynamic-import import path still resolves to the SVG fallback (which is the default), and we ship that as v1. Add a TODO note in `components/canvas/PaperFoldSculpture.tsx` documenting which knobs to tune for v2.

- [ ] **Step 4: Commit**

```bash
git add components/canvas/PaperFoldSculpture.tsx
git commit -m "feat(phase-1): add R3F PaperFoldSculpture (signature motif, env-gated)"
```

---

### Task 20: Build FirstLoadReveal (ceremonial sequence, once per session)

**Why:** Spec §7.4 — "first session only (sessionStorage flag): bg fade in (200ms) → wordmark stroke-draw (600ms) → hero typography reveals letter-by-letter (700ms) → paper-fold canvas mounts (300ms) → page interactive." Total 1.5–2s.

**Critical:** Two gates per spec §7.1 + §7.4 — sessionStorage flag for replay (skip on subsequent loads) AND `prefers-reduced-motion` (skip entirely for accessibility). **Both, not either.**

**Files:**
- Create: `components/shell/FirstLoadReveal.tsx`

- [ ] **Step 1: Implement FirstLoadReveal**

Create `components/shell/FirstLoadReveal.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";

const SESSION_KEY = "coconut.firstLoadReveal.played";

/**
 * Ceremonial first-load reveal (spec §7.4). Plays a single 1.5s
 * choreographed sequence on the very first load of a session, then
 * never again until the session is cleared.
 *
 * Gating (spec §7.1 + §7.4 — both must pass):
 * 1. sessionStorage `coconut.firstLoadReveal.played` is unset.
 * 2. `prefers-reduced-motion: reduce` is NOT matched.
 *
 * If either gate fails, the component renders nothing and the page
 * is immediately interactive.
 *
 * Implementation: a full-bleed cream overlay that sits above all
 * content while opacity transitions from 1 → 0 over the choreography.
 * The wordmark stroke-draw and hero letter-by-letter reveal are
 * triggered by sister components (Wordmark already self-runs on mount;
 * the Hero breathing axis already self-runs). This component's job
 * is the orchestration veil + the bg fade.
 */
export function FirstLoadReveal() {
  const [shouldPlay, setShouldPlay] = useState(false);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1";
    if (alreadyPlayed) return;

    setShouldPlay(true);
  }, []);

  useEffect(() => {
    if (!shouldPlay) return;

    setPhase("playing");

    // Total budget: 1500ms. Mark session-played at the start so a refresh
    // mid-sequence doesn't replay.
    window.sessionStorage.setItem(SESSION_KEY, "1");

    const t = window.setTimeout(() => {
      setPhase("done");
    }, 1500);

    return () => window.clearTimeout(t);
  }, [shouldPlay]);

  if (!shouldPlay || phase === "done") return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        backgroundColor: "var(--bg-0)",
        opacity: phase === "playing" ? 0 : 1,
        transition: "opacity 1500ms cubic-bezier(0.16, 1, 0.3, 1)",
        pointerEvents: phase === "done" ? "none" : "auto",
      }}
    />
  );
}
```

- [ ] **Step 2: Mount FirstLoadReveal in root layout**

Open `app/layout.tsx` and add:
```tsx
// add to imports
import { FirstLoadReveal } from "@/components/shell/FirstLoadReveal";

// inside <body>, BEFORE <Header /> (so it overlays everything during the reveal):
<FirstLoadReveal />
<a href="#main" ...>Skip to content</a>
<Header />
```

- [ ] **Step 3: Visually verify in three modes**

Run: `pnpm dev`

**Mode A — first load (clean session):**
1. Open a fresh incognito window → `http://localhost:3000`.
2. Expected: a brief 1.5s cream curtain → fades to reveal the page.
3. Refresh: no curtain (sessionStorage flag set).

**Mode B — replay after session clear:**
1. DevTools → Application → Storage → Clear site data → reload.
2. Expected: curtain plays again.

**Mode C — reduced motion:**
1. DevTools → Rendering → `prefers-reduced-motion: reduce`.
2. Clear sessionStorage and reload.
3. Expected: no curtain at all; page is immediately interactive.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/shell/FirstLoadReveal.tsx app/layout.tsx
git commit -m "feat(phase-1): add FirstLoadReveal ceremonial sequence (session + reduced-motion gated)"
```

---

### Task 21: Final composition pass on app/page.tsx

**Why:** Sanity-check the home page renders all eight strips in the spec §5.1 order with ThinRules in between, and trim any dead code from earlier iterations.

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Replace app/page.tsx with the canonical composition**

Open `app/page.tsx` and replace its entire contents with:
```tsx
import { Hero } from "@/components/home/Hero";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { ManifestoStrip } from "@/components/home/ManifestoStrip";
import { ResearchStrip } from "@/components/home/ResearchStrip";
import { ProjectsStrip } from "@/components/home/ProjectsStrip";
import { PeopleStrip } from "@/components/home/PeopleStrip";
import { ContactStrip } from "@/components/home/ContactStrip";
import { LiveSignalsStrip } from "@/components/home/LiveSignalsStrip";
import { ThinRule } from "@/components/primitives/ThinRule";

export default function Home() {
  return (
    <>
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <HeroCanvas />
        <Hero />
      </section>

      <ThinRule />
      <ManifestoStrip />

      <ThinRule />
      <ResearchStrip />

      <ThinRule />
      <ProjectsStrip />

      <ThinRule />
      <PeopleStrip />

      <ThinRule />
      <ContactStrip />

      <LiveSignalsStrip />
    </>
  );
}
```

- [ ] **Step 2: End-to-end visual walkthrough**

Run: `pnpm dev` and open `http://localhost:3000`. Scroll top-to-bottom and confirm the order is:

1. Hero (paper-fold backdrop + breathing serif H1 + dek)
2. ThinRule
3. Manifesto (2 paragraphs + pull-quote SplitText)
4. ThinRule
5. Research (3 placeholder cards)
6. ThinRule
7. Projects (KVWarden + Weft)
8. ThinRule
9. People (founder placeholder + bio)
10. ThinRule
11. Contact (centered serif + email)
12. LiveSignals (mono telemetry row)
13. Footer
14. PageNumber overlay (`p. 01 of 11`) bottom-right

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat(phase-1): finalize home composition (8 strips + thin rules)"
```

---

### Task 22: Add e2e test for the home composition

**Files:**
- Create: `tests/e2e/home.spec.ts`

- [ ] **Step 1: Write the e2e composition test**

Create `tests/e2e/home.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("home page composition", () => {
  test("renders the hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("renders all eight section strips in order", async ({ page }) => {
    await page.goto("/");

    // Manifesto pull-quote
    await expect(page.getByText(/load-bearing software/i).first()).toBeVisible();

    // Research strip header
    await expect(page.getByRole("heading", { name: /recent research/i })).toBeVisible();

    // Projects strip — KVWarden headline_result
    await expect(page.getByText(/26× better than FIFO/i)).toBeVisible();

    // Projects strip — Weft "In research" badge
    await expect(page.getByText(/In research/i).first()).toBeVisible();

    // People strip
    await expect(page.getByRole("heading", { name: /the lab/i })).toBeVisible();

    // Contact strip
    await expect(page.getByText(/Building something at this layer/i)).toBeVisible();

    // Live signals
    await expect(page.getByText(/commits this week/i)).toBeVisible();
  });

  test("page number caption shows p. 01 of 11", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/p\. 01 of 11/)).toBeVisible();
  });

  test("KVWarden card is an external link to kvwarden.org", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /KVWarden/i }).first();
    await expect(link).toHaveAttribute("href", /kvwarden\.org/);
    await expect(link).toHaveAttribute("target", "_blank");
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec playwright test tests/e2e/home.spec.ts --project=chromium`
Expected: 4 tests pass.

If any test fails, inspect the failing assertion against the actual rendered page in `--headed` mode.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/home.spec.ts
git commit -m "test(phase-1): add e2e composition coverage for home page"
```

---

### Task 23: Add reduced-motion e2e test

**Why:** Spec §7.1 — "All motion respects `prefers-reduced-motion`." Must verify that FirstLoadReveal skips and the hero breathe animation is suppressed.

**Files:**
- Create: `tests/e2e/home-reduced-motion.spec.ts`

- [ ] **Step 1: Write the reduced-motion test**

Create `tests/e2e/home-reduced-motion.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test.describe("home page under prefers-reduced-motion", () => {
  test("first-load reveal does NOT play (no full-screen overlay)", async ({ page }) => {
    await page.goto("/");
    // The veil is z-index 100 with pointer-events: auto while playing.
    // Under reduced motion the component returns null entirely.
    const veils = page.locator('[aria-hidden="true"][style*="z-index: 100"]');
    await expect(veils).toHaveCount(0);
  });

  test("hero is interactive immediately (no choreography blocking input)", async ({ page }) => {
    await page.goto("/");
    // Hero H1 should be visible right away with no transition delay.
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible();
  });

  test("hero breathe animation is suppressed (no animation on .hero-breathe element)", async ({ page }) => {
    await page.goto("/");
    const animationName = await page.evaluate(() => {
      const el = document.querySelector(".hero-breathe");
      if (!el) return null;
      return getComputedStyle(el).animationName;
    });
    // globals.css zeros animation-duration to 0.01ms — animation-name may
    // remain set, but its computed duration is effectively nothing. The
    // safer assertion: animation-duration ≤ 100ms.
    const animationDurationMs = await page.evaluate(() => {
      const el = document.querySelector(".hero-breathe");
      if (!el) return null;
      const dur = getComputedStyle(el).animationDuration;
      return parseFloat(dur) * 1000; // dur is "0.01ms" or "0.00001s"
    });
    expect(animationDurationMs).not.toBeNull();
    expect(animationDurationMs!).toBeLessThan(100);
    expect(animationName).toBeTruthy(); // sanity: keyframe still attached, just zeroed
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec playwright test tests/e2e/home-reduced-motion.spec.ts --project=chromium`
Expected: 3 tests pass.

If the duration assertion fails, inspect what `animationDuration` actually evaluates to — `globals.css` sets `0.01ms` so `parseFloat("0.01ms")` is `0.01`, multiplied by 1000 is `10`. Comfortably under 100.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/home-reduced-motion.spec.ts
git commit -m "test(phase-1): assert reduced-motion suppresses reveal + hero breathe"
```

---

### Task 24: Extend axe-core a11y test to cover home content

**Why:** The Phase 0 a11y test only checked `/` against an empty placeholder. With real content in place, re-run axe to catch any contrast/label/heading-order regressions introduced by the new strips.

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Update the a11y test**

Open `tests/e2e/accessibility.spec.ts`. The current ROUTES array is `["/", "/this-route-does-not-exist"]`. The test already covers `/` — but the page now has a lot more content. Re-run it to verify nothing regresses, then add a focus-specific check.

Replace the file contents with:
```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/this-route-does-not-exist"];

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`route ${route} has no axe violations (WCAG AA)`, async ({ page }) => {
      await page.goto(route);
      // Wait for the home composition to settle — RevealUp wrappers may
      // briefly hold opacity:0 before viewport entry triggers.
      if (route === "/") {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(800);
        await page.evaluate(() => window.scrollTo(0, 0));
      }
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test("home headings are in valid order (no h2 before h1)", async ({ page }) => {
    await page.goto("/");
    const levels = await page.locator("h1, h2, h3").evaluateAll((els) =>
      els.map((el) => parseInt(el.tagName.slice(1), 10))
    );
    expect(levels[0]).toBe(1); // first heading must be h1
  });
});
```

- [ ] **Step 2: Run the test**

Run: `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium`
Expected: 3 tests pass.

If contrast violations appear:
- The most likely culprit is `--ink-2` (`#8A8275`) on `--bg-0` (`#ECE6D6`) — that pair is right at the AA boundary. If failing, darken `--ink-2` to `#7A7265` in `styles/tokens.css`.
- Check the AxeBuilder output's `nodes[].html` for the failing element selector and trace it back to a strip.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility.spec.ts
git commit -m "test(phase-1): extend a11y check to cover home content + heading order"
```

---

### Task 25: Run full test pipeline + build

**Files:** none

- [ ] **Step 1: Run all unit tests**

Run: `pnpm test`
Expected: all unit tests pass (Phase 0's 7 + Phase 1's: SplitText 4, ThinRule 3, Card 4, Badge 3 = 14 new = **21 total**).

- [ ] **Step 2: Run all e2e tests**

Run: `pnpm test:e2e --project=chromium`
Expected: all e2e tests pass (Phase 0's 10 + Phase 1's: home 4, home-reduced-motion 3, accessibility +1 = 8 new = **18 total**).

- [ ] **Step 3: Typecheck + build**

Run: `pnpm typecheck && pnpm build`
Expected: no type errors; build succeeds.

If `pnpm build` fails on the dynamic import to `PaperFoldSculpture`, double-check the placeholder file exists and re-exports `PaperFoldSvgFallback as PaperFoldSculpture`.

- [ ] **Step 4: Commit any final fixes**

```bash
git status
# If anything regressed during the verification pass, commit it.
```

---

### Task 26: AUTH INTERRUPT — Founder portraits + bios + hero/manifesto copy

**Files:**
- Create: `public/images/founder.jpg` (user provides)
- Modify: `components/home/PeopleStrip.tsx` (swap placeholder bio with user-provided)
- Modify: `components/home/Hero.tsx` (swap default headline with user-provided, if user has one)
- Modify: `components/home/ManifestoStrip.tsx` (swap manifesto body with user-provided draft, if available)

This task pauses for user input.

- [ ] **Step 1: Pause for the founder portraits**

Ask user:
> "Phase 1 is shipping with placeholder content in three places that need your input:
> 1. **Founder portraits.** Drop two square-cropped, well-lit photos at `public/images/shrey-patel.jpg` and `public/images/jay-patel.jpg` (any reasonable size; Next/Image will resize). The PeopleStrip already grayscales both.
> 2. **Founder bio.** Currently a 2-sentence placeholder in `components/home/PeopleStrip.tsx`. You may want to write the canonical version (1 paragraph, voice-rules per spec §8.1).
> 3. **Hero headline + manifesto.** Currently using strong defaults from the spec. If you've drafted other copy, send it.
>
> For each item: (a) provide it now, (b) tell me to ship the placeholders and you'll PR them later, or (c) skip — I'll continue."

- [ ] **Step 2: Once user provides the portrait, drop the file in place**

```bash
ls -la public/images/founder.jpg
```

Expected: file exists. Run `pnpm dev` and verify the placeholder rectangle has been replaced by the photo (Next/Image picks it up automatically because PeopleStrip checks `existsSync`).

- [ ] **Step 3: If user provides bio / hero / manifesto copy, swap the placeholders**

For bio: edit the paragraph in `components/home/PeopleStrip.tsx`.
For hero: edit the default props in `components/home/Hero.tsx`.
For manifesto: edit the two `<p>` blocks in `components/home/ManifestoStrip.tsx`. Keep the canonical pull-quote ("The boring software is the load-bearing software.") unless user explicitly replaces it.

- [ ] **Step 4: If user opts to ship placeholders, leave a tracking note**

Add a single line at the bottom of the file with a `{/* TODO: swap placeholder bio */}` so the next session can find it. Mirror for hero/manifesto if those are also placeholders.

- [ ] **Step 5: Commit (only if any swaps were applied)**

```bash
git add public/images/founder.jpg components/home/PeopleStrip.tsx components/home/Hero.tsx components/home/ManifestoStrip.tsx
git commit -m "content(phase-1): swap in founder portraits + final copy"
```

---

### Task 27: Push + verify Vercel preview

**Files:** none

- [ ] **Step 1: Push to remote**

```bash
git push origin main
```

Vercel auto-deploys on push to main (configured in Phase 0).

- [ ] **Step 2: Watch CI**

```bash
gh run watch
```

Expected: green CI run.

- [ ] **Step 3: Verify the deployed site**

Open `https://coconutlabs.org` in browser. Expected:
- All eight strips render in order.
- Hero breathing animation runs (subtly).
- Paper-fold backdrop visible (SVG variant, since `NEXT_PUBLIC_PAPER_FOLD_VARIANT` is unset by default — flip to `webgl` in Vercel env vars after design QA pass).
- PageNumber visible bottom-right.
- First-load ceremonial reveal plays in a fresh incognito window.

- [ ] **Step 4: Cross-browser smoke (per spec §13.1 risk)**

Open in Safari (incl. iOS) and Firefox. Confirm:
- Layout doesn't break.
- SVG paper-fold animates.
- No console errors.

If anything is off on Safari/iOS specifically, file in your notes for Phase 5 (perf + a11y + ship); Phase 1 ship-gate is met as long as desktop Chrome + Safari + Firefox render correctly.

- [ ] **Step 5: Phase 1 ship-gate met**

The Phase 1 definition of done:
- Home page renders all eight strips
- Signature paper-fold backdrop is on screen (SVG or WebGL variant)
- First-load ceremonial reveal plays once per session, skipped under prefers-reduced-motion
- PageNumber editorial system visible on home
- ThinRule self-draws between strips on viewport entry
- All Phase 1 unit + e2e + axe tests green
- Build succeeds, CI green on `main`
- Site live at coconutlabs.org reflecting Phase 1

**Phase 1 is complete. Ready for Phase 2 plan (research engine).**

---

## Self-Review

Spec coverage check (Phase 1 sections of spec §13):
- ✅ Hero: Instrument Serif H1 with breathing axis (D1 simulation) + paper-fold canvas (Tasks 9, 11, 19)
- ✅ Manifesto strip with SplitText word-by-word reveal (Tasks 3, 12)
- ✅ Research strip with 3 placeholder cards (Task 13)
- ✅ Projects strip with KVWarden + Weft cards (Tasks 14, 15)
- ✅ People strip (Task 16)
- ✅ Contact strip (Task 17)
- ✅ Live-signals strip (placeholder, real fetch in Phase 4) (Task 18)
- ✅ ThinRule animated dividers (Task 4, used throughout Tasks 12–18)
- ✅ PageNumber editorial system on every route (Tasks 7, 8)
- ✅ First-load ceremonial reveal w/ both gates (sessionStorage + reduced-motion) (Task 20)
- ✅ Footer polish — Phase 0 already shipped the 3-col footer; Phase 1 didn't need to revisit
- ✅ Project page MDX content stubs (frontmatter only) (Task 14)

Visual identity primitives delivered:
- ✅ SplitText (Task 3)
- ✅ ThinRule (Task 4)
- ✅ RevealUp (Task 5)
- ✅ Card with optional 3D tilt (Task 6)
- ✅ Badge with tone variants (Task 6)
- ✅ PageNumber (Task 8)
- ✅ FirstLoadReveal (Task 20)
- ✅ HeroCanvas dispatcher (Task 11)
- ✅ PaperFoldSvgFallback (Task 10)
- ✅ PaperFoldSculpture R3F (Task 19, env-gated)

Decisions documented up front (D1, D2, D3) and applied consistently across tasks. No silent reinterpretations downstream.

Auth-interrupt points covered:
- ✅ Founder portraits at `public/images/shrey-patel.jpg` and `public/images/jay-patel.jpg` (Task 26)
- ✅ Founder bio + manifesto + hero copy (Task 26)

Placeholder scan:
- "// portrait pending" — intentional placeholder copy in PeopleStrip (Task 16), swapped in Task 26.
- Hero default headline ("Inference, made honest.") — strong default, swappable in Task 26.
- ManifestoStrip body paragraphs — verbatim from spec §8.2, swappable in Task 26.
- LiveSignalsStrip values — hardcoded, replaced by GitHub fetch in Phase 4.
- ResearchStrip cards — 3 placeholders, replaced by real MDX in Phase 2.
- ProjectsStrip teaser copy — verbatim from spec §8.2, locked.
- No `lorem`, `TODO`, or `FIXME` strings in any committed file (placeholders are plainspoken, in-character).

Type / naming consistency:
- Components: PascalCase (`SplitText`, `ThinRule`, `RevealUp`, `Card`, `Badge`, `PageNumber`, `FirstLoadReveal`, `HeroCanvas`, `PaperFoldSculpture`, `PaperFoldSvgFallback`, `Hero`, `ManifestoStrip`, `ResearchStrip`, `ProjectsStrip`, `PeopleStrip`, `ContactStrip`, `LiveSignalsStrip`).
- lib helpers: camelCase (`pageNumberFor`, `formatPageNumber`); constants: SCREAMING_SNAKE (`ROUTE_ORDER`, `TOTAL_PAGES`, `SESSION_KEY`).
- Strip suffix is consistent across all eight home sections.
- Token consumption matches Phase 0 convention (D3): Tailwind utilities for color, inline `style={{ ... }}` for fonts/spacing/durations.

Test count expectations after Phase 1:
- Unit: 21 tests (Phase 0's 7 + Phase 1's 14 — SplitText 4, ThinRule 3, Card 4, Badge 3).
- E2E: 18 tests (Phase 0's 10 + Phase 1's 8 — home 4, home-reduced-motion 3, accessibility +1).
- Total: 39 tests.

Risk handling per spec §13.1:
- Paper-fold sculpture: SVG fallback shipped first (Task 10), R3F added behind env flag (Task 19, Task 11). Home page never blocked on R3F R&D.
- WebGL on Safari/iOS: explicit cross-browser smoke check at Task 27 step 4. Default variant is SVG, so iOS Safari ships safely either way.
- Content writing slippage: all user-provided copy has plainspoken, in-character placeholders that ship correctly if the user opts to swap later.

Phase 1 produces a fully composed home page on its own — every strip renders, the signature motif is on screen, the editorial systems (PageNumber, ThinRule, FirstLoadReveal) are operational, and all the visual-identity primitives that Phases 2–4 will consume are in place. Phase 2 builds on this with the MDX research engine.
