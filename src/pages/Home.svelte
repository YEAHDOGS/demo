<script>
  import ProjectCard from '../components/ProjectCard.svelte';
  import SectionHeader from '../components/SectionHeader.svelte';
  import projects from '../data/projects.json';

  const featured = projects.filter((p) => p.featured);
</script>

<section class="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pt-20">
  <p class="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">DOGS Ecosystem</p>
  <h1 class="max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-zinc-50 sm:text-6xl">
    We build things.<br />Then we ship them.
  </h1>
  <p class="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
    This is the public workbench of DOGS — the portfolio where everything the
    ecosystem ships gets showcased, demoed, and linked. No slides. Live links
    or it didn't happen.
  </p>
  <div class="mt-8 flex flex-wrap gap-3">
    <a
      href="#/work"
      class="rounded-full bg-amber-400 px-6 py-3 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300"
    >
      Browse the work
    </a>
    <a
      href="#/about"
      class="rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
    >
      What is DOGS?
    </a>
  </div>
</section>

<section class="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
  <SectionHeader kicker="Featured" title="Ships in the water" />
  <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    {#each featured as project}
      <ProjectCard {project} />
    {/each}
  </div>
  <div class="mt-8 text-center">
    <a href="#/work" class="text-sm font-semibold text-zinc-400 underline-offset-4 hover:text-zinc-100 hover:underline">
      See everything →
    </a>
  </div>
</section>
