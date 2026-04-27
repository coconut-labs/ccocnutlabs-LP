# Cross-browser matrix — Phase 5

Playwright projects are configured for Chromium, Firefox, and WebKit in `playwright.config.ts`.

| Route group | Chromium | Firefox | WebKit | Notes |
| --- | --- | --- | --- | --- |
| Home | Pass | Pass | Pass | Paper-fold SVG fallback renders; WebGL remains env-gated. |
| Research | Pass | Pass | Pass | Index, post, RSS, schema, and OG routes covered. |
| Inner pages | Pass | Pass | Pass | Work, empty states, projects, about, join, contact, and colophon covered. |
| 404 | Pending manual | Pending manual | Pending manual | 404 component exists; not part of automated route matrix yet. |

## Known issues

No automated browser issues recorded after the final e2e run.
