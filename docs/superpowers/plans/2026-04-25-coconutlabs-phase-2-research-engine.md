# coconutlabs.org — Phase 2 (Research Engine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Plan 3 of 6.** This plan covers Phase 2 only (Research Engine). Subsequent phases get their own plans:
- `2026-04-25-coconutlabs-phase-0-foundation.md` (committed)
- `2026-04-25-coconutlabs-phase-1-home-and-visual-identity.md` (committed)
- `2026-04-25-coconutlabs-phase-2-research-engine.md` ← this plan
- `…-phase-3-inner-pages.md` (next)
- `…-phase-4-motion-polish.md`
- `…-phase-5-perf-a11y-ship.md`

> **Amended 2026-04-26.** Email convention update: `info@coconutlabs.org` is the default address (was `hello@`). Atom feed `<author><email>` and any test fixtures use `info@`. Author registry recognizes both `shrey-patel` and `jay-patel` slugs (each post still names the actual author(s) per its frontmatter).

**Goal:** Stand up the canonical research surface at `/research` and `/research/[slug]`. MDX-driven posts render with editorial typography (Fraunces body at 62ch measure, Instrument Serif headers, paler `--bg-0`), Shiki server-rendered syntax highlighting, marginalia-on-desktop / footnotes-on-mobile, a 1px scroll-linked reading-progress bar, six MDX primitives (`<Chart>`, `<Figure>`, `<Pullquote>`, `<Footnote>`, `<CodeGroup>`, `<R3FScene>`), Schema.org `ScholarlyArticle` JSON-LD, a real Atom 1.0 RSS feed, per-page `@vercel/og` images, and a print stylesheet. Ships with one real post live: the KVWarden Gate 2-FAIRNESS launch post.

**Architecture:** `@next/mdx` for the MDX pipeline. Content lives in `content/research/*.mdx` with `gray-matter` frontmatter. Server-side MDX serialization via `@mdx-js/loader` with `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, and `@shikijs/rehype` (two themes — `github-light` for default `--bg-0`, `min-light` for the paler `.theme-reading` background). Posts are React Server Components by default — only the reading-progress bar and any `<R3FScene>` instance are client islands, the latter lazy-loaded via `next/dynamic({ ssr: false })`. The Atom feed and OG image route handler share the same content loader as the index/post pages, so a single `lib/content.ts` API serves all four surfaces.

**Tech Stack:** Next.js 15, React 19, TypeScript 5, Tailwind v4, `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `@shikijs/rehype` (Shiki ≥ 1.22), `@vercel/og`, Motion (already installed), Vitest, Playwright.

**Prerequisites:**
- Phase 0 complete and live at `https://coconutlabs.org` (token system, shell, fonts, infra endpoints — including the `/rss.xml` Atom stub)
- Phase 1 complete (home page, hero, manifesto strip, projects strip, ThinRule primitive, PageNumber editorial system, first-load reveal)
- `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`, `shiki` already installed in Phase 0 (Task 3); this plan adds remark/rehype plugins on top
- Working directory: `/Users/shrey/Personal Projects/coconutlabs/`
- `pnpm` installed globally (`npm install -g pnpm`)
- Node 22 LTS

---

## File Structure (Phase 2 deliverables)

```
coconutlabs/
├── app/
│   ├── research/
│   │   ├── page.tsx                              chronological index of posts
│   │   ├── [slug]/
│   │   │   ├── layout.tsx                        .theme-reading wrapper (per-route paler bg)
│   │   │   └── page.tsx                          editorial post template
│   ├── api/og/route.tsx                          @vercel/og edge handler
│   └── rss.xml/route.ts                          MODIFY: replace stub with real Atom feed
├── components/
│   ├── post/
│   │   ├── PostHeader.tsx                        title + dek + date + authors
│   │   ├── PostBody.tsx                          MDX renderer wrapper (62ch measure)
│   │   ├── ProgressBar.tsx                       1px scroll-linked progress bar (client)
│   │   ├── Marginalia.tsx                        desktop margin notes / mobile footnotes
│   │   └── ShareRow.tsx                          copy-link, X, mailto, BibTeX (if doi)
│   └── mdx/
│       ├── components.tsx                        MDX → component map (passed to MDXProvider)
│       ├── Chart.tsx                             static SVG/figure chart wrapper
│       ├── Figure.tsx                            captioned figure with optional credit
│       ├── Pullquote.tsx                         large Instrument Serif pullquote
│       ├── Footnote.tsx                          paired Marginalia note + footer entry
│       ├── CodeGroup.tsx                         tabbed code block group
│       └── R3FScene.tsx                          lazy R3F island (next/dynamic ssr:false)
├── content/
│   └── research/
│       ├── 2026-04-19-tenant-fairness-on-shared-inference.mdx   first real post
│       └── _placeholder/
│           └── 2026-04-10-hello-world.mdx                       seed post for tests
├── lib/
│   ├── content.ts                                EXTEND: getAllPosts(), getPostBySlug(), Frontmatter type
│   ├── mdx.ts                                    MDX serialize + remark/rehype plugin config
│   └── seo.ts                                    EXTEND: scholarlyArticleJsonLd() helper
├── styles/
│   ├── post.css                                  editorial post CSS (62ch measure, marginalia grid)
│   └── print.css                                 @media print stylesheet for /research/[slug]
├── public/
│   └── images/
│       └── posts/                                hero PNGs (KVWarden 26× chart drops here)
├── tests/
│   ├── unit/
│   │   ├── lib/content.test.ts                   EXTEND: getAllPosts, getPostBySlug, frontmatter validation
│   │   └── lib/mdx.test.ts                       MDX serialize roundtrip, plugin config
│   └── e2e/
│       └── research.spec.ts                      index renders, post renders, RSS validates, OG generates
└── next.config.ts                                MODIFY: wrap with @next/mdx
```

**File responsibility boundaries:**
- `lib/content.ts` is the single source of truth for "what posts exist" and "how to load one." Filesystem reads happen here; nothing else touches `content/research/` directly.
- `lib/mdx.ts` owns MDX compile options (remark/rehype plugin lists + Shiki config). Both the post page and the OG route consume this.
- `styles/post.css` owns the editorial post grid (body column at 62ch, gutter for marginalia at ≥1024px). It is the only place that defines the marginalia CSS grid.
- `styles/print.css` is loaded by `app/research/[slug]/layout.tsx` only — never globally — so print rules don't leak to other routes.
- `components/post/*` is post-page chrome. Page-level layout lives in `app/research/[slug]/page.tsx` and composes these.
- `components/mdx/*` is the MDX→component map. Each file caps at ~120 lines (most are well under). `R3FScene` is the only client island that ships JS at runtime.

---

## Tasks

### Task 1: Install Phase 2 dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Verify Phase 1 is committed and clean**

Run: `cd "/Users/shrey/Personal Projects/coconutlabs" && git status`
Expected: working tree clean on `main` (or the active branch), Phase 1 final commit visible in `git log --oneline -1`.

- [ ] **Step 2: Install MDX plugins + Shiki rehype integration**

Run:
```bash
pnpm add remark-gfm@^4 rehype-slug@^6 rehype-autolink-headings@^7 \
  @shikijs/rehype@^1 \
  @types/mdx @types/hast
```

Note: `@next/mdx`, `@mdx-js/loader`, `@mdx-js/react`, `gray-matter`, and `shiki` were already added in Phase 0 (Task 3). This step adds the plugin layer that runs on top.

- [ ] **Step 3: Verify install resolves**

Run: `pnpm install`
Expected: lockfile resolves, no peer-dep errors.

Run: `pnpm exec next --version`
Expected: prints Next.js 15.x version.

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat(phase-2): install mdx plugins + shiki rehype integration"
```

---

### Task 2: Wire @next/mdx into next.config.ts

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Replace next.config.ts**

Replace `next.config.ts` contents with:
```ts
import type { NextConfig } from "next";
import createMdx from "@next/mdx";

const withMdx = createMdx({
  extension: /\.mdx?$/,
});

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
};

export default withMdx(nextConfig);
```

We deliberately do not pass `options.remarkPlugins` / `options.rehypePlugins` here — Phase 2 compiles MDX through `lib/mdx.ts` (a controlled compile pipeline), which gives us a single place to test plugin behavior. The `@next/mdx` wrapper is enabled so that direct imports of `.mdx` files (e.g. for the seed post in tests, or future Phase 3 project pages) work, but research posts are loaded via `lib/content.ts`, not via the import system.

- [ ] **Step 2: Verify build still succeeds**

Run: `pnpm build`
Expected: build completes without errors. Bundle size for `/` should be within 5KB of the Phase 1 baseline (we have not added any client JS yet).

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat(phase-2): enable @next/mdx in next.config"
```

---

### Task 3: Define the Frontmatter type + extend lib/content.ts (TDD)

**Files:**
- Create: `tests/unit/lib/content.test.ts` (extend existing)
- Modify: `lib/content.ts`
- Create: `content/research/_placeholder/2026-04-10-hello-world.mdx`

- [ ] **Step 1: Create a seed test fixture**

The unit tests need a deterministic post on disk. Create `content/research/_placeholder/2026-04-10-hello-world.mdx`:
```mdx
---
title: "Hello world"
dek: "First seed post for tests; not user-facing."
date: 2026-04-10
authors: [shrey-patel]
tags: [meta]
draft: false
---

This is the seed post. It exists so the content loader has something to load in tests.

## A heading

A paragraph with **bold** and `inline code`.

```ts
const x: number = 1;
```
```

The directory `_placeholder/` is excluded from `getAllPosts()` (see Step 4 implementation). It exists so unit tests have a fixture without polluting the real posts list.

