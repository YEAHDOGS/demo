// Tiny hash router for the static SPA. Routes:
//   #/            -> home
//   #/work        -> portfolio index
//   #/work/<slug> -> case study
//   #/demos       -> playgrounds
//   #/about       -> about
// Anything else -> 404. On GitHub Pages the 404.html fallback loads the
// same bundle, which re-parses the path and lands here.

/** @typedef {{ page: 'home' } | { page: 'work' } | { page: 'work-detail', slug: string } | { page: 'demos' } | { page: 'about' } | { page: 'not-found' }} Route */

const WORK_DETAIL_RE = /^work\/([a-z0-9-]+)\/?$/

/**
 * Parse a location hash (or path fallback) into a Route.
 * @param {string} hash - e.g. "#/work/icecream"
 * @returns {Route}
 */
export function parseRoute(hash) {
  const raw = (hash || '').replace(/^#/, '').replace(/^\//, '').replace(/\/$/, '')
  if (raw === '') return { page: 'home' }
  if (raw === 'work') return { page: 'work' }
  if (raw === 'demos') return { page: 'demos' }
  if (raw === 'about') return { page: 'about' }
  const m = WORK_DETAIL_RE.exec(raw)
  if (m) return { page: 'work-detail', slug: m[1] }
  return { page: 'not-found' }
}

/**
 * Subscribe to route changes. Returns an unsubscribe function.
 * @param {(route: Route) => void} cb
 * @returns {() => void}
 */
export function subscribeRoute(cb) {
  const onChange = () => cb(parseRoute(window.location.hash))
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** @returns {Route} */
export function currentRoute() {
  return parseRoute(typeof window === 'undefined' ? '' : window.location.hash)
}
