# coconutlabs.org — IA + Content Refinement (2026-04-28)

> **Brainstorm output (god-planner-assisted).** Refines the navigation, hub structure, and copy for `/research`, `/projects` (new), `/joinus`, `/contact`, and the home composition. Implements decisions from the 2026-04-28 brainstorming session.

**Status:** Draft, awaiting user review
**Authors:** Shrey Patel + Jay Patel + Claude (brainstorming) + god-planner (strategic depth)
**Domain:** coconutlabs.org
**Supersedes:** sections of `2026-04-25-coconutlabs-org-design.md` §4 (sitemap), §5.1 (home), §5.2-5.10 (page composition for research/work/papers/podcasts/joinus/about/contact). Color/type/motion systems unchanged.

---

## 1. Locked decisions (entering this spec)

The following came out of the 2026-04-28 brainstorm preamble:

1. **Top nav drops to 5 items + a CTA button.** Visitor-facing nav: `Research · Projects · Join us · About · Contact`. The unlabeled Mail-icon CTA is replaced by a real "Contact" nav item. A `Read the launch →` button is added to the right of the nav.
2. **Consolidation strategy α.** `/work`, `/papers`, `/podcasts` stay as routes (URL-stable) but are *pulled from top nav*. Their content surfaces as **sections inside hub pages** (/research and /projects).
3. **New top-level route `/projects`** (currently nav points at `/projects/kvwarden`, which is a single-project page elevated to nav-root — that gets fixed).
4. **Custom cursor stays dropped** (per 2026-04-26 amendment to `2026-04-25-coconutlabs-org-design.md`).

---

## 2. Sitemap + Navigation (final)

### `lib/routes.ts` (source of truth)

```ts
export const ROUTES: RouteEntry[] = [
  { href: "/", label: "Home" },

  // Top nav (primary)
  { href: "/research", label: "Research", nav: true },
  { href: "/projects", label: "Projects", nav: true },
  { href: "/joinus",   label: "Join us",  nav: true },
  { href: "/about",    label: "About",    nav: true },
  { href: "/contact",  label: "Contact",  nav: true },

  // Hub-internal routes (still indexable, still URL-stable, just not in top nav)
  { href: "/research/[slug]",   label: "Research post" },
  { href: "/projects/kvwarden", label: "KVWarden" },
  { href: "/projects/weft",     label: "Weft" },

  // Redirected routes (kept for inbound-link stability, served by next.config.ts redirects):
  //   /papers   -> /research?type=papers   (308)
  //   /podcasts -> /research?type=podcasts (308)
  //   /work     -> /projects#tools         (308)

  // Site-craft (footer-only)
  { href: "/colophon", label: "Colophon" },
];
```

`/work` is removed from `ROUTES` and replaced with a permanent 308 redirect to `/projects#tools` in `next.config.ts`. The `IndexPageTemplate` component stays, used by `/papers` and `/podcasts`.

### Header layout

```
[Wordmark]    Research  Projects  Join us  About  Contact     [Read the launch →]
```

The `Read the launch →` button:
- mono caps, `bg-accent text-bg-0`, hover `bg-accent-2`
- href resolves at build time to the latest research post (today: `/research/tenant-fairness-on-shared-inference`)
- `data-cta="primary"` for analytics later
- on viewports `<md`, the button collapses to text-only (no border) inside the mobile nav drawer

### Footer

The footer keeps the full route map, including the now-hidden `/papers`, `/podcasts`, plus social, RSS, colophon, humans.txt. The hidden routes do not become un-discoverable — they become un-clutter at the top.

---

## 3. `/research` hub — mixed feed with type-tag filter

### Visitor jobs-to-be-done (priority order)

1. **Researcher / engineer** dropped from HN or a citation: "Show me the canonical KVWarden Gate 2 note. Then show me what else this lab has measured."
2. **Recruiter / investor**: "Is there a body of work, or is this one post?"
3. **Press**: "Where did the 26× number come from? Is the harness public?"
4. **Project-curious visitor**: "What else does Coconut Labs do?"

### Decision: single chronological mixed feed with mono filter row. **Not tabs.**

**Rationale.** With 1 post + 0 papers + 0 podcasts today, tabs make the page feel like three empty rooms. A mixed feed makes scarcity look intentional and scales cleanly to 20+1+5+3 a year from now. It also matches the manuscript metaphor — a notebook is a single chronological thread.

Filter row (`all · notes · papers · podcasts · talks`) lives above the feed; default state is `all`. Filter, not tabs.