- [ ] **Step 2: Extend the content loader test**

The Phase 0 `tests/unit/lib/content.test.ts` already covers `parseFrontmatter` (2 tests). Append the new tests so the file becomes:
```ts
import { describe, it, expect } from "vitest";
import {
  parseFrontmatter,
  getAllPosts,
  getPostBySlug,
  validateFrontmatter,
  type PostFrontmatter,
} from "@/lib/content";

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

describe("validateFrontmatter", () => {
  it("accepts a fully populated frontmatter block", () => {
    const ok = validateFrontmatter({
      title: "T",
      dek: "D",
      date: new Date("2026-04-19"),
      authors: ["shrey-patel"],
      tags: ["x"],
      draft: false,
    });
    expect(ok.title).toBe("T");
    expect(ok.draft).toBe(false);
  });

  it("throws on missing title", () => {
    expect(() => validateFrontmatter({ date: new Date(), authors: ["a"] })).toThrow(/title/);
  });

  it("throws on missing date", () => {
    expect(() => validateFrontmatter({ title: "T", authors: ["a"] })).toThrow(/date/);
  });

  it("throws on missing authors", () => {
    expect(() => validateFrontmatter({ title: "T", date: new Date() })).toThrow(/authors/);
  });

  it("treats draft as false when omitted", () => {
    const ok = validateFrontmatter({
      title: "T",
      date: new Date(),
      authors: ["a"],
    });
    expect(ok.draft).toBe(false);
  });
});

describe("getAllPosts", () => {
  it("returns posts sorted newest-first", () => {
    const posts = getAllPosts({ includePlaceholders: true });
    expect(posts.length).toBeGreaterThanOrEqual(1);
    for (let i = 1; i < posts.length; i++) {
      expect(posts[i - 1].date.getTime()).toBeGreaterThanOrEqual(posts[i].date.getTime());
    }
  });

  it("excludes drafts in production-like calls", () => {
    const posts = getAllPosts({ includePlaceholders: true });
    expect(posts.every((p) => p.draft === false)).toBe(true);
  });

  it("excludes _placeholder/ posts by default", () => {
    const posts = getAllPosts();
    expect(posts.every((p) => !p.slug.startsWith("_"))).toBe(true);
  });
});

describe("getPostBySlug", () => {
  it("returns null for an unknown slug", () => {
    expect(getPostBySlug("not-a-real-post")).toBeNull();
  });

  it("returns the seed post by slug", () => {
    const post = getPostBySlug("2026-04-10-hello-world", { includePlaceholders: true });
    expect(post).not.toBeNull();
    expect(post?.frontmatter.title).toBe("Hello world");
    expect(post?.body).toContain("seed post");
  });
});
```

- [ ] **Step 3: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: FAIL with "validateFrontmatter is not exported" / "getAllPosts is not exported" / "getPostBySlug is not exported".

- [ ] **Step 4: Implement the loader extensions**

Replace `lib/content.ts` contents with:
```ts
import matter from "gray-matter";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const CONTENT_ROOT = join(process.cwd(), "content");
const RESEARCH_ROOT = join(CONTENT_ROOT, "research");

export type Frontmatter = Record<string, unknown>;

export type PostFrontmatter = {
  title: string;
  dek?: string;
  date: Date;
  authors: string[];
  tags?: string[];
  hero?: string;
  draft: boolean;
  doi?: string | null;
};

export type Post = {
  slug: string;
  frontmatter: PostFrontmatter;
  body: string;
};

export function parseFrontmatter(raw: string): { data: Frontmatter; content: string } {
  const parsed = matter(raw);
  return { data: parsed.data, content: parsed.content };
}

export function loadFile(relativePath: string): { data: Frontmatter; content: string } {
  const full = join(CONTENT_ROOT, relativePath);
  const raw = readFileSync(full, "utf-8");
  return parseFrontmatter(raw);
}

export function validateFrontmatter(input: Frontmatter): PostFrontmatter {
  if (typeof input.title !== "string" || input.title.length === 0) {
    throw new Error("frontmatter: missing required field 'title'");
  }
  if (!(input.date instanceof Date) || Number.isNaN(input.date.getTime())) {
    throw new Error("frontmatter: missing or invalid required field 'date'");
  }
  if (!Array.isArray(input.authors) || input.authors.length === 0) {
    throw new Error("frontmatter: missing required field 'authors' (must be a non-empty array)");
  }
  return {
    title: input.title,
    dek: typeof input.dek === "string" ? input.dek : undefined,
    date: input.date,
    authors: input.authors as string[],
    tags: Array.isArray(input.tags) ? (input.tags as string[]) : undefined,
    hero: typeof input.hero === "string" ? input.hero : undefined,
    draft: input.draft === true,
    doi: typeof input.doi === "string" ? input.doi : null,
  };
}

type GetPostsOpts = { includePlaceholders?: boolean };

function walkMdx(dir: string, includePlaceholders: boolean): string[] {
  const entries = readdirSync(dir);
  const out: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (!includePlaceholders && entry.startsWith("_")) continue;
      out.push(...walkMdx(full, includePlaceholders));
    } else if (entry.endsWith(".mdx") || entry.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

function fileToPost(filePath: string): Post {
  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = parseFrontmatter(raw);
  const frontmatter = validateFrontmatter(data);
  const slug = filePath
    .replace(RESEARCH_ROOT + "/", "")
    .replace(/\.mdx?$/, "");
  return { slug, frontmatter, body: content };
}

export function getAllPosts(opts: GetPostsOpts = {}): Post[] {
  const includePlaceholders = opts.includePlaceholders === true;
  const files = walkMdx(RESEARCH_ROOT, includePlaceholders);
  const posts = files
    .map(fileToPost)
    .filter((p) => p.frontmatter.draft === false);
  posts.sort((a, b) => b.frontmatter.date.getTime() - a.frontmatter.date.getTime());
  return posts;
}

export function getPostBySlug(slug: string, opts: GetPostsOpts = {}): Post | null {
  const all = getAllPosts(opts);
  return all.find((p) => p.slug === slug || p.slug.endsWith("/" + slug)) ?? null;
}
```

A note on slugs: the seed post lives at `content/research/_placeholder/2026-04-10-hello-world.mdx`, so its raw `slug` is `_placeholder/2026-04-10-hello-world`. The `getPostBySlug` lookup matches either the full slug or the trailing path component, so callers can pass `"2026-04-10-hello-world"` and still find it. Real posts under `content/research/` have flat slugs (e.g. `"2026-04-19-tenant-fairness-on-shared-inference"`).

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/content.test.ts`
Expected: PASS, 12/12 tests green (2 original + 10 new).

- [ ] **Step 6: Commit**

```bash
git add lib/content.ts tests/unit/lib/content.test.ts content/research/_placeholder/
git commit -m "feat(phase-2): add post loader, frontmatter validator, seed fixture"
```

---

### Task 4: Build lib/mdx.ts (Shiki + remark/rehype plugin config) (TDD)

**Files:**
- Create: `tests/unit/lib/mdx.test.ts`
- Create: `lib/mdx.ts`

- [ ] **Step 1: Write the MDX serialize test**

Create `tests/unit/lib/mdx.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { compileMdxToHtml } from "@/lib/mdx";

