#!/usr/bin/env node
/**
 * XIV Dye Tools - Bundle Size Monitor
 *
 * Checks build output sizes against defined limits.
 * Run after `npm run build` to verify bundle sizes stay within acceptable limits.
 *
 * Usage:
 *   npm run check-bundle-size
 *   node scripts/check-bundle-size.js
 *
 * Exit codes:
 *   0 - All bundles within limits
 *   1 - One or more bundles exceed limits
 */

import { readdirSync, statSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// Configuration
// ============================================================================

/**
 * Bundle size limits in bytes (uncompressed)
 * Actual gzipped sizes are ~30-40% smaller
 * Adjust these based on your performance targets
 */
const BUNDLE_LIMITS = {
  // Main bundles
  'index-': 35 * 1024,          // 35 KB - main entry JS
  'vendor-C': 55 * 1024,        // 55 KB - shared dependencies (not vendor-lit)
  'vendor-lit': 5 * 1024,       // 5 KB - lit-html
  
  // Tool chunks (lazy-loaded)
  'tool-harmony': 45 * 1024,    // 45 KB
  'tool-mixer': 30 * 1024,      // 30 KB
  'tool-matcher': 40 * 1024,    // 40 KB
  'tool-comparison': 35 * 1024, // 35 KB
  'tool-accessibility': 50 * 1024, // 50 KB (larger due to colorblindness)
  
  // CSS (Tailwind + custom styles)
  '.css': 40 * 1024,            // 40 KB
};

/**
 * Total bundle size limit (sum of all JS)
 */
const TOTAL_JS_LIMIT = 300 * 1024; // 300 KB total JS

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format bytes to human-readable string
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Get percentage of limit used
 */
function getPercentage(size, limit) {
  return ((size / limit) * 100).toFixed(1);
}

/**
 * Get color code for percentage (for terminal output)
 */
function getStatusEmoji(percentage) {
  if (percentage < 70) return '✅';
  if (percentage < 90) return '⚠️';
  return '❌';
}

// ============================================================================
// Main
// ============================================================================

function checkBundleSizes() {
  const distDir = join(__dirname, '..', 'dist');
  const assetsDir = join(distDir, 'assets');
  
  console.log('\n📦 Bundle Size Check\n');
  console.log('='.repeat(60));
  
  let hasErrors = false;
  let totalJsSize = 0;
  const results = [];
  
  try {
    const files = readdirSync(assetsDir);
    
    for (const file of files) {
      // Skip sourcemaps - they don't affect user bundle size
      if (file.endsWith('.map')) continue;
      const filePath = join(assetsDir, file);
      const stats = statSync(filePath);
      const size = stats.size;
      
      // Find matching limit
      let matchedLimit = null;
      let limitName = null;
      
      // Check CSS first (special case - match by extension)
      if (file.endsWith('.css')) {
        matchedLimit = BUNDLE_LIMITS['.css'];
        limitName = '.css';
      } else {
        // Match JS files by prefix
        for (const [name, limit] of Object.entries(BUNDLE_LIMITS)) {
          if (name === '.css') continue; // Skip CSS pattern for JS files
          if (file.includes(name) || file.startsWith(name)) {
            matchedLimit = limit;
            limitName = name;
            break;
          }
        }
      }
      
      // Track JS sizes for total
      if (file.endsWith('.js')) {
        totalJsSize += size;
      }
      
      if (matchedLimit) {
        const percentage = parseFloat(getPercentage(size, matchedLimit));
        const status = getStatusEmoji(percentage);
        const exceeds = size > matchedLimit;
        
        if (exceeds) hasErrors = true;
        
        results.push({
          file: basename(file),
          size,
          limit: matchedLimit,
          percentage,
          status,
          exceeds,
        });
      }
    }
    
    // Sort results by percentage (highest first)
    results.sort((a, b) => b.percentage - a.percentage);
    
    // Print results
    for (const r of results) {
      const sizeStr = formatBytes(r.size).padEnd(12);
      const limitStr = formatBytes(r.limit).padEnd(12);
      const pctStr = `${r.percentage}%`.padEnd(8);
      
      console.log(
        `${r.status} ${r.file.padEnd(35)} ${sizeStr} / ${limitStr} (${pctStr})`
      );
    }
    
    console.log('='.repeat(60));
    
    // Check total JS size
    const totalPct = parseFloat(getPercentage(totalJsSize, TOTAL_JS_LIMIT));
    const totalStatus = getStatusEmoji(totalPct);
    const totalExceeds = totalJsSize > TOTAL_JS_LIMIT;
    
    if (totalExceeds) hasErrors = true;
    
    console.log(
      `${totalStatus} ${'Total JS'.padEnd(35)} ${formatBytes(totalJsSize).padEnd(12)} / ${formatBytes(TOTAL_JS_LIMIT).padEnd(12)} (${totalPct}%)`
    );
    
    console.log('='.repeat(60));
    
    // Summary
    if (hasErrors) {
      console.log('\n❌ Bundle size check FAILED - one or more bundles exceed limits\n');
      process.exit(1);
    } else {
      console.log('\n✅ Bundle size check PASSED - all bundles within limits\n');
      process.exit(0);
    }
    
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error('❌ Error: dist/assets directory not found.');
      console.error('   Run `npm run build` first.\n');
    } else {
      console.error('❌ Error:', error.message);
    }
    process.exit(1);
  }
}

checkBundleSizes();

