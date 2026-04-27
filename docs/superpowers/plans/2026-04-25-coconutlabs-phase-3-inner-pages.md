# coconutlabs.org — Phase 3 (Inner Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 4 of 6.** This plan covers Phase 3 only (Inner Pages). Other plans:
- `2026-04-25-coconutlabs-phase-0-foundation.md`
- `2026-04-25-coconutlabs-phase-1-home-and-visual-identity.md`
- `2026-04-25-coconutlabs-phase-2-research-engine.md`
- `2026-04-25-coconutlabs-phase-3-inner-pages.md` ← this plan
- `2026-04-25-coconutlabs-phase-4-motion-polish.md`
- `2026-04-25-coconutlabs-phase-5-perf-a11y-ship.md`

> **Amended 2026-04-26.** Three updates:
> 1. **Co-founder Jay Patel** (`github.com/jaypatel15406`) — `/about` People grid renders **two** PersonCards (Shrey + Jay). New `content/people/jay-patel.mdx`. Voice line "Coconut Labs is currently me, Shrey Patel" → "Coconut Labs is Shrey Patel and Jay Patel."
> 2. **Email convention.** `/contact` page exposes three addresses: `info@coconutlabs.org` (default / General section), `shreypatel@coconutlabs.org` (Collaborate routes here), `jaypatel@coconutlabs.org` (Press routes here, since Jay handles outbound comms — adjust if user prefers a different split). All other `hello@` references throughout this plan replaced with `info@`.
> 3. **CursorLayer dropped** (decided in spec amendment). No Phase 3 impact since Phase 3 has no cursor work.

**Goal:** Every route in the sitemap renders real content or in-character empty state. Build `/work`, `/papers`, `/podcasts`, `/joinus`, `/about`, `/contact`, `/projects/kvwarden`, `/projects/weft`, `/colophon` with shared primitives (`IndexPageTemplate`, `IndexCard`, `EmptyState`, `StatusBadge`, `ProjectHero`, `PrincipleCard`, `PersonCard`, `ColophonSection`). Extend `lib/content.ts` with typed JSON manifest loaders for `work.json`, `papers.json`, `podcasts.json` plus a project frontmatter loader. Tested by extension to the existing Vitest + Playwright suites; a11y enforced per new route.

**Architecture:** React Server Components by default for every inner page (none of this work needs interactivity beyond a hover state — motion polish lands in Phase 4). Three index pages (`/work`, `/papers`, `/podcasts`) share a single `IndexPageTemplate` per spec §5.2 — title, mono subtitle, list-of-cards, in-character empty state. Project pages are two concrete routes (`/projects/kvwarden`, `/projects/weft`), not a dynamic `[slug]` segment, matching the spec's "thin v1" scope. JSON manifests live in `content/` and are loaded server-side at build time via typed parsers in `lib/content.ts`. Project bodies are MDX in `content/projects/*.mdx`, rendered through the Phase 2 MDX pipeline (no new MDX components needed in this phase).

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript strict, Tailwind v4, MDX (Phase 2 pipeline), Vitest, Playwright, axe-core. No new runtime deps.

**Prerequisites:**
- Phase 0 complete: design tokens, fonts, shell (Header/Footer), wordmark, infra endpoints, CI green.
- Phase 1 complete: home page, `Card` primitive, `Badge` primitive, `ThinRule`, `PageNumber`, founder photo at `public/images/`.
- Phase 2 complete: MDX pipeline (`@next/mdx` + Shiki), `lib/content.ts` with `parseFrontmatter()` + `loadFile()`, MDX components registry at `components/mdx/components.tsx`.
- Working directory: `/Users/shrey/Personal Projects/coconutlabs/`
- `pnpm install` clean. `pnpm test:all` passes on the Phase 2 baseline.

---

## Voice rules — every page in this phase

Per spec §8. The plan's placeholder copy already follows these rules; do not rewrite to be more "marketing-y" when filling in user-provided text later.

- Short declarative sentences. Active voice.
- Lowercase mono captions for metadata, status, dates.
- Specific numbers > adjectives. "53.9 ms quiet TTFT" > "fast inference."
- Honest scale: "Coconut Labs is Shrey Patel and Jay Patel" — first-person plural, no fake-team plurals beyond the actual two-person scale.
- Manuscript metaphors sparingly — let the visual system carry it.
- **Banned phrases (do not introduce, do not let user content sneak past):** "we empower," "next-generation," "innovative," "cutting-edge," "leverage," "unlock," "seamless," "revolutionary," "AI-powered," "the future of."
- One joke per page maximum. Dry, not winking.

Where user-provided copy is not yet in hand, this plan inlines voice-compliant placeholders pulled directly from spec §8.2. They are marked `// PLACEHOLDER: replace with user-provided copy` so they can be swept later without breaking layout.

---

## Implicit constraints — read before starting

- **Header nav stays unchanged.** Phase 0's `Header.tsx` already routes "Projects" → `/projects/kvwarden`. Spec §4.2 says no dropdown until content demands it; two projects don't demand it. Do not modify the nav.
- **Phase 0's `app/sitemap.ts` already lists all 11 routes.** No sitemap edit in Phase 3.
- **`StatusBadge` wraps Phase 1's `Badge` primitive.** Per spec §9.2 `Badge` is a primitive; `StatusBadge` is a thin status-flavored wrapper that maps frontmatter enum values (`live` / `research` / `archived`) to display strings ("Live" / "In research" / "Archived") and accent colors. Do not duplicate Badge.
- **`/projects/[slug]` is two concrete routes**, not a dynamic segment. Spec §5.5 phrasing is loose; the task list is explicit. If a future phase needs more projects, the dynamic segment can come then.
- **`/work` is NOT empty in v1.** Three to five real entries (kvwarden, weft, plus one or two small experiments). Empty states are only for `/papers` and `/podcasts`.
- **Status enum values are lowercase** (`live` / `research` / `archived`) per spec §9.4 frontmatter. Display strings are derived in `StatusBadge`, not stored.
- **No remote-push or CI auth tasks.** Phase 0 handled GitHub repo + Vercel + Cloudflare. Phase 3 is local commits on the existing repo; CI runs automatically on push per `.github/workflows/ci.yml`.
- **Per autonomy preference:** push commits when each task lands and let CI run; do not pause for permission unless an auth-interrupt step (§Task 1) is unmet.

---

## File Structure (Phase 3 deliverables)

```
coconutlabs/
├── app/
│   ├── work/page.tsx                    /work — index of OSS + experiments
│   ├── papers/page.tsx                  /papers — formal publications (empty v1)
│   ├── podcasts/page.tsx                /podcasts — episodes + appearances (empty v1)
│   ├── joinus/page.tsx                  /joinus — contributors
│   ├── about/page.tsx                   /about — manifesto, people, how we work
│   ├── contact/page.tsx                 /contact — collaborate · press · general
│   ├── colophon/page.tsx                /colophon — fonts, stack, inspirations
│   └── projects/
│       ├── kvwarden/page.tsx            /projects/kvwarden — thin v1
│       └── weft/page.tsx                /projects/weft — thin v1
├── components/
│   ├── index/
│   │   ├── IndexPageTemplate.tsx        shared shell for /work, /papers, /podcasts
│   │   ├── IndexCard.tsx                list-page card
│   │   └── EmptyState.tsx               in-character mono empty state
│   ├── about/
│   │   ├── PrincipleCard.tsx            serif title + mono body
│   │   └── PersonCard.tsx               photo + bio + socials
│   ├── projects/
│   │   ├── ProjectHero.tsx              wordmark + tagline + status badge + result
│   │   └── StatusBadge.tsx              wraps primitives/Badge with status enum
│   └── colophon/
│       └── ColophonSection.tsx          editorial section block
├── content/
│   ├── work/work.json                   3-5 OSS entries
│   ├── papers/papers.json               []
│   ├── podcasts/podcasts.json           []
│   ├── projects/
│   │   ├── kvwarden.mdx                 thin v1 body (modify Phase 2 stub)
│   │   └── weft.mdx                     thin v1 body (modify Phase 2 stub)
│   ├── about/
│   │   ├── manifesto.mdx                long version of homepage strip
│   │   └── how-we-work.mdx              4-5 short principles
│   └── people/
│       └── shrey-patel.mdx              founder bio + social links
├── lib/
│   └── content.ts                       extend with loadWork, loadPapers, loadPodcasts, loadProject
└── tests/
    ├── unit/lib/content.test.ts         extend: typed JSON loaders + frontmatter validation
    └── e2e/
        ├── inner-pages.spec.ts          every inner route renders, contact mailtos, colophon
        └── accessibility.spec.ts        extend ROUTES with all new pages
```

**File responsibility boundaries:**
- `lib/content.ts` is the single source of truth for content I/O. All page components consume it; no page component reads `fs` directly.
- `components/index/*` is shared by three routes — keep it generic (no /work-specific logic in `IndexCard`).
- `components/projects/*` is shared by both project pages — symmetry matters because in Phase B these will host full LP content, and divergent shells will be painful to refactor.
- JSON manifests in `content/*.json` are flat arrays of typed objects. Schema is enforced by hand-written guards in `lib/content.ts` (no Zod dep — keep the surface area small).
- MDX bodies in `content/projects/*.mdx` and `content/about/*.mdx` use the existing Phase 2 MDX components. No new MDX components in this phase.

