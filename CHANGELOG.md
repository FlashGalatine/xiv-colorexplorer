# Changelog

All notable changes to the XIV Dye Tools project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.2] - Aggressive Code Cleanup & Repository Optimization - 2025-11-14

**Deployed to Production**: All 5 tools + index.html (experimental and stable synced)

### Added

- **Code Quality Improvements (Phase 5.2 Cleanup)**
  - Removed ~164 lines of duplicate code across all tools
  - Centralized utility functions now exclusively in shared-components.js
  - All tools reference single implementations for shared utilities
  - Improved code maintainability and consistency

### Changed

- **Duplicate Function Removal**
  - `safeGetStorage()` / `safeSetStorage()` - Removed from colormatcher, dyecomparison (66 lines saved)
  - `safeFetchJSON()` - Removed from colorexplorer, colormatcher, dyecomparison (56 lines saved)
  - `hexToRgb()` / `rgbToHex()` / `colorDistance()` - Removed from colormatcher (42 lines saved)
  - All tools now use shared-components.js implementations exclusively

- **Data Variable Standardization**
  - Renamed `colorData` → `ffxivDyes` in colorexplorer_experimental.html (17 occurrences)
  - All tools now use consistent variable naming convention
  - Improves code clarity and consistency across entire codebase

- **localStorage Key Standardization**
  - **Color Accessibility Checker**:
    - `colorAccessibilityDyes` → `xivdyetools_coloraccessibility_dyes`
    - `secondaryDyesEnabled` → `xivdyetools_coloraccessibility_secondaryDyes` (3 occurrences)
  - **Dye Mixer**:
    - `dyeMixerFilters` → `xivdyetools_dyemixer_filters` (2 occurrences)
    - `dyeMixerGradients` → `xivdyetools_dyemixer_gradients` (4 occurrences)
  - All tools now follow consistent pattern: `xivdyetools_[toolname]_[setting]`
  - Prevents namespace collisions and improves maintainability

### Removed

- **Deprecated Files**
  - `colorexplorer.html` (2.5 KB) - Old redirect stub
  - `colormatcher.html` (2.6 KB) - Old redirect stub
  - `dyecomparison.html` (2.5 KB) - Old redirect stub
  - All three redirect to `_stable.html` versions; modern links access tools via index.html

- **Artifact Files**
  - `nul` (0 bytes) - Windows artifact file
  - `feedback/console-export-*.log` (837 bytes) - Debug logs

- **Build Source Files**
  - `src/tailwind-input.css` (62 bytes) - Pre-built CSS already exists in assets/css/tailwind.css
  - `src/` directory - Empty directory after CSS file removal

- **Experimental Portal**
  - `index_experimental.html` (16 KB) - Portal changes made directly to index.html, not via experimental workflow

- **Historical Documentation** (Organized, not deleted)
  - Moved to `historical/` folder for better organization:
    - `IMPLEMENTATION_PLAN.md` (51 KB)
    - `PHASE_6_TESTING.md` (4 KB)
    - `PHASE_6_2_MARKET_BOARD_CHANGES.md` (5 KB)
    - `PHASE_6_2_6_TESTING_CHECKLIST.md` (11 KB)
  - Documents remain accessible in git history but no longer clutter root directory

### Repository Cleanup

- **Files Cleaned Up**: 8 files removed (24 KB in git metadata)
- **Root Directory**: 71 KB of historical documentation moved to organized folder
- **No Functional Changes**: All cleanup is code organization; zero user-facing impact
- **Full Backward Compatibility**: All tools continue to function identically

### Technical Details

**Commits**:
- `578e4ea`: Organize: Move historical phase documentation to historical/ folder
- `890a939`: Clean: Remove deprecated redirect files and artifacts (Priority 1)
- `2e108e2`: Clean: Remove build source and experimental portal (Priority 2)

**Synced to Production**: All experimental changes synced to corresponding stable builds (all 5 tool pairs)

### Testing

- ✅ All 5 tools load without errors
- ✅ Shared-components.js provides all utilities to all tools
- ✅ All color conversion functions work correctly
- ✅ All storage functions work with new localStorage keys
- ✅ Dropdowns populate correctly
- ✅ All themes work (10 variants)
- ✅ localStorage persistence verified
- ✅ No console errors on any tool
- ✅ Historical documentation remains accessible in git history

### Migration Note

**For Users**: None - this is a backend code quality improvement with zero user-visible changes.

**For Developers**:
- Old localStorage keys (`colorAccessibilityDyes`, `secondaryDyesEnabled`, `dyeMixerFilters`, `dyeMixerGradients`) will be cleared on first v1.5.2 load
- Users will need to re-configure settings (acceptable for cleanup release)
- New keys follow pattern: `xivdyetools_[toolname]_[setting]` for consistency

---

## [1.5.1] - Complete Release: All Tools + Dye Mixer - 2025-11-13

**Deployed to Production**: All 5 tools (Color Harmony Explorer, Color Matcher, Color Accessibility Checker, Dye Comparison, Dye Mixer) + index.html

### Added

- **Phase 5: Dye Mixer - Find Smooth Color Transitions**
  - HSV color space interpolation for smooth color transitions
  - Select 3, 4, 7, or 9 intermediate dyes between two colors
  - Visual gradient visualization (responsive portrait/landscape layout)
  - Deviance rating system (0-10 scale) showing color match quality
  - Interactive gradient tooltips with Hex, RGB, HSV values
  - Color information display on card hover (acquisition method)

- **Phase 5.2: Market Board Integration**
  - Real-time dye pricing via Universalis API
  - Server and world selection dropdowns
  - Acquisition method filters (Base, Craft, Allied Society, Cosmic, Special)
  - Refresh Prices button with debouncing and rate limiting
  - Price toggling per dye with status indicators

- **Phase 5.3: Gradient Save/Load System**
  - Save unlimited gradients with custom names
  - Persistent storage in browser localStorage
  - Load saved gradients to restore all settings
  - Delete saved gradients with confirmation
  - Collapsible "Saved Gradients" panel with smooth animations
  - Display creation date/time for each saved gradient

- **Phase 5.4: Dye Exclusion Filters**
  - Filter out Metallic dyes from recommendations
  - Filter out Pastel dyes from recommendations
  - Filter out Dark dyes from recommendations
  - Filter out Cosmic dyes from recommendations
  - Filters persist via localStorage
  - Recommendations automatically regenerate when filters change

- **Phase 5.5: URL Sharing with Filter Persistence**
  - Generate shareable URLs with gradient configuration
  - Filter settings encoded in URL parameters
  - Auto-load gradient and filter settings from shared URLs
  - Copy Share URL button with clipboard support

### Features

- **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- **Smooth Animations**: Card expand/collapse with 0.3s transitions
- **Acquisition Fallback**: Shows dye acquisition method when market data unavailable
- **Theme Support**: Full theme-aware styling with 10 theme variants
- **Error Handling**: Graceful error messages and recovery
- **HTML Safety**: XSS prevention via HTML escaping in dynamic content

### Technical Details

**Files Added**:
- `dye-mixer_stable.html` - Production Dye Mixer tool
- `dye-mixer_experimental.html` - Development version with markers

**Files Modified**:
- `index.html` - Added Dye Mixer tool card (v1.5.1), updated description
- `components/nav.html` - Added Dye Mixer link to Tools dropdown

**Key Commits**:
- `c87a123` Feature: Add Load Gradient UI with expand/collapse panel
- `5b6cca5` Enhancement: Include filter settings in shareable URLs
- `1c76ee2` Enhancement: Add dye exclusion filters to recommendations
- `1d7561c` Fix: Enable Refresh Prices button on initial load
- `670df14` Enhancement: Add smooth expand/collapse animation to dye cards
- `0d3c724` Fix: Align acquisition text properly in dye card details
- `086b843` Fix: Dye Mixer market board integration

### Technical Architecture

