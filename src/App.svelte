<script>
  import { onMount } from 'svelte';
  import Nav from './components/Nav.svelte';
  import Home from './pages/Home.svelte';
  import Work from './pages/Work.svelte';
  import WorkDetail from './pages/WorkDetail.svelte';
  import Demos from './pages/Demos.svelte';
  import About from './pages/About.svelte';
  import NotFound from './pages/NotFound.svelte';
  import { currentRoute, subscribeRoute } from './lib/router.js';

  let route = $state(currentRoute());

  onMount(() => {
    const unsub = subscribeRoute((r) => {
      route = r;
      window.scrollTo(0, 0);
    });
    return unsub;
  });

  const LINKS = [
    { href: '#/', label: 'Home' },
    { href: '#/work', label: 'Work' },
    { href: '#/demos', label: 'Demos' },
    { href: '#/about', label: 'About' },
  ];
</script>

<div class="flex min-h-screen flex-col">
  <header class="sticky top-0 z-10 border-b border-zinc-800/80 bg-[#0a0a0c]/90 backdrop-blur">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
      <a href="#/" class="flex items-center gap-2.5">
        <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-sm font-extrabold text-zinc-950">D</span>
        <span class="text-sm font-bold tracking-[0.2em] text-zinc-100 max-[400px]:hidden">DOGS</span>
      </a>
      <nav class="flex items-center gap-1" aria-label="Main">
        {#each LINKS as link}
          <Nav href={link.href} label={link.label} />
        {/each}
      </nav>
    </div>
  </header>

  <main class="flex-1">
    {#if route.page === 'home'}
      <Home />
    {:else if route.page === 'work'}
      <Work />
    {:else if route.page === 'work-detail'}
      <WorkDetail slug={route.slug} />
    {:else if route.page === 'demos'}
      <Demos />
    {:else if route.page === 'about'}
      <About />
    {:else}
      <NotFound />
    {/if}
  </main>

  <footer class="border-t border-zinc-800/80">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <p>© 2026 DOGS — the work speaks first.</p>
      <a
        href="https://github.com/YEAHDOGS/demo"
        target="_blank"
        rel="noopener noreferrer"
        class="font-medium hover:text-zinc-200"
      >
        Source on GitHub
      </a>
    </div>
  </footer>
</div>
