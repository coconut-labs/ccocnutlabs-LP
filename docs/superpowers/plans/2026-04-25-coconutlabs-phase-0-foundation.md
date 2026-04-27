# coconutlabs.org — Phase 0 (Foundation) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 1 of 6.** This plan covers Phase 0 only (Foundation). Subsequent phases get their own plans:

> **Amended 2026-04-26.** Three updates flowed in after this plan was first written:
> 1. **Co-founder Jay Patel** added (no Phase 0 impact beyond `humans.txt` — full PeopleStrip work lives in Phase 1)
> 2. **Email convention:** `info@coconutlabs.org` is the default footer/mailto address (was `hello@`)
> 3. **CursorLayer dropped entirely** — old Task 10 + the `<CursorLayer/>` slot in `app/layout.tsx` are removed below. System cursor used everywhere.


- `2026-04-25-coconutlabs-phase-0-foundation.md` ← this plan
- `…-phase-1-home-and-visual-identity.md` (next)
- `…-phase-2-research-engine.md`
- `…-phase-3-inner-pages.md`
- `…-phase-4-motion-polish.md`
- `…-phase-5-perf-a11y-ship.md`

**Goal:** Ship a deployed Next.js 15 site at `coconutlabs.org` with the global shell (header, footer, wordmark), design token system, variable fonts, infrastructure endpoints (RSS, sitemap, robots, humans, 404), and CI pipeline. Home page renders the wordmark + a "more soon" placeholder. No content strips yet — those land in Phase 1.

**Architecture:** Next.js 15 App Router + React 19 + TypeScript strict + Tailwind v4 (CSS-first config) + Server Components by default. Design tokens live in CSS variables in `styles/tokens.css` and Tailwind v4's `@theme` block consumes them. Variable fonts loaded via `next/font` for auto-subsetting and zero CLS. Wordmark is a hand-drawn SVG with stroke-draw animation, used in header + footer + OG images.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Geist (font), Fraunces (font), Instrument Serif (font), Vitest, Playwright, axe-core, GitHub Actions, Vercel, Cloudflare DNS.

**Prerequisites:**
- Spec at `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md` (committed `94c441f`)
- Working directory: `/Users/shrey/Personal Projects/coconutlabs/`
- Git repo initialized (already done)
- `pnpm` installed globally (`npm install -g pnpm`)
- Node 22 LTS

---

## File Structure (Phase 0 deliverables)

```
coconutlabs/
├── package.json                          deps + scripts
├── pnpm-lock.yaml                        lockfile
├── tsconfig.json                         TS strict
├── next.config.ts                        Next config
├── postcss.config.mjs                    Tailwind v4 PostCSS plugin
├── playwright.config.ts                  e2e config
├── vitest.config.ts                      unit config
├── .gitignore
├── .nvmrc                                node 22
├── README.md
├── .github/workflows/ci.yml              GH Actions: typecheck + test + build
├── app/
│   ├── layout.tsx                        root layout: Header + RouteTransition + Footer
│   ├── page.tsx                          home placeholder ("Coconut Labs · more soon")
│   ├── globals.css                       Tailwind imports + token import
│   ├── not-found.tsx                     basic 404 (Phase 4 polishes)
│   ├── robots.ts
│   ├── sitemap.ts
│   └── rss.xml/route.ts                  Atom 1.0 stub
├── components/
│   ├── shell/
│   │   ├── Header.tsx                    sticky blurred header with wordmark + nav stub
│   │   ├── Footer.tsx                    3-col mono footer
│   │   └── RouteTransition.tsx           passthrough wrapper (Phase 4 fills in)
│   └── primitives/
│       └── Wordmark.tsx                  SVG path + stroke-draw animation
├── lib/
│   ├── content.ts                        frontmatter loaders (used Phase 1+)
│   └── seo.ts                            buildMetadata() helper
├── public/
│   ├── wordmark.svg                      hand-drawn SVG
│   ├── humans.txt
│   └── favicon.ico
├── styles/
│   └── tokens.css                        CSS variables for color/type/spacing
└── tests/
    ├── unit/
    │   ├── lib/content.test.ts
    │   └── lib/seo.test.ts
    └── e2e/
        ├── shell.spec.ts                 header + footer render
        └── infra.spec.ts                 robots, sitemap, rss, humans
```

**File responsibility boundaries:**
- `styles/tokens.css` is the single source of truth for color/type/spacing values. Every other styling consumes these via CSS variables — no hardcoded hex values anywhere else.
- `app/globals.css` is the only place that imports Tailwind. All other CSS imports go through Tailwind utilities or component-level styles.
- `components/shell/*` is the global chrome. Page-section components (Hero, ManifestoStrip, etc.) are not Phase 0.
- `lib/*` is pure logic (no React). Tested with Vitest.
- `components/*` is React components. Tested with Playwright (rendering) and Vitest (component logic where it exists).

---

## Tasks

### Task 1: Initialize Next.js 15 project with TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, `.gitignore`, `.nvmrc`

- [ ] **Step 1: Verify working directory and Node version**

Run: `cd "/Users/shrey/Personal Projects/coconutlabs" && node --version && pnpm --version`
Expected: Node v22.x.x, pnpm 9.x or 10.x

- [ ] **Step 2: Bootstrap Next.js with create-next-app**

Run:
```bash
cd "/Users/shrey/Personal Projects/coconutlabs"
pnpm create next-app@15 . --typescript --tailwind --app --no-eslint --no-src-dir --import-alias "@/*" --use-pnpm
```