---

## Tasks

### Task 1: AUTH INTERRUPT — gather user content + confirm contact email

**Files:** none (gather inputs)

This is a content-only auth-interrupt. Phase 0 handled GitHub/Vercel/Cloudflare; Phase 3 needs voice-bearing copy that only the user can write. Front-loading prevents writing voice-violating placeholders and revisiting every page.

- [ ] **Step 1: Ask the user for the following, with sane defaults**

Ask:
> "Phase 3 needs six pieces of user-authored content. For each, I can either (a) wait for your draft, or (b) ship the spec §8.2 placeholder now and you sweep later. Which per item?
>
> 1. **Manifesto draft** — long version for `/about`. Spec §8.2 (amended 2026-04-26) placeholder: 'Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems...'
> 2. **Founder bios** — 2–3 sentences each, first person, for the People grid on `/about` (one for Shrey, one for Jay). Photos from Phase 1.
> 3. **KVWarden tagline + 2–3 paragraphs of what+why** — for `/projects/kvwarden`. Spec §8.2 placeholder: 'Tenant fairness on shared inference. 53.9 ms solo, 61.5 ms under flooder pressure, 26× better than FIFO.'
> 4. **Weft tagline + 1-paragraph teaser** — for `/projects/weft`. Spec §8.2 placeholder: 'A scheduler for Apple Silicon that keeps tenants honest under load. In research. Watching `mlx-lm#965` for upstream correctness fixes before we publish.'
> 5. **'How we work' principles** — 4–5 short principles, each a serif title + 1–2 mono sentences. No spec placeholder; will improvise voice-compliant defaults if you pick (b).
> 6. **Contact email split** — default split: `Collaborate` → `shreypatel@coconutlabs.org`, `Press` → `jaypatel@coconutlabs.org`, `General` → `info@coconutlabs.org`. Confirm or reassign."

- [ ] **Step 2: Record decisions inline**

For each item the user picks (b), the plan inlines the spec §8.2 placeholder marked `// PLACEHOLDER: replace with user-provided copy`. For (a), pause that specific page until copy lands; other pages proceed.

- [ ] **Step 3: Lock the contact email split**

Confirmed values go into `app/contact/page.tsx` and the `mailto:` test in `tests/e2e/inner-pages.spec.ts`. Default split: `info@coconutlabs.org` (general), `shreypatel@coconutlabs.org` (collaborate), `jaypatel@coconutlabs.org` (press).

---

### Task 2: Extend lib/content.ts with typed JSON manifest loaders (TDD)

**Files:**
- Modify: `lib/content.ts`
- Modify: `tests/unit/lib/content.test.ts`

- [ ] **Step 1: Write the loader tests**

Append to `tests/unit/lib/content.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  loadWork,
  loadPapers,
  loadPodcasts,
  loadProject,
  type WorkEntry,
  type PaperEntry,
  type PodcastEntry,
  type ProjectFrontmatter,
} from "@/lib/content";

describe("loadWork", () => {
  it("returns a typed array of work entries from content/work/work.json", () => {
    const entries = loadWork();
    expect(Array.isArray(entries)).toBe(true);
    expect(entries.length).toBeGreaterThanOrEqual(3);
    for (const e of entries) {
      expect(typeof e.name).toBe("string");
      expect(typeof e.description).toBe("string");
      expect(typeof e.language).toBe("string");
      expect(e.repo_url).toMatch(/^https:\/\/github\.com\//);
      expect(typeof e.last_updated).toBe("string");
      if (e.stars !== undefined) expect(typeof e.stars).toBe("number");
    }
  });

  it("rejects entries missing required fields", () => {
    // negative test via the type guard — exposed as `isWorkEntry` for direct testing
    const { isWorkEntry } = require("@/lib/content");
    expect(isWorkEntry({ name: "x" })).toBe(false);
    expect(
      isWorkEntry({
        name: "x",
        description: "y",
        language: "TypeScript",
        repo_url: "https://github.com/coconut-labs/x",
        last_updated: "2026-04-25",
      })
    ).toBe(true);
  });
});

describe("loadPapers", () => {
  it("returns an empty array (v1)", () => {
    const entries = loadPapers();
    expect(entries).toEqual([]);
  });
});

describe("loadPodcasts", () => {
  it("returns an empty array (v1)", () => {
    const entries = loadPodcasts();
    expect(entries).toEqual([]);
  });
});

describe("loadProject", () => {
  it("loads kvwarden frontmatter with status enum", () => {
    const project = loadProject("kvwarden");
    expect(project.name).toBe("KVWarden");
    expect(["live", "research", "archived"]).toContain(project.status);
    expect(project.tagline).toBeTruthy();
    expect(project.headline_result).toBeTruthy();
    expect(project.external_url).toMatch(/^https:\/\//);
  });

  it("loads weft frontmatter with status='research'", () => {
    const project = loadProject("weft");
    expect(project.status).toBe("research");
  });

  it("throws on unknown slug", () => {
    expect(() => loadProject("does-not-exist")).toThrow();
  });
});
```

- [ ] **Step 2: Run tests, verify they fail**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: FAIL with "loadWork is not a function" (or similar).

- [ ] **Step 3: Extend lib/content.ts**

Append to `lib/content.ts` (do NOT rewrite — Phase 0 + Phase 2 added `parseFrontmatter`, `loadFile`, plus the research post helpers):
```ts
import { existsSync, readdirSync } from "node:fs";

// ─── work.json ────────────────────────────────────────────────────────

export type WorkEntry = {
  name: string;
  description: string;
  language: string;
  repo_url: string;
  last_updated: string; // ISO 8601 date
  stars?: number;
};

export function isWorkEntry(x: unknown): x is WorkEntry {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return (
    typeof e.name === "string" &&
    typeof e.description === "string" &&
    typeof e.language === "string" &&
    typeof e.repo_url === "string" &&
    e.repo_url.startsWith("https://github.com/") &&
    typeof e.last_updated === "string" &&
    (e.stars === undefined || typeof e.stars === "number")
  );
}

export function loadWork(): WorkEntry[] {
  const raw = readFileSync(join(CONTENT_ROOT, "work/work.json"), "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("work.json must be a JSON array");
  for (const [i, entry] of parsed.entries()) {
    if (!isWorkEntry(entry)) {
      throw new Error(`work.json[${i}] is not a valid WorkEntry`);
    }
  }
  return parsed;
}

// ─── papers.json ──────────────────────────────────────────────────────

export type PaperEntry = {
  title: string;
  authors: string[];
  venue: string;
  date: string; // ISO 8601
  url: string;
  abstract?: string;
};

export function loadPapers(): PaperEntry[] {
  const raw = readFileSync(join(CONTENT_ROOT, "papers/papers.json"), "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("papers.json must be a JSON array");
  return parsed as PaperEntry[];
}

// ─── podcasts.json ────────────────────────────────────────────────────

export type PodcastEntry = {
  title: string;
  show: string;
  host: string;
  date: string; // ISO 8601
  url: string;
  duration_min?: number;
};

export function loadPodcasts(): PodcastEntry[] {
  const raw = readFileSync(join(CONTENT_ROOT, "podcasts/podcasts.json"), "utf-8");
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) throw new Error("podcasts.json must be a JSON array");
  return parsed as PodcastEntry[];
}

// ─── project frontmatter ──────────────────────────────────────────────

export type ProjectStatus = "live" | "research" | "archived";

export type ProjectFrontmatter = {
  name: string;
  tagline: string;
  status: ProjectStatus;
  headline_result: string;
  external_url: string;
  github_url: string;
};

export function loadProject(slug: string): ProjectFrontmatter & { content: string } {
  const path = join(CONTENT_ROOT, `projects/${slug}.mdx`);
  if (!existsSync(path)) throw new Error(`project not found: ${slug}`);
  const raw = readFileSync(path, "utf-8");
  const { data, content } = parseFrontmatter(raw);
  const status = data.status as string;
  if (status !== "live" && status !== "research" && status !== "archived") {
    throw new Error(`projects/${slug}.mdx has invalid status: ${status}`);
  }
  return {
    name: String(data.name),
    tagline: String(data.tagline),
    status,
    headline_result: String(data.headline_result),
    external_url: String(data.external_url),
    github_url: String(data.github_url),
    content,
  };
}
```

- [ ] **Step 4: Create the JSON manifest stubs so the tests can run against real files**

Create `content/work/work.json`:
```json
[
  {
    "name": "kvwarden",
    "description": "Tenant fairness on shared inference. Middleware between an LLM and the GPU it runs on.",
    "language": "Python",
    "repo_url": "https://github.com/coconut-labs/kvwarden",
    "last_updated": "2026-04-23",
    "stars": 0
  },
  {
    "name": "weft",
    "description": "A scheduler for Apple Silicon that keeps tenants honest under load. In research.",
    "language": "Python",
    "repo_url": "https://github.com/coconut-labs/weft",
    "last_updated": "2026-04-23",
    "stars": 0
  },
  {
    "name": "kvwarden-root",
    "description": "Private workshop repo for kvwarden experiments. Read-only mirror of internal benches.",
    "language": "Python",
    "repo_url": "https://github.com/coconut-labs/kvwarden-root",
    "last_updated": "2026-04-23"
  }
]
```

