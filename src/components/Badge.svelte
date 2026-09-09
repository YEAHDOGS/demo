<script>
  /** @type {{ text: string }} */
  const { text } = $props();
</script>

<span
  class="inline-flex items-center rounded-full border border-zinc-700/80 bg-zinc-800/50 px-2.5 py-0.5 text-xs font-medium text-zinc-300"
>
  {text}
</span>
