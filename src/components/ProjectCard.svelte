<script>
  import Badge from './Badge.svelte';

  /** @type {{ project: import('../data/projects.json') extends (infer T)[] ? T : never }} */
  const { project } = $props();

  const STATUS_LABEL = {
    live: 'Live',
    'staging-live': 'Staging live',
    'in-progress': 'In progress',
    concept: 'Concept',
    paused: 'Paused',
    archived: 'Archived',
  };
  const STATUS_CLASS = {
    live: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    'staging-live': 'border-sky-500/40 bg-sky-500/10 text-sky-300',
    'in-progress': 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    concept: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    paused: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    archived: 'border-zinc-600/60 bg-zinc-700/20 text-zinc-400',
  };
</script>

<a
  href="#/work/{project.slug}"
  class="group flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 transition-all hover:-translate-y-1 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/40"
>
  <div class="flex h-36 items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950">
    <span class="px-6 text-center text-lg font-bold tracking-tight text-zinc-200 group-hover:text-white">
      {project.name}
    </span>
  </div>
  <div class="flex flex-1 flex-col gap-3 p-5">
    <div class="flex items-center justify-between gap-2">
      <span
        class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium {STATUS_CLASS[project.status]}"
      >
        {STATUS_LABEL[project.status]}
      </span>
      {#if project.liveUrl}
        <span class="text-xs font-medium text-zinc-500 group-hover:text-amber-400">Visit live →</span>
      {/if}
    </div>
    <p class="text-sm leading-relaxed text-zinc-400">{project.pitch}</p>
    <div class="mt-auto flex flex-wrap gap-1.5 pt-1">
      {#each project.stack as tech}
        <Badge text={tech} />
      {/each}
    </div>
  </div>
</a>