Create `content/papers/papers.json`:
```json
[]
```

Create `content/podcasts/podcasts.json`:
```json
[]
```

- [ ] **Step 5: Modify the Phase 2 project MDX stubs to carry valid frontmatter**

The Phase 2 plan should have created `content/projects/kvwarden.mdx` and `content/projects/weft.mdx` as MDX stubs. If they are absent, create them; if present, modify their frontmatter to match the spec §9.4 schema.

`content/projects/kvwarden.mdx` — frontmatter only at this step (body lands in Task 9):
```mdx
---
name: KVWarden
tagline: "Tenant fairness on shared inference."
status: live
headline_result: "1.14× of solo, 26× better than FIFO"
external_url: https://kvwarden.org
github_url: https://github.com/coconut-labs/kvwarden
---
```

`content/projects/weft.mdx`:
```mdx
---
name: Weft
tagline: "A scheduler for Apple Silicon that keeps tenants honest under load."
status: research
headline_result: "In research."
external_url: https://github.com/coconut-labs/weft
github_url: https://github.com/coconut-labs/weft
---
```

- [ ] **Step 6: Run tests, verify they pass**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: PASS — Phase 0/2 tests still green plus 6 new (loadWork: 2, loadPapers: 1, loadPodcasts: 1, loadProject: 3) green.

- [ ] **Step 7: Commit**

```bash
git add lib/content.ts tests/unit/lib/content.test.ts content/
git commit -m "feat(phase-3): typed json manifest + project frontmatter loaders"
```

---

### Task 3: Build EmptyState primitive (TDD)

**Files:**
- Create: `components/index/EmptyState.tsx`
- Create: `tests/unit/index/EmptyState.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/index/EmptyState.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "@/components/index/EmptyState";

describe("EmptyState", () => {
  it("renders the in-character mono caption", () => {
    render(
      <EmptyState
        caption="// nothing here yet — but the work that becomes papers is happening at github.com/coconut-labs"
        href="https://github.com/coconut-labs"
        linkLabel="github.com/coconut-labs →"
      />
    );
    expect(screen.getByText(/nothing here yet/i)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: /github\.com\/coconut-labs/i });
    expect(link).toHaveAttribute("href", "https://github.com/coconut-labs");
  });

  it("opens external link in new tab with rel=noopener", () => {
    render(<EmptyState caption="x" href="https://example.com" linkLabel="x" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

- [ ] **Step 2: Run, verify fail**

Run: `pnpm exec vitest run tests/unit/index/EmptyState.test.tsx`
Expected: FAIL with module-not-found.

- [ ] **Step 3: Implement**

Create `components/index/EmptyState.tsx`:
```tsx
type Props = {
  caption: string;
  href: string;
  linkLabel: string;
};

export function EmptyState({ caption, href, linkLabel }: Props) {
  return (
    <div
      style={{
        padding: "var(--space-7) 0",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono)",
        color: "var(--ink-1)",
      }}
    >
      <p>{caption}</p>
      <p style={{ marginTop: "var(--space-2)" }}>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "var(--ink-0)",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          {linkLabel}
        </a>
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/index/EmptyState.test.tsx`
Expected: PASS, 2/2 green.

- [ ] **Step 5: Commit**

```bash
git add components/index/EmptyState.tsx tests/unit/index/EmptyState.test.tsx
git commit -m "feat(phase-3): add EmptyState primitive for index pages"
```

---

### Task 4: Build IndexCard primitive (TDD)

**Files:**
- Create: `components/index/IndexCard.tsx`
- Create: `tests/unit/index/IndexCard.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/index/IndexCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IndexCard } from "@/components/index/IndexCard";

describe("IndexCard", () => {
  it("renders meta line, title, dek, and resolves external href", () => {
    render(
      <IndexCard
        meta="2026-04-23 · oss"
        title="kvwarden"
        dek="Tenant fairness on shared inference."
        href="https://github.com/coconut-labs/kvwarden"
        external
      />
    );
    expect(screen.getByText(/2026-04-23/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /kvwarden/i })).toBeInTheDocument();
    expect(screen.getByText(/tenant fairness/i)).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://github.com/coconut-labs/kvwarden");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("internal link does not open in new tab", () => {
    render(<IndexCard meta="x" title="t" dek="d" href="/research/post-slug" />);
    const link = screen.getByRole("link");
    expect(link).not.toHaveAttribute("target");
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `pnpm exec vitest run tests/unit/index/IndexCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/index/IndexCard.tsx`:
```tsx
import Link from "next/link";

type Props = {
  meta: string;
  title: string;
  dek: string;
  href: string;
  external?: boolean;
};

export function IndexCard({ meta, title, dek, href, external = false }: Props) {
  const linkProps = external
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };

  return (
    <article
      style={{
        padding: "var(--space-4) 0",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-2)",
          marginBottom: "var(--space-2)",
        }}
      >
        {meta}
      </p>
      {external ? (
        <a {...linkProps} style={{ color: "var(--ink-0)", textDecoration: "none" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-h2)",
              color: "var(--ink-0)",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--fs-body)",
              color: "var(--ink-1)",
              marginTop: "var(--space-1)",
              maxWidth: "var(--measure)",
            }}
          >
            {dek}
          </p>
        </a>
      ) : (
        <Link href={href} style={{ color: "var(--ink-0)", textDecoration: "none" }}>
          <h3
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--fs-h2)",
              color: "var(--ink-0)",
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "var(--fs-body)",
              color: "var(--ink-1)",
              marginTop: "var(--space-1)",
              maxWidth: "var(--measure)",
            }}
          >
            {dek}
          </p>
        </Link>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/index/IndexCard.test.tsx`
Expected: PASS, 2/2 green.

- [ ] **Step 5: Commit**

```bash
git add components/index/IndexCard.tsx tests/unit/index/IndexCard.test.tsx
git commit -m "feat(phase-3): add IndexCard primitive"
```

---

### Task 5: Build IndexPageTemplate

**Files:**
- Create: `components/index/IndexPageTemplate.tsx`
- Create: `tests/unit/index/IndexPageTemplate.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/index/IndexPageTemplate.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";

describe("IndexPageTemplate", () => {
  it("renders title, mono subtitle, and children", () => {
    render(
      <IndexPageTemplate title="Work" subtitle="// open source · tools · experiments">
        <p>list goes here</p>
      </IndexPageTemplate>
    );
    expect(screen.getByRole("heading", { level: 1, name: /work/i })).toBeInTheDocument();
    expect(screen.getByText(/open source/i)).toBeInTheDocument();
    expect(screen.getByText(/list goes here/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `pnpm exec vitest run tests/unit/index/IndexPageTemplate.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/index/IndexPageTemplate.tsx`:
```tsx
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function IndexPageTemplate({ title, subtitle, children }: Props) {
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
          fontSize: "var(--fs-h1)",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: "var(--ink-0)",
        }}
      >
        {title}
      </h1>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-2)",
          marginTop: "var(--space-2)",
        }}
      >
        {subtitle}
      </p>
      <div style={{ marginTop: "var(--space-6)" }}>{children}</div>
    </section>
  );
}
```

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/index/IndexPageTemplate.test.tsx`
Expected: PASS, 1/1 green.

- [ ] **Step 5: Commit**

```bash
git add components/index/IndexPageTemplate.tsx tests/unit/index/IndexPageTemplate.test.tsx
git commit -m "feat(phase-3): add IndexPageTemplate shared shell"
```

---

### Task 6: Build /work page

**Files:**
- Create: `app/work/page.tsx`

- [ ] **Step 1: Implement the page**

Create `app/work/page.tsx`:
```tsx
import { loadWork } from "@/lib/content";
import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { IndexCard } from "@/components/index/IndexCard";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Work",
  description: "Open source, tools, and experiments from Coconut Labs.",
  path: "/work",
});

export default function WorkPage() {
  const entries = loadWork();
  return (
    <IndexPageTemplate
      title="Work"
      subtitle="// open source · tools · experiments — pulled from github.com/coconut-labs"
    >
      {entries.map((e) => (
        <IndexCard
          key={e.repo_url}
          meta={`${e.last_updated} · ${e.language}${e.stars ? ` · ${e.stars}★` : ""}`}
          title={e.name}
          dek={e.description}
          href={e.repo_url}
          external
        />
      ))}
    </IndexPageTemplate>
  );
}
```

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/work`. Expected:
- Title "Work" in Instrument Serif
- Mono subtitle
- 3+ cards with date · language meta line, repo name as title, description as dek
- Each card links out to GitHub in a new tab

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/work/page.tsx
git commit -m "feat(phase-3): /work page wired to work.json manifest"
```

---

### Task 7: Build /papers page (with empty state)

**Files:**
- Create: `app/papers/page.tsx`

- [ ] **Step 1: Implement**

