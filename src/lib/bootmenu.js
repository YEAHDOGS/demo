/**
 * Phoenix boot-menu simulator — client-side mock of the Phoenix multi-boot
 * Swiss Army knife menu (Ventoy-style boot menu: Analyze / Backup / Nuke /
 * Reinstall). Deterministic fixture data so the playground behaves the same
 * on every visit and the tests are stable.
 *
 * Safety model mirrors Phoenix's design direction: the Nuke path is a
 * three-gate interlock (explicit disk enumeration → typed confirmation →
 * final review), so wiping the wrong disk is structurally hard. All disks
 * and confirmations here are inert fixtures — nothing on this page can
 * touch real hardware.
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
 * simulated wipe begins.
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
