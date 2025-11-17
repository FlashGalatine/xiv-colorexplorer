import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'src',
  base: '/',
  publicDir: '../public',

  build: {
    outDir: '../dist',
    minify: 'esbuild',
    sourcemap: true,
    target: 'ES2020',
    reportCompressedSize: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Extract vendor dependencies (Lit framework)
          if (id.includes('node_modules')) {
            if (id.includes('lit')) {
              return 'vendor-lit';
            }
            return 'vendor';
          }

          // Split tool components into separate chunks (lazy-loaded)
          if (id.includes('src/components/harmony-generator-tool.ts') || id.includes('src/components/harmony-type.ts') || id.includes('src/components/color-wheel-display.ts')) {
            return 'tool-harmony';
          }
          if (id.includes('src/components/color-matcher-tool.ts') || id.includes('src/components/image-upload-display.ts')) {
            return 'tool-matcher';
          }
          if (id.includes('src/components/accessibility-checker-tool.ts')) {
            return 'tool-accessibility';
          }
          if (id.includes('src/components/dye-comparison-tool.ts') || id.includes('src/components/dye-comparison-chart.ts')) {
            return 'tool-comparison';
          }
          if (id.includes('src/components/dye-mixer-tool.ts')) {
            return 'tool-mixer';
          }

          // Keep shared services in main bundle (used by all tools)
          // - DyeService, ColorService, APIService, ThemeService, StorageService
          // - These stay in main bundle for optimal caching
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
      '@assets': resolve(__dirname, './assets'),
    },
  },

  css: {
    postcss: './postcss.config.js',
  },
})
