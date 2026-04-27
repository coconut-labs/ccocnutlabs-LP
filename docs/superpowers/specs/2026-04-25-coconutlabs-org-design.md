# coconutlabs.org — Design Spec

**Date:** 2026-04-25 (amended 2026-04-26)
**Status:** Approved; amendments below
**Authors:** Shrey Patel + Jay Patel + Claude (brainstorming session)
**Domain:** coconutlabs.org

## Amendments — 2026-04-26

1. **Co-founder added.** Jay Patel (`github.com/jaypatel15406`) joins as co-founder. PeopleStrip on `/` and the People grid on `/about` show **two** cards (Shrey + Jay). New file `content/people/jay-patel.mdx`. Voice line "Coconut Labs is currently me, Shrey Patel" → "Coconut Labs is Shrey Patel and Jay Patel."
2. **Email convention.** Site uses three addresses: `info@coconutlabs.org` (default for footer + Atom feed + general inquiries), `shreypatel@coconutlabs.org`, `jaypatel@coconutlabs.org`. All previous `hello@coconutlabs.org` references replaced with `info@coconutlabs.org`.
3. **Custom cursor dropped.** Use the system cursor everywhere. Premium feel comes from typography, color, motion choreography, and content — not a custom-cursor overlay. The CursorLayer component is removed from §7.5, §9.2, §9.3, §13 Phase 0/Phase 4, and §13.2.

---

## 1. Purpose

Build the umbrella website for **Coconut Labs** at `coconutlabs.org`. The site has three jobs, weighted equally:

1. **Credibility** — establish Coconut Labs as a serious independent inference research lab to recruiters, investors, future collaborators, and press.
2. **Research showcase** — host a research feed (writing, papers, podcasts) that becomes the canonical place to read what the lab publishes.
3. **Top-of-funnel for projects** — drive visitors to KVWarden (live) and Weft (in research), with editorial-quality project pages.

This is a flagship-quality marketing-and-publishing site, not a documentation site or a SaaS product page.

---

## 2. Audience

In rough priority:

1. ML researchers and inference-systems engineers — the people we want reading research and contributing to OSS.
2. Recruiters, investors, future collaborators — the people forming "is Coconut Labs real" judgments.
3. Press and other lab founders — the people who'll quote and link us.
4. Project-curious visitors arriving from kvwarden.org or HN — the people we want to deepen engagement with.

The voice serves all four without pandering to any one of them.

---

## 3. Strategic shape

### 3.1 Aesthetic direction — "The Frontier"

Hybrid of brand-forward (D) and technical-minimal lab-notebook (C), executed with editorial polish that exceeds the standalone project sites it umbrellas.

**Spiritual anchor:** the manuscript metaphor. Routes are pages of a research book. Page transitions are paper-tear / paper-fold moments. Editorial typography. Page numbers in the corner. Marginalia in research posts.

**Visual differentiation from peer labs:**
- Anthropic — austere, light, type-led. We're warmer.
- OpenAI — corporate-editorial, dark/light hybrid. We're more publication-feeling.
- DeepMind — research-feed-forward, image-heavy. We're more typographically rigorous.
- Mistral — minimal mono, product-led. We're more editorial.

We sit between "frontier lab" and "research atelier."

### 3.2 Project relationship — A→B migration path

**Phase A (v1 launch):** `coconutlabs.org/projects/kvwarden` and `/projects/weft` are thin overview pages with one headline result and an outbound link to the standalone project domain (kvwarden.org, future weft domain).

**Phase B (post-launch):** standalone project domains redirect to `coconutlabs.org/projects/[name]`, which by then hosts the full LP content. URLs inside coconutlabs.org never change. The IA is designed for B from day 1; v1 ships A.

### 3.3 Site relationship to existing kvwarden.org

- **Before B-phase:** coconutlabs.org links out to kvwarden.org. kvwarden's own waitlist remains at kvwarden.org. No duplication.
- **After B-phase:** kvwarden.org does a 301 redirect to `coconutlabs.org/projects/kvwarden`. The waitlist Cloudflare Worker stays at its existing URL; only the LP HTML moves.

---

## 4. Information architecture

### 4.1 Sitemap

```
/                          Home
/research                  Research blog (MDX posts)
/research/[slug]           Individual post (full editorial layout)
/work                      Open source · tools · experiments (GitHub-driven)
/papers                    Formal publications · preprints
/podcasts                  Episodes · appearances
/projects/kvwarden         Project page
/projects/weft             Project page
/joinus                    Contributors · open-source community
/about                     Manifesto · people · how we work
/contact                   Collaborate · press · general
/colophon                  Site colophon (fonts, stack, inspirations)
/rss.xml                   Research feed (Atom 1.0; served at /rss.xml for discoverability)
/sitemap.xml               Generated
/robots.txt                Allow all, point at sitemap
/humans.txt                Who built this
/404                       In-character missing-page
```

