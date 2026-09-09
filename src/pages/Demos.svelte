<script>
  import DropSimulator from '../components/DropSimulator.svelte';
  import SectionHeader from '../components/SectionHeader.svelte';
</script>

<div class="mx-auto max-w-6xl px-5 py-12 sm:px-8">
  <SectionHeader kicker="Playground" title="Live demos" />
  <p class="max-w-2xl leading-relaxed text-zinc-400">
    Embedded experiments and interactive toys from across the ecosystem — mini
    versions of real workstream systems, running entirely in your browser.
  </p>

  <div class="mt-8">
    <DropSimulator />
  </div>

  <p class="mt-8 max-w-2xl text-sm text-zinc-500">
    When another workstream has something interactive worth showing — a Phoenix
    disk-map preview, a Chains save-file timeline — it graduates here next.
  </p>
</div>