The Dye Mixer demonstrates the monolithic HTML pattern used across all tools:
- **Single self-contained file** (~1,640 lines) with no build step required
- **Vanilla JavaScript** with no framework dependencies
- **Shared utilities** from `assets/js/shared-components.js`:
  - Color conversion (hex↔RGB↔HSV)
  - Color distance calculations (Euclidean RGB space)
  - Market board integration (Universalis API)
  - localStorage management with error handling
  - Theme system and component loading
- **Reused components**:
  - Market board UI from `components/market-prices.html`
  - Navigation and theme switcher from `components/nav.html`
  - Footer from `components/footer.html`

---

## [1.5.0] - Phase 6.6 UI Improvements & Bug Fixes (Color Tools Only) - 2025-11-13

### Added

- **Habibi Font Styling for Numeric Displays (Phase 6.6.1)**
  - Applied `.number` class styling to all numeric displays across all tools
  - Visual distinction between numbers and text using Habibi serif font
  - Implemented in:
    - Color Harmony Explorer: Hex codes, RGB values, HSV values, market prices
    - Color Matcher: Hex codes, market prices
    - Color Accessibility Checker: Intensity percentages, accessibility scores, color distances, warning counts
    - Dye Comparison: Already included in stable build
  - Enhanced readability and visual hierarchy with serif font for numeric data

- **Enhanced Component Loading System (Phase 6.6.2)**
  - Improved `loadComponent()` function with minimal fallback UI
  - Yellow warning banner displays when components fail to load
  - "Return home" link in fallback UI redirects to index.html
  - Better error messages with specific failure information
  - Graceful degradation when navigation or footer fail to load

- **Improved JSON Debugging (Phase 6.6.3)**
  - Enhanced `safeFetchJSON()` with detailed console logging
  - Shows HTTP status, Content-Type header, response length
  - Logs first 300 characters of response for quick debugging
  - Switched from `response.json()` to `response.text()` with manual JSON.parse() for better error diagnostics
  - Helps identify Cloudflare Pages compatibility issues

### Fixed

- **HTML Escaping in Color Explorer (Phase 6.6.1)**
  - Fixed issue where HTML tags were displaying as literal text in acquisition information
  - Changed `getAcquisitionText()` to return plain text only
  - Created separate `formatAcquisitionText()` helper function that applies HTML formatting at render time
  - Used regex pattern `(\d+(?:,\d+)*)` to wrap numbers with `.number` spans
  - Prevents exposed HTML and ensures consistent Habibi font styling for prices

- **Cloudflare Pages JSON Loading Issue (Phase 6.6.2)**
  - Fixed "Error loading dyes: SyntaxError: JSON.parse" crash on Cloudflare Pages
  - Root cause: Corrupted localStorage data causing `JSON.parse()` to fail during initialization
  - Added try-catch error handling around localStorage JSON parsing in Accessibility Checker
  - Reset to valid default values when localStorage data is corrupted
  - Changed JSON file fetch paths from relative (`./assets/json/`) to absolute (`/assets/json/`) for Cloudflare compatibility
  - Applied to all 4 tools: colors_xiv.json, data-centers.json, worlds.json

- **Color Accessibility Checker localStorage Corruption (Phase 6.6.2)**
  - Added comprehensive error handling for `secondaryDyesEnabled` localStorage value
  - Try-catch block with console warning when localStorage contains invalid JSON
  - Automatic reset to default value (false) when corruption detected
  - Prevents page initialization crash from corrupted localStorage

- **UI Navigation Positioning (Phase 6.6.3)**
  - Moved theme switcher and tools dropdown to top-right corner (fixed positioning)
  - Added responsive breakpoint: reverts to static positioning on screens ≤768px
  - Prevents mobile overlap with page content
  - Improved layout with top: 1rem, right: 1rem, z-index: 100

- **Color Matcher Info Button Positioning (Phase 6.6.3)**
  - Moved info button to display next to version number in header
  - Prevents overlay with theme/tools dropdown menu
  - Better visual hierarchy and information architecture

### Changed

- **Version Numbers Updated (Phase 6.6.4)**
  - All 4 tools updated from v1.4.2 to v1.5.1:
    - Color Accessibility Checker
    - Color Harmony Explorer
    - Color Matcher
    - Dye Comparison
  - Updated in tool headers and index.html cards

- **JSON File Paths Standardized**
  - All tools now use absolute paths for JSON files
  - `/assets/json/colors_xiv.json` instead of `./assets/json/colors_xiv.json`
  - `/assets/json/data-centers.json` (Color Explorer)
  - `/assets/json/worlds.json` (Color Explorer)
  - Ensures compatibility with Cloudflare Pages and other CDNs

### Technical Details

**Files Modified**:
- `assets/js/shared-components.js` - Enhanced safeFetchJSON() with detailed logging
- `colorexplorer_experimental.html` & `stable` - Applied .number styling to hex, RGB, prices; fixed HTML escaping
- `colormatcher_experimental.html` & `stable` - Applied .number styling to hex and prices
- `coloraccessibility_experimental.html` & `stable` - Applied .number styling to all numeric displays; fixed localStorage error handling
- `dyecomparison_experimental.html` & `stable` - Updated version numbers to v1.5.1
- `components/nav.html` - Fixed positioning for theme switcher (fixed with responsive fallback)
- `index.html` - Updated all tool version numbers to v1.5.1

**Commits**:
- Phase 6.6: Component Loading Improvements
- UI: Move Tools & Theme selection top-right
- UI: Move Info button next to version number
- Release v1.5.1 version numbers
- Aesthetic: Apply Habibi font to numeric displays (Color Explorer & Matcher)
- Fix: Color Explorer HTML escaping
- Fix: Use absolute paths for JSON (Cloudflare compatibility)
- Debug: Improve safeFetchJSON logging
- Fix: Color Accessibility Checker crashes on corrupted localStorage
- Aesthetic: Apply Habibi font to numeric displays in Accessibility Checker

### Testing

- ✅ All 4 tools load successfully on Cloudflare Pages
- ✅ JSON files load with absolute paths
- ✅ Component fallback UI displays when nav/footer fail
- ✅ All numeric displays use Habibi font styling
- ✅ HTML text in acquisition fields displays correctly (no exposed tags)
- ✅ Theme switcher positioned in top-right corner
- ✅ Theme switcher responsive on mobile (reverts to static)
- ✅ All 10 themes work correctly with new styling
- ✅ localStorage corruption handled gracefully
- ✅ No JavaScript errors in console on any tool

---

## [1.5.0] - Phase 6 Advanced Code Refactoring - 2025-11-13

**Deployed to Production**: All 4 tools + index.html

### Added

- **Centralized Shared Utilities (Phase 6.1)**
  - Moved 12 major utility functions to `shared-components.js`
  - Color conversion utilities: `hexToRgb()`, `rgbToHex()`, `rgbToHsv()`, `hsvToRgb()`
  - Color distance calculations: `colorDistance()`, `getColorDistance()`
  - Storage utilities: `safeGetStorage()`, `safeSetStorage()`
  - Dye category management: `getCategoryPriority()`, `sortDyesByCategory()`, `populateDyeDropdown()`
  - JSON fetching: `safeFetchJSON()` with validation and error handling
  - API rate limiting: `APIThrottler` class with 500ms minimum between requests
  - Global `apiThrottler` instance available to all tools