### 4.2 Global navigation

**Primary header nav (7 items):**
`Research · Work · Papers · Podcasts · Projects · About · Join us`

`Contact` is a small button on the right side of the header + a footer link.

**Future consolidation:** if 7 feels crowded once content lands, collapse `Work · Papers · Podcasts` under a `Research ⌄` dropdown. Decision made empirically post-launch, not pre-emptively.

### 4.3 Footer

Mono, full-width, three columns:

1. Nav repeat (mirror of header for accessibility)
2. Social — GitHub, X/Twitter, Hugging Face, arXiv, Google Scholar
3. RSS link · email link · `/colophon` link · `/humans.txt` link

Below the columns: signature line — "Coconut Labs · Made on a quiet workstation · 2026."

### 4.4 What's deliberately not in v1

- `/careers` — solo for now; adding "we're hiring" when not is a tell
- Separate `/blog` — research IS the writing
- Tag/topic filtering on /research — premature with <10 posts
- Comments / reactions
- Newsletter signup on coconutlabs.org — kvwarden's own waitlist remains the place
- Search
- Internationalization
- Light/dark theme toggle — the site has one palette in v1; `/research/[slug]` uses a slightly paler bg variant for long-form reading (see §6.1). No system-preference theme switching.
- `/talks` — fold under `/podcasts` until there's enough talk content

---

## 5. Page composition

### 5.1 `/` — Home

Top-to-bottom:

1. **Hero**
   - H1 in Instrument Serif, ~96px desktop, line-height 0.95
   - Variable-axis weight breathes (-3% → +3% over 8s)
   - One-line dek in Geist Variable below
   - Behind: signature **paper-fold sculpture** WebGL scene (see §6.4)
   - No CTA — confidence through silence
2. **Manifesto strip** — 2 short paragraphs, Fraunces body, 62ch measure, single Instrument Serif pull-quote, SplitText word-by-word reveal on viewport entry
3. **Research strip** — "Recent research →" header, three editorial cards (date in mono, title in serif, dek in sans), 3D-tilt on hover
4. **Projects strip** — two large editorial cards stacked vertically:
   - **KVWarden** — hero result number ("1.14× of solo, 26× better than FIFO") in massive mono, tagline below, "Read more →" outbound
   - **Weft** — "In research" badge in mono, intriguing 1-paragraph teaser, no waitlist (yet)
5. **People strip** — two founder cards (Shrey Patel + Jay Patel), each with photo + 1-line role + bio link. "How we work" link below the row.
6. **Contact strip** — single line of Instrument Serif: "Building something at this layer? Write us." + email
7. **Live-signals strip** (§6.5) — small mono row: "Updated 2 hours ago · 14 commits this week · 3 papers in progress · 1 RFC open" auto-pulled from GitHub at build time
8. **Footer**

Section transitions use 80vh of generous space + a thin horizontal rule that draws itself on scroll into the next section.

### 5.2 Index pages — `/research`, `/work`, `/papers`, `/podcasts` (shared template)

- **Page hero:** serif title + 1-sentence subtitle in mono describing what lives here
- **Content list:** chronological cards, newest first. Each card = date · type · title · 1-line dek · authors/contributors · external link icon if outbound
- **Empty state** (for /work, /papers, /podcasts in v1): in-character, mono — `// nothing here yet — but you can watch the GitHub org for what's brewing →` with link to `github.com/coconut-labs`
- **Pagination:** none in v1 (counts will be small); add cursor pagination if any list exceeds 30 items

### 5.3 `/work` — special handling

Pulls from `content/work/work.json` static manifest in v1. Each entry: `{ name, description, language, repo_url, last_updated, stars? }`. v2 can add a build-time GitHub-API fetch with 24h ISR cache.

### 5.4 `/research/[slug]` — Post template

- Editorial layout, ~62ch measure
- Reading-progress bar at top (1px, accent color)
- Marginalia for footnotes/citations on desktop; collapse into footnotes on mobile
- Embeddable interactive figures via MDX components: `<Chart>`, `<Figure>`, `<Pullquote>`, `<Footnote>`, `<CodeGroup>`, `<R3FScene>` (lazy)
- Author + date + "More research →" + share row at bottom (share row: copy-link button, X/Twitter intent, mailto, BibTeX-snippet copy if `doi` frontmatter present)
- Schema.org `ScholarlyArticle` markup (§6.6)
- Print stylesheet (§6.7)
- Slightly paler `--bg-0` variant for long-form readability — see §6.1

