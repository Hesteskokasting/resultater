import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src',
  envDir: '..',
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
