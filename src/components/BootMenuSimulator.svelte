<script>
  import {
    DISKS,
    MENU_ITEMS,
    REINSTALL_FIELDS,
    confirmationPhrase,
    formatSize,
    nextWipePass,
    nukeGates,
    nukeReady,
    reinstallReady,
    wipeDone,
  } from '../lib/bootmenu.js';

  // Which boot action is open (null = menu grid).
  let open = $state(null);
  // Nuke interlock state.
  let nukeDisk = $state(null);
  let nukeTyped = $state('');
  let wiping = $state(false);
  let wipePassesDone = $state(0);
  // Backup state.
  let backupSource = $state(null);
  let backupTarget = $state(null);
  let backupDoneFlag = $state(false);
  // Reinstall state.
  let reinstallFields = $state([]);
  let reinstallDoneFlag = $state(false);

  const gates = $derived(nukeGates(nukeDisk, nukeTyped));
  const ready = $derived(nukeReady(nukeDisk, nukeTyped));

  function select(actionId) {
    open = actionId;
    // Reset per-action state on every entry — nothing carries over.
    nukeDisk = null;
    nukeTyped = '';
    wiping = false;
    wipePassesDone = 0;
    backupSource = null;
    backupTarget = null;
    backupDoneFlag = false;
    reinstallFields = [];
    reinstallDoneFlag = false;
  }

  function goBack() {
    open = null;
  }

  function beginWipe() {
    if (!ready || wiping) return;
    wiping = true;
    wipePassesDone = 0;
    advancePass();
  }

  function advancePass() {
    const { pass, completedCount } = nextWipePass(wipePassesDone);
    if (!pass) return;
    wipePassesDone = completedCount;
    setTimeout(advancePass, 700);
  }

  function toggleReinstall(id, on) {
    reinstallFields = on
      ? [...reinstallFields, id]
      : reinstallFields.filter((f) => f !== id);
  }

  function activeMenuLabel() {
    const item = MENU_ITEMS.find((m) => m.id === open);
    return item ? item.name : '';
  }
</script>

