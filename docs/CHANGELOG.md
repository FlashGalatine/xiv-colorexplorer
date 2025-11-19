# XIV Dye Tools - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.1] - 2025-11-19

### 🎨 Theme System Updates & Color Matcher Enhancements

**Status**: ✅ COMPLETE
**Focus**: Theme refinements, Color Matcher improvements, and Theme Editor enhancements

#### Theme System Updates ✅
- **Standard Light Theme** - Updated with refined color palette:
  - Background: `#E4DFD0` (warm beige)
  - Text: `#1E1E1E` (near black)
  - Text Header: `#F9F8F4` (off-white)
  - Card Background: `#F9F8F4`
  - Card Hover: `#FDFDFC`
  - Improved contrast and readability
- **Standard Dark Theme** - Updated with refined color palette:
  - Primary: `#E4AA8A` (warm peach)
  - Background: `#2B2923` (warm dark brown)
  - Text Header: `#1E1E1E` (dark for contrast on primary)
  - Background Secondary: `#2B2923`
  - Card Hover: `#242424`
- **Hydaelyn Light Theme** - Updated with refined color palette:
  - Primary: `#4056A4` (deep blue)
  - Background: `#B2C4CE` (soft blue-gray)
  - Text: `#312D57` (dark purple-gray)
  - Background Secondary: `#B2C4CE`
- **OG Classic Dark Theme** (formerly Classic Light) - Renamed and updated:
  - Renamed from "Classic Light" to "OG Classic Dark" to better reflect its dark aesthetic
  - Background: `#181820` (very dark blue-gray)
  - Text: `#F9F8F4` (off-white)
  - Card Background: `#000B9D` (deep blue)
  - Card Hover: `#5052D9` (bright blue)
- **Grayscale Themes** - Updated for better contrast:
  - Grayscale Light: Text Header `#FFFFFF`, Border `#404040`
  - Grayscale Dark: Border `#9CA3AF`

#### Theme Removals ✅
- **Hydaelyn Dark** - Removed from theme system
- **Classic Dark** - Removed from theme system
- Total themes reduced from 12 to 10 for streamlined experience

#### Color Matcher Enhancements ✅
- **Copy Hex Button** - Added "Copy Hex" button to each dye card (Matched Dye and Similar Dyes)
  - One-click hex code copying to clipboard
  - Toast notifications for success/error feedback
  - Fallback support for older browsers
  - Theme-aware styling with hover effects
  - Positioned after category badge for easy access

#### Theme Editor Improvements ✅
- **WCAG Compliance Matrix Toggles** - Added show/hide controls for rows and columns
  - Separate controls for foreground colors (rows) and background colors (columns)
  - Default visibility optimized for typical WCAG testing scenarios
  - Rows: Text, Text Header, Border, Text Muted visible by default
  - Columns: Primary, Background, Background Secondary, Card Background, Card Hover visible by default
  - Checkboxes persist state and update matrix in real-time
  - Improved usability for accessibility testing workflows

#### Technical Updates ✅
- Updated TypeScript types to reflect theme changes
- Updated test files to use new theme names
- Updated CSS theme class definitions
- All 514 tests passing with updated theme references

---

## [2.0.0] - 2025-11-18

### 🎨 UI Polish & Theme System Enhancements (Latest Session)

**Status**: ✅ COMPLETE | Session: Current
**Focus**: Theme-aware UI components, Advanced Dye Filters refactor, and comprehensive UI improvements