Create `app/papers/page.tsx`:
```tsx
import { loadPapers } from "@/lib/content";
import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { IndexCard } from "@/components/index/IndexCard";
import { EmptyState } from "@/components/index/EmptyState";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Papers",
  description: "Formal publications and preprints from Coconut Labs.",
  path: "/papers",
});

export default function PapersPage() {
  const entries = loadPapers();
  return (
    <IndexPageTemplate
      title="Papers"
      subtitle="// formal publications · preprints"
    >
      {entries.length === 0 ? (
        <EmptyState
          caption="// nothing here yet — but the work that becomes papers is happening at github.com/coconut-labs"
          href="https://github.com/coconut-labs"
          linkLabel="github.com/coconut-labs →"
        />
      ) : (
        entries.map((p) => (
          <IndexCard
            key={p.url}
            meta={`${p.date} · ${p.venue}`}
            title={p.title}
            dek={p.authors.join(", ")}
            href={p.url}
            external
          />
        ))
      )}
    </IndexPageTemplate>
  );
}
```

The empty-state caption is the spec §8.2 verbatim wording. Do not paraphrase.

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/papers`. Expected: title + mono subtitle + in-character empty state with link to `github.com/coconut-labs`.
Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/papers/page.tsx
git commit -m "feat(phase-3): /papers page with in-character empty state"
```

---

### Task 8: Build /podcasts page (with empty state)

**Files:**
- Create: `app/podcasts/page.tsx`

- [ ] **Step 1: Implement**

Create `app/podcasts/page.tsx`:
```tsx
import { loadPodcasts } from "@/lib/content";
import { IndexPageTemplate } from "@/components/index/IndexPageTemplate";
import { IndexCard } from "@/components/index/IndexCard";
import { EmptyState } from "@/components/index/EmptyState";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Podcasts",
  description: "Episodes and appearances featuring Coconut Labs.",
  path: "/podcasts",
});

export default function PodcastsPage() {
  const entries = loadPodcasts();
  return (
    <IndexPageTemplate
      title="Podcasts"
      subtitle="// episodes · appearances"
    >
      {entries.length === 0 ? (
        <EmptyState
          caption="// nothing here yet — when there's a recording worth your time, it'll be here"
          href="https://github.com/coconut-labs"
          linkLabel="github.com/coconut-labs →"
        />
      ) : (
        entries.map((p) => (
          <IndexCard
            key={p.url}
            meta={`${p.date} · ${p.show} · ${p.host}`}
            title={p.title}
            dek={p.duration_min ? `${p.duration_min} min` : ""}
            href={p.url}
            external
          />
        ))
      )}
    </IndexPageTemplate>
  );
}
```

The empty-state caption analogously follows the spec §8.2 voice — short, declarative, no banned phrases.

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/podcasts`. Expected: title + mono subtitle + in-character empty state.
Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/podcasts/page.tsx
git commit -m "feat(phase-3): /podcasts page with in-character empty state"
```

---

### Task 9: Build StatusBadge wrapper around Phase 1 Badge

**Files:**
- Create: `components/projects/StatusBadge.tsx`
- Create: `tests/unit/projects/StatusBadge.test.tsx`

- [ ] **Step 1: Write the test**

Create `tests/unit/projects/StatusBadge.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "@/components/projects/StatusBadge";

describe("StatusBadge", () => {
  it("maps 'live' to display string 'Live'", () => {
    render(<StatusBadge status="live" />);
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("maps 'research' to display string 'In research'", () => {
    render(<StatusBadge status="research" />);
    expect(screen.getByText("In research")).toBeInTheDocument();
  });

  it("maps 'archived' to display string 'Archived'", () => {
    render(<StatusBadge status="archived" />);
    expect(screen.getByText("Archived")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, fail**

Run: `pnpm exec vitest run tests/unit/projects/StatusBadge.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/projects/StatusBadge.tsx`:
```tsx
import { Badge } from "@/components/primitives/Badge";
import type { ProjectStatus } from "@/lib/content";

const DISPLAY: Record<ProjectStatus, string> = {
  live: "Live",
  research: "In research",
  archived: "Archived",
};

const TONE: Record<ProjectStatus, "accent" | "accent-2" | "muted"> = {
  live: "accent",
  research: "accent-2",
  archived: "muted",
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Badge tone={TONE[status]}>{DISPLAY[status]}</Badge>;
}
```

If the Phase 1 `Badge` API differs (`tone` vs `variant`, etc.), match it — this wrapper is a thin adapter, not a rewrite.

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/projects/StatusBadge.test.tsx`
Expected: PASS, 3/3 green.

- [ ] **Step 5: Commit**

```bash
git add components/projects/StatusBadge.tsx tests/unit/projects/StatusBadge.test.tsx
git commit -m "feat(phase-3): StatusBadge wraps Badge primitive with project status enum"
```

---

### Task 10: Build ProjectHero component

**Files:**
- Create: `components/projects/ProjectHero.tsx`

- [ ] **Step 1: Implement**

Create `components/projects/ProjectHero.tsx`:
```tsx
import { StatusBadge } from "./StatusBadge";
import type { ProjectStatus } from "@/lib/content";

type Props = {
  name: string;
  tagline: string;
  status: ProjectStatus;
  headlineResult: string;
};

export function ProjectHero({ name, tagline, status, headlineResult }: Props) {
  return (
    <header style={{ paddingBottom: "var(--space-6)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-display-lg)",
            lineHeight: 1.0,
            letterSpacing: "-0.02em",
            color: "var(--ink-0)",
          }}
        >
          {name}
        </h1>
        <StatusBadge status={status} />
      </div>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-h3)",
          color: "var(--ink-1)",
          marginTop: "var(--space-3)",
          maxWidth: "var(--measure)",
        }}
      >
        {tagline}
      </p>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-display-lg)",
          lineHeight: 1.0,
          color: "var(--ink-0)",
          marginTop: "var(--space-6)",
          letterSpacing: "-0.01em",
        }}
      >
        {headlineResult}
      </p>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/projects/ProjectHero.tsx
git commit -m "feat(phase-3): ProjectHero component (wordmark + tagline + status + result)"
```

---

### Task 11: Fill /projects/kvwarden body and build the route

**Files:**
- Modify: `content/projects/kvwarden.mdx`
- Create: `app/projects/kvwarden/page.tsx`

- [ ] **Step 1: Fill the MDX body**

Open `content/projects/kvwarden.mdx`. Append the following body after the frontmatter (placeholders are spec §8.2 verbatim and follow voice; replace with user-provided copy when available):

```mdx
{/* PLACEHOLDER: replace with user-provided copy */}

KVWarden is a tenant-fairness layer that sits between an LLM serving engine
and the GPU it runs on. The problem it solves is concrete: when one tenant
floods a shared inference endpoint, every other tenant's tail latency
collapses. The fix is a token-bucket scheduler that runs ahead of the engine.

On vLLM 0.19.1 / A100, KVWarden brings tenant tail TTFT from 1,585 ms (FIFO,
26× starvation) back to 61.5 ms post-warmup — within 1.14× of solo. The
warden is the boring, load-bearing software the rest of the inference stack
assumes someone else has already written.

The full project — install, benchmarks, RFCs — lives at kvwarden.org.
```

- [ ] **Step 2: Build the route**

Create `app/projects/kvwarden/page.tsx`:
```tsx
import { loadProject } from "@/lib/content";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { buildMetadata } from "@/lib/seo";
import { compileMdx } from "@/lib/mdx"; // Phase 2 helper

export const metadata = buildMetadata({
  title: "KVWarden",
  description: "Tenant fairness on shared inference.",
  path: "/projects/kvwarden",
});

export default async function KvwardenPage() {
  const project = loadProject("kvwarden");
  const Body = await compileMdx(project.content);
  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <ProjectHero
        name={project.name}
        tagline={project.tagline}
        status={project.status}
        headlineResult={project.headline_result}
      />
      <div
        style={{
          maxWidth: "var(--measure)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-body)",
          lineHeight: 1.55,
          color: "var(--ink-0)",
        }}
      >
        <Body />
      </div>
      <p style={{ marginTop: "var(--space-6)" }}>
        <a
          href={project.external_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--fs-ui)",
            color: "var(--ink-0)",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          Read the full project →
        </a>
      </p>
    </article>
  );
}
```

If the Phase 2 MDX helper has a different name (`renderMdx`, `MDXContent`, etc.), match it.

- [ ] **Step 3: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/projects/kvwarden`. Expected:
- Wordmark "KVWarden" in Instrument Serif
- "Live" status badge in accent color
- Tagline in Fraunces
- Headline result number "1.14× of solo, 26× better than FIFO" in massive Geist Mono
- 2–3 paragraphs of body
- "Read the full project →" outbound link to kvwarden.org

Stop server.

- [ ] **Step 4: Commit**

```bash
git add content/projects/kvwarden.mdx app/projects/kvwarden/page.tsx
git commit -m "feat(phase-3): /projects/kvwarden thin v1 with placeholder body"
```

---

### Task 12: Fill /projects/weft body and build the route

**Files:**
- Modify: `content/projects/weft.mdx`
- Create: `app/projects/weft/page.tsx`

- [ ] **Step 1: Fill the MDX body**

Append to `content/projects/weft.mdx`:
```mdx
{/* PLACEHOLDER: replace with user-provided copy */}

