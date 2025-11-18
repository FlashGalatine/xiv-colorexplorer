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

### Responsive Design & Mobile Navigation (v2.0.0)

**Navigation Strategy**:
- **Mobile Devices (≤768px)**: Bottom navigation bar visible, Tools dropdown hidden
- **Tablet/Desktop (>768px)**: Tools dropdown visible in header, bottom nav hidden
- **Breakpoint**: 768px synchronized across all components

**Key Implementation Details**:

1. **Component-Based Navigation**
   - `<mobile-bottom-nav>` - Mobile navigation component (Lit)
   - `<tools-dropdown>` - Desktop navigation component (Lit)
   - `<theme-switcher>` - Theme selection UI (Lit)
   - All use CSS custom properties for theme-aware styling

2. **Responsive Breakpoint Management**
   - Tailwind breakpoints: `sm:`, `md:`, `lg:` classes control visibility
   - Components render conditionally based on viewport width
   - No duplicate navigation controls at any screen size

3. **Theme Integration**
   - All navigation components respect `var(--theme-*)` variables
   - Theme changes apply immediately without page refresh
   - ThemeService manages theme state across all components

**Testing Checklist for Responsive Design**:
- [ ] Mobile portrait (375px): Bottom nav visible, tools dropdown hidden
- [ ] Mobile landscape (812px): Tools dropdown visible, bottom nav hidden
- [ ] Tablet (768px edge case): Navigation switches appropriately
- [ ] Desktop (1024px+): Full navigation header visible
- [ ] Theme switcher accessible at all breakpoints
- [ ] No layout shift when resizing viewport

**When Modifying Navigation Components**:
1. Changes to navigation components in `src/components/` affect all tools
2. Test at multiple breakpoints: 375px, 640px, 768px, 820px, 1024px
3. Verify theme variable usage (no hardcoded colors)
4. Run `npm run build` to ensure TypeScript compiles
5. Test in `npm run preview` before committing

### Git Development Workflow (v2.0.0)

**Current Branch Strategy**:
- `main` branch = v2.0.0 production (TypeScript/Vite architecture)
- Feature branches off `main` for new features and bug fixes
- Pull requests merge back to `main` after review

**Creating a Feature Branch**:

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch (use descriptive name)
git checkout -b feature/add-new-harmony-type
# or
git checkout -b fix/market-board-caching

# Work on changes...
# Commit regularly with clear messages
git commit -m "Add monochromatic harmony type to color wheel"

# Push to remote
git push -u origin feature/add-new-harmony-type

# When ready, create PR: feature/add-new-harmony-type → main
```

**Commit Message Pattern**:
```
Brief description (50 chars or less)

- Detailed change 1
- Detailed change 2
- Detailed change 3

Fixes #123 (if applicable)
```

**Testing Before Committing**:
```bash
npm run lint      # Check code style
npm run test      # Run unit tests (140 tests)
npm run build     # Verify production build succeeds
npm run preview   # Test production build locally
```

### Searching the Codebase

**Find all uses of a utility function**:
```bash
# Search for "getColorDistance" in TypeScript files
grep -r "getColorDistance" src/