When prompted:
- Use Turbopack? → **No** (we'll add later if needed; keep build-system surface area minimal at first)
- Customize default import alias? → already specified `@/*`

If pnpm asks "the directory is not empty," confirm `Y` (the only existing dirs are `.git/` and `docs/` which create-next-app leaves alone).

Expected: project scaffolded with `app/`, `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts` (we'll delete this), `app/globals.css`, etc.

- [ ] **Step 3: Verify dev server runs**

Run: `pnpm dev`
Open `http://localhost:3000` in browser.
Expected: default Next.js welcome page renders.
Stop server with Ctrl+C.

- [ ] **Step 4: Pin Node version**

Create file `.nvmrc`:
```
22
```

- [ ] **Step 5: Set TypeScript strict mode**

Open `tsconfig.json` and confirm `"strict": true` is set under `compilerOptions`. Also add these settings if missing:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(phase-0): bootstrap next.js 15 + typescript strict"
```

---

### Task 2: Switch from Tailwind v3 (default) to Tailwind v4

**Why:** `create-next-app` ships Tailwind v3 by default in early 2026. Tailwind v4 has a CSS-first config (`@theme`) that's a much better fit for our token-driven system.

**Files:**
- Delete: `tailwind.config.ts` (v3 JS config no longer needed)
- Modify: `app/globals.css`, `package.json`
- Create: `postcss.config.mjs`

- [ ] **Step 1: Remove v3 packages**

Run:
```bash
pnpm remove tailwindcss postcss autoprefixer
```

- [ ] **Step 2: Install v4 packages**

Run:
```bash
pnpm add -D tailwindcss@^4 @tailwindcss/postcss@^4
```

- [ ] **Step 3: Replace PostCSS config**

Delete any existing `postcss.config.mjs`, `postcss.config.js`, or `postcss.config.json`, then create `postcss.config.mjs`:
```js
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
```

- [ ] **Step 4: Replace globals.css with v4 import**

Open `app/globals.css` and replace its entire contents with:
```css
@import "tailwindcss";
```

- [ ] **Step 5: Delete the old tailwind.config.ts**

Run:
```bash
rm -f tailwind.config.ts tailwind.config.js
```

- [ ] **Step 6: Verify dev server still runs with v4**

Run: `pnpm dev`
Open `http://localhost:3000`. Expected: page renders without errors (default Next.js page styling will look different — that's fine, we're replacing it anyway).
Stop server.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(phase-0): switch to tailwind v4 (css-first config)"
```

---

### Task 3: Install runtime + dev dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install motion + 3D + content libs**

Run:
```bash
pnpm add motion@^11 lenis@^1 three@^0.170 @react-three/fiber@^9 @react-three/drei@^9 \
  @next/mdx@^15 @mdx-js/loader@^3 @mdx-js/react@^3 gray-matter@^4 \
  shiki@^1 lucide-react@^0.450 \
  @vercel/og@^0.6 \
  geist@^1
```

- [ ] **Step 2: Install Vitest + Playwright + axe**

Run:
```bash
pnpm add -D vitest@^2 @vitejs/plugin-react@^4 @vitest/ui@^2 jsdom@^25 \
  @playwright/test@^1.48 axe-core@^4 @axe-core/playwright@^4 \
  @types/three @types/node
```

- [ ] **Step 3: Install Playwright browsers**

Run: `pnpm exec playwright install chromium firefox webkit`
Expected: browsers download (~300MB).

- [ ] **Step 4: Verify install**

Run: `pnpm install`
Expected: lockfile resolves, no peer-dep errors. If a peer warning appears for React 19, ignore it — the listed versions all support React 19 as of 2026-04.

Run: `pnpm exec next --version && pnpm exec vitest --version && pnpm exec playwright --version`
Expected: each prints a version number.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(phase-0): install motion, 3d, content, test deps"
```

---

### Task 4: Set up design tokens in styles/tokens.css

**Files:**
- Create: `styles/tokens.css`
- Modify: `app/globals.css`

- [ ] **Step 1: Create tokens file**

Create `styles/tokens.css` with these exact values from spec §6.1, §6.3, §6.8:
```css
:root {
  /* Color — neither dark nor light (warm paper / coconut husk) */
  --bg-0: #ECE6D6;
  --bg-1: #F2ECDD;
  --bg-2: #DED5C2;
  --ink-0: #1A1611;
  --ink-1: #5C5447;
  --ink-2: #8A8275;
  --rule: #C8BFAB;
  --accent: #9B6B1F;
  --accent-2: #4A5B49;
  --success: #4A7355;
  --danger: #A53D2A;

  /* Spacing rhythm */
  --space-1: 8px;
  --space-2: 16px;
  --space-3: 24px;
  --space-4: 32px;
  --space-5: 48px;
  --space-6: 64px;
  --space-7: 96px;
  --space-8: 144px;

  /* Container */
  --container-max: 1280px;
  --gutter: clamp(24px, 4vw, 80px);
  --measure: 62ch;

  /* Type scale (font-family applied per element) */
  --fs-display-xl: clamp(64px, 8vw, 128px);
  --fs-display-lg: clamp(48px, 5vw, 80px);
  --fs-h1: clamp(40px, 4vw, 56px);
  --fs-h2: clamp(28px, 2.5vw, 40px);
  --fs-h3: 20px;
  --fs-body: 17px;
  --fs-ui: 14px;
  --fs-mono: 13px;

  /* Motion */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --dur-micro: 180ms;
  --dur-ui: 320ms;
  --dur-section: 520ms;
  --dur-page: 720ms;
}

/* Per-route paler bg variant for /research/[slug] long-form reading (spec §6.1) */
.theme-reading {
  --bg-0: #F4EFE2;
}
```

- [ ] **Step 2: Wire tokens.css into globals.css**

Open `app/globals.css` and replace contents with:
```css
@import "tailwindcss";
@import "../styles/tokens.css";

@theme {
  --color-bg-0: var(--bg-0);
  --color-bg-1: var(--bg-1);
  --color-bg-2: var(--bg-2);
  --color-ink-0: var(--ink-0);
  --color-ink-1: var(--ink-1);
  --color-ink-2: var(--ink-2);
  --color-rule: var(--rule);
  --color-accent: var(--accent);
  --color-accent-2: var(--accent-2);
  --color-success: var(--success);
  --color-danger: var(--danger);
}

html, body {
  background-color: var(--bg-0);
  color: var(--ink-0);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 3: Visual verify tokens are applied**

Run: `pnpm dev`
Open `http://localhost:3000`. Inspect `<body>` in DevTools — background should be `#ECE6D6` (warm cream).
Stop server.

- [ ] **Step 4: Commit**

```bash
git add styles/ app/globals.css
git commit -m "feat(phase-0): add design tokens (color/type/spacing/motion)"
```

---

### Task 5: Load variable fonts via next/font

**Files:**
- Create: `app/fonts.ts`
- Modify: `app/layout.tsx`, `styles/tokens.css`

- [ ] **Step 1: Create fonts.ts**

Create `app/fonts.ts`:
```ts
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Fraunces, Instrument_Serif } from "next/font/google";

export const geistSans = GeistSans;
export const geistMono = GeistMono;

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
});

export const instrumentSerif = Instrument_Serif({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
});
```

- [ ] **Step 2: Wire fonts into root layout**

Replace `app/layout.tsx` contents with:
```tsx
import type { Metadata } from "next";
import { geistSans, geistMono, fraunces, instrumentSerif } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coconut Labs",
  description: "An independent inference research lab.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Add font-family vars to tokens.css**

Open `styles/tokens.css` and append these lines inside the `:root` block (after the type scale block):
```css
  --font-display: var(--font-instrument-serif), Georgia, serif;
  --font-body: var(--font-fraunces), Georgia, serif;
  --font-ui: var(--font-geist-sans), system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;
```

Note: `--font-geist-sans` and `--font-geist-mono` are CSS variables that the `geist` package automatically defines on the `<html>` className via `GeistSans.variable` and `GeistMono.variable`.

- [ ] **Step 4: Update body to use UI font by default**

Open `app/globals.css` and modify the `html, body` block:
```css
html, body {
  background-color: var(--bg-0);
  color: var(--ink-0);
  font-family: var(--font-ui);
  font-size: var(--fs-body);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
```

- [ ] **Step 5: Test fonts load by adding a quick test page**

Replace `app/page.tsx` with:
```tsx
export default function Home() {
  return (
    <main style={{ padding: "var(--space-7) var(--gutter)" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--fs-display-lg)" }}>
        Coconut Labs
      </h1>
      <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--fs-body)", marginTop: "var(--space-3)" }}>
        An independent inference research lab.
      </p>
      <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)", display: "block", marginTop: "var(--space-2)" }}>
        // more soon
      </code>
    </main>
  );
}
```

- [ ] **Step 6: Visual verify all 4 fonts render**

Run: `pnpm dev`
Open `http://localhost:3000`. You should see:
- "Coconut Labs" in **Instrument Serif** (display serif, regular)
- "An independent inference research lab." in **Fraunces** (body serif)
- "// more soon" in **Geist Mono** (mono)
- The `<body>` default UI font is **Geist Sans** (visible if you inspect)

Open DevTools → Computed → Font Family for each element to confirm.
Stop server.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(phase-0): load variable fonts (geist, fraunces, instrument serif)"
```

---

### Task 6: Hand-draw the Coconut Labs SVG wordmark

**Files:**
- Create: `public/wordmark.svg`

The wordmark is "Coconut Labs" rendered as a single SVG path. v1 uses an honest-but-restrained drawing — letters in a clean geometric serif treatment, with a small custom flourish on the `L` and a `ct` ligature. We're not commissioning a typeface; this is one wordmark drawn as one SVG.

- [ ] **Step 1: Create wordmark.svg**

Create `public/wordmark.svg` with this content. This is a plausible v1 — clean geometric letterforms with the spec's required flourish on `L` and `ct` ligature. It can be art-directed/refined later without changing the API:
```xml
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 600 80"
  fill="none"
  stroke="currentColor"
  stroke-width="2.5"
  stroke-linecap="round"
  stroke-linejoin="round"
  aria-label="Coconut Labs"
  role="img"
>
  <title>Coconut Labs</title>
  <!-- C -->
  <path d="M 50 25 Q 30 25 30 45 Q 30 65 50 65" />
  <!-- o -->
  <path d="M 75 45 Q 75 32 87 32 Q 99 32 99 45 Q 99 58 87 58 Q 75 58 75 45 Z" />
  <!-- c -->
  <path d="M 130 38 Q 118 38 118 48 Q 118 58 130 58" />
  <!-- ct ligature: t crossbar shared with c top -->
  <path d="M 138 28 L 138 58 Q 138 65 145 64 M 130 38 L 152 38" />
  <!-- o -->
  <path d="M 168 45 Q 168 32 180 32 Q 192 32 192 45 Q 192 58 180 58 Q 168 58 168 45 Z" />
  <!-- n -->
  <path d="M 210 58 L 210 32 Q 210 32 222 32 Q 234 32 234 42 L 234 58" />
  <!-- u -->
  <path d="M 252 32 L 252 50 Q 252 58 262 58 Q 272 58 272 50 L 272 32" />
  <!-- t -->
  <path d="M 290 22 L 290 56 Q 290 60 296 60 M 284 34 L 300 34" />
  <!-- (space) -->
  <!-- L with custom flourish -->
  <path d="M 340 22 L 340 60 L 365 60 Q 372 60 374 56" />
  <!-- a -->
  <path d="M 395 38 Q 395 32 405 32 Q 415 32 415 42 L 415 58 M 415 48 Q 405 48 400 50 Q 395 53 395 56 Q 395 60 402 60 Q 411 60 415 54" />
  <!-- b -->
  <path d="M 437 22 L 437 58 Q 437 58 449 58 Q 461 58 461 46 Q 461 32 449 32 Q 442 32 437 38" />
  <!-- s -->
  <path d="M 500 35 Q 495 32 488 32 Q 482 32 482 38 Q 482 43 488 44 L 495 46 Q 502 47 502 53 Q 502 60 493 60 Q 485 60 481 56" />
</svg>
```

(This is a v1 approximation. Refinement happens during Phase 1 visual QA. The shape is a single coherent SVG that can be replaced with a tighter hand-drawn version without changing any code that consumes it.)

- [ ] **Step 2: Verify SVG renders**

Open `public/wordmark.svg` in a browser directly (drag the file into Chrome). Expected: a thin black "Coconut Labs" wordmark renders.

- [ ] **Step 3: Commit**

```bash
git add public/wordmark.svg
git commit -m "feat(phase-0): add hand-drawn coconut labs svg wordmark"
```

---

### Task 7: Build Wordmark primitive component with stroke-draw animation

**Files:**
- Create: `components/primitives/Wordmark.tsx`
- Create: `tests/unit/primitives/Wordmark.test.tsx`

- [ ] **Step 1: Write the component test**

Create `tests/unit/primitives/Wordmark.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Wordmark } from "@/components/primitives/Wordmark";

describe("Wordmark", () => {
  it("renders an SVG with role='img' and accessible name", () => {
    render(<Wordmark />);
    const wordmark = screen.getByRole("img", { name: /coconut labs/i });
    expect(wordmark).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<Wordmark className="text-accent" />);
    const wordmark = screen.getByRole("img", { name: /coconut labs/i });
    expect(wordmark).toHaveClass("text-accent");
  });

  it("respects animate=false (no stroke animation)", () => {
    const { container } = render(<Wordmark animate={false} />);
    const path = container.querySelector("path");
    expect(path?.style.strokeDasharray).toBe("");
  });
});
```

- [ ] **Step 2: Add testing-library deps**

Run:
```bash
pnpm add -D @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```

- [ ] **Step 3: Set up vitest config (will run all tests)**

Create `vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.{test,spec}.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `tests/setup.ts`:
```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `pnpm exec vitest run tests/unit/primitives/Wordmark.test.tsx`
Expected: FAIL with "Cannot find module '@/components/primitives/Wordmark'".

- [ ] **Step 5: Implement Wordmark component**

Create `components/primitives/Wordmark.tsx`:
```tsx
"use client";