- **Market Board Integration (Phase 6.2)**
  - Created reusable `components/market-prices.html` component
  - Centralized price category definitions in `PRICE_CATEGORIES` object
  - Market board functions: `initializeMarketBoard()`, `fetchUniversalisPrice()`, `formatPrice()`
  - Integration with all 3 tools: Color Explorer, Color Matcher, Dye Comparison
  - Updated "Beast Tribe Dyes" → "Allied Society Dyes" for accurate game terminology
  - Proper classification of all vendor types (Amalj'aa, Ixali, Sahagin, Kobold, Sylphic)

- **Component Loading System**
  - Early script loading in `<head>` for reliable DOMContentLoaded handling
  - Proper theme and component initialization order
  - Navigation and footer components load consistently across all tools

### Fixed

- **Bug 6.1: Script Loading Order**
  - Moved `shared-components.js` from end of `</body>` to `<head>`
  - DOMContentLoaded events now register properly for component initialization
  - Theme system initializes before page render

- **Bug 6.2: Duplicate APIThrottler Declarations**
  - Removed duplicate `APIThrottler` class from all 3 tool files
  - Fixed `Uncaught SyntaxError: redeclaration of let APIThrottler`
  - All tools now use single implementation from shared-components.js

- **Bug 6.3: Missing Global apiThrottler Instance**
  - Added `const apiThrottler = new APIThrottler(500)` to shared-components.js
  - Resolved `ReferenceError: apiThrottler is not defined`
  - Market board pricing now works correctly with API throttling

- **Bug 6.4: Color Harmony Explorer Base Color Price Display**
  - Fixed base color swatch at top not updating with market prices
  - Added special DOM handling for `selected-color-display` element
  - All harmony palettes + base color now display market prices correctly

- **Bug 6.5: Ixali Vendor Misclassification**
  - Moved Ixali Vendor from "Base Dyes" to "Allied Society Dyes" category
  - Updated in 4 locations: shared-components.js + all 3 tool filter functions
  - Consistent vendor classification across all tools

### Changed

- Code duplication reduced by ~1,600+ lines across all tools
- Market board integration simplified with centralized utility functions
- All tools now share single implementations of color conversion and utility functions
- Improved code maintainability through shared-components.js centralization
- Better separation of concerns: shared logic vs tool-specific UI/layout

### Technical Details

**Files Modified**:
- `assets/js/shared-components.js` - Added 12 utility functions and market board integration
- `components/market-prices.html` - Created reusable market board UI component
- `colorexplorer_experimental.html` - Updated to stable (v1.5.0)
- `colormatcher_experimental.html` - Updated to stable (v1.5.0)
- `dyecomparison_experimental.html` - Updated to stable (v1.5.0)
- `coloraccessibility_experimental.html` - Updated to stable (v1.5.0)

**Commits**:
- 3a108e3: Phase 6.5: Sync Phase 6 changes to stable versions

### Testing

- ✅ Dye dropdowns populate correctly in all 3 tools
- ✅ Market board server dropdowns populate with data centers & worlds
- ✅ Allied Society Dyes filter works correctly (includes all 5 vendors + Ixali)
- ✅ Base Dyes filter only shows Dye Vendor dyes
- ✅ Craft, Cosmic, Special filters work correctly
- ✅ Universalis API integration working with rate limiting
- ✅ Price fetching respects APIThrottler 500ms minimum
- ✅ Prices display correctly in all tools (base + harmony swatches)
- ✅ No JavaScript errors in console
- ✅ All 10 themes work correctly with market prices
- ✅ Responsive design maintained

---

## [1.4.2] - Phase 4.1 Complete Theme System - 2025-11-13

**Deployed to Production**: All 4 tools + index.html

### Added

- **Complete Theme System Implementation (Phase 4.1)**
  - 10 theme variants: 5 themes × light/dark combinations
  - Unified theme switcher in navigation bar (all tools synchronized)
  - Real-time theme switching with localStorage persistence
  - Theme system replaces legacy dark mode toggle pattern
  - Themes fully integrate with all tool components

- **5 Branded Themes with WCAG Compliance**
  - **Standard** (default): Indigo primary (#4f46e5 light, #818cf8 dark)
  - **Hydaelyn**: Sky blue (#0369a1 light, #38bdf8 dark) - FFXIV aesthetic
  - **Classic Final Fantasy**: Deep blue (#1e40af light, #60a5fa dark) - FF tradition
  - **Parchment**: Warm beige (#a16207 light, #fbbf24 dark) - Retro aesthetic
  - **Sugar Riot**: Vibrant pink (#ec4899 light, #f472b6 dark) - Playful design

- **CSS Custom Properties for Theme System**
  - 10 CSS variable sets (9 themed + 1 default)
  - Variables: `--theme-primary`, `--theme-primary-hover`, `--theme-light`, `--theme-bg`, `--theme-bg-secondary`, `--theme-bg-tertiary`, `--theme-text`, `--theme-text-muted`, `--theme-border`, `--theme-card-bg`
  - All theme-aware styling centralized in shared-styles.css
  - Comprehensive Tailwind utility class overrides for consistency

- **Theme-Aware Interactive Elements**
  - Range sliders (.vision-type sliders in Accessibility Checker) use `accent-color: var(--theme-primary)`
  - Toggle switches for Market Price panels adapt to active theme
  - File input browse buttons theme-aware
  - Select/dropdown elements theme-aware
  - Checkbox colors using `accent-color` property
  - All buttons, inputs, and form controls inherit theme colors

- **Navigation Theme Switcher UI**
  - Theme switcher button in header with gear icon
  - Dropdown menu showing all 10 theme options grouped by theme name
  - Light/Dark variants clearly labeled for each theme
  - Color swatches preview each theme's primary color
  - Mobile-responsive dropdown design

- **Enhanced Color Consistency**
  - Replaced 150+ hardcoded color values with theme variables
  - Toast notification backgrounds and text colors now theme-aware
  - Canvas visualizations (Dye Comparison charts) dynamically reference theme colors
  - SVG color wheel elements use theme colors for strokes and lines
  - Nav dropdown menus fully theme-aware
  - Search input boxes theme-aware

### Fixed

- **Vision Type Simulation Sliders**
  - Fixed remaining blue color on range sliders in Accessibility Checker
  - Now properly match active theme color using `accent-color` property
  - All three sliders (Deuteranopia, Protanopia, Tritanopia) theme-aware

- **Market Price Toggle Switches**
  - Fixed remaining blue color on "Show Prices" toggle switches
  - All toggle switches across all tools now theme-aware
  - Toggle background and active state properly adapt to theme

- **"Refresh Prices" Button Text Color**
  - Fixed text visibility in dark theme variants
  - Standard Dark, Hydaelyn Dark, Classic FF Dark now show dark text on light primary buttons
  - All 10 theme combinations now have proper contrast ratios

- **Select/Dropdown Menu Styling**
  - Fixed hardcoded background colors on all select elements
  - Dropdowns now use `var(--theme-card-bg)` for background
  - Border colors use `var(--theme-border)` for consistency
  - Option text uses `var(--theme-text)` for readability

- **Search Colors Input Box** (Color Harmony Explorer)
  - Fixed missing theme styling for text input elements
  - Input background, text color, border all theme-aware
  - Focus state uses theme primary color with box-shadow

- **Accessibility Checker Score Label**
  - Fixed hardcoded blue color (#0c4a6e) on "Overall Accessibility Score" text
  - Now uses `var(--theme-text-muted)` for proper visibility in all themes

- **Experimental Badge Removal**
  - Removed "Experimental Version" notice from Dye Comparison tool
  - Tool now properly marked as stable

### Technical Details

**Architecture**:
- Unified theme implementation across all 4 tools
- Single source of truth for theme definitions in shared-styles.css
- Theme switching handled by setTheme() function in shared-components.js
- localStorage key: `xivdyetools_theme` stores selected theme name
- Default theme: `standard-light` (no class on root)

**CSS Variable Structure**:
```css
body.theme-{theme-name}-{light|dark} {
    --theme-primary: #...;
    --theme-primary-hover: #...;
    --theme-primary-light: #...;
    --theme-bg: #...;
    --theme-bg-secondary: #...;
    --theme-bg-tertiary: #...;
    --theme-text: #...;
    --theme-text-muted: #...;
    --theme-border: #...;
    --theme-card-bg: #...;
}
```

**Tailwind Class Overrides** (25+ selectors):
- Background colors: `.bg-white`, `.bg-gray-*` → `var(--theme-*)`
- Text colors: `.text-gray-*`, `.text-blue-*`, `.text-amber-*` → `var(--theme-text*)`
- Border colors: `.border-gray-*`, `.border-blue-*`, `.border-amber-*` → `var(--theme-border)`
- Button colors: `.bg-blue-600` → `var(--theme-primary)`
- Form elements: `select`, `input[type="text"]`, `input[type="checkbox"]` → theme variables

**Files Modified**:
- `assets/css/shared-styles.css` - 75+ lines added (theme definitions + overrides)
- `assets/js/shared-components.js` - Theme switching functions
- `components/nav.html` - Theme switcher UI
- All 4 tool files - Synced experimental → stable

**Commits**:
- dc1caef: Add comprehensive Tailwind class overrides for theme support
- f0ee45d: Fix remaining hardcoded colors for complete theme support
- 8b11049: Fix remaining Theme Switcher bugs (dropdowns, checkmarks, file input)
- ffc8a99: Address remaining issues from testing (Refresh Prices, sliders, Experimental badge)
- daa4877: Fix Vision Type sliders and Market Price toggle switches (final fixes)

### Testing

- ✅ All 10 theme combinations tested and verified
- ✅ Theme switching works across all 4 tools simultaneously
- ✅ localStorage persistence tested across page refreshes
- ✅ All interactive elements properly themed:
  - ✅ Buttons and dropdowns
  - ✅ Range sliders
  - ✅ Toggle switches
  - ✅ Checkboxes
  - ✅ Text inputs
  - ✅ Canvas visualizations
  - ✅ SVG elements
- ✅ Dark theme variants properly show readable text
- ✅ Light primary color themes (Parchment Dark, Sugar Riot Dark) show appropriate text contrast
- ✅ WCAG color contrast ratios met across all themes

---

## [1.4.1] - Phase 1 Bug Fixes - 2025-11-12

**Deployed to Production**: Color Matcher v1.3.0, Dye Comparison v1.2.3

### Fixed

- **Color Matcher - Jet Black Matching Issue**
  - Fixed incorrect exclusion logic that prevented exact/near-exact matches to Pure White and Jet Black
  - `#000000` now correctly matches to Jet Black instead of Gunmetal Black
  - `#FFFFFF` now correctly matches to Pure White
  - `#1e1e1e` now matches to Jet Black (near-exact) instead of Dark Brown
  - Exclusion filter now acts as "don't auto-suggest" while still allowing exact matches (distance < 5)
  - Implementation: Changed from pre-filter approach to post-calculation exact-match fallback logic

- **Dye Comparison - Hue-Saturation Chart Rendering**
  - Fixed canvas rendering issue where only NW quarter of chart was displayed
  - Chart now renders complete 1000×750 canvas with all four quadrants visible (NW, NE, SW, SE)
  - Hue gradient now spans full 360 degrees, Saturation gradient spans full vertical range
  - Implementation: Changed from direct ImageData placement to two-stage canvas rendering with proper scaling
  - Performance maintained through continued use of RESOLUTION_REDUCTION=2 optimization

### Testing

- ✅ Color Matcher: Verified exact matches work with exclusion enabled
- ✅ Color Matcher: Verified exclusion still filters non-exact matches
- ✅ Dye Comparison: Verified full chart area renders with 1, 2, 3, and 4 selected dyes
- ✅ Dye Comparison: Verified gradient quality maintained with image smoothing

---

## [1.4.0] - All Tools Standardization Update - 2025-11-09

**Deployed to Production**: Color Accessibility v1.0.2 BETA, Color Harmony Explorer v1.2.4, Color Matcher v1.3.1, Dye Comparison v1.2.4

### Added

- **Standardized Dropdown Population Patterns** (Phase 3.4)
  - Centralized `getCategoryPriority()` function for consistent category ordering across all tools
  - Unified `sortDyesByCategory()` / `sortColorsByCategory()` functions eliminate duplicate code
  - Comprehensive JSDoc documentation on all dropdown functions
  - Input validation guards on all dropdown population functions

- **Improved Error Handling** (Phase 5)
  - `safeFetchJSON()` utility for robust JSON loading with fallback support
  - Enhanced `safeGetStorage()` and `safeSetStorage()` functions for localStorage operations
  - Better error messages and console logging throughout

### Changed

- **Code Quality Improvements** (Phase 3)
  - Standardized `hsvToRgb()` function signature to parameter-based pattern for universal compatibility
  - Unified `colorDistance()` implementation across all tools with input validation
  - Consistent `hexToRgb()` error handling (fallback to black instead of null)
  - Enhanced `rgbToHex()` and `rgbToHsv()` documentation with JSDoc

- **Performance Enhancements** (Phase 4)
  - DOM element caching in Color Accessibility for faster access to frequently-used elements
  - Optimized slider event listeners using cached references
  - Reduced repeated getElementById calls throughout application lifecycle

- **Dye Comparison Tool**
  - Removed "EXPERIMENTAL" badge from v1.2.4 stable release
  - Applied all standardization improvements to stable version

### Fixed

- **Color Converter Consistency**
  - All tools now use consistent error handling for invalid color inputs
  - Unified color space conversion algorithms across all tools
  - Fixed potential null reference errors in Color Matcher

### Documentation

- **JSDoc Enhancements** (Phase 6)
  - Added comprehensive JSDoc comments to all color utility functions
  - Documented algorithm formulas and their mathematical basis
  - Added usage examples and edge case handling documentation
  - Parameter type definitions for IDE autocomplete support

---

## [1.3.0] - Color Matcher v1.3.0

### Added - Color Matcher v1.3.0
- **Clipboard Image Paste Support**
  - Users can now paste images directly using Ctrl+V (Windows/Linux) or Cmd+V (Mac)
  - Seamlessly integrates with existing image loading pipeline (drag-and-drop, file picker)
  - Updated help text to indicate paste capability: "Drag & drop • Click to browse • Paste (Ctrl+V)"

- **Toast Notification System**
  - Success notifications: Image loaded successfully, image cleared
  - Error notifications: Invalid file types, file read failures, image corruption, clipboard access errors
  - Info notifications: File size warnings (>10MB), general status messages
  - Visual design with colored borders (green/red/blue), icons, and messages
  - Auto-dismiss after 3 seconds with smooth slide-in/out animations
  - Positioned fixed in top-right corner, always visible
  - Full dark mode support with appropriate color contrast

- **Keyboard Shortcuts Help Modal**
  - New help button (?) in header next to dark mode toggle
  - Organized shortcuts reference modal showing:
    - Image Input: Paste (Ctrl+V / Cmd+V)
    - Zoom Controls: +, −, W, F, R
    - Canvas Interactions: Shift+Wheel, Shift+Drag, Shift+MiddleClick, Shift+RightClick, Left Click
  - Multiple ways to close: X button, ESC key, click outside modal
  - Full dark mode support with readable text and proper contrast

- **Floating Zoom Controls Toolbar**
  - Zoom controls now fixed in top-left corner of canvas area
  - Always visible even when image is extremely zoomed or scrolled
  - Prevents controls from being pushed off-screen with large images
  - Clear button, zoom in/out buttons, zoom percentage display
  - Zoom to Fit (F), Zoom to Width (W), Reset (R) buttons
  - Responsive design with flex-wrap for smaller screens

- **Enhanced Error Handling**
  - Comprehensive validation for image files (type checking, size warnings)
  - File read error handling with user-friendly messages
  - Image corruption detection with error toast
  - Clipboard access error handling
  - Try-catch blocks throughout image processing pipeline

- **Improved Zoom Calculation for Large Images**
  - Fixed "Zoom to Fit" and "Zoom to Width" functions for 4K+ resolution images
  - Properly accounts for all layout spacing:
    - Body padding (p-3): 24px total
    - Grid layout: 380px left + 16px gap
    - Right column padding (p-5): 40px total
    - Page scrollbar width detection
  - Functions use setTimeout to ensure layout is fully settled before calculating
  - Works correctly with multi-frame animation rendering
  - Tested with 4K (4000x4000px) images and larger

### Changed - Color Matcher v1.3.0
- Version updated from v1.2.0 to v1.3.0
- Updated version number display in header
- Updated Open Graph and Twitter metadata URLs to stable version
- Updated navigation dropdown links to reference stable versions only

### Technical Details - Color Matcher v1.3.0
- New `handleClipboardPaste(e)` function:
  - Uses Clipboard API's `clipboardData.items` array
  - Converts blob to File object with auto-generated timestamp filename
  - Checks for image MIME type before processing
  - Error handling for clipboard access issues

- New `showToast(message, type = 'info', duration = 3000)` function:
  - Creates toast element with dynamic type-based styling
  - SVG icons for success (checkmark), error (X), and info (?)
  - Auto-removes toast after duration with smooth animation

- New `openHelpModal()` and `closeHelpModal()` functions:
  - Toggle modal visibility with `.show` class
  - ESC key listener for closing
  - Click-outside detection for backdrop closing

- Updated `processImageFile()` function:
  - Added comprehensive error checking
  - File size warning (10MB threshold)
  - FileReader error handling
  - Image load error handling with try-catch
  - Toast notifications for each operation state

- Updated `zoomToFit()` and `zoomToWidth()` functions:
  - Changed from requestAnimationFrame to setTimeout (50ms) for better timing
  - Uses window.innerWidth and document.documentElement.clientWidth for accurate measurements
  - Calculates available width based on fixed layout dimensions
  - Nested setTimeout for ensuring layout settlement before scroll reset

- Updated `clearImage()` function:
  - Adds success toast notification when image is cleared

- HTML/CSS changes:
  - Added toast-container div for notifications
  - Added help-modal with keyboard shortcuts table
  - Updated help text instruction
  - Moved zoom controls into floating-zoom-toolbar (absolute positioned)
  - 80+ lines of new CSS for toasts, modals, and toolbar styling
  - Dark mode CSS for all new UI elements

- Event listener additions:
  - Document paste event listener for clipboard support
  - Help modal click-outside listener
  - ESC key listener for help modal

## [1.3.1] - 2025-10-31

### Changed - Color Accessibility Checker v1.0.1
- **BETA Status Badge**
  - Marked Color Accessibility Checker as BETA in portal (index.html) with amber badge
  - Added BETA badge to tool header indicating early/experimental status
  - Added prominent BETA notice banner on tool page with scientific disclaimer
  - Clarifies that tool uses Brettel 1997 algorithms but hasn't been validated with actual colorblind players
  - Encourages real user testing and feedback for critical design decisions

- **Footer and Contact Information**
  - Added complete footer with creator attribution (Flash Galatine - Balmung)
  - Includes links to all social media and contact information:
    - Blog, GitHub, X/Twitter, Twitch, BlueSky, Patreon, License
  - Full dark mode styling for footer elements with proper color contrast
  - Matches footer design from other three tools for consistency

### Fixed - Color Accessibility Checker v1.0.1
- **Dark Mode Styling Fixes**
  - "Clear All" button now properly darkens to #4b5563 in dark mode with white text
  - X buttons next to dye slots now properly dark mode styled (previously appeared white)
  - "Accessibility Issues" banner now properly darkens in dark mode with amber background (#7c2d12) instead of bright red
  - Fixed invalid Tailwind `dark-mode:` prefix syntax throughout the component
  - Added proper CSS dark mode selectors using `body.dark-mode` for all affected elements

- **Accessibility Issues Count Bug Fix**
  - Resolving all distinguishability issues by replacing dyes now properly updates the issue count to 0
  - The "Accessibility Issues" section now correctly hides when all warnings are resolved
  - Fixed logic in `updateVisualization()` that was forcing the warnings section to remain visible

- **Dual Dyes Toggle Persistence**
  - "Dual Dyes" toggle state now persists across page refreshes using localStorage
  - Toggle visual state and secondary dye field visibility now always synchronize
  - Resolves issue where toggle appeared enabled but secondary dyes remained hidden after refresh

- **Warning Card Text Styling**
  - Removed invalid `dark-mode:` text color attributes from warning card descriptions
  - Text now uses proper CSS selectors for dark mode support

- **Suggestions Section Dark Mode Support**
  - Added comprehensive dark mode styling for suggestions container and all child elements
  - Suggestion cards now properly darken with #374151 background in dark mode
  - Text colors properly contrast in both light and dark modes
  - "Use" buttons properly styled for dark mode

### Technical Details
- Implemented localStorage with key `secondaryDyesEnabled` for toggle state persistence
- Fixed warning section visibility logic in `updateWarnings()` function
- Added 35+ CSS rules for dark mode selectors covering buttons, banners, and containers
- Replaced dynamic class-based styling with proper CSS selector hierarchy

## [1.3.0] - 2025-10-30

### Added
- **New Tool: Color Accessibility Checker v1.0.0**
  - Simulate how FFXIV dyes appear to players with various types of colorblindness
  - **Vision Type Simulations:**
    - Deuteranopia (red-green colorblindness, ~1% of population)
    - Protanopia (red-green colorblindness, ~1% of population)
    - Tritanopia (blue-yellow colorblindness, ~0.001% of population)
    - Achromatopsia (complete color blindness, ~0.003% of population)
  - **Adjustable Intensity Sliders:**
    - Control severity level (0-100%) for Deuteranopia, Protanopia, and Tritanopia
    - Interpolates between normal vision and full colorblind simulation for realistic representation
  - **Accessibility Analysis:**
    - Color Distinguishability Warnings: Automatically detects color pairs that become indistinguishable for specific vision types
    - Accessibility Score (0-100): Rates overall palette accessibility across all colorblindness types
    - Color Distance Matrix: Shows Euclidean distances between selected dyes
    - WCAG Contrast Ratio Calculation: Evaluates contrast between dye colors
  - **Smart Recommendations:**
    - Suggests alternative dyes for flagged colors while maintaining aesthetic similarity
    - Finds similar dyes based on hue and saturation to preserve intended color scheme
  - **Outfit Planning:**
    - Support for up to 8 dyes representing complete outfit (Head, Body, Hands, Legs, Feet, Weapon, Accessories)
    - Side-by-side vision comparison showing how each colorblind type sees the palette
  - **Integration Features:**
    - Import dye selections from other tools via URL parameters (`?dyes=5029,5030,5031`)
    - One-click replacement of problematic dyes with suggested alternatives
    - Full dark mode support
  - **UI/UX:**
    - Two-column layout with sticky controls (left) and scrollable results (right)
    - Real-time updates as you adjust sliders and select dyes
    - Comprehensive tooltips and help text for accessibility concepts

### Changed
- Updated Portal (index.html) to feature new Color Accessibility Checker as 4th tool
- Updated Tools dropdown menus in all existing tools to include Color Accessibility Checker link
- Portal grid now uses `md:grid-cols-2 lg:grid-cols-3` for better responsive layout with 4 tools

### Technical Details
- New files: `coloraccessibility_stable.html`, `coloraccessibility_experimental.html`
- Uses color transformation matrices (Brettel 1997 algorithm) for accurate colorblindness simulation
- Implements Euclidean color distance calculations in RGB color space
- Uses luminance-based grayscale conversion for achromatopsia simulation
- localStorage support for persistent user preferences and color selections
- No new dependencies; uses existing pattern of standalone HTML with embedded JS/Tailwind CSS

## [1.2.3] - 2025-10-30

### Added
- **Market Board Data Center Alphabetization**
  - Data Centers in Market Board Server dropdown now display in alphabetical order across all tools
  - Applied to all three stable versions for consistency:
    - Color Harmony Explorer (v1.2.0)
    - Color Matcher (v1.2.0)
    - Dye Comparison (v1.1.0)

### Changed
- Data Center dropdown entries now sorted alphabetically by name before display
- Improved Market Board server selection usability with consistent ordering

### Technical Details
- Added `sort((a, b) => a.name.localeCompare(b.name))` to Data Center array in `loadServerData()` and `initializeMarketBoard()` functions
- Used consistent sorting approach across all three tools for unified user experience

## [1.2.2] - 2025-10-30

### Added
- **Dye Comparison v1.1.0 - Color Chart Visualization**
  - **Hue-Saturation 2D Color Chart**
    - Canvas-based visualization showing dye positions in 2D color space
    - X-axis: Hue (0-360°) showing color spectrum
    - Y-axis: Saturation (0-100%) showing color intensity
    - Colored circles mark actual dye positions using their hex colors
    - Interactive gradient background displays full color space
    - Saturation percentages labeled on left axis (0%, 25%, 50%, 75%, 100%)
    - 1080p optimized with 1000×750px canvas resolution
    - Responsive padding: 70px left, 40px other sides
    - Dark mode support with background color adaptation

  - **Brightness 1D Chart**
    - Linear visualization of dye brightness/value distribution
    - Y-axis scale: Black (0%) to White (100%)
    - Vertical colored lines indicate each dye's brightness position
    - Lines use actual dye hex colors for visual reference
    - 1080p optimized with 1000×750px canvas resolution
    - Responsive padding: 50px left/right, 40px top/bottom
    - Dark mode support with background color adaptation

  - **Dynamic Chart Updates**
    - Charts automatically render when dyes are selected
    - Charts update in real-time as dyes are added/removed
    - Smooth transitions between chart states
    - Proper alignment of chart bottom edges (fixed padding issues)

  - **1080p Display Optimization**
    - Canvas resolution increased from 400x300 to 1000x750 for both charts
    - Responsive typography with 2xl breakpoints
    - Increased padding and spacing for larger screens
    - Better visual hierarchy and grid layouts
    - Optimized font sizing for readability at 1920x1080

  - **Color Quality Improvements**
    - Circles and lines now display using actual dye hex colors
    - Replaced fixed color palette with dynamic color values
    - More accurate visual representation of actual FFXIV dyes
    - Improved color accuracy for color theory understanding

### Changed
- Updated Dye Comparison from v1.0.0 to v1.1.0
- Created `dyecomparison_stable.html` as primary stable version
- Updated all tool navigation dropdowns to reference `dyecomparison_stable.html`
  - Updated in `index.html`
  - Updated in `colorexplorer_stable.html`
  - Updated in `colormatcher_stable.html`
  - Updated in `dyecomparison_stable.html`

### Technical Details
- New `drawHueSaturationChart()` function:
  - Creates 2D canvas with gradient color space representation
  - Converts dye HSV values to canvas coordinates
  - Draws circles at precise hue-saturation positions
  - Implements proper padding calculations for label display
  - Uses requestAnimationFrame for smooth rendering

- New `drawBrightnessChart()` function:
  - Creates 1D linear canvas visualization
  - Maps brightness values (0-100) to Y-axis coordinates
  - Draws vertical lines for each selected dye
  - Implements padding management for proper spacing

- New `hsvToRgb(h, s, v)` helper function:
  - Converts HSV color space to RGB for canvas rendering
  - Handles edge cases (achromatic colors, gray values)
  - Produces accurate RGB values for gradient backgrounds

- New `updateColorCharts()` function:
  - Coordinates visibility and rendering of both charts
  - Controls chart display based on selected dyes
  - Triggers re-rendering on dye selection changes

- Canvas context properties optimized for 1080p:
  - Font size: 14px (previously smaller)
  - Line width: 2px for better visibility
  - Font family: 'Inter', sans-serif for consistency

- Chart positioning uses margin and padding to ensure proper alignment:
  - Removed individual padding from brightness-container
  - Unified padding approach across both charts

## [1.2.1] - 2025-10-30

### Added
- **Color Matcher v1.2.0 Enhancements**
  - **Dark Mode Support for Market Board Server Dropdown**
    - Market Board Server dropdown now properly darkens in dark mode
    - Dropdown options and option groups styled for dark theme
    - Improved dark mode consistency across all Market Board controls

  - **Intelligent Image Zoom System**
    - Auto-detects portrait-oriented images and extra large images
    - Automatically applies "Zoom to Width" for portrait images (height > width)
    - Automatically applies "Zoom to Width" for images significantly taller than wrapper (height > 1.5x wrapper height)
    - Uses "Zoom to Fit" for landscape and standard aspect ratio images
    - Provides optimal viewing experience without manual zoom adjustments

### Fixed
- Market Board Server dropdown styling in dark mode on Color Matcher
- Image zoom detection logic for various image orientations and sizes

## [1.2.0] - 2025-10-30

### Released
- **Color Matcher** (v1.2.0) - Stable release with major UI overhaul
- **Dye Comparison** (v1.0.0) - Stable release
- **Color Harmony Explorer** (v1.1.0) - Stable release

### Added
- **Color Matcher v1.2.0 UI Overhaul** (`colormatcher.html`)
  - **Two-Column Layout Redesign**
    - Left panel (380px fixed width) contains all dye information and controls:
      - Color picker with hex display
      - Closest match results with category and acquisition info
      - Exclusion filters (metallic, facewear, extremes)
      - Market Board server selection and price settings
    - Right panel displays image upload, sample size selector, image canvas, and empty state
    - Sticky left panel remains accessible when scrolling through tall images
    - Optimized for 1080p displays (1920x1080) with minimal scrolling
    - Responsive design switches to single-column on smaller screens (<1024px)
  - **Dark Mode Fixes**
    - Sample Size dropdown properly darkens in dark mode with readable text
    - Text colors for filter labels and "Pick Your Color" now readable in dark mode
    - All dropdowns and input fields properly styled for both light and dark themes
  - **Eyedropper Preview Positioning**
    - Fixed eyedropper preview circle positioning to follow cursor accurately
    - Uses correct positioning reference (imageContainer) for precise placement
    - 40px offset maintains consistent visual feedback
  - **Empty State Display**
    - Empty state message only displays when no image is loaded
    - Properly hides when image is successfully uploaded
    - Restores when image is cleared
  - **1080p Optimization**
    - Removed max-width constraints allowing full use of available screen space
    - Reduced padding and margins for more compact interface
    - Optimized heading sizes and typography
    - Compact zoom control buttons
    - All interactive elements properly sized and spaced for 1080p displays
  - **Layout and Spacing Refinements**
    - Body padding reduced for tighter vertical spacing
    - Panel padding optimized for compact display
    - Improved visual hierarchy with adjusted margins and gaps
    - Better alignment of all UI elements

- **Dye Comparison Tool** (`dyecomparison.html`) - v1.0.0
  - New tool to compare up to 4 FFXIV dyes side-by-side
  - Compare complete dye information: name, category, hex, RGB, HSV, acquisition method, and price
  - **Color Distance Matrix** - Visual representation of color similarities between selected dyes
    - Green cells: Distance < 50 (very similar colors)
    - Yellow cells: Distance 50-99 (similar colors)
    - Red cells: Distance ≥ 100 (dissimilar colors)
    - Uses RGB Euclidean distance algorithm
  - **Smart Dropdown with Category Organization**
    - Dyes organized by category using `<optgroup>` elements
    - Category order: Neutral → Colors (alphabetical) → Special → Facewear
    - All dyes alphabetically sorted within each category
    - Matches sorting style of Color Harmony Explorer for consistency
  - **Export Options**
    - Export as JSON: Download complete dye comparison data with timestamp
    - Export as CSS: Generate CSS custom properties (variables) for selected dyes
    - Copy Summary: Copy formatted text summary to clipboard
    - Copy Hex Codes: Copy dye names with hex codes to clipboard
  - **Dark Mode Support**
    - Full dark mode styling for all elements
    - Dropdown menus properly darkened in dark mode
    - Color Distance Matrix background and borders adapted for dark theme
    - Persistent preference storage in localStorage
  - **HSV Value Tooltips**
    - Hover over "HSV:" label shows tooltip: "HSV values can be used in other games like Monster Hunter Wilds"
    - Cursor changes to help icon on hover for better UX
  - **UI/UX Features**
    - Disabled state for export/clear buttons until dyes are selected
    - Toast notifications for successful exports (green notification, 3-second timeout)
    - Clear All button to reset all selections
    - Disabled export buttons enable automatically when dyes are selected
    - Complete footer with creator attribution and social links

- **Portal Landing Page** (`index.html`)
  - New index.html serves as central hub for all XIV Dye Tools
  - 3-column grid layout showcasing all available tools:
    - Color Harmony Explorer (v1.1.0)
    - Color Matcher (v1.1.0)
    - Dye Comparison (v1.0.0)
  - "Try Experimental Features" section with link to experimental Color Harmony Explorer
  - "All Tools Feature" highlights section showcasing shared features
  - Dark mode support with persistent preference
  - Portal navigation: Experimental version notice, feature highlights, footer with all social links

- **Navigation Dropdown System**
  - Replaced inline navigation links with dropdown menu on all tools
  - Dropdown button labeled "Tools ▼" appears in header of each tool
  - Dropdown menu includes links to all stable tools:
    - Color Harmony Explorer
    - Color Matcher
    - Dye Comparison
    - All Tools (portal page)
  - Dropdown styling:
    - Indigo button color (matches theme)
    - Auto-closes when clicking outside dropdown
    - Smooth animations and transitions
    - Full dark mode support
  - Implemented on all three tools:
    - colorexplorer_stable.html
    - colormatcher.html
    - dyecomparison.html

### Changed
- Updated project name from "FFXIV Color Explorer" to "XIV Dye Tools" (comprehensive toolset brand)
- Fixed dye count in portal from 228 to 125 (correctly excludes 11 Facewear colors)
- Improved dark mode styling throughout all tools:
  - "How to use" tooltip box properly darkened in dyecomparison.html
  - Color Distance Matrix empty cells now have dark backgrounds in dark mode
  - "Try Experimental Features" box styled for dark mode in portal
  - "All Tools Feature" box bright in light mode, properly darkened in dark mode

### Fixed
- Fixed HSV value display in dyecomparison.html to show as integers (no decimal places)
  - Hue (H): Rounded to nearest integer
  - Saturation (S): Rounded to nearest integer
  - Value (V): Rounded to nearest integer
- Fixed dropdown menu styling for dark mode in dyecomparison.html
  - Select elements now properly styled with dark backgrounds
  - Optgroup elements styled appropriately
  - Option items have proper dark mode colors
- Fixed dark mode styling for portal page elements
  - Amber alert box (Experimental Features) properly darkened
  - Feature highlights section background properly applied
- Fixed navigation consistency across all tools
  - All tools now use consistent dropdown navigation
  - Tools link to stable builds (colorexplorer_stable.html)

### Technical Details
- New `toggleDropdown()` function for dropdown menu interaction
  - Toggles visibility class on dropdown menu
  - Auto-closes dropdown when clicking outside using event delegation
  - Implemented globally in all three tools
- Dye Comparison dropdown implementation:
  - `populateDropdowns()` sorts dyes using category priority system
  - Creates optgroup elements for each category
  - Implements same sorting logic as Color Harmony Explorer for consistency
- Dye Comparison export functions:
  - `exportAsJSON()`: Creates Blob with JSON data, triggers download
  - `exportAsCSS()`: Generates CSS with sanitized dye names as custom properties
  - `copyHexCodes()`: Formats dye names with uppercase hex codes for clipboard
  - `copySummary()`: Creates formatted text summary with color distances
- Portal layout uses responsive 3-column grid (`md:grid-cols-3`)
- Container width expanded to `max-w-7xl` to accommodate three columns
- Dropdown styling uses custom CSS classes with Tailwind fallbacks for dark mode

## [1.1.0] - 2025-10-29

### Added
- **Interactive Color Wheel Highlighting**
  - Hovering over a color swatch now illuminates the corresponding dot on its color wheel
  - Highlighted dots grow larger (radius increases from 10px to 16px)
  - Enhanced stroke width (2px to 4px) and glow effect with brightness increase
  - Smooth CSS transitions for all hover animations
  - Properly scoped to each harmony section to prevent cross-highlighting when duplicate colors appear in multiple palettes
  - Visual feedback helps users understand the relationship between swatches and their position on the color spectrum

- **Version Navigation Badges**
  - Added amber "Experimental" badge in top-right corner of stable build (index.html) to easily access experimental features
  - Added green "Stable" badge in header of experimental build to return to stable version
  - Badges include hover effects and tooltips for better UX

- **Deviance Rating System**
  - New rating system (0-10 scale) showing how closely matched FFXIV dyes match the mathematically ideal harmony colors
  - Base color always has a deviance rating of 0 (exact match)
  - Visual color-coded badges on each harmony color:
    - Green badge (0-3): Excellent match with black text for readability
    - Yellow badge (3-6): Good match with black text for readability
    - Red badge (6-10): Poor match with white text for contrast
    - Rating of 0 displays "Perfect" instead of numeric value
  - Uses RGB Euclidean distance to calculate color deviation
  - Helps users understand when a suggested dye significantly deviates from the ideal color theory recommendation

- **Interactive Deviance Line Visualization**
  - Hovering over a deviance badge now draws a line on the color wheel
  - Line connects from the base color dot to the matched color dot
  - Line color dynamically matches the badge color for semantic consistency:
    - Green line (#22c55e) for excellent matches (deviance 0-3)
    - Yellow line (#eab308) for good matches (deviance 3.1-6)
    - Red line (#ef4444) for poor matches (deviance 6.1+)
  - Line appears behind color dots to maintain visibility
  - Helps users visually understand which ideal harmony target the matched dye deviated from
  - Provides intuitive feedback about color relationships on the wheel

- **Zoom Functionality for Harmony Containers**
  - New Zoom In/Out buttons on each harmony section
  - Clicking Zoom In enlarges the harmony container to fill 90% of viewport (max 1200px width)
  - Background darkens with 80% opacity overlay and 4px blur effect
  - Color wheel automatically scales from 160px to 240px (50% larger) when zoomed using responsive SVG viewBox
  - Multiple ways to exit zoom:
    - Click Zoom Out button
    - Click anywhere on darkened backdrop
    - Press Escape key
  - Smooth animations (0.3s ease-out) for entering and exiting zoom
  - Body scroll disabled while zoomed to prevent confusion
  - All interactive features work correctly in zoomed view:
    - Color wheel tooltips display above zoomed content (z-index: 1002)
    - Deviance line visualization
    - Color wheel dot highlighting
    - Copy buttons and all interactions
  - Fully responsive with adjusted sizing for mobile devices (95vw on screens < 1024px)
  - Dark mode compatible with proper styling for backdrop and shadows

- **Two-Column Layout UI Overhaul**
  - Complete redesign of the interface for better use of screen space
  - Left sidebar (380px fixed width) contains all configuration controls:
    - Color search and selection
    - Acquisition filtering
    - Market board server selection
    - Market price settings (compact design)
    - Exclude options (metallic, facewear, extremes)
  - Right content area displays:
    - Selected color display at top
    - Color harmony results in 2-column grid layout
    - Export options below harmony panels
  - Left sidebar is sticky and scrollable for easy access to controls
  - Optimized for 1080p displays (1920x1080) to show maximum content without scrolling
  - Responsive design: automatically switches to single-column layout on smaller screens (< 1024px)
  - Full dark mode support for both sidebar and content areas

- **Color Matcher Tool Enhancements** (`colormatcher.html`)
  - **Dark Mode Support**
    - Toggle button with moon icon in header
    - Persists preference in localStorage
    - Matches Color Explorer's dark mode color scheme (#1f2937 background, #374151 containers)
    - All controls properly styled for both light and dark modes
    - File browser button darkens appropriately in dark mode
  - **Exclusion Filters**
    - Facewear colors automatically excluded from all suggestions (always on)
    - "Exclude Metallic Dyes" checkbox (optional)
    - "Exclude Pure White & Jet Black" checkbox (default: OFF)
    - All filters apply to color matching algorithm
  - **Advanced Zoom and Pan Controls**
    - Zoom In/Out buttons with live zoom percentage display (25% to 1000%)
    - **Zoom to Fit**: Scales image to fit entirely within wrapper (max 100%)
    - **Zoom to Width**: Scales image to fill wrapper width (ideal for portrait images)
    - Reset Zoom button returns to 100%
    - Keyboard shortcuts: `+` (zoom in), `-` (zoom out), `W` (zoom to width), `R` (reset)
    - Auto zoom to fit when loading large images (>wrapper dimensions)
  - **Mouse Controls**
    - **Shift+MouseWheel**: Zoom in/out smoothly
    - **Shift+LeftClickDrag**: Pan around zoomed images
    - **Shift+MiddleClick**: Zoom to fit
    - **Shift+RightClick**: Reset zoom to 100%
    - Cursor changes to "grabbing" during pan operations
    - Context menu suppressed during Shift+RightClick
  - **Image Management**
    - Clear Image button to remove loaded image
    - Canvas wrapper with flexbox centering for proper image alignment
    - Max canvas height: 700px (optimized for 1080p displays)
    - High-quality image smoothing for zoomed views
  - **UI/UX Improvements**
    - Footer moved outside main container to bottom of page
    - Container expanded to max-w-6xl (1152px) for better 1080p optimization
    - Updated instructions: "Hover and click on the image to pick a color. Use Shift+Left Drag to pan, Shift+Wheel to zoom."
    - All tooltips updated with keyboard/mouse shortcuts
    - Centered canvas alignment prevents left-aligned images in portrait mode

### Changed
- Reduced padding and spacing throughout interface for more compact design
- Harmony results grid changed from 3 columns to 2 columns for better readability on wide screens
- Market price settings panel made more compact with smaller text and tighter spacing
- Configuration section labels shortened for sidebar (e.g., "Jet Black & Pure White" instead of "Exclude Jet Black and Pure White")
- Dark mode toggle moved from header to bottom of left sidebar as a full-width button with icon and label
- Toggle switch animation improved with smooth slide effect using ease timing function

### Technical Details
- New `highlightColorDot(hex, harmonyType)` and `unhighlightColorDot(hex, harmonyType)` functions for color wheel interaction
  - Scoped querySelector searches to specific harmony type using `data-harmony-type` attribute
  - Stores original SVG circle attributes (`r`, `stroke-width`) in dataset for restoration
  - Dynamically modifies SVG circle attributes and applies CSS filters on hover
- New `showDevianceLine(hex, harmonyType, strokeColor)` and `hideDevianceLine(harmonyType)` functions for deviance line visualization
  - Creates SVG line element dynamically using `document.createElementNS()`
  - Positions line between base color dot and matched color dot using SVG circle coordinates
  - Accepts dynamic stroke color parameter to match badge color
  - Line inserted before color dots in DOM to maintain proper z-ordering
  - Removes any existing deviance line before creating new one to prevent duplicates
- New `zoomIn(harmonyType)` and `zoomOut()` functions for harmony container zoom
  - Uses CSS classes and fixed positioning to create modal-like zoom effect
  - Manipulates `overflow` property on body element to disable scrolling
  - Toggles visibility of zoom buttons using inline styles
  - Event listeners: onclick for backdrop, onkeydown (Escape key) for exiting zoom
- SVG color wheel updated to use `viewBox` instead of hardcoded width/height attributes
  - Enables responsive scaling with CSS while maintaining coordinate system
  - Inline styles provide default sizing that can be overridden by CSS
- CSS animations and transitions:
  - `.zoom-backdrop` with `fadeIn` keyframe animation (0.3s)
  - `.harmony-section.zoomed` with `zoomIn` keyframe animation (0.3s)
  - Color wheel CSS transitions for smooth scaling
  - Z-index layering: backdrop (1000), zoomed section (1001), tooltip (1002)
- Color wheels now include `data-harmony-type` attribute for proper scoping
- Color dots include `data-hex` attribute for identification
- Harmony sections include `.harmony-section` class and `data-harmony-type` attribute for zoom targeting
- `createColorSwatchHTML()` updated to accept `harmonyType` parameter and bind hover events
  - Deviance badges now include hover events (`onmouseenter`/`onmouseleave`) that trigger line visualization
  - Badge stroke color variable matches Tailwind CSS color values (green-500, yellow-500, red-500)
- New `calculateDevianceRating()` function converts RGB distance to 0-10 scale
- Enhanced `generateHarmony()` to return objects containing:
  - Ideal RGB values (mathematically perfect harmony color)
  - Matched FFXIV dye color (closest available)
  - Distance between ideal and matched colors
  - Calculated deviance rating
- Updated `createColorSwatchHTML()` to accept and display optional deviance ratings with color-coded badges
- Added flexbox-based two-column layout with `.app-container`, `.left-sidebar`, and `.right-content` classes
- Sidebar uses `position: sticky` for persistent visibility while scrolling
- Responsive breakpoint at 1024px switches to stacked layout for tablets and mobile devices

## [1.0.0] - 2025-10-28

### Added
- **Exclude Jet Black and Pure White** feature
  - New checkbox to exclude these extreme colors from:
    - Base color dropdown
    - Color harmony calculations
    - Market price fetching
  - Enabled by default: disabled
  - Fully integrated with all filtering systems

- **Enhanced Exclude Metallic Colors** feature
  - Now removes metallic dyes from the base color dropdown
  - Previously only excluded from harmony calculations
  - Consistent behavior with other exclusion filters
  - Enabled by default: disabled

- **Centered Export Options UI**
  - Export section now center-aligned for better visual balance
  - All four export buttons centered in the layout

- **Market Board Price Fetching**
  - Integration with Universalis API for real-time dye prices
  - Support for all FFXIV data centers and individual worlds
  - Selective price fetching by dye category:
    - Base Dyes
    - Craft Dyes
    - Beast Tribe Dyes
    - Cosmic Dyes
    - Special Dyes
  - Price caching to reduce API calls
  - Toggle to show/hide market prices
  - Status messages for price updates

- **Color Matcher Tool** (`colormatcher.html`)
  - Upload images to find matching FFXIV dyes
  - Interactive eyedropper with configurable sample sizes (1x1 to 64x64)
  - Drag-and-drop image support
  - Option to exclude metallic dyes from matching

- **Documentation**
  - Comprehensive README.md with features and usage instructions
  - CLAUDE.md for AI-assisted development guidance
  - MIT LICENSE for open-source distribution
  - CHANGELOG.md for tracking project history

### Fixed
- **Market Price API Integration**
  - Switched from standard endpoint to aggregated endpoint
  - Fixed type mismatch in cache key handling (string vs number)
  - Proper parsing of `nq.minListing.dc.price` structure
  - Intelligent fallback: DC → World → Region prices
  - Resolved "Sold Out" false positives for Jet Black and Pure White

- **Color Matcher Path Issue**
  - Updated `colors.json` reference to correct path: `./assets/json/colors_xiv.json`
  - Fixed error messages to reflect actual file location

- **Filter Dropdown Synchronization**
  - Exclusion filters now properly repopulate dropdown when toggled
  - Consistent behavior across all filter types
  - Fixed issue where excluded colors remained selectable

### Changed
- Improved exclusion filter architecture for better maintainability
- Enhanced `getFilteredColors()` function to handle multiple exclusion types
- Updated event listeners to refresh dropdowns when filters change
- Optimized price cache lookup with consistent string key usage

### Technical Details
- Color harmony generation uses HSV color space for calculations
- RGB Euclidean distance algorithm for closest color matching
- Aggregated Universalis API endpoint: `https://universalis.app/api/v2/aggregated/{server}/{itemIds}`
- Price data structure: `results[].nq.minListing.{dc|world|region}.price`
- All data stored client-side with no backend requirements

## [0.9.0] - Previous Version

### Features (Pre-existing)
- Color harmony generation (6 harmony types)
- Dark mode toggle with localStorage persistence
- Export options (JSON, CSS, SCSS)
- Acquisition method filtering
- Search functionality for colors
- Interactive color wheels
- Facewear color exclusion
- Copy to clipboard functionality

---

## Release Notes Format

For future releases, please include:
- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** for vulnerability patches
