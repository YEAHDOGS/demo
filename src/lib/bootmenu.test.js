import { describe, expect, it } from 'vitest';
import {
  DISKS,
  MENU_ITEMS,
  REINSTALL_FIELDS,
  WIPE_PASSES,
  confirmationPhrase,
  diskById,
  formatSize,
  isConfirmationAccepted,
  isDiskSelected,
  menuItemById,
  nextWipePass,
  nukeGates,
  nukeReady,
  reinstallReady,
  wipeDone,
} from './bootmenu.js';

describe('menu catalog', () => {
  it('exposes the four boot actions in a fixed order', () => {
    expect(MENU_ITEMS.map((m) => m.id)).toEqual([
      'analyze',
      'backup',
      'nuke',
      'reinstall',
    ]);
  });

  it('flags nuke as the only dangerous action', () => {
    const dangerous = MENU_ITEMS.filter((m) => m.dangerous);
    expect(dangerous.map((m) => m.id)).toEqual(['nuke']);
  });

  it('menuItemById returns null for unknown ids', () => {
    expect(menuItemById('analyze')).not.toBeNull();
    expect(menuItemById('nope')).toBeNull();
  });
});

describe('disk enumeration', () => {
  it('lists fixture disks, never touches real hardware', () => {
    expect(DISKS.length).toBeGreaterThan(0);
    expect(DISKS.every((d) => d.serial.includes('FIXTURE'))).toBe(true);
  });

  it('diskById finds by id and misses on unknown', () => {
    expect(diskById('disk-0').label).toBe('NVMe SSD');
    expect(diskById('bogus')).toBeNull();
  });
});

describe('nuke safety interlock', () => {
  it('gate 1: no preselected disk passes by default', () => {
    expect(isDiskSelected(null)).toBe(false);
    expect(isDiskSelected('bogus')).toBe(false);
    expect(isDiskSelected('disk-0')).toBe(true);
  });

  it('gate 2: confirmation phrase binds the disk serial', () => {
    const disk = diskById('disk-0');
    expect(confirmationPhrase(disk)).toBe('NUKE SN-0001-FIXTURE');
  });

  it('gate 2: only the exact phrase (any case, trimmed) is accepted', () => {
    const disk = diskById('disk-0');
    expect(isConfirmationAccepted(disk, 'NUKE SN-0001-FIXTURE')).toBe(true);
    expect(isConfirmationAccepted(disk, '  nuke sn-0001-fixture ')).toBe(true);
    expect(isConfirmationAccepted(disk, 'yes')).toBe(false);
    expect(isConfirmationAccepted(disk, '')).toBe(false);
    // A phrase for disk-1 must not unlock disk-0.
    expect(isConfirmationAccepted(disk, 'NUKE SN-0002-FIXTURE')).toBe(false);
  });

  it('nukeReady requires every gate', () => {
    expect(nukeReady(null, '')).toBe(false);
    expect(nukeReady('disk-0', '')).toBe(false);
    expect(nukeReady('disk-0', 'yes')).toBe(false);
    expect(nukeReady('disk-0', 'NUKE SN-0001-FIXTURE')).toBe(true);
  });

  it('nukeGates reports per-gate pass/fail', () => {
    expect(nukeGates(null, '').map((g) => g.pass)).toEqual([false, false]);
    expect(nukeGates('disk-0', 'nope').map((g) => g.pass)).toEqual([true, false]);
    expect(
      nukeGates('disk-0', 'NUKE SN-0001-FIXTURE').map((g) => g.pass),
    ).toEqual([true, true]);
  });
});

describe('wipe pass model', () => {
  it('walks the pass list in order, then exhausts', () => {
    expect(nextWipePass(0).pass.id).toBe('pass-1');
    expect(nextWipePass(2).pass.id).toBe('pass-3');
    const end = nextWipePass(3);
    expect(end.pass).toBeNull();
    expect(end.completedCount).toBe(3);
    expect(wipeDone(3)).toBe(true);
    expect(wipeDone(2)).toBe(false);
  });

  it('defines exactly three passes', () => {
    expect(WIPE_PASSES.map((p) => p.id)).toEqual(['pass-1', 'pass-2', 'pass-3']);
  });
});

describe('reinstall checklist', () => {
  it('needs every field set before arming', () => {
    const all = REINSTALL_FIELDS.map((f) => f.id);
    expect(reinstallReady(all)).toBe(true);
    expect(reinstallReady(all.slice(0, -1))).toBe(false);
    expect(reinstallReady([])).toBe(false);
  });
});

describe('formatting', () => {
  it('formats sizes with TB for terabyte-scale', () => {
    expect(formatSize(10240)).toBe('10 TB');
    expect(formatSize(512)).toBe('512 GB');
  });
});
