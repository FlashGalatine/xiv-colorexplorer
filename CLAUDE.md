# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XIV Dye Tools is a client-side web application providing four specialized tools for Final Fantasy XIV players to explore dye colors:

1. **Color Accessibility Checker** (v2.0.0) - Simulate colorblindness (deuteranopia, protanopia, tritanopia, achromatopsia)
2. **Color Harmony Explorer** (v2.0.0) - Generate harmonious color palettes using color theory
3. **Color Matcher** (v2.0.0) - Upload images and find closest matching FFXIV dyes
4. **Dye Comparison** (v2.0.0) - Compare up to 4 dyes with color distance matrices and visualizations
5. **Dye Mixer** (v2.0.0) - Find intermediate dyes for smooth color transitions

**Current Status**: v2.0.0 Production (Phase 12 Complete - TypeScript/Vite Migration)
**Repository**: Main branch (stable v2.0.0 TypeScript/Vite)
**Deployment**: All tools deployed with modern architecture (TypeScript, Lit, Vite)
**Latest Session**: 2025-11-17 - Phase 12 TypeScript/Vite refactor complete, critical issues resolved

## Architecture: v2.0.0 TypeScript + Vite + Lit

### Modern Component-Based Architecture

v2.0.0 refactored from monolithic HTML files to a modern TypeScript + Lit component architecture:

**Key Benefits**:
- **Type Safety**: Full TypeScript with strict mode enabled
- **Modular Design**: Service layer + component layer separation of concerns
- **Build Optimization**: Vite for fast development and optimized production builds
- **No Duplication**: Shared services used across all tools
- **Easy Testing**: Unit tests for all services (140 tests, 100% pass rate)
- **Framework Agnostic**: Lit for web components, framework-independent

**Legacy Files**: Original monolithic HTML files (v1.6.x) preserved in `legacy/` folder for historical reference

### File Organization (v2.0.0)

```
src/
├── main.ts                                         # Application entry point
├── index.html                                      # HTML shell
├── components/                                     # Lit web components
│   ├── app-layout.ts                              # Main application shell
│   ├── accessibility-checker-tool.ts              # Colorblindness simulator
│   ├── color-matcher-tool.ts                      # Image color matching
│   ├── dye-comparison-chart.ts                    # Multi-dye visualization
│   ├── dye-mixer-tool.ts                          # Color interpolation
│   ├── base-component.ts                          # Base class for all components
│   ├── color-wheel-display.ts                     # Harmony visualization
│   ├── harmony-type.ts                            # Harmony type selector
│   ├── dye-selector.ts                            # Dye dropdown component
│   ├── theme-switcher.ts                          # Theme selection UI
│   ├── tools-dropdown.ts                          # Tools navigation
│   ├── mobile-bottom-nav.ts                       # Mobile navigation bar
│   └── index.ts                                   # Component exports
│
├── services/                                       # Business logic layer
│   ├── api-service.ts                             # Universalis API integration
│   ├── color-service.ts                           # Color algorithms (accessibility, harmony)
│   ├── dye-service.ts                             # Dye database management
│   ├── storage-service.ts                         # localStorage wrapper
│   ├── theme-service.ts                           # 10-theme system
│   └── __tests__/                                 # Unit tests (100% pass rate)
│
├── shared/                                         # Shared utilities
│   ├── constants.ts                               # Application constants
│   ├── types.ts                                   # TypeScript type definitions
│   └── utils.ts                                   # Helper functions
│
├── styles/                                         # Styling
│   ├── globals.css                                # Global styles
│   ├── themes.css                                 # 10 theme CSS variables
│   └── components.css                             # Component-specific styles
│
├── assets/
│   ├── json/
│   │   ├── colors_xiv.json                        # ~125 FFXIV dyes database
│   │   ├── data-centers.json                      # FFXIV data centers
│   │   └── worlds.json                            # FFXIV worlds per data center
│   └── icons/                                      # SVG and icon assets
│
├── public/                                         # Static assets
│   ├── favicon.ico
│   ├── favicon.png
│   └── logo.svg
│
├── dist/                                           # Build output (production)
├── package.json                                    # Dependencies and build scripts
├── vite.config.ts                                  # Vite configuration
├── tailwind.config.js                              # Tailwind CSS configuration
├── tsconfig.json                                   # TypeScript configuration
│
├── README.md                                       # User documentation
├── CHANGELOG.md                                    # Version history
├── FAQ.md                                          # User FAQs
├── CLAUDE.md                                       # (This file) Development guide
├── TODO.md                                         # Development roadmap
└── LICENSE                                         # MIT License
```

### Legacy Files (v1.6.x)

