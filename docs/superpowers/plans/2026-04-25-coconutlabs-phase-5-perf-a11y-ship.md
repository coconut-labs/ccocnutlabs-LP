# coconutlabs.org — Phase 5 (Performance, Accessibility, Ship) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 6 of 6 — final.** This plan covers Phase 5 only (Performance, Accessibility, Cross-browser, Ship). The full plan series:
- `2026-04-25-coconutlabs-phase-0-foundation.md`
- `…-phase-1-home-and-visual-identity.md`
- `…-phase-2-research-engine.md`
- `…-phase-3-inner-pages.md`
- `…-phase-4-motion-polish.md`
- `2026-04-25-coconutlabs-phase-5-perf-a11y-ship.md` ← this plan

> **Amended 2026-04-26.** Three downstream effects of the spec amendment:
> 1. **CursorLayer dropped** in Phase 4 — no cursor-related perf/a11y work in this phase. The TBT failure-mode row below is updated to remove the cursor reference.
> 2. **Co-founder Jay Patel** added — a11y + voice tests should pass with both names rendered on `/about` and the home PeopleStrip.
> 3. **Email convention** — `info@coconutlabs.org` is the default; the contact-page e2e test (Phase 3) checks all three addresses.

**Goal:** Take the feature-complete site from Phases 0–4, hammer it against the spec §10 performance + accessibility budget, verify it survives Chrome + Firefox + Safari + iOS Safari, fix every regression that surfaces, and ship `https://coconutlabs.org` v1. The deliverable is a Lighthouse-clean, axe-clean, three-browser-clean, real-deviced site with the launch checklist signed off.

**Architecture:** Lighthouse CI (`treosh/lighthouse-ci-action`) and axe-core (Playwright) run on every PR and block merge on regression. Cross-browser coverage via Playwright projects (chromium + firefox + webkit). Bundle analysis via `@next/bundle-analyzer`. Image optimization via `next/image`. Font subsetting verified via DevTools network capture. WebGL surfaces (paper-fold sculpture, page-tear shader) get a dedicated Safari/iOS regression pass. RSS + Schema.org JSON-LD validated against W3C and Google Rich Results. The phase ends with a manual production promote + 24h post-ship monitoring window.

**Tech Stack:** Lighthouse CI 0.13+, `treosh/lighthouse-ci-action@v12`, axe-core 4.x, `@axe-core/playwright`, `@next/bundle-analyzer`, Playwright 1.48+ (chromium/firefox/webkit projects), `@vercel/analytics` (or Plausible), W3C Feed Validator (HTTP API), Google Rich Results Test API, BrowserStack (optional, for real-device iOS Safari).

**Prerequisites:** Phases 0–4 complete. All 12 user-facing routes render real content or in-character empty state. Page-tear transition works in dev. Paper-fold sculpture mounts on `/`. Live-signals strip pulls from GitHub. `@vercel/og` route generates per-page OG images. RSS feed has at least one real entry (KVWarden Gate 2-FAIRNESS post). Site is auto-deploying from `main` → `coconutlabs.org` via Vercel + Cloudflare DNS (Phase 0 Task 22). This phase is hardening + cross-browser verification + ship — no new feature work.

---

## File Structure (Phase 5 deliverables)

```
coconutlabs/
├── .github/workflows/
│   ├── ci.yml                            modify: add a11y-blocking, cross-browser matrix
│   ├── lighthouse.yml                    NEW: Lighthouse CI on every PR (mobile + desktop)
│   └── feed-validate.yml                 NEW: weekly RSS + Schema.org validation
├── lighthouserc.json                     NEW: Lighthouse CI budgets per spec §10
├── next.config.ts                        modify: wrap with @next/bundle-analyzer
├── package.json                          modify: add analyze, validate scripts
├── docs/
│   ├── perf-baseline.md                  NEW: bundle sizes + Lighthouse scores per route
│   ├── a11y-audit.md                     NEW: axe results, deferred non-blocking issues
│   ├── browser-matrix.md                 NEW: cross-browser test results, known issues
│   └── launch-checklist.md               NEW: spec §13.3 checklist with sign-off boxes
└── tests/e2e/
    ├── accessibility.spec.ts             modify: extend Phase 0 to all 13 routes
    ├── reduced-motion.spec.ts            NEW: prefers-reduced-motion route walk
    ├── cross-browser.spec.ts             NEW: smoke per chromium/firefox/webkit project
    ├── og-images.spec.ts                 NEW: OG image renders for every route
    └── schema.spec.ts                    NEW: ScholarlyArticle JSON-LD valid on /research/[slug]
```

**File responsibility boundaries:**
- `lighthouserc.json` is the single source of truth for performance budgets. Numbers come from spec §10 — never hardcoded elsewhere.
- `.github/workflows/lighthouse.yml` runs Lighthouse and uploads results to Lighthouse CI's temporary public storage; failures block merge.
- `.github/workflows/feed-validate.yml` is a weekly cron + on-demand workflow that pings external validators; it does NOT block merge (external services have their own uptime), but creates a GitHub issue on failure.
- `tests/e2e/*.spec.ts` files extend Phase 0's e2e suite. Every new spec file follows the existing per-project Playwright config (chromium/firefox/webkit) added in Phase 0 Task 15.
- `docs/*.md` are the human-readable record of "why we shipped this number." They are committed alongside the code that produced them, so future-you can diff "Phase 5 baseline" against "two months later."

---

## Tasks

### Task 1: Pin Phase 5 baseline — capture pre-hardening Lighthouse + bundle numbers

**Files:**
- Create: `docs/perf-baseline.md`

We measure once before touching anything so every subsequent task has a "before / after" delta. This is the only task that intentionally produces no changes to the app — its output is a measurement file.

- [ ] **Step 1: Build the production bundle**

Run:
```bash
cd "/Users/shrey/Personal Projects/coconutlabs"
pnpm build
```
Expected: build succeeds, terminal prints per-route size table.

- [ ] **Step 2: Capture per-route bundle sizes**

Copy the size table from `pnpm build` output. The table has columns `Route`, `Size`, `First Load JS`. Capture every route, including dynamic `[slug]` routes (their reported size is the template, not per-instance).

- [ ] **Step 3: Run Lighthouse manually against local prod build**

```bash
pnpm start &
sleep 5
pnpm dlx lighthouse http://localhost:3000 --output=json --output-path=./tmp/lh-home.json --only-categories=performance,accessibility,best-practices,seo --preset=desktop
pnpm dlx lighthouse http://localhost:3000/research --output=json --output-path=./tmp/lh-research.json --only-categories=performance,accessibility,best-practices,seo --preset=desktop
# Repeat for each of the 12 user-facing routes, plus /404
kill %1
```

Mobile preset (4G mid-tier, per spec §10):
```bash
pnpm dlx lighthouse http://localhost:3000 --output=json --output-path=./tmp/lh-home-mobile.json --only-categories=performance,accessibility --form-factor=mobile --throttling-method=simulate
```

- [ ] **Step 4: Write baseline document**

