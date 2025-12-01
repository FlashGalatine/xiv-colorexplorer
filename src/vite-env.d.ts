/// <reference types="vite/client" />

/**
 * Virtual module type declarations for Vite plugins
 */

/**
 * Virtual changelog module provided by vite-plugin-changelog-parser
 *
 * This module is generated at build time by parsing docs/CHANGELOG.md
 */
declare module 'virtual:changelog' {
  interface ChangelogEntry {
    version: string;
    date: string;
    highlights: string[];
  }

  export const changelogEntries: ChangelogEntry[];
}