import { useEffect, useRef } from "react";

type Props = {
  className?: string;
  animate?: boolean;
};

/**
 * Coconut Labs wordmark. Single SVG, optional stroke-draw on first paint.
 * Inherits color via `currentColor` (set via Tailwind text-* utilities).
 */
export function Wordmark({ className, animate = true }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!animate) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const paths = svgRef.current?.querySelectorAll("path");
    if (!paths) return;

    paths.forEach((p, i) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
      p.animate(
        [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
        {
          duration: 600,
          delay: i * 25,
          easing: "cubic-bezier(0.16, 1, 0.3, 1)",
          fill: "forwards",
        }
      );
    });
  }, [animate]);

  return (
    <svg
      ref={svgRef}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 600 80"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Coconut Labs"
      className={className}
    >
      <title>Coconut Labs</title>
      <path d="M 50 25 Q 30 25 30 45 Q 30 65 50 65" />
      <path d="M 75 45 Q 75 32 87 32 Q 99 32 99 45 Q 99 58 87 58 Q 75 58 75 45 Z" />
      <path d="M 130 38 Q 118 38 118 48 Q 118 58 130 58" />
      <path d="M 138 28 L 138 58 Q 138 65 145 64 M 130 38 L 152 38" />
      <path d="M 168 45 Q 168 32 180 32 Q 192 32 192 45 Q 192 58 180 58 Q 168 58 168 45 Z" />
      <path d="M 210 58 L 210 32 Q 210 32 222 32 Q 234 32 234 42 L 234 58" />
      <path d="M 252 32 L 252 50 Q 252 58 262 58 Q 272 58 272 50 L 272 32" />
      <path d="M 290 22 L 290 56 Q 290 60 296 60 M 284 34 L 300 34" />
      <path d="M 340 22 L 340 60 L 365 60 Q 372 60 374 56" />
      <path d="M 395 38 Q 395 32 405 32 Q 415 32 415 42 L 415 58 M 415 48 Q 405 48 400 50 Q 395 53 395 56 Q 395 60 402 60 Q 411 60 415 54" />
      <path d="M 437 22 L 437 58 Q 437 58 449 58 Q 461 58 461 46 Q 461 32 449 32 Q 442 32 437 38" />
      <path d="M 500 35 Q 495 32 488 32 Q 482 32 482 38 Q 482 43 488 44 L 495 46 Q 502 47 502 53 Q 502 60 493 60 Q 485 60 481 56" />
    </svg>
  );
}
```

- [ ] **Step 6: Run the test to verify it passes**

Run: `pnpm exec vitest run tests/unit/primitives/Wordmark.test.tsx`
Expected: PASS, 3/3 tests green.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "feat(phase-0): add wordmark primitive with stroke-draw animation"
```