**Location**: `legacy/` folder contains original monolithic HTML files:
- `legacy/coloraccessibility_stable.html`
- `legacy/colorexplorer_stable.html`
- `legacy/colormatcher_stable.html`
- `legacy/dyecomparison_stable.html`
- `legacy/dye-mixer_stable.html`
- (+ experimental versions)

These are preserved for historical reference and comparison but are **not actively maintained**.

### Development Workflow (v2.0.0)

**No experimental/stable branching needed** - TypeScript build system provides testing separation:

**Testing Checklist Before Syncing to Stable**:
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Light mode and all 10 theme variants work correctly
- [ ] Responsive design at 1080p and smaller
- [ ] localStorage persistence works (refresh page, settings retained)
- [ ] Browser console shows no errors or warnings
- [ ] All error scenarios tested (missing data, API failures, invalid input)

**Manual Testing Steps for localStorage Persistence**:
1. Open tool in browser and make a change (select theme, toggle feature, etc.)
2. Open DevTools (F12), go to Application tab → Storage → localStorage
3. Verify the key was saved (e.g., `xivdyetools_theme`)
4. Refresh page (Ctrl+R / Cmd+R) and confirm change persisted
5. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to clear cache, verify again
6. Close and reopen browser window to test session persistence

**Browser Testing Priority Order**:
1. Chrome (primary - most users)
2. Firefox (secondary - good compatibility)
3. Edge (Chromium-based, usually works if Chrome works)
4. Safari (last - most likely to have quirks)

**Checking Console for Errors**:
1. Open DevTools (F12)
2. Go to Console tab
3. Filter by "Error" (red badge in top-left)
4. Filter by "Warning" (yellow badge)
5. All filters should show 0 items before syncing

## Quick Commands & Development Workflow

### Development Environment Setup

**Prerequisites**:
```bash
# Install Node.js 16+ and npm 8+
# Then install project dependencies
npm install
```

### Common npm Commands

**Development Server** (with hot reload):
```bash
npm run dev
# Opens http://localhost:5173 automatically
# Watches for changes and rebuilds automatically
```

**Production Build**:
```bash
npm run build
# Creates optimized dist/ folder for deployment
# Runs linting, type checking, and build process
```

**Preview Production Build** (before deploying):
```bash
npm run preview
# Serves the production build locally
# Visit http://localhost:4173 to test
```

**Run Tests**:
```bash
npm run test
# Runs all unit tests (140 tests, 100% pass rate)
# Coverage report: npm run test -- --coverage
```

**Run Linter**:
```bash
npm run lint
# Checks TypeScript syntax and style rules
# Automatically fixes fixable issues
```

**Build Checklist Before Committing**:
```bash
npm run lint      # ✓ All code style checks pass
npm run test      # ✓ All tests pass (140/140)
npm run build     # ✓ Production build succeeds
npm run preview   # ✓ Preview runs without errors
```

### Testing Checklist

