# demo

**The DOGS company portfolio** — the public home where everything the DOGS
Ecosystem ships gets showcased, demoed, and linked. If someone asks "so what
does DOGS actually build?", this repo's answer is the site it deploys.

> Status: **skeleton / planning phase.** No site scaffolding yet — the shape of
> the thing is documented in [`docs/`](./docs) before any code lands.

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