### 5.5 `/projects/[slug]` — Project pages (v1 thin)

For both `kvwarden` and `weft`:

- Hero: project wordmark + 1-line tagline + status badge ("Live" / "In research")
- One headline result in massive type
- 2–3 paragraphs of "what + why"
- "Read the full project →" outbound CTA to standalone domain (A-phase)

In B-phase these expand in-place to full LP content. URL never changes.

### 5.6 `/joinus` — Contributors

- Hero: "Build with us." in Instrument Serif. 1-paragraph framing.
- Section: "Open repos" — pulled from same /work manifest, "good first issue" counts surfaced if available
- Section: "How to contribute" — link to org-level CONTRIBUTING.md, code of conduct, communication channels
- Section: "Why" — 2-3 sentences on values

### 5.7 `/about`

- Hero: longer manifesto (full version of homepage strip)
- People: two founder cards (Shrey Patel, Jay Patel) with photo, bio, social links. Future collaborators slot into the same grid.
- "How we work" — 4-5 short principles, each with a serif title + mono body
- Values section

### 5.8 `/contact`

Three short sections — **Collaborate · Press · General** — each with a one-sentence framing + a `mailto:` link. No form in v1.

### 5.9 `/colophon`

Editorial single page listing fonts, tech stack, inspirations, build credits. Linked discreetly from footer. Premium-craft signal.

### 5.10 `/404`

In-character: a torn-out paper page with an animated tear effect on first paint. Mono caption: `// page not found — perhaps it was never written.` Link back to `/`.

---

## 6. Visual system

### 6.1 Color palette — "neither dark nor light" (warm paper / coconut husk)

```
--bg-0          #ECE6D6   warm cream / coconut-husk-interior   page background
--bg-1          #F2ECDD   raised surface                       cards, header blur
--bg-2          #DED5C2   recessed surface                     inline code, pull-quote bg
--ink-0         #1A1611   deep ink-brown (not pure black)      body, primary type
--ink-1         #5C5447   muted ink                            secondary, captions
--ink-2         #8A8275   far-muted                            meta, footer fine print
--rule          #C8BFAB   1px hairlines, dividers
--accent        #9B6B1F   coconut interior amber (deep)        link hover, accents on cream
--accent-2      #4A5B49   frond sage (deep)                    status, "in research" badges
--success       #4A7355
--danger        #A53D2A
```

`/research/[slug]` posts always render with a paler `--bg-0` variant (`#F4EFE2`) for long-form reading. This is a per-route style override applied in the route's layout, not a system-preference-driven theme switch. All other tokens are unchanged.

Reference points: Stripe Press, ink-and-switch.com, Robin Sloan's site.

### 6.2 Type system

| Voice | Family | Use |
|---|---|---|
| Display serif | Instrument Serif | hero, page titles, marquee moments |
| Body serif | Fraunces Variable | long-form prose (research posts) |
| Sans / UI | Geist Variable | nav, UI, dek, cards, buttons |
| Mono | Geist Mono | data, code, dates, status, telemetry |

All four are free + variable + .woff2 + subset to Latin + Latin-Ext.

### 6.3 Type scale

Fluid via `clamp()`, 1.250 ratio:

```
display-xl   clamp(64px, 8vw, 128px)    Instrument Serif, 400, lh 0.95, tracking -0.02em
display-lg   clamp(48px, 5vw, 80px)     Instrument Serif, 400, lh 1.0,  tracking -0.02em
h1           clamp(40px, 4vw, 56px)     Instrument Serif, 400, lh 1.05, tracking -0.015em
h2           clamp(28px, 2.5vw, 40px)   Instrument Serif, 400, lh 1.1,  tracking -0.01em
h3           20px                        Geist Variable, 600, lh 1.3
body         17px                        Fraunces, 400, lh 1.55, optical 18
ui           14px                        Geist Variable, 500, lh 1.4
mono         13px                        Geist Mono, 500, lh 1.5
```

Variable axis usage: hero headlines breathe weight (-3% → +3% over 8s), Fraunces uses optical-sizing axis to switch between body and pull-quote styles automatically, mono is fixed-axis.

### 6.4 Custom wordmark + signature motif