### Layout

```
[mono caption]   research feed
[H1 serif]       Research
[body]           Notes, papers, and recordings from the lab notebook.
                 New entries first. Type-tagged. Each links to the canonical artifact.

[mono filter]    all · notes · papers · podcasts · talks       [rss]

[feed item]      2026-04-19  ·  research note
                 Tenant fairness on shared inference
                 A KVWarden Gate 2 note: 53.9 ms quiet TTFT, 61.5 ms under flooder
                 pressure, and 26× better tail behavior than FIFO.
                 Shrey Patel
                 →

[empty-state row, only when filter selects an empty type]
```

Cards reuse the existing `Card` primitive. No new component for the feed item itself.

### Copy

| Slot | Text |
|---|---|
| Mono caption | `research feed` |
| H1 | `Research` |
| Hero blurb | `Notes, papers, and recordings from the lab notebook. New entries first. Type-tagged. Each links to the canonical artifact.` |
| Filter labels | `all · notes · papers · podcasts · talks` |
| RSS link | `rss` (mono, right-aligned) |

### Empty-state copy (per filter type, hidden in default `all` view)

- **Papers:** `No papers yet. The first preprint lands when a result is large enough to peer-review. Notes come first; papers come when notes stop being enough.`
- **Podcasts:** `No podcasts yet. We will list episodes and talks here when there is signal worth recording.`
- **Talks:** `No talks yet. If you want to invite the lab to one, write to info@coconutlabs.org.`

### Behavior across states

- **Today (1 note, 0 papers, 0 podcasts):** feed shows one card. No "more coming soon" filler.
- **Year-from-now (20+ notes, 5 papers, 3 podcasts):** feed shows the most recent 20. Pagination at the bottom (`older →`). Year-grouping headers (`2026`, `2027`) only appear once there is more than one calendar year.

### Backward compatibility

`/papers` and `/podcasts` become **308 permanent redirects** to `/research?type=papers` and `/research?type=podcasts` respectively, configured in `next.config.ts`. The standalone IndexPageTemplate pages at `app/papers/page.tsx` and `app/podcasts/page.tsx` are deleted (they currently render empty lists). Anyone with an inbound link lands on the type-filtered view. The `IndexPageTemplate` component remains in the codebase; it is no longer routed.

---

## 4. `/projects` hub — new

### Visitor jobs-to-be-done

1. **Researcher** comparing KVWarden to other inference middleware: "What do they actually ship? What's prod, what's research, what's a weekend toy?"
2. **Investor / recruiter**: "Is this one project plus a logo, or is there a real second thing coming?"
3. **Project-curious visitor** from kvwarden.org: "What else?"
4. **Contributor candidate** from /joinus: "Where can I help? What's the smallest thing I could touch?"

### Decision: 3-tier hierarchy. Strict size ratio.

```
[hero block]                                    — full width, page-top
[KVWarden card — large, sage badge "Live"]      — ~60% of page weight
[Weft card — medium, amber badge "In research"] — ~25% of page weight
[Tools & experiments — compact list]            — ~15% of page weight
```

The hierarchy is the message: KVWarden is the work, Weft is the next thread, the tools are the supporting cast.

### Layout

```
[mono caption]   projects
[H1 serif]       Projects
[body]           Two projects, in different stages. Plus the small things that
                 keep the lab honest.

──────────────────────────────────────────────────────────────────────────────
[KVWarden — large card, full width, tilt-on-hover]
  [sage badge]        Live
  [H2 serif xl]       KVWarden
  [mono caption]      tenant fairness on shared inference
  [hero number]       1.14× of solo TTFT,  26× better than FIFO
  [body]              KVWarden is a scheduler and cache-pressure experiment for
                      shared LLM inference. The first public result is narrow on
                      purpose: a quiet tenant stays near solo latency while a
                      flooder pushes the system. The harness is public; the plots
                      do not hide the quiet tenant in an aggregate.
  [actions]           Read the launch →   Project page →   GitHub →
──────────────────────────────────────────────────────────────────────────────
[Weft — medium card, full width, no tilt]
  [amber badge]       In research
  [H2 serif lg]       Weft
  [mono caption]      tenant-fair LLM inference on Apple Silicon
  [body]              Weft is an early thread on local inference scheduling.
                      No public artifact yet. The shape is to keep tenants honest
                      under load and make measurements easy to reproduce, on a
                      class of hardware that is increasingly shared between agents
                      on the same machine.
  [meta]              Probe window: 2026-05-19 → 2026-06-16.
  [actions]           Project page →
──────────────────────────────────────────────────────────────────────────────
[Tools & experiments — compact 2-col list]
  [mono caption]      tools and experiments
  [body line]         Smaller things, mostly the scaffolding behind the public work.

  • Inference Notes        Python      github.com/coconut-labs/inference-notes
    Scripts, traces, and notebook fragments behind the research feed.

  [meta line]         RSS for new entries:  /rss.xml
──────────────────────────────────────────────────────────────────────────────
```