**Before Committing Changes**:
- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run test` shows 140/140 tests passing
- [ ] `npm run build` completes without warnings
- [ ] `npm run preview` opens without console errors
- [ ] All 5 tools load and function correctly in preview
- [ ] Theme switcher works (all 10 themes)
- [ ] localStorage persistence works (refresh page, settings retained)

**Browser Testing** (after `npm run preview`):
1. Open Chrome - test all tools, all themes
2. Open Firefox - verify compatibility
3. Responsive: Test at 375px, 768px, 1024px viewport sizes
4. DevTools Console: Should show 0 errors, 0 warnings

### Phase 9.5: Mobile Navigation Strategy (Current)

**Important Update (2025-11-16)**: Mobile navigation has been optimized with synchronized breakpoints and responsive design.

**Navigation Strategy Overview**:
- **Mobile Devices (≤768px)**: Bottom navigation bar visible, Tools dropdown hidden
- **Tablet/Desktop (>768px)**: Tools dropdown visible in header, bottom nav hidden
- **Perfect Breakpoint Alignment**: Both systems use 768px breakpoint for zero navigation redundancy

**Key Improvements**:

1. **Breakpoint Synchronization**
   - Tools dropdown hides at `max-width: 768px` using `display: none !important;`
   - Bottom nav shows for all screens ≤768px
   - Prevents overlapping navigation controls
   - Users see exactly one navigation system at any viewport size

2. **CSS Specificity Handling**
   - Global CSS rules (shared-styles.css) can override media queries
   - Solution: Add `!important` flag to force responsive behavior
   - Example: `.nav-dropdown { display: none !important; }` at 768px breakpoint

3. **Fixed Positioning Strategy**
   - Theme button and Tools dropdown both use `position: fixed` on all screen sizes
   - Keep fixed on mobile instead of switching to static positioning
   - Maintains top-right corner placement across all devices
   - Adjust only spacing values (padding, gap) for mobile: 0.5rem instead of 1rem

4. **UX Improvements**
   - Theme menu auto-closes after selection (no need to tap outside)
   - Implemented via JavaScript event delegation in `initEventDelegation()`
   - Improves mobile interaction pattern

**Testing Checklist for Mobile Navigation**:
- [ ] Mobile portrait (375px): Tools hidden, bottom nav visible
- [ ] Mobile landscape (812px): Tools visible, bottom nav hidden
- [ ] Tablet (768px): Tools hidden, bottom nav visible (edge case)
- [ ] iPad Air (820px): Tools visible, bottom nav hidden
- [ ] Theme button positioned at top-right on all sizes
- [ ] Theme menu closes after selection on all devices
- [ ] No console errors related to navigation

**When Modifying Navigation Components**:
1. Changes to `components/nav.html` affect all stable tools
2. Always apply identical changes to `components/nav-experimental.html`
3. Test at multiple breakpoints: 375px, 640px, 768px, 820px, 1024px
4. Verify breakpoint alignment with bottom nav implementation
5. Check that position: fixed works correctly with z-index layering

### Syncing Experimental to Stable (Windows Commands)

```bash
# Copy all 4 experimental → stable (Windows PowerShell)
Copy-Item "coloraccessibility_experimental.html" "coloraccessibility_stable.html"
Copy-Item "colorexplorer_experimental.html" "colorexplorer_stable.html"
Copy-Item "colormatcher_experimental.html" "colormatcher_stable.html"
Copy-Item "dyecomparison_experimental.html" "dyecomparison_stable.html"

# Or using Windows Command Prompt (cmd.exe)
copy coloraccessibility_experimental.html coloraccessibility_stable.html
copy colorexplorer_experimental.html colorexplorer_stable.html
copy colormatcher_experimental.html colormatcher_stable.html
copy dyecomparison_experimental.html dyecomparison_stable.html

# Verify copies were successful
dir *_stable.html
```

### Phase 12 Development Workflow (v2.0.0 - TypeScript + Vite)

**Git Strategy for Phase 12**:
- `main` branch = stable v1.6.x (production-ready)
- `experimental` branch = Phase 12 development (TypeScript/Vite refactor)
- Feature branches off `experimental` for each sub-phase (12.1, 12.2, etc.)

**When Phase 12 Starts**:

```bash
# Clone or pull the experimental branch
git clone -b experimental https://github.com/FlashGalatine/xivdyetools.git
git checkout experimental

# Create feature branch for current phase (e.g., Phase 12.1)
git checkout -b phase-12.1/build-system

# Work on Phase 12.1 tasks...
# Commit regularly with clear messages
git commit -m "Phase 12.1: Setup Vite configuration with TypeScript support"

# Push to remote
git push -u origin phase-12.1/build-system

# When ready, create PR: phase-12.1/build-system → experimental
# After review and testing, merge to experimental
```

**Branch Strategy**:
```
main (v1.6.x stable)
└── experimental (Phase 12 development)
    ├── phase-12.1/build-system
    ├── phase-12.2/services
    ├── phase-12.3/components
    ├── phase-12.4/tools
    ├── phase-12.5/integration
    ├── phase-12.6/testing
    └── phase-12.7/release
```

**Commit Message Pattern for Phase 12**:
```
Phase 12.X: Brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3

Checklist: See PHASE_12_CHECKLIST.md
```

**Switching Branches**:
```bash
# Work on v1.6.x bugs (if needed)
git checkout main

# Work on Phase 12 development
git checkout experimental

# Work on specific Phase 12 sub-task
git checkout phase-12.2/services
```

**Important Notes**:
- ✅ Always keep `main` branch stable (v1.6.x)
- ✅ All Phase 12 work happens on `experimental` branch
- ✅ Feature branches should be short-lived (1-2 weeks max)
- ✅ Merge feature branch to `experimental` when complete
- ✅ Final Phase 12: merge `experimental` → `main` as v2.0.0 release

### Searching the Codebase

**Find all uses of a utility function**:
```bash
# Search for "getColorDistance" in all tool files
grep -r "getColorDistance" *.html

# Count occurrences
grep -c "getColorDistance" colorexplorer_experimental.html
```

**Find hardcoded color references**:
```bash
# Search for hex color pattern
grep -E "#[0-9A-Fa-f]{6}" coloraccessibility_experimental.html | head -20

