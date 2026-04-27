# coconutlabs.org

Umbrella website for Coconut Labs: research feed, project pages, lab notes, and launch infrastructure.

## Stack

- Next.js App Router, React, TypeScript strict
- Tailwind CSS v4 with CSS-first design tokens
- MDX content files, local manifest loaders, Atom RSS
- Vitest, Playwright, axe-core, Lighthouse CI

## Local Development

```bash
npm install --cache .npm-cache
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run typecheck
npm run test
npm run build
npm run test:e2e
npm run analyze
```

## Phases

The implementation follows the docs under `docs/superpowers/`: Phase 0 foundation through Phase 5 ship hardening. Auth-only tasks such as production Vercel/DNS promotion, real user content replacement, and 24-hour monitoring remain external handoff items.