### Copy (replaces `content/projects/kvwarden.mdx` and `content/projects/weft.mdx` body text)

**KVWarden body:**
> KVWarden is a scheduler and cache-pressure experiment for shared LLM inference. The first public result is narrow on purpose: a quiet tenant stays near solo latency while a flooder pushes the system. The harness is public; the plots do not hide the quiet tenant in an aggregate.

**Weft body:**
> Weft is an early thread on local inference scheduling. No public artifact yet. The shape is to keep tenants honest under load and make measurements easy to reproduce, on a class of hardware that is increasingly shared between agents on the same machine.

**Weft meta line:**
> Probe window: 2026-05-19 → 2026-06-16.

(The probe-window line is the kind of detail that signals the lab is real — a public commitment to a decision date.)

### Hierarchy of attention — concrete sizing rules

- KVWarden: full-width `Card` primitive with `tilt`. Title `text-5xl`+. Hero number reuses `font-mono text-[clamp(2rem,5vw,5rem)]` from the home `ProjectsStrip`.
- Weft: same `Card` primitive without tilt. No hero number — "In research" badge is the substitute.
- Tools list: no card. A `<dl>` or simple grid with mono labels and one-line descriptions. The visual rhythm of "two tall cards, then a short list" *is* the hierarchy.

### What we will NOT do

- **Do not show GitHub stars** on the flagship cards. Stars are 0 today. Looks dishonest before it looks impressive. Show stars only in the tools list.
- **Do not put the tools list in a third-tier card grid.** Cards imply equal weight. The tools are not equal weight.
- **Do not link the KVWarden card primarily to the project page.** The launch post is the better front door for a cold visitor. Action order: `Read the launch →` first, `Project page →` second, `GitHub →` third.

### URL handling for `/work`

- `/work` becomes a 308 permanent redirect to `/projects#tools` in `next.config.ts`.
- The redirect stays alive for at least 12 months for inbound links.
- `/work` is removed from `lib/routes.ts` (no nav reference, no sitemap entry).
- `IndexPageTemplate` stays as a component (still used by `/papers`, `/podcasts`).

---

## 5. `/joinus` — full content design

### What this page must do, in order

1. Be honest about what the lab is (two people, async, no community channel).
2. Tell a real contributor what to actually go do (concrete starting paths).
3. State what the lab gives back, and what it does not.
4. State what the lab is not asking for.

### Layout

```
[mono caption]   contributors
[H1 serif]       Build with us.

[lead paragraph]
The fastest way in is a small reproducible artifact: a trace, a failing case,
a benchmark, or a patch. We are two people. There is no Slack, no Discord,
no weekly call. Contribution is async and lives on GitHub.

[H2]   How to start
[5 starting paths]

[H2]   What we give back
[4 bullets]

[H2]   What we don't do
[3 bullets]

[H2]   What we're not looking for right now
[3 bullets]

[mono caption]   the actual files
[3 real outbound links]

[mono caption]   contributors so far
[contributor list — empty state: "Just us, for now."]
```

### Copy

**Mono caption:** `contributors`
**H1:** `Build with us.`
**Lead:**
> The fastest way in is a small reproducible artifact: a trace, a failing case, a benchmark, or a patch. We are two people. There is no Slack, no Discord, no weekly call. Contribution is async and lives on GitHub.

### How to start (5 concrete paths — not stubs)

> Pick one of these. Each is articulated enough that you can start today without asking us first.

1. **Reproduce Gate 2 on your own hardware.** The Gate 2 numbers (53.9 ms solo, 61.5 ms under flooder, 26× better than FIFO) were measured on A100 with vLLM 0.19.1. Re-run the harness on different hardware — H100, L40S, MI300X, even a 4090 — and open a PR with your traces and a one-page note. The harness is at `coconut-labs/kvwarden/bench/`. Reproductions on hardware we do not own are the most useful contribution we can receive right now.