# Find all theme-related code
grep -r "body\..*-light\|body\..*-dark" assets/css/
```

**Find localStorage key usage**:
```bash
# See all localStorage interactions
grep -n "localStorage\|safeGetStorage\|safeSetStorage" colormatcher_experimental.html
```

## Common Gotchas & Warnings

### 1. Monolithic File Sizes (1,500-1,900 lines)

**⚠️ Problem**:
- Each tool is a single massive HTML file
- Hard to search and review in git diffs
- Difficult for new contributors to understand

**How to Work Around It**:
- Use browser Find (Ctrl+F / Cmd+F) to locate specific functions
- Search for section headers: `<!-- SECTION: SHARED UTILITIES -->` or `<!-- EVENT LISTENERS -->`
- When editing, note the line numbers for reference
- Use git blame to find when large blocks were added

**Example Search Pattern**:
- `getColorDistance` - color utility functions (shared)
- `drawHueSaturationChart` - visualization code (tool-specific)
- `addEventListener` - event binding section

### 2. Code Duplication Across Tools

**⚠️ Problem**:
- Same utility functions repeated in each of the 4 tools (~200 lines each)
- Many shared functions moved to `shared-components.js`, but some still duplicated
- Total duplication: ~1,600+ lines across all tools

**How to Handle**:
- Always check `shared-components.js` first before adding utilities
- If adding new utility, add to shared file AND all 4 tools (or refactor to remove duplication)
- Comment duplicated code with: `// Duplicated in: tool1, tool2, tool3 (TODO: centralize)`

**Example - Color Conversion**:
```javascript
// SHARED: in assets/js/shared-components.js
function hexToRgb(hex) { ... }

// STILL DUPLICATED in some older sections but should use shared version
// When refactoring, remove local copy and use: hexToRgb() from shared
```

### 3. Version Number Synchronization

**⚠️ Problem**:
- All 4 tools must stay on same major.minor version (e.g., v1.5.0)
- If you bump one tool, **you must bump all 4**
- Version appears in multiple locations: file headers, version comments, README

**When Bumping Version** (e.g., v1.4.2 → v1.5.0):

1. **Search all experimental files**:
   ```bash
   grep -n "1.4.2" coloraccessibility_experimental.html colorexplorer_experimental.html colormatcher_experimental.html dyecomparison_experimental.html
   ```

2. **Update all 4 tool files** (experimental):
   ```
   Line 1: <!-- Color Accessibility Checker v1.4.2 → v1.5.0 -->
   Line ~50: <span>v1.4.2</span> → <span>v1.5.0</span>
   ```

3. **Update index.html** (portal page):
   ```bash
   grep -n "1.4.2\|1.5.0" index.html
   ```

4. **Update CHANGELOG.md**:
   ```markdown
   ## v1.5.0 - November 13, 2025
   - New features
   - Bug fixes
   - Improvements
   ```

5. **Sync experimental → stable** (copy all files)

6. **Commit with version message**:
   ```bash
   git add .
   git commit -m "Release: v1.5.0 - [description]"
   ```

### 4. Component Loading Requires HTTP Server

**⚠️ Problem**:
- Tools load nav/footer via `fetch('components/nav.html')`
- `fetch()` doesn't work with `file://` protocol (browser security)
- Opening HTML files directly in browser: Components won't load, console error

**Solution**:
- Always use `http://localhost:8000` (or similar)
- Never use `file:///C:/Users/.../index.html`
- See "Running Local Preview" section above

**Error Message You'll See**:
```
Uncaught (in promise) TypeError: Failed to fetch
```

## Detailed Testing Workflow

### Before Syncing to Stable: Complete Test Suite

**1. Component & Theme Testing**:
- [ ] Open in Chrome dev tools, check theme dropdown loads
- [ ] Switch to each theme (Standard, Hydaelyn, Classic FF, Parchment, Sugar Riot)
- [ ] Verify light/dark variants switch correctly
- [ ] Check that theme persists after refresh

**2. Functionality Testing** (per tool):
- **Color Accessibility Checker**:
  - [ ] All 4 vision types produce different outputs
  - [ ] Accessibility score updates correctly
  - [ ] Dual dyes toggle works and persists

- **Color Harmony Explorer**:
  - [ ] All 6 harmony types display
  - [ ] Color wheel highlights work
  - [ ] Zoom functionality opens/closes correctly
  - [ ] Market prices fetch and display

- **Color Matcher**:
  - [ ] Drag-drop works
  - [ ] Clipboard paste works (Ctrl+V / Cmd+V)
  - [ ] Color picker works
  - [ ] Eyedropper tool works