A scheduler for Apple Silicon that keeps tenants honest under load.
In research. Watching `mlx-lm#965` for upstream correctness fixes
before we publish.

The probe window runs 2026-05-19 → 2026-06-16. The decision gate at
the end picks one of: promote weft to a primary project, push it
into a Q3 spike, park it, or kill it. Until then, there isn't more
to say in public.
```

- [ ] **Step 2: Build the route**

Create `app/projects/weft/page.tsx` (mirror the kvwarden structure exactly — symmetry matters for the Phase B in-place expansion):
```tsx
import { loadProject } from "@/lib/content";
import { ProjectHero } from "@/components/projects/ProjectHero";
import { buildMetadata } from "@/lib/seo";
import { compileMdx } from "@/lib/mdx";

export const metadata = buildMetadata({
  title: "Weft",
  description: "A scheduler for Apple Silicon that keeps tenants honest under load.",
  path: "/projects/weft",
});

export default async function WeftPage() {
  const project = loadProject("weft");
  const Body = await compileMdx(project.content);
  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <ProjectHero
        name={project.name}
        tagline={project.tagline}
        status={project.status}
        headlineResult={project.headline_result}
      />
      <div
        style={{
          maxWidth: "var(--measure)",
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-body)",
          lineHeight: 1.55,
          color: "var(--ink-0)",
        }}
      >
        <Body />
      </div>
      <p style={{ marginTop: "var(--space-6)" }}>
        <a
          href={project.external_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--font-ui)",
            fontSize: "var(--fs-ui)",
            color: "var(--ink-0)",
            textDecoration: "underline",
            textUnderlineOffset: "4px",
          }}
        >
          Read the full project →
        </a>
      </p>
    </article>
  );
}
```

- [ ] **Step 3: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/projects/weft`. Expected:
- "Weft" wordmark
- "In research" status badge in sage accent
- Tagline
- "In research." as the headline result
- Placeholder paragraphs

Stop server.

- [ ] **Step 4: Commit**

```bash
git add content/projects/weft.mdx app/projects/weft/page.tsx
git commit -m "feat(phase-3): /projects/weft thin v1 with placeholder body"
```

---

### Task 13: Build PrincipleCard primitive

**Files:**
- Create: `components/about/PrincipleCard.tsx`
- Create: `tests/unit/about/PrincipleCard.test.tsx`

- [ ] **Step 1: Test**

Create `tests/unit/about/PrincipleCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrincipleCard } from "@/components/about/PrincipleCard";

describe("PrincipleCard", () => {
  it("renders a serif title and mono body", () => {
    render(<PrincipleCard title="Honest scale" body="// no fake-team plurals." />);
    expect(screen.getByRole("heading", { name: /honest scale/i })).toBeInTheDocument();
    expect(screen.getByText(/no fake-team plurals/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Fail**

Run: `pnpm exec vitest run tests/unit/about/PrincipleCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/about/PrincipleCard.tsx`:
```tsx
type Props = {
  title: string;
  body: string;
};

export function PrincipleCard({ title, body }: Props) {
  return (
    <div style={{ paddingBottom: "var(--space-4)" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-h3)",
          color: "var(--ink-0)",
          lineHeight: 1.2,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-1)",
          marginTop: "var(--space-2)",
          maxWidth: "var(--measure)",
        }}
      >
        {body}
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/about/PrincipleCard.test.tsx`
Expected: PASS, 1/1 green.

- [ ] **Step 5: Commit**

```bash
git add components/about/PrincipleCard.tsx tests/unit/about/PrincipleCard.test.tsx
git commit -m "feat(phase-3): PrincipleCard primitive (serif title + mono body)"
```

---

### Task 14: Build PersonCard primitive

**Files:**
- Create: `components/about/PersonCard.tsx`
- Create: `tests/unit/about/PersonCard.test.tsx`

- [ ] **Step 1: Test**

Create `tests/unit/about/PersonCard.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PersonCard } from "@/components/about/PersonCard";

describe("PersonCard", () => {
  it("renders name, role, bio, photo alt, and socials", () => {
    render(
      <PersonCard
        name="Shrey Patel"
        role="Founder · Engineer · Writer"
        photoSrc="/images/shrey-patel.jpg"
        bio="Builds the boring, load-bearing software between LLMs and the GPUs they run on."
        socials={[
          { label: "GitHub", href: "https://github.com/shreypatel" },
          { label: "X", href: "https://x.com/shreypatel" },
        ]}
      />
    );
    expect(screen.getByRole("heading", { name: /shrey patel/i })).toBeInTheDocument();
    expect(screen.getByText(/founder · engineer · writer/i)).toBeInTheDocument();
    expect(screen.getByAltText(/shrey patel/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "https://github.com/shreypatel");
  });
});
```

- [ ] **Step 2: Fail**

Run: `pnpm exec vitest run tests/unit/about/PersonCard.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implement**

Create `components/about/PersonCard.tsx`:
```tsx
import Image from "next/image";

type Social = { label: string; href: string };

type Props = {
  name: string;
  role: string;
  photoSrc: string;
  bio: string;
  socials: Social[];
};

export function PersonCard({ name, role, photoSrc, bio, socials }: Props) {
  return (
    <article
      style={{
        display: "grid",
        gridTemplateColumns: "200px 1fr",
        gap: "var(--space-5)",
        alignItems: "start",
      }}
    >
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <Image
          src={photoSrc}
          alt={name}
          fill
          sizes="200px"
          style={{ objectFit: "cover", filter: "grayscale(100%)" }}
        />
      </div>
      <div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            lineHeight: 1.1,
          }}
        >
          {name}
        </h2>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            color: "var(--ink-2)",
            marginTop: "var(--space-1)",
          }}
        >
          {role}
        </p>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body)",
            color: "var(--ink-0)",
            marginTop: "var(--space-3)",
            maxWidth: "var(--measure)",
          }}
        >
          {bio}
        </p>
        <ul
          style={{
            listStyle: "none",
            display: "flex",
            gap: "var(--space-3)",
            marginTop: "var(--space-3)",
            padding: 0,
          }}
        >
          {socials.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--fs-mono)",
                  color: "var(--ink-1)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                {s.label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Pass**

Run: `pnpm exec vitest run tests/unit/about/PersonCard.test.tsx`
Expected: PASS, 1/1 green.

- [ ] **Step 5: Commit**

```bash
git add components/about/PersonCard.tsx tests/unit/about/PersonCard.test.tsx
git commit -m "feat(phase-3): PersonCard primitive for People grid"
```

---

### Task 15: Author about-page MDX content (manifesto, how-we-work, founder bio)

**Files:**
- Create: `content/about/manifesto.mdx`
- Create: `content/about/how-we-work.mdx`
- Create: `content/people/shrey-patel.mdx`

If the user delivered drafts in Task 1, use those verbatim. Otherwise, use the placeholders below — all are voice-compliant per spec §8.

- [ ] **Step 1: Write manifesto.mdx**

Create `content/about/manifesto.mdx`:
```mdx
---
title: Manifesto
---

{/* PLACEHOLDER: replace with user-provided copy */}

Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems —
the boring, load-bearing software between an LLM and the GPU it runs on.
KVWarden is the first project. Weft is the second. There will be more.

The shape of the lab is small on purpose. Two people can hold an entire
inference stack in their head between them; a fifty-person team cannot.
The constraint makes the work better. When the lab grows, it will grow
because a problem demands more hands — not because growing is what labs do.

The publishing rhythm is: ship the code, write up what we learned, repeat.
Papers when the work is paper-shaped. Posts when it is post-shaped. No
content calendar.
```

- [ ] **Step 2: Write how-we-work.mdx**

Create `content/about/how-we-work.mdx`:
```mdx
---
title: How we work
---

{/* PLACEHOLDER: replace with user-provided 4–5 principles */}

# Honest scale

// two people, not fifty. no fake-team plurals. when that changes, this page changes.

# Specific numbers

// 53.9 ms is a number. "fast" is a word that doesn't have to be defended.

# Boring infrastructure

// the interesting work is at the boundary; the infrastructure underneath
// should be boring enough to forget about.

# Ship the code first

// papers describe what the code already does. not the other way around.

# Slow web

// no autoplay video. no popups. no captured scroll. the reader's
// attention is not ours to monetize.
```

- [ ] **Step 3: Write founder bios (Shrey + Jay)**

Create `content/people/shrey-patel.mdx`:
```mdx
---
name: Shrey Patel
role: Co-founder · Engineer
photo: /images/shrey-patel.jpg
socials:
  - label: GitHub
    href: https://github.com/ShreyPatel4
  - label: X
    href: https://x.com/shreypatel
  - label: Email
    href: mailto:shreypatel@coconutlabs.org
---

{/* PLACEHOLDER: replace with user-provided bio */}

Engineer and writer. Builds inference middleware between LLMs and the GPUs
they run on. Previously built systems at the edges of trading and ML
infra; currently building Coconut Labs.
```

Create `content/people/jay-patel.mdx`:
```mdx
---
name: Jay Patel
role: Co-founder · Engineer
photo: /images/jay-patel.jpg
socials:
  - label: GitHub
    href: https://github.com/jaypatel15406
  - label: Email
    href: mailto:jaypatel@coconutlabs.org
---

{/* PLACEHOLDER: replace with user-provided bio */}

Engineer focused on inference reliability and tenant fairness on shared
hardware. Co-founder of Coconut Labs.
```

- [ ] **Step 4: Commit**

```bash
git add content/about/ content/people/
git commit -m "feat(phase-3): about-page mdx content (placeholders, voice-compliant)"
```

---

### Task 16: Build /about page

**Files:**
- Create: `app/about/page.tsx`

- [ ] **Step 1: Implement**

Create `app/about/page.tsx`:
```tsx
import { loadFile } from "@/lib/content";
import { compileMdx } from "@/lib/mdx";
import { PrincipleCard } from "@/components/about/PrincipleCard";
import { PersonCard } from "@/components/about/PersonCard";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "About",
  description: "Manifesto, people, and how Coconut Labs works.",
  path: "/about",
});