2. **Run the H100 saturation case.** The current H100 result shows modest deltas because the engine did not saturate at 32 RPS. We want a follow-up at higher flooder RPS (128+) or larger tenant count (N=16) on H100 SXM. Estimated cost: ~$3, ~30 min. If you have credit on Lambda, RunPod, or Modal and want to take this on, open an issue named "Gate 2.1b H100 saturation" and we will write up the runbook in the same thread.

3. **Add a baseline scheduler we have not compared against.** KVWarden today is benchmarked against FIFO and solo. We want comparisons against at least vLLM's native scheduler at higher concurrency, and against any cache-aware baseline you can wire into the harness. The interface is in `kvwarden/scheduler/baseline.py`. Add a class, run the harness, ship a plot.

4. **Find a failure mode in the fairness claim.** The Gate 2 result is narrow on purpose: one quiet tenant, one flooder, one trace shape. Construct a workload where KVWarden does worse than FIFO — different arrival distributions, adversarial prompt lengths, mixed model sizes. We will publish the counter-example as a research note with co-authorship if it holds up. Adversarial reproductions are at least as valuable to us as confirmatory ones.

5. **Patch the harness.** The harness has rough edges: brittle config loading, no built-in support for streaming output measurement, no per-tenant histograms. Issues tagged `harness` in `coconut-labs/kvwarden` are real, current, and small enough to land in a weekend.

(A 6th path will be added when the Weft probe window opens 2026-05-19. Until then, do not list it. Empty invitations read as filler.)

### What we give back

> What contributors get:
- **Commit attribution.** Every PR lands with your name on the commit. We do not squash to hide who did the work.
- **Co-authorship on substantive contributions.** If your work materially shapes a research note — a counter-example, a new baseline, a reproduction on different hardware — your name goes on the byline. We will negotiate this in the PR thread, not after the fact.
- **A contributor list.** Your name lands on this page once a PR merges. The list updates from the canonical `CONTRIBUTORS` file in the relevant repo.
- **References and endorsements.** If you do good work here and ask, we will write you a real reference for grad school, jobs, or grants. We will not write a generic LinkedIn recommendation; we will write something specific based on what you did.

### What we don't do

> Things we are not in the business of:
- **Paid contracting.** We do not pay for contributions. We are also not paid by anyone for the lab's work. If money is the right shape for what you are offering, we are the wrong door.
- **Recruiting outreach.** We are not hiring. If we are ever hiring, the page you are reading will say so.
- **Sales calls.** No demo decks, no discovery calls, no enterprise pilots. If KVWarden does not solve your problem from the README, it probably does not solve it.

### What we're not looking for right now

> So you don't waste a draft email:
- **Productizing KVWarden into a SaaS.** The lab is research-first. The middleware is open source and stays that way.
- **Staffing the team.** Coconut Labs is two people on purpose. Adding a third person is a decision we have not made and will not make casually.
- **VC introductions.** We are not raising. We will say so on this page if that ever changes.

### The actual files (replaces the 3 fake org-root links)

```
[mono caption]   the actual files
  • CONTRIBUTING.md       github.com/coconut-labs/kvwarden/blob/main/CONTRIBUTING.md
  • CODE_OF_CONDUCT.md    github.com/coconut-labs/kvwarden/blob/main/CODE_OF_CONDUCT.md
  • Open issues           github.com/coconut-labs/kvwarden/issues
```

**Implementation prerequisite:** `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` must exist in `coconut-labs/kvwarden` before this page ships. A /joinus page that links to fake pages erodes more trust than the absence of any links.

### Contributors block

```
[mono caption]   contributors so far
[empty state]    Just us, for now.

[populated state — once PRs land]
                 ada-lovelace · k-thompson · m-jones-22
```

Pulled from `coconut-labs/kvwarden/CONTRIBUTORS` (a plain newline-delimited list of GitHub handles), fetched at build time via `lib/contributors.ts` and cached for 1 hour via Next ISR. Do not rely on GitHub's auto-generated contributor graph (includes bots and dependabot). When the lab grows beyond a single canonical repo, switch to an org-root `coconut-labs/.github/CONTRIBUTORS` and re-spec.

---

## 6. `/contact` refinement

### Decision: keep the 3-row structure, expand each body to 2-3 sentences. Add response-time + "not for this inbox" blocks.

### Rewritten body paragraphs

**Collaborate** → `shreypatel@coconutlabs.org`
> For research collaborators, contributors, and people running adjacent work. Send a trace, a result, a paper draft, or a question about the harness. If your message has a specific artifact attached, it will get a faster response than one that does not.

