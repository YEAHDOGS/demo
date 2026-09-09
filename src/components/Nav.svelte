<script>
  /** @type {{ href: string, label: string }} */
  const { href, label } = $props();
  const active = $derived(
    typeof window !== 'undefined' &&
      (window.location.hash === href ||
        (href === '#/' && (window.location.hash === '' || window.location.hash === '#')))
  );
</script>

<a
  {href}
  class="rounded-full px-2.5 py-2 text-[13px] font-medium transition-colors sm:px-4 sm:text-sm {active
    ? 'bg-zinc-100 text-zinc-950'
    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'}"
  aria-current={active ? 'page' : undefined}
>
  {label}
</a>