# Count occurrences in specific service
grep -c "getColorDistance" src/services/color-service.ts
```

**Find hardcoded color references**:
```bash
# Search for hex color patterns in TypeScript
grep -E "#[0-9A-Fa-f]{6}" src/components/*.ts | head -20

# Find theme variable usage
grep -r "var(--theme-" src/
```

**Find localStorage key usage**:
```bash
# See all localStorage interactions
grep -rn "localStorage\|appStorage\|getItem\|setItem" src/services/
```

**Find component usage**:
```bash
# Find all uses of a specific component
grep -r "MarketBoard" src/components/

# Find event listeners
grep -r "addEventListener" src/components/
```

## Common Gotchas & Warnings

### 1. Service Layer Dependencies

**⚠️ Important**:
- v2.0.0 uses a service layer pattern
- Services are singletons shared across all components
- Changing a service affects all tools that use it

**How to Handle**:
- Test changes in ALL tools that use the service
- Check `src/services/__tests__/` for existing tests
- Add tests when modifying service behavior
- Services to watch: `DyeService`, `ColorService`, `APIService`, `ThemeService`, `StorageService`

**Example - Modifying ColorService**:
```typescript
// If you modify getColorDistance() in ColorService...
// Test these tools: Color Matcher, Dye Comparison, Color Harmony Explorer
```

### 2. Theme System CSS Variables

**⚠️ Important**:
- All colors use CSS custom properties: `var(--theme-primary)`, `var(--theme-text)`, etc.
- **Never use hardcoded colors** (e.g., `#3B82F6`, `blue-600`)
- Theme changes apply globally across all components

**Available Theme Variables**:
- `--theme-primary` - Primary accent color
- `--theme-background` - Main background
- `--theme-text` - Primary text color
- `--theme-border` - Border colors
- `--theme-background-secondary` - Secondary background
- `--theme-card-background` - Card background
- `--theme-text-muted` - Muted/secondary text

**How to Use**:
```typescript
// ✅ CORRECT - Use CSS variable
style: 'color: var(--theme-primary);'

// ❌ WRONG - Hardcoded color
className: 'text-blue-600'
```

### 3. Version Number Synchronization

**⚠️ Important**:
- Version appears in multiple files: `package.json`, `README.md`, `CHANGELOG.md`, `FAQ.md`, `CLAUDE.md`
- Use consistent versioning (v2.0.0, v2.1.0, etc.)

**When Bumping Version** (e.g., v2.0.0 → v2.1.0):

1. **Update package.json**:
   ```bash
   npm version minor  # Or: npm version patch, npm version major
   ```

2. **Update documentation files**:
   ```bash
   grep -rn "v2\.0\.0" README.md CHANGELOG.md FAQ.md CLAUDE.md
   # Replace all occurrences with v2.1.0
   ```

3. **Update CHANGELOG.md**:
   ```markdown
   ## v2.1.0 - Date
   - New features
   - Bug fixes
   - Improvements
   ```

4. **Commit with version message**:
   ```bash
   git add .
   git commit -m "Release: v2.1.0 - [description]"
   git tag v2.1.0
   ```

### 4. Development Server Required

**⚠️ Important**:
- Vite dev server required for development
- Opening `dist/index.html` directly won't work properly
- Module imports require HTTP server

**Solution**:
- Always use `npm run dev` for development
- Use `npm run preview` to test production build
- Never use `file:///` protocol

**Error Message You'll See**:
```
Access to script at 'file:///.../main.ts' has been blocked by CORS policy
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

## Theme System (v2.0.0)

### Overview

XIV Dye Tools includes a unified 10-theme system providing visual customization across all tools.

**10 Theme Variants**:
- Standard (Light / Dark) - Default gray/indigo
- Hydaelyn (Light / Dark) - Sky blue theme
- Classic FF (Light / Dark) - Deep blue (retro FF)
- Parchment (Light / Dark) - Warm beige/brown
- Sugar Riot (Light / Dark) - Vibrant pink

### How The Theme System Works

**CSS Custom Properties** (`src/styles/themes.css`):
- 10 complete color sets defined with CSS variables
- Applied via `body` class: `standard-light`, `standard-dark`, etc.
- Core variables:
  - `--theme-primary` - Primary accent color
  - `--theme-background` - Main background
  - `--theme-text` - Primary text color
  - `--theme-border` - Border colors
  - `--theme-background-secondary` - Secondary background
  - `--theme-card-background` - Card background
  - `--theme-text-muted` - Muted/secondary text

**TypeScript Theme Management** (`src/services/theme-service.ts`):
```typescript
import { ThemeService } from './services/theme-service';

// ThemeService is a singleton - automatically initialized
// Get current theme
const currentTheme = ThemeService.getCurrentTheme();

// Set theme (saves to localStorage automatically)
ThemeService.setTheme('hydaelyn-dark');

// Listen for theme changes
ThemeService.onThemeChange((themeName) => {
  console.log(`Theme changed to: ${themeName}`);
});
```

**localStorage Key**: `xivdyetools_theme` (stores theme name, persists across sessions)

**UI Component** (`src/components/theme-switcher.ts`):
- Lit web component: `<theme-switcher>`
- 10 theme options with visual swatches
- Dropdown menu in app header
- Used across all tools via `<app-layout>`

### Adding a New Theme

1. **Add CSS variables to `src/styles/themes.css`**:
   ```css
   body.myname-light {
       --theme-primary: #3b82f6;
       --theme-background: #ffffff;
       --theme-text: #000000;
       --theme-border: #e5e7eb;
       --theme-background-secondary: #f9fafb;
       --theme-card-background: #ffffff;
       --theme-text-muted: #6b7280;
   }
   ```

2. **Update ThemeService** (`src/services/theme-service.ts`):
   - Add theme name to `AVAILABLE_THEMES` array

3. **Update ThemeSwitcher component** (`src/components/theme-switcher.ts`):
   - Add theme option to dropdown menu

4. **Test** in all tools:
   ```bash
   npm run dev
   # Test theme selection in browser
   # Verify persistence after refresh
   ```

## The Five Tools: Architecture & Features

### 1. Color Accessibility Checker

**Component**: `src/components/accessibility-checker-tool.ts`

**Algorithm**: Brettel 1997 colorblindness transformation matrices
- Simulates: Deuteranopia, Protanopia, Tritanopia, Achromatopsia
- Supports: 6 outfit slots (Head, Body, Hands, Legs, Feet, Weapon) with optional dual dyes
- Output: Accessibility score (0-100), distinguishability warnings, dye suggestions
- Uses: `ColorService` for transformations, `DyeService` for dye database

**Test Scenarios**:
- Verify each vision type produces different color outputs
- Check accessibility score accuracy with multiple dye combinations
- Confirm dual dye feature persists in localStorage
- Test contrast ratio calculations

### 2. Color Harmony Explorer

**Component**: `src/components/harmony-explorer-tool.ts`

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
- Uses: `ColorService` for harmony calculations, `APIService` for market prices

**Optional Integration**: Universalis API for real-time market prices (session-level cached)

**Test Scenarios**:
- Verify each harmony type produces correct angle spacing
- Check deviance calculations are in 0-10 range
- Confirm API integration optional (works without network)
- Test export functionality

### 3. Color Matcher

**Component**: `src/components/color-matcher-tool.ts`

**Input Methods**:
- Drag & drop image files (up to 20MB)
- Clipboard paste (Ctrl+V / Cmd+V)
- Direct color picker hex input
- Eyedropper tool (click image to sample color)

**Algorithm**: Euclidean distance in RGB color space
- Sample size: 1×1 to 64×64 pixels (configurable averaging)
- Auto zoom: Portrait images zoom to width, landscape zoom to fit
- Returns closest matching dye using RGB distance
- Uses: `ColorService` for distance calculations, `DyeService` for matching

**Test Scenarios**:
- Test all input methods (drag-drop, paste, picker, eyedropper)
- Verify sample size averaging (larger sizes produce more accurate results)
- Check zoom controls (Fit, Width, ±, Reset)
- Confirm error handling for missing/invalid images

### 4. Dye Comparison

**Component**: `src/components/dye-comparison-tool.ts`

**Visualizations**:
- Color distance matrix (table with green/yellow/red indicators)
- Hue-Saturation 2D chart (canvas-based)
- Brightness 1D chart (canvas-based)

**Features**: Compare up to 4 dyes, export as JSON/CSS, copy hex codes, market prices

**Canvas Rendering**: Optimized for performance with efficient pixel iteration
- Uses: `ColorService` for distance calculations, `APIService` for prices

**Test Scenarios**:
- Verify all three chart types render correctly
- Test color distance calculations
- Check export formats (JSON, CSS) are valid
- Confirm Universalis API integration

### 5. Dye Mixer

**Component**: `src/components/dye-mixer-tool.ts`

**Features**: Find intermediate dyes for smooth color transitions
- Input: Two dye colors (start and end)
- Output: Ranked list of dyes by proximity to midpoint
- Algorithm: RGB space interpolation with distance scoring
- Uses: `ColorService` for color interpolation, `DyeService` for matching

**Test Scenarios**:
- Verify midpoint calculation accuracy
- Check ranking algorithm (closest dyes first)
- Confirm smooth visual transitions
- Test edge cases (same start/end dye, extreme colors)

## Service Layer Architecture

### Overview

v2.0.0 uses a service-oriented architecture with TypeScript singletons for shared functionality.

**Core Services**:
- `DyeService` - Dye database management and filtering
- `ColorService` - Color algorithms (conversion, distance, harmony, accessibility)
- `APIService` - Universalis API integration with caching
- `ThemeService` - Theme management and persistence
- `StorageService` - localStorage wrapper with error handling

**Benefits**:
- Single source of truth for each domain
- Type-safe interfaces
- Centralized error handling
- Easy testing with unit tests
- No code duplication across tools

### DyeService (`src/services/dye-service.ts`)

**Purpose**: Manage FFXIV dye database

```typescript
import { DyeService } from './services/dye-service';

// Get all dyes
const allDyes = DyeService.getAllDyes();

// Filter by category
const redDyes = DyeService.getDyesByCategory('Red');

// Find specific dye
const jetBlack = DyeService.getDyeById(1);

// Search by name
const searchResults = DyeService.searchDyes('metallic');
```

### ColorService (`src/services/color-service.ts`)

**Purpose**: Color calculations and transformations

```typescript
import { ColorService } from './services/color-service';

// Color conversion
const rgb = ColorService.hexToRgb('#FF0000');
const hex = ColorService.rgbToHex(255, 0, 0);
const hsv = ColorService.rgbToHsv(255, 0, 0);

// Color distance (0-441 range)
const distance = ColorService.getColorDistance('#FF0000', '#00FF00');

// Colorblind simulation (Brettel 1997)
const simulated = ColorService.simulateColorblindness('#FF0000', 'deuteranopia');

// Color harmony
const harmony = ColorService.calculateHarmony('#FF0000', 'complementary');
```

### APIService (`src/services/api-service.ts`)

**Purpose**: Universalis API integration

```typescript
import { APIService } from './services/api-service';

// Fetch market price (with caching)
const price = await APIService.fetchPrice('Crystal', 1, 'primary');

// Format price for display
const formatted = APIService.formatPrice(69420); // "69,420<small>G</small>"

// Clear cache
APIService.clearCache();
```

### ThemeService (`src/services/theme-service.ts`)

**Purpose**: Theme management

```typescript
import { ThemeService } from './services/theme-service';

// Get current theme
const theme = ThemeService.getCurrentTheme(); // "standard-light"

// Set theme (saves to localStorage)
ThemeService.setTheme('hydaelyn-dark');

// Listen for changes
ThemeService.onThemeChange((themeName) => {
  console.log(`Theme changed to: ${themeName}`);
});
```

### StorageService (`src/services/storage-service.ts`)

**Purpose**: Safe localStorage access

```typescript
import { StorageService } from './services/storage-service';

// Read with default fallback
const value = StorageService.getItem('myKey', 'defaultValue');

// Write (with error handling)
StorageService.setItem('myKey', 'myValue');

// Remove item
StorageService.removeItem('myKey');

// Clear all
StorageService.clear();
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

### Common Tasks (v2.0.0)

**Adding a new feature to a tool**:
1. Identify the relevant component file (e.g., `src/components/color-matcher-tool.ts`)
2. Add feature implementation using TypeScript
3. If needed, update service layer (e.g., `src/services/color-service.ts`)
4. Run tests: `npm run test`
5. Test in dev server: `npm run dev`
6. Commit with: "Feature: Description (ComponentName)"

**Updating a shared service**:
1. Edit service file (e.g., `src/services/color-service.ts`)
2. Update or add unit tests in `src/services/__tests__/`
3. Run tests: `npm run test`
4. Identify which tools use the service (grep or TypeScript imports)
5. Test all affected tools in dev server
6. Run full build: `npm run build && npm run preview`
7. Commit with: "Service: Description (ServiceName)"

**Adding a new component**:
1. Create component file in `src/components/` (e.g., `my-component.ts`)
2. Extend `BaseComponent` or use Lit decorators
3. Add component to `src/components/index.ts` exports
4. Import and use in tool or app-layout
5. Add styles to `src/styles/components.css` if needed
6. Test responsiveness at 375px, 768px, 1024px
7. Commit with: "Component: Description (ComponentName)"

**Adding localStorage support for a new feature**:
```typescript
import { StorageService } from './services/storage-service';

// Reading (with default fallback)
const value = StorageService.getItem('xivdyetools_myfeature', 'default');

// Writing (in event handler)
StorageService.setItem('xivdyetools_myfeature', newValue);

// During component initialization
connectedCallback() {
  super.connectedCallback();
  const saved = StorageService.getItem('xivdyetools_myfeature', 'default');
  this.restoreState(saved);
}
```

**Adding a new theme**:
1. Add CSS variables to `src/styles/themes.css`
2. Update `AVAILABLE_THEMES` in `src/services/theme-service.ts`
3. Add theme option to `src/components/theme-switcher.ts`
4. Test theme in all tools
5. Verify persistence after page refresh
6. Commit with: "Theme: Add [ThemeName] theme"

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

**Current Version**: v2.0.0
**Released**: November 17, 2025
**Status**: Production (TypeScript/Vite architecture)

### Version History

| Version | Release Date | Changes |
|---------|--------------|---------|
| v2.0.0 | Nov 17, 2025 | Complete TypeScript/Vite refactor, service layer, Lit components |
| v1.4.2 | Nov 13, 2025 | (v1.6.x) 10-theme system, legacy HTML architecture |
| v1.4.0 | Nov 2025 | (v1.6.x) Standardized dropdown patterns |
| v1.3.0 | Oct 2025 | (v1.6.x) Color Matcher clipboard paste support |
| v1.2.3 | Oct 2025 | (v1.6.x) Color Explorer & Comparison stable |
| v1.0.1 | Oct 2025 | (v1.6.x) Initial Accessibility Checker beta |

### Version Bumping (v2.0.0)

When bumping version from `v2.0.0` to `v2.1.0`:

1. **Update package.json**:
   ```bash
   npm version minor  # Or: npm version patch, npm version major
   # This automatically updates package.json and creates a git tag
   ```

2. **Update documentation files**:
   ```bash
   # Search for version references
   grep -rn "v2\.0\.0" README.md CHANGELOG.md FAQ.md CLAUDE.md

   # Replace with v2.1.0
   # Can use find-and-replace in editor
   ```

3. **Update CHANGELOG.md**:
   ```markdown
   ## v2.1.0 - November XX, 2025

   ### Added
   - New feature descriptions

   ### Changed
   - Improvements and updates

   ### Fixed
   - Bug fixes
   ```

4. **Commit and tag**:
   ```bash
   git add .
   git commit -m "Release: v2.1.0 - [description]"
   git tag v2.1.0
   git push origin main --tags
   ```

**Note**: v2.0.0 uses single-codebase architecture. All tools share the same version number.

## External APIs & Data Sources

### Universalis API

**Endpoint**: `https://universalis.app/api/v2/aggregated/{dataCenter}/{itemID}/{scope}`

**Used by**: Color Harmony Explorer, Color Matcher, Dye Comparison (optional)

**Implementation** (`src/services/api-service.ts`):
```typescript
import { APIService } from './services/api-service';

// Fetch price for a dye (with automatic caching)
const priceData = await APIService.fetchPrice('Crystal', 1, 'primary');

// Response structure
interface PriceData {
  itemID: number;
  currentAverage: number;  // Rounded price
  currentMinPrice: number;
  currentMaxPrice: number;
  lastUpdate: number;      // Timestamp
}

// Format price for display
const formatted = APIService.formatPrice(priceData.currentAverage);
// Returns: "69,420<small>G</small>"
```

**Key Features**:
- Session-level caching to minimize API calls
- Automatic cache invalidation (stale data detection)
- Error handling with graceful fallback
- Toast notifications for user feedback
- Optional feature (works without API)
- Uses aggregated endpoint for Data Center-wide pricing

## Error Handling Standards (v2.0.0)

All network calls and data operations follow standardized error handling patterns for robust, user-friendly behavior.

### Pattern 1: API Service Calls (Universalis API)

**Standard Pattern** (use `APIService`):
```typescript
import { APIService } from './services/api-service';

try {
  const priceData = await APIService.fetchPrice('Crystal', 1, 'primary');
  // Use priceData...
} catch (error) {
  console.error('Failed to fetch price:', error);
  // APIService handles toast notifications automatically
  // Proceed without price data
}
```

**Internal Implementation** (within services):
```typescript
async fetchData<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);
    this.emit('error', { message: 'Error loading data' });
    return null;
  }
}
```

### Pattern 2: Static Asset Loading (JSON Data)

**Standard Pattern** (Data Centers, Worlds, Dyes):
```typescript
async loadStaticData() {
  try {
    const [dcResponse, worldsResponse] = await Promise.all([
      fetch('/json/data-centers.json'),
      fetch('/json/worlds.json')
    ]);

    if (!dcResponse.ok || !worldsResponse.ok) {
      throw new Error('Failed to load static data');
    }

    const dataCenters = await dcResponse.json();
    const worlds = await worldsResponse.json();

    return { dataCenters, worlds };
  } catch (error) {
    console.error('Error loading static data:', error);
    this.emit('error', { message: 'Error loading data. Please refresh.' });
    return null;
  }
}
```

### Pattern 3: localStorage Operations

**Standard Pattern** (use `StorageService`):
```typescript
import { StorageService } from './services/storage-service';

// No try-catch needed - StorageService handles errors internally
const value = StorageService.getItem('myKey', 'defaultValue');
StorageService.setItem('myKey', newValue);
```

**Internal Implementation** (within StorageService):
```typescript
static getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
}
```

### Error Handling Checklist

When adding data operations:
- [ ] Uses service layer (APIService, StorageService, etc.)
- [ ] Has `try-catch` block if not using service
- [ ] Error logged to console with descriptive message
- [ ] User shown feedback via toast/error state if critical
- [ ] Fallback data or graceful degradation provided
- [ ] HTTP status checked (`!response.ok`)
- [ ] No silent failures (every error path is handled)
- [ ] TypeScript types defined for data structures

### FFXIV Data Sources

- **Dye Database**: Manual curation from FFXIV Gamerescape + in-game testing
- **Data Centers & Worlds**: From Universalis API documentation
- **Color Values**: RGB/HSV calculated from hex, HSV verified against in-game appearance

## Optimization Opportunities (v2.0.0)

v2.0.0 solved previous architectural limitations (code duplication, monolithic files). Current optimization opportunities:

### Code Splitting & Lazy Loading (Medium Priority)

**Opportunity**: Reduce initial bundle size by lazy-loading tool components

**Current State**:
- All tool components loaded upfront (~200KB total bundle)
- Single main.ts entry point imports all components

**Solution Path**:
1. Implement dynamic imports for tool components
2. Load tool component only when route changes
3. Show loading spinner during component fetch
4. Expected bundle reduction: ~150KB initial load

**Implementation**:
```typescript
// Instead of: import { ColorMatcherTool } from './components/color-matcher-tool';
// Use: const { ColorMatcherTool } = await import('./components/color-matcher-tool');
```

### Color Wheel Visualization (Medium Priority)

**Opportunity**: Improve Harmony Explorer color wheel design

**Current State**:
- Basic SVG-based color wheel
- Limited interactivity
- Fixed size, no zoom

**Solution Path**:
1. Redesign with canvas-based rendering
2. Add interactive hue selection (click to select base color)
3. Implement zoom/pan functionality
4. Improve visual hierarchy (harmony colors more prominent)

### Test Coverage Expansion (High Priority)

**Opportunity**: Add component-level tests

**Current State**:
- Service layer: 140 tests, 100% pass rate ✅
- Components: No automated tests ❌

**Solution Path**:
1. Add Lit component testing framework (Web Test Runner)
2. Test component rendering and interactions
3. Test localStorage persistence
4. Test responsive behavior
5. Target: 80%+ component coverage

### Performance Optimizations (Low Priority)

- **Canvas rendering** (Dye Comparison): Already optimized
- **Image processing** (Color Matcher): Could use Web Workers for large images (>5MB)
- **Color calculations**: Already using efficient RGB space
- **API caching**: Already implemented with session-level cache

## Browser Compatibility

Works in all modern browsers supporting ES6+:
- Chrome/Chromium (Recommended)
- Firefox
- Safari (iOS 12+, macOS 10.12+)
- Edge

**Requires**: ES6 (arrow functions, template literals, const/let, fetch API, Canvas 2D)

## Important Files Reference (v2.0.0)

| File | Purpose | Maintainability |
|------|---------|-----------------|
| `src/services/theme-service.ts` | Theme management | Update when adding themes |
| `src/styles/themes.css` | Theme CSS variables | Define new theme colors here |
| `src/components/theme-switcher.ts` | Theme UI component | Add theme options to dropdown |
| `src/services/dye-service.ts` | Dye database service | Update when FFXIV adds dyes |
| `public/json/colors_xiv.json` | FFXIV dyes data | Raw dye database (JSON) |
| `src/services/color-service.ts` | Color algorithms | Core color calculations |
| `src/services/api-service.ts` | Universalis integration | Market Board API calls |
| `src/components/app-layout.ts` | Main app shell | Overall app structure |
| `package.json` | Dependencies & scripts | npm configuration |
| `vite.config.ts` | Build configuration | Vite settings |
| `tailwind.config.js` | Tailwind CSS config | Styling framework |
| `CHANGELOG.md` | Version history | Update with each release |
| `README.md` | User documentation | Update for user-facing changes |
| `CLAUDE.md` | Development guide | This file - update for architecture changes |

## Troubleshooting

### localStorage Not Persisting

**Problem**: Theme selection doesn't persist after page refresh
**Solution**:
1. Check if cookies/storage are enabled in browser
2. Check browser console for `QuotaExceededError`
3. Verify `StorageService.setItem()` is being called
4. Clear browser cache and try again
5. Check DevTools → Application → localStorage for `xivdyetools_theme` key

### Theme Not Applying

**Problem**: Selected theme doesn't appear
**Solution**:
1. Check `body` element has correct class (inspect element: should be `standard-light`, etc.)
2. Verify CSS variables defined in `src/styles/themes.css`
3. Check browser console for CSS errors
4. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to clear cache
5. Verify `ThemeService.setTheme()` was called successfully

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