- **Dye Comparison**:
  - [ ] All 3 charts render (distance matrix, hue-sat, brightness)
  - [ ] Charts show all 4 quadrants if all dyes selected
  - [ ] Export formats are valid (JSON, CSS)

**3. localStorage & Persistence Testing**:
- [ ] Select a theme → refresh → theme persists
- [ ] Enable Dual Dyes in Accessibility → refresh → persists
- [ ] Open DevTools → Application → localStorage → verify keys exist
- [ ] Hard refresh (Ctrl+Shift+R) → theme still persists

**4. Console & Error Checking**:
- [ ] F12 to open DevTools
- [ ] Go to Console tab
- [ ] Look for **red errors** (X icon) - should have NONE
- [ ] Look for **yellow warnings** - should have NONE or just browser safe warnings
- [ ] If any errors, note them and fix before syncing

**5. Responsive Design Testing**:
- [ ] Resize browser to 1080p width
- [ ] Resize to tablet (768px)
- [ ] Resize to mobile (375px)
- [ ] Check that layouts stack properly
- [ ] Check that buttons are still clickable on mobile

## Phase 4.1: Theme System (COMPLETE)

### What Changed

Replaced legacy dark mode toggles with a unified 10-theme system. All 4 tools + index.html now support:

**10 Theme Variants**:
- Standard (Light / Dark) - Default gray/indigo
- Hydaelyn (Light / Dark) - Sky blue theme
- Classic FF (Light / Dark) - Deep blue (retro FF)
- Parchment (Light / Dark) - Warm beige/brown
- Sugar Riot (Light / Dark) - Vibrant pink

### How The Theme System Works

**CSS Custom Properties** (`shared-styles.css`):
- 10 complete color sets defined: `body.standard-light`, `body.standard-dark`, etc.
- Variables: `--theme-primary`, `--theme-bg`, `--theme-text`, `--theme-border`, `--theme-bg-secondary`, `--theme-card-bg`, `--theme-text-muted`
- All hardcoded colors replaced with variables

**JavaScript Theme Management** (`shared-components.js`):
```javascript
// Load saved theme on page load
initTheme();

// Set theme and save to localStorage
setTheme('hydaelyn-dark');

// Toggle theme switcher dropdown
toggleThemeSwitcher(button);
```

**localStorage Key**: `xivdyetools_theme` (stores theme name across page refreshes)

**UI Component** (`components/nav.html`):
- Theme switcher dropdown in header
- 10 theme options with color swatches
- Used in all 4 tools and index.html

### Adding a New Theme

1. **Add CSS variables to `assets/css/shared-styles.css`**:
   ```css
   body.myname-light {
       --theme-primary: #3b82f6;
       --theme-bg: #ffffff;
       --theme-text: #000000;
       /* ... etc ... */
   }
   ```

2. **Add button to `components/nav.html`** theme switcher menu

3. **Test** in all 4 tools and portal

## The Four Tools: Architecture & Test Coverage

### 1. Color Accessibility Checker (~1,603 lines)

**Algorithm**: Brettel 1997 colorblindness transformation matrices
- Simulates: Deuteranopia, Protanopia, Tritanopia, Achromatopsia
- Supports: 6 outfit slots (Head, Body, Hands, Legs, Feet, Weapon) with optional dual dyes
- Output: Accessibility score (0-100), distinguishability warnings, dye suggestions

**Test Scenarios**:
- Verify each vision type produces different color outputs
- Check accessibility score accuracy with multiple dye combinations
- Confirm dual dye feature persists in localStorage
- Test contrast ratio calculations

**Recent Bug Fix** (Phase 1): Jet Black matching logic corrected (exact matches now take priority over near-exact)

### 2. Color Harmony Explorer (~1,909 lines)

**Features**: 6 harmony types with color wheel visualization
- Complementary: 180° opposite
- Analogous: ±30° adjacent
- Triadic: 120° spacing
- Split-Complementary: Base + two colors ±30° from complement
- Tetradic: Two pairs of complementary colors
- Square: 90° spacing

**Algorithm**: HSV color space manipulations with deviance scoring (0-10)
- Deviance measures how closely matched dyes align with theoretical positions
- Lower deviance = better theory alignment

**Optional Integration**: Universalis API for real-time market prices (session-level cached, debounced)

**Test Scenarios**:
- Verify each harmony type produces correct angle spacing
- Check deviance calculations are in 0-10 range
- Confirm API integration optional (works without network)
- Test CSV/JSON/SCSS export functionality

### 3. Color Matcher (~1,704 lines)

**Input Methods**:
- Drag & drop image files
- Clipboard paste (Ctrl+V / Cmd+V)
- Direct color picker hex input
- Eyedropper tool (click image to sample color)

