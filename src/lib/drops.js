/**
 * Wax drop-alert simulator — client-side mock of the scan loop described in
 * wax/docs/ALERT-ENGINE-PLAN.md. Deterministic (no randomness) so the
 * playground behaves the same on every visit and the tests are stable.
 *
 * Scan model: the engine walks a seeded catalog of drops in a fixed order.
 * Each scan picks the next undetected drop (dedupe by `id`, like the plan's
 * cross-source dedupe), matches it against the user's watchlist
 * (artist name or alias, case-insensitive), and raises an alert on a hit.
 */

export const CATALOG = [
  {
    id: 'wax-001',
    artist: 'MF DOOM',
    title: 'Madvillainy — 20th Anniversary Reissue',
    format: '2×LP gatefold',
    price: 42.0,
    source: 'Rough Trade',
    detectedAt: '09:41',
  },
  {
    id: 'wax-002',
    artist: 'Sun Kil Moon',
    title: 'Benji — 10th Anniversary pressing',
    format: '2×LP, bone-white',
    price: 38.5,
    source: 'Turntable Lab',
    detectedAt: '09:42',
  },
  {
    id: 'wax-003',
    artist: 'Porter Robinson',
    title: 'Nurture — clear vinyl restock',
    format: 'LP',
    price: 29.99,
    source: 'Bandcamp',
    detectedAt: '09:43',
  },
  {
    id: 'wax-004',
    artist: 'Death Grips',
    title: 'The Money Store — picture disc',
    format: 'LP picture disc',
    price: 34.0,
    source: 'Vinyl Me, Please',
    detectedAt: '09:44',
  },
  {
    id: 'wax-005',
    artist: 'Isaiah Rashad',
    title: 'Cilvia Demo — test pressing (1 of 100)',
    format: 'LP test press',
    price: 120.0,
    source: 'Secretly Canadian',
    detectedAt: '09:45',
  },
  {
    id: 'wax-006',
    artist: 'MF DOOM',
    title: 'MM..Food — repress, same mastering',
    format: '2×LP',
    price: 36.0,
    source: 'Rough Trade',
    detectedAt: '09:46',
  },
  {
    id: 'wax-007',
    artist: 'Rich Brian',
    title: 'Where Is My Head? — debut pressing',
    format: 'LP, splatter',
    price: 31.5,
    source: 'Bandcamp',
    detectedAt: '09:47',
  },
];

/** Suggested watchlist used to prefill the simulator (founder's rotation). */
export const DEFAULT_WATCHLIST = ['MF DOOM', 'Sun Kil Moon'];

/** @param {string} name */
export function normalizeArtist(name) {
  return name.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Artist/alias matching: a drop matches if its normalized artist name equals
 * any normalized watchlist entry.
 * @param {{ artist: string }} drop
 * @param {string[]} watchlist
 */
export function matchesWatchlist(drop, watchlist) {
  const want = new Set(watchlist.map(normalizeArtist).filter(Boolean));
  return want.has(normalizeArtist(drop.artist));
}

/**
 * One scan tick: return the next catalog drop not in `seenIds`, plus the
 * updated set. Returns `{ drop: null, seen: seenIds }` when the catalog is
 * exhausted (mirrors "no new releases" on a quiet scan).
 * @param {Set<string>} seenIds
 */
export function scanOnce(seenIds) {
  const drop = CATALOG.find((d) => !seenIds.has(d.id)) ?? null;
  const seen = new Set(seenIds);
  if (drop) seen.add(drop.id);
  return { drop, seen };
}

/** @param {number} price */
export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}