describe("compileMdxToHtml", () => {
  it("compiles a simple paragraph", async () => {
    const html = await compileMdxToHtml("Hello, *world*.");
    expect(html).toContain("<p>");
    expect(html).toContain("<em>world</em>");
  });

  it("renders GFM tables (remark-gfm)", async () => {
    const md = `| a | b |\n|---|---|\n| 1 | 2 |`;
    const html = await compileMdxToHtml(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("adds id attributes to headings (rehype-slug)", async () => {
    const html = await compileMdxToHtml("## My Heading");
    expect(html).toMatch(/<h2[^>]*id="my-heading"/);
  });

  it("wraps headings in autolink anchors (rehype-autolink-headings)", async () => {
    const html = await compileMdxToHtml("## My Heading");
    expect(html).toMatch(/<a[^>]*href="#my-heading"/);
  });

  it("highlights code blocks with shiki (server-side)", async () => {
    const md = "```ts\nconst x: number = 1;\n```";
    const html = await compileMdxToHtml(md);
    // Shiki emits <pre class="shiki ..."> wrapping styled <span>s
    expect(html).toMatch(/class="shiki/);
    expect(html).toMatch(/<span style="color/);
  });

  it("uses two themes for the Shiki output (default + reading)", async () => {
    const md = "```ts\nconst x = 1;\n```";
    const html = await compileMdxToHtml(md);
    // @shikijs/rehype with `themes:` emits CSS vars for both themes
    expect(html).toMatch(/--shiki-(light|default)/);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/mdx.test.ts`
Expected: FAIL with "Cannot find module '@/lib/mdx'".

- [ ] **Step 3: Implement lib/mdx.ts**

Create `lib/mdx.ts`:
```ts
import { compile } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeShiki from "@shikijs/rehype";

/**
 * MDX compile options shared by the post page, the RSS feed (for excerpts),
 * and the OG image route. Single source of truth for plugin config.
 *
 * Two Shiki themes are emitted as CSS variables:
 *   - `light`  → applied on default `--bg-0` (#ECE6D6)
 *   - `reading` → applied on `.theme-reading` `--bg-0` (#F4EFE2)
 *
 * The post layout sets `--shiki-default` / `--shiki-reading` from these via
 * styles/post.css so code blocks adapt to the route's background.
 */
export const mdxCompileOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [
    rehypeSlug,
    [
      rehypeAutolinkHeadings,
      {
        behavior: "wrap" as const,
        properties: { className: ["heading-anchor"] },
      },
    ],
    [
      rehypeShiki,
      {
        themes: { light: "github-light", reading: "min-light" },
        defaultColor: "light",
      },
    ],
  ],
} as const;

/**
 * Compile MDX/Markdown source to a static HTML string.
 *
 * Used by the RSS feed (excerpt rendering) and tests. The post page itself
 * uses Next's MDX RSC pipeline — see app/research/[slug]/page.tsx — which
 * applies the same plugin list so output is byte-for-byte identical.
 */
export async function compileMdxToHtml(source: string): Promise<string> {
  const compiled = await compile(source, {
    outputFormat: "function-body",
    remarkPlugins: mdxCompileOptions.remarkPlugins,
    rehypePlugins: mdxCompileOptions.rehypePlugins as never,
  });

  // For tests + RSS we want HTML, not a JSX module. Re-compile with the rehype
  // chain only (no JSX pass) by going through unified directly.
  const { unified } = await import("unified");
  const remarkParse = (await import("remark-parse")).default;
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;

  const file = await unified()
    .use(remarkParse)
    .use(mdxCompileOptions.remarkPlugins[0])
    .use(remarkRehype)
    .use(mdxCompileOptions.rehypePlugins[0] as never)
    .use(...(mdxCompileOptions.rehypePlugins[1] as [never, never]))
    .use(...(mdxCompileOptions.rehypePlugins[2] as [never, never]))
    .use(rehypeStringify)
    .process(source);

  // Touch `compiled` so TS doesn't complain — the JSX path is exercised by
  // the post page's RSC-rendered MDX, not this helper.
  void compiled;

  return String(file);
}
```

- [ ] **Step 4: Install the unified packages used by compileMdxToHtml**

The HTML helper above needs `unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`. They are transitive dependencies of `@mdx-js/mdx` and `remark-gfm`, but pinning them directly avoids surprise breakage:
```bash
pnpm add unified@^11 remark-parse@^11 remark-rehype@^11 rehype-stringify@^10
```

- [ ] **Step 5: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/mdx.test.ts`
Expected: PASS, 6/6 tests green.

- [ ] **Step 6: Commit**

```bash
git add lib/mdx.ts tests/unit/lib/mdx.test.ts package.json pnpm-lock.yaml
git commit -m "feat(phase-2): add mdx compile pipeline (gfm + slug + autolink + shiki)"
```

---

### Task 5: Add Schema.org ScholarlyArticle JSON-LD helper to lib/seo.ts (TDD)

**Files:**
- Modify: `tests/unit/lib/seo.test.ts`
- Modify: `lib/seo.ts`

- [ ] **Step 1: Extend the seo test**

The Phase 0 `tests/unit/lib/seo.test.ts` covers `buildMetadata` (2 tests). Append:
```ts
import { scholarlyArticleJsonLd } from "@/lib/seo";

describe("scholarlyArticleJsonLd", () => {
  it("emits a ScholarlyArticle with required fields", () => {
    const ld = scholarlyArticleJsonLd({
      title: "Tenant fairness on shared inference",
      abstract: "How we got from 523× starvation to 1.14× of solo on a single A100.",
      datePublished: new Date("2026-04-19"),
      authors: ["Shrey Patel"],
    });
    expect(ld["@context"]).toBe("https://schema.org");
    expect(ld["@type"]).toBe("ScholarlyArticle");
    expect(ld.headline).toBe("Tenant fairness on shared inference");
    expect(ld.datePublished).toBe("2026-04-19");
    expect(ld.author).toEqual([{ "@type": "Person", name: "Shrey Patel" }]);
    expect(ld.publisher).toEqual({ "@type": "Organization", name: "Coconut Labs" });
    expect(ld.abstract).toContain("523×");
  });

  it("supports multiple authors", () => {
    const ld = scholarlyArticleJsonLd({
      title: "T",
      datePublished: new Date("2026-01-01"),
      authors: ["A B", "C D"],
    });
    expect(ld.author).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run test, verify it fails**

Run: `pnpm exec vitest run tests/unit/lib/seo.test.ts`
Expected: FAIL — `scholarlyArticleJsonLd` not exported.

- [ ] **Step 3: Extend lib/seo.ts**

Append to `lib/seo.ts` (keeping the existing `buildMetadata` export intact):
```ts
export type ScholarlyArticleInput = {
  title: string;
  abstract?: string;
  datePublished: Date;
  authors: string[];
};

export type ScholarlyArticleLd = {
  "@context": "https://schema.org";
  "@type": "ScholarlyArticle";
  headline: string;
  datePublished: string;
  author: { "@type": "Person"; name: string }[];
  publisher: { "@type": "Organization"; name: string };
  abstract?: string;
};

export function scholarlyArticleJsonLd(input: ScholarlyArticleInput): ScholarlyArticleLd {
  return {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: input.title,
    datePublished: input.datePublished.toISOString().slice(0, 10),
    author: input.authors.map((name) => ({ "@type": "Person", name })),
    publisher: { "@type": "Organization", name: "Coconut Labs" },
    ...(input.abstract ? { abstract: input.abstract } : {}),
  };
}
```

- [ ] **Step 4: Run test, verify it passes**

Run: `pnpm exec vitest run tests/unit/lib/seo.test.ts`
Expected: PASS, 4/4 green (2 original + 2 new).

- [ ] **Step 5: Commit**

```bash
git add lib/seo.ts tests/unit/lib/seo.test.ts
git commit -m "feat(phase-2): add scholarlyArticleJsonLd helper for post markup"
```

---

### Task 6: Build the editorial post CSS (62ch measure + marginalia grid)

**Files:**
- Create: `styles/post.css`

- [ ] **Step 1: Create styles/post.css**

Create `styles/post.css`:
```css
/*
 * Editorial post stylesheet. Loaded by app/research/[slug]/layout.tsx.
 * Defines the 62ch body measure and the marginalia gutter on ≥1024px.
 */

.post-shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: var(--space-5);
  max-width: var(--container-max);
  margin: 0 auto;
  padding: var(--space-8) var(--gutter);
}

@media (min-width: 1024px) {
  .post-shell {
    grid-template-columns: minmax(0, 1fr) 240px;
  }
}

.post-body {
  font-family: var(--font-body);
  font-size: var(--fs-body);
  line-height: 1.55;
  color: var(--ink-0);
  max-width: var(--measure);
}

.post-body h1,
.post-body h2,
.post-body h3 {
  font-family: var(--font-display);
  letter-spacing: -0.015em;
  margin-top: var(--space-6);
  margin-bottom: var(--space-3);
}

.post-body h2 { font-size: var(--fs-h2); line-height: 1.1; }
.post-body h3 { font-size: var(--fs-h3); line-height: 1.3; font-family: var(--font-ui); font-weight: 600; }

.post-body p,
.post-body ul,
.post-body ol,
.post-body blockquote {
  margin-top: var(--space-3);
}

.post-body a {
  color: var(--ink-0);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: var(--rule);
  transition: text-decoration-color var(--dur-micro) var(--ease-out);
}
.post-body a:hover { text-decoration-color: var(--accent); }

.post-body code {
  font-family: var(--font-mono);
  font-size: 0.92em;
  background-color: var(--bg-2);
  padding: 0.1em 0.35em;
  border-radius: 2px;
}

.post-body pre {
  margin-top: var(--space-3);
  padding: var(--space-3);
  background-color: var(--bg-2);
  border-radius: 4px;
  overflow-x: auto;
  font-size: 14px;
  line-height: 1.5;
}

.post-body pre code {
  background: none;
  padding: 0;
  font-size: inherit;
}

/* Shiki dual-theme switch: pick the right CSS var for the current bg variant. */
.post-body pre code span { color: var(--shiki-light); }
.theme-reading .post-body pre code span { color: var(--shiki-reading); }

.post-body blockquote {
  border-left: 2px solid var(--rule);
  padding-left: var(--space-3);
  color: var(--ink-1);
  font-style: italic;
}

.post-body table {
  margin-top: var(--space-3);
  border-collapse: collapse;
  font-family: var(--font-ui);
  font-size: var(--fs-ui);
}
.post-body th,
.post-body td {
  padding: var(--space-1) var(--space-2);
  border-bottom: 1px solid var(--rule);
  text-align: left;
}

.post-body .heading-anchor {
  text-decoration: none;
  color: inherit;
}
.post-body .heading-anchor:hover::before {
  content: "§ ";
  color: var(--ink-2);
  font-family: var(--font-mono);
  margin-left: -1.25em;
}

/* Marginalia column (desktop only). On <1024px the Marginalia component
   inlines the note as a footnote-style block; see components/post/Marginalia.tsx. */
.post-marginalia {
  display: none;
}
@media (min-width: 1024px) {
  .post-marginalia {
    display: block;
    font-family: var(--font-ui);
    font-size: 13px;
    line-height: 1.45;
    color: var(--ink-1);
  }
  .post-marginalia .note {
    margin-bottom: var(--space-3);
    padding-left: var(--space-2);
    border-left: 1px solid var(--rule);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/post.css
git commit -m "feat(phase-2): add editorial post stylesheet (62ch + marginalia grid)"
```

---

### Task 7: Build the print stylesheet

**Files:**
- Create: `styles/print.css`

- [ ] **Step 1: Create styles/print.css**

Per spec §6.7. Create `styles/print.css`:
```css
@media print {
  /* Strip nav chrome */
  header,
  footer,
  .post-progress,
  [data-no-print="true"] {
    display: none !important;
  }

  @page {
    margin: 1in 0.75in;
    @bottom-right { content: counter(page) " of " counter(pages); }
    @top-left { content: "Coconut Labs · coconutlabs.org"; font-family: monospace; font-size: 9pt; color: #555; }
  }

  html, body {
    background: white !important;
    color: black !important;
    font-family: "Fraunces", Georgia, serif;
    font-size: 11pt;
    line-height: 1.4;
  }

  .post-shell {
    display: block;
    max-width: none;
    padding: 0;
  }

  .post-body {
    max-width: none;
  }

  .post-body h1,
  .post-body h2,
  .post-body h3 {
    font-family: "Instrument Serif", Georgia, serif;
    page-break-after: avoid;
  }

  .post-body pre,
  .post-body figure,
  .post-body table {
    page-break-inside: avoid;
  }

  /* Spell out URLs next to link text. */
  .post-body a[href^="http"]::after {
    content: " (" attr(href) ")";
    font-family: monospace;
    font-size: 9pt;
    color: #555;
    word-break: break-all;
  }

  /* Marginalia notes collapse to in-flow footnotes. */
  .post-marginalia {
    display: block;
    border-top: 1px solid #ccc;
    margin-top: 1em;
    padding-top: 0.5em;
    font-size: 9pt;
  }
  .post-marginalia .note {
    margin-bottom: 0.5em;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add styles/print.css
git commit -m "feat(phase-2): add print stylesheet for /research/[slug]"
```

---

### Task 8: Build the ProgressBar component (client island)

**Files:**
- Create: `components/post/ProgressBar.tsx`

- [ ] **Step 1: Implement ProgressBar**

Create `components/post/ProgressBar.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";

/**
 * 1px reading-progress bar fixed to the top of the viewport on /research/[slug].
 * Scroll-linked, no JS-driven animation frame loop — uses passive scroll +
 * direct style writes (bar width). Respects prefers-reduced-motion by skipping
 * the transition (the bar still updates, just without easing).
 */
export function ProgressBar() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      const next = total > 0 ? Math.min(100, Math.max(0, (window.scrollY / total) * 100)) : 0;
      setPct(next);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="post-progress"
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "1px",
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          backgroundColor: "var(--accent)",
          transition: "width 80ms linear",
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/post/ProgressBar.tsx
git commit -m "feat(phase-2): add reading-progress bar client island"
```

---

### Task 9: Build the Marginalia component

**Files:**
- Create: `components/post/Marginalia.tsx`

- [ ] **Step 1: Implement Marginalia**

Create `components/post/Marginalia.tsx`:
```tsx
import type { ReactNode } from "react";

/**
 * Marginalia rendering. On ≥1024px the post layout grid reserves a 240px
 * gutter (see styles/post.css `.post-shell`); this component renders into that
 * gutter as a stack of `.note` blocks. On <1024px the gutter collapses and the
 * notes flow inline as footnote-style blocks.
 */
export function Marginalia({
  notes,
}: {
  notes: { id: string; children: ReactNode }[];
}) {
  if (notes.length === 0) return null;
  return (
    <aside className="post-marginalia" aria-label="Marginalia">
      {notes.map((n) => (
        <div key={n.id} id={`note-${n.id}`} className="note">
          {n.children}
        </div>
      ))}
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/post/Marginalia.tsx
git commit -m "feat(phase-2): add marginalia component (desktop gutter / mobile inline)"
```

---

### Task 10: Build the PostHeader component

**Files:**
- Create: `components/post/PostHeader.tsx`

- [ ] **Step 1: Implement PostHeader**

Create `components/post/PostHeader.tsx`:
```tsx
import type { PostFrontmatter } from "@/lib/content";

const AUTHOR_LABELS: Record<string, string> = {
  "shrey-patel": "Shrey Patel",
  "jay-patel": "Jay Patel",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatAuthors(authors: string[]): string {
  return authors.map((slug) => AUTHOR_LABELS[slug] ?? slug).join(" · ");
}

export function PostHeader({ frontmatter }: { frontmatter: PostFrontmatter }) {
  return (
    <header style={{ marginBottom: "var(--space-6)" }}>
      <p
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--fs-mono)",
          color: "var(--ink-2)",
          marginBottom: "var(--space-2)",
        }}
      >
        {formatDate(frontmatter.date)} · {formatAuthors(frontmatter.authors)}
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--fs-h1)",
          lineHeight: 1.05,
          letterSpacing: "-0.015em",
          color: "var(--ink-0)",
        }}
      >
        {frontmatter.title}
      </h1>
      {frontmatter.dek ? (
        <p
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "20px",
            lineHeight: 1.4,
            color: "var(--ink-1)",
            marginTop: "var(--space-3)",
            maxWidth: "var(--measure)",
          }}
        >
          {frontmatter.dek}
        </p>
      ) : null}
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/post/PostHeader.tsx
git commit -m "feat(phase-2): add post header (date, authors, title, dek)"
```

---

### Task 11: Build the ShareRow component

**Files:**
- Create: `components/post/ShareRow.tsx`

- [ ] **Step 1: Implement ShareRow**

Create `components/post/ShareRow.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Link as LinkIcon, Copy, Mail } from "lucide-react";

type Props = {
  title: string;
  url: string;
  authors: string[];
  date: Date;
  doi: string | null;
};

function buildBibtex({ title, authors, date, doi, url }: Omit<Props, "url"> & { url: string }): string {
  const year = date.getFullYear();
  const firstAuthor = (authors[0] ?? "anon").split("-").pop() ?? "anon";
  const key = `${firstAuthor}${year}${title.split(/\s+/)[0]?.toLowerCase() ?? "post"}`;
  const fields = [
    `  title    = {${title}}`,
    `  author   = {${authors.join(" and ")}}`,
    `  year     = {${year}}`,
    `  url      = {${url}}`,
    doi ? `  doi      = {${doi}}` : null,
    `  publisher = {Coconut Labs}`,
  ].filter(Boolean);
  return `@misc{${key},\n${fields.join(",\n")}\n}`;
}

export function ShareRow({ title, url, authors, date, doi }: Props) {
  const [copied, setCopied] = useState<"link" | "bibtex" | null>(null);

  const copy = async (text: string, kind: "link" | "bibtex") => {
    await navigator.clipboard.writeText(text);
    setCopied(kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const mailto = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;

  return (
    <nav
      aria-label="Share this post"
      style={{
        display: "flex",
        gap: "var(--space-3)",
        alignItems: "center",
        marginTop: "var(--space-5)",
        paddingTop: "var(--space-3)",
        borderTop: "1px solid var(--rule)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--fs-mono)",
        color: "var(--ink-1)",
      }}
    >
      <button
        type="button"
        onClick={() => copy(url, "link")}
        style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
      >
        <LinkIcon size={14} aria-hidden /> {copied === "link" ? "copied" : "copy link"}
      </button>
      <a href={tweetUrl} target="_blank" rel="noopener noreferrer" style={{ color: "inherit" }}>
        post on X
      </a>
      <a href={mailto} style={{ color: "inherit", display: "inline-flex", gap: 6, alignItems: "center" }}>
        <Mail size={14} aria-hidden /> email
      </a>
      {doi ? (
        <button
          type="button"
          onClick={() => copy(buildBibtex({ title, authors, date, doi, url }), "bibtex")}
          style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "none", border: "none", cursor: "pointer", color: "inherit" }}
        >
          <Copy size={14} aria-hidden /> {copied === "bibtex" ? "copied" : "copy bibtex"}
        </button>
      ) : null}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/post/ShareRow.tsx
git commit -m "feat(phase-2): add share row (copy-link, x, mailto, bibtex if doi)"
```

---

### Task 12: Build the MDX component map + primitives

**Files:**
- Create: `components/mdx/components.tsx`
- Create: `components/mdx/Chart.tsx`
- Create: `components/mdx/Figure.tsx`
- Create: `components/mdx/Pullquote.tsx`
- Create: `components/mdx/Footnote.tsx`
- Create: `components/mdx/CodeGroup.tsx`
- Create: `components/mdx/R3FScene.tsx`

- [ ] **Step 1: Create the MDX → component map**

Create `components/mdx/components.tsx`:
```tsx
import type { MDXComponents } from "mdx/types";
import { Chart } from "./Chart";
import { Figure } from "./Figure";
import { Pullquote } from "./Pullquote";
import { Footnote } from "./Footnote";
import { CodeGroup } from "./CodeGroup";
import { R3FScene } from "./R3FScene";

export const mdxComponents: MDXComponents = {
  Chart,
  Figure,
  Pullquote,
  Footnote,
  CodeGroup,
  R3FScene,
};
```

- [ ] **Step 2: Implement Figure**

Create `components/mdx/Figure.tsx`:
```tsx
import type { ReactNode } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  caption?: ReactNode;
  credit?: string;
  width?: number;
  height?: number;
};

export function Figure({ src, alt, caption, credit, width = 1200, height = 700 }: Props) {
  return (
    <figure style={{ margin: "var(--space-5) 0" }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{ width: "100%", height: "auto", border: "1px solid var(--rule)" }}
      />
      {caption || credit ? (
        <figcaption
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--ink-2)",
            marginTop: "var(--space-1)",
          }}
        >
          {caption}
          {caption && credit ? " · " : ""}
          {credit ? <span>credit: {credit}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 3: Implement Chart**

Create `components/mdx/Chart.tsx`:
```tsx
import type { ReactNode } from "react";

/**
 * Static chart wrapper. v1 wraps a child SVG/Canvas with a caption + frame so
 * authors can drop hand-rolled or D3-rendered SVG into a post and get the
 * editorial frame for free. v2 may add `data:` prop for declarative D3 charts.
 */
export function Chart({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure
      style={{
        margin: "var(--space-5) 0",
        padding: "var(--space-4)",
        backgroundColor: "var(--bg-1)",
        border: "1px solid var(--rule)",
      }}
    >
      <div>{children}</div>
      {caption ? (
        <figcaption
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--ink-2)",
            marginTop: "var(--space-2)",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

- [ ] **Step 4: Implement Pullquote**

Create `components/mdx/Pullquote.tsx`:
```tsx
import type { ReactNode } from "react";

export function Pullquote({ children, by }: { children: ReactNode; by?: string }) {
  return (
    <blockquote
      style={{
        margin: "var(--space-6) 0",
        fontFamily: "var(--font-display)",
        fontSize: "clamp(24px, 3vw, 32px)",
        lineHeight: 1.2,
        letterSpacing: "-0.01em",
        color: "var(--ink-0)",
        borderLeft: "none",
        paddingLeft: 0,
        fontStyle: "normal",
      }}
    >
      <p style={{ marginTop: 0 }}>{children}</p>
      {by ? (
        <cite
          style={{
            display: "block",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            color: "var(--ink-2)",
            marginTop: "var(--space-2)",
            fontStyle: "normal",
          }}
        >
          — {by}
        </cite>
      ) : null}
    </blockquote>
  );
}
```

- [ ] **Step 5: Implement Footnote**

Create `components/mdx/Footnote.tsx`:
```tsx
import type { ReactNode } from "react";

/**
 * Inline footnote marker. The matching note body is rendered in the marginalia
 * column on desktop and inline at the bottom on mobile (see Marginalia + post.css).
 *
 * Usage in MDX:
 *   <Footnote id="1">A short note that appears in the margin.</Footnote>
 *
 * The post page collects all <Footnote/> children at render time and passes them
 * into <Marginalia>; for simplicity in v1, the marker shows the id and links
 * to the matching `#note-{id}` anchor.
 */
export function Footnote({ id, children }: { id: string; children: ReactNode }) {
  return (
    <>
      <sup style={{ fontFamily: "var(--font-mono)", fontSize: "0.7em" }}>
        <a
          href={`#note-${id}`}
          aria-describedby={`note-${id}`}
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          [{id}]
        </a>
      </sup>
      {/* Hidden render of body for screen readers + print-mode collection. */}
      <span data-footnote-body={id} style={{ display: "none" }}>
        {children}
      </span>
    </>
  );
}
```

- [ ] **Step 6: Implement CodeGroup**

Create `components/mdx/CodeGroup.tsx`:
```tsx
"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";

/**
 * Tabbed group of `<pre>` blocks. Each direct child should be a `<pre>`-like
 * element with a `data-label` prop indicating the tab name (e.g. "ts", "py").
 *
 *   <CodeGroup>
 *     <pre data-label="ts">{...}</pre>
 *     <pre data-label="py">{...}</pre>
 *   </CodeGroup>
 */
export function CodeGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children).filter(isValidElement) as React.ReactElement<{
    "data-label"?: string;
  }>[];
  const labels = items.map((c, i) => c.props["data-label"] ?? `tab ${i + 1}`);
  const [active, setActive] = useState(0);

  return (
    <div style={{ margin: "var(--space-3) 0" }}>
      <div role="tablist" style={{ display: "flex", gap: "var(--space-1)", marginBottom: "var(--space-1)" }}>
        {labels.map((label, i) => (
          <button
            key={label + i}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              padding: "4px 8px",
              border: "1px solid var(--rule)",
              borderBottom: active === i ? "1px solid var(--bg-2)" : "1px solid var(--rule)",
              background: active === i ? "var(--bg-2)" : "var(--bg-1)",
              color: active === i ? "var(--ink-0)" : "var(--ink-1)",
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">{items[active]}</div>
    </div>
  );
}
```

- [ ] **Step 7: Implement R3FScene (lazy island)**

Create `components/mdx/R3FScene.tsx`:
```tsx
"use client";

import dynamic from "next/dynamic";
import type { ComponentType, ReactNode } from "react";

/**
 * Lazy R3F scene container. The actual `<Canvas>` mount + scene tree is
 * loaded on demand — the post's TTI is unaffected if no R3FScene is in view.
 *
 * Usage in MDX:
 *   <R3FScene scene="paper-fold" caption="..." />
 *
 * Phase 2 ships with a single registered scene (`paper-fold`) that re-uses
 * the home-hero sculpture mesh in a smaller frame. New scenes register here.
 */
const SCENES: Record<string, () => Promise<{ default: ComponentType }>> = {
  "paper-fold": () => import("@/components/canvas/PaperFoldSculpture").then((m) => ({ default: m.PaperFoldSculpture })),
};

export function R3FScene({ scene, caption }: { scene: keyof typeof SCENES; caption?: ReactNode }) {
  const loader = SCENES[scene];
  if (!loader) {
    return <div role="alert">Unknown scene: {String(scene)}</div>;
  }
  const SceneComponent = dynamic(loader, {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: 320,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: "var(--ink-2)",
          backgroundColor: "var(--bg-1)",
          border: "1px solid var(--rule)",
        }}
      >
        // loading scene…
      </div>
    ),
  });
  return (
    <figure style={{ margin: "var(--space-5) 0" }}>
      <div style={{ height: 320, position: "relative" }}>
        <SceneComponent />
      </div>
      {caption ? (
        <figcaption
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "12px",
            color: "var(--ink-2)",
            marginTop: "var(--space-1)",
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
```

If `@/components/canvas/PaperFoldSculpture` does not exist yet (Phase 1 may have shipped a fallback static SVG instead), the `R3FScene` import will throw at runtime when MDX uses it. Phase 2's first post does not use `<R3FScene>`, so this is non-blocking — but flag it: **Sub-task: confirm `components/canvas/PaperFoldSculpture` exists from Phase 1. If Phase 1 shipped the SVG fallback (per spec §13.1 risk), update the SCENES registry to import the SVG fallback module instead.**

- [ ] **Step 8: Commit**

```bash
git add components/mdx/
git commit -m "feat(phase-2): add mdx primitives (chart, figure, pullquote, footnote, codegroup, r3fscene)"
```

---

### Task 13: Build the PostBody MDX renderer wrapper

**Files:**
- Create: `components/post/PostBody.tsx`

- [ ] **Step 1: Implement PostBody**

Create `components/post/PostBody.tsx`:
```tsx
import { compile, run } from "@mdx-js/mdx";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { mdxCompileOptions } from "@/lib/mdx";
import { mdxComponents } from "@/components/mdx/components";

/**
 * Server-only MDX renderer. Compiles the post body to a JSX function module,
 * evaluates it on the server, and returns the rendered React tree. Output is
 * RSC-rendered — zero client JS for prose and for non-island MDX components.
 */
export async function PostBody({ source }: { source: string }) {
  const compiled = await compile(source, {
    outputFormat: "function-body",
    development: false,
    remarkPlugins: mdxCompileOptions.remarkPlugins as never,
    rehypePlugins: mdxCompileOptions.rehypePlugins as never,
  });

  const { default: MdxContent } = await run(String(compiled), {
    Fragment,
    jsx,
    jsxs,
    baseUrl: import.meta.url,
  });

  return (
    <div className="post-body">
      <MdxContent components={mdxComponents} />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/post/PostBody.tsx
git commit -m "feat(phase-2): add post body mdx renderer (server-side compile + run)"
```

---

### Task 14: Build the /research index page

**Files:**
- Create: `app/research/page.tsx`

- [ ] **Step 1: Implement /research page**

Create `app/research/page.tsx`:
```tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Research",
  description: "Research and writing from Coconut Labs.",
  path: "/research",
});

const AUTHOR_LABELS: Record<string, string> = {
  "shrey-patel": "Shrey Patel",
  "jay-patel": "Jay Patel",
};

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ResearchIndex() {
  const posts = getAllPosts();

  return (
    <section
      style={{
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-7) var(--gutter)",
      }}
    >
      <header style={{ marginBottom: "var(--space-6)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--fs-h1)",
            color: "var(--ink-0)",
            lineHeight: 1.05,
            letterSpacing: "-0.015em",
          }}
        >
          Research
        </h1>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--fs-mono)",
            color: "var(--ink-1)",
            marginTop: "var(--space-2)",
          }}
        >
          // notes from an independent inference research lab
        </p>
      </header>

      {posts.length === 0 ? (
        <p style={{ fontFamily: "var(--font-mono)", color: "var(--ink-2)" }}>
          // nothing here yet — but the work is happening at github.com/coconut-labs →
        </p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {posts.map((post) => (
            <li key={post.slug} style={{ borderTop: "1px solid var(--rule)", padding: "var(--space-4) 0" }}>
              <article>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "var(--fs-mono)",
                    color: "var(--ink-2)",
                    marginBottom: "var(--space-1)",
                  }}
                >
                  {formatDate(post.frontmatter.date)} ·{" "}
                  {post.frontmatter.authors.map((s) => AUTHOR_LABELS[s] ?? s).join(" · ")}
                </p>
                <h2 style={{ margin: 0 }}>
                  <Link
                    href={`/research/${post.slug}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--fs-h2)",
                      color: "var(--ink-0)",
                      textDecoration: "none",
                      letterSpacing: "-0.01em",
                      lineHeight: 1.1,
                    }}
                  >
                    {post.frontmatter.title}
                  </Link>
                </h2>
                {post.frontmatter.dek ? (
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "var(--fs-body)",
                      color: "var(--ink-1)",
                      marginTop: "var(--space-2)",
                      maxWidth: "var(--measure)",
                    }}
                  >
                    {post.frontmatter.dek}
                  </p>
                ) : null}
              </article>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/research/page.tsx
git commit -m "feat(phase-2): add /research index (chronological cards)"
```

---

### Task 15: Build the /research/[slug] layout (.theme-reading wrapper)

**Files:**
- Create: `app/research/[slug]/layout.tsx`

- [ ] **Step 1: Implement the post layout**

Create `app/research/[slug]/layout.tsx`:
```tsx
import type { ReactNode } from "react";
import "@/styles/post.css";
import "@/styles/print.css";

/**
 * Per-route layout for /research/[slug]. Adds the `.theme-reading` class so
 * tokens.css swaps `--bg-0` to the paler #F4EFE2 (spec §6.1). Loading the
 * post + print stylesheets here scopes them to this route only.
 */
export default function PostLayout({ children }: { children: ReactNode }) {
  return <div className="theme-reading">{children}</div>;
}
```

The `.theme-reading` class is defined in Phase 0's `styles/tokens.css` (it overrides `--bg-0`). Because `<body>` reads `background-color: var(--bg-0)` from `globals.css`, when the rendered tree contains `.theme-reading`, that subtree's contained sections inherit the paler bg. To make the **page** itself paler (not just the post container), the simplest approach is for the layout to set the bg on its own block:

- [ ] **Step 2: Make the layout wrapper carry the paler bg**

Replace `app/research/[slug]/layout.tsx` contents with:
```tsx
import type { ReactNode } from "react";
import "@/styles/post.css";
import "@/styles/print.css";

export default function PostLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="theme-reading"
      style={{
        backgroundColor: "var(--bg-0)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
```

The `.theme-reading` selector is what re-binds `--bg-0` to `#F4EFE2`; the inline `backgroundColor: "var(--bg-0)"` then resolves to the paler value inside this subtree.

- [ ] **Step 3: Commit**

```bash
git add app/research/[slug]/layout.tsx
git commit -m "feat(phase-2): add post layout with .theme-reading paler bg"
```

---

### Task 16: Build the /research/[slug] post page

**Files:**
- Create: `app/research/[slug]/page.tsx`

- [ ] **Step 1: Implement the post page**

Create `app/research/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts, getPostBySlug } from "@/lib/content";
import { buildMetadata, scholarlyArticleJsonLd } from "@/lib/seo";
import { PostHeader } from "@/components/post/PostHeader";
import { PostBody } from "@/components/post/PostBody";
import { ProgressBar } from "@/components/post/ProgressBar";
import { ShareRow } from "@/components/post/ShareRow";

const AUTHOR_LABELS: Record<string, string> = {
  "shrey-patel": "Shrey Patel",
  "jay-patel": "Jay Patel",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return buildMetadata({
    title: post.frontmatter.title,
    description: post.frontmatter.dek ?? "",
    path: `/research/${post.slug}`,
  });
}

export default async function ResearchPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const fullAuthorNames = post.frontmatter.authors.map((s) => AUTHOR_LABELS[s] ?? s);
  const ld = scholarlyArticleJsonLd({
    title: post.frontmatter.title,
    abstract: post.frontmatter.dek,
    datePublished: post.frontmatter.date,
    authors: fullAuthorNames,
  });

  return (
    <>
      <ProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <article className="post-shell">
        <div>
          <PostHeader frontmatter={post.frontmatter} />
          {/* @ts-expect-error Async Server Component */}
          <PostBody source={post.body} />
          <footer style={{ marginTop: "var(--space-6)" }}>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--fs-mono)", color: "var(--ink-1)" }}>
              <Link href="/research" style={{ color: "inherit", textDecoration: "none" }}>
                More research →
              </Link>
            </p>
            <ShareRow
              title={post.frontmatter.title}
              url={`${SITE_URL}/research/${post.slug}`}
              authors={fullAuthorNames}
              date={post.frontmatter.date}
              doi={post.frontmatter.doi ?? null}
            />
          </footer>
        </div>
        {/* Marginalia column — populated by post-body Footnote children in v2.
            v1 reserves the gutter via post.css; the column is empty unless the
            post page collects <Footnote/> entries explicitly. */}
        <aside className="post-marginalia" aria-hidden="true" />
      </article>
    </>
  );
}
```

A note on marginalia: spec §5.4 calls for marginalia rendering. Phase 2 v1 reserves the desktop gutter (via `.post-shell` grid) and ships the `<Marginalia>` component (Task 9), but the wiring that walks the compiled MDX tree to extract `<Footnote>` bodies and inject them into the gutter is more ambitious than v1 needs. The first post (KVWarden Gate 2-FAIRNESS) uses inline footnotes in the body itself; the marginalia column shows up empty on desktop. The Marginalia component is wired and the styles are present so a v1.1 follow-up can populate it with one PR.

- [ ] **Step 2: Commit**

```bash
git add app/research/[slug]/page.tsx
git commit -m "feat(phase-2): add /research/[slug] template (mdx + jsonld + share)"
```

---

### Task 17: Replace the RSS stub with a real Atom feed

**Files:**
- Modify: `app/rss.xml/route.ts`

- [ ] **Step 1: Replace RSS handler**

Replace `app/rss.xml/route.ts` contents with:
```ts
import { getAllPosts } from "@/lib/content";
import { compileMdxToHtml } from "@/lib/mdx";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://coconutlabs.org";

const AUTHOR_LABELS: Record<string, string> = {
  "shrey-patel": "Shrey Patel",
  "jay-patel": "Jay Patel",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = getAllPosts();
  const feedUpdated = posts[0]?.frontmatter.date.toISOString() ?? new Date().toISOString();

  const entries = await Promise.all(
    posts.map(async (post) => {
      const html = await compileMdxToHtml(post.body);
      const url = `${SITE_URL}/research/${post.slug}`;
      const updated = post.frontmatter.date.toISOString();
      const authorEls = post.frontmatter.authors
        .map(
          (slug) =>
            `<author><name>${escapeXml(AUTHOR_LABELS[slug] ?? slug)}</name></author>`,
        )
        .join("");
      return `  <entry>
    <title>${escapeXml(post.frontmatter.title)}</title>
    <link href="${url}" />
    <id>${url}</id>
    <updated>${updated}</updated>
    <published>${updated}</published>
    ${authorEls}
    ${post.frontmatter.dek ? `<summary>${escapeXml(post.frontmatter.dek)}</summary>` : ""}
    <content type="html"><![CDATA[${html}]]></content>
  </entry>`;
    }),
  );

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Coconut Labs — Research</title>
  <subtitle>Notes from an independent inference research lab.</subtitle>
  <link href="${SITE_URL}/rss.xml" rel="self" />
  <link href="${SITE_URL}" />
  <id>${SITE_URL}/</id>
  <updated>${feedUpdated}</updated>
  <author>
    <name>Coconut Labs</name>
    <email>info@coconutlabs.org</email>
  </author>
${entries.join("\n")}
</feed>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
```

- [ ] **Step 2: Verify the feed renders**

Run: `pnpm dev`
Visit `http://localhost:3000/rss.xml`. Expected:
- Atom 1.0 feed with at least one `<entry>` (the seed post under `_placeholder/` is excluded by default — only real posts under `content/research/` appear, so the feed will be empty until Task 18 lands the KVWarden post).

For now, the empty-but-valid feed is the success criterion. The first post lands in Task 18.

Stop server.

- [ ] **Step 3: Commit**

```bash
git add app/rss.xml/route.ts
git commit -m "feat(phase-2): replace rss stub with real atom feed (compiles post html)"
```

---

### Task 18: AUTH INTERRUPT — Land the KVWarden Gate 2-FAIRNESS post content

**Files:**
- Create: `content/research/2026-04-19-tenant-fairness-on-shared-inference.mdx`
- Create: `public/images/posts/kvwarden-gate2-26x.png` (asset)

The launch post draft lives on the `draft/gate0-launch-post` branch in `coconut-labs/kvwarden`. Two things have to come from the user; nothing in this task can be done autonomously.

- [ ] **Step 1: Ask user for the post body + asset**

Pause and ask the user:
> "To land the first research post (KVWarden Gate 2-FAIRNESS), I need two artifacts from `coconut-labs/kvwarden`:
> 1. **The post content.** Either (a) export the post from `draft/gate0-launch-post` as MDX (with frontmatter that matches the spec §9.4 schema — title, dek, date 2026-04-19, authors `[shrey-patel]`, tags `[inference, fairness, kvwarden]`, draft: false), or (b) paste the raw Markdown and I'll convert it to MDX with proper frontmatter and any spec-component upgrades (`<Pullquote>`, `<Figure>`, `<Chart>`).
> 2. **The hero chart image** (the 26× chart referenced in the spec). PNG at ~1600×900 if possible, or whatever resolution you have. I'll commit it to `public/images/posts/kvwarden-gate2-26x.png` and reference it via `<Figure src="/images/posts/kvwarden-gate2-26x.png" alt="..." />`.
>
> Want me to wait, or should I use a placeholder dek + lorem-ipsum body + a generated SVG placeholder chart so the build completes, and you swap them in later?"

- [ ] **Step 2: Once user provides the post, save it**

If user provides MDX directly:
```bash
mkdir -p content/research public/images/posts
# write the user-provided MDX to:
#   content/research/2026-04-19-tenant-fairness-on-shared-inference.mdx
# write the user-provided PNG to:
#   public/images/posts/kvwarden-gate2-26x.png
```

If user provides raw Markdown, convert to MDX:
1. Add the frontmatter block (see schema above) verbatim at the top.
2. Replace any block-quote that the user marks as a pullquote with `<Pullquote>{...}</Pullquote>`.
3. Replace any explicit `![alt](src)` image with `<Figure src="..." alt="..." caption="..." />` if a caption is implied by the surrounding sentence.
4. Wrap the headline 26× chart with `<Chart caption="...">` containing the `<Figure>` of the PNG.
5. Leave inline code, GFM tables, and code blocks as plain Markdown — the MDX pipeline handles them.

If user picks the placeholder route:
- Write a minimal MDX with a 1-paragraph dek-driven body, a `<Pullquote>` containing the spec's KVWarden tagline, and a placeholder `<Figure>` with `src="/images/posts/kvwarden-gate2-26x.png"` even though the file doesn't exist yet — Next.js Image will throw a runtime error on the page, so also stub the asset by copying any existing PNG (e.g. `public/og-base.png` if Phase 0 created one, otherwise omit the `<Figure>` until the asset arrives).

- [ ] **Step 3: Verify the post renders**

Run: `pnpm dev`
Visit `http://localhost:3000/research`. Expected: the new post appears as a card.
Visit `http://localhost:3000/research/2026-04-19-tenant-fairness-on-shared-inference`. Expected: post renders with editorial typography, paler bg, progress bar at top, share row at bottom.
Visit `http://localhost:3000/rss.xml`. Expected: feed now has one `<entry>` for this post.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add content/research/2026-04-19-tenant-fairness-on-shared-inference.mdx public/images/posts/
git commit -m "content(phase-2): land kvwarden gate 2-FAIRNESS launch post"
```

---

### Task 19: Build the @vercel/og route handler

**Files:**
- Create: `app/api/og/route.tsx`

- [ ] **Step 1: Implement the OG image route**

Create `app/api/og/route.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

const BG = "#ECE6D6";
const INK = "#1A1611";
const ACCENT = "#9B6B1F";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") ?? "Coconut Labs";

  // Instrument Serif fetched per-render. The font file is hosted on the same
  // origin (public/fonts/) so Vercel's edge runtime can fetch it.
  const fontUrl = new URL("/fonts/InstrumentSerif-Regular.ttf", request.url);
  const fontData = await fetch(fontUrl).then((r) => r.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
          backgroundColor: BG,
          padding: 60,
          fontFamily: "Instrument Serif",
        }}
      >
        <div
          style={{
            width: 6,
            backgroundColor: ACCENT,
            marginRight: 48,
            alignSelf: "stretch",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <div style={{ fontSize: 24, color: INK, fontFamily: "monospace" }}>coconutlabs.org</div>
          <div
            style={{
              fontSize: 84,
              lineHeight: 1.05,
              color: INK,
              letterSpacing: "-0.02em",
              maxWidth: 980,
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 22, color: INK, fontFamily: "monospace", opacity: 0.7 }}>
            Coconut Labs · independent inference research
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Instrument Serif", data: fontData, style: "normal", weight: 400 }],
    },
  );
}
```

- [ ] **Step 2: Add the Instrument Serif font file to public/fonts**

The edge runtime needs a self-hostable TTF. The `next/font/google` loader Phase 0 used optimizes fonts in the regular Node bundle, but does not expose the file to edge handlers. Download Instrument Serif Regular and commit it:

```bash
mkdir -p public/fonts
curl -L -o public/fonts/InstrumentSerif-Regular.ttf \
  "https://github.com/Instrument/instrument-serif/raw/main/fonts/ttf/InstrumentSerif-Regular.ttf"
```

If that URL changes, the Google Fonts CDN download is also valid:
```bash
curl -L -o public/fonts/InstrumentSerif-Regular.ttf \
  "https://fonts.gstatic.com/s/instrumentserif/v14/jizDREVItHgc8qDIbSTKq4XKVjEs.ttf"
```

(Verify the file size is ≥ 50KB — a smaller file is likely an HTML error page.)

- [ ] **Step 3: Verify the OG image generates**

Run: `pnpm dev`
Visit `http://localhost:3000/api/og?title=Tenant%20fairness%20on%20shared%20inference`. Expected: a 1200×630 PNG renders showing the wordmark line, the title in Instrument Serif, an amber vertical bar on the left, and the cream background.

Visit `http://localhost:3000/api/og` (no query). Expected: defaults to "Coconut Labs".

Stop server.

- [ ] **Step 4: Commit**

```bash
git add app/api/og/route.tsx public/fonts/InstrumentSerif-Regular.ttf
git commit -m "feat(phase-2): add @vercel/og image route (per-page generation)"
```

---

### Task 20: Add Playwright e2e tests for the research engine

**Files:**
- Create: `tests/e2e/research.spec.ts`

- [ ] **Step 1: Write research e2e tests**

Create `tests/e2e/research.spec.ts`:
```ts
import { test, expect } from "@playwright/test";

test.describe("research engine", () => {
  test("/research index renders posts", async ({ page }) => {
    await page.goto("/research");
    await expect(page.getByRole("heading", { level: 1, name: /Research/i })).toBeVisible();
    // First real post must be visible by Task 18.
    await expect(page.getByRole("heading", { name: /Tenant fairness on shared inference/i })).toBeVisible();
  });

  test("/research/[slug] post renders with editorial chrome", async ({ page }) => {
    await page.goto("/research/2026-04-19-tenant-fairness-on-shared-inference");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Tenant fairness/i);
    // Reading-progress bar present
    await expect(page.getByRole("progressbar", { name: /reading progress/i })).toBeVisible();
    // Share row present
    await expect(page.getByRole("button", { name: /copy link/i })).toBeVisible();
    // ScholarlyArticle JSON-LD present
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(ld).toContain('"@type":"ScholarlyArticle"');
  });

  test("/research/[slug] uses paler reading bg variant", async ({ page }) => {
    await page.goto("/research/2026-04-19-tenant-fairness-on-shared-inference");
    const wrapper = page.locator(".theme-reading").first();
    await expect(wrapper).toBeVisible();
    // Computed background should be the paler #F4EFE2.
    const bg = await wrapper.evaluate((el) => getComputedStyle(el).backgroundColor);
    // rgb(244, 239, 226) is the paler bg.
    expect(bg).toMatch(/244,\s?239,\s?226/);
  });

  test("rss.xml validates as Atom 1.0 with one entry", async ({ request }) => {
    const res = await request.get("/rss.xml");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/atom+xml");
    const body = await res.text();
    expect(body).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
    expect(body).toContain("<entry>");
    expect(body).toContain("Tenant fairness on shared inference");
  });

  test("OG image generates with custom title", async ({ request }) => {
    const res = await request.get("/api/og?title=Hello%20world");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    const buf = await res.body();
    expect(buf.byteLength).toBeGreaterThan(5_000);
  });

  test("Shiki syntax highlighting present in code blocks", async ({ page }) => {
    await page.goto("/research/2026-04-19-tenant-fairness-on-shared-inference");
    // Either there's a code block in the post (any prose post will have at least one)
    // or this test is skipped if the post has no code. We assert the markup is correct
    // when present.
    const shiki = page.locator("pre.shiki, pre.shiki-themes, pre[class*='shiki']");
    const count = await shiki.count();
    if (count > 0) {
      const firstSpan = shiki.first().locator("code span").first();
      const color = await firstSpan.evaluate((el) => getComputedStyle(el).color);
      // Must not be the default ink color — Shiki applies inline color.
      expect(color).not.toBe("rgb(26, 22, 17)");
    }
  });
});
```

- [ ] **Step 2: Run the e2e tests**

Run: `pnpm exec playwright test tests/e2e/research.spec.ts --project=chromium`
Expected: all 6 tests pass.

If the post-render test fails because the post body lacks a heading-level-1 (the post's `<h1>` is in `PostHeader`), debug by inspecting the page and either change the assertion to `getByRole("heading", { level: 1 }).first()` or confirm `PostHeader` renders an `<h1>`.

If the Shiki test fails because the user-provided post has no code blocks, the test self-skips — it only asserts when `count > 0`.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/research.spec.ts
git commit -m "test(phase-2): add e2e for research index, post, rss, og, shiki"
```

---

### Task 21: Extend the a11y test to cover research routes

**Files:**
- Modify: `tests/e2e/accessibility.spec.ts`

- [ ] **Step 1: Add research routes to the axe-core sweep**

Open `tests/e2e/accessibility.spec.ts` and update the `ROUTES` array:
```ts
const ROUTES = [
  "/",
  "/this-route-does-not-exist",
  "/research",
  "/research/2026-04-19-tenant-fairness-on-shared-inference",
];
```

- [ ] **Step 2: Run the a11y test**

Run: `pnpm exec playwright test tests/e2e/accessibility.spec.ts --project=chromium`
Expected: 4 tests pass.

If contrast violations appear on the research post (the paler `--bg-0` may push the muted ink colors below AA), adjust `--ink-1` / `--ink-2` for the `.theme-reading` scope in `styles/tokens.css`:
```css
.theme-reading {
  --bg-0: #F4EFE2;
  /* If contrast fails, also bump muted inks for the reading variant: */
  --ink-1: #524A3C;
  --ink-2: #7A7265;
}
```

Re-run until clean.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/accessibility.spec.ts styles/tokens.css
git commit -m "test(phase-2): extend a11y sweep to research index + post"
```

---

### Task 22: Manually verify print stylesheet

**Files:** none

- [ ] **Step 1: Print-preview the post**

Run: `pnpm dev`
Open `http://localhost:3000/research/2026-04-19-tenant-fairness-on-shared-inference` in Chrome.
Open DevTools → Command Menu (Ctrl/Cmd+Shift+P) → "Show Rendering" → toggle "Emulate CSS media type" → select "print".

Verify the page now shows:
- No header / no footer / no progress bar
- White background, black ink
- Body in Fraunces 11pt, headers in Instrument Serif
- URLs spelled out next to link text
- Marginalia notes appear inline at the bottom (if any present)
- Print preview (Ctrl/Cmd+P) shows page numbers in the bottom-right corner

Stop server.

- [ ] **Step 2: Commit (no code changes; this is a manual verification gate)**

If print verification surfaces issues, fix them in `styles/print.css` and commit with `fix(phase-2): print stylesheet adjustments`. Otherwise skip.

---

### Task 23: Run the full Phase 2 test + build pipeline

**Files:** none

- [ ] **Step 1: Typecheck**

Run: `pnpm typecheck`
Expected: zero errors.

- [ ] **Step 2: Unit tests**

Run: `pnpm test`
Expected: all unit tests across Phase 0 + Phase 1 + Phase 2 pass. Phase 2 adds:
- `tests/unit/lib/content.test.ts` — 12 tests (2 carry-over + 10 new)
- `tests/unit/lib/mdx.test.ts` — 6 tests
- `tests/unit/lib/seo.test.ts` — 4 tests (2 carry-over + 2 new)

Phase 2's net new unit count: **18 tests**.

- [ ] **Step 3: E2E tests**

Run: `pnpm test:e2e --project=chromium`
Expected: all e2e tests pass. Phase 2 adds:
- `tests/e2e/research.spec.ts` — 6 tests
- `tests/e2e/accessibility.spec.ts` — 2 new routes (4 total)

Phase 2's net new e2e count: **8 tests** (6 research + 2 a11y route additions).

- [ ] **Step 4: Production build**

Run: `pnpm build`
Expected: build completes. Inspect the build output for the `/research/[slug]` route — it should be SSG (statically generated at build time) thanks to `generateStaticParams`. If it's marked dynamic, debug `getAllPosts()` for any runtime-only references.

The `/api/og` route should be marked as Edge Function in the output.

- [ ] **Step 5: Commit any final fixes**

```bash
git status
# If anything is uncommitted, commit it.
```

---

### Task 24: Final Phase 2 verification

**Files:** none

- [ ] **Step 1: Walk through every Phase 2 surface in the browser**

Run: `pnpm dev`

Verify:
- `http://localhost:3000/research` — index page lists the KVWarden post; date · authors mono row; serif title; dek
- `http://localhost:3000/research/2026-04-19-tenant-fairness-on-shared-inference` — paler bg (#F4EFE2); 1px amber progress bar at top; 62ch body measure on desktop; Fraunces body, Instrument Serif headers, Geist Mono code; Shiki-highlighted code blocks; share row at bottom (copy-link, X, mailto, BibTeX if doi); "More research →" link
- `http://localhost:3000/rss.xml` — Atom feed with one `<entry>` for the KVWarden post
- `http://localhost:3000/api/og?title=Hello` — generated PNG with title in Instrument Serif on cream bg with amber bar
- View source of the post page → confirm `<script type="application/ld+json">` with `"@type":"ScholarlyArticle"` is present
- Print preview the post → confirm print stylesheet behavior

- [ ] **Step 2: Cross-check against spec §13 Phase 2 outcomes**

Spec §13 Phase 2 lists:
- ✅ MDX pipeline + Shiki syntax highlighting
- ✅ /research index page
- ✅ /research/[slug] editorial template (62ch measure, marginalia gutter, progress bar)
- ✅ MDX components (`<Chart>`, `<Figure>`, `<Pullquote>`, `<Footnote>`, `<CodeGroup>`, `<R3FScene>`)
- ✅ First post live (KVWarden Gate 2-FAIRNESS, Task 18)
- ✅ RSS feed working
- ✅ @vercel/og per-page OG image generation
- ✅ Schema.org `ScholarlyArticle` markup
- ✅ Print stylesheet

All spec §13 Phase 2 checklist items met.

- [ ] **Step 3: Push to remote (no auth interrupt — repo + Vercel set up in Phase 0)**

```bash
git push origin main
```

Vercel will auto-deploy. Wait for the deploy (1–3 min). Visit `https://coconutlabs.org/research` and `https://coconutlabs.org/research/2026-04-19-tenant-fairness-on-shared-inference` to confirm the post is live in production.

If `https://coconutlabs.org/api/og?title=Test` returns an edge runtime error, the most likely cause is the InstrumentSerif font file not being served — confirm `public/fonts/InstrumentSerif-Regular.ttf` is committed and that `https://coconutlabs.org/fonts/InstrumentSerif-Regular.ttf` returns a 200.

- [ ] **Step 4: Phase 2 ship-gate met**

The Phase 2 definition of done:
- ✅ `/research` and `/research/[slug]` live at `https://coconutlabs.org`
- ✅ One real research post published (KVWarden Gate 2-FAIRNESS)
- ✅ RSS feed validates as Atom 1.0 and contains the post
- ✅ Per-page OG images generate
- ✅ Schema.org `ScholarlyArticle` JSON-LD present on each post
- ✅ Print stylesheet works
- ✅ Lighthouse Perf ≥ 90 on `/research` and `/research/[slug]` (verified in Phase 5; Phase 2 just must not regress baseline)
- ✅ a11y baseline (axe-core clean on /research + /research/[slug])
- ✅ CI green on `main`

**Phase 2 is complete. Ready for Phase 3 plan (`/work`, `/papers`, `/podcasts`, `/about`, `/joinus`, `/contact`, `/projects/*`, `/colophon`).**

---

## Self-Review

Spec coverage check (Phase 2 sections of spec §13):
- ✅ MDX pipeline via @next/mdx (Task 2) + remark/rehype plugins (Task 4)
- ✅ Shiki syntax highlighting, server-side, two themes (Task 4 — `light` for default, `reading` for paler `--bg-0`)
- ✅ /research index page (Task 14)
- ✅ /research/[slug] editorial template (Task 16) with 62ch measure, paler bg variant (Task 15), reading-progress bar (Task 8)
- ✅ Marginalia component + desktop gutter / mobile inline pattern (Task 9, Task 6)
- ✅ MDX components: Chart, Figure, Pullquote, Footnote, CodeGroup, R3FScene (Task 12)
- ✅ Author + date + "More research →" + share row (Task 10, Task 11, Task 16)
- ✅ Share row: copy-link, X intent, mailto, BibTeX if `doi` frontmatter present (Task 11)
- ✅ Schema.org ScholarlyArticle JSON-LD (Task 5 helper, Task 16 wiring)
- ✅ Print stylesheet, no nav/footer/signals, 1in/0.75in margins, Fraunces 11pt 1.4lh, page numbers, URLs spelled out (Task 7)
- ✅ Real Atom 1.0 feed at /rss.xml (Task 17 replaces Phase 0 stub)
- ✅ @vercel/og per-page OG image generation (Task 19)
- ✅ KVWarden Gate 2-FAIRNESS first post (Task 18, auth-interrupt)
- ✅ Frontmatter schema documented in `lib/content.ts` types (Task 3 — `PostFrontmatter` type matches spec §9.4 verbatim)

Auth-interrupt points covered:
- ✅ KVWarden launch post content + chart asset (Task 18)
- ⚪ No new infra credentials needed — GitHub repo, Vercel, Cloudflare DNS, GitHub PAT, Plausible all carry over from Phase 0 + Phase 1

Performance contract (spec §10):
- Shiki runs server-side; zero JS for syntax highlighting at runtime
- MDX content rendered as RSC; only `<ProgressBar>`, `<ShareRow>`, `<CodeGroup>`, and `<R3FScene>` are client islands
- `<R3FScene>` lazy-loaded via `next/dynamic({ ssr: false })`
- The post page's only mandatory client JS is `ProgressBar` (~2KB gz) and `ShareRow` (~3KB gz including lucide icons). Posts that don't use `<CodeGroup>` or `<R3FScene>` ship no further client code.

Placeholder scan: one acknowledged gap — the marginalia column is wired (component exists, gutter reserved in CSS) but the MDX-tree walk that auto-extracts `<Footnote>` bodies into the gutter is parked for v1.1. The `<Footnote>` marker still works inline (jumps to `#note-{id}`); the gutter just stays empty until the walk lands. Spec §5.4 calls for marginalia; this satisfies the visual contract on desktop (gutter present, paler bg, editorial measure) but defers full auto-population. Flagged in Task 16 step 1 inline note.

Type consistency: `PostFrontmatter` (lib/content), `Post` (lib/content), `ScholarlyArticleLd` (lib/seo), `mdxCompileOptions` (lib/mdx), `mdxComponents` (components/mdx), `PostHeader` / `PostBody` / `ProgressBar` / `Marginalia` / `ShareRow` (components/post), `Chart` / `Figure` / `Pullquote` / `Footnote` / `CodeGroup` / `R3FScene` (components/mdx) — naming consistent across files; no clashes with Phase 0 or Phase 1 exports.

Test count expectations (Phase 2 net new):
- Unit: 18 net new tests (10 in content.test.ts, 6 in mdx.test.ts, 2 in seo.test.ts)
- E2E: 6 net new tests in research.spec.ts + 2 net new routes in accessibility.spec.ts (8 total new e2e cases)
- Total Phase 2 net new: **26 tests**

R3FScene caveat (flagged in Task 12 Step 7): if Phase 1 took the spec §13.1 fallback and shipped paper-fold sculpture as static SVG instead of R3F, the SCENES registry import path needs to point at the SVG fallback module. The first post does not use `<R3FScene>`, so this is non-blocking for Phase 2 ship — but it is a sub-task to confirm before Phase 3 lands.

Phase 2 produces a complete, testable research surface that can host real publication-quality writing — `/research` is now the canonical place where Coconut Labs research lives, and it is subscribable via RSS, indexable by Google Scholar via ScholarlyArticle markup, and shareable with per-page OG images. Phase 3 builds the remaining inner pages on this foundation.
