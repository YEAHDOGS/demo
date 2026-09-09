import { describe, expect, it } from 'vitest';
import {
  CATALOG,
  DEFAULT_WATCHLIST,
  formatPrice,
  matchesWatchlist,
  normalizeArtist,
  scanOnce,
} from './drops.js';

describe('normalizeArtist', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(normalizeArtist('  MF   DOOM ')).toBe('mf doom');
  });
});

describe('matchesWatchlist', () => {
  it('matches case-insensitively', () => {
    expect(matchesWatchlist({ artist: 'mf doom' }, ['MF DOOM'])).toBe(true);
  });

  it('does not match unknown artists', () => {
    expect(matchesWatchlist({ artist: 'Taylor Swift' }, DEFAULT_WATCHLIST)).toBe(false);
  });

  it('ignores empty watchlist entries', () => {
    expect(matchesWatchlist({ artist: 'MF DOOM' }, ['', '   ', 'MF DOOM'])).toBe(true);
  });
});

describe('scanOnce', () => {
  it('walks the catalog in order without repeats', () => {
    let seen = new Set();
    const picked = [];
    for (let i = 0; i < CATALOG.length; i++) {
      const { drop, seen: next } = scanOnce(seen);
      expect(drop).not.toBeNull();
      picked.push(drop.id);
      seen = next;
    }
    expect(new Set(picked).size).toBe(CATALOG.length);
  });

  it('returns null when the catalog is exhausted', () => {
    const all = new Set(CATALOG.map((d) => d.id));
    const { drop, seen } = scanOnce(all);
    expect(drop).toBeNull();
    expect(seen).toEqual(all);
  });

  it('does not mutate the input set', () => {
    const seen = new Set();
    const { seen: next } = scanOnce(seen);
    expect(seen.size).toBe(0);
    expect(next.size).toBe(1);
  });
});

describe('alert semantics', () => {
  it('flags watched artists as alerts across a full scan run', () => {
    let seen = new Set();
    const alerts = [];
    for (let i = 0; i < CATALOG.length; i++) {
      const { drop, seen: next } = scanOnce(seen);
      if (drop && matchesWatchlist(drop, DEFAULT_WATCHLIST)) alerts.push(drop.id);
      seen = next;
    }
    // MF DOOM x2 + Sun Kil Moon x1 in the seeded catalog
    expect(alerts).toEqual(['wax-001', 'wax-002', 'wax-006']);
  });

  it('every catalog entry has the fields the card renders', () => {
    for (const d of CATALOG) {
      expect(d.id).toBeTruthy();
      expect(d.artist).toBeTruthy();
      expect(d.title).toBeTruthy();
      expect(d.format).toBeTruthy();
      expect(d.source).toBeTruthy();
      expect(typeof d.price).toBe('number');
    }
  });
});

describe('formatPrice', () => {
  it('formats with two decimals', () => {
    expect(formatPrice(42)).toBe('$42.00');
    expect(formatPrice(38.5)).toBe('$38.50');
  });
});
