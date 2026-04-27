# coconutlabs.org — Spec Amendments (2026-04-26)

> **Self-contained reference for the 2026-04-26 amendments.** The canonical spec lives at `2026-04-25-coconutlabs-org-design.md` (committed `94c441f`, amended `bd6d9e6`). This doc captures the changes requested + the updated spec sections in their amended form, in one place.

---

## Part 1 — Changes requested (verbatim user ask)

> "add Jay Patel too as https://github.com/jaypatel15406 he is part of the coconotlabs.org - and co - founder - make the car for him to -
>
> contact emails - jaypatel@coconutlabs.org - and shreypatel@coconutlabs.org and info@coconutlabs.org need to update that too
>
> if we have custom cursor - i should not see mmy system cusror right ? - i think for simplicity we can keep system cusors - for dev and minimal vibe - that custom cursor is good but looks gimik club - need to make some changes and add seriousness"

Three discrete requests:
1. **Co-founder Jay Patel** — `github.com/jaypatel15406`. Add a card for him (PeopleStrip on home + People grid on /about).
2. **Email convention** — three addresses: `jaypatel@coconutlabs.org`, `shreypatel@coconutlabs.org`, `info@coconutlabs.org`. Replace existing `hello@coconutlabs.org`.
3. **Drop custom cursor** — keep the system cursor for "simplicity, dev, minimal vibe." Custom cursor reads as "gimik club"; we want seriousness.

---

## Part 2 — Amendment summary