#### Issue 1: Standard Theme Color Redesign ✅
- Changed Standard Light theme primary from indigo (#4F46E5) to red (#DC2626), then refined to #AB1C1C
- Changed Standard Dark theme primary from indigo (#818CF8) to red (#F87171)
- Visual differentiation achieved from Hydaelyn (sky blue) and Classic FF (deep blue) themes
- Accessibility verified: Both colors meet WCAG AA+ contrast standards (6.5:1 and 10.1:1)
- All 5 tools tested with new theme colors at multiple breakpoints

#### Grayscale Themes Added ✅
- Two new accessibility-focused themes: Grayscale Light and Grayscale Dark
- Pure black, white, and gray color scheme (no color perception required)
- Grayscale Light: #404040 primary, 10.5:1 header contrast, 20.8:1 body text contrast (WCAG AAA)
- Grayscale Dark: #6B7280 primary, 7.2:1 header contrast, 19.6:1 body text contrast (WCAG AA+)
- Total themes: 12 (was 10) - provides maximum color differentiation and accessibility
- White text used for primary-colored headers to ensure universal contrast across all themes

#### Issue 2: Dye Filters Expand/Collapse ✅
- Added clickable header "Advanced Dye Filters" to toggle filter visibility
- Filters start collapsed by default to reduce visual clutter
- Chevron icon rotates to indicate expanded/collapsed state (▼/▶)
- Smooth 300ms transitions for height, opacity, and rotation
- Expanded state persists in localStorage key: `xivdyetools_harmony_filters_expanded`
- Improves UI/UX on Harmony Explorer tool
- No bundle size increase (toggle logic is minimal JavaScript)

#### Issue 3: Simple/Expanded Suggestions Modes ✅
- **Simple Suggestions**: Strict harmony with exact dye counts per harmony type
  - Complementary: 2 dyes (base + 1)
  - Analogous: 3 dyes (base + 2)
  - Triadic: 3 dyes (base + 2)
  - Split-Complementary, Tetradic, Square, Monochromatic, Compound, Shades configured with specific limits
- **Expanded Suggestions**: Simple mode + additional similar dyes per harmony dye
  - Adds 1 companion dye for each harmony dye using color distance (like Dye Mixer)
  - Facewear dyes excluded from additional companions
  - Example: Tetradic shows 4 base + 3 additional = 7 total
- UI: Radio buttons in Harmony Explorer options section
- Preference persisted in localStorage key: `xivdyetools_harmony_suggestions_mode`
- Bundle size increase: +2.83 KB (27.43 KB gzipped for harmony tool)
- Foundation enables users to choose between precision (Simple) and exploration (Expanded)

#### Optional Enhancement: Variable Companion Dyes Count ✅
- **Purpose**: Allow users to customize how many companion dyes appear for each harmony color in Expanded mode
- **Range**: 1-3 additional companion dyes per harmony color (configurable)
- **UI**: Range slider input (1-3) visible only in Expanded Suggestions mode
  - Shows current selection with live value display
  - Hidden automatically when switching to Simple mode
  - Labeled: "Additional Dyes per Harmony Color"
- **Algorithm**: Modified companion dye selection to find N closest dyes per harmony color
  - Uses color distance for finding companions (Euclidean RGB space)
  - Prevents duplicate selections with usedDyeIds set
  - Stops gracefully when insufficient unmatched dyes available
- **Persistence**: Saved to localStorage key: `xivdyetools_harmony_companion_dyes`
  - Defaults to 1 if not set (matches original behavior)
  - Validated to stay within 1-3 range
- **Bundle Size**: Minimal increase (+0.54 KB gzipped, 27.97 KB for harmony tool)
- **Examples**:
  - Value 1: Tetradic = 4 base dyes + 3 additional = 7 total
  - Value 2: Tetradic = 4 base dyes + 6 additional = 10 total
  - Value 3: Tetradic = 4 base dyes + 9 additional = 13 total
- **Result**: Exploration users can control detail level from focused (1) to comprehensive (3)

#### Issue 4: Advanced Dye Filters ✅
- Filter UI implemented in Harmony Explorer (3 checkbox filters)
- Exclude Metallic: Hide dyes with "Metallic" in the name
- Exclude Pastel: Hide dyes with "Pastel" in the name
- Exclude Expensive: Hide Jet Black (#13115) & Pure White (#13114)
- Filter settings persisted to localStorage with automatic restoration
- Filters applied after Facewear exclusion in harmony calculation
- Bundle size increase: Minimal (24.60 KB gzipped for harmony tool, up from 22.94 KB)
- Tests verified with TypeScript strict mode, production build successful

#### Advanced Dye Filters Component Refactor ✅
- **Reusable Component**: Extracted filter UI and logic into new `DyeFilters` component (`src/components/dye-filters.ts`)
- **Multi-Tool Integration**: Integrated into Harmony Explorer, Color Matcher, and Dye Mixer tools
- **New Exclusion Filters**:
  - **Exclude Dark Dyes**: Hide dyes that begin with "Dark" in their name
  - **Exclude Cosmic Dyes**: Hide dyes with "Cosmic Exploration" or "Cosmic Fortunes" acquisition
- **Collapsed by Default**: Filters start collapsed to reduce visual clutter
- **Persistent State**: Expanded/collapsed state and filter preferences saved per tool
- **Harmony Explorer Fix**: Excluded dyes now replaced with next-best alternatives in all harmony types
- **Storage Keys**: Tool-specific localStorage keys (e.g., `harmony_filters`, `colormatcher_filters`, `dyemixer_filters`)

#### Theme System Enhancements ✅
- **Custom Header Text Color**: New `--theme-text-header` CSS variable for customizable header text colors
  - Applied to: "XIV Dye Tools" title, version text, harmony card headers, activated buttons, "Generate" button, "Refresh Prices" button
  - Defaults to `--theme-text` color but customizable via Theme Editor
  - All 10 theme palettes updated with `textHeader` property
- **Theme-Aware Button Hover Effects**: All action buttons now use brightness filter for consistent hover feedback
  - Generate button (Harmony Explorer)
  - Clear button (Dye Selector)
  - Refresh Prices button (Market Board)
  - Copy Share URL button (Dye Mixer)
  - Tool navigation buttons (main.ts)
  - Hover: `brightness(0.9)`, Active: `brightness(0.8)`
  - Smooth transitions with `transition-all duration-200`
- **Theme-Aware Input Sliders**: Range inputs use `accent-color: var(--theme-primary)` for theme consistency
  - Color Matcher sample size slider
  - Dye Mixer step count slider
  - All sliders adapt to theme changes automatically

#### UI Fixes & Improvements ✅
- **Logo Path Fix**: Updated logo path to `/assets/icons/icon-192x192.png` with fallback handling
- **Menu Closing Logic**: Tools and Theme dropdowns now close when the other is clicked (cross-component communication)
- **Theme Menu Background**: Fixed transparent background for better readability
- **Header Text Contrast**: Improved readability of "XIV Dye Tools" text across all 10 themes
- **Hardcoded Colors Removed**: Eliminated hardcoded white colors, now uses `--theme-text-header` variable
- **Market Board Default**: "Show Prices" option now defaults to disabled (false)
- **CSS Rule Cleanup**: Removed global `h1-h6` color override that was conflicting with `--theme-text-header`

#### Test Coverage Expansion ✅
- **Total Tests**: 514 passing (up from 140)
  - Service tests: 140
  - UI component tests: 230
  - Tool component tests: 142
  - Harmony generator tests: 2
- **New Test Files**:
  - `src/components/__tests__/dye-filters.test.ts` (pending)
  - Expanded coverage for all tool components

---

## [2.0.0] - 2025-11-16

### 📍 Phase 12.8: Critical Bug Fixes (Previous Session)

**Status**: ✅ 5/9 Issues Fixed (56% complete) | Session: 2-3 hours
**Branch**: phase-12.7/release (5 new commits)
**Test Results**: ✅ 140/140 passing | ✅ 0 TypeScript errors

#### CRITICAL Issues Fixed (4/4):
1. **Issue #1**: Tools dropdown navigation (desktop) - New `ToolsDropdown` component in header
2. **Issue #2**: Mobile bottom navigation - New `MobileBottomNav` component (fixed bottom)
3. **Issue #3**: Image zoom controls (Color Matcher) - Full zoom system (50-400%, wheel, keyboard)
4. **Issue #4**: Copy Share URL button with toasts - Functional sharing + reusable notification system

#### MAJOR Issues Fixed (1/5):
5. **Issue #5**: Theme background colors - Fixed missing `.bg-gray-900` override, all 10 themes now work

#### Remaining Work:
- Issue #6: Theme dropdown outside click handling
- Issue #7: Make charts theme-aware
- Issue #8: Use actual dye colors for chart dots
- Issue #9: localStorage persistence (gradients)
- Issues #11-15: Minor polish & toast notifications

---

### 🎯 Overview (Phase 12.6 - Previous)
Complete TypeScript/Vite refactor bringing modern architecture, type safety, and maintainability to XIV Dye Tools. All 5 tools ported to component-based architecture with comprehensive unit testing. Phase 12.6 (Testing & Bug Fixes) completed with all 5 critical bugs resolved:
1. ✅ All 5 colorblindness types now display in Accessibility Checker
2. ✅ Color wheel visualization added to Color Harmony Explorer
3. ✅ Facewear dyes excluded from Color Matcher recommendations
4. ✅ Theme-aware tip text in Color Matcher
5. ✅ Save/load feature implemented in Dye Mixer

### ✨ New Features

#### Architecture & Infrastructure
- **TypeScript Strict Mode** - Full type safety across entire codebase
- **Vite Build System** - ~5x faster build times, optimized bundling
- **Component Architecture** - Reusable UI components with lifecycle hooks
- **Service Layer** - Centralized business logic (ColorService, DyeService, ThemeService, StorageService)
- **Unit Testing** - 140 tests with >90% coverage on core services

#### User Features
- **Duplicate Dye Selection** - Accessibility Checker allows selecting same dye multiple times
- **Improved Search** - Category filtering and search now stable without focus loss
- **Better Visual Feedback** - Category button highlighting updates correctly
- **Enhanced Theme System** - 10 theme variants with proper colors

### 🐛 Bug Fixes

#### Phase 12.5 (Bug Fixes)
- **Facewear Exclusion** - Facewear dyes no longer suggested for color matching
- **Triadic Harmony** - Base color excluded from triadic harmony results
- **Harmony Suggestion Limiting** - Top 6 harmony suggestions by deviance score
- **Button Text Contrast** - All button text set to white on primary colors
- **Theme Backgrounds** - Distinct backgrounds for light themes
- **Harmony Card Headers** - Theme-aware header styling with proper contrast

#### Phase 12.6 (Testing & Bug Fixes - FINAL)
- **All 5 Colorblindness Types** - Accessibility Checker now displays all vision types in visual grid
- **Color Wheel Visualization** - Interactive color harmony wheel in Color Harmony Explorer
- **Facewear Exclusion** - Facewear dyes properly excluded from Color Matcher recommendations
- **Theme-Aware Styling** - Color Matcher tip text updates with selected theme
- **Save/Load Gradients** - Dye Mixer now supports saving and loading color gradients
- **Event Listener** - Fixed Accessibility Checker event handling
- **Neutral Button Visual Bug** - Category button highlighting corrected
- **Search Input Focus Loss** - Search box preserves value and focus
- **Category Highlighting** - Button states update correctly when switching
- **DOM Update Optimization** - Smart update() only re-renders changed sections

### 🚀 Performance Improvements

- **Build Time** - ~5x faster with Vite (2-3s vs 10-15s)
- **Bundle Size** - 141.37 kB JS + 37.08 kB CSS (optimized)
- **Component Updates** - Smart update() avoids full re-renders
- **Canvas Optimization** - Resolution reduction maintains performance
- **Memory Management** - Proper cleanup and lifecycle hooks

### 📦 Dependency Updates

- **Build Tool** - Vite 5.4.21
- **Language** - TypeScript 5.x (strict mode)
- **Testing** - Vitest 1.x with v8 coverage
- **Styling** - Tailwind CSS with theme system

### 🔧 Technical Changes

#### Codebase Structure
```
Before (v1.6.x):          After (v2.0.0):
- Monolithic HTML files   - src/components/
- No TypeScript           - src/services/
- No build system         - src/shared/
- Manual testing          - src/styles/
                          - Vite build system
                          - 140 unit tests
```

#### Services
- **ColorService** - RGB/HSV, colorblindness, contrast
- **DyeService** - Database, filtering, harmony
- **ThemeService** - 10-theme system
- **StorageService** - localStorage wrapper

### 📊 Test Coverage

| Service | Statements | Status |
|---------|-----------|--------|
| ThemeService | 98.06% | ✅ |
| DyeService | 94.9% | ✅ |
| ColorService | 89.87% | ✅ |
| StorageService | 79.78% | ✅ |

**Tests**: 514/514 passing (100%)

### 🎨 Theme System

All 10 themes fully functional:
- Standard (Light/Dark) - Red primary color
- Hydaelyn (Light/Dark) - Sky blue primary color
- Classic FF (Light/Dark) - Deep blue primary color
- Parchment (Light/Dark) - Warm beige primary color
- Sugar Riot (Light/Dark) - Vibrant pink primary color
- Grayscale (Light/Dark) - Pure black/white/gray (accessibility-focused)

**Theme Features:**
- Customizable header text colors via `--theme-text-header` CSS variable
- Theme-aware button hover effects (brightness filter)
- Theme-aware input sliders (accent-color)
- All interactive elements adapt to theme changes

### ⚠️ Breaking Changes

**For Users**: None - All v1.6.x features work identically

**For Developers**: 
- Build system changed to Vite
- Import paths use @ aliases
- TypeScript required

### 🔄 Migration from v1.6.x

No action needed for users.
- Settings automatically migrated
- No data loss
- Bookmarks continue to work

### ♿ Accessibility

- WCAG AA compliance
- Colorblindness simulation (Brettel 1997)
- Keyboard navigation
- High contrast support

### 📱 Responsive Design

- Mobile-first design
- Bottom navigation for mobile
- Tools dropdown for desktop
- Responsive themes

### 🔐 Security

- Strict CSP headers
- Input validation
- No external dependencies
- Private method encapsulation

---

## [1.6.1] - 2025-11-13

### ✨ Features
- 4 stable tools
- Theme system
- localStorage persistence

### 🐛 Fixes
- Theme switching
- Color calculations
- Database loading

---

## [1.0.0] - Initial Release

Initial community release with Color Accessibility Checker.

---

**Generated**: 2025-11-16
**License**: MIT
