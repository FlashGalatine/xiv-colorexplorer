# XIV Dye Tools - Tool Descriptions & Algorithms

Detailed descriptions of all five tools, their features, algorithms, and test scenarios.

---

## Overview: The Five Tools

XIV Dye Tools provides five specialized tools for Final Fantasy XIV players to explore and match dye colors:

1. **Color Accessibility Checker** - Simulate colorblindness
2. **Color Harmony Explorer** - Generate harmonious color palettes
3. **Color Matcher** - Upload images and find closest matching dyes
4. **Dye Comparison** - Compare up to 4 dyes with visualizations
5. **Dye Mixer** - Find intermediate dyes for color transitions

---

## Tool 1: Color Accessibility Checker

**Component**: `src/components/accessibility-checker-tool.ts`

**Purpose**: Simulate how colors appear to people with different types of colorblindness.

### Features

- **5 Vision Types**:
  - Normal Vision (baseline)
  - Deuteranopia (Red-Green colorblindness, ~1% of males)
  - Protanopia (Red-Green colorblindness, ~1% of males)
  - Tritanopia (Blue-Yellow colorblindness, ~0.001% of population)
  - Achromatopsia (Total colorblindness, ~0.0001% of population)

- **6 Outfit Slots**: Head, Body, Hands, Legs, Feet, Weapon
- **Dual Dyes**: Optional secondary dye per slot for two-tone colors
- **Accessibility Score**: 0-100 indicating outfit distinguishability
- **Accessibility Warnings**: Alert user if outfit fails contrast checks

### Algorithm

**Brettel 1997 Transformation Matrices**:
- Each vision type uses a 3×3 transformation matrix
- Matrices defined in `src/shared/constants.ts`
- Apply matrix to RGB values to simulate perception
- Results displayed in visual comparison grid

**Accessibility Scoring**:
1. Calculate color distance between each pair of dyes in outfit
2. Apply colorblind transformation for each vision type
3. Check transformed distances against WCAG AA contrast minimums
4. Score = (passing vision types / 5) × 100

### Test Scenarios

- [ ] All 5 vision types produce visibly different color outputs
- [ ] Accessibility score updates when changing dyes
- [ ] Score updates when switching vision types
- [ ] Dual dyes toggle persists in localStorage
- [ ] Score calculation accurate with multiple dye combinations
- [ ] Contrast ratio calculations follow WCAG standards
- [ ] Outfit slots update correctly when changing dyes

---

## Tool 2: Color Harmony Explorer

**Component**: `src/components/harmony-generator-tool.ts`

**Purpose**: Generate color palettes using proven color theory harmony types.

### Features

- **6 Harmony Types**:
  1. **Complementary**: Base color + 1 color at 180° (opposite)
  2. **Analogous**: Base color + 2 colors at ±30° (adjacent)
  3. **Triadic**: Base color + 2 colors at 120° spacing
  4. **Split-Complementary**: Base + 2 at ±30° from complement
  5. **Tetradic**: Base + 3 colors (90° spacing, 2 complementary pairs)
  6. **Square**: Base + 3 colors at 90° spacing

- **Color Wheel Visualization**: Interactive SVG showing harmony angles
- **Deviance Scoring**: 0-10 scale measuring harmony alignment accuracy
- **Market Price Integration**: Optional real-time dye prices (Universalis API)
- **Two Suggestion Modes**:
  - **Simple Mode**: Exact dye counts per harmony type (strict theory)
  - **Expanded Mode**: Simple + additional similar dyes per harmony color

- **Variable Companion Dyes**: Configure 1-3 additional dyes per harmony color (Expanded only)
- **Advanced Dye Filters**:
  - Exclude Metallic dyes
  - Exclude Pastel dyes
  - Exclude Expensive dyes (Jet Black, Pure White)

### Algorithm

**Harmony Calculation** (HSV Color Space):
1. Convert base dye color to HSV
2. For each harmony type, calculate target hues:
   - Complementary: ±180°
   - Analogous: ±30°
   - Triadic: ±120°
   - etc.
3. For each harmony hue, find dyes matching target:
   - Hue: ±15° of target
   - Saturation: ≥50%
   - Value: ≥30%

**Deviance Scoring** (0-10 scale):
- Measures closeness to theoretical harmony values
- Lower deviance = better theory alignment
- Calculated per dye: `deviance = |actual - target| / max_deviation`
- Top 6 suggestions shown, sorted by deviance