**Algorithm**: Euclidean distance in RGB color space
- Sample size: 1×1 to 64×64 pixels (configurable averaging)
- Auto zoom: Portrait images zoom to width, landscape zoom to fit
- Returns closest matching dye using RGB distance

**Test Scenarios**:
- Test all input methods (drag-drop, paste, picker, eyedropper)
- Verify sample size averaging (larger sizes produce more accurate results)
- Check zoom controls (Fit, Width, ±, Reset)
- Confirm error handling for missing/invalid images

**Recent Bug Fix** (Phase 1): Jet Black matching fixed (exclusion filter now acts as "don't auto-suggest" while preserving exact matches)

### 4. Dye Comparison (~1,432 lines)

**Visualizations**:
- Color distance matrix (table with green/yellow/red indicators)
- Hue-Saturation 2D chart (1000×750 canvas)
- Brightness 1D chart (1000×750 canvas)

**Features**: Compare up to 4 dyes, export as JSON/CSS, copy hex codes, market prices

**Canvas Rendering Optimization**: Resolution reduction (RESOLUTION_REDUCTION=2) to handle 750,000+ pixel iterations efficiently

**Test Scenarios**:
- Verify all three chart types render correctly
- Test color distance calculations
- Check export formats (JSON, CSS) are valid
- Confirm Universalis API integration

**Recent Bug Fix** (Phase 1): Hue-Saturation chart now displays all four quadrants (fixed quarter-rendering issue)

## Shared Components System

### Loaded via Dynamic Fetch

Each tool loads components via JavaScript:
```html
<div id="nav-container" class="component-loading"></div>
<script>
  fetch('components/nav.html').then(r => r.text()).then(html => {
    document.getElementById('nav-container').innerHTML = html;
  });
</script>
```

### Shared Utilities (`assets/js/shared-components.js`)

**Color Conversion** (standardized across all tools):
```javascript
hexToRgb(hex)           // "#FF0000" → { r: 255, g: 0, b: 0 }
rgbToHex(r, g, b)       // (255, 0, 0) → "#FF0000"
rgbToHsv(r, g, b)       // (255, 0, 0) → { h: 0, s: 100, v: 100 }
hsvToRgb(h, s, v)       // (0, 100, 100) → { r: 255, g: 0, b: 0 }
```

**Color Distance** (in RGB space):
```javascript
getColorDistance(hex1, hex2)  // Range: 0 (identical) to ~441 (white vs black)
```

**Storage** (defensive with try-catch):
```javascript
safeGetStorage(key, defaultValue)   // Safe localStorage read
safeSetStorage(key, value)          // Safe localStorage write
```

**Theme Management**:
```javascript
initTheme()                 // Load saved theme on page load
setTheme(themeName)        // Apply theme + save to localStorage
toggleThemeSwitcher()      // Toggle dropdown menu
getThemeColor(varName)     // Get computed CSS variable value
```

## Data Structures

### FFXIV Dyes (`assets/json/colors_xiv.json`)

Each dye object:
```javascript
{
  "itemID": 1,
  "id": 1,
  "name": "Jet Black",
  "hex": "#000000",
  "rgb": { "r": 0, "g": 0, "b": 0 },
  "hsv": { "h": 0, "s": 0, "v": 0 },
  "category": "Neutral",  // or "Special", "Facewear", "Red", "Blue", etc.
  "acquisition": "Weaver",
  "cost": 0
}
```

**Categories** (sorted by priority in dropdowns):
1. Neutral (priority 0)
2. Special (priority 98)
3. A-Z Colors (priority 2)
4. Facewear (priority 99, often excluded)

### localStorage Keys

| Key | Used By | Purpose |
|-----|---------|---------|
| `xivdyetools_theme` | All tools | Current selected theme (shared) |
| `secondaryDyesEnabled` | Accessibility Checker | Dual dyes toggle state |
| ~~colorExplorer_darkMode~~ | DEPRECATED | Old dark mode setting |
| ~~colorMatcher_darkMode~~ | DEPRECATED | Old dark mode setting |
| ~~dyeComparison_darkMode~~ | DEPRECATED | Old dark mode setting |

**Note**: Future refactoring should standardize keys to follow pattern: `xivdyetools_[toolname]_[setting]`

## Development Workflow

### Common Tasks

**Adding a feature to all 4 tools**:
1. Edit `colormatcher_experimental.html`
2. Test thoroughly in browser (all themes, responsive, no console errors)
3. Copy entire content to `colormatcher_stable.html`
4. Repeat for other 3 tools
5. Commit with: "Feature: Description (all tools)"