**Press** → `jaypatel@coconutlabs.org`
> For journalists, podcasters, and analysts. We are happy to verify numbers, point at the canonical post for a result, and answer short factual questions. We do not do embargoed interviews or feature exclusives.

**General** → `info@coconutlabs.org`
> For everything that does not fit the other two — recruiters, students, partners, anyone with a question that is not a collaboration or a press request. This inbox is read by both of us. Plain language is fine; pitch decks are not.

### Response-time block (anchored at the bottom)

```
[mono caption]   response time
[body]           We don't always reply quickly. If something is time-sensitive,
                 say so in the subject line and we will read it sooner.
```

### "Not for this inbox" block

```
[mono caption]   not for this inbox
  • Sales outreach. If you are selling something, you can stop here.
  • Recruiting. We are not hiring. If we ever are, /joinus will say so.
  • Bug reports for KVWarden or Weft. File an issue on the repo instead.
```

The bug-reports redirect routes engineers away from email and toward where the work happens. The other two save the lab from a recurring drag.

### Final `/contact` page structure

```
[mono caption]   contact
[H1 serif]       Write the lab.

[3 rows — Collaborate / Press / General, each with 2-3 sentence body + EmailLink]

[mono caption]   response time
[body line]      We don't always reply quickly. If something is time-sensitive,
                 say so in the subject line and we will read it sooner.

[mono caption]   not for this inbox
[3 bullets]
```

---

## 7. Home composition — order swap + Hero CTA + LiveSignals strengthening

### Decision: swap Research and Projects. Add inline CTA in Hero. Strengthen LiveSignals.

### Final home order (replaces current order in `app/page.tsx`)

```
1. Hero (with added result-anchor + inline "Read the launch →" CTA)
2. Manifesto
3. Projects               ← MOVED UP (was 4)
4. Research               ← MOVED DOWN (was 3)
5. People
6. Contact
7. Live Signals (strengthened: 6 items, result line included)
8. Footer
```

### Why swap Projects/Research

A cold visitor's first question is: "is there real work here?" The most credible answer is the **flagship with a measured number on it (KVWarden 1.14×, 26× better than FIFO)**. That answer should land before the research feed, not after. Today's order makes the visitor scroll past three research cards before they see what KVWarden actually is. Lead with the artifact, then the writing about the artifact.

### Hero result-anchor + inline CTA

Current Hero body: `Schedulers, systems notes, and reproducible measurements for shared inference.`

Add directly below the existing tagline:

> KVWarden Gate 2: 1.14× of solo TTFT under load. 26× better than FIFO.
>
> [Read the launch →]

This sentence uses three numbers and one CTA in twelve words. Highest-leverage sentence on the entire site. A HN visitor's eye starts on the body, not the chrome — the inline CTA catches eyes that the top-nav button doesn't.

The button reuses the same `Read the launch →` styling as the nav CTA (mono caps, accent fill).

### LiveSignals strengthening

Current: 4 mono items (`updatedLabel`, `commitsThisWeek`, `repos tracked`, `RFC open`).

New format: 6 items, reordered to lead with the credibility-heaviest signals:

```
latest note · 2026-04-19 (6 days ago)
14 commits this week
kvwarden gate 2 · 1.14× solo · 26× better than fifo
2 repos tracked
1 rfc open
last updated · 3d ago
```

Notes:
- `latest note` is computed at build time from the most recent `/research/[slug]`.
- `kvwarden gate 2 · ...` is a permanent banner-of-record line, not pulled from any feed. Lives in `LiveSignalsStrip.tsx` as a constant.
- Remaining items still pull from `lib/github.ts` via `getRepoSignals()`.
- Styling unchanged: small mono caps, top-rule, generous spacing. Do not turn it into a card grid; the value is in feeling like a status line, not a section.

---

## 8. Implementation impact summary

### Files modified
- `lib/routes.ts` — flip `/work`, `/papers`, `/podcasts` out of nav; promote `/projects` (new); add `/contact` to nav.
- `next.config.ts` — add 308 redirect `/work` → `/projects#tools`; add `/papers` → `/research?type=papers`; add `/podcasts` → `/research?type=podcasts`.
- `app/page.tsx` — reorder strips (Projects above Research).
- `components/home/Hero.tsx` — add result-anchor sentence + inline `Read the launch →` button.
- `components/home/LiveSignalsStrip.tsx` — add `latest note` + permanent `kvwarden gate 2` line + reorder.
- `components/shell/Header.tsx` — replace Mail icon with proper Contact nav item; add `Read the launch →` CTA button on the right.
- `app/research/page.tsx` — convert from chronological list to mixed feed with type-tag filter row.
- `app/joinus/page.tsx` — full rewrite with 5 starting paths, give-back/don't-do/not-looking-for blocks, contributors block.
- `app/contact/page.tsx` — expand body copy to 2-3 sentences per row; add response-time + "not for this inbox" blocks.
- `content/projects/kvwarden.mdx` — replace body with new copy.
- `content/projects/weft.mdx` — replace body with new copy + probe-window meta line.

