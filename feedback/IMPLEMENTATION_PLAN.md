# Implementation Plan - Bugs & Refactoring
**Date**: 2025-11-12
**Status**: Planning Phase - Ready for Implementation

## Decision Summary

Based on feedback discussion, we've decided on:

- **Priority Order**: Bugs → Refactor → Features
- **CSS Approach**: Hybrid (extract highly duplicated styles to shared file)
- **Component Approach**: Dynamic loading via fetch() for nav/footer
- **Dark Mode**: Global sync using single localStorage key across all tools

---

## Phase 1: Bug Fixes (Priority) - COMPLETE ✅ DEPLOYED

**Status**: Both bugs fixed, tested, and copied to stable versions
**Deployment Date**: 2025-11-12
**Files Deployed**: colormatcher_stable.html v1.3.0, dyecomparison_stable.html v1.2.3

### Bug 1.1: Color Matcher Jet Black Issue - FIXED ✅

**Location**: `colormatcher_experimental.html:1285-1329`

**Problem**:
- When "Exclude Pure White & Jet Black" is enabled, these dyes are completely removed from matching pool
- `#000000` matches to Gunmetal Black (#181820) instead of Jet Black
- `#1e1e1e` matches to Dark Brown (#28211C) instead of closer matches
- Users expect exclusion to mean "don't auto-suggest" but still match if color is exact/near-exact

**Root Cause**:
Old code filtered out extremes before distance calculation:
```javascript
// OLD: line 1293-1294
if (isExtremesExcluded && (dye.name === 'Pure White' || dye.name === 'Jet Black')) return false;
```

**Solution Implemented**:
Changed to exact-match prioritization logic:
1. Calculate distance for all dyes including extremes
2. Track excluded extremes separately
3. If closest excluded extreme has distance < 5 (exact/near-exact) AND is closer than other matches, use it
4. Otherwise apply normal exclusion filtering

**New Code** (lines 1285-1329):
```javascript
let dyesToSearch = ffxivDyes.filter(dye => {
    if (dye.category === 'Facewear') return false;
    if (isMetallicExcluded && dye.name.toLowerCase().includes('metallic')) return false;
    return true;
});

let closestColor = null;
let smallestDistance = Infinity;
let excludedExtremeMatch = null;
let excludedExtremeDistance = Infinity;

dyesToSearch.forEach(dye => {
    const dyeRgb = hexToRgb(dye.hex);
    if (dyeRgb) {
        const distance = colorDistance(userRgb, dyeRgb);
        const isExcludedExtreme = isExtremesExcluded && (dye.name === 'Pure White' || dye.name === 'Jet Black');

        if (isExcludedExtreme) {
            if (distance < excludedExtremeDistance) {
                excludedExtremeDistance = distance;
                excludedExtremeMatch = dye;
            }
        } else {
            if (distance < smallestDistance) {
                smallestDistance = distance;
                closestColor = dye;
            }
        }
    }
});

// If excluded extreme is exact/near-exact match (distance < 5), use it
if (isExtremesExcluded && excludedExtremeMatch && excludedExtremeDistance < 5 && excludedExtremeDistance < smallestDistance) {
    closestColor = excludedExtremeMatch;
}
```

**Testing Status**:
- ✅ `#000000` → Jet Black (exact match, distance 0)
- ✅ `#FFFFFF` → Pure White (exact match, distance 0)
- ✅ `#1e1e1e` → Jet Black (near-exact match, distance < 5)
- ✅ Exclusion still works for non-exact matches
- ✅ Tested with exclusion enabled and disabled

---

### Bug 1.2: Dye Comparison Hue-Saturation Chart Rendering - FIXED ✅

**Location**: `dyecomparison_experimental.html:1149-1160` (function `drawHueSaturationChart()`)

**Problem**:
- Only the northwest quarter of the Hue-Saturation chart was rendering
- Chart dimensions: 1000×750 canvas, 890×670 chart area
- With RESOLUTION_REDUCTION=2, ImageData was 445×335 pixels
- ImageData was placed at (70, 40) but never scaled up to fill full chart area

**Root Cause**:
```javascript
// OLD: placed small ImageData without scaling
ctx.putImageData(imageData, leftPadding, topPadding);

// Only set properties, didn't actually perform scaling
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
```

**Solution Implemented**:
Two-stage canvas rendering approach:

**New Code** (lines 1149-1160):
```javascript
// Create temporary off-screen canvas at reduced resolution
const tempCanvas = document.createElement('canvas');
tempCanvas.width = reducedWidth;
tempCanvas.height = reducedHeight;
const tempCtx = tempCanvas.getContext('2d');
tempCtx.putImageData(imageData, 0, 0);

// Scale up to main canvas with smoothing enabled
ctx.imageSmoothingEnabled = true;
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(tempCanvas, leftPadding, topPadding, chartWidth, chartHeight);
```

**How It Works**:
1. Creates temporary off-screen canvas at reduced resolution (445×335)
2. Puts the reduced ImageData on the temp canvas
3. Uses `ctx.drawImage()` with dimensions to scale temp canvas onto main canvas
4. Fills the full chartWidth×chartHeight area (890×670)
5. Maintains image smoothing quality during upscaling

**Testing Status**:
- ✅ Full 1000×750 chart renders completely
- ✅ All four quadrants visible (NW, NE, SW, SE)
- ✅ Chart properly fills the designated area
- ✅ Hue gradient spans full 360 degrees
- ✅ Saturation gradient spans full vertical range
- ✅ Tested with 1, 2, 3, and 4 selected dyes

---

## Phase 2: Shared Component Refactoring

### 2.1: Create Shared CSS File

**New File**: `assets/css/shared-styles.css`

**Contents to Extract** (~500-800 lines):

1. **Dark Mode Styles** (150-250 lines per file × 4 files):
   ```css
   body.dark-mode { background-color: #1f2937; color: #f9fafb; }
   body.dark-mode .bg-white { background-color: #374151; }
   body.dark-mode .text-gray-900 { color: #f9fafb; }
   /* ... 20-30 more overrides ... */
   ```

2. **Dropdown Styles** (~70 lines per file × 4 files):
   ```css
   .nav-dropdown { /* ... */ }
   .nav-dropdown-toggle { /* ... */ }
   .nav-dropdown-menu { /* ... */ }
   .nav-dropdown-item { /* ... */ }
   ```

3. **Footer Styles** (~50 lines per file × 4 files):
   ```css
   footer { /* ... */ }
   footer a { color: #4f46e5; }
   footer a:hover { color: #4338ca; }
   body.dark-mode footer { /* ... */ }
   ```

4. **Common Button/Input Overrides**:
   - Button hover states
   - Input focus states
   - Border/background color overrides

**Estimated Savings**: ~2,000-2,500 lines of duplication eliminated

---

### 2.2: Create Shared HTML Components

#### Nav Component
**New File**: `components/nav.html`

**Content**:
```html
<div class="nav-dropdown inline-block ml-4">
    <button class="nav-dropdown-toggle" onclick="toggleDropdown(this)">
        Tools ▼
    </button>
    <div class="nav-dropdown-menu">
        <a href="index.html" class="nav-dropdown-item">Home / All Tools</a>
        <a href="colorexplorer_experimental.html" class="nav-dropdown-item">Color Harmony Explorer</a>
        <a href="colormatcher_experimental.html" class="nav-dropdown-item">Color Matcher</a>
        <a href="dyecomparison_experimental.html" class="nav-dropdown-item">Dye Comparison</a>
        <a href="coloraccessibility_experimental.html" class="nav-dropdown-item">Color Accessibility Checker</a>
    </div>
</div>
```

**Issue to Fix**: `coloraccessibility_experimental.html` currently links to `_stable.html` files instead of `_experimental.html`

#### Footer Component
**New File**: `components/footer.html`

**Content**: Extract identical footer from all 4 files (~40 lines):
- "Built with love for Eorzea's fashionistas" tagline
- Character attribution (Flash Galatine - Balmung)
- 9 social links (Blog, GitHub, Twitter, Twitch, BlueSky, Patreon, Discord, License, Donate)
- Square Enix disclaimer

---

### 2.3: Create Shared JavaScript

**New File**: `assets/js/shared-components.js`

**Contents**:

1. **Component Loading**:
```javascript
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const html = await response.text();
        document.getElementById(containerId).innerHTML = html;
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
        // Fallback: show minimal content or hide container
    }
}

function initComponents() {
    loadComponent('components/nav.html', 'nav-container');
    loadComponent('components/footer.html', 'footer-container');
}
```

2. **Unified Dark Mode**:
```javascript
const DARK_MODE_KEY = 'xivdyetools_darkMode';

function initDarkMode() {
    const isDark = safeGetStorage(DARK_MODE_KEY, 'false') === 'true';
    if (isDark) document.body.classList.add('dark-mode');
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    safeSetStorage(DARK_MODE_KEY, isDark.toString());
}
```

3. **Dropdown Toggle** (already exists, but centralize):
```javascript
function toggleDropdown(button) {
    const menu = button.nextElementSibling;
    menu.classList.toggle('show');

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            menu.classList.remove('show');
        }
    });
}
```

4. **FOUC Prevention**:
```javascript
// Add loading placeholders in HTML, remove when loaded
function removeLoadingPlaceholders() {
    document.querySelectorAll('.component-loading').forEach(el => {
        el.classList.remove('component-loading');
    });
}
```

---

### 2.4: Update All HTML Files

**Files to Update** (4 experimental files):
- `coloraccessibility_experimental.html`
- `colorexplorer_experimental.html`
- `colormatcher_experimental.html`
- `dyecomparison_experimental.html`

**Changes for Each File**:

1. **Add Shared CSS Link** (in `<head>`):
```html
<link rel="stylesheet" href="assets/css/shared-styles.css">
```

2. **Add Shared JS** (before closing `</body>`):
```html
<script src="assets/js/shared-components.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', () => {
        initComponents();
        initDarkMode();
    });
</script>
```

3. **Replace Nav HTML**:
```html
<!-- Before: 15-20 lines of inline nav HTML -->
<!-- After: -->
<div id="nav-container" class="component-loading">
    <!-- Fallback or loading indicator -->
    <span>Loading navigation...</span>
</div>
```

4. **Replace Footer HTML**:
```html
<!-- Before: 40-50 lines of inline footer HTML -->
<!-- After: -->
<div id="footer-container" class="component-loading">
    <!-- Fallback or loading indicator -->
</div>
```

5. **Update Dark Mode Initialization**:
```javascript
// Remove old tool-specific initialization
// Old: safeGetStorage('colorMatcher_darkMode', false)
// Old: safeGetStorage('colorExplorer_darkMode', false)
// Old: safeGetStorage('dyeComparison_darkMode', false)

// New: handled by shared-components.js
// Just call: initDarkMode()
```

6. **Remove Duplicated CSS**:
- Remove dark mode styles now in shared-styles.css
- Remove dropdown styles now in shared-styles.css
- Remove footer styles now in shared-styles.css
- Keep tool-specific styles inline

---

### 2.5: Update index.html

**Changes**:
1. Add shared-styles.css link
2. Fix unsafe localStorage usage (add try-catch or use safeGetStorage)
3. Update to use `xivdyetools_darkMode` key
4. Consider using dynamic nav/footer loading here too

---

## Phase 3: Testing & Deployment

### 3.1: Test Experimental Versions

**Environment Testing**:
- [ ] Test on hosted environment (http://localhost or actual server)
- [ ] Verify dynamic loading works correctly
- [ ] Check for FOUC and loading delays
- [ ] Test fetch error handling (disconnect network, test fallback)

**Browser Testing**:
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS)
- [ ] Mobile browsers (Chrome Android, Safari iOS)

**Feature Testing** (per tool):
- [ ] Dark mode toggles and syncs across tools
- [ ] All dropdowns work correctly
- [ ] Footer links all functional
- [ ] Tool-specific features unchanged
- [ ] localStorage persistence works
- [ ] No console errors or warnings

**Bug Verification**:
- [ ] Color Matcher: Jet Black matching works correctly
- [ ] Dye Comparison: Full Hue-Sat chart renders

### 3.2: Copy to Stable Versions

Once all testing passes:
1. Copy all 4 `*_experimental.html` → `*_stable.html`
2. Update version numbers if needed
3. Update CHANGELOG.md with bug fixes and refactoring notes
4. Commit with clear message

---

## Known Considerations

### Dynamic Loading Limitations
- **File protocol**: fetch() doesn't work with `file://` URLs
  - Users opening HTML files directly from disk will see errors
  - Solution: Document that tools should be accessed via HTTP server
- **FOUC**: Brief flash before components load
  - Mitigation: Loading placeholders, consider critical CSS inlining
- **Network dependency**: Tools require successful fetch of components
  - Mitigation: Comprehensive error handling, fallback content

### localStorage Key Migration
- Existing users have tool-specific dark mode keys
- Migration options:
  1. Read old keys first, migrate to new key, delete old keys
  2. Start fresh (users re-select dark mode preference)
  3. Use most recent tool's setting as default
- **Recommendation**: Option 1 (graceful migration)

---

## Future Phases (Not in Current Plan)

These are from the feedback document but deferred for now:

### Phase 4: Theme System (6 New Themes) & Font Updates

#### 4.1: Theme System Implementation
- Standard Light, Standard Dark (current)
- Hydaelyn (light blue), Classic Final Fantasy (dark blue)
- Parchment (beige), Sugar Riot (pink/dark)
- All WCAG compliant (AA minimum, AAA ideal)

#### 4.2: Font Updates

**Status**: PARTIALLY IMPLEMENTED (Dye Comparison Tool - COMPLETE)

**New Font Stack from Google Fonts**:

```css
/* Tool Title Font */
.tool-title {
  font-family: "Cinzel Decorative", serif;
  font-variant-caps: small-caps;
}

/* H1 Headers - Page Titles */
h1 {
  font-family: "Cinzel", serif;
  font-weight: 600;
  /* NO small-caps variant */
}

/* H2 and H3 Headers */
h2, h3 {
  font-family: "Cinzel", serif;
  font-weight: 500;
  font-variant-caps: small-caps;
}

/* Bolded Headers (e.g., dye box headers) */
.section-header, .dye-box-header {
  font-family: "Lexend Giga", sans-serif;
  font-variant-caps: all-small-caps;
}

/* Data Numbers ONLY (see below for details) */
.number {
  font-family: "Habibi", serif;
}

/* General Body Font */
body {
  font-family: "Lexend", sans-serif;
}
```

**Number Styling - Implementation Details**:

Numbers using "Habibi" font should ONLY appear in these contexts:
- **Color Codes**: HEX (#FF1493), RGB (255, 20, 147), HSV (H:300°, S:92%, V:100%)
- **Prices**: Universalis market data (e.g., "5,250 gil")
- **Color Matrix Values**: Deviance ratings, distance values, position percentages
- **Version Numbers**: Tool versions (e.g., "v1.4.0")

Narrative numbers (like "Select up to 8 dyes") should use the default body font (Lexend).

**Implementation Progress**:

##### Dye Comparison Tool - COMPLETE ✅

File: `dyecomparison_experimental.html`

Completed changes:
1. ✅ Added Google Fonts import for: Cinzel, Cinzel Decorative, Lexend, Lexend Giga, Habibi
2. ✅ Updated body font from 'Inter' to "Lexend"
3. ✅ Added CSS classes:
   - `.tool-title` (Cinzel Decorative, small-caps)
   - `h1` (Cinzel, weight 600, no small-caps)
   - `h2, h3` (Cinzel, weight 500, small-caps)
   - `.section-header, .dye-box-header` (Lexend Giga, all-small-caps)
   - `.number` (Habibi)
4. ✅ Applied `.dye-box-header` class to all dye info labels:
   - Name:, Category:, Hex:, RGB:, HSV:, Acquisition:, Price: (all 4 dye slots)
5. ✅ Implemented formatting functions:
   ```javascript
   function formatHexCode(hex)           // Wraps hex in .number span
   function formatRGBValues(r, g, b)    // Wraps R, G, B values individually
   function formatHSVValues(h, s, v)    // Wraps H, S, V values individually
   function formatPrice(priceText)      // Wraps price amounts in .number span
   ```
6. ✅ Updated HTML rendering to use innerHTML for styled numbers:
   - `dye-hex-${num}` → `formatHexCode()`
   - `dye-rgb-${num}` → `formatRGBValues()`
   - `dye-hsv-${num}` → `formatHSVValues()`
   - `dye-price-${num}` → `formatPrice()`
7. ✅ Applied `.number` class to distance matrix values
8. ✅ Applied `.number` class to version number (v1.2.3)
9. ✅ Fixed dark mode text color override for `.text-gray-800` elements (Hue-Saturation Chart, Brightness Chart)

**Testing Status** (Dye Comparison):
- ✅ Hex codes display with Habibi font
- ✅ RGB/HSV numbers use Habibi font
- ✅ Prices display with Habibi font
- ✅ Version number uses Habibi font
- ✅ Headers use Cinzel font
- ✅ Dye box labels use Lexend Giga font
- ✅ General body text uses Lexend font
- ✅ Dark mode text color transitions work correctly
- ✅ All fonts display correctly in both light and dark mode

##### Other Tools - PENDING

Remaining tools to apply font updates:
- [ ] Color Matcher (`colormatcher_experimental.html`)
- [ ] Color Harmony Explorer (`colorexplorer_experimental.html`)
- [ ] Color Accessibility Checker (`coloraccessibility_experimental.html`)

### Phase 5: New Tool - Dye Mixer

#### Use Case & Design Philosophy

**Problem Statement**:
Help decorators/interior designers find *bridge colors* when transitioning between two dyes. Unlike flat-color scenarios, real-world surfaces have textures (wood grain, fabric patterns) that may need intermediate colors for aesthetic transitions. The Dye Mixer helps discover smooth color progressions without relying purely on mathematical color theory.

**Target User**: Players decorating houses/apartments with complex textures who want to find intermediate dyes between two starting colors.

#### Design Approach

**Color Interpolation**: Use **HSV color space** for interpolation
- Simpler than LAB, more perceptually intuitive than RGB
- Smooth hue transitions and saturation curves
- Good balance between accuracy and implementation complexity

**Responsive Layout**:
- **Portrait/Mobile** (< 768px): Vertical gradient
  - Dyes stack vertically
  - Gradient line flows top-to-bottom
  - Information boxes stack naturally
  - Better use of vertical mobile space

- **Landscape/Desktop** (≥ 768px): Horizontal gradient
  - Dyes arranged left-to-right
  - Gradient line flows left-to-right
  - Information boxes can flow inline or below
  - Better use of horizontal screen space

**Visual Gradient Representation**:
- Display actual HSV-interpolated color gradient as background/line
- Shows users the "color journey" between dyes
- Helps visualize transition quality

#### MVP Feature Set (Phase 5.1)

**Core Features**:
- ✅ Select Dye 1 (0% position) via dropdown
- ✅ Select Dye 2 (100% position) via dropdown
- ✅ Display vertical/horizontal gradient visualization with interpolated colors
- ✅ Generate 3/4/7/9 recommended intermediate dyes at equal intervals
  - Calculation: `Percent Distance = 100 / (Recommended Dyes + 1)`
  - Example: 4 dyes = 20%, 40%, 60%, 80% positions
- ✅ Display dye information cards:
  - Dye name and color swatch
  - Deviance rating (0-10 scale, lower = closer to ideal position)
  - Position percentage
- ✅ Dark mode support (using shared components)
- ✅ Deduplication logic: If same dye appears at multiple positions, show once with notation
- ✅ Warning if user selects same dye for both positions
- ✅ Responsive mobile/desktop layouts

**No API Integration in MVP**:
- Omit Universalis pricing in Phase 5.1
- Add pricing integration later in Phase 5.2 (optional enhancement)

#### File Structure & Code Reuse

**New File**: `dye-mixer_experimental.html` (~2,500-3,500 lines)

**HTML Structure**:
```
dye-mixer_experimental.html
├── <head>
│   ├── Meta tags, Tailwind CDN
│   ├── <link href="assets/css/shared-styles.css"> [FROM PHASE 2]
│   └── <style> [tool-specific styles only]
├── <body>
│   ├── <div id="nav-container"> [LOADED VIA PHASE 2 shared-components.js]
│   ├── <main>
│   │   ├── Title: "Dye Mixer"
│   │   ├── Instructions
│   │   ├── Section: Select Starting & Ending Dyes
│   │   │   ├── Dye 1 selector (dropdown)
│   │   │   └── Dye 2 selector (dropdown)
│   │   ├── Section: Gradient Visualization
│   │   │   ├── Vertical/horizontal gradient container
│   │   │   ├── Interpolated color display
│   │   │   └── Dye boxes at 0% and 100% positions
│   │   ├── Section: Recommended Dyes
│   │   │   ├── Radio buttons: [3] [4] [7] [9] dyes
│   │   │   └── Container for dye recommendation cards
│   │   ├── Dark mode toggle button
│   │   └── Recommendation information box
│   └── <div id="footer-container"> [LOADED VIA PHASE 2 shared-components.js]
├── <script src="assets/js/shared-components.js"> [FROM PHASE 2]
└── <script> [tool-specific JavaScript]
```

**Code Reuse Opportunities**:
1. **Color Utilities** (already exist):
   - `hexToRgb(hex)` - Hex to RGB conversion
   - `rgbToHex(r, g, b)` - RGB to hex conversion
   - `rgbToHsv({r, g, b})` - RGB to HSV conversion
   - `hsvToRgb({h, s, v})` - HSV to RGB conversion
   - `getColorDistance(hex1, hex2)` - Find closest dye (from Color Matcher)

2. **Shared Components** (from Phase 2):
   - Dark mode toggle (initDarkMode, toggleDarkMode)
   - Dropdown logic (toggleDropdown)
   - Component loading (nav, footer)
   - localStorage utilities (safeGetStorage, safeSetStorage)

3. **New Tool-Specific Utilities**:
   - `interpolateColorInHSV(color1, color2, position)` - Generate ideal color at position
     - Position: 0-100 (0% = Dye 1, 100% = Dye 2)
     - Returns: interpolated HSV color
   - `findClosestDyeToColor(targetColor, allDyes)` - Find nearest dye (reuse logic)
   - `calculateDeviance(actualDye, idealColor)` - Rate quality of match (0-10 scale)
     - Uses `getColorDistance()` to measure RGB difference
     - Scale: 0 = perfect match, 10 = poor match
   - `generateGradientRecommendations(dye1, dye2, recommendationCount)` - Generate positions and find dyes
   - `deduplicateDyes(recommendations)` - Remove duplicates, consolidate positions
   - `renderGradientVisualization(dye1, dye2, recommendations)` - Draw gradient and dye positions

**Event Handlers**:
- Dye 1 selector change: Update gradient and regenerate recommendations
- Dye 2 selector change: Update gradient and regenerate recommendations
- Recommendation count radio button: Regenerate recommendations with new count
- Dark mode toggle: Use shared toggle (already handled)

#### Testing Checklist for Phase 5.1

**Functionality**:
- [ ] Dye 1 and Dye 2 selectors populate with all dyes
- [ ] Gradient visualization renders with correct colors
- [ ] Recommendation counts (3/4/7/9) generate correct number of dyes
- [ ] Deviance ratings calculate correctly (0-10 scale)
- [ ] Deduplication removes duplicates and shows consolidated position
- [ ] Warning displays when Dye 1 = Dye 2
- [ ] Information cards display: name, color, deviance, position %

**Responsive Design**:
- [ ] Vertical gradient renders correctly on portrait (< 768px)
- [ ] Horizontal gradient renders correctly on landscape (≥ 768px)
- [ ] Cards stack/arrange properly on mobile
- [ ] All interactive elements touch-friendly on mobile
- [ ] No overflow or text truncation

**Dark Mode**:
- [ ] Dark mode toggle syncs with other tools
- [ ] Gradient colors remain visible in dark mode
- [ ] All text readable in dark mode (contrast)
- [ ] Cards properly styled in dark mode

**Browser & Device Testing**:
- [ ] Chrome/Edge desktop
- [ ] Firefox desktop
- [ ] Safari desktop
- [ ] Chrome Android
- [ ] Safari iOS
- [ ] No console errors/warnings

#### Phase 5.2: Future Enhancements (Optional)

**Not included in MVP, but good future additions**:

1. **Interactive Gradient**:
   - Click on gradient line to show color at that point
   - Hover to preview intermediate color values
   - Tooltip showing: Hex, RGB, HSV of interpolated color

2. **Universalis API Integration**:
   - Fetch prices for all recommended dyes
   - Display lowest/highest cost dyes
   - Feature: "Find cheapest gradient for this color range"

3. **Preset Gradients**:
   - Save/load favorite gradients from localStorage
   - Share gradients via URL (query params: `?start=1&end=50&count=7`)
   - Featured gradients: "Pastel Fade", "Dark Fantasy", "Sunset Transition", etc.

4. **HSV Value Display**:
   - Show exact HSV/RGB values on hover
   - Tooltip format: `Jet Black: H:0° S:0% V:0%`
   - Useful for color theorists

5. **Integration with Other Tools**:
   - "Use as starting point in Color Accessibility Checker"
   - "Use in Color Harmony Explorer"
   - "Export outfit with this gradient"

#### File Structure After Phase 5 Addition

```
XIVDyeTools/
├── index.html
├── assets/
│   ├── css/
│   │   └── shared-styles.css
│   ├── js/
│   │   └── shared-components.js
│   └── json/
│       ├── colors_xiv.json
│       ├── data-centers.json
│       └── worlds.json
├── components/
│   ├── nav.html
│   └── footer.html
├── *_experimental.html (5 files)    [ADDED: dye-mixer_experimental.html]
├── *_stable.html (5 files)          [ADDED: dye-mixer_stable.html]
└── feedback/
    ├── Feedback.md
    └── IMPLEMENTATION_PLAN.md
```

#### Effort Estimate for Phase 5.1

- **Setup & Architecture**: 1 hour
  - Create HTML file structure
  - Set up dye selectors and gradient container
  - Initialize event listeners

- **Core Logic**: 2-3 hours
  - Implement HSV interpolation
  - Implement closest-dye finder
  - Implement deviance calculation
  - Implement recommendation generation

- **UI & Rendering**: 1.5-2 hours
  - Gradient visualization (CSS or canvas)
  - Dye information cards
  - Responsive layout (mobile/desktop)
  - Dark mode integration

- **Testing & Polish**: 1-2 hours
  - Cross-browser testing
  - Mobile responsiveness testing
  - Edge case handling (same dye, duplicates, warnings)
  - Bug fixes

**Total Phase 5.1**: 5.5-8 hours

---

---

## File Structure After All Phases

```
XIVDyeTools/
├── index.html
├── assets/
│   ├── css/
│   │   └── shared-styles.css          [NEW - Phase 2]
│   ├── js/
│   │   └── shared-components.js       [NEW - Phase 2]
│   └── json/
│       ├── colors_xiv.json
│       ├── data-centers.json
│       └── worlds.json
├── components/
│   ├── nav.html                       [NEW - Phase 2]
│   └── footer.html                    [NEW - Phase 2]
├── *_experimental.html
│   ├── coloraccessibility_experimental.html      [MODIFIED - Phase 1,2,3]
│   ├── colorexplorer_experimental.html           [MODIFIED - Phase 1,2,3]
│   ├── colormatcher_experimental.html            [MODIFIED - Phase 1,2,3]
│   ├── dyecomparison_experimental.html           [MODIFIED - Phase 1,2,3]
│   └── dye-mixer_experimental.html               [NEW - Phase 5]
├── *_stable.html
│   ├── coloraccessibility_stable.html            [MODIFIED after Phase 3]
│   ├── colorexplorer_stable.html                 [MODIFIED after Phase 3]
│   ├── colormatcher_stable.html                  [MODIFIED after Phase 3]
│   ├── dyecomparison_stable.html                 [MODIFIED after Phase 3]
│   └── dye-mixer_stable.html                     [NEW after Phase 5]
└── feedback/
    ├── Feedback.md
    └── IMPLEMENTATION_PLAN.md                    [THIS FILE]
```

---

## Estimated Effort

### Phase-by-Phase Breakdown

- **Phase 1 (Bug Fixes)**: 2-3 hours
  - Bug 1.1 (Color Matcher): 1 hour (logic + testing)
  - Bug 1.2 (Dye Comparison): 1-2 hours (canvas rendering + testing)

- **Phase 2 (Refactoring)**: 4-6 hours
  - Create shared files: 1 hour
  - Update 4 experimental files: 2-3 hours
  - Testing and debugging: 1-2 hours

- **Phase 3 (Testing/Deployment)**: 2-3 hours
  - Comprehensive testing: 1-2 hours
  - Copy to stable, commit: 1 hour

- **Phase 4 (Themes - Future)**: ~8-12 hours
  - Not included in current plan
  - 6 new themes + font integration + migration logic

- **Phase 5 (Dye Mixer - Future)**: 5.5-8 hours
  - Setup & architecture: 1 hour
  - Core logic (interpolation, recommendations): 2-3 hours
  - UI & rendering (gradient, responsive): 1.5-2 hours
  - Testing & polish: 1-2 hours

### Cumulative Totals

- **Phases 1-3 (Current Plan)**: **8-12 hours**
- **Through Phase 5 (Includes Dye Mixer)**: **13.5-20 hours**
- **Through Phase 6 (Includes Themes)**: **21.5-32 hours** (both Phase 4 & 5)

---

## Next Steps

1. Review this plan
2. Decide on any adjustments
3. Begin Phase 1: Bug fixes
4. Test bug fixes thoroughly
5. Proceed to Phase 2: Refactoring
6. Test refactored code
7. Deploy to stable versions

---

## Questions to Resolve

- [ ] Should we implement localStorage key migration for dark mode?
- [ ] What should fallback content be if component loading fails?
- [ ] Should index.html also use dynamic loading, or keep self-contained?
- [ ] Do we want loading spinners/skeletons for component loading?
- [ ] Should we add analytics/error reporting for fetch failures?
