# Decisions — demo

Open questions logged here so they don't get decided by accident.

## 1. Repo name: `demo` → ?
`demo` is generic and this repo is specifically the company portfolio. Options:
(a) rename to `portfolio`, (b) keep `demo` as the demos-playground home with the
portfolio living under it. Needs Brandon's call — renaming a fresh repo is
cheap, renaming after links spread is not.

## 2. Framework: Next.js or SvelteKit?
- `.gitignore` in this repo is Next.js-flavored (`.next/`, `next-env.d.ts`)
- The org's actual stack is Svelte 5 + Vite + Tailwind (Cloudflare Pages/R2)
- Recommendation: SvelteKit, for ecosystem consistency — unless there's a
  specific Next.js reason. Needs Brandon's call.

## 3. Deployment target
Ecosystem default is Cloudflare Pages (with GitHub Pages in the mix). The
portfolio should match wherever the rest of the org deploys. Decide alongside #2.

## 4. Domain
Candidates already in play: `wearedogs.net`, `dogs.pub`. Portfolio could live at
e.g. `work.wearedogs.net` or a path on the main domain — the main company site
(`wearedogs`) stays untouched; this repo is the *work showcase*, not the company
front page.

## Decision log
| Date       | Decision | By    |
|------------|----------|-------|
| 2026-09-09 | docs phase started | Jack |
| 2026-09-09 | **#1 Repo name: KEEP `demo`.** The GitHub Pages project-site staging URL is `yeahdogs.github.io/demo` — the repo name IS the URL. Renaming would churn the staging address; keeping it is free and reversible later. | Jack |
| 2026-09-09 | **#2 Framework: Svelte 5 + Vite SPA (no SvelteKit, no Next.js).** Rationale: matches the org's actual stack and the house `svelte-template`; the portfolio is static content with no backend (see roadmap non-goals: no auth, no DB), so SvelteKit's SSR/router adds nothing — a tiny hash-routed SPA builds to static output that any host serves. The Next.js-flavored `.gitignore` was leftover skeleton init and has been replaced. | Jack |
| 2026-09-09 | **#3 Deploy target: GitHub Pages project site** as staging (`https://yeahdogs.github.io/demo/`, `gh-pages` branch, built from `vite build` with `base: '/demo/'`). Staging pushes are free per house workflow; promotion to a custom domain goes through PR + Brandon's approval. Cloudflare Pages remains an option if the ecosystem standardizes there. | Jack |
| 2026-09-09 | **#5 Source recovered, rebuild-vs-re-scaffold closed.** The "lost source" was never lost: full source (scaffold + bootmenu + nuke-rehearsal, 24 src files) lived on `jack/demo-nuke-rehearsal`; merged into `jack/demo-source-recovered` (this branch). Also fixed a real regression: `public/404.html` was an unprocessed template copied verbatim into `dist/` — `postbuild` now copies the built `index.html` over it so every build ships a correct 404. | Jack |
