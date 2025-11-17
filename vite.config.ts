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
    // Code splitting will be configured in Phase 12.2 after services are created
    // rollupOptions: {
    //   output: {
    //     manualChunks: {
    //       'vendor': ['node_modules'],
    //       'color-algorithms': ['./src/services/color-service.ts'],
    //       'api-integration': ['./src/services/api-service.ts'],
    //     },
    //   },
    // },
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
