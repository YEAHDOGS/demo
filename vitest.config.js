import { defineConfig } from 'vitest/config'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    // Force the browser build of Svelte so @testing-library/svelte
    // gets mount() from index-client instead of index-server.
    conditions: ["browser"],
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.js"],
    setupFiles: ["./src/test-setup.js"],
  },
})