Create `docs/perf-baseline.md`:
```markdown
# Performance baseline — pre-Phase-5

Captured: <YYYY-MM-DD>
Commit: <git rev-parse HEAD>

## Bundle sizes (pnpm build, gzip)

| Route | Size | First Load JS |
|---|---|---|
| /                          | … | … |
| /research                  | … | … |
| /research/[slug]           | … | … |
| /work                      | … | … |
| /papers                    | … | … |
| /podcasts                  | … | … |
| /joinus                    | … | … |
| /about                     | … | … |
| /contact                   | … | … |
| /colophon                  | … | … |
| /projects/kvwarden         | … | … |
| /projects/weft             | … | … |
| /404                       | … | … |

Shared chunks: …

## Lighthouse desktop (local prod build)

| Route | Perf | A11y | Best | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| /                          | … | … | … | … | … | … | … |
| /research                  | … | … | … | … | … | … | … |
| (etc.)                     | … | … | … | … | … | … | … |

## Lighthouse mobile (4G mid-tier, simulate throttling)

| Route | Perf | A11y | LCP | TBT | CLS |
|---|---|---|---|---|---|
| /                          | … | … | … | … | … |
| (etc.)                     | … | … | … | … | … |

## Spec §10 budget

```
LCP        < 2.0s on 4G mid-tier mobile
TBT        < 200ms
CLS        < 0.05
JS to /    < 150KB gz (R3F lazy doesn't count)
CSS init   < 30KB gz
Perf       ≥ 90 every route, ≥ 95 on /
A11y       ≥ 95 every route
```

## Routes not yet in budget

List every cell that is currently over budget. Each cell becomes a Phase 5 task.
```

- [ ] **Step 5: Commit baseline**

```bash
git add docs/perf-baseline.md
git commit -m "chore(phase-5): capture pre-hardening perf + a11y baseline"
```

---

### Task 2: Wire `@next/bundle-analyzer` into `next.config.ts`

**Files:**
- Modify: `next.config.ts`, `package.json`

- [ ] **Step 1: Install bundle analyzer**

Run:
```bash
pnpm add -D @next/bundle-analyzer@^15
```

- [ ] **Step 2: Wrap next.config**

Open `next.config.ts`. Wrap the existing config export with `withBundleAnalyzer`. The full file should look like (preserving any other Phase 0–4 config inside the inner object):
```ts
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // ...existing Phase 0–4 config (mdx, images, etc.) preserved here
};

export default withBundleAnalyzer(nextConfig);
```

If `next.config.ts` does not exist (Phase 0 may have left `.mjs`), apply the equivalent to whatever extension is present.

- [ ] **Step 3: Add `analyze` script**

Open `package.json` and add to the `scripts` block:
```json
"analyze": "ANALYZE=true next build"
```

- [ ] **Step 4: Run analyzer**

Run: `pnpm analyze`
Expected: build completes; three HTML reports open in browser tabs (client, edge, server). The client report is the one that maps onto our 150KB JS-to-home budget.

Note any obvious offenders (a single dependency taking > 30KB gz). Examples to watch for: `framer-motion` if not tree-shaken, `three` if accidentally bundled into the home route instead of lazy-loaded, `shiki` if leaking out of MDX server boundary.

- [ ] **Step 5: Commit**

```bash
git add next.config.ts package.json pnpm-lock.yaml
git commit -m "chore(phase-5): wire @next/bundle-analyzer (ANALYZE=true)"
```

---

### Task 3: Move R3F + heavy bundles off the home critical path

**Files:**
- Modify: any file that imports `@react-three/*` or `three` at module-top-level on a route that doesn't need it on first paint

This task is verify-then-fix. Phase 1 was supposed to dynamically import the paper-fold sculpture (`next/dynamic({ ssr: false })` per spec §9.3). Phase 5 confirms that's what actually happens in the built bundle.

- [ ] **Step 1: Confirm R3F lives in its own chunk**

In the Phase 5 Task 2 analyzer output, locate `three.js`, `@react-three/fiber`, `@react-three/drei`. They should appear in their own async chunk(s), NOT in the main client chunk for `/`.

If they're in the main chunk: open `app/page.tsx` and `components/home/Hero.tsx` (or wherever the canvas is mounted) and confirm the canvas component uses:
```tsx
import dynamic from "next/dynamic";
const PaperFoldSculpture = dynamic(
  () => import("@/components/canvas/PaperFoldSculpture"),
  { ssr: false }
);
```

If a static import sneaks in anywhere — even via a re-export — that's the bug. Fix it and re-run `pnpm analyze`.

- [ ] **Step 2: Confirm GSAP-free bits don't bundle GSAP-club**

Search the codebase:
```bash
grep -rn "gsap/club" app/ components/ lib/ || echo "OK: no gsap/club imports"
```
Expected: `OK: no gsap/club imports` (we use the free GSAP set + custom SplitText per spec §9.1).

- [ ] **Step 3: Confirm Shiki runs server-side only**

Search for `shiki` imports:
```bash
grep -rn "from \"shiki\"" app/ components/ lib/
```
Every result must be in a Server Component (no `"use client"` at top of file) or in a build-time MDX pipeline file (`lib/mdx.ts`). Shiki bundled into a client chunk would blow the budget.

If a client component imports Shiki, refactor to pre-render the syntax highlight in the parent server component and pass HTML strings as a prop.

- [ ] **Step 4: Re-run analyzer + record delta**

Run: `pnpm analyze`
Compare main client chunk size for `/` against Task 1 baseline. Document the delta in `docs/perf-baseline.md` under a new `## Phase 5 deltas` section.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "perf(phase-5): isolate r3f + shiki off home critical path"
```

If no fix was needed (everything was already correct from Phase 1), commit just the doc update with `chore(phase-5): verify r3f + shiki bundle isolation`.

---

### Task 4: Image optimization audit — every `<img>` becomes `next/image`

**Files:**
- Modify: any component using a raw `<img>` tag
- Modify: `public/images/*` (re-export source images at correct dimensions if needed)

- [ ] **Step 1: Find all raw `<img>` usages**

Run:
```bash
grep -rn "<img" app/ components/ content/ --include="*.tsx" --include="*.mdx"
```

Every result needs to be one of:
- Replaced with `<Image>` from `next/image`
- Justified in-line with a comment (e.g., a 16x16 inline SVG cursor cue where `next/image` overhead exceeds the savings)

- [ ] **Step 2: Audit founder portrait, OG base, project illustrations**

Per spec §6.9:
- Founder portrait — square crop, full-bleed rectangle, B&W. Should be `next/image` with `priority` if above-the-fold on `/about`.
- `public/og-base.png` — used by `@vercel/og` route, NOT served as a page image; no `next/image` needed.
- Project illustrations — SVG-only per spec §6.9. SVGs are not subject to the `next/image` rule (they don't benefit from WebP/AVIF conversion). Inline `<svg>` or `<img src="*.svg">` is fine.

- [ ] **Step 3: Verify WebP/AVIF served**

Run dev server, open the founder portrait page (`/about`) in DevTools → Network. Filter by Img. The portrait response should have `Content-Type: image/avif` (preferred by modern browsers) or `image/webp` (fallback). If it's `image/jpeg`, `next/image` is misconfigured.

If misconfigured, check `next.config.ts` `images.formats` includes `["image/avif", "image/webp"]` (Next 15 default — should not need explicit override unless Phase 0 changed it).

- [ ] **Step 4: Document image inventory**

Append to `docs/perf-baseline.md`:
```markdown
## Image inventory

| Path | Component | Format served | next/image | Notes |
|---|---|---|---|---|
| /images/founder-shrey.jpg | About page hero | avif | yes (priority) | … |
| /images/og-base.png       | @vercel/og base | png (server-side) | n/a | … |
| /wordmark.svg             | Header, footer  | svg | n/a (inline) | … |
| (etc.) | | | | |
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "perf(phase-5): audit images, ensure next/image + avif/webp served"
```

---

### Task 5: Font subsetting verification — confirm Latin + Latin-Ext only

**Files:** none (verification + documentation)

Phase 0 Task 5 set `subsets: ["latin", "latin-ext"]` on Fraunces and Instrument Serif via `next/font/google`. Geist Sans + Geist Mono are loaded via the `geist` package, which has its own subsetting. Phase 5 verifies the actual transferred bytes.

- [ ] **Step 1: Capture transferred font bytes**

Run dev server in production mode:
```bash
pnpm build && pnpm start
```

Open `http://localhost:3000` in Chrome. DevTools → Network → filter by Font. Hard-reload (Cmd+Shift+R).

For each `.woff2` request, note:
- Font family (URL or response Content-Disposition)
- Transferred size (bytes, gzip-equivalent)
- Whether it preloaded (`<link rel="preload">` in document head) or loaded on demand

Spec requires Instrument Serif + Geist Variable preloaded above-fold. Fraunces + Geist Mono use `font-display: swap`.

- [ ] **Step 2: Sanity-check sizes**

Reasonable expectations for variable woff2, Latin + Latin-Ext only:
- Instrument Serif (single weight, italic) — ~30-50KB
- Fraunces (variable, opsz/SOFT/WONK axes) — ~80-150KB
- Geist Sans Variable — ~30-50KB
- Geist Mono Variable — ~30-50KB

If any font is 3-5× larger than expected, it's likely loading the full Unicode range (CJK, devanagari, etc.) instead of subsetting. Re-check `app/fonts.ts` `subsets` argument.

- [ ] **Step 3: Confirm preloaded fonts**

In the document `<head>` of the home page, look for:
```html
<link rel="preload" href="/_next/static/media/instrument-serif…woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/_next/static/media/geist…woff2" as="font" type="font/woff2" crossorigin>
```

`next/font` adds these automatically when a font is referenced from the root layout. If missing, the font import isn't being used at the layout level — fix by referencing `geistSans.className` or similar in `app/layout.tsx`.

- [ ] **Step 4: Document in perf-baseline.md**

Append:
```markdown
## Font transfer (production build)

| Font | Variant | Transferred (gz) | Preloaded |
|---|---|---|---|
| Instrument Serif | 400 + italic | … KB | yes |
| Fraunces | variable opsz/SOFT/WONK | … KB | no (swap) |
| Geist Sans | variable | … KB | yes |
| Geist Mono | variable | … KB | no (swap) |
| Total above-fold | | … KB | |
```

- [ ] **Step 5: Commit**

```bash
git add docs/perf-baseline.md
git commit -m "chore(phase-5): verify font subsetting + record transferred bytes"
```

---

### Task 6: Establish `lighthouserc.json` with spec §10 budgets

**Files:**
- Create: `lighthouserc.json`

- [ ] **Step 1: Write Lighthouse CI config**

Create `lighthouserc.json`:
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/research",
        "http://localhost:3000/work",
        "http://localhost:3000/papers",
        "http://localhost:3000/podcasts",
        "http://localhost:3000/joinus",
        "http://localhost:3000/about",
        "http://localhost:3000/contact",
        "http://localhost:3000/colophon",
        "http://localhost:3000/projects/kvwarden",
        "http://localhost:3000/projects/weft",
        "http://localhost:3000/research/kvwarden-gate-2-fairness"
      ],
      "numberOfRuns": 3,
      "startServerCommand": "pnpm start",
      "startServerReadyPattern": "Ready in",
      "settings": {
        "preset": "desktop",
        "throttlingMethod": "simulate"
      }
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.90, "aggregationMethod": "median-run" }],
        "categories:accessibility": ["error", { "minScore": 0.95, "aggregationMethod": "median-run" }],
        "categories:best-practices": ["warn", { "minScore": 0.90 }],
        "categories:seo": ["warn", { "minScore": 0.90 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

- [ ] **Step 2: Add a stricter override for `/`**

Spec §10 says Performance ≥ 95 on `/` (vs ≥ 90 elsewhere). Lighthouse CI supports per-URL overrides via `assertMatrix`. Append after the `assert` block:
```json
    "assertMatrix": [
      {
        "matchingUrlPattern": "http://localhost:3000/$",
        "assertions": {
          "categories:performance": ["error", { "minScore": 0.95 }]
        }
      }
    ]
```

(The closing brackets of `ci` and the outer object need to be adjusted — make sure the final JSON parses.)

- [ ] **Step 3: Validate config locally**

```bash
pnpm dlx @lhci/cli@0.13.x autorun
```
Expected: 12 URLs × 3 runs = 36 Lighthouse runs complete; assertions evaluated; if anything fails the budget, you see the failing URL and metric.

If a URL fails: that's expected at this stage. Capture the failure into `docs/perf-baseline.md` under "Routes not yet in budget" — Tasks 8, 9, 10 will fix them.

- [ ] **Step 4: Commit**

```bash
git add lighthouserc.json
git commit -m "chore(phase-5): add lighthouserc.json with spec §10 budgets"
```

---

### Task 7: Add Lighthouse CI workflow that blocks merge

**Files:**
- Create: `.github/workflows/lighthouse.yml`

- [ ] **Step 1: Create workflow**

Create `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        preset: [desktop, mobile]
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

      - run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: https://coconutlabs.org

      - name: Run Lighthouse CI (${{ matrix.preset }})
        uses: treosh/lighthouse-ci-action@v12
        with:
          configPath: ./lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
        env:
          LHCI_BUILD_CONTEXT__PRESET: ${{ matrix.preset }}
```

The `LHCI_BUILD_CONTEXT__PRESET` env is for record-keeping only; the per-preset Lighthouse settings live in `lighthouserc.json`. For Phase 5 v1, both presets re-use the same config. If mobile budgets need to differ from desktop, split into `lighthouserc.desktop.json` + `lighthouserc.mobile.json` and use `matrix.preset` to pick.

- [ ] **Step 2: Push a throwaway branch + open a draft PR to verify workflow runs**

```bash
git checkout -b phase-5/lighthouse-ci-bringup
git add .github/workflows/lighthouse.yml
git commit -m "ci(phase-5): add lighthouse ci workflow (block on perf < 90, a11y < 95)"
git push -u origin phase-5/lighthouse-ci-bringup
gh pr create --draft --title "Phase 5: Lighthouse CI bringup" --body "Verifying workflow only — will close + reopen as part of Phase 5 final PR."
```

- [ ] **Step 3: Watch the workflow**

```bash
gh run watch
```

Expected: workflow completes. If it fails, the failure mode is the budget breach, not the workflow itself. The workflow output should include the temporary-public-storage URL where the report is hosted — open it in browser to see what failed.

- [ ] **Step 4: Close the draft PR (will reopen at end of Phase 5)**

```bash
gh pr close --delete-branch
git checkout main
```

- [ ] **Step 5: Commit on main**

```bash
git add .github/workflows/lighthouse.yml
git commit -m "ci(phase-5): add lighthouse ci workflow"
```

---

### Task 8: Fix any perf budget breaches surfaced by Lighthouse CI

**Files:** depends on the violations

This is a verify-then-fix loop. Re-run Lighthouse locally after each fix.

- [ ] **Step 1: List all currently failing assertions**

```bash
pnpm dlx @lhci/cli@0.13.x autorun > tmp/lhci-output.txt 2>&1
grep -E "(failure|FAIL|error)" tmp/lhci-output.txt
```

For each failure, identify:
- URL
- Metric (LCP, TBT, CLS, perf score, a11y score)
- Current value
- Budget

- [ ] **Step 2: Common fixes per metric**

| Metric breach | Likely cause | Fix |
|---|---|---|
| LCP > 2.0s | Largest element is the hero text but font swap is delayed | Confirm Instrument Serif preloads (Task 5); add `font-display: optional` for the LCP element if `swap` is still pushing past budget |
| LCP > 2.0s on a project page | Hero illustration is a large rasterized image | Convert to inline SVG or smaller AVIF, add `priority` |
| TBT > 200ms on `/` | Hydration of SplitText / Lenis / RouteTransition running synchronously | Wrap heavy client islands in `next/dynamic` or move setup into `useEffect` (already off the critical path) |
| CLS > 0.05 | Marginalia or images shifting layout when they hydrate | Reserve space with `aspect-ratio` CSS or fixed-height containers |
| Perf score < 90 with no single metric breach | Composite score includes Speed Index + FCP — usually solved by Tasks 3–5 fixes | Re-run after Tasks 3, 4, 5 are merged |

- [ ] **Step 3: For each fix, write a focused commit**

Examples:
```bash
git commit -m "perf(phase-5): preload founder portrait on /about (LCP -800ms)"
git commit -m "perf(phase-5): reserve marginalia space to fix CLS on /research/[slug]"
git commit -m "perf(phase-5): defer Lenis init until after first paint (TBT -180ms)"
```

Each commit message should include the measured delta in parentheses — this becomes the perf-baseline.md change log.

- [ ] **Step 4: Re-run Lighthouse, confirm green**

```bash
pnpm dlx @lhci/cli@0.13.x autorun
```
Expected: all assertions pass.

- [ ] **Step 5: Update perf-baseline.md "Phase 5 deltas" section with final numbers**

Append the post-fix numbers next to the Task 1 baseline numbers so the file shows before/after for each route.

---

### Task 9: Extend axe-core a11y test to all 13 routes

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`

Phase 0 Task 16 added axe-core for `/` + `/404`. Phase 5 extends to every route in the spec §4.1 sitemap. The blocking semantic stays the same: any `wcag2aa` violation fails CI.

- [ ] **Step 1: Update accessibility.spec.ts**

Open `tests/e2e/accessibility.spec.ts` and replace its contents:
```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/research",
  "/research/kvwarden-gate-2-fairness", // first real post
  "/work",
  "/papers",
  "/podcasts",
  "/joinus",
  "/about",
  "/contact",
  "/colophon",
  "/projects/kvwarden",
  "/projects/weft",
  "/this-route-does-not-exist", // 404
];

test.describe("accessibility (WCAG 2 AA, every route)", () => {
  for (const route of ROUTES) {
    test(`${route} has no axe violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa"])
        .disableRules([
          // Document any rule disabled here with a justification + tracking link
          // e.g. "color-contrast" might be disabled on a single decorative element
          // and re-checked manually
        ])
        .analyze();

      expect(
        results.violations,
        `Violations on ${route}:\n${JSON.stringify(results.violations, null, 2)}`
      ).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run a11y suite**

```bash
pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium
```

Expected: 13 tests. Likely 1-3 fail on first run.

- [ ] **Step 3: Triage each violation**

For each failure, the violation output includes the rule ID (e.g., `color-contrast`, `landmark-one-main`, `link-name`), the failing node's selector, and a "how to fix" URL.

Common Phase 5 violations + fixes:
- `color-contrast` on `--ink-2 (#8A8275)` against `--bg-0 (#ECE6D6)` for footer fine print — likely fails AA. Fix: bump `--ink-2` to a darker value, or apply only at sizes ≥ 18pt where AA threshold relaxes.
- `link-name` on icon-only social links — add `aria-label`.
- `heading-order` on a research post that skips h2 → h4 — fix MDX content or rewrite the rendered heading levels.
- `region` on the live-signals strip — wrap in `<section aria-label="Live signals">`.

- [ ] **Step 4: Document any deferred non-blocking issues**

If a violation is intentionally deferred (e.g., a third-party embed in a future research post), document it in `docs/a11y-audit.md`:
```markdown
# Accessibility audit — Phase 5

Captured: <YYYY-MM-DD>

## Blocking (must fix before ship)

(empty — all WCAG 2 AA violations resolved)

## Deferred (non-blocking, tracked)

| Rule | Route | Element | Reason | Tracking |
|---|---|---|---|---|
| (none expected for v1) | | | | |
```

For v1 we expect this table to be empty. If we ship with deferred items, that's a yellow flag worth raising to the user before launch.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/accessibility.spec.ts docs/a11y-audit.md
git commit -m "test(phase-5): extend axe-core a11y test to all 13 routes"
```

If fixes were needed, follow up with focused commits like:
```bash
git commit -m "fix(phase-5): bump --ink-2 contrast for AA compliance"
git commit -m "fix(phase-5): aria-label icon-only social links in footer"
```

---

### Task 10: Cross-browser smoke test (chromium + firefox + webkit)

**Files:**
- Create: `tests/e2e/cross-browser.spec.ts`
- Modify: `.github/workflows/ci.yml` (add browser matrix)

Phase 0 Task 15 already configured Playwright with all three browser projects. CI ran chromium only (Phase 0 Task 18). Phase 5 turns on the matrix.

- [ ] **Step 1: Write cross-browser smoke spec**

Create `tests/e2e/cross-browser.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/research",
  "/research/kvwarden-gate-2-fairness",
  "/work",
  "/papers",
  "/podcasts",
  "/joinus",
  "/about",
  "/contact",
  "/colophon",
  "/projects/kvwarden",
  "/projects/weft",
];

test.describe("cross-browser smoke", () => {
  for (const route of ROUTES) {
    test(`${route} renders without console errors`, async ({ page, browserName }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
      });

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Header + footer present
      await expect(page.getByRole("img", { name: /coconut labs/i }).first()).toBeVisible();
      await expect(page.getByText(/Made on a quiet workstation/i)).toBeVisible();

      // No console errors
      expect(errors, `Errors on ${route} (${browserName}):\n${errors.join("\n")}`).toEqual([]);
    });
  }
});
```

- [ ] **Step 2: Run locally on all three browsers**

```bash
pnpm exec playwright test tests/e2e/cross-browser.spec.ts
```
Expected: 12 routes × 3 browsers = 36 tests. Likely 1-3 webkit-specific failures on first run.

Common webkit-specific issues:
- `backdrop-filter: blur` on header — Safari 17+ supports it but with quirks; verify visually
- `color-mix(in srgb, …)` — supported Safari 16.4+; if site supports older Safari, fall back to a precomputed rgba
- WebGL canvas blank in webkit headless — usually a Playwright launch flag issue, not a real bug; verify in real Safari before raising
- `animate()` Web Animations API — fully supported in Safari 16+ but timing can drift; `prefers-reduced-motion` fallback should cover

- [ ] **Step 3: Fix any real bugs**

For each failure, determine: real bug vs. Playwright headless artifact.

If real, fix and document in `docs/browser-matrix.md`:
```markdown
# Cross-browser matrix — Phase 5

Captured: <YYYY-MM-DD>

| Route | chromium | firefox | webkit | iOS Safari (manual) |
|---|---|---|---|---|
| /                          | ✅ | ✅ | ✅ | ✅ |
| /research                  | ✅ | ✅ | ✅ | ✅ |
| (etc.)                     | ✅ | ✅ | ✅ | ✅ |

## Known issues

(empty — all browsers pass for v1)

## Fix notes

- yyyy-mm-dd: webkit `backdrop-filter` on header was rendering a 1px white seam — fixed by adding `transform: translateZ(0)` for layer promotion. (commit <sha>)
```

- [ ] **Step 4: Enable matrix in `.github/workflows/ci.yml`**

Open `.github/workflows/ci.yml`. Modify the `test` job to use a browser matrix:
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm test
      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps ${{ matrix.browser }}
      - run: pnpm test:e2e --project=${{ matrix.browser }}
      - run: pnpm build
        env:
          NEXT_PUBLIC_SITE_URL: https://coconutlabs.org
```

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/cross-browser.spec.ts .github/workflows/ci.yml docs/browser-matrix.md
git commit -m "test(phase-5): add cross-browser smoke + enable firefox/webkit in ci"
```

---

### Task 11: WebGL Safari + iOS regression check (manual + tracked)

**Files:**
- Modify: `docs/browser-matrix.md`

Per spec §13.1, WebGL on Safari/iOS is the most bug-prone surface. The two WebGL surfaces are:
- Phase 1 — paper-fold sculpture on `/`
- Phase 4 — page-tear shader on every route transition

Playwright headless webkit (Task 10) does NOT reliably exercise WebGL — real Safari + real iOS Safari is needed.

- [ ] **Step 1: Test on real macOS Safari (latest stable)**

Open Safari. Visit `https://<your-vercel-preview-url>/` (use the latest preview deploy of the Phase 5 branch).

Verify:
- Paper-fold sculpture mounts and animates smoothly
- No "WebGL context lost" errors in Safari Develop console
- Frame rate ≥ 60fps (Safari Develop → Timelines → Rendering)
- Navigate `/` → `/research` → `/about` to trigger 2-3 page-tear transitions
- Each transition completes without flicker, without leaving WebGL canvas garbage on screen, without crashing

- [ ] **Step 2: Test on real iOS Safari**

If user has a physical iPhone or iPad: open `https://<your-vercel-preview-url>/` in mobile Safari.

Verify:
- Paper-fold sculpture renders (it might run at lower frame rate on older devices — that's OK as long as it's not jittery)
- Tap through routes — page-tear should fire
- No memory pressure crashes (browser tab reload mid-session = a bug)

If user does NOT have an iPhone/iPad: this is an **AUTH INTERRUPT** — see Step 4.

- [ ] **Step 3: Test reduced-motion fallback in iOS Safari**

iOS Settings → Accessibility → Motion → Reduce Motion → ON.
Reload the site.
Verify:
- Paper-fold sculpture either does not render OR renders as a static frame (no animation loop)
- Page transitions are instant cross-fades, not shader effects

- [ ] **Step 4: AUTH INTERRUPT (only if no physical iOS device)**

Ask user:
> "WebGL on iOS Safari needs real-device verification. Options:
> (a) you test on your iPhone/iPad and report back,
> (b) I provision a free BrowserStack trial (requires you to sign up — ~5 min),
> (c) we ship without iOS verification and hot-fix any reports post-launch (low risk if Safari desktop passes, but spec §13.1 explicitly flags this surface).
>
> Which do you want?"

If (b), wait for BrowserStack credentials, then run the manual procedure on iPhone 15 / iPad Pro / earliest supported iPhone in their fleet.

- [ ] **Step 5: Document results**

Update `docs/browser-matrix.md` "Real-device WebGL" section:
```markdown
## Real-device WebGL verification

| Device | Browser | Paper-fold | Page-tear | Reduced-motion fallback | Date | Notes |
|---|---|---|---|---|---|---|
| MacBook Air M2 | Safari 17.x | ✅ | ✅ | ✅ | yyyy-mm-dd | … |
| iPhone 15 Pro  | iOS Safari 17 | ✅ | ✅ | ✅ | yyyy-mm-dd | … |
| (etc.) | | | | | | |
```

If anything fails: open a fix task. Do not ship with a broken WebGL surface on iOS Safari.

- [ ] **Step 6: Commit**

```bash
git add docs/browser-matrix.md
git commit -m "test(phase-5): record real-device webgl verification results"
```

---

### Task 12: Reduced-motion verification per route (automated)

**Files:**
- Create: `tests/e2e/reduced-motion.spec.ts`

- [ ] **Step 1: Write reduced-motion spec**

Create `tests/e2e/reduced-motion.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/research",
  "/research/kvwarden-gate-2-fairness",
  "/work",
  "/papers",
  "/podcasts",
  "/joinus",
  "/about",
  "/contact",
  "/colophon",
  "/projects/kvwarden",
  "/projects/weft",
];

test.use({ colorScheme: "light", reducedMotion: "reduce" });

test.describe("prefers-reduced-motion: reduce — every route renders without broken state", () => {
  for (const route of ROUTES) {
    test(`${route} renders + no errors with reduce-motion`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));
      page.on("console", (msg) => {
        if (msg.type() === "error") errors.push(msg.text());
      });

      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Page chrome present
      await expect(page.getByRole("img", { name: /coconut labs/i }).first()).toBeVisible();

      // No JS errors from disabled motion paths
      expect(errors, `Errors on ${route}:\n${errors.join("\n")}`).toEqual([]);

      // Wordmark stroke-draw is skipped — paths should have no strokeDashoffset animation
      const wordmarkPath = page.locator("svg[aria-label='Coconut Labs'] path").first();
      const dashoffset = await wordmarkPath.evaluate((el) => (el as SVGPathElement).style.strokeDashoffset);
      expect(dashoffset).toBe(""); // empty = not animated
    });
  }

  test("page transition is instant cross-fade, not shader", async ({ page }) => {
    await page.goto("/");
    const start = Date.now();
    await page.getByRole("link", { name: /research/i }).first().click();
    await page.waitForURL(/\/research$/);
    const elapsed = Date.now() - start;
    // Reduced-motion path should complete in < 200ms (no 720ms shader)
    expect(elapsed).toBeLessThan(400);
  });
});
```

- [ ] **Step 2: Run**

```bash
pnpm exec playwright test tests/e2e/reduced-motion.spec.ts --project=chromium
```
Expected: 13 tests pass.

If failures appear, the cause is usually a motion path that ignores `prefers-reduced-motion`. Fix per route — check Lenis init (should bail when reduced-motion), Framer Motion components (use `useReducedMotion()` hook), and the Wordmark / SplitText / page-tear initializers.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/reduced-motion.spec.ts
git commit -m "test(phase-5): verify prefers-reduced-motion honored on every route"
```

---

### Task 13: OG image render verification per route

**Files:**
- Create: `tests/e2e/og-images.spec.ts`

`@vercel/og` was added in Phase 2 for research posts. Phase 5 verifies the `/api/og` endpoint generates a valid PNG for every route's `?title=` query, not just the home OG image.

- [ ] **Step 1: Write OG image spec**

Create `tests/e2e/og-images.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const TITLES = [
  "Coconut Labs",
  "Research",
  "Tenant fairness on shared inference", // first real post
  "Work",
  "Papers",
  "Podcasts",
  "Join us",
  "About",
  "Contact",
  "Colophon",
  "KVWarden",
  "Weft",
];

test.describe("OG image generation", () => {
  for (const title of TITLES) {
    test(`/api/og?title=${title} returns a valid PNG`, async ({ request }) => {
      const res = await request.get(`/api/og?title=${encodeURIComponent(title)}`);
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");

      const body = await res.body();
      // PNG magic bytes
      expect(body[0]).toBe(0x89);
      expect(body[1]).toBe(0x50);
      expect(body[2]).toBe(0x4e);
      expect(body[3]).toBe(0x47);

      // Reasonable size (1200x630 with text — should be > 5KB and < 200KB)
      expect(body.byteLength).toBeGreaterThan(5_000);
      expect(body.byteLength).toBeLessThan(200_000);
    });
  }

  test("each page emits an og:image meta tag", async ({ page }) => {
    const ROUTES = ["/", "/research", "/about", "/projects/kvwarden"];
    for (const route of ROUTES) {
      await page.goto(route);
      const og = await page.locator('meta[property="og:image"]').first().getAttribute("content");
      expect(og, `og:image missing on ${route}`).toBeTruthy();
      expect(og).toContain("/api/og");
    }
  });
});
```

- [ ] **Step 2: Run**

```bash
pnpm exec playwright test tests/e2e/og-images.spec.ts --project=chromium
```
Expected: 13 tests pass (12 title renders + 1 meta-tag check).

- [ ] **Step 3: Visually verify a few**

Open in browser:
- `http://localhost:3000/api/og?title=Coconut%20Labs`
- `http://localhost:3000/api/og?title=Tenant%20fairness%20on%20shared%20inference`

Confirm: wordmark visible, title in Instrument Serif, accent color bar present (per spec §6.9).

If a long title is truncating ugly, add fontSize tier-down logic in `app/api/og/route.tsx`. This is a polish fix only if visually obvious.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/og-images.spec.ts
git commit -m "test(phase-5): verify @vercel/og renders valid png for every route"
```

---

### Task 14: Schema.org JSON-LD validation on research posts

**Files:**
- Create: `tests/e2e/schema.spec.ts`

Phase 2 emitted `ScholarlyArticle` JSON-LD per spec §6.6. Phase 5 verifies it's parseable, has every required field, and matches the post's frontmatter.

- [ ] **Step 1: Write schema spec**

Create `tests/e2e/schema.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const POSTS = [
  "/research/kvwarden-gate-2-fairness",
  // future posts will be added here
];

test.describe("Schema.org ScholarlyArticle JSON-LD", () => {
  for (const slug of POSTS) {
    test(`${slug} emits valid ScholarlyArticle markup`, async ({ page }) => {
      await page.goto(slug);

      const ld = await page
        .locator('script[type="application/ld+json"]')
        .first()
        .textContent();
      expect(ld, "JSON-LD <script> not found").toBeTruthy();

      const data = JSON.parse(ld!);
      expect(data["@context"]).toBe("https://schema.org");
      expect(data["@type"]).toBe("ScholarlyArticle");
      expect(data.headline).toBeTruthy();
      expect(data.datePublished).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(Array.isArray(data.author) || typeof data.author === "object").toBe(true);
      expect(data.publisher?.["@type"]).toBe("Organization");
      expect(data.publisher?.name).toBe("Coconut Labs");
      expect(data.abstract).toBeTruthy();
    });
  }
});
```

- [ ] **Step 2: Run**

```bash
pnpm exec playwright test tests/e2e/schema.spec.ts --project=chromium
```
Expected: 1 test passes (KVWarden Gate 2-FAIRNESS post). As more posts ship, append to the `POSTS` array.

- [ ] **Step 3: Cross-check via Google Rich Results Test (manual, optional for v1)**

Open https://search.google.com/test/rich-results and paste the deployed URL `https://coconutlabs.org/research/kvwarden-gate-2-fairness`. Expected: detects `ScholarlyArticle`, no errors.

This must be done after deploy — the Rich Results Test fetches the live URL.

Document the result in `docs/launch-checklist.md` Step 5.

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/schema.spec.ts
git commit -m "test(phase-5): verify ScholarlyArticle json-ld valid on research posts"
```

---

### Task 15: RSS feed validation (W3C feed validator)

**Files:**
- Create: `.github/workflows/feed-validate.yml`
- Modify: `package.json` (add `validate:rss` script)

Phase 2 made RSS real. Phase 5 hooks it into the W3C Feed Validator (https://validator.w3.org/feed/) so feed regressions are caught.

- [ ] **Step 1: Add `validate:rss` script**

Open `package.json`. Add to scripts:
```json
"validate:rss": "node scripts/validate-rss.mjs"
```

- [ ] **Step 2: Write the validator script**

Create `scripts/validate-rss.mjs`:
```js
const SITE_URL = process.env.SITE_URL ?? "https://coconutlabs.org";
const FEED_URL = `${SITE_URL}/rss.xml`;

const VALIDATOR = `https://validator.w3.org/feed/check.cgi?output=soap12&url=${encodeURIComponent(FEED_URL)}`;

const res = await fetch(VALIDATOR);
const body = await res.text();

// SOAP response includes <m:validity>true</m:validity> on success
if (body.includes("<m:validity>true</m:validity>")) {
  console.log(`OK: ${FEED_URL} validates as Atom 1.0`);
  process.exit(0);
}

console.error(`FAIL: ${FEED_URL} did not validate`);
console.error(body);
process.exit(1);
```

- [ ] **Step 3: Test against deployed URL (after Phase 5 ship)**

For local dev the W3C validator can't reach `localhost`. For now run it against the current production URL (which is the Phase 4 deploy):
```bash
SITE_URL=https://coconutlabs.org pnpm validate:rss
```
Expected: `OK: https://coconutlabs.org/rss.xml validates as Atom 1.0`.

If FAIL, the failure is in the Phase 2 RSS implementation. Common issues: missing `<id>` for an entry, malformed `<updated>` timestamp, unescaped `&` in titles. Fix in the RSS route handler.

- [ ] **Step 4: Add CI workflow**

Create `.github/workflows/feed-validate.yml`:
```yaml
name: Feed validation

on:
  schedule:
    - cron: "0 13 * * 1" # Mondays 13:00 UTC
  workflow_dispatch:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm validate:rss
        env:
          SITE_URL: https://coconutlabs.org
```

This runs weekly + on-demand. It does NOT block PR merge (external service uptime would create flaky CI). On failure, GitHub Actions emails the repo owner.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate-rss.mjs .github/workflows/feed-validate.yml package.json
git commit -m "test(phase-5): add w3c rss feed validation (weekly + on-demand)"
```

---

### Task 16: Print stylesheet smoke test

**Files:** none (manual verification only — print output is hard to automate)

Phase 2 added the print stylesheet per spec §6.7. Phase 5 confirms it works in real print preview.

- [ ] **Step 1: Open a research post in production-mode dev server**

```bash
pnpm build && pnpm start
```
Open `http://localhost:3000/research/kvwarden-gate-2-fairness`.

- [ ] **Step 2: Trigger print preview**

Cmd+P (or Ctrl+P). Verify in the preview pane:
- No header chrome, no footer, no live-signals strip
- Body in Fraunces 11pt, generous line-height
- Headers in Instrument Serif
- Footnotes properly formatted at page bottom (or end of document)
- Page numbers in print headers
- URLs spelled out next to link text (the `@media print` rule should add `content: " (" attr(href) ")"` to inline `<a>` elements)
- Margins ~1in top/bottom, 0.75in left/right

- [ ] **Step 3: Save as PDF + visually verify**

In the print preview, "Save as PDF". Open the PDF in a viewer. Check page breaks don't orphan a heading or split a code block awkwardly.

- [ ] **Step 4: Document result**

Append to `docs/launch-checklist.md` (created in Task 18):
```markdown
- [x] Print stylesheet renders correctly on Chrome print preview (verified yyyy-mm-dd, PDF saved at tmp/research-kvwarden-print-test.pdf)
```

If anything is broken, fix in `styles/tokens.css` `@media print` block or the post layout.

- [ ] **Step 5: Commit any fixes**

```bash
git commit -m "fix(phase-5): print stylesheet adjustments (page break + url-after-link)"
```

If no fixes needed, no commit.

---

### Task 17: Final visual QA pass at standard breakpoints

**Files:** none (manual pass — Phase 6 may add Chromatic/Playwright snapshots)

- [ ] **Step 1: Boot prod build**

```bash
pnpm build && pnpm start
```

- [ ] **Step 2: Walk every route at every breakpoint**

For each of the 12 user-facing routes plus `/404`, set Chrome DevTools device toolbar to:
- 375px (mobile, e.g., iPhone SE)
- 768px (tablet)
- 1280px (desktop default)
- 1920px (wide)

For each (route × breakpoint), look for:
- Text overflow / horizontal scroll
- Element overlap (header on top of content, marginalia bleeding into body)
- Font rendering (Instrument Serif should be visible, not falling back to Georgia)
- Image sizing (founder portrait + project illustrations look intentional, not stretched)
- Color rendering (warm cream `--bg-0`, ink-brown `--ink-0` — not pure white/black)
- Page numbers in corner (spec §6.5)

- [ ] **Step 3: Document any issues found + fix**

Track in a scratch list, then fix in batched commits:
```bash
git commit -m "fix(phase-5): /research card overflow at 375px"
git commit -m "fix(phase-5): /about founder image aspect at 768px"
```

- [ ] **Step 4: Take a screenshot of each route at desktop breakpoint**

Save to `tmp/screens/<route>.png` for the launch announcement / portfolio. Not committed — these are reference assets.

---

### Task 18: Build the launch checklist (spec §13.3)

**Files:**
- Create: `docs/launch-checklist.md`

This is the human sign-off document. Every item maps directly to a spec §13.3 v1-done criterion.

- [ ] **Step 1: Write the checklist**

Create `docs/launch-checklist.md`:
```markdown
# coconutlabs.org v1 launch checklist

Spec reference: `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md` §13.3.

Each item is satisfied by a Phase 5 task listed in parentheses.

## Functional

- [ ] All 12 user-facing routes render with real content or in-character empty state (Tasks 9, 10, 17)
- [ ] Infrastructure endpoints serve: `/rss.xml`, `/sitemap.xml`, `/robots.txt`, `/humans.txt`, `/404` (Phase 0 Task 13 + Task 15 here)
- [ ] One real research post is live: KVWarden Gate 2-FAIRNESS (Phase 2 deliverable, verified in Task 14)
- [ ] Page-tear transition works on Chrome + Safari + Firefox (Tasks 10, 11)
- [ ] `prefers-reduced-motion` is honored everywhere (Task 12)
- [ ] Print stylesheet works on research posts (Task 16)

## Performance

- [ ] Lighthouse Perf ≥ 90 every route, ≥ 95 on `/` (Tasks 6, 7, 8)
- [ ] LCP < 2.0s, TBT < 200ms, CLS < 0.05 on `/` mobile (Tasks 6, 8)
- [ ] JS to home < 150KB gz, initial CSS < 30KB gz (Tasks 2, 3)

## Accessibility

- [ ] Lighthouse a11y ≥ 95 every route (Task 6)
- [ ] axe-core clean (WCAG 2 AA) on every route (Task 9)
- [ ] Skip-to-content link on every page (Phase 0 Task 11)
- [ ] Focus-visible 1.5px accent ring on every interactive (Phase 0 + spot check in Task 17)

## SEO + structured data

- [ ] OG images generate per route (Task 13)
- [ ] Schema.org `ScholarlyArticle` markup present + valid on research posts (Task 14)
- [ ] RSS feed validates against W3C (Task 15)
- [ ] Sitemap + robots.txt present (Phase 0 Task 13)

## Cross-browser

- [ ] Chromium passes (Task 10)
- [ ] Firefox passes (Task 10)
- [ ] WebKit passes (Task 10)
- [ ] Real Safari (macOS) verified (Task 11)
- [ ] Real iOS Safari verified (Task 11) — OR explicit user decision to ship without

## Infrastructure

- [ ] Domain `coconutlabs.org` resolves and serves over HTTPS (Phase 0 Task 22 — re-verify in Task 19 here)
- [ ] CI green on `main` (every Phase 5 commit pushed)
- [ ] Vercel `main` auto-deploys to production
- [ ] Analytics installed (`@vercel/analytics` or Plausible) (Task 20)

## Content sign-off (user)

- [ ] Manifesto copy approved
- [ ] Founder bio approved
- [ ] KVWarden + Weft taglines approved
- [ ] First research post approved for public

## Final

- [ ] Phase 5 PR merged to main
- [ ] Manual "promote to production" in Vercel completed (or confirmed not needed if main already = production)
- [ ] Smoke test: open `https://coconutlabs.org` post-deploy, walk every route once
- [ ] 24h post-ship monitoring (Task 21)
```

- [ ] **Step 2: Commit**

```bash
git add docs/launch-checklist.md
git commit -m "docs(phase-5): add v1 launch checklist (maps to spec §13.3)"
```

---

### Task 19: Production smoke test against `https://coconutlabs.org`

**Files:** none (verification only — output is the launch-checklist Step 3 entries)

This task runs against the LIVE production URL. The Phase 5 PR (Task 22) has merged into `main` by the time this task runs; Vercel has auto-deployed.

- [ ] **Step 1: Verify domain resolves**

```bash
dig coconutlabs.org +short
curl -I https://coconutlabs.org
```
Expected: A record returns Vercel IP, HTTPS responds 200.

- [ ] **Step 2: Walk every route on production**

Open in browser:
- https://coconutlabs.org
- https://coconutlabs.org/research
- https://coconutlabs.org/research/kvwarden-gate-2-fairness
- https://coconutlabs.org/work
- https://coconutlabs.org/papers
- https://coconutlabs.org/podcasts
- https://coconutlabs.org/joinus
- https://coconutlabs.org/about
- https://coconutlabs.org/contact
- https://coconutlabs.org/colophon
- https://coconutlabs.org/projects/kvwarden
- https://coconutlabs.org/projects/weft
- https://coconutlabs.org/this-route-does-not-exist (404)

For each: page loads, no console errors, Header + Footer present, content as expected.

- [ ] **Step 3: Run Lighthouse against production**

```bash
pnpm dlx lighthouse https://coconutlabs.org --output=html --output-path=./tmp/lh-prod-home.html --preset=desktop
pnpm dlx lighthouse https://coconutlabs.org --output=html --output-path=./tmp/lh-prod-home-mobile.html --form-factor=mobile --throttling-method=simulate
```
Open the HTML reports. Confirm:
- Perf ≥ 95 on `/` (desktop)
- Perf ≥ 90 on `/` (mobile, 4G)
- A11y ≥ 95

If a metric regressed between local and production: Vercel may be doing additional optimization (image, edge caching) that helps OR could be running an older build. Check Vercel deployment URL matches the latest `main` commit.

- [ ] **Step 4: Validate RSS against production**

```bash
SITE_URL=https://coconutlabs.org pnpm validate:rss
```
Expected: OK.

- [ ] **Step 5: Submit research post to Google Rich Results Test**

Open https://search.google.com/test/rich-results, paste `https://coconutlabs.org/research/kvwarden-gate-2-fairness`, run test. Expected: detects `ScholarlyArticle`, no errors.

- [ ] **Step 6: Mark launch-checklist Step 3 entries**

In `docs/launch-checklist.md`, check off the "Final" section items and any preceding items still unchecked. Commit:
```bash
git commit -am "docs(phase-5): production smoke + checklist sign-off"
```

---

### Task 20: Add post-ship analytics

**Files:**
- Modify: `app/layout.tsx`
- Modify: `package.json`

Spec §9.1 specifies Plausible. Spec §14 leaves "Plausible vs Vercel Web Analytics" as an open user decision. Default to Vercel Web Analytics (free, zero-setup) unless user picks Plausible.

- [ ] **Step 1: User decision point**

Ask:
> "Pre-launch analytics setup. Two options:
> (a) `@vercel/analytics` — free, included with Vercel, zero config, sends to vercel.com/analytics. Privacy-OK (no cookies, no PII). 
> (b) Plausible — $9/mo, EU-hosted, on the original spec. Needs a Plausible account first.
>
> Default is (a) unless you say otherwise. Which one?"

If (a), continue Step 2.
If (b), this is an **AUTH INTERRUPT** — user creates the Plausible site, sends back the domain ID. Then continue with Plausible SDK install instead.

- [ ] **Step 2 (option a): Install + wire @vercel/analytics**

Run:
```bash
pnpm add @vercel/analytics@^1
```

Open `app/layout.tsx`. Import + render the Analytics component:
```tsx
import { Analytics } from "@vercel/analytics/react";

// inside <body>, after <Footer />:
<Analytics />
```

- [ ] **Step 2 (option b): Install + wire Plausible**

```bash
pnpm add next-plausible@^3
```

Open `app/layout.tsx`. Wrap the `<head>` with the Plausible provider:
```tsx
import PlausibleProvider from "next-plausible";

export default function RootLayout(...) {
  return (
    <html ...>
      <head>
        <PlausibleProvider domain="coconutlabs.org" />
      </head>
      <body>...</body>
    </html>
  );
}
```

Set env var on Vercel: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN = coconutlabs.org`.

- [ ] **Step 3: Verify analytics fires**

Deploy to a Vercel preview. Open the preview URL, navigate a few routes. Within ~1 minute, see entries appear in the analytics dashboard (Vercel: project → Analytics tab; Plausible: plausible.io/coconutlabs.org).

If nothing appears: check the script loaded (DevTools Network → look for `_vercel/insights/script.js` or `plausible.io/js/script.js`).

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(phase-5): add @vercel/analytics for ship-day metrics"
```
(Or `next-plausible` per option b.)

---

### Task 21: 24h post-ship monitoring window

**Files:** none

- [ ] **Step 1: Set a 24h check-in**

After production deploy completes, set a calendar reminder for +24h. The check-in items:

- Analytics dashboard: how many uniques? Any obvious referrers (HN, Twitter)?
- Vercel deployment status: any 5xx errors in the deployment logs?
- GitHub Actions: any feed-validate failures over the past 24h?
- Real-user reports: any DM / email about broken pages?

- [ ] **Step 2: Hot-fix queue**

If real-user reports surface a bug, triage:
- Severity 1 (page broken / 5xx): hot-fix immediately on `main`, Vercel auto-deploys.
- Severity 2 (visual / motion glitch on a specific browser): batch into a follow-up Phase 6 PR.
- Severity 3 (copy / link nit): batch.

- [ ] **Step 3: Document outcomes**

After the 24h window, append to `docs/launch-checklist.md`:
```markdown
## Post-ship 24h report

- yyyy-mm-dd hh:mm UTC ship time
- Uniques: …
- Top referrers: …
- 5xx count: …
- Hot-fixes shipped: …
- Open follow-ups: …
```

```bash
git commit -am "docs(phase-5): 24h post-ship report"
```

---

### Task 22: AUTH INTERRUPT — open Phase 5 PR + merge to main

**Files:** none

- [ ] **Step 1: Run the full local pipeline once more**

```bash
pnpm test:all && pnpm build && pnpm dlx @lhci/cli@0.13.x autorun
```
Expected: green across typecheck, unit, e2e (chromium + firefox + webkit), build, Lighthouse CI.

- [ ] **Step 2: Push branch + open PR**

```bash
git checkout -b phase-5/perf-a11y-ship
git push -u origin phase-5/perf-a11y-ship
gh pr create --title "Phase 5: perf, a11y, cross-browser, ship" --body "$(cat <<'EOF'
## Summary

Performance budget enforcement + accessibility audit + cross-browser verification + launch.
Maps to spec §13 Phase 5 + §13.3 v1-done checklist.

## Highlights

- Lighthouse CI in GH Actions, blocks on perf < 90 (≥ 95 on /), a11y < 95
- axe-core covers all 13 routes
- Playwright runs chromium + firefox + webkit in CI
- Real-device WebGL verified on Safari + iOS Safari (see docs/browser-matrix.md)
- RSS validates against W3C
- Schema.org `ScholarlyArticle` valid on research posts
- @vercel/analytics installed for ship-day metrics

## Deferred (post-ship)

See docs/launch-checklist.md "Final" section for sign-off boxes.

## Test plan

- [x] pnpm test:all passes locally
- [x] Lighthouse CI passes locally on all 12 routes
- [x] axe-core passes on all 13 routes
- [x] Cross-browser Playwright passes chromium + firefox + webkit
- [x] Real Safari + iOS Safari WebGL verified manually
EOF
)"
```

- [ ] **Step 3: Wait for CI green**

```bash
gh pr checks --watch
```

Expected: CI matrix (chromium + firefox + webkit), Lighthouse CI (desktop + mobile), feed-validate all green.

- [ ] **Step 4: User confirms ship**

Ask user:
> "Phase 5 PR is green. All spec §13.3 v1-done items are checked except the final 'merge + Vercel promote + 24h monitor' steps. Merging to main will trigger Vercel auto-deploy to coconutlabs.org. Ready to ship?"

On user yes:

- [ ] **Step 5: Merge**

```bash
gh pr merge phase-5/perf-a11y-ship --squash --delete-branch
git checkout main
git pull
```

- [ ] **Step 6: Watch Vercel deploy**

```bash
gh run list --limit 1
# Vercel deploys outside of GH Actions; check Vercel dashboard or CLI:
pnpm dlx vercel@latest ls --prod
```

Wait until the production deployment completes.

- [ ] **Step 7: Trigger Task 19 (production smoke)**

Run Task 19 against the now-live `https://coconutlabs.org`.

- [ ] **Step 8: Trigger Task 21 (24h monitoring window)**

Set the +24h reminder. Phase 5 is complete.

---

## Self-Review

Spec §13.3 "Definition of v1 done" → Phase 5 task mapping:

| Spec §13.3 criterion | Phase 5 task |
|---|---|
| All 12 user-facing routes render with real content or in-character empty state | Tasks 9, 10, 17, 19 |
| Page-tear transition works on Chrome + Safari + Firefox | Tasks 10 (chromium/firefox/webkit), 11 (real Safari + iOS) |
| Lighthouse Perf ≥ 90 every route, ≥ 95 on `/` | Tasks 6, 7, 8 |
| Lighthouse a11y ≥ 95 every route | Tasks 6, 7, 8 (Lighthouse axis) + Task 9 (axe-core deeper coverage) |
| RSS feed validates | Task 15 |
| OG images generate per route | Task 13 |
| Schema.org markup present on research posts | Task 14 |
| Print stylesheet works on research posts | Task 16 |
| `prefers-reduced-motion` is honored everywhere | Task 12 |
| One real research post is live (KVWarden Gate 2-FAIRNESS) | Task 14 verifies, content delivered Phase 2 |
| Domain `coconutlabs.org` resolves and serves over HTTPS | Phase 0 Task 22 + re-verified in Task 19 |

Spec §10 budget → Phase 5 task mapping:

| Budget item | Enforced by |
|---|---|
| LCP < 2.0s on 4G mobile | `lighthouserc.json` assertion (Task 6), CI gate (Task 7), fixes (Task 8) |
| TBT < 200ms | same |
| CLS < 0.05 | same |
| JS to home < 150KB gz | Bundle analyzer (Task 2), R3F isolation (Task 3) |
| Initial CSS < 30KB gz | Bundle analyzer (Task 2) — CSS check uses `pnpm build` size table |
| Lighthouse Perf ≥ 90, ≥ 95 on / | Lighthouse CI assertMatrix (Task 6) |
| Lighthouse a11y ≥ 95 | Lighthouse CI (Task 6) + axe-core (Task 9) |
| WCAG AA contrast | axe-core (Task 9) |
| Tap targets ≥ 44px | axe-core (Task 9) — `target-size` rule |
| Focus-visible ring on every interactive | Phase 0 baseline + visual QA (Task 17) |
| Skip-to-content on every page | Phase 0 Task 11 baseline |
| `prefers-reduced-motion` respected | Task 12 |

Auth-interrupt points (will pause for user):

- Task 11 Step 4 — BrowserStack credentials if user lacks physical iOS device
- Task 20 Step 1 — Vercel Analytics vs Plausible decision (default to Vercel if no answer)
- Task 22 Step 4 — final ship sign-off before merging the Phase 5 PR

Files created (Phase 5 net-new):
- `lighthouserc.json`
- `.github/workflows/lighthouse.yml`
- `.github/workflows/feed-validate.yml`
- `scripts/validate-rss.mjs`
- `docs/perf-baseline.md`
- `docs/a11y-audit.md`
- `docs/browser-matrix.md`
- `docs/launch-checklist.md`
- `tests/e2e/cross-browser.spec.ts`
- `tests/e2e/reduced-motion.spec.ts`
- `tests/e2e/og-images.spec.ts`
- `tests/e2e/schema.spec.ts`

Files modified (Phase 5):
- `next.config.ts` (bundle analyzer wrapper)
- `package.json` (analyze, validate:rss scripts; @vercel/analytics dep)
- `tests/e2e/accessibility.spec.ts` (extend from 2 routes to 13)
- `.github/workflows/ci.yml` (browser matrix)
- `app/layout.tsx` (analytics)

Test count expectations:
- Unit: unchanged from previous phases (Phase 5 adds no unit tests; lib/* is stable)
- E2E (per browser project): 13 a11y + 12 cross-browser smoke + 13 reduced-motion + 13 OG image + 1 schema = **52 new tests per project**
- Cross-browser CI matrix runs all of these against chromium + firefox + webkit = 156 e2e runs per CI build (plus the Phase 0–4 carry-forward tests)
- Lighthouse: 12 routes × 3 runs × 2 presets = 72 Lighthouse runs per CI build

Phase 5 produces a Lighthouse-clean, axe-clean, three-browser-clean v1 site at `https://coconutlabs.org` with the launch checklist signed off, analytics live, and 24h post-ship monitoring captured. Phase 6+ (per spec §13.4) is parked.
