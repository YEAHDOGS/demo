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
  class="rounded-full px-4 py-2 text-sm font-medium transition-colors {active
    ? 'bg-zinc-100 text-zinc-950'
    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'}"
  aria-current={active ? 'page' : undefined}
>
  {label}
</a>