**Updating a shared utility function**:
1. Identify all 4 tools that use it (search via grep)
2. Update in `shared-components.js` first
3. Update local copies in all 4 tool files if they have backup versions
4. Test in each tool with different inputs
5. Commit with: "Update: Function name improvements"

**Syncing experimental to stable**:
1. Bash command: `cp *_experimental.html` to `*_stable.html` (for all 4)
2. Verify files were copied correctly
3. Commit with: "Experimental Sync: Update all experimental builds to v1.4.2"

**Adding localStorage support for a new feature**:
```javascript
// Reading:
const value = safeGetStorage('myapp_myfeature', 'default');

// Writing (in feature handler):
safeSetStorage('myapp_myfeature', newValue);

// During page load:
// Call any init functions that restore state from localStorage
```

### Git Commit Patterns

**Commit message format**:
```
[Phase #]: Brief description

- Detailed change 1
- Detailed change 2
- Detailed change 3

Include problem-solution context when helpful.
```

**Recent commit examples**:
```
Refactor: Use proper theme-switcher component in index.html for consistency

- Replaced custom theme dropdown with components/nav.html markup
- Removed duplicate setTheme and toggleThemeSwitcher functions
- Now relies on shared-components.js for theme system

Result: Theme switcher identical across portal and all 4 tools.
```

## Version Management

**Current Version**: v1.4.2
**Released**: November 13, 2025
**Status**: Production (all experimental synced)

### Version History

| Version | Release Date | Changes |
|---------|--------------|---------|
| v1.4.2 | Nov 13, 2025 | Phase 4.1: 10-theme system, v1.4.2 for all tools |
| v1.4.0 | Nov 2025 | Phase 3.4: Standardized dropdown patterns |
| v1.3.0 | Oct 2025 | Color Matcher clipboard paste support |
| v1.2.3 | Oct 2025 | Color Explorer & Comparison stable |
| v1.0.1 | Oct 2025 | Initial Accessibility Checker beta |

### Version Bumping

When bumping version from `v1.4.2` to `v1.5.0`:
1. Update version in all 4 `*_stable.html` files (search for "1.4.2")
2. Update version in `index.html` (4 tool cards)
3. Update `CHANGELOG.md` with release notes
4. Create commit: "Release: v1.5.0 - [description]"

**Note**: All 4 tools must stay synchronized on major.minor versions since they're released together.

## External APIs & Data Sources

### Universalis API

**Endpoint**: `https://universalis.app/api/v2/aggregated/{dataCenter}/{itemID}/{worldID}`

**Used by**: Color Harmony, Color Matcher, Dye Comparison (optional)

**Implementation Pattern**:
```javascript
function safeFetchJSON(url, fallbackData = []) {
  return fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) throw new Error('Invalid content type');
      return response.json();
    })
    .catch(error => {
      console.error(`Failed to load ${url}:`, error);
      return fallbackData;
    });
}
```

**Key Points**:
- Optional feature (show prices toggle)
- Session-level caching to minimize API calls
- Debounce repeated requests
- Toast notifications for errors
- Graceful fallback if API unavailable

## Error Handling Standards (Phase 11)

All fetch() calls must follow standardized error handling patterns to ensure robust, user-friendly behavior.

### Pattern 1: JSON API Calls (Universalis API, Market Data)

**Standard Pattern** (use `safeFetchJSON()` from shared-components.js):
```javascript
const prices = await safeFetchJSON(
    'https://universalis.app/api/v2/aggregated/Crystal/1/primary',
    []  // fallback data
);
```

**Manual Pattern** (if `safeFetchJSON()` unavailable):
```javascript
try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data;
} catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    showToast('Error loading data. Using cached values.', 'error');
    return fallbackData;
}
```

### Pattern 2: HTML Component Loading (nav, footer, mobile nav)

**Correct Pattern** (with error handling):
```javascript
fetch('components/nav.html')
    .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
    })
    .then(html => {
        document.getElementById('nav-container').innerHTML = html;
    })
    .catch(error => {
        console.error('Failed to load nav component:', error);
        // Component is optional - app still works without it
        // No showToast needed - navigation available through other means
    });
```

**❌ AVOID** (no error handling):
```javascript
// BAD - no catch block, silent failures
fetch('components/nav.html')
    .then(r => r.text())
    .then(html => { document.getElementById('nav-container').innerHTML = html; });
```

### Pattern 3: Async/Await with Try-Catch (Server Data)

