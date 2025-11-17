/** @type {import('tailwindcss').Config} */
module.exports = {
  // Note: darkMode uses default 'media' query based on prefers-color-scheme
  // However, our custom theme system (CSS variables + theme classes) overrides this
  // and provides the actual dark/light mode behavior through CSS custom properties
  content: [
    "./**/*.html",  // Scan all HTML files in root and subdirectories
    "./src/**/*.{ts,tsx}",  // Also scan TypeScript/TSX files
  ],
  theme: {
    extend: {
      // Add any custom theme extensions here
      // Example: custom colors, fonts, etc.
    },
  },
  plugins: [],
}
