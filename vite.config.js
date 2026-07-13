import { defineConfig } from 'vite'
import { resolve } from 'path'
import pkg from './package.json'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['../tests/**/*.test.ts'],
  },
  root: 'src',
  envDir: '..',
  plugins: [
    {
      name: 'inject-app-version',
      transformIndexHtml(html) {
        return html.replace('%APP_VERSION%', pkg.version)
      },
    },
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { test: /node_modules\/xlsx/, name: 'xlsx' },
            { test: /node_modules\/chart\.js/, name: 'charts' },
            { test: /node_modules\/(@supabase|bootstrap)/, name: 'vendor' },
          ],
        },
      },
    },
  },
})