- **"Coconut Labs" wordmark** — single hand-drawn SVG path with a small custom flourish on the `L` and a ligature between `ct`. Stroke-draw animation on first paint. Same SVG everywhere (header, footer, OG images, 404).
- **Signature hero motif: paper-fold sculpture** — a single piece of cream paper folding/unfolding/curling in 3D, lit cinematically, low-poly with subtle subsurface scattering. R3F-based, ~3 days WebGL R&D in Phase 1. Reappears across project marks, OG images, 404. The visual that makes Coconut Labs identifiable at a glance.

### 6.5 Editorial systems

- **Page numbers** — small mono caption "p. 04 of 11" in the bottom-right corner of every route. Animates on transition.
- **ThinRule** — animated horizontal rule that draws itself on viewport entry. Used between home strips and at section breaks in research posts.
- **Live-signals strip** — small mono row above the home footer: "Updated 2h ago · 14 commits this week · 3 papers in progress · 1 RFC open." Pulled from `github.com/coconut-labs` at build time via Next ISR (revalidate every hour).
- **Marginalia** — research posts get marginal annotations (footnotes, citations, hand-drawn SVG underlines used sparingly) in a different ink color to evoke an annotated paper.

### 6.6 Schema.org + research-post metadata

Every research post emits structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "ScholarlyArticle",
  "headline": "...",
  "datePublished": "...",
  "author": [{ "@type": "Person", "name": "..." }],
  "publisher": { "@type": "Organization", "name": "Coconut Labs" },
  "abstract": "..."
}
```

So Google Scholar, Semantic Scholar, and arXiv-listings can index posts as scholarly articles. Free credibility.

### 6.7 Print stylesheet

Research posts have a print-only stylesheet (`@media print`):

- No nav chrome, no footer, no live signals
- Margins: 1in top/bottom, 0.75in left/right
- Body: Fraunces 11pt, 1.4 line-height
- Headers: Instrument Serif unchanged
- Footnotes: properly formatted at page bottom
- Page numbers in print headers
- URLs spelled out next to link text

### 6.8 Spacing + grid

- Baseline grid: 8px
- Vertical rhythm: 24/32/48/64/96/144 px stops
- Container: max-width 1280px, gutter `clamp(24px, 4vw, 80px)`
- Editorial measure: 62ch for body prose, never exceed
- Section gap on home: 80vh default, 40vh mobile

### 6.9 Imagery

- Founder portraits: two well-lit black-and-white portraits (Shrey Patel, Jay Patel), square crop, full-bleed rectangle (no avatar circle), placed in same grid
- OG images: auto-generated per page via `@vercel/og` — wordmark + page title in Instrument Serif on `--bg-0`, with the page's accent color as a thin vertical bar
- Project hero illustrations: SVG-only, hand-drawn (or scaffolded by Claude). No stock photography. No 3D-render-of-laptop. Ever.

### 6.10 Iconography

- Lucide React for utility icons (arrow, link-out, github, copy). Stroke 1.25px. `--ink-1` default, `--ink-0` on hover.
- Custom SVG only for project marks and the wordmark. No icon font.

---

## 7. Motion system

### 7.1 Principles

- Default state is quiet. Motion is earned, not constant.
- 60fps or it doesn't ship. Every motion gets profiled on a Pixel 6a / mid-range MacBook before merging.
- One canvas rule: the home WebGL hero is the only persistent canvas. Inner pages get `<Canvas>` only when a specific scene is on-screen, mounted lazily, unmounted on exit.
- No parallax for parallax's sake. Effects must communicate something.
- All motion respects `prefers-reduced-motion`.

### 7.2 Easing + duration vocabulary

```
easing       cubic-bezier(0.16, 1, 0.3, 1)        UI-default ("expo out")
easing       custom paper-physics curve            page-tear transitions
duration     180ms                                 micro (hover, focus)
duration     320ms                                 UI (modal, accordion)
duration     520ms                                 section reveal
duration     720ms                                 page-tear transition
```

### 7.3 Route transition: page-tear primary, page-fold secondary

Disambiguation: the **paper-fold sculpture** (§6.4) is the hero WebGL motif on `/`. The **page-tear** and **page-fold** here are separate route-transition effects with different durations and intensity.

- Outgoing route is snapshotted to a WebGL texture (DOM-to-texture)
- Custom GLSL shader displaces the texture using a paper-tear noise mask + curl displacement, ~700ms
- Incoming route fades up underneath
- Built once as `<RouteTransition>` wrapper around `<RootLayout>`, triggered by Next 15 View Transitions API
- **First-time-only choreography:** first 2 transitions of a session use the full elaborate **page-tear**; subsequent transitions degrade to a faster **page-fold** (~350ms, lighter shader, avoids fatigue). Tracked via `sessionStorage` key `coconut.transitions.count`.
- **Reduced motion:** instant cross-fade
- **Fallback:** if shader R&D in Phase 4 doesn't land at premium quality in budget, fall back to View Transitions API native morph + paper-texture overlay (~70% as good, 30% the work)

### 7.4 First-load ceremonial reveal

First session only (sessionStorage flag): 1.5–2s choreographed sequence:

1. Background fades in (200ms)
2. Wordmark stroke-draws (600ms)
3. Hero typography reveals letter-by-letter under the breathing weight axis (700ms)
4. Paper-fold canvas mounts (300ms)
5. Page becomes interactive

Skipped on subsequent loads. This is what makes the first impression unforgettable.

### 7.5 Section + element motion

- SplitText character/word reveals on hero headlines (custom ~30-line component, GSAP-Club replacement)
- Fade-up + slight scale on body sections via Framer Motion's `<motion.div>` with `whileInView`
- Charts that draw themselves (D3 path animation or Framer Motion SVG)
- Project cards 3D-tilt on hover (vanilla CSS perspective)
- ThinRule dividers draw themselves on viewport entry
- System cursor everywhere — no custom cursor overlay (per 2026-04-26 amendment)

### 7.6 Lenis smooth scroll

Lenis (MIT) wraps the document. Respects `prefers-reduced-motion`. Tuned for "smooth but not laggy" — `lerp: 0.1`.

---

## 8. Brand voice

Lab-notebook tone. Locked in this spec to avoid future drift.

### 8.1 Voice rules

- Short declarative sentences. Active voice.
- Lowercase mono captions for metadata, status, dates.
- Specific numbers > adjectives. "53.9 ms quiet TTFT" > "fast inference."
- Honest scale: "Coconut Labs is Shrey Patel and Jay Patel" — not "we're a team of dozens." The honest plainspoken voice ages well and signals confidence.
- Manuscript metaphors are fine sparingly. Don't over-lean on "page," "chapter," "manuscript" — let the visual system carry it.
- Banned phrases: "we empower," "next-generation," "innovative," "cutting-edge," "leverage," "unlock," "seamless," "revolutionary," "AI-powered," "the future of."
- One joke per page maximum. Dry, not winking.

### 8.2 Voice examples

**Manifesto opener (homepage strip):**
> Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems — the boring, load-bearing software between an LLM and the GPU it runs on. KVWarden is the first project. Weft is the second. There will be more.

**KVWarden tagline:**
> Tenant fairness on shared inference. 53.9 ms solo, 61.5 ms under flooder pressure, 26× better than FIFO.

**Weft teaser:**
> A scheduler for Apple Silicon that keeps tenants honest under load. In research. Watching `mlx-lm#965` for upstream correctness fixes before we publish.

