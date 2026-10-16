import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['src/**/*.test.ts'],
    // Run in the salon's time zone so date handling is tested against a
    // non-UTC offset (Chile is UTC-3 or UTC-4 depending on the season).
    env: { TZ: 'America/Santiago' },
  },
})
