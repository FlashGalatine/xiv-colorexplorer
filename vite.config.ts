import { defineConfig } from 'vite'
import { resolve } from 'path'
import { asyncCss } from './vite-plugin-async-css'
import { changelogParser } from './vite-plugin-changelog-parser'
import pkg from './package.json'

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
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
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Extract vendor dependencies with higher priority
          if (id.includes('node_modules')) {
            // Separate Lit framework for better caching
            if (id.includes('lit') || id.includes('@lit')) {
              return 'vendor-lit';
            }
            // All other vendors (Tailwind, utilities, etc.)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }

          // Split tool components into separate chunks (lazy-loaded)
          // Each tool loads independently when user selects it
          if (
            id.includes('src/components/harmony-generator-tool.ts') ||
            id.includes('src/components/harmony-type.ts') ||
            id.includes('src/components/color-wheel-display.ts')
          ) {
            return 'tool-harmony';
          }
          if (
            id.includes('src/components/color-matcher-tool.ts') ||
            id.includes('src/components/image-upload-display.ts')
          ) {
            return 'tool-matcher';
          }
          if (id.includes('src/components/accessibility-checker-tool.ts')) {
            return 'tool-accessibility';
          }
          if (
            id.includes('src/components/dye-comparison-tool.ts') ||
            id.includes('src/components/dye-comparison-chart.ts')
          ) {
            return 'tool-comparison';
          }
          if (id.includes('src/components/dye-mixer-tool.ts')) {
            return 'tool-mixer';
          }

          // Note: Shared services stay in main bundle (BaseComponent, ThemeSwitcher, etc.)
          // These are needed immediately and used by all tools, so main bundle is optimal
          // Services: DyeService, ColorService, APIService, ThemeService, StorageService
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

  plugins: [
    asyncCss(),
    changelogParser(),
  ],
})
