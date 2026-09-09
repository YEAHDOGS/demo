<script>
  import {
    CATALOG,
    DEFAULT_WATCHLIST,
    formatPrice,
    matchesWatchlist,
    scanOnce,
  } from '../lib/drops.js';

  let watchlistText = $state(DEFAULT_WATCHLIST.join(', '));
  let seen = $state(new Set());
  let scans = $state([]);
  let alerts = $state([]);

  const watchlist = $derived(
    watchlistText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  const exhausted = $derived(scans.length >= CATALOG.length);
  const scanCount = $derived(scans.length);

  function runScan() {
    const { drop, seen: next } = scanOnce(seen);
    seen = next;
    if (!drop) return;
    scans = [...scans, drop];
    if (matchesWatchlist(drop, watchlist)) {
      alerts = [{ ...drop, channel: 'SMS + email' }, ...alerts];
    }
  }

  function reset() {
    seen = new Set();
    scans = [];
    alerts = [];
  }
</script>

<div class="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
  <div class="border-b border-zinc-800 px-5 py-4 sm:px-6">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-base font-bold text-zinc-100">Drop-alert simulator</h3>
      <span class="text-xs font-medium text-zinc-500">Wax · {scanCount} scan{scanCount === 1 ? '' : 's'} run</span>
    </div>
    <p class="mt-1 text-sm text-zinc-400">
      The engine's scan loop in miniature: each scan surfaces one new drop from
      the shops and fires an alert when it matches your watchlist.
    </p>
  </div>

  <div class="px-5 py-5 sm:px-6">
    <label for="watchlist" class="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
      Artists I'm watching
    </label>
    <div class="flex flex-col gap-2.5 sm:flex-row">
      <input
        id="watchlist"
        type="text"
        bind:value={watchlistText}
        placeholder="MF DOOM, Sun Kil Moon"
        class="min-w-0 flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-amber-400 focus:outline-none"
      />
      <div class="flex gap-2.5">
        <button
          onclick={runScan}
          disabled={exhausted}
          class="flex-1 rounded-lg bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400 sm:flex-none"
        >
          Run scan
        </button>
        <button
          onclick={reset}
          class="rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-semibold text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Reset
        </button>
      </div>
    </div>

    <div class="mt-6 grid gap-6 lg:grid-cols-2">
      <!-- Scan log -->
      <div>
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">Scan log</h4>
        {#if scans.length === 0}
          <p class="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-600">
            No scans yet — hit <span class="font-semibold text-zinc-400">Run scan</span> to poll the shops.
          </p>
        {:else}
          <ul class="space-y-1.5 text-sm">
            {#each scans as drop (drop.id)}
              <li class="flex items-start gap-2.5 rounded-lg bg-zinc-950/60 px-3.5 py-2.5">
                <span class="mt-0.5 shrink-0 font-mono text-xs text-zinc-600">{drop.detectedAt}</span>
                <span class="min-w-0">
                  <span class="font-semibold text-zinc-200">{drop.artist}</span>
                  <span class="text-zinc-500"> — {drop.title}</span>
                  <span class="block text-xs text-zinc-600 sm:inline sm:pl-1">{drop.source}</span>
                </span>
              </li>
            {/each}
          </ul>
        {/if}
        {#if exhausted}
          <p class="mt-2 text-xs text-zinc-600">Catalog exhausted — nothing new to detect. Hit Reset to scan again.</p>
        {/if}
      </div>

      <!-- Alerts -->
      <div>
        <h4 class="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Alerts ({alerts.length})
        </h4>
        {#if alerts.length === 0}
          <p class="rounded-lg border border-dashed border-zinc-800 px-4 py-6 text-center text-sm text-zinc-600">
            Quiet so far. Add a watched artist above and scan again — matching
            drops trigger SMS + email alerts here.
          </p>
        {:else}
          <ul class="space-y-2.5">
            {#each alerts as alert (alert.id)}
              <li class="rounded-xl border border-amber-500/30 bg-amber-500/[0.07] px-4 py-3.5">
                <div class="flex flex-wrap items-center justify-between gap-1.5">
                  <p class="text-sm font-bold text-zinc-100">{alert.title}</p>
                  <span class="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                    {formatPrice(alert.price)}
                  </span>
                </div>
                <p class="mt-1 text-xs text-zinc-400">
                  {alert.artist} · {alert.format} · {alert.source}
                </p>
                <p class="mt-1.5 text-xs font-medium text-amber-400/90">⚡ Alert sent via {alert.channel}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</div>
