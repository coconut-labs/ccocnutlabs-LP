# coconutlabs.org — Code vs Plan Drift Audit (2026-04-26)

> **Why this exists.** A previous session built ~all of Phases 0–5 in code (uncommitted, ~25 files in `git status`). The 2026-04-26 amendments (Jay Patel co-founder, `info@`/`shreypatel@`/`jaypatel@` emails, drop CursorLayer) were applied to spec + plan docs only — **not** to the code. This audit reports what's actually in the code, what drifted, and what's needed to bring code to parity with the amended plans.

---

## Executive summary

| Layer | State | Action needed |
|---|---|---|
| Spec doc (canonical) | ✅ Amended (commit `bd6d9e6`) | — |
| Spec doc — Phase 1 description | ✅ Stale ref now fixed (this commit) | — |
| 6 plan docs | ✅ Amended (commit `bd6d9e6`) | — |
| Plan stale refs (Phase 3 + Phase 4) | ✅ Fixed (this commit) | — |
| Amended-spec consolidated md | ✅ Written `2026-04-26-coconutlabs-org-spec-amended.md` | — |
| **Code (`app/`, `components/`, `hooks/`, `content/`, `public/`)** | ⚠️ **Drifted** — built before amendments | **11 files need edits, 2 files need delete, 2 files need create, 1 image needs upload** |

Bottom line: **code is built but reflects the pre-amendment design** (single founder, single `hello@` address, custom CursorLayer present).

---

## Part 1 — What was actually built (vs what plans expect)

The repo at `/Users/shrey/Personal Projects/coconutlabs/` has:

- ✅ Next.js 15.5.6 + React 19.2.0 + motion 11.18.2 — installed
- ✅ All routes: `/`, `/about`, `/contact`, `/research`, `/research/[slug]`, `/work`, `/papers`, `/podcasts`, `/joinus`, `/projects/{kvwarden,weft}`, `/colophon`, `/api/og`, `/rss.xml`, `/robots.ts`, `/sitemap.ts`, `/not-found`
- ✅ All shell components: `Header`, `Footer`, `PageNumber`, `RouteTransition`, `FirstLoadReveal`, **CursorLayer (should be deleted)**
- ✅ All home strips: `Hero`, `HeroCanvas`, `ManifestoStrip`, `ProjectsStrip`, `ResearchStrip`, `PeopleStrip`, `ContactStrip`, `LiveSignalsStrip`
- ✅ All canvas/WebGL: `PaperFoldSculpture` + `PaperFoldSvgFallback`, `PageTearShader`, `PageFoldShader`, `PaperTear404`, GLSL shaders
- ✅ All MDX components: `Chart`, `Figure`, `Pullquote`, `Footnote`, `CodeGroup`, `R3FScene`, `components.tsx` map
- ✅ All post components: `PostHeader`, `PostBody`, `ProgressBar`, `Marginalia`, `ShareRow`
- ✅ All primitives: `Wordmark`, `Card`, `Badge`, `SplitText`, `ThinRule`, `RevealUp`
- ✅ All inner-page templates: `IndexPageTemplate`, `IndexCard`, `EmptyState`, `PersonCard`, `PrincipleCard`, `ProjectHero`, `StatusBadge`, `ColophonSection`
- ✅ lib/: `content.ts`, `github.ts`, `markdown.tsx`, `mdx.ts`, `routes.ts`, `seo.ts`, `transitions.ts`
- ✅ hooks/: `useFirstNVisits`, **`useCursor` (should be deleted)**
- ✅ content/: `manifesto.mdx`, `how-we-work.mdx`, `shrey-patel.mdx` (single person), kvwarden+weft project mdx, papers.json, podcasts.json, work.json, **one real research post: `2026-04-19-tenant-fairness-on-shared-inference.mdx`** + a `_placeholder/2026-04-10-hello-world.mdx`
- ✅ tests/: ~16 test files (unit + e2e), including `accessibility.spec.ts`, `cross-browser.spec.ts`, `home.spec.ts`, `inner-pages.spec.ts`, `og-images.spec.ts`, `reduced-motion.spec.ts`, `research.spec.ts`, `schema.spec.ts`, `shell.spec.ts`, `Badge.test.tsx`, `SplitText.test.tsx`, `content.test.ts`, `github.test.ts`, `markdown.test.tsx`, `seo.test.ts`, `transitions.test.ts`
- ✅ styles/: `tokens.css`, `post.css`, `print.css`
- ✅ Configs: `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `playwright.config.ts`, `vitest.config.ts`, `vitest.setup.ts`, `lighthouserc.json`, `mdx-components.tsx`
- ✅ CI: `.github/` workflow

**Implication:** the code coverage roughly matches Phases 0–5's combined deliverables. This was either an aggressive prior session or a parallel implementation we didn't track.

**Critical detail:** **none of this code is committed to git** — `git status` shows ~25 untracked entries. The `docs/` directory is the only tracked content.

---

## Part 2 — Drift detail (code vs amended plans)

### 2.1 — CursorLayer drop (per amendment #3)

| File | Current state | Target state |
|---|---|---|
| `components/shell/CursorLayer.tsx` | Exists | **Delete** |
| `hooks/useCursor.ts` | Exists | **Delete** |
| `app/layout.tsx` | `import { CursorLayer } from "@/components/shell/CursorLayer";` (line 3) + `<CursorLayer />` (line 46) | Remove both lines |
| `tests/e2e/cursor.spec.ts` | Does not exist | (No action — already absent) |

### 2.2 — Email convention (per amendment #2)

`hello@coconutlabs.org` appears in **5 code files** (and `humans.txt`):

| File | Line | Current | Target |
|---|---|---|---|
| `app/contact/page.tsx` | 27, 28 | All 3 sections use single `mailto:hello@coconutlabs.org` | Split: Collaborate→`shreypatel@`, Press→`jaypatel@`, General→`info@`. Update both `href` and link-label text. |
| `components/home/ContactStrip.tsx` | 7 | `mailto:hello@coconutlabs.org` | `mailto:info@coconutlabs.org` |
| `components/shell/Footer.tsx` | 51 | `mailto:hello@coconutlabs.org` | `mailto:info@coconutlabs.org` |
| `content/people/shrey-patel.mdx` | 11 | Email social `mailto:hello@coconutlabs.org` | `mailto:shreypatel@coconutlabs.org` |
| `public/humans.txt` | 4 | `Contact: hello@coconutlabs.org` | Replace with the two-co-founder block from Phase 0 plan (Shrey + Jay + general `info@`) |

### 2.3 — Co-founder Jay Patel addition (per amendment #1)

| File | Current state | Target state |
|---|---|---|
| `components/home/PeopleStrip.tsx` | Single-person; copy reads "Currently, one desk." / "Coconut Labs is currently Shrey Patel" | Rewrite to render two founder cards (Shrey + Jay) using the `FOUNDERS` array + `<FounderCard>` sub-component pattern from Phase 1 plan Task 16 |
| `app/about/page.tsx` | `loadPerson("shrey-patel")` — single `<PersonCard>` rendered | Load both via `Promise.all([loadPerson("shrey-patel"), loadPerson("jay-patel")])`, render in responsive grid |
| `content/people/jay-patel.mdx` | Does not exist | Create with frontmatter (name, role, photo, bio, socials including `mailto:jaypatel@`) per Phase 3 plan |
| `public/images/shrey-patel.jpg` | Does not exist (only `founder-placeholder.svg`) | User provides (auth-interrupt) |
| `public/images/jay-patel.jpg` | Does not exist | User provides (auth-interrupt) |
| `lib/content.ts` (`loadPerson`) | Likely supports any slug | Verify it accepts `"jay-patel"` — if not, generalize |

### 2.4 — RSS feed author email

`app/rss.xml/route.ts` — needs verification. The Phase 0 stub used `hello@coconutlabs.org`; the actual file may have already been replaced with real Atom-feed code. Open the file; if the `<email>` element still has `hello@coconutlabs.org`, change to `info@coconutlabs.org`.

### 2.5 — Voice / copy (per amendment #1)

Anywhere copy says "Coconut Labs is currently me, Shrey Patel" or "Coconut Labs is currently Shrey Patel," update to "Coconut Labs is Shrey Patel and Jay Patel." Known locations:

- `components/home/PeopleStrip.tsx` (line 14) — full rewrite per §2.3 covers this
- `content/about/manifesto.mdx` — needs a one-line check + edit
- Anywhere else the voice line appears: grep `grep -rn "currently Shrey\|currently me" --include="*.tsx" --include="*.mdx"`

### 2.6 — Voice / how-we-work principles (smaller copy update)

`content/about/how-we-work.mdx` may have a "one person" framing per the plan stub. Update to "two people" framing per the amended plan §13 Phase 3 placeholder.

### 2.7 — Tests reflecting amendments

| Test | Drift |
|---|---|
| `tests/e2e/inner-pages.spec.ts` | Likely tests `/contact` for one mailto count = 1; needs to assert 3 mailtos with the 3 specific addresses (per amended Phase 3 plan) |
| `tests/e2e/inner-pages.spec.ts` | Likely tests `/about` for "currently me, Shrey Patel" copy; needs to assert "Shrey Patel and Jay Patel" |
| `tests/e2e/home.spec.ts` | Likely tests PeopleStrip for one card; needs to assert two cards |

---

## Part 3 — Punch list to bring code to parity

In execution order. Each item is a discrete, verifiable change.

**Cursor drop (4 changes):**
1. Delete `components/shell/CursorLayer.tsx`
2. Delete `hooks/useCursor.ts`
3. Edit `app/layout.tsx` — remove `import { CursorLayer }` line + `<CursorLayer />` mount
4. Verify no other files import `useCursor` or `CursorLayer` (`grep -rn "useCursor\|CursorLayer" app/ components/ hooks/ lib/ tests/`)

**Email convention (5 changes):**
5. Edit `components/shell/Footer.tsx` — `hello@` → `info@`
6. Edit `components/home/ContactStrip.tsx` — `hello@` → `info@`
7. Edit `app/contact/page.tsx` — split single mailto into 3 distinct addresses with subject prefills, update displayed link labels
8. Edit `content/people/shrey-patel.mdx` — Email social `hello@` → `shreypatel@`
9. Edit `public/humans.txt` — replace single-Shrey block with two-co-founder block + general `info@` (per Phase 0 plan Task 13 Step 3)
10. Verify `app/rss.xml/route.ts` author email — if it still says `hello@`, change to `info@`

**Co-founder Jay Patel (5 changes):**
11. Create `content/people/jay-patel.mdx` with frontmatter per Phase 3 plan
12. Rewrite `components/home/PeopleStrip.tsx` to two-card grid (FOUNDERS array + FounderCard sub-component per Phase 1 plan Task 16)
13. Edit `app/about/page.tsx` — load both `shrey-patel` and `jay-patel`, render two PersonCards in responsive grid (`PEOPLE_SLUGS = ["shrey-patel", "jay-patel"]` per Phase 3 plan Task 16 Step 2)
14. Edit `content/about/manifesto.mdx` — voice update ("Shrey Patel and Jay Patel," "two people")
15. Edit `content/about/how-we-work.mdx` — "one person" → "two people" (one-line edit)

**Tests (3 changes):**
16. Edit `tests/e2e/inner-pages.spec.ts` — `/contact` mailto assertion (3 addresses, not 1) + `/about` voice regex update
17. Edit `tests/e2e/home.spec.ts` — PeopleStrip two-card assertion (if it tests count)
18. Verify `pnpm test:all` passes after all changes

**Auth-interrupt (user provides):**
- 19. Drop `public/images/shrey-patel.jpg` (real photo, replaces `founder-placeholder.svg`)
- 20. Drop `public/images/jay-patel.jpg` (real photo)

**Total: 18 code changes + 2 user-provided assets.** Estimated time if dispatched as a single subagent: ~25–40 min.

---

## Part 4 — Recommended next step

Two options, in order of recommendation:

**A. Apply code drift fixes now via subagent** (recommended).
Dispatch one general-purpose agent with this audit doc + the amended plans. Agent makes all 18 changes, runs `pnpm test:all`, fixes any test breakages, opens a single git commit `feat: apply 2026-04-26 amendments (jay patel + email split + drop cursor)`. ~30 min wall time. User then drops in the two portrait JPGs and commits a `content: founder portraits` follow-up.

**B. Stage the punch list as a separate amendments-implementation plan**.
Write `docs/superpowers/plans/2026-04-26-amendments-code-implementation.md` with bite-sized tasks per drift item. Slower but matches the established plan format and gets executed via subagent-driven mode like the other phases.

**Either way, `git status` will go from ~25 untracked entries to 0 (or a small clean diff) once the changes land.** The current state — fully built code, never committed — is risky: a `git clean -fd` mistake or laptop wipe loses everything.

---

## Part 5 — Open question for user

The repo has ~25 uncommitted files (the entire built app). **Was this:**
- (a) Intentional — you wanted to wait until the amendments were applied before committing the first big commit?
- (b) An oversight — a previous session forgot to commit?
- (c) Multiple sessions interleaved — you executed the plans in a different chat and didn't realize git wasn't synced?

The answer affects how to handle the current state:
- (a): apply amendments inline, then commit one big "initial implementation" commit
- (b)/(c): commit the current built code first as a baseline (`feat: initial scaffold from phases 0-5 plans`), THEN apply amendments as a separate commit (so the diff is reviewable)

My recommendation: **(b)/(c) approach** — commit the existing code first (preserves history), then a focused amendments commit on top (clean diff to review). Even if the answer was (a), the two-commit shape is friendlier to future readers.

---

## Cross-references

- Amended spec (canonical): `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md` (commit `bd6d9e6`)
- Amended-spec consolidated md: `docs/superpowers/specs/2026-04-26-coconutlabs-org-spec-amended.md`
- Phase plans (all 6, amended): `docs/superpowers/plans/2026-04-25-coconutlabs-phase-{0,1,2,3,4,5}-*.md`
- This audit: `docs/superpowers/audits/2026-04-26-code-vs-plan-drift.md`
