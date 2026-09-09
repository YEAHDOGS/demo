<script>
  import Badge from '../components/Badge.svelte';
  import projects from '../data/projects.json';

  /** @type {{ slug: string }} */
  const { slug } = $props();

  const project = $derived(projects.find((p) => p.slug === slug));

  const SECTIONS = [
    ['problem', 'The problem'],
    ['build', 'The build'],
    ['result', 'The result'],
  ];
</script>

<div class="mx-auto max-w-3xl px-5 py-12 sm:px-8">
  {#if project}
    <a href="#/work" class="mb-6 inline-block text-sm font-medium text-zinc-500 hover:text-zinc-200">← All work</a>
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-400/90">Case study</p>
    <h1 class="text-3xl font-bold tracking-tight text-zinc-50 sm:text-5xl">{project.name}</h1>
    <p class="mt-4 text-lg leading-relaxed text-zinc-300">{project.pitch}</p>

    <div class="mt-6 flex flex-wrap items-center gap-2">
      {#each project.stack as tech}
        <Badge text={tech} />
      {/each}
    </div>

    <div class="mt-6 flex flex-wrap gap-3">
      {#if project.liveUrl}
        <a
          href={project.liveUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-zinc-950 transition-colors hover:bg-amber-300"
        >
          Open the live site →
        </a>
      {/if}
      {#if project.repoUrl}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="rounded-full border border-zinc-700 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:text-white"
        >
          Source on GitHub
        </a>
      {/if}
    </div>

    {#each SECTIONS as [key, label]}
      <section class="mt-10">
        <h2 class="mb-3 text-xl font-semibold text-zinc-100">{label}</h2>
        <p class="leading-relaxed text-zinc-400">{project[key]}</p>
      </section>
    {/each}
  {:else}
    <h1 class="text-3xl font-bold text-zinc-50">No case study for “{slug}” yet.</h1>
    <p class="mt-4 text-zinc-400">
      It's either still in the shop or hasn't graduated from skeleton to shipped.
    </p>
    <a href="#/work" class="mt-6 inline-block text-sm font-semibold text-amber-400 hover:underline">← Back to the work</a>
  {/if}
</div>