---

### Task 8: Build Header shell component

**Files:**
- Create: `components/shell/Header.tsx`

- [ ] **Step 1: Implement Header**

Create `components/shell/Header.tsx`:
```tsx
import Link from "next/link";
import { Wordmark } from "@/components/primitives/Wordmark";

const NAV = [
  { href: "/research", label: "Research" },
  { href: "/work", label: "Work" },
  { href: "/papers", label: "Papers" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/projects/kvwarden", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/joinus", label: "Join us" },
];

export function Header() {
  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-rule"
      style={{
        backgroundColor: "color-mix(in srgb, var(--bg-0) 85%, transparent)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-2) var(--gutter)",
        }}
      >
        <Link href="/" aria-label="Coconut Labs home">
          <Wordmark
            className="text-ink-0"
            animate={false}
          />
        </Link>
        <nav aria-label="Primary">
          <ul
            className="flex items-center gap-x-6 list-none"
            style={{ fontFamily: "var(--font-ui)", fontSize: "var(--fs-ui)" }}
          >
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-ink-1 hover:text-ink-0 transition-colors"
                  style={{ transitionDuration: "var(--dur-micro)" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                className="text-ink-0 border border-rule hover:border-ink-0 px-3 py-1.5"
                style={{ transitionDuration: "var(--dur-micro)" }}
              >
                Contact
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
```

The Wordmark in the header needs to be a fixed display height. Add a width constraint via the `className` prop in a follow-up:

- [ ] **Step 2: Constrain wordmark width in header**

In `components/shell/Header.tsx`, change the Wordmark line to:
```tsx
<Wordmark
  className="text-ink-0 w-[180px] h-auto"
  animate={false}
/>
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev`
Open `http://localhost:3000`. Expected: header bar with wordmark on left, nav items + Contact button on right, blurred translucent backdrop. The links should be cream colored (`#5C5447` muted) and darken to ink on hover.
Stop server.

- [ ] **Step 4: Commit**

```bash
git add components/shell/Header.tsx
git commit -m "feat(phase-0): add header shell with wordmark + nav stub"
```

---