export default async function AboutPage() {
  const manifesto = loadFile("about/manifesto.mdx");
  const howWeWork = loadFile("about/how-we-work.mdx");
  const founder = loadFile("people/shrey-patel.mdx");

  const ManifestoBody = await compileMdx(manifesto.content);
  const FounderBody = await compileMdx(founder.content);

  // Parse "How we work" headings into PrincipleCard inputs.
  // Each "# Title\n\n// body\n\n" block becomes a card.
  const principles = parseHowWeWork(howWeWork.content);

  const socials = (founder.data.socials as { label: string; href: string }[]) ?? [];

  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      {/* Hero / manifesto */}
      <section>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            color: "var(--ink-0)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
          }}
        >
          About
        </h1>
        <div
          style={{
            marginTop: "var(--space-5)",
            maxWidth: "var(--measure)",
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body)",
            lineHeight: 1.55,
            color: "var(--ink-0)",
          }}
        >
          <ManifestoBody />
        </div>
      </section>

      {/* People */}
      <section style={{ marginTop: "var(--space-8)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            marginBottom: "var(--space-5)",
          }}
        >
          People
        </h2>
        <PersonCard
          name={String(founder.data.name)}
          role={String(founder.data.role)}
          photoSrc={String(founder.data.photo)}
          bio={(<FounderBody />) as unknown as string /* MDX rendered */}
          socials={socials}
        />
      </section>

      {/* How we work */}
      <section style={{ marginTop: "var(--space-8)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            marginBottom: "var(--space-5)",
          }}
        >
          How we work
        </h2>
        <div style={{ display: "grid", gap: "var(--space-5)" }}>
          {principles.map((p) => (
            <PrincipleCard key={p.title} title={p.title} body={p.body} />
          ))}
        </div>
      </section>
    </article>
  );
}

function parseHowWeWork(raw: string): { title: string; body: string }[] {
  const blocks = raw.split(/^# /gm).filter(Boolean);
  return blocks.map((b) => {
    const [titleLine, ...rest] = b.split("\n");
    const title = (titleLine ?? "").trim();
    const body = rest.join("\n").trim();
    return { title, body };
  });
}
```

Note on `bio`: since MDX content is JSX, the simplest v1 ships the founder bio as a plain frontmatter string instead of MDX-compiled. If keeping the MDX route is awkward, switch the founder file's bio into a frontmatter string field and skip `compileMdx` for it. Either way, `PersonCard` accepts a string.

A cleaner v1: change `content/people/*.mdx` to put bio in frontmatter as a `bio:` field, and pass `String(person.data.bio)` to `PersonCard`. Drop the MDX compilation for founder bodies.

- [ ] **Step 2: Apply the cleaner v1 — move bios into frontmatter, add Jay**

Edit `content/people/shrey-patel.mdx` so the bio lives in frontmatter:
```mdx
---
name: Shrey Patel
role: Co-founder · Engineer
photo: /images/shrey-patel.jpg
bio: "Engineer and writer. Builds inference middleware between LLMs and the GPUs they run on. Previously built systems at the edges of trading and ML infra; currently building Coconut Labs."
socials:
  - label: GitHub
    href: https://github.com/ShreyPatel4
  - label: X
    href: https://x.com/shreypatel
  - label: Email
    href: mailto:shreypatel@coconutlabs.org
---
```

Create `content/people/jay-patel.mdx`:
```mdx
---
name: Jay Patel
role: Co-founder · Engineer
photo: /images/jay-patel.jpg
bio: "Engineer focused on inference reliability and tenant fairness on shared hardware. Co-founder of Coconut Labs."
socials:
  - label: GitHub
    href: https://github.com/jaypatel15406
  - label: Email
    href: mailto:jaypatel@coconutlabs.org
---
```

Update `app/about/page.tsx` to load **both** people files and render two `PersonCard`s in a responsive grid:
```tsx
const PEOPLE_SLUGS = ["shrey-patel", "jay-patel"] as const;

const people = await Promise.all(
  PEOPLE_SLUGS.map(async (slug) => {
    const file = loadFile(`people/${slug}.mdx`);
    return { slug, ...file.data } as {
      slug: string;
      name: string;
      role: string;
      photo: string;
      bio: string;
      socials: { label: string; href: string }[];
    };
  })
);

// In the People section:
<div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
  {people.map((person) => (
    <PersonCard
      key={person.slug}
      name={person.name}
      role={person.role}
      photoSrc={person.photo}
      bio={person.bio}
      socials={person.socials}
    />
  ))}
</div>
```

- [ ] **Step 3: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/about`. Expected:
- "About" hero in Instrument Serif
- 3-paragraph manifesto in Fraunces, 62ch measure
- "People" section with **two** cards — Shrey (left/top) and Jay (right/bottom) — each with a grayscale square photo, name, role, bio, and social links
- "How we work" section with 4–5 PrincipleCards (serif title + mono body)

Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/about/page.tsx content/people/shrey-patel.mdx content/people/jay-patel.mdx
git commit -m "feat(phase-3): /about page — manifesto, two-person grid, how we work"
```

---

### Task 17: Build /joinus page

**Files:**
- Create: `app/joinus/page.tsx`

- [ ] **Step 1: Implement**

Create `app/joinus/page.tsx`:
```tsx
import { loadWork } from "@/lib/content";
import { IndexCard } from "@/components/index/IndexCard";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Join us",
  description: "Open repos and how to contribute to Coconut Labs.",
  path: "/joinus",
});

export default function JoinUsPage() {
  const repos = loadWork();
  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <header>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: "var(--ink-0)",
          }}
        >
          Build with us.
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
          The lab is small on purpose. The OSS is not — every project lives in
          the open, every issue is fair game.
        </p>
      </header>

      <section style={{ marginTop: "var(--space-7)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            marginBottom: "var(--space-5)",
          }}
        >
          Open repos
        </h2>
        {repos.map((r) => (
          <IndexCard
            key={r.repo_url}
            meta={`${r.last_updated} · ${r.language} · good first issues coming soon`}
            title={r.name}
            dek={r.description}
            href={r.repo_url}
            external
          />
        ))}
      </section>

      <section style={{ marginTop: "var(--space-7)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            marginBottom: "var(--space-3)",
          }}
        >
          How to contribute
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body)",
            color: "var(--ink-0)",
            maxWidth: "var(--measure)",
          }}
        >
          Read the org-level{" "}
          <a
            href="https://github.com/coconut-labs/.github/blob/main/CONTRIBUTING.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink-0)", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            CONTRIBUTING guide
          </a>
          {" "}and the{" "}
          <a
            href="https://github.com/coconut-labs/.github/blob/main/CODE_OF_CONDUCT.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink-0)", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            code of conduct
          </a>
          . For anything that needs a conversation before code, open a GitHub
          discussion on the relevant repo.
        </p>
      </section>

      <section style={{ marginTop: "var(--space-7)" }}>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h2)",
            color: "var(--ink-0)",
            marginBottom: "var(--space-3)",
          }}
        >
          Why
        </h2>
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--fs-body)",
            color: "var(--ink-0)",
            maxWidth: "var(--measure)",
          }}
        >
          {/* PLACEHOLDER: replace with user-provided copy */}
          Inference is where the real cost of AI lives. The middleware that
          decides which token gets served when is the load-bearing layer most
          stacks pretend doesn't exist. We work in the open because that
          layer is too important to live behind a paywall.
        </p>
      </section>
    </article>
  );
}
```

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/joinus`. Expected:
- "Build with us." hero
- Open repos list (3 cards from work.json)
- "How to contribute" with 2 outbound links
- "Why" paragraph

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/joinus/page.tsx
git commit -m "feat(phase-3): /joinus page (open repos, how to contribute, why)"
```

---

### Task 18: Build /contact page

**Files:**
- Create: `app/contact/page.tsx`

- [ ] **Step 1: Implement**

Create `app/contact/page.tsx`. Three distinct addresses per the 2026-04-26 amendment (defaults shown — adjust per Task 1 lock-in if user reassigned the split):
```tsx
import { buildMetadata } from "@/lib/seo";