**Standard Pattern** (Data Centers, Worlds):
```javascript
async function loadServerData() {
    try {
        const [dcResponse, worldsResponse] = await Promise.all([
            fetch('/assets/json/data-centers.json'),
            fetch('/assets/json/worlds.json')
        ]);

        if (!dcResponse.ok || !worldsResponse.ok) {
            throw new Error('Failed to load server data');
        }

        const dataCenters = await dcResponse.json();
        const worlds = await worldsResponse.json();

        // Process data...
        updateUI(dataCenters, worlds);
    } catch (error) {
        console.error('Error loading server data:', error);
        showToast('Error loading server list. Please refresh.', 'error');
        // Fallback to empty state or previous values
    }
}
```

### Error Handling Checklist

When adding fetch() calls:
- [ ] Has `.catch()` or `try-catch` block
- [ ] Error logged to console with descriptive message
- [ ] User shown toast notification if data loading is critical
- [ ] Fallback data provided if endpoint fails
- [ ] HTTP status checked (`!response.ok`)
- [ ] Content-Type validated if applicable
- [ ] No silent failures (every error path is handled)

### FFXIV Data Sources

- **Dye Database**: Manual curation from FFXIV Gamerescape + in-game testing
- **Data Centers & Worlds**: From Universalis API documentation
- **Color Values**: RGB/HSV calculated from hex, HSV verified against in-game appearance

## Known Limitations & Optimization Opportunities

### Code Duplication (High Priority)

**Problem**: Same utility functions repeated in all 4 tools
- `hexToRgb()`, `rgbToHex()`, `getColorDistance()` in each file
- ~200 duplicate lines per tool × 4 = ~800 lines of redundant code

**Solution Path** (Future Phase):
1. Move all utilities to `shared-components.js` completely
2. Remove local copies from tool files
3. Ensure all tools import from single source

### Monolithic File Sizes (Medium Priority)

**Problem**: 1,400-1,900 lines per tool file
- Hard to review in PRs
- Difficult for new contributors to understand
- Makes debugging harder

**Solution Path** (Future Phase):
1. Extract UI components (dropdowns, toggles, modals) to separate library
2. Organize tool files with clear section markers
3. Consider simple concatenation build step

### Performance Optimizations (Low Priority)

- **Canvas rendering** (Dye Comparison): Already optimized with resolution reduction
- **Image processing** (Color Matcher): Could batch ImageData operations
- **Color calculations**: Already using efficient RGB space, not perceptual color spaces

## Browser Compatibility

Works in all modern browsers supporting ES6+:
- Chrome/Chromium (Recommended)
- Firefox
- Safari (iOS 12+, macOS 10.12+)
- Edge

**Requires**: ES6 (arrow functions, template literals, const/let, fetch API, Canvas 2D)

## Important Files Reference

| File | Purpose | Maintainability |
|------|---------|-----------------|
| `shared-styles.css` | Theme definitions | Update when adding themes |
| `shared-components.js` | Shared utilities | Update for cross-tool utilities |
| `components/nav.html` | Theme switcher | Update theme options here |
| `colors_xiv.json` | Dye database | Update when FFXIV adds dyes |
| `CHANGELOG.md` | Version history | Update with each release |
| `README.md` | User documentation | Update for user-facing changes |

## Troubleshooting

### localStorage Not Persisting

**Problem**: Theme selection doesn't persist after page refresh
**Solution**:
1. Check if cookies/storage are enabled in browser
2. Check browser console for `QuotaExceededError`
3. Verify `safeSetStorage()` is being called
4. Clear browser cache and try again

### Theme Not Applying

**Problem**: Selected theme doesn't appear
**Solution**:
1. Check `body` element has correct class (inspect element)
2. Verify CSS variables defined in `shared-styles.css`
3. Check browser console for CSS errors
4. Reload `shared-components.js` (clear cache)

### API Integration Not Working

**Problem**: Market prices not showing
**Solution**:
1. This is optional - not a critical failure
2. Check browser console for CORS/fetch errors
3. Verify Universalis API is accessible
4. Check network tab in DevTools for response
5. Feature works without API (graceful fallback)

### Canvas Charts Not Rendering

**Problem**: Dye Comparison charts appear blank
**Solution**:
1. Check browser supports Canvas 2D API
2. Verify chart data has valid dye colors
3. Check browser console for canvas errors
4. Ensure zoom controls are working
5. Try different browsers to isolate issue

## External Resources

- [FFXIV Dye Database](https://ffxiv.gamerescape.com/) - Dye data source
- [Universalis API](https://universalis.app/) - Real-time market board data
- [Brettel 1997](https://vision.psyche.mit.edu/color_blindness.html) - Colorblindness simulation research
- [MDN Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Color Theory Primer](https://en.wikipedia.org/wiki/Color_theory) - Harmony types explained
