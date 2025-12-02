# Codebase Deep-Dive Findings

## Critical Priority Issues
- **[RESOLVED] [BUG-C01] Race Condition in `SecureStorage.setItem`**: Fixed by moving `enforceSizeLimit()` call to after checksum generation. This ensures size calculations are based on current state including the item being stored, preventing concurrent calls from using outdated size information.

## High Priority Issues
- **[RESOLVED] [BUG-H01] `ThemeService.toggleDarkMode` Crash**: Fixed by adding validation check before toggling. The method now checks if the target theme variant exists using `isValidThemeName()` and logs a warning if the theme doesn't have a light/dark variant, preventing crashes.
- **[BUG-H02] `DyeFilters` Localization Failure**: The `DyeFilters` component uses hardcoded English string checks (e.g., `startsWith('dark')`, `includes('Metallic')`) to filter dyes. This logic will fail for non-English locales where dye names do not follow these specific English patterns.
- **[BUG-H03] `MarketBoard` Price Fetching Localization Failure**: `MarketBoard.shouldFetchPrice` relies on matching `dye.acquisition` against English constants defined in `PRICE_CATEGORIES`. If `dye.acquisition` values are localized in the dye database, this check will fail, preventing price fetching for valid dyes in non-English locales.

## Medium Priority Issues
- **[BUG-M01] `IndexedDBService.set` Schema Incompatibility**: The `IndexedDBService.set` method stores data by wrapping it in an object `{ key, value }`. However, the `STORES.PALETTES` object store is configured with `keyPath: 'id'`. This creates a schema mismatch, as palette objects are expected to have an `id` property at their root.
- **[BUG-M02] `BaseComponent.onCustom` Memory Leak**: The `onCustom` method uses a fixed key format `custom_${eventName}` in the `listeners` map. If called multiple times for the same event, it overwrites the previous entry, causing older listeners to be lost from tracking and not removed during cleanup.
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
