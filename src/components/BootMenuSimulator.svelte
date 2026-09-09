<script>
  import {
    DISKS,
    MENU_ITEMS,
    REINSTALL_FIELDS,
    buildRehearsalTranscript,
    buildWipePlan,
    confirmationPhrase,
    diskById,
    formatSize,
    nukeGates,
    nukeReady,
    rehearsalAbortState,
    reinstallReady,
  } from '../lib/bootmenu.js';

  // Which boot action is open (null = menu grid).
  let open = $state(null);
  // Nuke interlock state.
  let nukeDisk = $state(null);
  let nukeTyped = $state('');
  // Nuke rehearsal state: null | { disk, plan, stepIndex, finished, transcript }.
  let rehearsal = $state(null);
  let copiedFlag = $state(false);
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
    rehearsal = null;
    copiedFlag = false;
    backupSource = null;
    backupTarget = null;
    backupDoneFlag = false;
    reinstallFields = [];
    reinstallDoneFlag = false;
  }

  function goBack() {
    open = null;
    rehearsal = null;
    copiedFlag = false;
  }

  function startRehearsal() {
    if (!ready || rehearsal) return;
    const disk = diskById(nukeDisk ?? '');
    if (!disk) return;
    rehearsal = {
      disk,
      plan: buildWipePlan(disk.id),
      stepIndex: 0,
      finished: false,
      transcript: '',
    };
    copiedFlag = false;
  }

  function advanceRehearsalStep() {
    if (!rehearsal || rehearsal.finished) return;
    const next = rehearsal.stepIndex + 1;
    if (next >= rehearsal.plan.length) {
      rehearsal = {
        ...rehearsal,
        stepIndex: next,
        finished: true,
        transcript: buildRehearsalTranscript({
          disk: rehearsal.disk,
          plan: rehearsal.plan,
        }),
      };
    } else {
      rehearsal = { ...rehearsal, stepIndex: next };
    }
  }

  function abortRehearsal() {
    // The abort contract is pinned in rehearsalAbortState() (unit-tested:
    // step 0, unfinished, empty transcript). Aborting returns cleanly to
    // the boot menu with nothing carried over.
    rehearsalAbortState();
    goBack();
  }

  async function copyTranscript() {
    if (!rehearsal?.transcript) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(rehearsal.transcript);
      } else {
        const ta = document.createElement('textarea');
        ta.value = rehearsal.transcript;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      copiedFlag = true;
      setTimeout(() => (copiedFlag = false), 2000);
    } catch {
      copiedFlag = false;
    }
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

        {#if !rehearsal}
          <button
            onclick={startRehearsal}
            disabled={!ready}
            class="mt-4 w-full rounded-lg bg-red-500 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            Enter nuke rehearsal (simulated)
          </button>
        {:else}
          <!-- ============ NUKE REHEARSAL ============ -->
          <div class="mt-4 overflow-hidden rounded-xl border-2 border-amber-400/70">
            <div class="bg-amber-400 px-4 py-2.5 text-center">
              <p class="text-sm font-black tracking-widest text-zinc-950">
                ⚠ SIMULATION — REHEARSAL ONLY ⚠
              </p>
              <p class="text-xs font-semibold text-zinc-800">
                No disk is being wiped. Every value on this screen is a fixture.
              </p>
            </div>

            <div class="bg-zinc-950/80 px-4 py-4">
              <p class="mb-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Rehearsal target — fixture enumeration
              </p>
              <div class="rounded-lg border border-red-500/40 bg-red-500/[0.05] px-3.5 py-2.5 text-sm">
                <span class="font-semibold text-zinc-200">{rehearsal.disk.label}</span>
                <span class="text-zinc-500"> · {rehearsal.disk.model} · {rehearsal.disk.serial} · {formatSize(rehearsal.disk.sizeGb)}</span>
                <span class="ml-2 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-amber-300">SIMULATED</span>
              </div>

              <p class="mb-1.5 mt-4 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Wipe plan — step-through dry run ({rehearsal.stepIndex}/{rehearsal.plan.length} done)
              </p>
              <ol class="space-y-1.5">
                {#each rehearsal.plan as step, i}
                  {@const done = i < rehearsal.stepIndex}
                  {@const current = i === rehearsal.stepIndex && !rehearsal.finished}
                  <li class="rounded-lg px-3.5 py-2.5 text-sm {done ? 'bg-zinc-900/60 text-emerald-300' : current ? 'border border-amber-400/50 bg-amber-400/[0.06] text-amber-200' : 'bg-zinc-950/60 text-zinc-600'}">
                    <span class="flex items-start justify-between gap-2">
                      <span>
                        {done ? '✓' : current ? '▶' : '○'}
                        <span class="font-semibold">{i + 1}. {step.label}</span>
                        <span class="block pl-5 text-xs opacity-80">{step.detail}</span>
                      </span>
                      <span class="shrink-0 rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-black tracking-wider text-amber-300">SIMULATED</span>
                    </span>
                  </li>
                {/each}
              </ol>

              {#if !rehearsal.finished}
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onclick={advanceRehearsalStep}
                    class="flex-1 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300"
                  >
                    {rehearsal.stepIndex === 0 ? 'Run first step' : rehearsal.stepIndex === rehearsal.plan.length - 1 ? 'Run final step' : 'Run next step'}
                  </button>
                  <button
                    onclick={abortRehearsal}
                    class="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Abort rehearsal
                  </button>
                </div>
                <p class="mt-2 text-xs text-zinc-600">Aborting returns to the boot menu — rehearsal state is discarded.</p>
              {:else}
                <p class="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.07] px-4 py-3 text-sm text-emerald-200">
                  ✓ Rehearsal complete — {rehearsal.plan.length} steps simulated. No hardware was touched.
                </p>
                <div class="mt-3">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <p class="text-xs font-semibold uppercase tracking-wider text-zinc-500">Rehearsal transcript (fixture only)</p>
                    <button
                      onclick={copyTranscript}
                      class="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-bold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                    >
                      {copiedFlag ? '✓ Copied' : 'Copy transcript'}
                    </button>
                  </div>
                  <pre class="mt-1.5 max-h-64 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3 font-mono text-xs leading-relaxed text-zinc-400">{rehearsal.transcript}</pre>
                </div>
                <div class="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    onclick={() => { rehearsal = null; }}
                    class="flex-1 rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Rehearse again
                  </button>
                  <button
                    onclick={goBack}
                    class="flex-1 rounded-lg bg-zinc-700 px-5 py-2.5 text-sm font-bold text-zinc-100 transition-colors hover:bg-zinc-600"
                  >
                    Back to boot menu
                  </button>
                </div>
              {/if}
            </div>
          </div>
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
