# Roadmap — demo

Phased so each phase leaves the repo in a shippable state.

## Phase 0 — Shape (this phase, docs only)
- [x] README: repo purpose, planned site shape
- [x] `docs/roadmap.md` — this file
- [x] `docs/content-plan.md` — case-study format + initial project list
- [x] `docs/design-direction.md` — visual principles
- [x] `docs/decisions.md` — open decisions logged
- [ ] Decide: rename repo (`demo` → `portfolio`?) or keep
- [ ] Decide: framework — Next.js (`.gitignore` suggests it) vs SvelteKit (org stack)
- [ ] Decide: deployment target (Cloudflare Pages, matching the ecosystem?)

## Phase 1 — Skeleton site
- [x] Scaffold the chosen framework, deploy a placeholder to the target
  (built on disk: Svelte 5 + Vite, base path `/demo/` for
  `yeahdogs.github.io/demo/` — but **source was never committed**; the build
  output survives only in the untracked `dist/` on this machine. Recovery
  needed before anything else: locate the source (e.g. an uncommitted worktree
  or a lost worker sandbox) or rebuild from the `@dogs/svelte-template` in
  `~/workspace/svelte-template` using the content baked into `dist/`. Until
  source is in git, this site cannot be maintained or redeployed by anyone else.)
- [x] Landing page: hero + featured work grid (in the disk build: icecream,
  phoenix, castle, wax, divorce, chains, bakery, remote, dashboard, news —
  verify/rewrite from the real content once source is recovered)
- [ ] `/work` index page with the full portfolio list (not yet — landing only)
- [x] 404 + basic metadata/OG tags (present in the disk build; `dist/404.html`
  was an unprocessed template copy referencing `./src/main.js` — fixed on disk
  2026-09-09. `scripts/smoke-dist.sh` guards this artifact's deployability.)
- [ ] Source committed to git, CI producing `dist/` instead of a hand-built copy

## Phase 2 — Case studies
- [ ] Case-study template (see `content-plan.md`) wired as a route
- [ ] Write the first 3 case studies end-to-end (icecream monitor is the flagship)
- [ ] Screenshots/OG images pipeline (real screenshots preferred over AI placeholders)

## Phase 3 — Demos playground
- [ ] `/demos` index with 1–2 embedded live experiments
- [ ] Shared component primitives (cards, badges, section headers) reused across pages

## Phase 4 — Polish & front door
- [ ] About page: what DOGS is, contact path
- [ ] Mobile-viewport QA pass (this is where bugs get caught)
- [ ] Custom domain hookup (see `decisions.md`)

## Non-goals (for now)
- Not a blog — no CMS, no post feed
- Not the main company site (that's `wearedogs`) — this is the *work* showcase
- No auth, no backend, no database