### Task 9: Build Footer shell component

**Files:**
- Create: `components/shell/Footer.tsx`

- [ ] **Step 1: Implement Footer**

Create `components/shell/Footer.tsx`:
```tsx
import Link from "next/link";

const NAV_REPEAT = [
  { href: "/research", label: "Research" },
  { href: "/work", label: "Work" },
  { href: "/papers", label: "Papers" },
  { href: "/podcasts", label: "Podcasts" },
  { href: "/projects/kvwarden", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/joinus", label: "Join us" },
  { href: "/contact", label: "Contact" },
];

const SOCIAL = [
  { href: "https://github.com/coconut-labs", label: "GitHub" },
  { href: "https://x.com/", label: "X" },
  { href: "https://huggingface.co/coconut-labs", label: "Hugging Face" },
  { href: "https://arxiv.org/", label: "arXiv" },
  { href: "https://scholar.google.com/", label: "Scholar" },
];

const META = [
  { href: "/rss.xml", label: "RSS" },
  { href: "mailto:info@coconutlabs.org", label: "Email" },
  { href: "/colophon", label: "Colophon" },
  { href: "/humans.txt", label: "humans.txt" },
];

export function Footer() {
  return (
    <footer
      className="border-t border-rule mt-auto"
      style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono)",
        color: "var(--ink-1)",
      }}
    >
      <div
        style={{
          maxWidth: "var(--container-max)",
          margin: "0 auto",
          padding: "var(--space-6) var(--gutter)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FooterColumn heading="Site" items={NAV_REPEAT} />
          <FooterColumn heading="Social" items={SOCIAL} external />
          <FooterColumn heading="Meta" items={META} />
        </div>
        <p
          className="mt-12 pt-6 border-t border-rule"
          style={{ color: "var(--ink-2)" }}
        >
          Coconut Labs · Made on a quiet workstation · 2026
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  heading,
  items,
  external = false,
}: {
  heading: string;
  items: { href: string; label: string }[];
  external?: boolean;
}) {
  return (
    <div>
      <h2
        className="uppercase tracking-wider mb-4"
        style={{ color: "var(--ink-2)", fontSize: "11px", letterSpacing: "0.1em" }}
      >
        {heading}
      </h2>
      <ul className="space-y-2 list-none">
        {items.map((item) => (
          <li key={item.href}>
            {external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-ink-0 transition-colors"
                style={{ transitionDuration: "var(--dur-micro)" }}
              >
                {item.label}
              </a>
            ) : (
              <Link
                href={item.href}
                className="hover:text-ink-0 transition-colors"
                style={{ transitionDuration: "var(--dur-micro)" }}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Visually verify**

Will verify after Task 11 wires shell into layout.

- [ ] **Step 3: Commit**

```bash
git add components/shell/Footer.tsx
git commit -m "feat(phase-0): add footer shell with 3-col layout"
```

---

### Task 10: Build RouteTransition stub

**Files:**
- Create: `components/shell/RouteTransition.tsx`

(Per 2026-04-26 amendment, the CursorLayer is dropped entirely — the system cursor is used throughout the site. Only the RouteTransition stub is created here; Phase 4 fills it in.)

- [ ] **Step 1: Create RouteTransition stub**

Create `components/shell/RouteTransition.tsx`:
```tsx
"use client";

import type { ReactNode } from "react";

/**
 * Route transition wrapper. Phase 4 will implement the page-tear /
 * page-fold WebGL transition (spec §7.3). For Phase 0 this is a
 * passthrough so the layout tree mirrors the final structure.
 */
