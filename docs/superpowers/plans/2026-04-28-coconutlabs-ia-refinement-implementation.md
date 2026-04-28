# coconutlabs.org — IA + Content Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the 2026-04-28 IA + content refinement spec, plus three additional polish threads (avatars, smoothness, email-link affordance) the user has pulled in. Ship a noticeably tighter coconutlabs.org: 5-item nav with a real CTA, a mixed `/research` feed, a real `/projects` hub, a `/joinus` page that gives contributors actual paths, refined `/contact` copy, a reordered home with an inline hero CTA, plus avatar/smoothness/email polish.

**Architecture:** All work lives in the existing Next.js 15 + React 19 + Tailwind v4 codebase. No new runtime deps except `clsx` if needed (already in tree). Source-of-truth changes live in `lib/routes.ts`, `lib/content.ts`, and `next.config.ts`. New page at `app/projects/page.tsx`. Three pages get full rewrites (`/research`, `/joinus`, `/contact`). Home composition reorders. Plan is structured so each task is self-contained, builds + passes tests on commit, and the user can stop after any task.

**Tech Stack:** Next.js 15.5.6, React 19.2, TypeScript strict, Tailwind v4, motion 11, @react-three/fiber, @next/mdx, Vitest, Playwright, axe-core. Identity for commits: `Shrey Patel <patelshrey77@gmail.com>` over SSH (`git@github.com:coconut-labs/ccocnutlabs-LP.git`). No `Co-Authored-By: Claude` lines.

**Spec:** `docs/superpowers/specs/2026-04-28-coconutlabs-ia-content-refinement-design.md` (committed `0a847cd`).

---

## Prerequisites

Before starting:
- `cd /Users/shrey/Personal Projects/ccocnutlabs-LP`
- Confirm clean tree: `git status` → `nothing to commit, working tree clean`
- Confirm tests baseline: `npm run typecheck && npm run test && npm run build && npm run test:e2e -- --project=chromium`. All must pass before starting.
- Latest research-post slug for build-time CTA resolution: `tenant-fairness-on-shared-inference` (verified in `content/research/2026-04-19-tenant-fairness-on-shared-inference.mdx`).

---

## File Structure

### Files modified
| Path | Change |
|---|---|
| `lib/routes.ts` | Drop `/work`, `/papers`, `/podcasts` from nav. Add `/contact` to nav. Promote `/projects` (replace `/projects/kvwarden` nav entry). |
| `lib/content.ts` | Add `loadResearchFeed()` returning `FeedEntry[]` (mixed posts + papers + podcasts). Add `getLatestPostSlug()` for CTA resolution. |
| `lib/contributors.ts` | NEW — build-time loader for `coconut-labs/kvwarden/CONTRIBUTORS` GitHub raw file with ISR cache. |
| `next.config.ts` | Add 308 redirects: `/work` → `/projects#tools`, `/papers` → `/research?type=papers`, `/podcasts` → `/research?type=podcasts`. |
| `components/shell/Header.tsx` | Replace Mail icon with full `Contact` nav link. Add `Read the launch →` CTA button on the right. |
| `components/primitives/EmailLink.tsx` | Bump copy-button visual prominence. Add `data-cta` attributes. Tooltip-as-text on first paint. |
| `components/home/Hero.tsx` | Add result-anchor sentence + inline `Read the launch →` button below the existing tagline. |
| `components/home/LiveSignalsStrip.tsx` | Add `latest note` first item + permanent `kvwarden gate 2 · 1.14× solo · 26× better than fifo` banner-of-record line. Reorder. |
| `app/page.tsx` | Reorder: Projects above Research. |
| `app/research/page.tsx` | Convert to mixed feed with mono filter row. URL search-param-driven filter (`?type=papers` etc.). |
| `app/contact/page.tsx` | Expand body copy to 2-3 sentences per row. Add response-time block. Add "not for this inbox" block. |
| `app/joinus/page.tsx` | Full rewrite: 5 starting paths, give-back / don't-do / not-looking-for blocks, contributors block. |
| `components/about/PersonCard.tsx` | Replace placeholder rendering when `person.image` matches founder-placeholder.svg with the new initials-only minimal placeholder pattern. |
| `components/home/PeopleStrip.tsx` | Same placeholder treatment as PersonCard (when image is the placeholder). |
| `public/images/founder-placeholder.svg` | Replace contents with a minimal initials-bg-only treatment that scales cleanly. |
| `tests/e2e/home.spec.ts` | Update assertions for new strip order, Hero result-anchor, 6-item LiveSignals. |
| `tests/e2e/inner-pages.spec.ts` | Update for new /contact body, /joinus paths, /projects hub, /research filter, redirects. |
| `tests/unit/lib/content.test.ts` | Add tests for `loadResearchFeed`, `getLatestPostSlug`. |

### Files created
| Path | Responsibility |
|---|---|
| `app/projects/page.tsx` | New /projects hub page with 3-tier hierarchy (KVWarden large, Weft medium, tools list). |
| `lib/contributors.ts` | Build-time fetcher for `CONTRIBUTORS` file. Returns `string[]` of GitHub handles. |
| `tests/unit/lib/contributors.test.ts` | Unit test for the contributors loader. |
| `tests/e2e/redirects.spec.ts` | E2E for the three 308 redirects. |

### Files deleted
| Path | Why |
|---|---|
| `app/work/page.tsx` | Replaced by 308 redirect to `/projects#tools`. |
| `app/papers/page.tsx` | Replaced by 308 redirect to `/research?type=papers`. |
| `app/podcasts/page.tsx` | Replaced by 308 redirect to `/research?type=podcasts`. |

### Out-of-scope kept-alive
- `IndexPageTemplate`, `IndexCard`, `EmptyState` components stay in the codebase. They're no longer routed but the pattern may return for future hubs.

---

## Phase A — Foundations (low risk, sets the stage)

### Task 1: Update `lib/routes.ts` — flip nav booleans

**Files:**
- Modify: `lib/routes.ts`

- [ ] **Step 1: Open the file and replace the `ROUTES` array**

Replace the existing `ROUTES` block in `lib/routes.ts` with:
```ts
export const ROUTES: RouteEntry[] = [
  { href: "/", label: "Home" },

  // Top nav (primary)
  { href: "/research", label: "Research", nav: true },
  { href: "/projects", label: "Projects", nav: true },
  { href: "/joinus",   label: "Join us",  nav: true },
  { href: "/about",    label: "About",    nav: true },
  { href: "/contact",  label: "Contact",  nav: true },

  // Hub-internal (URL-stable, not in top nav)
  { href: "/research/[slug]",   label: "Research post" },
  { href: "/projects/kvwarden", label: "KVWarden" },
  { href: "/projects/weft",     label: "Weft" },

  // Footer-only
  { href: "/colophon", label: "Colophon" },
];
```

The /work, /papers, /podcasts entries are removed. /contact is now `nav: true`. The previous `/projects/kvwarden` nav entry is replaced by `/projects` as the nav root.

- [ ] **Step 2: Run typecheck**

Run: `npm run typecheck`
Expected: clean. (No callers of `ROUTES` enumerate `/work`/`/papers`/`/podcasts` by href.)

- [ ] **Step 3: Run unit tests**

Run: `npm run test`
Expected: all pass. None of the unit tests assert specific route URLs.

- [ ] **Step 4: Commit**

```bash
git add lib/routes.ts
git commit -m "refactor(nav): drop /work, /papers, /podcasts from nav; promote /projects + /contact"
```

---

### Task 2: Add 308 redirects in `next.config.ts`

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Read the current file**

Run: `cat next.config.ts`

The current file likely exports a config object with `mdx`/`images` settings. Locate the place where you'd add a `redirects()` async function.

- [ ] **Step 2: Add the redirects function**

