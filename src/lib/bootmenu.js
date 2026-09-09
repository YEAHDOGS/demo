/**
 * Phoenix boot-menu simulator — client-side mock of the Phoenix multi-boot
 * Swiss Army knife menu (Ventoy-style boot menu: Analyze / Backup / Nuke /
 * Reinstall). Deterministic fixture data so the playground behaves the same
 * on every visit and the tests are stable.
 *
 * Safety model mirrors Phoenix's design direction: the Nuke path is a
 * three-gate interlock (explicit disk enumeration → typed confirmation →
 * final review), so wiping the wrong disk is structurally hard. The final
 * review also refuses vault disks: a disk flagged as a backup target can
 * never be a Nuke target, because nuking the vault destroys the data you
 * would restore from. All disks and confirmations here are inert fixtures
 * — nothing on this page can touch real hardware.
 */

export const MENU_ITEMS = [
  {
    id: 'analyze',
    name: 'Analyze',
    tagline: 'Enumerate disks, scan for tampering, report health.',
    hotkey: 'A',
  },
  {
    id: 'backup',
    name: 'Backup',
    tagline: 'Image selected disks to a vault target.',
    hotkey: 'B',
  },
  {
    id: 'nuke',
    name: 'Nuke',
    tagline: 'Cryptographically wipe a disk, irrecoverably.',
    hotkey: 'N',
    dangerous: true,
  },
  {
    id: 'reinstall',
    name: 'Reinstall',
    tagline: 'Clean OS install from a trusted image + answer file.',
    hotkey: 'R',
  },
];

/** Fixture disk inventory shown at boot time (never the real machine's). */
export const DISKS = [
  {
    id: 'disk-0',
    label: 'NVMe SSD',
    model: 'PXB-1TB-EXAMPLE',
    sizeGb: 1024,
    kind: 'SSD',
    serial: 'SN-0001-FIXTURE',
    health: 'ok',
  },
  {
    id: 'disk-1',
    label: 'Backup vault',
    model: 'EXT-10TB-EXAMPLE',
    sizeGb: 10240,
    kind: 'USB-HDD',
    serial: 'SN-0002-FIXTURE',
    health: 'ok',
    // Backup target — can never be a Nuke target (see nukeGates gate 3).
    vault: true,
  },
  {
    id: 'disk-2',
    label: 'Spare drive',
    model: 'SATA-512GB-EXAMPLE',
    sizeGb: 512,
    kind: 'SSD',
    serial: 'SN-0003-FIXTURE',
    health: 'warning',
  },
];

/** @param {string} id */
export function menuItemById(id) {
  return MENU_ITEMS.find((m) => m.id === id) ?? null;
}

/** @param {string} id */
export function diskById(id) {
  return DISKS.find((d) => d.id === id) ?? null;
}

/**
 * Gate 1 of the Nuke interlock: a disk must be explicitly selected.
 * There is no preselection — `selectedId` starts null by design.
 * @param {string | null} selectedId
 */
export function isDiskSelected(selectedId) {
  return diskById(selectedId ?? '') !== null;
}

/**
 * Gate 2 of the Nuke interlock: the operator must type the exact
 * confirmation phrase for the selected disk. The phrase binds the serial so
 * a blanket "yes" can't be copy-pasted across disks.
 * @param {{ serial: string }} disk
 * @param {string} typed
 */
export function isConfirmationAccepted(disk, typed) {
  return (typed ?? '').trim().toUpperCase() === confirmationPhrase(disk);
}

/** @param {{ serial: string }} disk */
export function confirmationPhrase(disk) {
  return `NUKE ${disk.serial}`;
}

/**
 * Gate 3: the full Nuke launch checklist. Every gate must pass before the
 * simulated wipe begins. The vault gate refuses backup-target disks: nuking
 * the vault would destroy the very data a restore would need.
 * @param {string | null} selectedId
 * @param {string} typed
 */
export function nukeGates(selectedId, typed) {
  const disk = diskById(selectedId ?? '');
  return [
    { id: 'disk', label: 'Disk explicitly selected', pass: disk !== null },
    {
      id: 'confirm',
      label: `Typed "${confirmationPhrase(disk ?? { serial: '…' })}"`,
      pass: disk !== null && isConfirmationAccepted(disk, typed),
    },
    {
      id: 'vault',
      label: 'Target is not a backup vault',
      pass: disk !== null && !disk.vault,
    },
  ];
}

/** @param {string | null} selectedId @param {string} typed */
export function nukeReady(selectedId, typed) {
  return nukeGates(selectedId, typed).every((g) => g.pass);
}

/**
 * Simulated wipe passes. Pure progress model: each call advances one pass
 * through the ordered list until exhausted (mirrors a real wipe's
 * multi-pass pattern in miniature).
 */
export const WIPE_PASSES = [
  { id: 'pass-1', label: 'Pass 1 — zero fill', detail: 'writing zeros to every sector' },
  { id: 'pass-2', label: 'Pass 2 — random fill', detail: 'CSPRNG overwrite' },
  { id: 'pass-3', label: 'Pass 3 — verify', detail: 'read-back verification' },
];

/**
 * @param {number} completedCount number of passes already finished
 * @returns {{ pass: (typeof WIPE_PASSES)[number] | null, completedCount: number }}
 */
export function nextWipePass(completedCount) {
  const pass = WIPE_PASSES[completedCount] ?? null;
  return { pass, completedCount: pass ? completedCount + 1 : completedCount };
}

