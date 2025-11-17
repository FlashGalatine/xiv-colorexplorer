/** @type {import('tailwindcss').Config} */
module.exports = {
  // Note: darkMode uses default 'media' query based on prefers-color-scheme
  // However, our custom theme system (CSS variables + theme classes) overrides this
  // and provides the actual dark/light mode behavior through CSS custom properties
  content: [
    "./index.html",  // Scan main HTML file
    "./src/**/*.{ts,tsx}",  // Also scan TypeScript/TSX files
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter var',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
        heading: [
          'Outfit',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'Consolas',
          'Monaco',
          'Courier New',
          'monospace',
        ],
      },
    },
  },
  plugins: [],
}