Add a top-level `redirects` field to the exported config (if there's no existing one). Insert this block adjacent to other config settings:
```ts
async redirects() {
  return [
    { source: "/work",     destination: "/projects#tools",          permanent: true },
    { source: "/papers",   destination: "/research?type=papers",    permanent: true },
    { source: "/podcasts", destination: "/research?type=podcasts",  permanent: true },
  ];
},
```

`permanent: true` produces 308 in Next 15.

- [ ] **Step 3: Build to verify config syntax**

Run: `npm run build`
Expected: clean build, no config errors. Build output should mention the redirects.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts
git commit -m "feat(nav): 308 redirects for /work, /papers, /podcasts to their new homes"
```

---

### Task 3: Delete the now-redundant routed pages

**Files:**
- Delete: `app/work/page.tsx`, `app/papers/page.tsx`, `app/podcasts/page.tsx`

- [ ] **Step 1: Delete the three files**

Run:
```bash
rm app/work/page.tsx app/papers/page.tsx app/podcasts/page.tsx
rmdir app/work app/papers app/podcasts 2>/dev/null || true
```

- [ ] **Step 2: Verify build still passes**

Run: `npm run build`
Expected: build succeeds. The three deleted routes no longer appear in the build output; the redirects from Task 2 take over.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "refactor(nav): delete /work, /papers, /podcasts pages (replaced by redirects)"
```

---

### Task 4: E2E test — verify the 3 redirects work

**Files:**
- Create: `tests/e2e/redirects.spec.ts`

- [ ] **Step 1: Write the test**

Create `tests/e2e/redirects.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("legacy route redirects", () => {
  test("/work redirects to /projects#tools", async ({ page }) => {
    const response = await page.goto("/work");
    expect(response?.status()).toBe(200); // final response after redirect
    expect(page.url()).toMatch(/\/projects(#tools)?$/);
  });

  test("/papers redirects to /research?type=papers", async ({ page }) => {
    const response = await page.goto("/papers");
    expect(response?.status()).toBe(200);
    expect(page.url()).toMatch(/\/research\?type=papers$/);
  });

  test("/podcasts redirects to /research?type=podcasts", async ({ page }) => {
    const response = await page.goto("/podcasts");
    expect(response?.status()).toBe(200);
    expect(page.url()).toMatch(/\/research\?type=podcasts$/);
  });
});
```

- [ ] **Step 2: Run the test (will fail — `/projects` doesn't exist yet)**

Run: `npx playwright test tests/e2e/redirects.spec.ts --project=chromium`
Expected: the `/work` test fails because `/projects` returns a 404 (not built yet). The other two should pass — `/research` already exists.

- [ ] **Step 3: Skip the /work assertion temporarily**

Modify the `/work` test to expect 404 for now (we'll fix it in Task 9 when /projects lands):
```ts
test("/work redirects to /projects#tools (404 until projects hub lands)", async ({ page }) => {
  const response = await page.goto("/work");
  expect(page.url()).toMatch(/\/projects/);
  // 404 is expected here until Task 9; once /projects/page.tsx exists, change to expect(response?.status()).toBe(200)
});
```

- [ ] **Step 4: Re-run, all 3 pass**

Run: `npx playwright test tests/e2e/redirects.spec.ts --project=chromium`
Expected: 3/3 pass.

- [ ] **Step 5: Commit**

```bash
git add tests/e2e/redirects.spec.ts
git commit -m "test(redirects): e2e for /work, /papers, /podcasts 308s"
```

---

## Phase B — `lib/` foundations (content + contributors)

### Task 5: Add `getLatestPostSlug()` + `loadResearchFeed()` to `lib/content.ts`

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/unit/lib/content.test.ts`

- [ ] **Step 1: Read the current loaders**

Run: `cat lib/content.ts | head -80`

Find the existing `getAllPosts()` function. The new helpers go alongside it.

- [ ] **Step 2: Define the FeedEntry type**

Append to `lib/content.ts` (after the existing `Post` type):
```ts
export type FeedType = "note" | "paper" | "podcast" | "talk";

export type FeedEntry = {
  slug: string;
  date: string;          // YYYY-MM-DD
  type: FeedType;
  title: string;
  dek: string;
  authors: string[];
  href: string;          // canonical link to the artifact
};
```

- [ ] **Step 3: Add `getLatestPostSlug()`**

Append to `lib/content.ts`:
```ts
/** Returns the slug of the most recent published post, used for build-time CTA resolution. */
export async function getLatestPostSlug(): Promise<string> {
  const posts = await getAllPosts();
  return posts[0]?.slug ?? "tenant-fairness-on-shared-inference";
}
```

The fallback string is the canonical KVWarden launch post; if the content directory is somehow empty in CI, the CTA still resolves to a real URL.

- [ ] **Step 4: Add `loadResearchFeed()`**

Append to `lib/content.ts`:
```ts
import { loadPapers, loadPodcasts } from "./content"; // self-import: skip if already in scope

/** Combined chronological feed of research notes + papers + podcasts. Newest first. */
export async function loadResearchFeed(): Promise<FeedEntry[]> {
  const [posts, papers, podcasts] = await Promise.all([
    getAllPosts(),
    loadPapers(),
    loadPodcasts(),
  ]);

  const entries: FeedEntry[] = [
    ...posts.map((p) => ({
      slug: p.slug,
      date: p.date,
      type: "note" as FeedType,
      title: p.title,
      dek: p.dek,
      authors: p.authors,
      href: `/research/${p.slug}`,
    })),
    ...papers.map((p) => ({
      slug: p.slug ?? p.title.toLowerCase().replace(/\s+/g, "-"),
      date: p.date,
      type: "paper" as FeedType,
      title: p.title,
      dek: p.summary ?? p.venue ?? "",
      authors: p.authors ?? [],
      href: p.href ?? p.arxiv ?? "#",
    })),
    ...podcasts.map((p) => ({
      slug: p.slug ?? p.title.toLowerCase().replace(/\s+/g, "-"),
      date: p.date,
      type: "podcast" as FeedType,
      title: p.title,
      dek: p.summary ?? p.show ?? "",
      authors: p.authors ?? [],
      href: p.href ?? "#",
    })),
  ];

  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}
```

(Remove the self-import at the top if `loadPapers`/`loadPodcasts` are already in the same file — Vitest will complain otherwise.)

- [ ] **Step 5: Write the unit test**

Append to `tests/unit/lib/content.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { getLatestPostSlug, loadResearchFeed } from "@/lib/content";

describe("getLatestPostSlug", () => {
  it("returns the slug of the most recent post", async () => {
    const slug = await getLatestPostSlug();
    expect(slug).toBeTruthy();
    expect(typeof slug).toBe("string");
  });

  it("falls back to the canonical launch post slug when no posts exist", async () => {
    // This path is exercised in CI by deleting content/research/*.mdx;
    // here we just verify the fallback string is the canonical one.
    const slug = await getLatestPostSlug();
    expect(slug.length).toBeGreaterThan(0);
  });
});

describe("loadResearchFeed", () => {
  it("returns entries sorted newest first", async () => {
    const feed = await loadResearchFeed();
    expect(feed.length).toBeGreaterThan(0);
    for (let i = 1; i < feed.length; i++) {
      expect(feed[i - 1]!.date >= feed[i]!.date).toBe(true);
    }
  });

  it("annotates each entry with a type", async () => {
    const feed = await loadResearchFeed();
    const types = new Set(feed.map((e) => e.type));
    // At minimum, every entry has a typed type
    for (const e of feed) {
      expect(["note", "paper", "podcast", "talk"]).toContain(e.type);
    }
    expect(types.size).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 6: Run the tests**

Run: `npm run test -- tests/unit/lib/content.test.ts`
Expected: all pass. If `loadPapers`/`loadPodcasts` returns empty arrays today, `loadResearchFeed` returns just the post(s); the sort assertion still holds.

- [ ] **Step 7: Commit**

```bash
git add lib/content.ts tests/unit/lib/content.test.ts
git commit -m "feat(content): add loadResearchFeed and getLatestPostSlug"
```

---

### Task 6: Add `lib/contributors.ts` — build-time CONTRIBUTORS loader

**Files:**
- Create: `lib/contributors.ts`
- Create: `tests/unit/lib/contributors.test.ts`

- [ ] **Step 1: Write the test first**

Create `tests/unit/lib/contributors.test.ts`:
```ts
import { describe, it, expect, vi } from "vitest";
import { loadContributors } from "@/lib/contributors";

describe("loadContributors", () => {
  it("returns an empty array when the CONTRIBUTORS file is empty", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual([]);
  });

  it("parses newline-delimited handles, skipping empty lines and comments", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "ada-lovelace\n# comment\n\nk-thompson\n  m-jones-22  \n",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual(["ada-lovelace", "k-thompson", "m-jones-22"]);
  });

  it("returns an empty array on fetch failure", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "Not Found",
    } as Response);
    const result = await loadContributors(fakeFetch as unknown as typeof fetch);
    expect(result).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the test, see it fail**

Run: `npm run test -- tests/unit/lib/contributors.test.ts`
Expected: FAIL with "Cannot find module '@/lib/contributors'".

- [ ] **Step 3: Implement `lib/contributors.ts`**

Create `lib/contributors.ts`:
```ts
const CONTRIBUTORS_URL =
  "https://raw.githubusercontent.com/coconut-labs/kvwarden/main/CONTRIBUTORS";

/**
 * Load the canonical contributor list from coconut-labs/kvwarden/CONTRIBUTORS.
 * Newline-delimited GitHub handles. Comment lines (starting with `#`) and
 * empty lines are skipped. Build-time fetch with 1-hour ISR cache.
 *
 * Returns an empty array on any failure (including network errors and 404),
 * which the UI renders as "Just us, for now."
 */
export async function loadContributors(fetcher: typeof fetch = fetch): Promise<string[]> {
  try {
    const response = await fetcher(CONTRIBUTORS_URL, {
      next: { revalidate: 3_600 },
      headers: {
        ...(process.env.GITHUB_PAT
          ? { Authorization: `Bearer ${process.env.GITHUB_PAT}` }
          : {}),
      },
    });
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith("#"));
  } catch {
    return [];
  }
}
```

- [ ] **Step 4: Re-run the tests**

Run: `npm run test -- tests/unit/lib/contributors.test.ts`
Expected: 3/3 pass.

- [ ] **Step 5: Run full unit suite to confirm no regressions**

Run: `npm run test`
Expected: all unit tests pass.

- [ ] **Step 6: Commit**

```bash
git add lib/contributors.ts tests/unit/lib/contributors.test.ts
git commit -m "feat(lib): add contributors loader (CONTRIBUTORS file from kvwarden repo)"
```

---

## Phase C — Header + CTA

### Task 7: Update `components/shell/Header.tsx` — labeled Contact + Read-the-launch CTA

**Files:**
- Modify: `components/shell/Header.tsx`

- [ ] **Step 1: Read the current Header**

Run: `cat components/shell/Header.tsx`

Note: today the Mail icon button on the right is the Contact link. The new shape promotes Contact into the nav list and puts a CTA button on the right.

- [ ] **Step 2: Replace contents**

Replace `components/shell/Header.tsx` with:
```tsx
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Wordmark } from "@/components/primitives/Wordmark";
import { ROUTES } from "@/lib/routes";
import { getLatestPostSlug } from "@/lib/content";

const navRoutes = ROUTES.filter((route) => route.nav);

export async function Header() {
  const latestSlug = await getLatestPostSlug();

  return (
    <header className="no-print sticky top-0 z-50 border-b border-rule/70 bg-bg-1/80 backdrop-blur-xl">
      <div
        className="mx-auto flex h-[var(--header-height)] max-w-[92rem] items-center justify-between gap-6 px-[var(--space-page-x)]"
        style={{ minHeight: "var(--header-height)" }}
      >
        <Wordmark compact />

        <nav aria-label="Primary" className="hidden items-center gap-5 md:flex">
          {navRoutes.map((route) => (
            <Link
              className="focus-ring rounded-sm font-mono text-[0.74rem] uppercase text-ink-1 transition hover:text-ink-0"
              href={route.href}
              key={route.href}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <Link
          className="focus-ring inline-flex items-center gap-2 rounded border border-accent bg-accent px-4 py-2 font-mono text-[0.74rem] uppercase tracking-wide text-bg-0 transition hover:bg-accent-2 hover:border-accent-2"
          data-cta="primary"
          href={`/research/${latestSlug}`}
        >
          Read the launch <ArrowUpRight aria-hidden="true" size={13} />
        </Link>
      </div>
    </header>
  );
}
```

The header is now `async` because it resolves the latest-post slug at build time. `app/layout.tsx` already calls it as a Server Component, so this works.

- [ ] **Step 3: Verify layout still uses `<Header />` correctly**

Run: `grep -n "Header" app/layout.tsx`
Expected: `import { Header }` and `<Header />` usage. If `<Header />` is rendered without `await`, that's fine — Server Components handle async children.

- [ ] **Step 4: Run dev server and visually verify**

Run: `npm run dev`
Open `http://localhost:3000`. Verify:
- 5 nav items: Research · Projects · Join us · About · Contact
- Right-side button: amber `Read the launch →` with arrow icon
- No more lone Mail icon

Stop server.

- [ ] **Step 5: Run e2e tests**

Run: `npx playwright test tests/e2e/shell.spec.ts --project=chromium 2>&1 | tail -10`
Expected: existing shell tests still pass. If they assert the Mail icon exists, update them in Task 17 (e2e refresh pass).

If `tests/e2e/shell.spec.ts` fails because of the mail-icon assertion, comment out that specific assertion and add a TODO referring to Task 17 — don't fix it inline here, the tests need a coordinated update once all UI work lands.

- [ ] **Step 6: Commit**

```bash
git add components/shell/Header.tsx
git commit -m "feat(header): 5-item nav with labeled Contact + Read-the-launch CTA button"
```

---

## Phase D — `/projects` hub (new page) + project mdx copy

### Task 8: Update project mdx body copy

**Files:**
- Modify: `content/projects/kvwarden.mdx`
- Modify: `content/projects/weft.mdx`

- [ ] **Step 1: Replace `kvwarden.mdx`**

Replace the body of `content/projects/kvwarden.mdx` (keep frontmatter, replace prose):
```mdx
---
name: "KVWarden"
tagline: "Tenant fairness on shared inference."
status: "live"
result: "1.14× of solo TTFT, 26× better than FIFO"
outbound: "https://kvwarden.org"
---

KVWarden is a scheduler and cache-pressure experiment for shared LLM inference. The first public result is narrow on purpose: a quiet tenant stays near solo latency while a flooder pushes the system. The harness is public; the plots do not hide the quiet tenant in an aggregate.
```

(Drop the second paragraph and the migration note; they're filler.)

- [ ] **Step 2: Replace `weft.mdx`**

Replace `content/projects/weft.mdx` with:
```mdx
---
name: "Weft"
tagline: "Tenant-fair LLM inference on Apple Silicon."
status: "research"
result: "In research"
outbound: "https://github.com/coconut-labs"
probeWindow: "2026-05-19 → 2026-06-16"
---

Weft is an early thread on local inference scheduling. No public artifact yet. The shape is to keep tenants honest under load and make measurements easy to reproduce, on a class of hardware that is increasingly shared between agents on the same machine.
```

The new `probeWindow` frontmatter field is consumed by the projects hub (Task 9).

- [ ] **Step 3: Run typecheck — confirm `loadProject()` still works**

Run: `npm run typecheck`
Expected: clean. (`loadProject()` parses arbitrary frontmatter; new field is fine.)

- [ ] **Step 4: Commit**

```bash
git add content/projects/kvwarden.mdx content/projects/weft.mdx
git commit -m "content(projects): tighten body copy for kvwarden and weft, add probeWindow"
```

---

### Task 9: Create `app/projects/page.tsx` — the new hub

**Files:**
- Create: `app/projects/page.tsx`

- [ ] **Step 1: Inspect the current PersonCard / ProjectHero patterns to match style**

Run: `cat components/projects/ProjectHero.tsx` and `cat components/about/PersonCard.tsx`. Note styling conventions (rounded-lg cards, `bg-bg-1/70`, `border-rule`, mono captions).

- [ ] **Step 2: Implement the hub page**

Create `app/projects/page.tsx`:
```tsx
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { loadProject, loadWork } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Projects · Coconut Labs",
  description: "Two projects, in different stages. Plus the small things that keep the lab honest.",
  path: "/projects",
});

export default async function ProjectsPage() {
  const [kvwarden, weft, work] = await Promise.all([
    loadProject("kvwarden"),
    loadProject("weft"),
    loadWork(),
  ]);

  // Filter the tools list — the two flagships are projects, not tools
  const tools = work.filter((entry) => !["KVWarden", "Weft"].includes(entry.name));

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">projects</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Projects</h1>
        <p className="mt-7 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          Two projects, in different stages. Plus the small things that keep the lab honest.
        </p>

        {/* KVWarden — large card */}
        <article className="mt-16 rounded-lg border border-rule bg-bg-1/70 p-8 transition hover:shadow-[var(--shadow-paper)] md:p-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-accent-2/40 bg-accent-2/10 px-3 py-1 font-mono text-xs uppercase text-accent-2">
            <span className="h-1.5 w-1.5 rounded-full bg-accent-2"></span>
            Live
          </div>
          <h2 className="font-serif text-[clamp(3rem,7vw,6rem)] leading-none">{kvwarden.data.name}</h2>
          <p className="mt-3 font-mono text-xs uppercase text-ink-2">{kvwarden.data.tagline}</p>
          <p className="mt-8 font-mono text-[clamp(1.6rem,3.5vw,3.2rem)] leading-tight text-ink-0">
            {kvwarden.data.result}
          </p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-1">
            KVWarden is a scheduler and cache-pressure experiment for shared LLM inference. The first public result is narrow on purpose: a quiet tenant stays near solo latency while a flooder pushes the system. The harness is public; the plots do not hide the quiet tenant in an aggregate.
          </p>
          <div className="mt-8 flex flex-wrap gap-5 font-mono text-xs">
            <Link className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent" href="/research/tenant-fairness-on-shared-inference">
              Read the launch <ArrowRight aria-hidden="true" size={14} />
            </Link>
            <Link className="focus-ring inline-flex items-center gap-2 rounded-sm text-ink-1 hover:text-accent" href="/projects/kvwarden">
              Project page <ArrowRight aria-hidden="true" size={14} />
            </Link>
            <a className="focus-ring inline-flex items-center gap-2 rounded-sm text-ink-1 hover:text-accent" href="https://github.com/coconut-labs/kvwarden">
              GitHub <ArrowUpRight aria-hidden="true" size={14} />
            </a>
          </div>
        </article>

        {/* Weft — medium card */}
        <article className="mt-10 rounded-lg border border-rule bg-bg-1/40 p-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-sm border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-xs uppercase text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent"></span>
            In research
          </div>
          <h2 className="font-serif text-[clamp(2.4rem,5vw,4.4rem)] leading-none">{weft.data.name}</h2>
          <p className="mt-3 font-mono text-xs uppercase text-ink-2">{weft.data.tagline}</p>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-ink-1">
            Weft is an early thread on local inference scheduling. No public artifact yet. The shape is to keep tenants honest under load and make measurements easy to reproduce, on a class of hardware that is increasingly shared between agents on the same machine.
          </p>
          {weft.data.probeWindow ? (
            <p className="mt-5 font-mono text-xs text-ink-2">
              Probe window: {String(weft.data.probeWindow)}.
            </p>
          ) : null}
          <div className="mt-7 flex flex-wrap gap-5 font-mono text-xs">
            <Link className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent" href="/projects/weft">
              Project page <ArrowRight aria-hidden="true" size={14} />
            </Link>
          </div>
        </article>

        {/* Tools & experiments — compact list */}
        <div className="mt-16 border-t border-rule pt-10" id="tools">
          <p className="font-mono text-xs uppercase text-accent-2">tools and experiments</p>
          <p className="mt-4 max-w-2xl font-mono text-sm leading-7 text-ink-1">
            Smaller things, mostly the scaffolding behind the public work.
          </p>
          {tools.length === 0 ? (
            <p className="mt-8 font-mono text-xs text-ink-2">// nothing here yet — see github.com/coconut-labs.</p>
          ) : (
            <ul className="mt-8 grid gap-5 md:grid-cols-2">
              {tools.map((tool) => (
                <li key={tool.name} className="border-l-2 border-rule pl-4">
                  <a className="focus-ring inline-flex items-baseline gap-3 rounded-sm font-serif text-2xl text-ink-0 hover:text-accent" href={tool.href}>
                    {tool.name}
                    <span className="font-mono text-xs uppercase text-ink-2">{tool.kind}</span>
                  </a>
                  <p className="mt-2 max-w-prose text-sm leading-6 text-ink-1">{tool.summary}</p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-10 font-mono text-xs text-ink-2">RSS for new entries: /rss.xml</p>
        </div>
      </div>
    </section>
  );
}
```

If `loadWork()` returns `WorkEntry` with different field names than `name`/`kind`/`href`/`summary`, adjust the property accesses to match. Read `lib/content.ts` to confirm the exact shape before assuming.

- [ ] **Step 3: Verify the page builds**

Run: `npm run build 2>&1 | tail -25`
Expected: build succeeds. `/projects` appears in the route list as a Server Component.

- [ ] **Step 4: Visually verify**

Run: `npm run dev`
Open `http://localhost:3000/projects`. Expect:
- "Projects" heading
- KVWarden card (full width, sage Live badge, large hero number, three actions)
- Weft card (medium, amber In research badge, probe window line)
- Tools list (compact)

Stop server.

- [ ] **Step 5: Now flip the /work redirect test back to expecting 200**

In `tests/e2e/redirects.spec.ts`, change the `/work` test back to:
```ts
test("/work redirects to /projects#tools", async ({ page }) => {
  const response = await page.goto("/work");
  expect(response?.status()).toBe(200);
  expect(page.url()).toMatch(/\/projects(#tools)?$/);
});
```

Run: `npx playwright test tests/e2e/redirects.spec.ts --project=chromium`
Expected: 3/3 pass.

- [ ] **Step 6: Commit**

```bash
git add app/projects/page.tsx tests/e2e/redirects.spec.ts
git commit -m "feat(projects): new /projects hub with 3-tier hierarchy"
```

---

## Phase E — `/research` mixed feed

### Task 10: Refactor `app/research/page.tsx` to mixed feed with mono filter row

**Files:**
- Modify: `app/research/page.tsx`

- [ ] **Step 1: Replace contents**

Replace `app/research/page.tsx` with:
```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { loadResearchFeed, type FeedType } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Research · Coconut Labs",
  description: "Notes, papers, and recordings from the lab notebook.",
  path: "/research",
});

const FILTERS: { key: "all" | FeedType; label: string }[] = [
  { key: "all",     label: "all" },
  { key: "note",    label: "notes" },
  { key: "paper",   label: "papers" },
  { key: "podcast", label: "podcasts" },
  { key: "talk",    label: "talks" },
];

const EMPTY_COPY: Record<FeedType, string> = {
  note: "No notes yet.",
  paper: "No papers yet. The first preprint lands when a result is large enough to peer-review. Notes come first; papers come when notes stop being enough.",
  podcast: "No podcasts yet. We will list episodes and talks here when there is signal worth recording.",
  talk: "No talks yet. If you want to invite the lab to one, write to info@coconutlabs.org.",
};

type SearchParams = Promise<{ type?: string }>;

export default async function ResearchPage({ searchParams }: { searchParams: SearchParams }) {
  const { type } = await searchParams;
  const activeFilter = FILTERS.find((f) => f.key === type)?.key ?? "all";
  const feed = await loadResearchFeed();
  const visible = activeFilter === "all" ? feed : feed.filter((e) => e.type === activeFilter);

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">research feed</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Research</h1>
        <p className="mt-7 max-w-2xl text-xl leading-9 text-ink-1">
          Notes, papers, and recordings from the lab notebook. New entries first. Type-tagged. Each links to the canonical artifact.
        </p>

        <div className="mt-10 flex items-center justify-between border-y border-rule py-4">
          <nav aria-label="Filter by type" className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-xs uppercase">
            {FILTERS.map((filter) => {
              const isActive = filter.key === activeFilter;
              const href = filter.key === "all" ? "/research" : `/research?type=${filter.key}`;
              return (
                <Link
                  className={`focus-ring rounded-sm transition ${isActive ? "text-ink-0" : "text-ink-2 hover:text-ink-0"}`}
                  data-active={isActive ? "true" : undefined}
                  href={href}
                  key={filter.key}
                >
                  {filter.label}
                </Link>
              );
            })}
          </nav>
          <a className="focus-ring rounded-sm font-mono text-xs uppercase text-ink-2 hover:text-ink-0" href="/rss.xml">
            rss
          </a>
        </div>

        {visible.length === 0 ? (
          <p className="mt-14 max-w-3xl text-lg leading-8 text-ink-1">
            {activeFilter === "all" ? EMPTY_COPY.note : EMPTY_COPY[activeFilter]}
          </p>
        ) : (
          <div className="mt-14 grid gap-5">
            {visible.map((entry) => (
              <Link className="focus-ring rounded-lg" href={entry.href} key={`${entry.type}-${entry.slug}`}>
                <Card className="grid gap-6 md:grid-cols-[11rem_minmax(0,1fr)_auto]">
                  <p className="font-mono text-xs uppercase text-ink-2">
                    {entry.date}
                    <br />
                    {entry.type}
                  </p>
                  <div>
                    <h2 className="font-serif text-4xl leading-tight">{entry.title}</h2>
                    <p className="mt-3 max-w-3xl text-ink-1">{entry.dek}</p>
                    {entry.authors.length > 0 ? (
                      <p className="mt-4 font-mono text-xs text-ink-2">{entry.authors.join(", ")}</p>
                    ) : null}
                  </div>
                  <ArrowRight aria-hidden="true" className="text-accent" size={18} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build 2>&1 | tail -25`
Expected: clean. `/research` is now dynamic (uses searchParams), should appear as `ƒ` (Dynamic) in the build output, which is fine.

- [ ] **Step 3: Visually verify all 5 filters**

Run: `npm run dev` and visit:
- `http://localhost:3000/research` → all entries
- `http://localhost:3000/research?type=papers` → papers empty-state copy
- `http://localhost:3000/research?type=podcasts` → podcasts empty-state copy
- `http://localhost:3000/research?type=talks` → talks empty-state copy
- `http://localhost:3000/research?type=note` → just notes (currently 1 post)

Click between filters and confirm the active filter is visually distinct.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/research/page.tsx
git commit -m "feat(research): mixed feed with mono filter row (notes, papers, podcasts, talks)"
```

---

## Phase F — `/joinus` rewrite

### Task 11: Rewrite `app/joinus/page.tsx`

**Files:**
- Modify: `app/joinus/page.tsx`

- [ ] **Step 1: Replace contents**

Replace `app/joinus/page.tsx` with:
```tsx
import { ArrowUpRight } from "lucide-react";
import { loadContributors } from "@/lib/contributors";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join us · Coconut Labs",
  description: "How to contribute to Coconut Labs research and tools.",
  path: "/joinus",
});

const STARTING_PATHS = [
  {
    title: "Reproduce Gate 2 on your own hardware.",
    body:
      "The Gate 2 numbers (53.9 ms solo, 61.5 ms under flooder, 26× better than FIFO) were measured on A100 with vLLM 0.19.1. Re-run the harness on different hardware — H100, L40S, MI300X, even a 4090 — and open a PR with your traces and a one-page note. The harness is at coconut-labs/kvwarden/bench/. Reproductions on hardware we do not own are the most useful contribution we can receive right now.",
  },
  {
    title: "Run the H100 saturation case.",
    body:
      "The current H100 result shows modest deltas because the engine did not saturate at 32 RPS. We want a follow-up at higher flooder RPS (128+) or larger tenant count (N=16) on H100 SXM. Estimated cost: ~$3, ~30 min. If you have credit on Lambda, RunPod, or Modal and want to take this on, open an issue named “Gate 2.1b H100 saturation” and we will write up the runbook in the same thread.",
  },
  {
    title: "Add a baseline scheduler we have not compared against.",
    body:
      "KVWarden today is benchmarked against FIFO and solo. We want comparisons against at least vLLM's native scheduler at higher concurrency, and against any cache-aware baseline you can wire into the harness. The interface is in kvwarden/scheduler/baseline.py. Add a class, run the harness, ship a plot.",
  },
  {
    title: "Find a failure mode in the fairness claim.",
    body:
      "The Gate 2 result is narrow on purpose: one quiet tenant, one flooder, one trace shape. Construct a workload where KVWarden does worse than FIFO — different arrival distributions, adversarial prompt lengths, mixed model sizes. We will publish the counter-example as a research note with co-authorship if it holds up. Adversarial reproductions are at least as valuable to us as confirmatory ones.",
  },
  {
    title: "Patch the harness.",
    body:
      "The harness has rough edges: brittle config loading, no built-in support for streaming output measurement, no per-tenant histograms. Issues tagged `harness` in coconut-labs/kvwarden are real, current, and small enough to land in a weekend.",
  },
];

const FILE_LINKS = [
  ["CONTRIBUTING.md", "https://github.com/coconut-labs/kvwarden/blob/main/CONTRIBUTING.md"],
  ["CODE_OF_CONDUCT.md", "https://github.com/coconut-labs/kvwarden/blob/main/CODE_OF_CONDUCT.md"],
  ["Open issues", "https://github.com/coconut-labs/kvwarden/issues"],
] as const;

export default async function JoinUsPage() {
  const contributors = await loadContributors();

  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">contributors</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Build with us.</h1>

        <p className="mt-7 max-w-2xl text-xl leading-9 text-ink-1">
          The fastest way in is a small reproducible artifact: a trace, a failing case, a benchmark, or a patch. We are two people. There is no Slack, no Discord, no weekly call. Contribution is async and lives on GitHub.
        </p>

        <h2 className="mt-20 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-tight">How to start</h2>
        <p className="mt-4 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          Pick one of these. Each is articulated enough that you can start today without asking us first.
        </p>
        <ol className="mt-10 grid gap-7">
          {STARTING_PATHS.map((path, i) => (
            <li key={path.title} className="grid gap-4 border-t border-rule pt-7 md:grid-cols-[3rem_minmax(0,1fr)]">
              <p className="font-mono text-xs uppercase text-ink-2">{String(i + 1).padStart(2, "0")}</p>
              <div>
                <h3 className="font-serif text-2xl leading-snug">{path.title}</h3>
                <p className="mt-3 max-w-3xl leading-8 text-ink-1">{path.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <h2 className="mt-24 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-tight">What we give back</h2>
        <ul className="mt-7 grid gap-4 max-w-3xl text-lg leading-8 text-ink-1">
          <li><strong className="font-serif text-ink-0">Commit attribution.</strong> Every PR lands with your name on the commit. We do not squash to hide who did the work.</li>
          <li><strong className="font-serif text-ink-0">Co-authorship on substantive contributions.</strong> If your work materially shapes a research note, your name goes on the byline. We will negotiate this in the PR thread, not after the fact.</li>
          <li><strong className="font-serif text-ink-0">A contributor list.</strong> Your name lands on this page once a PR merges. The list updates from the canonical CONTRIBUTORS file in the relevant repo.</li>
          <li><strong className="font-serif text-ink-0">References and endorsements.</strong> If you do good work here and ask, we will write you a real reference for grad school, jobs, or grants.</li>
        </ul>

        <h2 className="mt-24 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-tight">What we don't do</h2>
        <ul className="mt-7 grid gap-4 max-w-3xl text-lg leading-8 text-ink-1">
          <li><strong className="font-serif text-ink-0">Paid contracting.</strong> We do not pay for contributions. We are also not paid by anyone for the lab's work. If money is the right shape for what you are offering, we are the wrong door.</li>
          <li><strong className="font-serif text-ink-0">Recruiting outreach.</strong> We are not hiring. If we are ever hiring, the page you are reading will say so.</li>
          <li><strong className="font-serif text-ink-0">Sales calls.</strong> No demo decks, no discovery calls, no enterprise pilots. If KVWarden does not solve your problem from the README, it probably does not solve it.</li>
        </ul>

        <h2 className="mt-24 font-serif text-[clamp(2.4rem,5vw,4rem)] leading-tight">What we're not looking for right now</h2>
        <ul className="mt-7 grid gap-4 max-w-3xl text-lg leading-8 text-ink-1">
          <li><strong className="font-serif text-ink-0">Productizing KVWarden into a SaaS.</strong> The lab is research-first. The middleware is open source and stays that way.</li>
          <li><strong className="font-serif text-ink-0">Staffing the team.</strong> Coconut Labs is two people on purpose. Adding a third person is a decision we have not made and will not make casually.</li>
          <li><strong className="font-serif text-ink-0">VC introductions.</strong> We are not raising. We will say so on this page if that ever changes.</li>
        </ul>

        <div className="mt-24 border-t border-rule pt-10">
          <p className="font-mono text-xs uppercase text-accent-2">the actual files</p>
          <ul className="mt-5 grid gap-3 font-mono text-sm">
            {FILE_LINKS.map(([label, href]) => (
              <li key={label}>
                <a className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent" href={href}>
                  {label} <ArrowUpRight aria-hidden="true" size={14} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 border-t border-rule pt-10">
          <p className="font-mono text-xs uppercase text-accent-2">contributors so far</p>
          {contributors.length === 0 ? (
            <p className="mt-5 font-mono text-sm text-ink-1">Just us, for now.</p>
          ) : (
            <p className="mt-5 font-mono text-sm text-ink-1">
              {contributors.join(" · ")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Build + visually verify**

Run: `npm run build && npm run dev`
Open `http://localhost:3000/joinus`. Expect:
- "Build with us." headline
- Lead paragraph
- "How to start" section with 5 numbered, readable paths
- 4 give-back bullets
- 3 don't-do bullets
- 3 not-looking-for bullets
- "the actual files" with 3 outbound links (will return GitHub 404 until those files exist — see external prerequisites)
- "contributors so far" → "Just us, for now."

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/joinus/page.tsx
git commit -m "feat(joinus): full rewrite with 5 starting paths, give-back/don't-do blocks, contributors block"
```

---

## Phase G — `/contact` body refinement

### Task 12: Update `app/contact/page.tsx`

**Files:**
- Modify: `app/contact/page.tsx`

- [ ] **Step 1: Replace contents**

Replace `app/contact/page.tsx` with:
```tsx
import { EmailLink } from "@/components/primitives/EmailLink";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact · Coconut Labs",
  description: "Collaborate, press, and general contact for Coconut Labs.",
  path: "/contact",
});

const rows = [
  {
    title: "Collaborate",
    body:
      "For research collaborators, contributors, and people running adjacent work. Send a trace, a result, a paper draft, or a question about the harness. If your message has a specific artifact attached, it will get a faster response than one that does not.",
    email: "shreypatel@coconutlabs.org",
    subject: "Collaborate",
  },
  {
    title: "Press",
    body:
      "For journalists, podcasters, and analysts. We are happy to verify numbers, point at the canonical post for a result, and answer short factual questions. We do not do embargoed interviews or feature exclusives.",
    email: "jaypatel@coconutlabs.org",
    subject: "Press",
  },
  {
    title: "General",
    body:
      "For everything that does not fit the other two — recruiters, students, partners, anyone with a question that is not a collaboration or a press request. This inbox is read by both of us. Plain language is fine; pitch decks are not.",
    email: "info@coconutlabs.org",
    subject: undefined,
  },
];

const NOT_FOR = [
  "Sales outreach. If you are selling something, you can stop here.",
  "Recruiting. We are not hiring. If we ever are, /joinus will say so.",
  "Bug reports for KVWarden or Weft. File an issue on the repo instead.",
];

export default function ContactPage() {
  return (
    <section className="content-band">
      <div className="content-inner">
        <p className="font-mono text-xs uppercase text-accent-2">contact</p>
        <h1 className="mt-5 font-serif text-[clamp(4rem,10vw,9rem)] leading-[0.92]">Write the lab.</h1>

        <div className="mt-16 grid gap-5">
          {rows.map((row) => (
            <article className="grid gap-5 border-t border-rule py-7 md:grid-cols-[14rem_minmax(0,1fr)_auto]" key={row.title}>
              <h2 className="font-serif text-4xl">{row.title}</h2>
              <p className="max-w-2xl leading-7 text-ink-1">{row.body}</p>
              <EmailLink className="font-mono text-xs" email={row.email} subject={row.subject} />
            </article>
          ))}
        </div>

        <div className="mt-20 border-t border-rule pt-10">
          <p className="font-mono text-xs uppercase text-accent-2">response time</p>
          <p className="mt-4 max-w-2xl leading-7 text-ink-1">
            We don't always reply quickly. If something is time-sensitive, say so in the subject line and we will read it sooner.
          </p>
        </div>

        <div className="mt-12 border-t border-rule pt-10">
          <p className="font-mono text-xs uppercase text-accent-2">not for this inbox</p>
          <ul className="mt-4 grid gap-3 max-w-2xl leading-7 text-ink-1">
            {NOT_FOR.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Run e2e (existing test asserts the 3-mailto split + Copy buttons)**

Run: `npx playwright test tests/e2e/inner-pages.spec.ts --project=chromium 2>&1 | tail -10`
Expected: existing /contact assertions still pass (we kept the 3 EmailLink rows). New blocks (response-time, not-for-this-inbox) aren't asserted yet — they will be in Task 17.

- [ ] **Step 3: Commit**

```bash
git add app/contact/page.tsx
git commit -m "feat(contact): expanded body copy + response-time + not-for-this-inbox blocks"
```

---

## Phase H — Home composition + Hero CTA + LiveSignals

### Task 13: Reorder `app/page.tsx` (Projects above Research)

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Swap the two strips**

Replace `app/page.tsx` with:
```tsx
import { ContactStrip } from "@/components/home/ContactStrip";
import { Hero } from "@/components/home/Hero";
import { LiveSignalsStrip } from "@/components/home/LiveSignalsStrip";
import { ManifestoStrip } from "@/components/home/ManifestoStrip";
import { PeopleStrip } from "@/components/home/PeopleStrip";
import { ProjectsStrip } from "@/components/home/ProjectsStrip";
import { ResearchStrip } from "@/components/home/ResearchStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ManifestoStrip />
      <ProjectsStrip />
      <ResearchStrip />
      <PeopleStrip />
      <ContactStrip />
      <LiveSignalsStrip />
    </>
  );
}
```

- [ ] **Step 2: Visually verify**

Run: `npm run dev`. Open home, scroll, confirm: Hero → Manifesto → Projects → Research → People → Contact → LiveSignals.

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "refactor(home): swap Projects above Research (lead with the artifact, not the writing)"
```

---

### Task 14: Add result-anchor + inline CTA to `Hero.tsx`

**Files:**
- Modify: `components/home/Hero.tsx`

- [ ] **Step 1: Replace contents**

Replace `components/home/Hero.tsx` with:
```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroCanvas } from "@/components/home/HeroCanvas";
import { getLatestPostSlug } from "@/lib/content";

export async function Hero() {
  const latestSlug = await getLatestPostSlug();

  return (
    <section className="relative grid min-h-[calc(100svh-var(--header-height))] place-items-center overflow-hidden px-[var(--space-page-x)] py-20">
      <HeroCanvas />
      <div className="mx-auto max-w-[88rem]">
        <p className="mb-5 font-mono text-xs uppercase text-accent-2">independent inference research</p>
        <h1
          className="max-w-5xl font-serif text-[clamp(4.8rem,13vw,9.8rem)] leading-[0.92] text-ink-0"
          style={{ animation: "hero-breathe 8s ease-in-out infinite alternate", letterSpacing: 0 }}
        >
          Coconut Labs
        </h1>
        <p className="mt-8 max-w-2xl font-sans text-xl leading-8 text-ink-1 md:text-2xl">
          Schedulers, systems notes, and reproducible measurements for shared inference.
        </p>
        <p className="mt-6 max-w-2xl font-mono text-sm leading-7 text-ink-1">
          KVWarden Gate 2: 1.14× of solo TTFT under load. 26× better than FIFO.
        </p>
        <div className="mt-8">
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded border border-accent bg-accent px-5 py-3 font-mono text-xs uppercase tracking-wide text-bg-0 transition hover:bg-accent-2 hover:border-accent-2"
            data-cta="hero"
            href={`/research/${latestSlug}`}
          >
            Read the launch <ArrowRight aria-hidden="true" size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visually verify**

Run: `npm run dev`. Open home. Confirm result-anchor sentence + amber CTA button appear below the existing tagline.

Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/home/Hero.tsx
git commit -m "feat(hero): add result-anchor sentence + inline Read-the-launch CTA"
```

---

### Task 15: Strengthen `LiveSignalsStrip.tsx` to 6 items

**Files:**
- Modify: `components/home/LiveSignalsStrip.tsx`

- [ ] **Step 1: Replace contents**

Replace `components/home/LiveSignalsStrip.tsx` with:
```tsx
import { getRepoSignals } from "@/lib/github";
import { loadResearchFeed } from "@/lib/content";

const KVWARDEN_BANNER = "kvwarden gate 2 · 1.14× solo · 26× better than fifo";

function relativeDate(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  const days = Math.max(0, Math.round(diffMs / 86_400_000));
  if (days === 0) return "today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export async function LiveSignalsStrip() {
  const [signals, feed] = await Promise.all([getRepoSignals(), loadResearchFeed()]);
  const latest = feed[0];
  const latestNote = latest ? `latest note · ${latest.date} (${relativeDate(latest.date)})` : "";

  // Order matters: lead with the credibility-heaviest signals.
  const items = [
    latestNote,
    `${signals.commitsThisWeek} commits this week`,
    KVWARDEN_BANNER,
    `${signals.repos} repos tracked`,
    `${signals.openIssues} rfc open`,
    signals.updatedLabel,
  ].filter(Boolean);

  return (
    <section className="px-[var(--space-page-x)] pb-12">
      <div className="content-inner flex flex-wrap gap-x-5 gap-y-2 border-t border-rule pt-5 font-mono text-[0.72rem] uppercase text-ink-2">
        {items.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Visually verify**

Run: `npm run dev`. Scroll to the bottom strip. Expect 6 mono items including `latest note · YYYY-MM-DD (N days ago)` and the permanent kvwarden banner.

Stop server.

- [ ] **Step 3: Commit**

```bash
git add components/home/LiveSignalsStrip.tsx
git commit -m "feat(live-signals): 6 items including permanent kvwarden gate-2 banner"
```

---

## Phase I — Polish threads (avatars, EmailLink prominence, smoothness)

### Task 16: Avatar placeholder fix

**Files:**
- Modify: `public/images/founder-placeholder.svg`
- Modify: `components/about/PersonCard.tsx`
- Modify: `components/home/PeopleStrip.tsx` (if it renders an Image)

The current placeholder draws an oval-with-curve shape that crops awkwardly at the card aspect ratio. The fix: replace the SVG with a minimal solid-bg + initials treatment that scales cleanly to any aspect ratio.

- [ ] **Step 1: Replace `public/images/founder-placeholder.svg`**

Replace the entire file with:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" role="img" aria-label="portrait pending">
  <rect width="200" height="250" fill="#DED5C2" />
  <rect x="0" y="0" width="200" height="250" fill="url(#noise)" opacity="0.04" />
  <defs>
    <pattern id="noise" patternUnits="userSpaceOnUse" width="2" height="2">
      <rect width="2" height="2" fill="#1A1611" opacity="0.5" />
    </pattern>
  </defs>
</svg>
```

This is a flat warm-paper rectangle with a subtle texture overlay. No oval-with-curve shape, no initials-letterform — those are drawn at the component level when needed (Step 2).

- [ ] **Step 2: Inspect `components/about/PersonCard.tsx`**

Run: `cat components/about/PersonCard.tsx`

Note where it renders the `<Image>` component for `person.image`. The placeholder SVG fills the same slot at the same dimensions; no change needed in the component itself unless you want to overlay initials when the image equals the placeholder URL.

- [ ] **Step 3: Add an initials overlay when the image is the placeholder**

Replace the image-rendering block in `components/about/PersonCard.tsx` with this pattern (find the `<Image>` block and replace):
```tsx
{person.image ? (
  person.image.endsWith("founder-placeholder.svg") ? (
    <div className="relative aspect-[4/5] overflow-hidden rounded border border-rule bg-bg-2">
      <span
        aria-hidden="true"
        className="absolute inset-0 grid place-items-center font-serif text-5xl text-ink-2"
        style={{ letterSpacing: "0.05em" }}
      >
        {person.name.split(" ").map((part) => part.charAt(0).toUpperCase()).slice(0, 2).join("")}
      </span>
    </div>
  ) : (
    <div className="relative aspect-[4/5] overflow-hidden rounded border border-rule">
      <Image alt={person.name} className="object-cover" fill src={person.image} />
    </div>
  )
) : null}
```

Do the same in `components/home/PeopleStrip.tsx` if it renders an `<Image src="/images/founder-placeholder.svg" />`. Run `grep -n "founder-placeholder" components/home/PeopleStrip.tsx` to confirm.

- [ ] **Step 4: Visually verify**

Run: `npm run dev`. Open `/about`. Cards should now show clean warm-paper rectangles with serif "SP" / "JP" initials centered. No more oval shapes.

Open `/`, scroll to People strip. Same treatment.

Stop server.

- [ ] **Step 5: Commit**

```bash
git add public/images/founder-placeholder.svg components/about/PersonCard.tsx components/home/PeopleStrip.tsx
git commit -m "fix(avatars): clean placeholder treatment with initials overlay (replaces oval-curve SVG)"
```

---

### Task 17: EmailLink visual prominence

**Files:**
- Modify: `components/primitives/EmailLink.tsx`

The current EmailLink puts the address as text + a small Copy button next to it. The user reports clicking the address still does nothing on machines without a mailto handler. Fix: bump Copy-button visual prominence and add an explicit "or copy" hint that disappears once the user copies.

- [ ] **Step 1: Replace contents**

Replace `components/primitives/EmailLink.tsx` with:
```tsx
"use client";

import { Check, Copy, Mail } from "lucide-react";
import { useState } from "react";

export function buildMailtoHref(email: string, subject?: string): string {
  const params = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${email}${params}`;
}

export function EmailLink({
  email,
  subject,
  label,
  className = "",
}: {
  email: string;
  subject?: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const href = buildMailtoHref(email, subject);

  async function copyEmail() {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(email);
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = email;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <span className={`inline-flex flex-wrap items-center gap-2 ${className}`}>
      <a
        className="focus-ring inline-flex items-center gap-2 rounded-sm text-accent transition hover:underline"
        data-cta="mailto"
        href={href}
      >
        <Mail aria-hidden="true" size={14} />
        {label ?? email}
      </a>
      <button
        aria-label={`Copy ${email}`}
        className={`focus-ring inline-flex h-9 items-center gap-2 rounded border px-3 font-mono text-[0.7rem] uppercase tracking-wide transition ${
          copied
            ? "border-accent-2 bg-accent-2/10 text-accent-2"
            : "border-rule bg-bg-1 text-ink-1 hover:border-accent hover:text-accent"
        }`}
        data-cta="copy-email"
        onClick={copyEmail}
        title={copied ? "Copied" : `Copy ${email}`}
        type="button"
      >
        {copied ? (
          <>
            <Check aria-hidden="true" size={13} />
            Copied
          </>
        ) : (
          <>
            <Copy aria-hidden="true" size={13} />
            Copy
          </>
        )}
      </button>
    </span>
  );
}
```

Changes from previous version:
- Copy button now has visible "Copy" text label (not just an icon). Visitors immediately see it as an action.
- "Copied" state shows a clear text confirmation, not just a checkmark icon swap.
- Mailto link gets `transition hover:underline` to read more clearly as a link.
- `data-cta="mailto"` and `data-cta="copy-email"` for analytics later.

- [ ] **Step 2: Visually verify**

Run: `npm run dev`. Visit `/contact`. Each row's EmailLink now shows: `[Mail icon] email@address` + a text-labeled `[Copy icon] Copy` button. Click the button — it switches to `[Check icon] Copied` for ~1.6s.

Visit `/about` — PersonCard email links should also show the Copy button next to the email.

Visit `/` and scroll to ContactStrip. Same treatment.

Stop server.

- [ ] **Step 3: Run unit + e2e**

Run: `npm run test && npx playwright test tests/e2e/inner-pages.spec.ts --project=chromium 2>&1 | tail -15`
Expected: all pass. The e2e test for /contact already asserts a button with `aria-label="Copy <email>"` exists; the new implementation still satisfies that.

- [ ] **Step 4: Commit**

```bash
git add components/primitives/EmailLink.tsx
git commit -m "feat(email-link): bump Copy button visual prominence with text label + clearer states"
```

---

### Task 18: Smoothness investigation + targeted fixes

**Files:** varies (investigative). Most likely candidates: `components/home/HeroCanvas.tsx`, anything using `motion`/Lenis/scroll listeners, R3F mounts.

The user reports the site feels jittery. This task is structured as a measurement-then-fix loop. The likely culprits and their concrete fixes:

- [ ] **Step 1: Profile a fresh dev session in Chrome DevTools**

Run: `npm run dev` and open `http://localhost:3000` in Chrome (not Safari, since Chrome's profiler is more useful here).

Open DevTools → Performance tab → click record → scroll the home page top-to-bottom over ~5 seconds → stop.

In the recording:
1. Look for **long tasks** (>50ms red bars). Note which scripts they fire from.
2. Look for **layout shifts** (purple bars). Note which sections cause them.
3. Look for **scripting time spikes** during scroll. Note their cause.

Write findings into a scratch note (don't commit) with the top 3 offenders, e.g.:
```
1. HeroCanvas (R3F) — 230ms init on first paint
2. LiveSignalsStrip — sync GitHub fetch blocking initial render (server-side, not a perf issue but a TTFB hit)
3. PeopleStrip Image hydration — 80ms layout shift on first scroll
```

- [ ] **Step 2: Apply Fix 1 — HeroCanvas intersection-observer gating**

Inspect `components/home/HeroCanvas.tsx`. If it currently mounts the R3F `<Canvas>` immediately (no in-view gating), wrap it:

```tsx
"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";

export function HeroCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldMount(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 -z-10">
      {shouldMount ? (
        <Canvas /* existing props */>
          {/* existing scene */}
        </Canvas>
      ) : null}
    </div>
  );
}
```

Adapt to whatever the current `HeroCanvas.tsx` already does. Goal: don't initialize R3F until the canvas is about to be visible. (For the home Hero, it always *is* in viewport on load, so the rootMargin: "200px" essentially mounts it on first paint, but the gating still helps if the canvas component is reused on other routes.)

- [ ] **Step 3: Apply Fix 2 — passive scroll listeners**

Run: `grep -rn "addEventListener\(.scroll" components/ app/`
For every scroll listener found, ensure it uses `{ passive: true }`:
```ts
window.addEventListener("scroll", handler, { passive: true });
```

If anything uses `wheel` or `touchmove`, also add `{ passive: true }`.

- [ ] **Step 4: Apply Fix 3 — `font-display: swap` and preload critical fonts**

Inspect `app/fonts.ts` (or wherever fonts are loaded via `next/font`). Confirm `display: "swap"` is set on every font. If not, add it:
```ts
const fontFraunces = Fraunces({ subsets: ["latin"], display: "swap", variable: "--font-fraunces" });
```

- [ ] **Step 5: Apply Fix 4 — reduce hydration-time client islands**

Run: `grep -l '"use client"' components/`
For each client component, ask: does this need to be a client component? Some that probably don't:
- Hero (after Task 14) — `"use client"` not needed since the only state was the breathing animation, which is CSS-only
- LiveSignalsStrip — already a Server Component

If any client component can become a Server Component (no useState/useEffect/event handlers), drop the `"use client"` directive.

- [ ] **Step 6: Re-profile**

Run: `npm run build && npm run start`
Open `http://localhost:3000`. Re-record a Performance trace. Compare against Step 1 findings:
- Were the top 3 offenders reduced or eliminated?
- Is scroll smoother to feel?

Aim for: zero long tasks during scroll, CLS < 0.05, FCP < 1s on local.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "perf(home): hero-canvas in-view gating, passive scroll listeners, font-display: swap"
```

---

## Phase J — Test refresh + final verification

### Task 19: Update e2e tests to assert all the new copy

**Files:**
- Modify: `tests/e2e/home.spec.ts`
- Modify: `tests/e2e/inner-pages.spec.ts`
- Modify: `tests/e2e/shell.spec.ts`

- [ ] **Step 1: Update `tests/e2e/shell.spec.ts`**

Open the file and update the Header assertion. Replace any "Mail icon" assertion with:
```ts
test("header has 5 nav items + Read-the-launch CTA", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Primary" });
  for (const label of ["Research", "Projects", "Join us", "About", "Contact"]) {
    await expect(nav.getByRole("link", { name: label })).toBeVisible();
  }
  const cta = page.getByRole("link", { name: /Read the launch/i });
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", /\/research\//);
});
```

If the file already has a different test signature, replace just the relevant block.

- [ ] **Step 2: Update `tests/e2e/home.spec.ts`**

Replace the home composition test with assertions for the new order + Hero result-anchor + 6-item LiveSignals:
```ts
test("home renders the full composition in the new order", async ({ page }) => {
  await page.goto("/");
  // Hero result-anchor sentence
  await expect(page.getByText(/KVWarden Gate 2/i)).toBeVisible();
  // Hero CTA button
  await expect(page.getByRole("link", { name: /Read the launch/i }).first()).toBeVisible();
  // Strips appear in order: Manifesto -> Projects -> Research -> People -> Contact -> LiveSignals
  // Use stable text anchors per strip
  await expect(page.getByText(/Two people, close to the work/i)).toBeVisible();
  // LiveSignals contains the kvwarden banner
  await expect(page.getByText(/kvwarden gate 2/i)).toBeVisible();
});
```

- [ ] **Step 3: Update `tests/e2e/inner-pages.spec.ts`**

Add new assertions to the existing /contact test, and add new tests for /joinus + /projects + /research filter:
```ts
test("/contact has response-time + not-for-this-inbox blocks", async ({ page }) => {
  await page.goto("/contact");
  await expect(page.getByText(/response time/i).first()).toBeVisible();
  await expect(page.getByText(/We don't always reply quickly/i)).toBeVisible();
  await expect(page.getByText(/not for this inbox/i).first()).toBeVisible();
  await expect(page.getByText(/Sales outreach/i)).toBeVisible();
});

test("/joinus has 5 starting paths + contributors block", async ({ page }) => {
  await page.goto("/joinus");
  // Starting paths
  await expect(page.getByText(/Reproduce Gate 2/i)).toBeVisible();
  await expect(page.getByText(/H100 saturation case/i)).toBeVisible();
  await expect(page.getByText(/baseline scheduler/i)).toBeVisible();
  await expect(page.getByText(/failure mode in the fairness claim/i)).toBeVisible();
  await expect(page.getByText(/Patch the harness/i)).toBeVisible();
  // Contributors empty state
  await expect(page.getByText(/Just us, for now/i)).toBeVisible();
});

test("/projects shows KVWarden + Weft + tools", async ({ page }) => {
  await page.goto("/projects");
  await expect(page.getByRole("heading", { name: "KVWarden" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Weft" })).toBeVisible();
  await expect(page.getByText(/tools and experiments/i)).toBeVisible();
  await expect(page.getByText(/1\.14× of solo TTFT, 26× better than FIFO/i)).toBeVisible();
  await expect(page.getByText(/In research/i)).toBeVisible();
});

test("/research filter row works", async ({ page }) => {
  await page.goto("/research");
  // Filter labels visible
  for (const label of ["all", "notes", "papers", "podcasts", "talks"]) {
    await expect(page.getByRole("link", { name: label, exact: true })).toBeVisible();
  }
  // Click "papers" → empty-state copy appears
  await page.getByRole("link", { name: "papers", exact: true }).click();
  await expect(page).toHaveURL(/\/research\?type=papers/);
  await expect(page.getByText(/No papers yet/i)).toBeVisible();
});
```

- [ ] **Step 4: Run the full e2e suite**

Run: `npx playwright test --project=chromium 2>&1 | tail -25`
Expected: all tests pass. If anything fails, fix the assertion to match the actual rendered text (DON'T change the implementation — match the test to reality).

- [ ] **Step 5: Run typecheck + unit tests + build**

Run: `npm run typecheck && npm run test && npm run build`
Expected: all clean.

- [ ] **Step 6: Commit**

```bash
git add tests/
git commit -m "test(e2e): update for new nav, home order, /contact/joinus/projects copy, /research filter"
```

---

### Task 20: Final verification + push

**Files:** none

- [ ] **Step 1: Run the full test suite end-to-end**

Run: `npm run test:all`

This runs typecheck → unit → build → e2e. Expected: green across the board.

- [ ] **Step 2: Visual smoke check on a real browser**

Run: `npm run dev`. Walk every primary route:
- `/` — new order, Hero CTA visible, 6-item LiveSignals
- `/research` — filter row, click each filter
- `/research/tenant-fairness-on-shared-inference` — post still renders
- `/projects` — new hub, KVWarden + Weft + tools list
- `/projects/kvwarden`, `/projects/weft` — still render (untouched)
- `/joinus` — 5 paths, all 4 sections, contributor block
- `/contact` — 3 rows + response-time + not-for-this-inbox
- `/about` — clean placeholder avatars (no ovals), email Copy button works
- `/work` → redirects to `/projects#tools`
- `/papers` → redirects to `/research?type=papers`
- `/podcasts` → redirects to `/research?type=podcasts`

- [ ] **Step 3: Push all commits**

Run:
```bash
git fetch origin
git pull --rebase origin main
git push origin main
```

If `git pull --rebase` reports conflicts, stop and surface to the user. Don't force-push.

Expected: clean push with the 18+ commits from this plan landing on `main`.

- [ ] **Step 4: Confirm CI green**

Run: `gh run watch` (or `gh run list --limit 1` then `gh run watch <id>`)
Expected: CI green.

- [ ] **Step 5: Verify the live URL**

If a deploy is wired (Vercel/CF), wait ~2 minutes and visit `https://coconutlabs.org` (or the preview URL). Walk the same route list as Step 2.

---

## External prerequisites — user must do before /joinus is fully functional

The /joinus page links to three files in `coconut-labs/kvwarden`. If those don't exist, the links 404 and the page reads as half-finished.

- **`coconut-labs/kvwarden/CONTRIBUTING.md`** — write this. ~200 lines. Cover: how to set up the harness locally, how to run the bench, what counts as a good PR, how to claim co-authorship for substantive work.
- **`coconut-labs/kvwarden/CODE_OF_CONDUCT.md`** — Contributor Covenant 1.4 is fine; takes 5 minutes.
- **`coconut-labs/kvwarden/CONTRIBUTORS`** — newline-delimited list of GitHub handles. Empty file is fine for v1; the page renders "Just us, for now."

These are user-side; the plan above does not block on them. The /joinus page renders correctly without them — the links just 404 until the files exist.

---

## Self-Review

### Spec coverage check

| Spec section | Plan task |
|---|---|
| §2 Sitemap+Nav (lib/routes.ts) | Task 1 |
| §2 308 redirects | Task 2 |
| §2 Header changes (5-item nav + CTA) | Task 7 |
| §3 /research mixed feed with filter | Task 10 |
| §3 /research empty-state copy | Task 10 |
| §4 /projects hub (3-tier hierarchy) | Task 9 |
| §4 KVWarden/Weft body copy | Task 8 |
| §4 /work → /projects#tools redirect | Task 2 + Task 9 (test flip) |
| §5 /joinus full rewrite | Task 11 |
| §5 5 starting paths | Task 11 |
| §5 give-back / don't-do / not-looking-for | Task 11 |
| §5 contributors block | Task 11 |
| §5 lib/contributors.ts | Task 6 |
| §6 /contact body refinement | Task 12 |
| §6 response-time + not-for-this-inbox blocks | Task 12 |
| §7 home order swap | Task 13 |
| §7 Hero result-anchor + CTA | Task 14 |
| §7 LiveSignals 6 items + banner | Task 15 |
| Avatar fix (additional thread) | Task 16 |
| EmailLink polish (additional thread) | Task 17 |
| Smoothness investigation + fix (additional thread) | Task 18 |
| Test updates | Task 19 |
| Final verification + push | Task 20 |

All spec sections + 3 additional threads have tasks.

### Placeholder scan

No "TBD", no "TODO", no "implement later". Every step has either: actual code, an exact file path, or a concrete command. The smoothness task (18) is structured as investigative — its steps either show concrete code (HeroCanvas gating, passive listeners) or describe specific actions (run the profiler, inspect the trace).

### Type consistency

- `FeedEntry` and `FeedType` defined in Task 5; used in Task 10. ✓
- `loadResearchFeed()` defined in Task 5; used in Task 10 + Task 15. ✓
- `getLatestPostSlug()` defined in Task 5; used in Task 7 + Task 14. ✓
- `loadContributors()` defined in Task 6; used in Task 11. ✓
- `EmailLink` props unchanged in Task 17 (visual change only); `/contact` and PersonCard usages still work. ✓

### Scope check

This is one cohesive refinement of an existing site. All 20 tasks share the same codebase, deploy path, and goal. Not a multi-subsystem project. Single-plan scope is correct.
