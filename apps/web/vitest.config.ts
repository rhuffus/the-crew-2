import { defineConfig } from 'vitest/config'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [TanStackRouterVite({ target: 'react', autoCodeSplitting: true }), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    coverage: {
      provider: 'v8',
      exclude: ['src/routeTree.gen.ts'],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
})