### Files created
- `app/projects/page.tsx` — new hub page (3-tier hierarchy).
- `lib/contributors.ts` — build-time loader for `CONTRIBUTORS` file.

### Files deleted
- `app/work/page.tsx` (replaced by 308 redirect to `/projects#tools`).
- `app/papers/page.tsx` (replaced by 308 redirect to `/research?type=papers`).
- `app/podcasts/page.tsx` (replaced by 308 redirect to `/research?type=podcasts`).

### External prerequisites (auth-interrupt)
- **Write `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md`** in `coconut-labs/kvwarden` repo before /joinus ships. The page links to these files; they must resolve. (Both are short; a 200-line CONTRIBUTING + a CoC-Covenant-1.4-style CODE_OF_CONDUCT is the v1 target.)
- **Create `CONTRIBUTORS` file** in `coconut-labs/kvwarden` for build-time parsing. Newline-delimited GitHub handles. v1 contents: empty file (the `/joinus` page renders "Just us, for now." as the empty state).

### Tests to add or update
- `tests/e2e/home.spec.ts` — update assertion for new strip order + result-anchor in Hero + 6 items in LiveSignals.
- `tests/e2e/inner-pages.spec.ts` — `/research` mixed feed assertion (filter row visible, type-tag on cards), `/projects` hub assertion (KVWarden-large + Weft-medium + Tools-list), `/joinus` assertion (5 starting paths visible, contributor block visible), `/contact` assertion ("response time" block + "not for this inbox" block).
- `tests/e2e/inner-pages.spec.ts` — new tests: `/papers` redirects to `/research?type=papers`, `/podcasts` redirects to `/research?type=podcasts`, `/work` redirects to `/projects#tools`.

### Out of scope (NOT in this spec — separate work)
- The avatars cropping fix (the SP/JP placeholder ovals).
- Smoothness / jitteriness investigation.
- The mailto-handler-fallback issue beyond what `EmailLink` already does (the user reports clicking does nothing on machines without a mail handler — `EmailLink`'s clipboard-copy is the documented fallback; we may need to make the copy button more visually prominent, but that's a separate visual-polish pass).

These three threads get their own spec or implementation plan after this one ships.

---

## 9. Open questions / decisions deferred

- **Discord/Slack community channel.** This spec is designed assuming there isn't one. If the founders later decide to open one, the /joinus lead paragraph and the "What we don't do" block both change. Re-spec at that time.
- **Sponsor/Patreon model.** Currently `/joinus` says "We do not pay for contributions. We are also not paid by anyone for the lab's work." If a GitHub Sponsors model lands later, this changes.
- **Talks page.** Currently folded under /podcasts (with the talk type-tag). If 5+ talks accumulate, splitting `/talks` as its own surface may be worth it — re-spec then.

---

## 10. Definition of "this refinement landed"

- [ ] All 6 page rewrites merged: home, /research, /projects (new), /joinus, /contact, Hero/LiveSignals.
- [ ] Header has 5-item nav + `Read the launch →` CTA button. No more lone Mail icon.
- [ ] `/work`, `/papers`, `/podcasts` redirect properly (verified by e2e test).
- [ ] `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTORS` file exist in `coconut-labs/kvwarden`.
- [ ] All existing tests still green; new e2e tests pass.
- [ ] Lighthouse a11y ≥ 95 on all rewritten routes.
- [ ] Brand voice scan passes (no banned phrases introduced anywhere in the new copy).

---

## Cross-references

- Original site spec (canonical, with 2026-04-26 amendment): `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md`
- 2026-04-26 amendment doc: `docs/superpowers/specs/2026-04-26-coconutlabs-org-spec-amended.md`
- Code-vs-plan drift audit (separate concern): `docs/superpowers/audits/2026-04-26-code-vs-plan-drift.md`
- This refinement: `docs/superpowers/specs/2026-04-28-coconutlabs-ia-content-refinement-design.md`
