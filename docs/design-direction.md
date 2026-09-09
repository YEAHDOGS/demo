# Design direction — demo

Principles for the portfolio site's look and feel. Written before code so the
scaffold inherits them instead of discovering them mid-build.

## Principles

1. **Let the work be the color.** The portfolio grid is a gallery — projects
   bring their own screenshots and palettes. Chrome (nav, cards, backgrounds)
   stays neutral so the work pops.
2. **Restraint over decoration.** No rainbow soup. One accent color, generous
   whitespace, typography doing the heavy lifting.
3. **Cutting edge, not trendy.** Sharp edges or soft? Dark mode default. Motion
   with purpose (page transitions, hover states on cards) — never decoration.
4. **Phone-first verification.** Every page gets checked at phone viewport
   before it's called done. Overlapping text and blank thumbnails are the
   classic failure modes; assume they'll happen and check.
5. **Fast by default.** Static-first pages, images sized for their slots,
   no framework bloat on the landing page.

## Component vocabulary (planned)

- `ProjectCard` — thumbnail, name, one-liner, live-link affordance
- `Badge` — stack/tech tags, status (live / in-progress / archived)
- `SectionHeader` — consistent rhythm between page sections
- `Hero` — landing only; big type, current focus, single CTA

## Visual assets

- Real screenshots strongly preferred; AI-generated imagery acceptable as
  clearly-marked placeholders only
- OG/social images per case study (needed once links get shared)
