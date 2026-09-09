<script>
  /** @type {{ title: string, kicker?: string }} */
  const { title, kicker } = $props();
</script>

<header class="mb-8">
  {#if kicker}
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">{kicker}</p>
  {/if}
  <h1 class="text-3xl font-bold tracking-tight text-zinc-50 sm:text-4xl">{title}</h1>
</header>