**Empty state for /papers:**
> `// nothing here yet — but the work that becomes papers is happening at github.com/coconut-labs →`

---

## 9. Component architecture

### 9.1 Stack pin

```
runtime          Next.js 15.x (App Router), React 19, Node 22 LTS
language         TypeScript strict
styling          Tailwind CSS v4 + CSS variables for tokens
motion           Framer Motion (motion 11.x) + GSAP free + Lenis
3D / WebGL       @react-three/fiber + @react-three/drei + custom GLSL
content          MDX via @next/mdx + gray-matter frontmatter
syntax           Shiki (server-side, zero JS at runtime)
icons            Lucide React (custom SVG for wordmark + project marks)
OG images        @vercel/og (edge runtime)
deploy           Vercel
domain           coconutlabs.org via Cloudflare DNS
analytics        Plausible (privacy-first, EU-hosted)
```

No paid licenses. GSAP-free is sufficient — SplitText is replaced with our own ~30-line component, MorphSVG isn't needed (page-tear is shader-based), ScrollSmoother is replaced by Lenis.

**Cloudflare Workers via @opennextjs/cloudflare** is a documented Phase-6 migration option if real-world TTFB data justifies the swap. We don't lock anything in by starting on Vercel.

### 9.2 Repo layout

```
coconutlabs/
├── app/
│   ├── layout.tsx                  global shell: <Header/> <RouteTransition/> <Footer/>
│   ├── page.tsx                    /
│   ├── research/page.tsx
│   ├── research/[slug]/page.tsx
│   ├── work/page.tsx
│   ├── papers/page.tsx
│   ├── podcasts/page.tsx
│   ├── projects/kvwarden/page.tsx
│   ├── projects/weft/page.tsx
│   ├── joinus/page.tsx
│   ├── about/page.tsx
│   ├── contact/page.tsx
│   ├── colophon/page.tsx
│   ├── api/og/route.tsx            OG image edge function
│   ├── rss.xml/route.ts
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── globals.css                 tailwind layer
│   └── not-found.tsx
├── components/
│   ├── shell/                      Header, Footer, RouteTransition, PageNumber
│   ├── home/                       Hero, HeroCanvas, ManifestoStrip, ResearchStrip, ProjectsStrip, PeopleStrip, ContactStrip, LiveSignalsStrip
│   ├── post/                       PostHeader, PostBody, ProgressBar, Marginalia
│   ├── primitives/                 Wordmark, ThinRule, SplitText, RevealUp, Card, Badge
│   ├── canvas/                     PaperFoldSculpture, PaperTear, shaders/*.glsl
│   └── mdx/                        components.tsx, Chart, Figure, Pullquote, Footnote, CodeGroup, R3FScene
├── content/
│   ├── research/                   *.mdx posts
│   ├── papers/papers.json
│   ├── podcasts/podcasts.json
│   ├── work/work.json
│   ├── projects/                   kvwarden.mdx, weft.mdx
│   ├── people/                     shrey-patel.mdx
│   └── about/manifesto.mdx
├── lib/
│   ├── content.ts                  loadMdx(), loadJson(), getAllPosts(), getPostBySlug()
│   ├── mdx.ts                      MDX serialize options + remark/rehype plugins
│   ├── seo.ts                      buildMetadata() helpers
│   └── github.ts                   ISR-cached GitHub repo + activity fetch
├── public/
│   ├── fonts/                      Instrument Serif, Fraunces, Geist, Geist Mono — .woff2 variable
│   ├── og-base.png
│   ├── wordmark.svg
│   ├── humans.txt
│   └── images/                     founder portrait, project illustrations
├── styles/tokens.css
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

### 9.3 Component principles

- React Server Components by default. `'use client'` only where interactivity, motion hooks, or canvas mounts demand it.
- Files cap at ~200 lines. Past that = split responsibilities.
- Primitives are framework-level. Page-section components live in `components/{section}/` and stay page-scoped.
- Canvas/WebGL is dynamically imported (`next/dynamic({ ssr: false })`) and gated by an in-view observer.
- Motion components are client islands wrapped over server-rendered children — keeps the type/markup server-rendered, only the motion shell hydrates.

### 9.4 Content model

All file-based, no CMS.

**Research post frontmatter:**

```yaml
title: "Tenant fairness on shared inference"
dek: "How we got from 523× starvation to 1.14× of solo on a single A100."
date: 2026-04-19
authors: [shrey-patel]
tags: [inference, fairness, kvwarden]
hero: ./hero.png         # optional, falls back to generated OG
draft: false
doi: null                # optional, for posts that get DOIs
```

**Project page frontmatter (`projects/[slug].mdx`):**

```yaml
name: KVWarden
tagline: "Tenant fairness on shared inference."
status: live             # live | research | archived
headline_result: "1.14× of solo, 26× better than FIFO"
external_url: https://kvwarden.org
github_url: https://github.com/coconut-labs/kvwarden
```

**JSON manifests** (work.json, papers.json, podcasts.json) — schema documented in `lib/content.ts` types.

---

## 10. Performance + accessibility budget

CI-enforced. Block deploy on regression.

```
LCP                  < 2.0s on 4G mid-tier mobile
TBT                  < 200ms
CLS                  < 0.05
JS to home           < 150KB gz (R3F lazy, doesn't count)
Initial CSS          < 30KB gz
Lighthouse Perf      ≥ 90 every route, ≥ 95 on /
Lighthouse a11y      ≥ 95 every route (blocks deploy)
WCAG contrast        AA minimum, AAA for body text against --bg-0
Tap targets          ≥ 44px
Focus-visible ring   1.5px --accent on every interactive
Skip-to-content      on every page
prefers-reduced-motion respected on every animation
```

Fonts: preload Instrument Serif + Geist Variable (above-fold). Fraunces + Geist Mono use `font-display: swap`. All four subset to Latin + Latin-Ext.

---

## 11. Testing

```
unit                 Vitest         lib/* (content loaders, slug helpers, seo)
e2e                  Playwright     route renders, nav, page transitions, reduced-motion fallback
a11y                 axe-core       run in Playwright per-route, blocks on violations
perf                 Lighthouse CI  every PR, blocks on > 5pt regression
visual regression    skipped v1     add Chromatic or Playwright screenshots in v2
```

---

## 12. Build + deploy

- **GitHub repo:** `coconut-labs/coconutlabs-org` (new repo, separate from `infergrid-root-pages`)
- **Vercel** project linked to the repo. `main` auto-deploys to `coconutlabs.org`. Preview deploys per PR.
- **Cloudflare DNS** (matches existing kvwarden.org pattern) — A records to Vercel.
- **Env vars:** `NEXT_PUBLIC_SITE_URL`, `PLAUSIBLE_DOMAIN`, `GITHUB_PAT` (for /work + live-signals build-time fetch — read-only token).

---

## 13. Build phases

### Phase 0 — Foundation (~3 days)

- Repo bootstrap: Next 15 App Router, TS strict, Tailwind v4, Lenis, Framer Motion, R3F, MDX, Shiki
- Token system in `styles/tokens.css`, mapped through Tailwind v4 theme
- Variable font loading (4 .woff2 variable files)
- Global shell: `<Header>`, `<Footer>`, `<RouteTransition>` (stubbed)
- Hand-drawn Coconut Labs wordmark SVG + animated stroke-draw
- Vercel project + custom domain DNS
- Stubs: `/not-found`, `/robots.ts`, `/sitemap.ts`, `/rss.xml/route.ts`, `/humans.txt`
- **Outcome:** site live at coconutlabs.org with header/footer + empty content, design tokens enforced

### Phase 1 — Home + visual identity (~5–8 days, +3 for paper-fold sculpture)

- Hero: Instrument Serif headline with breathing weight + paper-fold sculpture WebGL canvas
- Manifesto strip with SplitText word-by-word reveal
- Research strip (3 placeholder cards — replaced by real posts in Phase 2)
- Projects strip (KVWarden + Weft cards with real content)
- People strip (two founder cards: Shrey Patel + Jay Patel)
- Contact strip
- ThinRule animated dividers
- PageNumber editorial system (corner mono caption)
- First-load ceremonial reveal choreography
- Footer polish
- **Outcome:** home page complete, scrollable, signature motion correct

### Phase 2 — Research engine (~5 days)

- MDX pipeline + Shiki syntax highlighting
- `/research` index page
- `/research/[slug]` editorial template (62ch measure, marginalia, progress bar)
- MDX components: `<Chart>`, `<Figure>`, `<Pullquote>`, `<Footnote>`, `<CodeGroup>`, `<R3FScene>`
- First post live: KVWarden Gate 2-FAIRNESS launch post (already drafted on `draft/gate0-launch-post`)
- RSS feed working
- `@vercel/og` per-page OG image generation
- Schema.org `ScholarlyArticle` markup
- Print stylesheet
- **Outcome:** real research lives at `/research/...`, subscribable, indexable by Google Scholar

### Phase 3 — Inner pages (~4 days)

- `/work` + `content/work/work.json`
- `/papers` + `papers.json` (in-character empty state)
- `/podcasts` + `podcasts.json` (in-character empty state)
- `/joinus`
- `/about`
- `/contact`
- `/projects/kvwarden` (thin v1)
- `/projects/weft` (thin v1)
- `/colophon`
- **Outcome:** every route renders real content or in-character empty state

### Phase 4 — Motion polish — *high-risk* (~5 days)

- Page-tear shader (custom GLSL)
- `<RouteTransition>` wired into Next 15 View Transitions API
- First-time-only choreography (sessionStorage flag)
- Reduced-motion fallback (instant cross-fade)
- `<SplitText>` component finalized
- Section reveal choreography across all routes
- Live-signals strip with GitHub fetch + ISR
- In-character 404 with paper-tear effect
- **Outcome:** signature "story between pages" motion locked

### Phase 5 — Performance + a11y + ship (~3 days)

- Lighthouse CI in GH Actions
- Performance budget enforcement
- axe-core a11y audit per route via Playwright
- Font subsetting verification
- Image optimization pass
- Cross-browser test (Chrome, Safari incl. iOS, Firefox, Chrome Android)
- WebGL Safari/iOS regression check
- Reduced-motion verification per route
- 404 polish
- **Outcome:** shippable

### Total: **~6 weeks solo / ~3.5 weeks with Claude pair-programming**

### 13.1 Critical-path risks

- **Page-tear shader (Phase 4)** — highest-craft, highest-risk. If it doesn't land at premium quality in 5 days, fall back to View Transitions API native morph + paper-texture overlay (~2 days, 70% as good).
- **Paper-fold sculpture (Phase 1)** — second-highest-craft. Same fallback discipline: if it doesn't land in 3 days, ship a static SVG paper-fold illustration with subtle CSS animation as v1, upgrade to WebGL in v2.
- **WebGL on Safari/iOS** — historically buggy. Test daily during Phase 1, not just Phase 5.
- **Content writing slippage** — manifesto, founder bio, project taglines, first research post are real writing. If text isn't ready when implementation needs it, ship lorem-ipsum and replace later. Try to write content during Phases 0–1 in parallel.

### 13.2 Scope cuts in priority order if we slip

1. Drop `<R3FScene>` MDX component (research posts use static charts only) — save 1 day
2. Ship page-tear with View Transitions native instead of custom shader — save 3 days
3. Ship `/projects/[slug]` as redirect-stubs (no overview content) — save 1 day
4. Ship paper-fold sculpture as static SVG instead of R3F — save 3 days
5. Ship without first-load ceremonial reveal — save 2 days

### 13.3 Definition of "v1 done"

- All 12 user-facing routes render with real content or in-character empty state (plus infrastructure endpoints: /rss.xml, /sitemap.xml, /robots.txt, /humans.txt, /404)
- Page-tear transition works on Chrome + Safari + Firefox
- Lighthouse Perf ≥ 90 every route, ≥ 95 on `/`
- Lighthouse a11y ≥ 95 every route
- RSS feed validates
- OG images generate per route
- Schema.org markup present on research posts
- Print stylesheet works on research posts
- `prefers-reduced-motion` is honored everywhere
- One real research post is live (KVWarden Gate 2-FAIRNESS)
- Domain `coconutlabs.org` resolves and serves over HTTPS

### 13.4 Phase 6+ (post-launch, parked)

- B-phase migration (kvwarden.org content moves into `/projects/kvwarden` in-place)
- GitHub-API auto-pull for `/work` (replace static manifest)
- Search across research
- Tag/topic filtering on /research
- Cloudflare Workers migration (if perf data justifies)
- Newsletter on coconutlabs.org
- `/talks` page
- i18n
- Visual regression tests (Chromatic or Playwright screenshots)
- Storybook for components
- Ambient sound layer (off by default with mute toggle)

---

## 14. Open questions / pending user decisions

- **Founder portrait** — does one exist that we can use, or do we need to commission/take one? Affects Phase 1.
- **Paper-fold sculpture art-direction** — do you want to art-direct the lighting/material/motion of the sculpture, or trust Claude to scaffold a first pass and iterate?
- **Manifesto draft** — needs to be written by you (it's your voice). Is there a draft anywhere or should we draft together in Phase 0?
- **Weft teaser content** — what exactly do we say without scooping yourself? Probably a 1-paragraph version of Decision E from the Weft strategy docs.
- **Plausible vs Vercel Web Analytics final pick** — going with Plausible per the spec, confirm this is OK ($9/mo).
- **Live-signals exact metrics** — final pick of which 3-4 metrics to surface. Current proposal: "commits this week · papers in progress · RFCs open." Adjust as desired.

### 14.1 Auth-interrupt points (will pause for user)

These steps require credentials Claude cannot self-provision. Phase 0 will pause at each:

1. **GitHub repo creation** under `coconut-labs/` — needs user to either create the empty repo or grant `gh` admin to create it.
2. **Vercel project linking** — needs user to authorize the GitHub repo on Vercel + connect it to a Vercel team/account.
3. **Cloudflare DNS for `coconutlabs.org`** — needs user to add A records (or CNAME to `cname.vercel-dns.com`) pointing the apex + `www` to Vercel. User has Cloudflare access; Claude does not.
4. **GitHub PAT for `lib/github.ts`** — read-only token, scopes `public_repo` + `read:org`. Stored as `GITHUB_PAT` env var on Vercel.
5. **Plausible site setup** (if going Plausible route) — user adds the domain to their Plausible account; site script ID is set as `PLAUSIBLE_DOMAIN` env var.

---

## 15. Out of scope (explicit)

- Documentation site (kvwarden has its own docs)
- Product/dashboard UI for KVWarden or Weft
- Authentication
- E-commerce
- Forums or comments
- Real-time anything (no live data feeds beyond build-time GitHub fetch)
- Mobile app
- Newsletter system on coconutlabs.org
- **Custom cursor overlay** — use the system cursor (per 2026-04-26 amendment). Premium feel comes from type, color, motion choreography, and content; a custom cursor reads as gimmicky / "club website."
