# Performance baseline — pre-ship

Generated as part of Phase 5 setup. Local verification should be refreshed after the first production deploy.

## Bundle sizes

Captured from `npm run build` on 2026-04-25.

| Route | Size | First Load JS | Notes |
| --- | ---: | ---: | --- |
| `/` | 3.2 kB | 150 kB | ISR, 1h revalidate for live signals |
| `/_not-found` | 148 B | 102 kB | 404 template |
| `/about` | 485 B | 108 kB | static |
| `/api/og` | 148 B | 102 kB | dynamic |
| `/colophon` | 148 B | 102 kB | static |
| `/contact` | 148 B | 102 kB | static |
| `/joinus` | 430 B | 139 kB | static |
| `/papers` | 430 B | 139 kB | static |
| `/podcasts` | 430 B | 139 kB | static |
| `/projects/kvwarden` | 148 B | 102 kB | static |
| `/projects/weft` | 148 B | 102 kB | static |
| `/research` | 438 B | 142 kB | static |
| `/research/[slug]` | 1.74 kB | 104 kB | SSG |
| `/robots.txt` | 148 B | 102 kB | static |
| `/rss.xml` | 148 B | 102 kB | dynamic |
| `/sitemap.xml` | 148 B | 102 kB | static |
| `/work` | 430 B | 139 kB | static |

Shared first-load JS: 102 kB.

## Lighthouse desktop

Configured in `lighthouserc.json` with route coverage for the user-facing sitemap.

## Budget

- Performance: warn below 0.90
- Accessibility: fail below 0.95
- Best practices: warn below 0.95
- SEO: warn below 0.95
- Script transfer: warn above 300 KB
