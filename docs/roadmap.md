# Roadmap — demo

Phased so each phase leaves the repo in a shippable state.

## Phase 0 — Shape (this phase, docs only)
- [x] README: repo purpose, planned site shape
- [x] `docs/roadmap.md` — this file
- [x] `docs/content-plan.md` — case-study format + initial project list
- [x] `docs/design-direction.md` — visual principles
- [x] `docs/decisions.md` — open decisions logged
- [x] Decide: keep repo name `demo` (see decisions.md — name is the Pages URL)
- [x] Decide: framework — Svelte 5 + Vite SPA, per org template (see decisions.md)
- [x] Decide: deployment target — GitHub Pages project site for staging (see decisions.md)

## Phase 1 — Skeleton site
- [ ] Scaffold the chosen framework, deploy a placeholder to the target
- [ ] Landing page: hero + featured work grid (3–6 projects, real links)
- [ ] `/work` index page with the full portfolio list
- [ ] 404 + basic metadata/OG tags

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
