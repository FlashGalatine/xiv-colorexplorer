/**
 * Asynchronously load Google Fonts to prevent render blocking
 * This script loads the font stylesheet after the page has started rendering
 */
(function() {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap';
  link.rel = 'stylesheet';
  link.media = 'all';
  document.head.appendChild(link);
})();

