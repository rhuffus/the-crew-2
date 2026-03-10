import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    root: './src',
    setupFiles: ['./src/vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