| # | Change | Spec sections touched | Plan sections touched |
|---|---|---|---|
| 1 | Add co-founder Jay Patel | §1 (Authors), §5.1 (People strip), §5.7 (About People grid), §6.9 (Founder portraits — now two), §8.2 (Manifesto opener voice), §9.4 (content/people now has 2 mdx files), §14 (open question added for Jay's bio + photo) | Phase 0 humans.txt; Phase 1 PeopleStrip; Phase 1 Task 26 auth-interrupt; Phase 2 author registry; Phase 3 /about page (renders both); Phase 3 content/people/jay-patel.mdx (new) |
| 2 | Email convention `info@`/`shreypatel@`/`jaypatel@` | §5.8 (Contact mailtos updated), §8.2 (Empty state for /papers — uses info@) | Phase 0 Footer + RSS author + humans.txt → info@; Phase 1 ContactStrip → info@; Phase 2 Atom feed → info@; Phase 3 /contact splits 3 ways (Collaborate→shreypatel, Press→jaypatel, General→info), e2e test verifies all 3 mailto links |
| 3 | Drop custom cursor entirely | §7.5 (Section + element motion — cursor line removed), §9.2 (repo layout — CursorLayer removed from shell/), §9.3 (component principles — useCursor reference removed), §13 Phase 0 (CursorLayer task dropped), §13 Phase 4 (cursor work dropped), §13.2 (scope cuts — cursor cut item removed since no longer applicable), §15 (out of scope — custom cursor explicitly listed) | Phase 0 Task 10 (RouteTransition only — no CursorLayer stub); Phase 0 layout.tsx (no `<CursorLayer />`); Phase 1 layout.tsx insertion (no `<CursorLayer />`); Phase 4 Task 4 (`useCursor` portion removed); Phase 4 Task 14 (CursorLayer impl) marked REMOVED; Phase 4 Task 22 (cursor.spec.ts) marked REMOVED |

---

## Part 3 — Updated spec sections (in their amended form)

### §1 (header)

```
Date: 2026-04-25 (amended 2026-04-26)
Status: Approved; amendments below
Authors: Shrey Patel + Jay Patel + Claude (brainstorming session)
Domain: coconutlabs.org
```

### §5.1 — Home composition (item 5)

> 5. **People strip** — two founder cards (Shrey Patel + Jay Patel), each with photo + 1-line role + bio link. "How we work" link below the row.

### §5.7 — About page (People bullet)

> - People: two founder cards (Shrey Patel, Jay Patel) with photo, bio, social links. Future collaborators slot into the same grid.

### §5.8 — Contact

Three sections, each with its own dedicated address:

| Section | Address | Subject prefill |
|---|---|---|
| Collaborate | `shreypatel@coconutlabs.org` | `?subject=Collaborate` |
| Press | `jaypatel@coconutlabs.org` | `?subject=Press` |
| General | `info@coconutlabs.org` | (none) |

(Adjustable per user preference if a different routing is desired.)

### §6.9 — Imagery (Founder portraits)

> Founder portraits: two well-lit black-and-white portraits (Shrey Patel, Jay Patel), square crop, full-bleed rectangle (no avatar circle), placed in the same grid.

Files needed at:
- `public/images/shrey-patel.jpg`
- `public/images/jay-patel.jpg`

### §7.5 — Section + element motion (cursor removed)

> - Project cards 3D-tilt on hover (vanilla CSS perspective)
> - ThinRule dividers draw themselves on viewport entry
> - **System cursor everywhere — no custom cursor overlay** (per 2026-04-26 amendment)

### §8.2 — Voice examples (manifesto opener)

> **Manifesto opener (homepage strip):**
> > Coconut Labs is Shrey Patel and Jay Patel. We work on inference systems — the boring, load-bearing software between an LLM and the GPU it runs on. KVWarden is the first project. Weft is the second. There will be more.

The "Honest scale" voice rule (§8.1) updates accordingly:

> - Honest scale: "Coconut Labs is Shrey Patel and Jay Patel" — not "we're a team of dozens." The honest plainspoken voice ages well and signals confidence.

### §9.2 — Repo layout (shell/ no longer contains CursorLayer)

```
components/
├── shell/                Header, Footer, RouteTransition, PageNumber
```

`app/layout.tsx`:
```
global shell: <Header/> <RouteTransition/> <Footer/>
```

(No `<CursorLayer/>` slot; root layout has three shell components.)

### §9.4 — Content model (people directory)

```
content/
├── people/
│   ├── shrey-patel.mdx
│   └── jay-patel.mdx
```

`jay-patel.mdx` frontmatter:
```yaml
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

`shrey-patel.mdx` (email updated):
```yaml
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

### §13 — Phase 0 (CursorLayer dropped)

The Foundation phase no longer creates `components/shell/CursorLayer.tsx`. The global shell has three components: `<Header>`, `<Footer>`, `<RouteTransition>` (stub). `app/layout.tsx` does not import or render any cursor component.

### §13 — Phase 4 (CursorLayer dropped, ~1 day saved)

The Motion Polish phase no longer:
- Builds `hooks/useCursor.ts`
- Replaces `<CursorLayer>` stub with full implementation
- Adds `tests/e2e/cursor.spec.ts`

`<RouteTransition>` is the only Phase 0 stub replaced in Phase 4. Estimated time saved: **~1 day** out of the original ~5-day Phase 4 budget.

### §15 — Out of scope (custom cursor added)

> - **Custom cursor overlay** — use the system cursor (per 2026-04-26 amendment). Premium feel comes from type, color, motion choreography, and content; a custom cursor reads as gimmicky / "club website."

---

## Part 4 — Files needed to land these amendments

### Files to ADD (do not exist yet)
- `content/people/jay-patel.mdx` (Phase 3 work — frontmatter shown in §9.4 above)
- `public/images/jay-patel.jpg` (auth-interrupt — user provides)

### Files to UPDATE (exist with old content)
- `public/humans.txt` — add Jay block, change email to `info@coconutlabs.org`
- `components/shell/Footer.tsx` — `mailto:` to `info@coconutlabs.org`
- `components/home/ContactStrip.tsx` — `mailto:` to `info@coconutlabs.org`
- `app/contact/page.tsx` — split into 3 mailtos (Collaborate→shreypatel, Press→jaypatel, General→info)
- `content/people/shrey-patel.mdx` — Email social → `mailto:shreypatel@coconutlabs.org`
- `components/home/PeopleStrip.tsx` — render two founder cards (FOUNDERS array, FounderCard sub-component)
- `app/about/page.tsx` — load both `content/people/*.mdx` files, render two PersonCards in a responsive grid
- `app/layout.tsx` — remove import + mount of `<CursorLayer />`
- `app/rss.xml/route.ts` — change feed `<author><email>` to `info@coconutlabs.org`

### Files to DELETE (cursor drop)
- `components/shell/CursorLayer.tsx`
- `hooks/useCursor.ts`
- `tests/e2e/cursor.spec.ts` (if it exists)

---

## Part 5 — Definition of "amendment landed"

The amendment is fully landed when:
- [ ] Spec doc has the amendments at top + inline in affected sections (✅ done in `bd6d9e6`)
- [ ] All 6 plan docs have amendment notes + inline updates (✅ done in `bd6d9e6` — minor stale refs being fixed in next commit)
- [ ] Code in `/Users/shrey/Personal Projects/coconutlabs/` reflects the amendments (⏳ NOT YET — see audit doc)
- [ ] `humans.txt` lists both founders + `info@coconutlabs.org`
- [ ] `/contact` page has 3 mailtos (info, shrey, jay) with subject prefills
- [ ] `/about` page renders two PersonCards (Shrey + Jay)
- [ ] Home `<PeopleStrip>` renders two founder cards
- [ ] `<CursorLayer>` is deleted from code; `app/layout.tsx` no longer imports it
- [ ] `content/people/jay-patel.mdx` exists
- [ ] `public/images/jay-patel.jpg` is in place (auth-interrupt — user provides)

---

## Part 6 — Cross-references

- Canonical spec (with amendments inline): `docs/superpowers/specs/2026-04-25-coconutlabs-org-design.md`
- Phase plans (each amended at the header + inline): `docs/superpowers/plans/2026-04-25-coconutlabs-phase-{0,1,2,3,4,5}-*.md`
- Code-vs-plan drift audit: `docs/superpowers/audits/2026-04-26-code-vs-plan-drift.md` (next deliverable)