/** @param {number} completedCount */
export function wipeDone(completedCount) {
  return completedCount >= WIPE_PASSES.length;
}

/**
 * Reinstall flow: a minimal answer-file checklist (mirrors the Phoenix
 * config GUI writing an OS-agnostic config the boot side reads headlessly).
 * Every item must be set before the simulated install arms.
 */
export const REINSTALL_FIELDS = [
  { id: 'image', label: 'Trusted OS image chosen', hint: 'SHA-256 verified image fixture' },
  { id: 'target', label: 'Target disk chosen', hint: 'must differ from any backup source' },
  { id: 'username', label: 'Username set', hint: 'no default accounts' },
];

/** @param {string[]} setFieldIds */
export function reinstallReady(setFieldIds) {
  return REINSTALL_FIELDS.every((f) => setFieldIds.includes(f.id));
}

/** @param {number} gb */
export function formatSize(gb) {
  if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`;
  return `${gb} GB`;
}

/**
 * Fixture partition inventory per disk. Invented labels/sizes — never real
 * disk data, never the machine's. Used by the Nuke rehearsal dry-run.
 */
export const PARTITIONS = {
  'disk-0': [
    { id: 'part-0-1', label: 'EFI System Partition', fs: 'FAT32', sizeGb: 0.5 },
    { id: 'part-0-2', label: 'OS volume', fs: 'NTFS', sizeGb: 900 },
    { id: 'part-0-3', label: 'Recovery volume', fs: 'NTFS', sizeGb: 2 },
  ],
  'disk-1': [
    { id: 'part-1-1', label: 'Vault partition', fs: 'exFAT', sizeGb: 10240 },
  ],
  'disk-2': [
    { id: 'part-2-1', label: 'Spare volume', fs: 'ext4', sizeGb: 400 },
    { id: 'part-2-2', label: 'Scratch volume', fs: 'ext4', sizeGb: 112 },
  ],
};

/**
 * The fixture disk adapter — the ONLY disk-access surface the simulator is
 * allowed to use. It knows nothing about real hardware: no filesystem, no
 * subprocesses, no device nodes. Every simulator code path reads disks
 * through this adapter; the regression tests pin that contract.
 */
export const fixtureDiskAdapter = {
  kind: 'fixture',
  version: 1,
  /** @returns {typeof DISKS} defensive copies of the fixture inventory */
  enumerate() {
    return DISKS.map((d) => ({ ...d }));
  },
  /**
   * @param {string} diskId
   * @returns {(typeof PARTITIONS)['disk-0']} defensive copies of fixture partitions
   */
  partitions(diskId) {
    return (PARTITIONS[diskId] ?? []).map((p) => ({ ...p }));
  },
};

/**
 * Build the ordered dry-run plan for a Nuke rehearsal on a fixture disk:
 * partition enumeration, per-partition detachment notes, the three wipe
 * passes, then final verification. Every step is tagged simulated.
 * @param {string} diskId
 * @returns {{ id: string, label: string, detail: string, simulated: true }[]}
 */
export function buildWipePlan(diskId) {
  const disk = diskById(diskId);
  if (!disk) return [];
  const parts = fixtureDiskAdapter.partitions(diskId);
  const plan = [
    {
      id: 'enumerate',
      label: 'Enumerate partitions',
      detail: `SIMULATED — ${parts.length} fixture partition(s) listed for ${disk.label} (${disk.serial}); no hardware queried`,
      simulated: true,
    },
    ...parts.map((p) => ({
      id: `detach-${p.id}`,
      label: `Detach partition: ${p.label}`,
      detail: `SIMULATED — ${p.fs} · ${formatSize(p.sizeGb)}; no volume unmounted`,
      simulated: true,
    })),
    ...WIPE_PASSES.map((pass) => ({
      id: `wipe-${pass.id}`,
      label: pass.label,
      detail: `SIMULATED — ${pass.detail}; no sectors written`,
      simulated: true,
    })),
    {
      id: 'verify',
      label: 'Final verification',
      detail: 'SIMULATED — read-back check against fixture data only',
      simulated: true,
    },
  ];
  return plan;
}

/**
 * Plain-text rehearsal transcript — copy/paste friendly, fixture-only, and
 * headed by an unmistakable SIMULATION banner so it can never be mistaken
 * for a record of a real wipe.
 * @param {{ disk: (typeof DISKS)[number], plan: ReturnType<typeof buildWipePlan>, isoDate?: string }}
 */
export function buildRehearsalTranscript({ disk, plan, isoDate }) {
  const lines = [
    '*** SIMULATION — PHOENIX NUKE REHEARSAL TRANSCRIPT ***',
    'Dry run only. No disk was touched. Every value below is a fixture;',
    'no real disk data appears in this transcript.',
    `Rehearsed at: ${isoDate ?? new Date().toISOString()}`,
    `Target (fixture): ${disk.label} · ${disk.model} · ${disk.serial} · ${formatSize(disk.sizeGb)}`,
    '',
    'Rehearsal steps:',
    ...plan.map(
      (s, i) => `  ${i + 1}. [SIMULATED] ${s.label} — ${s.detail}`,
    ),
    '',
    'Result: rehearsal complete. No hardware was accessed.',
  ];
  return lines.join('\n');
}

/**
 * Abort a rehearsal at any step: returns the pristine reset state the
 * simulator shows after an abort (all interlock inputs cleared), so the
 * abort path can be reasoned about and tested without UI.
 */
export function rehearsalAbortState() {
  return { stepIndex: 0, finished: false, aborted: true, transcript: '' };
}
