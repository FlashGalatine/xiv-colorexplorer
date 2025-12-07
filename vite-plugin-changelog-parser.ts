/**
 * Vite plugin to parse CHANGELOG.md and provide changelog data at build time
 *
 * This plugin reads CHANGELOG.md from the project root, extracts version entries with their
 * highlights, and exposes them as a virtual module that can be imported.
 *
 * Usage in code:
 *   import { changelogEntries } from 'virtual:changelog'
 *
 * @module vite-plugin-changelog-parser
 */
import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ============================================================================
// Types
// ============================================================================

interface ChangelogEntry {
  version: string;
  date: string;
  highlights: string[];
}

// ============================================================================
// Parser Configuration
// ============================================================================

const MAX_HIGHLIGHTS_PER_VERSION = 6;
const MAX_VERSIONS_TO_INCLUDE = 6;
const MAX_HIGHLIGHT_LENGTH = 100; // Truncate very long highlights

// ============================================================================
// Changelog Parser
// ============================================================================

/**
 * Parse CHANGELOG.md and extract version entries
 */
function parseChangelog(content: string): ChangelogEntry[] {
  const entries: ChangelogEntry[] = [];

  // Regex to match version headers: ## [2.3.0] - 2025-11-30
  const versionHeaderRegex = /^## \[(\d+\.\d+\.\d+)\] - (\d{4}-\d{2}-\d{2})/gm;

  // Find all version headers with their positions
  const headers: Array<{ version: string; date: string; startIndex: number }> = [];
  let match;

  while ((match = versionHeaderRegex.exec(content)) !== null) {
    headers.push({
      version: match[1],
      date: match[2],
      startIndex: match.index,
    });
  }

  // Extract highlights for each version section
  for (let i = 0; i < Math.min(headers.length, MAX_VERSIONS_TO_INCLUDE); i++) {
    const header = headers[i];
    const nextHeader = headers[i + 1];

    // Get the section content between this header and the next (or end of file)
    const sectionStart = header.startIndex;
    const sectionEnd = nextHeader ? nextHeader.startIndex : content.length;
    const sectionContent = content.slice(sectionStart, sectionEnd);

    // Extract bullet points from this section
    const highlights = extractHighlights(sectionContent);

    if (highlights.length > 0) {
      entries.push({
        version: header.version,
        date: header.date,
        highlights,
      });
    }
  }

  return entries;
}

/**
 * Extract highlight bullet points from a version section
 *
 * Strategy:
 * 1. Find all lines starting with `- ` (bullet points)
 * 2. Prefer bullet points that start with action verbs (Fixed, Added, Updated, etc.)
 * 3. Skip very technical or internal-only changes
 * 4. Truncate overly long highlights
 */
function extractHighlights(sectionContent: string): string[] {
  const highlights: string[] = [];
  const lines = sectionContent.split('\n');

  // Patterns to identify user-facing changes (prioritize these)
  const userFacingPatterns = [
    /^- (?:Fixed|Added|New|Updated|Improved|Enhanced|Implemented|Created)/i,
    /^- .*(?:feature|support|option|button|modal|dialog|menu|theme|language)/i,
  ];

  // Patterns to skip (internal/technical changes)
  const skipPatterns = [
    /^- .*(?:refactor|internal|technical|test coverage|branch coverage)/i,
    /^- .*(?:TypeScript|eslint|vitest|npm|dependency)/i,
  ];

  // First pass: collect all bullet points
  const allBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Match bullet points (- text)
    if (trimmed.startsWith('- ')) {
      let highlight = trimmed.slice(2).trim();

      // Skip empty or very short bullets
      if (highlight.length < 10) continue;

      // Skip technical/internal changes
      const shouldSkip = skipPatterns.some(pattern => pattern.test(trimmed));
      if (shouldSkip) continue;

      // Truncate if too long
      if (highlight.length > MAX_HIGHLIGHT_LENGTH) {
        highlight = highlight.slice(0, MAX_HIGHLIGHT_LENGTH - 3) + '...';
      }

      // Clean up markdown formatting
      highlight = highlight
        .replace(/`([^`]+)`/g, '$1') // Remove code backticks
        .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // Remove links, keep text

      allBullets.push(highlight);
    }
  }

  // Second pass: prioritize user-facing changes
  const prioritized: string[] = [];
  const other: string[] = [];

  for (const bullet of allBullets) {
    const isPriority = userFacingPatterns.some(pattern =>
      pattern.test('- ' + bullet)
    );

    if (isPriority) {
      prioritized.push(bullet);
    } else {
      other.push(bullet);
    }
  }

  // Combine prioritized first, then others, up to max
  highlights.push(...prioritized.slice(0, MAX_HIGHLIGHTS_PER_VERSION));

  if (highlights.length < MAX_HIGHLIGHTS_PER_VERSION) {
    const remaining = MAX_HIGHLIGHTS_PER_VERSION - highlights.length;
    highlights.push(...other.slice(0, remaining));
  }

  return highlights;
}

// ============================================================================
// Vite Plugin
// ============================================================================

const VIRTUAL_MODULE_ID = 'virtual:changelog';
const RESOLVED_VIRTUAL_MODULE_ID = '\0' + VIRTUAL_MODULE_ID;

export function changelogParser(): Plugin {
  let changelogPath: string;
  let cachedEntries: ChangelogEntry[] | null = null;

  return {
    name: 'changelog-parser',

    configResolved(config) {
      // Resolve the changelog path relative to project root
      changelogPath = resolve(config.root, '..', 'CHANGELOG.md');
    },

    resolveId(id) {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
    },

    load(id) {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        // Parse changelog if not cached
        if (!cachedEntries) {
          try {
            const content = readFileSync(changelogPath, 'utf-8');
            cachedEntries = parseChangelog(content);
            console.log(`[changelog-parser] Parsed ${cachedEntries.length} changelog entries`);
          } catch (error) {
            console.warn('[changelog-parser] Failed to parse CHANGELOG.md:', error);
            cachedEntries = [];
          }
        }

        // Export as ES module
        return `export const changelogEntries = ${JSON.stringify(cachedEntries, null, 2)};`;
      }
    },

    // Watch the changelog file for changes in dev mode
    configureServer(server) {
      server.watcher.add(changelogPath);
      server.watcher.on('change', (path) => {
        if (path === changelogPath) {
          console.log('[changelog-parser] CHANGELOG.md changed, invalidating cache');
          cachedEntries = null;

          // Invalidate the virtual module to trigger HMR
          const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MODULE_ID);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
          }
        }
      });
    },
  };
}