const COLLABORATE_EMAIL = "shreypatel@coconutlabs.org";
const PRESS_EMAIL = "jaypatel@coconutlabs.org";
const GENERAL_EMAIL = "info@coconutlabs.org";

export const metadata = buildMetadata({
  title: "Contact",
  description: "How to reach Coconut Labs — collaborate, press, general.",
  path: "/contact",
});

const SECTIONS = [
  {
    heading: "Collaborate",
    body: "Building something at this layer? Have an inference research problem you'd like a second pair of eyes on?",
    address: `${COLLABORATE_EMAIL}?subject=Collaborate`,
  },
  {
    heading: "Press",
    body: "Writing about Coconut Labs or one of the projects? Happy to talk on background.",
    address: `${PRESS_EMAIL}?subject=Press`,
  },
  {
    heading: "General",
    body: "Anything else.",
    address: GENERAL_EMAIL,
  },
];

export default function ContactPage() {
  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-h1)",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: "var(--ink-0)",
        }}
      >
        Contact
      </h1>

      <div style={{ marginTop: "var(--space-7)", display: "grid", gap: "var(--space-6)" }}>
        {SECTIONS.map((s) => (
          <section key={s.heading}>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--fs-h2)",
                color: "var(--ink-0)",
              }}
            >
              {s.heading}
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "var(--fs-body)",
                color: "var(--ink-0)",
                marginTop: "var(--space-2)",
                maxWidth: "var(--measure)",
              }}
            >
              {s.body}
            </p>
            <p style={{ marginTop: "var(--space-3)" }}>
              <a
                href={`mailto:${s.address}`}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--fs-mono)",
                  color: "var(--ink-0)",
                  textDecoration: "underline",
                  textUnderlineOffset: "4px",
                }}
              >
                mailto:{EMAIL}
              </a>
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
```

No form. The spec is explicit on this point — `mailto:` only in v1.

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/contact`. Expected:
- "Contact" hero
- Three sections: Collaborate, Press, General — each with one-sentence framing + a `mailto:` link
- Clicking a mailto opens the system mail client (manual check — won't fire in a headless test)

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/contact/page.tsx
git commit -m "feat(phase-3): /contact page (collaborate · press · general, mailto only)"
```

---

### Task 19: Build ColophonSection primitive

**Files:**
- Create: `components/colophon/ColophonSection.tsx`

- [ ] **Step 1: Implement**

Create `components/colophon/ColophonSection.tsx`:
```tsx
import type { ReactNode } from "react";

type Props = {
  heading: string;
  children: ReactNode;
};

export function ColophonSection({ heading, children }: Props) {
  return (
    <section style={{ paddingBottom: "var(--space-6)" }}>
      <h2
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: "var(--ink-2)",
          marginBottom: "var(--space-3)",
        }}
      >
        {heading}
      </h2>
      <div
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--fs-body)",
          color: "var(--ink-0)",
          maxWidth: "var(--measure)",
        }}
      >
        {children}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/colophon/ColophonSection.tsx
git commit -m "feat(phase-3): ColophonSection primitive"
```

---

### Task 20: Build /colophon page

**Files:**
- Create: `app/colophon/page.tsx`

- [ ] **Step 1: Implement**

Create `app/colophon/page.tsx`:
```tsx
import { ColophonSection } from "@/components/colophon/ColophonSection";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Colophon",
  description: "Fonts, tech stack, and inspirations behind coconutlabs.org.",
  path: "/colophon",
});

export default function ColophonPage() {
  return (
    <article
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-8) var(--gutter)",
      }}
    >
      <header style={{ marginBottom: "var(--space-7)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
            color: "var(--ink-0)",
          }}
        >
          Colophon
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            color: "var(--ink-2)",
            marginTop: "var(--space-2)",
          }}
        >
          // every site has one. here is ours.
        </p>
      </header>

      <ColophonSection heading="Fonts">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>Instrument Serif — display headlines</li>
          <li>Fraunces — body prose</li>
          <li>Geist Sans — UI, navigation, deks</li>
          <li>Geist Mono — data, dates, captions, code</li>
        </ul>
      </ColophonSection>

      <ColophonSection heading="Stack">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>Next.js 15 · React 19 · TypeScript strict</li>
          <li>Tailwind CSS v4 (CSS-first config)</li>
          <li>MDX via @next/mdx · Shiki for syntax highlighting</li>
          <li>Motion (Framer) · Lenis · @react-three/fiber for the home hero</li>
          <li>Vitest · Playwright · axe-core</li>
          <li>Hosted on Vercel · DNS via Cloudflare · analytics by Plausible</li>
        </ul>
      </ColophonSection>

      <ColophonSection heading="Inspirations">
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          <li>Stripe Press — for the warm-paper palette discipline</li>
          <li>ink-and-switch.com — for the editorial-research feel</li>
          <li>Robin Sloan's site — for proving a personal-but-serious voice scales</li>
          <li>Anthropic, Mistral — for showing that lab sites can have weight</li>
        </ul>
      </ColophonSection>

      <ColophonSection heading="Build credits">
        <p>
          Designed and built by Shrey Patel, with Claude as a pair-programming
          partner. The wordmark is hand-drawn. The paper-fold sculpture on the
          home page is a custom R3F scene. The page-tear transition is a custom
          GLSL shader.
        </p>
      </ColophonSection>

      <ColophonSection heading="Source">
        <p>
          <a
            href="https://github.com/coconut-labs/coconutlabs-org"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--ink-0)", textDecoration: "underline", textUnderlineOffset: "4px" }}
          >
            github.com/coconut-labs/coconutlabs-org →
          </a>
        </p>
      </ColophonSection>
    </article>
  );
}
```

- [ ] **Step 2: Visual verify**

Run: `pnpm dev`
Open `http://localhost:3000/colophon`. Expected:
- "Colophon" hero
- 5 sections with mono uppercase headings: Fonts, Stack, Inspirations, Build credits, Source
- Source links out to GitHub

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/colophon/page.tsx
git commit -m "feat(phase-3): /colophon editorial single-page (fonts, stack, inspirations, credits)"
```

---

### Task 21: Write inner-pages e2e suite

**Files:**
- Create: `tests/e2e/inner-pages.spec.ts`

- [ ] **Step 1: Write the suite**

Create `tests/e2e/inner-pages.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const ROUTES: { path: string; expectsText: RegExp }[] = [
  { path: "/work", expectsText: /open source/i },
  { path: "/papers", expectsText: /nothing here yet/i },
  { path: "/podcasts", expectsText: /nothing here yet/i },
  { path: "/joinus", expectsText: /build with us/i },
  { path: "/about", expectsText: /coconut labs is shrey patel and jay patel/i },
  { path: "/contact", expectsText: /collaborate/i },
  { path: "/projects/kvwarden", expectsText: /1\.14× of solo/i },
  { path: "/projects/weft", expectsText: /in research/i },
  { path: "/colophon", expectsText: /every site has one/i },
];

test.describe("inner pages", () => {
  for (const { path, expectsText } of ROUTES) {
    test(`route ${path} renders`, async ({ page }) => {
      const res = await page.goto(path);
      expect(res?.status()).toBe(200);
      await expect(page.getByText(expectsText).first()).toBeVisible();
    });
  }

  test("/contact has 3 mailto links — info, shreypatel, jaypatel", async ({ page }) => {
    await page.goto("/contact");
    const mailtos = page.locator('a[href^="mailto:"]');
    await expect(mailtos).toHaveCount(3);
    await expect(page.locator('a[href^="mailto:shreypatel@coconutlabs.org"]')).toBeVisible();
    await expect(page.locator('a[href^="mailto:jaypatel@coconutlabs.org"]')).toBeVisible();
    await expect(page.locator('a[href^="mailto:info@coconutlabs.org"]')).toBeVisible();
  });

  test("/colophon lists all four fonts", async ({ page }) => {
    await page.goto("/colophon");
    for (const font of ["Instrument Serif", "Fraunces", "Geist Sans", "Geist Mono"]) {
      await expect(page.getByText(font).first()).toBeVisible();
    }
  });

  test("/work cards link out to github.com/coconut-labs", async ({ page }) => {
    await page.goto("/work");
    const externalLinks = page.locator('a[href^="https://github.com/coconut-labs/"]');
    const count = await externalLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
    // every link in the cards should open in a new tab
    for (let i = 0; i < count; i++) {
      await expect(externalLinks.nth(i)).toHaveAttribute("target", "_blank");
    }
  });

  test("/projects/kvwarden has 'Live' badge and outbound CTA", async ({ page }) => {
    await page.goto("/projects/kvwarden");
    await expect(page.getByText("Live").first()).toBeVisible();
    const cta = page.getByRole("link", { name: /read the full project/i });
    await expect(cta).toHaveAttribute("href", "https://kvwarden.org");
  });

  test("/projects/weft has 'In research' badge", async ({ page }) => {
    await page.goto("/projects/weft");
    await expect(page.getByText("In research").first()).toBeVisible();
  });
});
```

- [ ] **Step 2: Run**

Run: `pnpm exec playwright test tests/e2e/inner-pages.spec.ts --project=chromium`
Expected: 14 tests pass (9 route renders + 5 specific assertions).

If any fails, the most likely cause is text-content drift between this plan's placeholders and the user-supplied copy from Task 1. Update the test regex to match the real copy, not the other way around — never water down the assertion.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/inner-pages.spec.ts
git commit -m "test(phase-3): e2e suite for all 9 inner routes"
```

