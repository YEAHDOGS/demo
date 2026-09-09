# dist/ inventory — demo (checked 2026-09-09)

On-disk `dist/` is the Vite production build of the current source
(`src/`, 24+ files on this branch), base path `/demo/`, built with
`@vitejs/plugin-legacy` (modern + legacy chunks). It is **not** the lost
artifact the founder question feared — the source it was built from is
committed on this branch, so it can be rebuilt with `npm run build`.

## Contents (372K total)

| File | Size | Notes |
|---|---|---|
| `index.html` | 2.9K | OG/meta tags, `/demo/assets/*` paths, 404 sibling |
| `404.html` | 2.9K | identical to index.html — the fixed 404 fallback (postbuild copies built index over it) |
| `favicon.svg` | ~1K | DOGS mark |
| `site.webmanifest` | ~1K | name "DOGS — What We Build", relative `favicon.svg` icon (fixed in c2383bef) |
| `assets/index-BYkH_jY3.js` | modern bundle | Svelte 5 SPA, 16 workstreams showcase |
| `assets/index-legacy-ChI8a1De.js` | legacy bundle | nomodule/SystemJS fallback for old browsers |
| `assets/polyfills-legacy-DTgiji2H.js` | polyfills | legacy only |
| `assets/index-CxEUX4UC.css` | stylesheet | Tailwind v4 build |

## What it renders
"DOGS — What We Build" landing page: hero + featured-work grid, `/work`-style
index content, og:url `https://yeahdogs.github.io/demo/`, theme `#0a0a0c`.
Hash-routed SPA — every route deep-links through the 404.html fallback.

## Drift: on-disk dist/ vs live `gh-pages` (as of this check)

The `gh-pages` branch is STALE and partially BROKEN relative to what's on disk:

- **gh-pages `404.html` is the old unprocessed template** — it references
  `./src/main.js` and never got the postbuild fix. Any 404/SPA-deep-link on
  the live staging site loads a broken fallback.
- **gh-pages assets are an older build** (index-Cpk-U5yi.js etc. vs on-disk
  index-BYkH_jY3.js) — predates the full 16-workstream showcase and the
  webmanifest icon fix (live manifest still says "DOGS - Modern Svelte Template",
  `/favicon.svg` absolute icon, `#000000` theme).
- **favicon.svg identical** between the two.

Pushing the on-disk `dist/` to `gh-pages` fixes the live broken 404 and ships
the current showcase. No rebuild needed; the artifact is consistent.

## Gaps (known, non-blocking for staging)

1. `dist/` is uncommitted build output — intentionally. The source in git is
   the source of truth; `scripts/stage-gh-pages.sh` is the only supported
   path to `gh-pages`.
2. OG image: no `og:image` tag — social unfurls will have no preview image.
   Nice-to-have, not a staging blocker.
3. Mobile-viewport QA has not been done on a phone (see roadmap Phase 4) —
   code-level smoke only.
4. `scripts/smoke-dist.sh` flags nothing; the old "source not in git" warning
   is stale — package.json/src ARE committed on this branch.
