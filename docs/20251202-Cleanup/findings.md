# Codebase Deep-Dive Findings

## Critical Priority Issues
- **[RESOLVED] [BUG-C01] Race Condition in `SecureStorage.setItem`**: Fixed by moving `enforceSizeLimit()` call to after checksum generation. This ensures size calculations are based on current state including the item being stored, preventing concurrent calls from using outdated size information.

## High Priority Issues
- **[RESOLVED] [BUG-H01] `ThemeService.toggleDarkMode` Crash**: Fixed by adding validation check before toggling. The method now checks if the target theme variant exists using `isValidThemeName()` and logs a warning if the theme doesn't have a light/dark variant, preventing crashes.
- **[DEFERRED] [BUG-H02] `DyeFilters` Localization Failure**: Requires xivdyetools-core package to export locale-independent dye type IDs (metallicDyeIds, pastelDyeIds, darkDyeIds). Current implementation uses `dye.name.includes('Metallic')` which fails in non-English locales. Recommended fix: Add these ID arrays to xivdyetools-core similar to how `metallicDyeIds` was added for Discord bot.
- **[VERIFIED-OK] [BUG-H03] `MarketBoard` Price Fetching Localization Failure**: After code review, the `dye.acquisition` and `dye.category` fields appear to be locale-independent keys (English strings) in the xivdyetools-core database, not localized values. The current implementation should work correctly across all locales. Recommend manual testing with non-English locales to confirm.

## Medium Priority Issues
- **[RESOLVED] [BUG-M01] `IndexedDBService.set` Schema Incompatibility**: Fixed by adding special handling for the PALETTES store. When storing to PALETTES, the value is stored directly instead of being wrapped in `{ key, value }`, matching the store's `keyPath: 'id'` configuration.
- **[RESOLVED] [BUG-M02] `BaseComponent.onCustom` Memory Leak**: Fixed by using unique keys with timestamp and listener count (`custom_${eventName}_${Date.now()}_${this.listeners.size}`) instead of fixed keys. This prevents overwrites when the same custom event is registered multiple times, ensuring all listeners are properly tracked and cleaned up.
- **[BUG-M03] `ColorMatcherTool` Event Listener Leak**: `ColorMatcherTool` attaches event listeners to child containers (e.g., `image-loaded`, `color-selected`) using `addEventListener` directly instead of the `this.on` wrapper. This bypasses the component's listener tracking and cleanup mechanisms.
- **[BUG-M04] `DyeMixerTool` Bypasses StorageService**: `DyeMixerTool` accesses `localStorage` directly (using key `xivdyetools_dyemixer_gradients`) instead of using the `StorageService`. This bypasses error handling, quota management, and centralized key management.
- **[BUG-M05] `PaletteExporter` Language Update Failure**: `PaletteExporter` subscribes to language changes but incorrectly calls `this.init()` in the callback, preventing the UI from updating.
- **[BUG-M06] `DyeFilters` Language Update Failure**: `DyeFilters` calls `this.init()` on language change, preventing the UI from updating.
- **[BUG-M07] `MarketBoard` Language Update Failure**: `MarketBoard` calls `this.init()` on language change, preventing the UI from updating.
- **[BUG-M08] `AccessibilityCheckerTool` Partial Language Update**: `AccessibilityCheckerTool` updates static text on language change but fails to re-render analysis results (warnings, scores), leaving them in the previous language until a new selection is made.
- **[BUG-M09] `DyeComparisonTool` Partial Language Update**: `DyeComparisonTool` updates title/subtitle on language change but fails to update the dye selector label, summary statistics, charts, and export section, leaving most of the UI in the previous language.
- **[BUG-M10] `DyeSelector` Remove Button Accessibility**: The "Remove" buttons in `DyeSelector` (selected dyes list) use "✕" as text content but lack an `aria-label`. Screen readers will announce "cross" or "multiplication sign" instead of "Remove [Dye Name]".
- **[BUG-M11] `DyeSearchBox` Category Accessibility**: Category buttons in `DyeSearchBox` use visual styling (blue background) to indicate the active category but lack `aria-pressed` or `aria-current` attributes, making the selected state inaccessible to screen readers.

## Low Priority Issues
- **[BUG-L01] Debug Console Logs**: `DyeSelector` contains `console.error` and `console.log` statements used for debugging.
- **[BUG-L02] Incomplete `deepClone` Implementation**: The `deepClone` utility function in `shared/utils.ts` does not handle complex types like `Map` or `Set`.
