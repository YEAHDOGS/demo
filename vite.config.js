import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import legacy from '@vitejs/plugin-legacy'

// GitHub Pages project site: https://yeahdogs.github.io/demo/
// The base MUST match the repo name so assets resolve under /demo/.
export default defineConfig({
  base: '/demo/',
  plugins: [
    tailwindcss(),
    svelte(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
  ],
})