**Expanded Mode Algorithm**:
1. Get Simple Mode suggestions (strict harmony dyes)
2. For each harmony dye, find N companion dyes (N = user-selected 1-3)
3. Use RGB Euclidean distance to find closest unselected dyes
4. Companion dyes add exploration flexibility

### Test Scenarios

- [ ] All 6 harmony types display correct angle spacing
- [ ] Deviance scores are in 0-10 range
- [ ] Base color excluded from result suggestions
- [ ] Color wheel correctly visualizes harmony angles
- [ ] Market prices fetch and display (optional)
- [ ] Simple mode shows exact dye counts per type
- [ ] Expanded mode adds companion dyes correctly
- [ ] Variable companion slider shows 1-3 options
- [ ] Companion count persists in localStorage
- [ ] Advanced filters hide matching dyes
- [ ] Filters combination works correctly
- [ ] API integration works without network (graceful fallback)

### Known Issues & Investigation

**Triadic Harmony Bug** (HIGH PRIORITY):
- Some dyes (Dragoon Blue, Carmine Red, Canary Yellow) show only 1 triadic match instead of 2
- Potential causes: filtering, deviance threshold, harmony calculation, insufficient dyes
- Status: Under investigation

---

## Tool 3: Color Matcher

**Component**: `src/components/color-matcher-tool.ts`

**Purpose**: Upload images and find the closest matching FFXIV dye colors.

### Features

- **4 Input Methods**:
  1. Drag & drop image files (up to 20MB)
  2. Clipboard paste (Ctrl+V / Cmd+V on Windows/Linux, Cmd+V on Mac)
  3. Direct hex color input via color picker
  4. Eyedropper tool (click image to sample color)

- **Configurable Sampling**: 1×1 to 64×64 pixel averaging
- **Auto Zoom**: Fit images to canvas intelligently
- **Zoom Controls**: Fit, Width, +/-, Reset
- **Real-time Matching**: Updates immediately as you sample
- **Theme-Aware UI**: Tip text color matches selected theme

### Algorithm

**Color Distance Matching** (RGB Euclidean Space):
1. Sample image at selected resolution (user-controlled averaging)
2. Convert image pixels to RGB values
3. Calculate Euclidean distance to all ~125 dyes:
   - Distance = √((R₁-R₂)² + (G₁-G₂)² + (B₁-B₂)²)
   - Range: 0 (perfect match) to 441.67 (maximum distance)
4. Return dye with minimum distance

**Sample Size Impact**:
- 1×1: Single pixel (very specific)
- 16×16: Balanced averaging (default, good for most images)
- 64×64: Heavy averaging (smooths variation, better for noisy images)

**Image Processing**:
- Canvas-based sampling for accurate pixel color extraction
- Resolution reduction optimization to prevent performance issues
- Auto-zoom: Portrait images stretch to width, landscape images fit to canvas

### Test Scenarios

- [ ] Drag-drop works with various image formats (PNG, JPG, GIF)
- [ ] Clipboard paste works (Ctrl+V / Cmd+V)
- [ ] Color picker input accepts valid hex colors
- [ ] Color picker rejects invalid hex colors
- [ ] Eyedropper tool samples correct pixel under cursor
- [ ] Sample size averaging produces expected results
- [ ] Zoom controls (Fit, Width, ±, Reset) work
- [ ] Theme-aware styling applied to tip text
- [ ] Market price display works (optional)
- [ ] Error handling for missing/invalid images
- [ ] Large images (>5MB) don't cause UI freeze
- [ ] Canvas rendering is responsive

---

## Tool 4: Dye Comparison

**Component**: `src/components/dye-comparison-tool.ts`

**Purpose**: Compare up to 4 dyes with color distance metrics and visualizations.

### Features

- **Up to 4 Dye Selection**: Compare multiple dyes side-by-side
- **3 Visualization Types**:
  1. Color distance matrix (table with gradient coloring)
  2. Hue-Saturation 2D chart (canvas-based)
  3. Brightness 1D chart (canvas-based)

- **Color Distance Matrix**:
  - Green = close colors
  - Yellow = medium distance
  - Red = far colors
  - Shows pairwise distances between all selected dyes

- **Export Formats**:
  - JSON export with all color data
  - CSS export with hex codes as CSS custom properties
  - Copy hex codes to clipboard

- **Market Price Integration**: Optional real-time dye prices
- **Chart Rendering**: Optimized canvas performance

### Algorithm

**Color Distance Matrix**:
- Calculate Euclidean distance in RGB space between each dye pair
- Display in table with color gradient indicators
- Green (distance 0-50), Yellow (50-200), Red (200-441)

