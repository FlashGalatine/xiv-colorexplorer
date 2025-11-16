import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: '/',

  build: {
    outDir: '../dist',
    minify: 'esbuild',
    sourcemap: true,
    target: 'ES2020',
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['node_modules'],
          'color-algorithms': [
            './src/services/color-service.ts',
            './src/apps/color-accessibility/logic.ts',
          ],
          'api-integration': [
            './src/services/api-service.ts',
            './src/components/market-prices/component.ts',
          ],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
    strictPort: false,
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@shared': resolve(__dirname, './src/shared'),
      '@apps': resolve(__dirname, './src/apps'),
      '@data': resolve(__dirname, './src/data'),
    },
  },

  css: {
    postcss: './postcss.config.js',
  },
})
