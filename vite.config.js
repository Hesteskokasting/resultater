import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['../tests/**/*.test.ts'],
  },
  root: 'src',
  envDir: '..',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/xlsx')) return 'xlsx'
          if (id.includes('node_modules/chart.js')) return 'charts'
          if (id.includes('node_modules/@supabase') || id.includes('node_modules/bootstrap')) return 'vendor'
        },
      },
    },
  },
})
