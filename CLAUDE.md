# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

XIV Dye Tools is a client-side web application providing four specialized tools for Final Fantasy XIV players to explore dye colors:

1. **Color Accessibility Checker** (v1.5.1) - Simulate colorblindness (deuteranopia, protanopia, tritanopia, achromatopsia)
2. **Color Harmony Explorer** (v1.5.1) - Generate harmonious color palettes using color theory
3. **Color Matcher** (v1.5.1) - Upload images and find closest matching FFXIV dyes
4. **Dye Comparison** (v1.5.1) - Compare up to 4 dyes with color distance matrices and visualizations
5. **Dye Mixer** (v1.5.1) - Find intermediate dyes for smooth color transitions (experimental)

**Current Status**: v1.5.1 Production (Phase 5 cleanup + bug fixes)
**Repository**: Main branch only, no feature branches
**Deployment**: All experimental versions synced with stable (v1.5.1)

## Architecture: The Monolithic Pattern

### Why Monolithic HTML Files?

Each tool is implemented as a **single self-contained HTML file** (~1,500-1,900 lines):
- No build process required (pure vanilla HTML/CSS/JavaScript)
- No external framework dependencies
- Easy for users to download/inspect/modify individual tools
- Reduces deployment complexity

**Implications**: High code duplication across the 4 tools (same utility functions in each file). This is intentional for now but represents ~800 duplicate lines that could be extracted in a future phase.

### File Organization

```
XIVDyeTools/
├── index.html                                      # Portal landing page
├── coloraccessibility_stable.html                 # Production versions
├── colorexplorer_stable.html
├── colormatcher_stable.html
├── dyecomparison_stable.html
├── dye-mixer_stable.html
├── coloraccessibility_experimental.html           # Development versions (in sync)
├── colorexplorer_experimental.html
├── colormatcher_experimental.html
├── dyecomparison_experimental.html
├── dye-mixer_experimental.html
│
├── components/
│   ├── nav.html                                   # Theme switcher + tools dropdown
│   └── footer.html                                # Footer component
│
├── assets/
│   ├── css/shared-styles.css                      # 10 theme definitions + utilities
│   ├── js/shared-components.js                    # Theme functions, storage utilities
│   └── json/
│       ├── colors_xiv.json                        # ~125 FFXIV dyes database
│       ├── data-centers.json                      # FFXIV data centers
│       └── worlds.json                            # FFXIV worlds per data center
│
├── README.md                                      # User-facing documentation
├── CHANGELOG.md                                   # Detailed version history
├── FAQ.md                                         # User FAQs
└── LICENSE                                        # MIT License
```

### Experimental/Stable Workflow

**Always edit `*_experimental.html` files, never stable directly.**

1. Make changes to `colormatcher_experimental.html`, etc.
2. Test thoroughly: all browsers, light/dark modes, responsive design, error scenarios
3. Copy entire content to corresponding `*_stable.html`
4. Commit with message: "Feature: Description" or "Experimental Sync: ..."

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

### Running Local Preview

**Option 1: Python (Built-in on Mac/Linux)**:
```bash
# Navigate to project directory
cd /path/to/XIVDyeTools

# Python 3.x
python -m http.server 8000

# Python 2.x (deprecated)
python -m SimpleHTTPServer 8000

# Then open: http://localhost:8000
```

**Option 2: Node.js (if installed)**:
```bash
# Install globally once
npm install -g http-server

# Run from project directory
http-server

# Then open: http://localhost:8080
```

**Why Local Preview Matters**:
- Components load via `fetch()` - requires HTTP, not `file://` protocol
- Without HTTP server, you'll see: `fetch() errors`, missing nav/footer, broken components
- Always use local preview when testing experimental versions

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