export function RouteTransition({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Commit**

```bash
git add components/shell/RouteTransition.tsx
git commit -m "feat(phase-0): add route transition stub"
```

---

### Task 11: Wire shell into root layout + skip-to-content + minimal home

**Files:**
- Modify: `app/layout.tsx`, `app/page.tsx`

- [ ] **Step 1: Replace root layout**

Replace `app/layout.tsx` contents with:
```tsx
import type { Metadata } from "next";
import { geistSans, geistMono, fraunces, instrumentSerif } from "./fonts";
import { Header } from "@/components/shell/Header";
import { Footer } from "@/components/shell/Footer";
import { RouteTransition } from "@/components/shell/RouteTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Coconut Labs",
    template: "%s · Coconut Labs",
  },
  description: "An independent inference research lab.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${instrumentSerif.variable}`}
    >
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-bg-1 text-ink-0 px-3 py-2 z-50"
        >
          Skip to content
        </a>
        <Header />
        <RouteTransition>
          <main id="main" className="flex-1">
            {children}
          </main>
        </RouteTransition>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Replace home page with placeholder**

Replace `app/page.tsx` with:
```tsx
export default function Home() {
  return (
    <section
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-xl)",
          lineHeight: 0.95,
          letterSpacing: "-0.02em",
          color: "var(--ink-0)",
        }}
      >
        Coconut Labs
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-body)",
          color: "var(--ink-1)",
          marginTop: "var(--space-3)",
          maxWidth: "var(--measure)",
        }}
      >
        An independent inference research lab. The full home page lands in Phase 1.
      </p>
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-2)",
          display: "block",
          marginTop: "var(--space-3)",
        }}
      >
        // more soon
      </code>
    </section>
  );
}
```

- [ ] **Step 3: Visually verify**

Run: `pnpm dev`
Open `http://localhost:3000`. Expected:
- Header at top with wordmark + 7 nav items + Contact button
- Massive "Coconut Labs" title in Instrument Serif
- Body line in Fraunces
- "// more soon" in Geist Mono
- Footer at bottom with 3 columns
- Tab once: skip link appears in top-left

Stop server.

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(phase-0): wire shell into layout, placeholder home"
```

---

### Task 12: Set up content + seo helpers (lib/)

**Files:**
- Create: `lib/content.ts`
- Create: `lib/seo.ts`
- Create: `tests/unit/lib/content.test.ts`
- Create: `tests/unit/lib/seo.test.ts`
- Create: `content/projects/.gitkeep`

- [ ] **Step 1: Create empty content directory placeholder**

```bash
mkdir -p content/projects
touch content/projects/.gitkeep
```

- [ ] **Step 2: Write content loader test**

Create `tests/unit/lib/content.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { parseFrontmatter } from "@/lib/content";

describe("parseFrontmatter", () => {
  it("parses YAML frontmatter from a string", () => {
    const input = `---
title: Hello
date: 2026-04-25
draft: false
---

# Body content here`;
    const { data, content } = parseFrontmatter(input);
    expect(data).toEqual({ title: "Hello", date: new Date("2026-04-25"), draft: false });
    expect(content.trim()).toBe("# Body content here");
  });

  it("returns empty data when no frontmatter", () => {
    const { data, content } = parseFrontmatter("just body");
    expect(data).toEqual({});
    expect(content).toBe("just body");
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: FAIL with "Cannot find module '@/lib/content'".

- [ ] **Step 4: Implement lib/content.ts**

Create `lib/content.ts`:
```ts
import matter from "gray-matter";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const CONTENT_ROOT = join(process.cwd(), "content");

export type Frontmatter = Record<string, unknown>;

export function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const parsed = matter(raw);
  return { data: parsed.data, content: parsed.content };
}

export function loadFile(relativePath: string): { data: Frontmatter; content: string } {
  const full = join(CONTENT_ROOT, relativePath);
  const raw = readFileSync(full, "utf-8");
  return parseFrontmatter(raw);
}
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: PASS, 2/2 green.

- [ ] **Step 6: Write SEO helper test**

Create `tests/unit/lib/seo.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { buildMetadata } from "@/lib/seo";

describe("buildMetadata", () => {
  it("builds title with template-friendly default", () => {
    const meta = buildMetadata({ title: "Research", description: "Posts." });
    expect(meta.title).toBe("Research");
    expect(meta.description).toBe("Posts.");
  });

  it("builds OG image URL for the page", () => {
    const meta = buildMetadata({ title: "Hello", description: "world", path: "/research" });
    expect(meta.openGraph?.images?.[0]?.url).toContain("/api/og");
    expect(meta.openGraph?.images?.[0]?.url).toContain("title=Hello");
  });
});
```

- [ ] **Step 7: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/seo.test.ts`
Expected: FAIL.

- [ ] **Step 8: Implement lib/seo.ts**

Create `lib/seo.ts`:
```ts
import type { Metadata } from "next";

export type SeoInput = {
  title: string;
  description: string;
  path?: string;
};

export function buildMetadata({ title, description, path = "/" }: SeoInput): Metadata {
  const ogUrl = `/api/og?title=${encodeURIComponent(title)}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Coconut Labs",
      type: "website",
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogUrl],
    },
  };
}
```

- [ ] **Step 9: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/seo.test.ts`
Expected: PASS, 2/2 green.

- [ ] **Step 10: Run all unit tests**

Run: `pnpm exec vitest run`
Expected: all 7 tests across 3 files pass.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "feat(phase-0): add content + seo helpers with tests"
```

---

### Task 13: Add infrastructure endpoints — robots, sitemap, humans.txt, RSS stub

**Files:**
- Create: `app/robots.ts`, `app/sitemap.ts`, `public/humans.txt`, `app/rss.xml/route.ts`

- [ ] **Step 1: Create robots.ts**

Create `app/robots.ts`:
```ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
```

- [ ] **Step 2: Create sitemap.ts**

Create `app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";

const STATIC_ROUTES = [
  "",
  "/research",
  "/work",
  "/papers",
  "/podcasts",
  "/projects/kvwarden",
  "/projects/weft",
  "/joinus",
  "/about",
  "/contact",
  "/colophon",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1.0 : 0.7,
  }));
}
```

- [ ] **Step 3: Create humans.txt**

Create `public/humans.txt`:
```
/* TEAM */

Co-founder · Engineer
Shrey Patel
Site: https://coconutlabs.org
Email: shreypatel@coconutlabs.org
GitHub: https://github.com/ShreyPatel4

Co-founder · Engineer
Jay Patel
Site: https://coconutlabs.org
Email: jaypatel@coconutlabs.org
GitHub: https://github.com/jaypatel15406

General inquiries: info@coconutlabs.org

/* SITE */

Last update: 2026-04-25
Language: English
Stack: Next.js 15, React 19, TypeScript, Tailwind v4, R3F
Fonts: Instrument Serif, Fraunces, Geist, Geist Mono
Hosted on: Vercel · DNS via Cloudflare
Source: https://github.com/coconut-labs/coconutlabs-org
```

- [ ] **Step 4: Create RSS Atom stub**

Create `app/rss.xml/route.ts`:
```ts
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";

export async function GET() {
  // Phase 2 fills in real research entries from content/research/*.mdx
  const updated = new Date().toISOString();
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Coconut Labs — Research</title>
  <subtitle>Notes from an independent inference research lab.</subtitle>
  <link href="${SITE_URL}/rss.xml" rel="self" />
  <link href="${SITE_URL}" />
  <id>${SITE_URL}/</id>
  <updated>${updated}</updated>
  <author>
    <name>Coconut Labs</name>
    <email>info@coconutlabs.org</email>
  </author>
</feed>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
}
```

- [ ] **Step 5: Manually verify each endpoint**

Run: `pnpm dev`

Visit each URL and confirm:
- `http://localhost:3000/robots.txt` → renders `User-Agent: *`, `Allow: /`, `Host: ...`, `Sitemap: ...`
- `http://localhost:3000/sitemap.xml` → renders XML with 11 URL entries
- `http://localhost:3000/humans.txt` → renders the text file
- `http://localhost:3000/rss.xml` → renders Atom XML feed

Stop server.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(phase-0): add robots, sitemap, humans.txt, atom rss stub"
```

---

### Task 14: Add basic 404 page

**Files:**
- Create: `app/not-found.tsx`

- [ ] **Step 1: Create basic 404 (Phase 4 polishes with paper-tear)**

Create `app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <section
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
        minHeight: "60vh",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-display-lg)",
          color: "var(--ink-0)",
        }}
      >
        404
      </h1>
      <code
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-2)",
          display: "block",
          marginTop: "var(--space-3)",
        }}
      >
        // page not found — perhaps it was never written.
      </code>
      <p style={{ marginTop: "var(--space-4)" }}>
        <Link
          href="/"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--fs-ui)",
            color: "var(--ink-0)",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          ← Back to coconutlabs.org
        </Link>
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Verify visually**

