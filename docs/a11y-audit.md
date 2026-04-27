# Accessibility audit — Phase 5

Automated coverage lives in `tests/e2e/accessibility.spec.ts` and scans every user-facing route with axe-core.

## Blocking

None recorded in local Playwright/axe verification on 2026-04-25.

Latest run:

- `PLAYWRIGHT_BROWSERS_PATH=.playwright-browsers npm run test:e2e`
- 87 passed across Chromium, Firefox, and WebKit
- Axe scans covered all configured user-facing routes

## Deferred

- Manual screen-reader pass.
- Real-device reduced-motion pass.