**Hue-Saturation 2D Chart**:
- X-axis: Saturation (0-100)
- Y-axis: Hue (0-360°)
- Plot each dye as a point
- Show all 4 quadrants if 4 dyes selected

**Brightness 1D Chart**:
- X-axis: Brightness/Value (0-100)
- Y-axis: Dye positions
- Show brightness distribution

**Canvas Optimization**:
- Resolution reduction for performance (`CHART_RESOLUTION_REDUCTION = 2`)
- Efficient pixel iteration
- Only redraw when dye selection changes

### Test Scenarios

- [ ] Can select up to 4 dyes
- [ ] Cannot select more than 4 dyes
- [ ] All 3 chart types render correctly
- [ ] Color distance calculations are accurate
- [ ] Charts show all 4 quadrants with 4 dyes selected
- [ ] Charts adapt to 1-3 dye selections
- [ ] Export JSON format is valid
- [ ] Export CSS format is valid
- [ ] Copy hex to clipboard works
- [ ] Market prices fetch and display (optional)
- [ ] Canvas doesn't freeze with large datasets
- [ ] Charts responsive to theme changes

---

## Tool 5: Dye Mixer

**Component**: `src/components/dye-mixer-tool.ts`

**Purpose**: Find intermediate dyes to create smooth color transitions between two dyes.

### Features

- **Start & End Dye Selection**: Choose two dyes to interpolate between
- **Intermediate Dye Ranking**: Ranked list of dyes by proximity to midpoint
- **Visual Color Transition**: See the gradient from start to end color
- **Midpoint Calculation**: Find dyes near the mathematical midpoint
- **Smooth Transitions**: Results ordered by distance to midpoint

### Algorithm

**RGB Space Interpolation**:
1. Convert start and end dyes to RGB
2. Calculate midpoint: `midpoint = (start + end) / 2`
3. Calculate distance from each other dye to midpoint
4. Rank dyes by distance (closest first)
5. Display top results as intermediate options

**Distance Calculation**:
- Euclidean distance in RGB space
- `distance = √((R₁-R₂)² + (G₁-G₂)² + (B₁-B₂)²)`
- Closer dyes (lower distance) better for smooth transitions

**Transition Visualization**:
- Show color gradient from start to end
- Highlight selected intermediate dye in gradient
- Visual feedback for transition smoothness

### Test Scenarios

- [ ] Can select start and end dyes
- [ ] Midpoint calculation is accurate
- [ ] Dyes ranked by proximity to midpoint
- [ ] Visual color gradient displays smoothly
- [ ] Selecting intermediate dye updates visualization
- [ ] Edge case: start = end dye handled
- [ ] Edge case: extreme colors (black/white) work
- [ ] Rankings update when changing start/end dyes
- [ ] Multiple intermediate dyes work together
- [ ] Color transition smooth and visually appealing

---

## Theme System (v2.0.0)

### Overview

XIV Dye Tools includes a unified 12-theme system providing visual customization across all tools.

### Available Themes

**Standard Family** (Gray/Indigo):
- Standard Light
- Standard Dark

**Hydaelyn Family** (Sky Blue):
- Hydaelyn Light
- Hydaelyn Dark

**Classic FF Family** (Deep Blue - Retro FFXIV):
- Classic Light
- Classic Dark

**Parchment Family** (Warm Beige/Brown):
- Parchment Light
- Parchment Dark

**Sugar Riot Family** (Vibrant Pink):
- Sugar Riot Light
- Sugar Riot Dark

**Grayscale Family** (Accessibility - WCAG AAA/AA+):
- Grayscale Light (10.5:1 header, 20.8:1 body text)
- Grayscale Dark (7.2:1 header, 19.6:1 body text)

### How The Theme System Works

**CSS Custom Properties** (`src/styles/themes.css`):
- 12 complete color sets defined with CSS variables
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
- 12 theme options with visual swatches
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
   - Add theme name to `THEME_NAMES` array

3. **Update constants** (`src/shared/constants.ts`):
   - Add display name to `THEME_DISPLAY_NAMES`

4. **Update ThemeSwitcher component** (`src/components/theme-switcher.ts`):
   - Add theme option to dropdown menu

5. **Test** in all tools:
   ```bash
   npm run dev
   # Test theme selection in browser
   # Verify persistence after refresh
   ```

---

## Related Documentation

- **[SERVICES.md](./SERVICES.md)** - Service layer architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues
- **[README.md](../docs/README.md)** - Documentation index