<div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
  <div class="border-b border-zinc-800 px-5 py-4 sm:px-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-base font-bold text-zinc-100">Boot-menu simulator</h3>
      <span class="text-xs font-medium text-zinc-500">Phoenix · all fixtures, nothing real</span>
    </div>
    <p class="mt-1 text-sm text-zinc-400">
      The Phoenix boot menu in miniature: pick an action and walk the flow.
      Nuke demonstrates the safety interlock — nothing wipes without an
      explicit disk pick plus a typed confirmation.
    </p>
  </div>

  <div class="px-5 py-5 sm:px-6">
    {#if open === null}
      <div class="grid gap-3 sm:grid-cols-2">
        {#each MENU_ITEMS as item}
          <button
            onclick={() => select(item.id)}
            class="rounded-xl border px-4 py-4 text-left transition-colors {item.dangerous
              ? 'border-red-500/40 bg-red-500/[0.05] hover:border-red-500/70'
              : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-600'}"
          >
            <span class="flex items-center justify-between">
              <span class="text-sm font-bold {item.dangerous ? 'text-red-300' : 'text-zinc-100'}">
                {item.name}
              </span>
              <kbd class="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-[11px] text-zinc-400">
                {item.hotkey}
              </kbd>
            </span>
            <span class="mt-1 block text-xs text-zinc-500">{item.tagline}</span>
          </button>
        {/each}
      </div>
    {:else}
      <button
        onclick={goBack}
        class="mb-4 text-xs font-semibold text-zinc-400 transition-colors hover:text-white"
      >
        ← Back to boot menu
      </button>
      <h4 class="text-sm font-bold text-zinc-100">{activeMenuLabel()}</h4>

      <!-- ============ ANALYZE ============ -->
      {#if open === 'analyze'}
        <p class="mt-1 text-xs text-zinc-500">Enumeration complete — {DISKS.length} devices found:</p>
        <ul class="mt-3 space-y-2">
          {#each DISKS as disk}
            <li class="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-zinc-950/60 px-3.5 py-2.5 text-sm">
              <span>
                <span class="font-semibold text-zinc-200">{disk.label}</span>
                <span class="block text-xs text-zinc-500">{disk.model} · {disk.kind}</span>
              </span>
              <span class="flex items-center gap-2">
                <span class="font-mono text-xs text-zinc-500">{formatSize(disk.sizeGb)}</span>
                <span class="rounded-full px-2 py-0.5 text-xs font-bold {disk.health === 'ok' ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}">
                  {disk.health === 'ok' ? 'healthy' : 'check'}
                </span>
              </span>
            </li>
          {/each}
        </ul>
        <p class="mt-3 rounded-lg border border-dashed border-zinc-800 px-4 py-3 text-xs text-zinc-500">
          Fixture inventory only — a real Phoenix boot enumerates actual hardware here.
        </p>
      {/if}

      <!-- ============ BACKUP ============ -->
      {#if open === 'backup'}
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Source disk</p>
            {#each DISKS as disk}
              <label class="mb-1.5 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm {backupSource === disk.id ? 'border-amber-400/60 bg-amber-400/[0.06]' : 'border-zinc-800 bg-zinc-950/60'}">
                <input type="radio" name="bk-src" checked={backupSource === disk.id} onchange={() => (backupSource = disk.id)} class="accent-amber-400" />
                <span class="text-zinc-200">{disk.label} <span class="text-zinc-500">· {formatSize(disk.sizeGb)}</span></span>
              </label>
            {/each}
          </div>
          <div>
            <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">Vault target</p>
            {#each DISKS as disk}
              <label class="mb-1.5 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm {backupTarget === disk.id ? 'border-amber-400/60 bg-amber-400/[0.06]' : 'border-zinc-800 bg-zinc-950/60'}">
                <input type="radio" name="bk-tgt" checked={backupTarget === disk.id} onchange={() => (backupTarget = disk.id)} class="accent-amber-400" />
                <span class="text-zinc-200">{disk.label} <span class="text-zinc-500">· {formatSize(disk.sizeGb)}</span></span>
              </label>
            {/each}
          </div>
        </div>
        {#if backupSource && backupTarget && backupSource !== backupTarget}
          <button
            onclick={() => (backupDoneFlag = true)}
            class="mt-3 w-full rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300"
          >
            Start image
          </button>
        {:else if backupSource === backupTarget && backupSource}
          <p class="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3 text-xs font-medium text-amber-300">
            Source and target can't be the same disk — imaging a drive onto itself destroys data.
          </p>
        {/if}
        {#if backupDoneFlag}
          <p class="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-200">
            ✓ Image simulated: snapshot written to the vault target (fixture — no bytes moved).
          </p>
        {/if}
      {/if}

      <!-- ============ NUKE ============ -->
      {#if open === 'nuke'}
        <p class="mt-1 text-xs font-medium text-red-300/90">
          ⚠ Irreversible by design. Every gate below must pass before the wipe arms.
        </p>

        <p class="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gate 1 — pick a disk (nothing preselected)
        </p>
        {#each DISKS as disk}
          <label class="mb-1.5 flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm {nukeDisk === disk.id ? 'border-red-500/60 bg-red-500/[0.06]' : 'border-zinc-800 bg-zinc-950/60'}">
            <input type="radio" name="nuke-disk" checked={nukeDisk === disk.id} onchange={() => (nukeDisk = disk.id)} class="accent-red-500" />
            <span class="text-zinc-200">{disk.label} <span class="text-zinc-500">· {formatSize(disk.sizeGb)} · {disk.serial}</span></span>
          </label>
        {/each}

        <p class="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gate 2 — type the confirmation phrase
        </p>
        {#if nukeDisk}
          {@const disk = DISKS.find((d) => d.id === nukeDisk)}
          <p class="mb-1.5 text-xs text-zinc-500">
            Type exactly: <code class="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-red-300">{confirmationPhrase(disk)}</code>
          </p>
          <input
            type="text"
            bind:value={nukeTyped}
            placeholder="type the phrase above"
            class="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 font-mono text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-red-500 focus:outline-none"
          />
        {:else}
          <p class="rounded-lg border border-dashed border-zinc-800 px-4 py-4 text-center text-sm text-zinc-600">
            Pick a disk first — the phrase binds to the disk's serial.
          </p>
        {/if}

        <p class="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Gate 3 — launch checklist
        </p>
        <ul class="space-y-1.5">
          {#each gates as gate}
            <li class="flex items-center gap-2.5 rounded-lg bg-zinc-950/60 px-3.5 py-2.5 text-sm">
              <span class="text-base">{gate.pass ? '✓' : '○'}</span>
              <span class={gate.pass ? 'text-zinc-200' : 'text-zinc-500'}>{gate.label}</span>
            </li>
          {/each}
        </ul>

        <button
          onclick={beginWipe}
          disabled={!ready || wiping}
          class="mt-4 w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          {wiping ? 'Wiping…' : 'Begin wipe (simulated)'}
        </button>

        {#if wiping}
          <ul class="mt-3 space-y-1.5">
            {#each [0, 1, 2] as i}
              {@const done = i < wipePassesDone}
              {@const active = i === wipePassesDone && !wipeDone(wipePassesDone)}
              <li class="rounded-lg bg-zinc-950/60 px-3.5 py-2.5 text-sm {active ? 'text-amber-300' : done ? 'text-emerald-300' : 'text-zinc-600'}">
                {done ? '✓' : active ? '◌' : '○'} {['Pass 1 — zero fill', 'Pass 2 — random fill', 'Pass 3 — verify'][i]}
              </li>
            {/each}
          </ul>
          {#if wipeDone(wipePassesDone)}
            <p class="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-200">
              ✓ Wipe simulated complete — 3 passes, verified. Fixture only; no hardware touched.
            </p>
          {/if}
        {/if}
      {/if}

      <!-- ============ REINSTALL ============ -->
      {#if open === 'reinstall'}
        <p class="mt-1 text-xs text-zinc-500">Arm the install — every field required:</p>
        <ul class="mt-3 space-y-1.5">
          {#each REINSTALL_FIELDS as field}
            <li class="flex items-center gap-2.5 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3.5 py-2.5 text-sm">
              <input
                type="checkbox"
                id="re-{field.id}"
                checked={reinstallFields.includes(field.id)}
                onchange={(e) => toggleReinstall(field.id, e.currentTarget.checked)}
                class="accent-amber-400"
              />
              <label for="re-{field.id}" class="cursor-pointer">
                <span class="font-semibold text-zinc-200">{field.label}</span>
                <span class="block text-xs text-zinc-500">{field.hint}</span>
              </label>
            </li>
          {/each}
        </ul>
        <button
          onclick={() => (reinstallDoneFlag = true)}
          disabled={!reinstallReady(reinstallFields)}
          class="mt-4 w-full rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
        >
          Arm install
        </button>
        {#if reinstallDoneFlag}
          <p class="mt-3 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-200">
            ✓ Install simulated: image staged, answer file applied (fixture — nothing written).
          </p>
        {/if}
      {/if}
    {/if}
  </div>
</div>
