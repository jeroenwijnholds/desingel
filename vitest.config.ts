import { defineConfig } from 'vitest/config'

// Unit-tests voor de pure logica in composables (datums, tijden, links).
// TZ=UTC zoals de CI-build: juist daar gingen NL-datums eerder mis.
export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    environment: 'node',
    env: { TZ: 'UTC' },
  },
})
