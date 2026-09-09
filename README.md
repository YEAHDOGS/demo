# demo

**The DOGS company portfolio** — the public home where everything the DOGS
Ecosystem ships gets showcased, demoed, and linked. If someone asks "so what
does DOGS actually build?", this repo's answer is the site it deploys.

> Status: **Phase 1 skeleton shipped.** Svelte 5 + Vite SPA (hash-routed, static
> output) with landing, `/work` index, `/work/<slug>` case studies, `/demos`
> playground, `/about`, and a 404 page. Staging deploys to
> `https://yeahdogs.github.io/demo/` from the `gh-pages` branch. See
> [`docs/decisions.md`](./docs/decisions.md) for the stack/deploy calls. The
`/demos` playground has its first live piece: a Wax drop-alert simulator
(client-side mock of the Wax scan loop — watchlist input, scan button, alert
feed). The second piece is a Phoenix boot-menu simulator: a client-side mock
of the Phoenix boot menu (Analyze / Backup / Nuke / Reinstall) with the Nuke
safety interlock visible — explicit disk pick plus typed confirmation before
entering the Nuke rehearsal: a SIMULATION-bannered step-through dry-run of the
wipe plan (fixture disk enumeration, per-partition steps, three wipe passes)
with a copyable plain-text transcript and an abort-at-any-step path. Every
disk op routes through the fixture disk adapter — nothing on this page can
touch real hardware.

## Run it

```sh
npm ci          # fresh checkout (node_modules is git-ignored, not committed)
npm run dev     # local dev server
npm test        # vitest unit tests (router + content data)
./tests/build.sh      # production build smoke test → shippable dist/
./tests/check-links.sh # docs link + orphan check
./tests/viewport.sh   # 360px mobile regression gate (blank thumbs, fixed-width overflow)
```

## Purpose

`demo` exists to solve one problem: Brandon ships fast (20+ skeletons and
counting) but has no single page that ties the work together. This repo will
become a portfolio site that:

- Shows off shipped projects and products (live links, demos, screenshots)
- Hosts reusable demo pages / playgrounds for the ecosystem
- Gives partners, clients, and collaborators a front door into DOGS

## Planned site shape

| Page            | What it does                                              |
|-----------------|-----------------------------------------------------------|
| `/`             | Landing — hero, current focus, featured work              |
| `/work`         | Portfolio grid — every project with links + screenshots   |
| `/work/<slug>`  | Case study — problem, build, stack, outcome                |
| `/demos`        | Live playgrounds / embedded experiments                   |
| `/about`        | What DOGS is, who builds it, how to get in touch          |

See [`docs/roadmap.md`](./docs/roadmap.md) for phases, [`docs/content-plan.md`](./docs/content-plan.md)
for the case-study format, and [`docs/decisions.md`](./docs/decisions.md) for
open questions (stack choice, naming, domain).

## License

MIT — see [LICENSE](./LICENSE). Copyright (c) 2026 DOGS.
