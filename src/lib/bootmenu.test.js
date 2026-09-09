import { describe, expect, it } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync } from 'node:fs';
import {
  DISKS,
  MENU_ITEMS,
  PARTITIONS,
  REINSTALL_FIELDS,
  WIPE_PASSES,
  buildRehearsalTranscript,
  buildWipePlan,
  confirmationPhrase,
  diskById,
  fixtureDiskAdapter,
  formatSize,
  isConfirmationAccepted,
  isDiskSelected,
  menuItemById,
  nextWipePass,
  nukeGates,
  nukeReady,
  rehearsalAbortState,
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

describe('nuke rehearsal model', () => {
  it('PARTITIONS covers every fixture disk with sane entries', () => {
    for (const disk of DISKS) {
      const parts = PARTITIONS[disk.id];
      expect(parts.length).toBeGreaterThan(0);
      for (const p of parts) {
        expect(p.label).toBeTruthy();
        expect(p.fs).toBeTruthy();
        expect(p.sizeGb).toBeGreaterThan(0);
      }
    }
  });

  it('buildWipePlan orders enumerate → detach → passes → verify', () => {
    const plan = buildWipePlan('disk-0');
    expect(plan[0].id).toBe('enumerate');
    expect(plan[plan.length - 1].id).toBe('verify');
    const ids = plan.map((s) => s.id);
    expect(ids).toContain('wipe-pass-1');
    expect(ids).toContain('wipe-pass-2');
    expect(ids).toContain('wipe-pass-3');
    expect(ids.filter((id) => id.startsWith('detach-')).length).toBe(
      PARTITIONS['disk-0'].length,
    );
    // Every step is explicitly tagged simulated — no exceptions.
    expect(plan.every((s) => s.simulated === true)).toBe(true);
  });

  it('buildWipePlan returns [] for an unknown disk', () => {
    expect(buildWipePlan('bogus')).toEqual([]);
  });

  it('buildRehearsalTranscript is plain text, fixture-only, SIMULATION-headed', () => {
    const disk = diskById('disk-0');
    const plan = buildWipePlan('disk-0');
    const transcript = buildRehearsalTranscript({
      disk,
      plan,
      isoDate: '2026-09-09T10:00:00.000Z',
    });
    expect(transcript).toContain('*** SIMULATION');
    expect(transcript).toContain(disk.serial);
    expect(transcript).toContain('No disk was touched');
    expect(transcript).toContain('no real disk data');
    for (const step of plan) {
      expect(transcript).toContain(`[SIMULATED] ${step.label}`);
    }
    expect(typeof transcript).toBe('string');
  });

  it('rehearsalAbortState resets to a clean, aborted state', () => {
    const state = rehearsalAbortState();
    expect(state).toEqual({
      stepIndex: 0,
      finished: false,
      aborted: true,
      transcript: '',
    });
  });
});

describe('fixture disk adapter', () => {
  it('identifies itself as fixture-only', () => {
    expect(fixtureDiskAdapter.kind).toBe('fixture');
  });

  it('enumerate returns the fixture inventory as defensive copies', () => {
    const disks = fixtureDiskAdapter.enumerate();
    expect(disks.map((d) => d.id)).toEqual(DISKS.map((d) => d.id));
    disks[0].label = 'MUTATED';
    expect(diskById('disk-0').label).toBe('NVMe SSD');
    expect(fixtureDiskAdapter.enumerate()[0].label).toBe('NVMe SSD');
  });

  it('partitions returns copies, empty array for unknown disks', () => {
    const parts = fixtureDiskAdapter.partitions('disk-0');
    expect(parts.length).toBe(PARTITIONS['disk-0'].length);
    parts[0].label = 'MUTATED';
    expect(fixtureDiskAdapter.partitions('disk-0')[0].label).toBe(
      PARTITIONS['disk-0'][0].label,
    );
    expect(fixtureDiskAdapter.partitions('bogus')).toEqual([]);
  });

  it('all fixture serials are marked FIXTURE — never real hardware ids', () => {
    expect(
      fixtureDiskAdapter.enumerate().every((d) => d.serial.includes('FIXTURE')),
    ).toBe(true);
  });
});

describe('simulator isolation — no code path can touch real disks', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const sources = {
    'src/lib/bootmenu.js': readFileSync(join(here, 'bootmenu.js'), 'utf8'),
    'src/components/BootMenuSimulator.svelte': readFileSync(
      join(here, '..', 'components', 'BootMenuSimulator.svelte'),
      'utf8',
    ),
  };

  // Patterns that would indicate real device/filesystem/process access.
  const banned = [
    /require\s*\(\s*['"]fs['"]\s*\)/,
    /from\s+['"]fs['"]/,
    /child_process/,
    /execSync|spawnSync|\bexec\s*\(/,
    /\bprocess\.(env|argv|exit|execPath)\b/,
    /\/dev\//,
    /\\\\\.\\/, // Windows device-namespace prefix \\.\
    /\bwmic\b/i,
    /\bdiskpart\b/i,
    /\bmkfs\b/,
    /\bdd\s+if=/,
    /ioctl/,
  ];

  for (const [path, src] of Object.entries(sources)) {
    it(`${path} contains no real-disk access patterns`, () => {
      for (const pattern of banned) {
        expect(
          pattern.test(src),
          `${path} matches banned pattern ${pattern}`,
        ).toBe(false);
      }
    });
  }

  it('every disk reference in the UI flows through the fixture adapter or DISKS fixture', () => {
    const svelte = sources['src/components/BootMenuSimulator.svelte'];
    // Disk lists render from DISKS / fixtureDiskAdapter only.
    expect(svelte).toContain('DISKS');
    expect(svelte).not.toContain('navigator.usb');
    expect(svelte).not.toContain('localStorage');
  });
});