---

### Task 22: Extend a11y suite to cover all new routes

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Extend ROUTES**

Open `tests/e2e/accessibility.spec.ts` (created in Phase 0; Phase 2 may have already extended it with `/research` + a sample `/research/[slug]`). Append the Phase 3 routes to the `ROUTES` array:
```ts
const ROUTES = [
  "/",
  "/this-route-does-not-exist",
  // Phase 2 (already present):
  // "/research",
  // "/research/<sample-slug>",
  // Phase 3:
  "/work",
  "/papers",
  "/podcasts",
  "/joinus",
  "/about",
  "/contact",
  "/projects/kvwarden",
  "/projects/weft",
  "/colophon",
];
```

- [ ] **Step 2: Run**

Run: `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium`
Expected: every route in `ROUTES` passes axe-core WCAG2AA.

Most likely failure mode: contrast on the mono `--ink-2` against `--bg-0`. If a violation appears:
- Identify the failing element (axe will print the selector)
- If it's a token-level issue, bump `--ink-2` darker in `styles/tokens.css`
- If it's a one-off, override that element to use `--ink-1`
- Re-run

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility.spec.ts
git commit -m "test(phase-3): extend axe-core a11y to all inner routes"
```

---

### Task 23: Voice-scan the rendered HTML for banned phrases

**Files:**
- Create: `tests/e2e/voice.spec.ts`

A small but non-trivial guardrail: if user-provided copy or a placeholder accidentally introduces a banned phrase, this test catches it before merge.

- [ ] **Step 1: Write the test**

Create `tests/e2e/voice.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

const BANNED = [
  "we empower",
  "next-generation",
  "innovative",
  "cutting-edge",
  "leverage",
  "unlock",
  "seamless",
  "revolutionary",
  "ai-powered",
  "the future of",
];

const ROUTES = [
  "/",
  "/work",
  "/papers",
  "/podcasts",
  "/joinus",
  "/about",
  "/contact",
  "/projects/kvwarden",
  "/projects/weft",
  "/colophon",
];

test.describe("brand voice — banned phrase scan (spec §8.1)", () => {
  for (const path of ROUTES) {
    test(`route ${path} contains no banned phrases`, async ({ page }) => {
      await page.goto(path);
      const body = (await page.locator("body").innerText()).toLowerCase();
      for (const phrase of BANNED) {
        expect(body, `route ${path} contains banned phrase "${phrase}"`).not.toContain(phrase);
      }
    });
  }
});
```

- [ ] **Step 2: Run**

Run: `pnpm exec playwright test tests/e2e/voice.spec.ts --project=chromium`
Expected: 10 tests pass.

If a test fails, fix the page copy — do not weaken the test. This is the load-bearing voice guard.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/voice.spec.ts
git commit -m "test(phase-3): banned-phrase voice scan across all inner routes"
```

---

### Task 24: Full Phase 3 verification

**Files:** none

- [ ] **Step 1: Run the full pipeline locally**

Run: `pnpm test:all && pnpm build`
Expected: all unit tests green, all e2e tests green (including a11y + voice), build succeeds, no TypeScript errors.

- [ ] **Step 2: Walk through every new route in dev**

Run: `pnpm dev`

Tab through each in turn and confirm:
- `/work` — 3+ cards, all link out to github.com/coconut-labs
- `/papers` — empty state with verbatim spec §8.2 caption + link
- `/podcasts` — empty state
- `/joinus` — "Build with us." hero + open repos + how-to-contribute + why
- `/about` — manifesto + people grid + how-we-work principles
- `/contact` — 3 sections with mailto links
- `/projects/kvwarden` — "KVWarden" + "Live" badge + headline result + body + outbound CTA
- `/projects/weft` — "Weft" + "In research" badge + body + outbound CTA
- `/colophon` — fonts, stack, inspirations, credits, source

For each route:
- Tab through — focus rings visible on every link
- Resize to ~375px wide — layout doesn't break (responsive polish full-pass lands in Phase 5)
- Open DevTools, toggle `prefers-reduced-motion: reduce`, reload — no animations fire

Stop server.

- [ ] **Step 3: Confirm header nav is unchanged**

Visit `/`. Click each header nav item; confirm each lands on a real (non-404) page. Confirm there is no dropdown for Projects (per implicit constraint above).

- [ ] **Step 4: Push to remote (no auth interrupt)**

```bash
git push origin main
```

CI runs automatically. Watch with `gh run watch`.

- [ ] **Step 5: Phase 3 ship-gate met**

Phase 3 definition of done:
- ✅ All 9 inner routes (`/work`, `/papers`, `/podcasts`, `/joinus`, `/about`, `/contact`, `/projects/kvwarden`, `/projects/weft`, `/colophon`) render real content or in-character empty state
- ✅ Shared `IndexPageTemplate` + `IndexCard` + `EmptyState` consumed by 3 index pages
- ✅ Shared `ProjectHero` + `StatusBadge` consumed by 2 project pages
- ✅ `lib/content.ts` extended with `loadWork`, `loadPapers`, `loadPodcasts`, `loadProject` typed loaders
- ✅ JSON manifests live in `content/work/`, `content/papers/`, `content/podcasts/`
- ✅ Founder bio frontmatter + manifesto + how-we-work MDX in `content/about/` and `content/people/`
- ✅ Inner-pages e2e suite green
- ✅ a11y axe-core green on every new route
- ✅ Voice scan green (no banned phrases on any route)
- ✅ CI green on `main`

**Phase 3 is complete. Ready for Phase 4 plan (motion polish: page-tear shader, paper-fold sculpture, cursor layer, in-character 404 polish).**

---

## Self-Review

Spec coverage check (Phase 3 sections of spec §13):
- ✅ `/work` + `content/work/work.json` (Tasks 2, 6)
- ✅ `/papers` + `papers.json` + in-character empty state (Tasks 2, 7)
- ✅ `/podcasts` + `podcasts.json` + in-character empty state (Tasks 2, 8)
- ✅ `/joinus` (Task 17)
- ✅ `/about` — manifesto + people + how-we-work + values folded into how-we-work (Tasks 14, 15, 16)
- ✅ `/contact` — 3 sections, mailto only (Task 18)
- ✅ `/projects/kvwarden` thin v1 (Tasks 9, 10, 11)
- ✅ `/projects/weft` thin v1 (Tasks 9, 10, 12)
- ✅ `/colophon` editorial single page (Tasks 19, 20)
- ✅ Shared `IndexPageTemplate` (Task 5) per spec §5.2
- ✅ Shared `Card` for list pages — implemented as `IndexCard` (Task 4) to avoid colliding with Phase 1's general `Card` primitive
- ✅ Brand voice enforced — placeholders all spec §8.2 verbatim or analogous; voice scan test (Task 23)
- ✅ Status enum (`live` / `research` / `archived`) per spec §9.4 frontmatter

Auth-interrupt points covered:
- ✅ Content auth-interrupt front-loaded (Task 1) — manifesto, founder bio, project taglines/bodies, principles, contact email
- ✅ No GitHub/Vercel/Cloudflare interrupts (those landed in Phase 0)

Implicit constraints called out at top of plan:
- ✅ Header nav unchanged
- ✅ Phase 0 sitemap.ts already covers all 11 routes (no edit)
- ✅ StatusBadge wraps Phase 1's Badge (no duplication)
- ✅ /projects/[slug] is two concrete routes, not a dynamic segment
- ✅ /work is NOT empty in v1
- ✅ Status enum lowercase
- ✅ No remote-push auth task (autonomy preference)

Placeholder scan: every `// PLACEHOLDER` marker in the plan is paired with a spec §8.2 voice-compliant default text, so the executor never ships a voice violation if user copy slips.

Type consistency: `loadWork` / `loadPapers` / `loadPodcasts` / `loadProject` (loaders), `WorkEntry` / `PaperEntry` / `PodcastEntry` / `ProjectFrontmatter` (types), `ProjectStatus` enum, `IndexPageTemplate` / `IndexCard` / `EmptyState` (index primitives), `ProjectHero` / `StatusBadge` (project primitives), `PrincipleCard` / `PersonCard` (about primitives), `ColophonSection` (colophon primitive). Naming is consistent.

Test count expectations:
- Unit (new in Phase 3): 14 tests across 6 files — content loaders (6), EmptyState (2), IndexCard (2), IndexPageTemplate (1), StatusBadge (3), PrincipleCard (1), PersonCard (1) = 16 actually. Phase 0 baseline was 7; Phase 2 likely added ~5–10 for MDX/RSS. Phase 3 brings unit total to roughly 30–35.
- E2E (new in Phase 3): inner-pages.spec.ts (14) + accessibility extension (9 new routes) + voice.spec.ts (10) = ~33 new e2e tests. Combined e2e total roughly 50.

Phase 3 produces a fully navigable site — every route in the sitemap renders content or an in-character empty state. Phase 4 layers motion polish on top; Phase 5 ships.