Run: `pnpm dev`
Visit `http://localhost:3000/not-a-real-route`. Expected: 404 page with "404", in-character mono caption, and back link.
Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/not-found.tsx
git commit -m "feat(phase-0): add basic 404 page (paper-tear polish in phase 4)"
```

---

### Task 15: Set up Playwright e2e tests

**Files:**
- Create: `playwright.config.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/infra.spec.ts`

- [ ] **Step 1: Create Playwright config**

Create `playwright.config.ts`:
```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "pnpm dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

- [ ] **Step 2: Write shell e2e test**

Create `tests/e2e/shell.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("global shell", () => {
  test("home page renders header, main, and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("img", { name: /coconut labs/i }).first()).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByText(/Made on a quiet workstation/i)).toBeVisible();
  });

  test("primary nav has 7 links + contact", async ({ page }) => {
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: /primary/i });
    const links = await nav.getByRole("link").count();
    expect(links).toBe(8); // 7 primary + Contact button
  });

  test("skip-to-content link appears on tab", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeFocused();
  });
});
```

- [ ] **Step 3: Write infrastructure e2e test**

Create `tests/e2e/infra.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("infrastructure endpoints", () => {
  test("robots.txt is served", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent: *");
    expect(body).toContain("Sitemap:");
  });

  test("sitemap.xml is served and contains expected routes", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/research");
    expect(body).toContain("/projects/kvwarden");
  });

  test("rss.xml is served as Atom", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/atom+xml");
    const body = await res.text();
    expect(body).toContain("<feed");
    expect(body).toContain("Coconut Labs — Research");
  });

  test("humans.txt is served", async ({ request }) => {
    const res = await request.get("/humans.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("Shrey Patel");
  });

  test("404 page renders for unknown route", async ({ page }) => {
    const res = await page.goto("/this-route-does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByText(/404/)).toBeVisible();
    await expect(page.getByText(/perhaps it was never written/i)).toBeVisible();
  });
});
```

- [ ] **Step 4: Run e2e tests**

Run: `pnpm exec playwright test --project=chromium`
Expected: 8 tests pass (3 shell + 5 infra).

If a test fails because the dev server isn't ready, wait a few seconds and retry. The `webServer` block boots one automatically.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts tests/e2e/
git commit -m "feat(phase-0): add playwright e2e tests for shell + infra"
```

---

### Task 16: Add axe-core accessibility test

**Files:**
- Create: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Write a11y e2e test**

Create `tests/e2e/accessibility.spec.ts`:
```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/this-route-does-not-exist"]; // home + 404

