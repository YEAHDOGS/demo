<script>
  import ProjectCard from '../components/ProjectCard.svelte';
  import SectionHeader from '../components/SectionHeader.svelte';
  import projects from '../data/projects.json';

  const live = projects.filter((p) => p.status === 'live');
  const building = projects.filter((p) => p.status === 'in-progress');
</script>

<div class="mx-auto max-w-6xl px-5 py-12 sm:px-8">
  <SectionHeader kicker="Portfolio" title="Everything we ship" />

  <h2 class="mb-4 text-lg font-semibold text-emerald-300">Live</h2>
  <div class="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each live as project}
      <ProjectCard {project} />
    {/each}
  </div>

  <h2 class="mb-4 text-lg font-semibold text-amber-300">In the shop</h2>
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each building as project}
      <ProjectCard {project} />
    {/each}
  </div>

  <p class="mt-12 text-sm text-zinc-500">
    Dead skeletons get a line in the index at most — this grid is for work with a
    pulse. The org holds ~20 more experiments; they graduate here when they ship.
  </p>
</div>
