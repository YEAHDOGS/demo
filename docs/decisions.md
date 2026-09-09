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