test.describe("accessibility", () => {
  for (const route of ROUTES) {
    test(`route ${route} has no axe violations (WCAG AA)`, async ({ page }) => {
      await page.goto(route);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run a11y test**

Run: `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium`
Expected: 2 tests pass.

If violations appear, the most likely cause is a contrast issue with the warm-paper palette on a specific element. Inspect each violation:
- Use the `id` and `nodes` array in the violation output to identify the failing element
- Adjust the color in `styles/tokens.css` if it's a token issue, or fix the specific element's classes
- Re-run until clean

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility.spec.ts
git commit -m "feat(phase-0): add axe-core a11y test for home + 404"
```

---

### Task 17: Add npm scripts for typecheck + tests + build

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update scripts**

Open `package.json` and replace the `"scripts"` block with:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "test:e2e:headed": "playwright test --headed",
  "test:all": "pnpm typecheck && pnpm test && pnpm test:e2e"
}
```

- [ ] **Step 2: Verify each script works**

Run each in turn:
- `pnpm typecheck` → no errors
- `pnpm test` → all unit tests pass
- `pnpm test:e2e --project=chromium` → all e2e tests pass (this includes a11y)
- `pnpm build` → builds successfully (may print warnings; address only errors)

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(phase-0): add typecheck + test + build npm scripts"
```

---

### Task 18: Set up GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create CI workflow**

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - run: pnpm install --frozen-lockfile

      - run: pnpm typecheck

      - run: pnpm test

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - run: pnpm test:e2e --project=chromium

      - run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: https://coconutlabs.org
```

- [ ] **Step 2: Commit**

```bash
git add .github/
git commit -m "ci(phase-0): add github actions for typecheck, tests, build"
```

---

### Task 19: Write README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Write README**

Create `README.md`:
````markdown
# coconutlabs.org

Umbrella site for Coconut Labs. Built per the spec at `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md`.

## Stack

Next.js 15 · React 19 · TypeScript strict · Tailwind v4 · Motion · R3F · MDX · Vitest · Playwright · Vercel.

## Local development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | dev server with HMR |
| `pnpm build` | production build |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright e2e tests (boots dev server automatically) |
| `pnpm test:all` | typecheck + unit + e2e |

## Deployment

Vercel auto-deploys `main` to `coconutlabs.org`. Preview deploys per PR.

DNS managed via Cloudflare — A records to Vercel.

## Repo layout

See `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md` §9.2 for the full layout.

## Phases

- Phase 0 ✅ Foundation (this commit)
- Phase 1 — Home + visual identity
- Phase 2 — Research engine (MDX + RSS)
- Phase 3 — Inner pages
- Phase 4 — Motion polish (page-tear shader, paper-fold sculpture)
- Phase 5 — Performance + a11y + ship

Per-phase plans live in `docs/superpowers/plans/`.
````

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(phase-0): add readme"
```

---

### Task 20: Final Phase 0 verification

**Files:** none

- [ ] **Step 1: Run full test + build pipeline locally**

Run: `pnpm test:all && pnpm build`
Expected: all tests green, build succeeds, no TypeScript errors.

- [ ] **Step 2: Run dev server and walk through visually**

Run: `pnpm dev`

Verify in browser:
- `/` — header + wordmark + "Coconut Labs" hero + "// more soon" + footer
- `/this-route-does-not-exist` — 404 in-character page
- `/robots.txt` — robots
- `/sitemap.xml` — sitemap with 11 routes
- `/rss.xml` — Atom feed
- `/humans.txt` — humans

Tab through the page: skip-to-content appears, all nav links are focusable with visible focus rings.

Resize to mobile viewport (~375px wide): nav may overflow — that's OK for Phase 0; Phase 1 adds responsive nav.

Toggle `prefers-reduced-motion` in DevTools (Rendering panel → Emulate CSS media feature `prefers-reduced-motion: reduce`) and reload `/`. Wordmark stroke-draw should not animate.

Stop server.

- [ ] **Step 2.5: Wait for user before pushing remote**

Pause here. The next two tasks (21 + 22) are auth-interrupt points (§14.1) that require user input. Do not proceed silently.

- [ ] **Step 3: Commit any final fixes if any**

```bash
git status
# If anything is uncommitted from the verification pass, commit it.
```

---

### Task 21: AUTH INTERRUPT — Create GitHub repo + push

**Files:** none

- [ ] **Step 1: User confirms remote setup**

Ask user:
> "Phase 0 implementation is complete locally. To push to GitHub, I need:
> 1. The repo `coconut-labs/coconutlabs-org` to exist (empty, public or private)
> 2. SSH access from this machine (you've previously confirmed SSH key `~/.ssh/id_ed25519` works for the `coconut-labs` org)
>
> Want me to (a) create the repo via `gh repo create` and push, or (b) wait while you create it manually and tell me when it's ready?"

- [ ] **Step 2: Once user confirms, push to remote**

If user picked (a):
```bash
gh repo create coconut-labs/coconutlabs-org --public --description "Umbrella site for Coconut Labs."
git remote add origin git@github.com:coconut-labs/coconutlabs-org.git
git push -u origin main
```

If user picked (b), wait for them to confirm the repo exists, then:
```bash
git remote add origin git@github.com:coconut-labs/coconutlabs-org.git
git push -u origin main
```

Expected: all commits pushed to `main`. CI workflow runs automatically — link will be `https://github.com/coconut-labs/coconutlabs-org/actions`.

- [ ] **Step 3: Verify CI passes**

Wait for the CI run to complete. Check:
```bash
gh run list --limit 1
gh run watch
```

Expected: green checkmark on CI.

If CI fails, debug from the logs and push fixes.

---

### Task 22: AUTH INTERRUPT — Vercel + Cloudflare DNS

**Files:** none

- [ ] **Step 1: User links repo on Vercel**

Ask user to:
1. Go to https://vercel.com/new
2. Import the `coconut-labs/coconutlabs-org` repo
3. Choose Next.js framework preset
4. Set environment variable: `NEXT_PUBLIC_SITE_URL` = `https://coconutlabs.org`
5. Deploy

The first deploy will give a `*.vercel.app` preview URL. User confirms it loads correctly (header, wordmark, footer).

- [ ] **Step 2: User adds custom domain on Vercel**

In Vercel project settings → Domains → Add `coconutlabs.org` and `www.coconutlabs.org`.

Vercel will display the DNS records needed.

- [ ] **Step 3: User adds DNS records on Cloudflare**

In Cloudflare dashboard for `coconutlabs.org`:
- Add `A` record: `@` → `76.76.21.21` (Vercel apex IP — confirm exact value from Vercel's instructions)
- Add `CNAME` record: `www` → `cname.vercel-dns.com`
- Set both to "DNS only" (gray cloud) initially. Once Vercel-issued TLS cert provisions, can re-enable proxy if desired.

- [ ] **Step 4: Verify domain resolves**

Wait 1–10 minutes for DNS propagation. Then:
```bash
dig coconutlabs.org +short
curl -I https://coconutlabs.org
```

Expected: A record resolves to Vercel IP, HTTPS responds 200, Vercel-served HTML returned.

Open `https://coconutlabs.org` in browser. Expected: Phase 0 site renders.

- [ ] **Step 5: Phase 0 ship-gate met**

The Phase 0 definition of done:
- ✅ Site live at `https://coconutlabs.org`
- ✅ Header + Footer + Wordmark render
- ✅ All infrastructure endpoints serve (robots, sitemap, rss, humans, 404)
- ✅ Design tokens + variable fonts loaded
- ✅ a11y baseline (axe-core clean on home + 404)
- ✅ CI green on `main`

**Phase 0 is complete. Ready for Phase 1 plan.**

---

## Self-Review

Spec coverage check (Phase 0 sections of spec §13):
- ✅ Repo bootstrap (Tasks 1, 3)
- ✅ Token system in `styles/tokens.css` (Task 4)
- ✅ Tailwind v4 with token mapping (Tasks 2, 4)
- ✅ Variable font loading (4 fonts) (Task 5)
- ✅ Global shell: Header, Footer, RouteTransition (Tasks 8–11) — CursorLayer dropped per 2026-04-26 amendment
- ✅ Hand-drawn wordmark SVG + stroke-draw (Tasks 6, 7)
- ✅ Vercel project + custom domain DNS (Task 22)
- ✅ Stubs: /not-found (14), /robots.ts (13), /sitemap.ts (13), /rss.xml/route.ts (13), /humans.txt (13)
- ✅ Skip-to-content link (Task 11)
- ✅ Reduced-motion respected (Task 4 globals.css + Task 7 Wordmark)
- ✅ CI pipeline (Task 18)

Auth-interrupt points covered (§14.1):
- ✅ GitHub repo creation (Task 21)
- ✅ Vercel project linking (Task 22)
- ✅ Cloudflare DNS (Task 22)
- Phase 0 does NOT need GitHub PAT or Plausible (those are Phase 1+)

Placeholder scan: none (all code blocks are complete; all expected outputs specified).

Type consistency: `Wordmark` (component), `parseFrontmatter` / `loadFile` (lib/content), `buildMetadata` (lib/seo), `Header` / `Footer` / `RouteTransition` (shell components) — naming is consistent throughout.

Test count expectations:
- Unit: 7 tests across 3 files (Wordmark: 3, content: 2, seo: 2)
- E2E: 10 tests across 3 files (shell: 3, infra: 5, accessibility: 2)
- Total: 17 tests

Phase 0 produces working, testable software on its own — a deployed site at coconutlabs.org with the foundation in place. Phase 1 builds on this.
