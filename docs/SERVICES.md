# XIV Dye Tools - Service Layer Architecture

Deep dive into the service layer architecture, API integration, and data structures for XIV Dye Tools v2.0.0.

---

## Service Layer Overview

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

---

## DyeService (from `xivdyetools-core`)

**Purpose**: Manage FFXIV dye database, filtering, and discovery.

**Note**: DyeService is now provided by the `xivdyetools-core` npm package. Import from `@services/index`.

### Usage Examples

```typescript
import { DyeService } from '@services/index';

// Get all dyes
const allDyes = DyeService.getAllDyes();

// Filter by category
const redDyes = DyeService.getDyesByCategory('Red');

// Find specific dye
const jetBlack = DyeService.getDyeById(1);

// Search by name
const searchResults = DyeService.searchDyes('metallic');

// Find closest dye to color
const closest = DyeService.getClosestDye('#FF0000');
```

### Key Methods

- `getAllDyes()` - Returns all ~125 FFXIV dyes
- `getDyesByCategory(category)` - Filter dyes by color category
- `getDyeById(id)` - Get specific dye by ID
- `searchDyes(query)` - Full-text search by name
- `getClosestDye(hexColor)` - Find dye with smallest RGB distance
- `excludeFacewear(dyes)` - Remove facewear-only dyes
- `filterByAdvancedCriteria(dyes)` - Apply metallic/pastel/expensive filters

---

## ColorService (from `xivdyetools-core`)

**Purpose**: Color calculations, conversions, harmony generation, and accessibility simulations.

**Note**: ColorService is now provided by the `xivdyetools-core` npm package. Import from `@services/index`.

### Usage Examples

```typescript
import { ColorService } from '@services/index';

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

// Accessibility scoring
const score = ColorService.calculateAccessibilityScore([dye1, dye2, dye3]);
```

### Key Methods

**Color Conversion**:
- `hexToRgb(hex)` - Convert hex to RGB object
- `rgbToHex(r, g, b)` - Convert RGB to hex string
- `rgbToHsv(r, g, b)` - Convert RGB to HSV
- `hsvToRgb(h, s, v)` - Convert HSV to RGB

**Color Metrics**:
- `getColorDistance(hex1, hex2)` - Euclidean distance in RGB space (0-441.67)
- `getContrastRatio(hex1, hex2)` - WCAG contrast ratio calculation
- `getDominantHue(hex)` - Extract dominant hue from color

**Color Harmony**:
- `calculateHarmony(baseHex, type)` - Generate harmony angles for 6 types
- `calculateDeviance(hue, targetHue, targetSat, targetVal)` - Measure harmony alignment

**Accessibility**:
- `simulateColorblindness(hex, type)` - Apply Brettel 1997 transformation matrices
- `calculateAccessibilityScore(dyes)` - Combined score for outfit compatibility

### Harmony Types

1. **Complementary**: Base + color at 180° (opposite hue)
2. **Analogous**: Base + 2 colors at ±30° (adjacent hues)
3. **Triadic**: Base + 2 colors at 120° spacing
4. **Split-Complementary**: Base + 2 colors at ±30° from complement
5. **Tetradic**: Base + 3 colors forming 2 complementary pairs (90° spacing)
6. **Square**: Base + 3 colors at 90° spacing

---

## APIService (`src/services/api-service.ts`)

**Purpose**: Universalis API integration with session-level caching.

### Usage Examples

```typescript
import { APIService } from './services/api-service';

// Fetch market price (with automatic caching)
const priceData = await APIService.fetchPrice('Crystal', 1, 'primary');

// Format price for display
const formatted = APIService.formatPrice(69420); // "69,420<small>G</small>"

// Clear cache
APIService.clearCache();
```

### Response Structure

```typescript
interface PriceData {
  itemID: number;
  currentAverage: number;  // Rounded price
  currentMinPrice: number;
  currentMaxPrice: number;
  lastUpdate: number;      // Timestamp
}
```

### Key Features

- **Session-Level Caching**: Minimize API calls within session
- **Automatic Cache Invalidation**: Detects stale data
- **Error Handling**: Graceful fallback if API unreachable
- **Toast Notifications**: User feedback for API events
- **Optional Feature**: Works without API (graceful degradation)
- **Data Center Aggregation**: Uses aggregated endpoint for Data Center-wide pricing

### API Endpoint

**Universalis API v2**:
- Base: `https://universalis.app/api/v2`
- Endpoint: `/aggregated/{dataCenter}/{itemID}/{scope}`
- Scope: `primary`, `secondary`, or `all`

**Configuration** (`src/shared/constants.ts`):
- `UNIVERSALIS_API_TIMEOUT`: 5000ms
- `UNIVERSALIS_API_RETRY_COUNT`: 3 attempts
- `UNIVERSALIS_API_RETRY_DELAY`: 1000ms between retries
- `API_CACHE_TTL`: 5 minute session cache

---

## ThemeService (`src/services/theme-service.ts`)

**Purpose**: Unified theme management across all tools with persistence.

### Usage Examples

```typescript
import { ThemeService } from './services/theme-service';

// Get current theme
const theme = ThemeService.getCurrentTheme(); // "standard-light"

// Set theme (saves to localStorage)
ThemeService.setTheme('hydaelyn-light');

// Listen for changes
ThemeService.onThemeChange((themeName) => {
  console.log(`Theme changed to: ${themeName}`);
});
```

### Available Themes (9 Total)

**Standard Family**:
- `standard-light` - Rich burgundy on light gray
- `standard-dark` - Warm coral on dark gray

**Hydaelyn**:
- `hydaelyn-light` - Deep blue on soft blue-gray

**OG Classic**:
- `og-classic-dark` - Deep blue on very dark background (retro FFXIV)

**Parchment**:
- `parchment-light` - Warm beige/brown tones

**Cotton Candy**:
- `cotton-candy` - Soft pastel pink theme

**Sugar Riot**:
- `sugar-riot` - Neon pink with electric blue and yellow accents

**Grayscale Family**:
- `grayscale-light` - Pure grayscale light (WCAG AAA)
- `grayscale-dark` - Pure grayscale dark (WCAG AA+)

### CSS Custom Properties

All themes define these variables in `src/styles/themes.css`:
- `--theme-primary` - Primary accent color
- `--theme-background` - Main background
- `--theme-text` - Primary text color
- `--theme-border` - Border colors
- `--theme-background-secondary` - Secondary background
- `--theme-card-background` - Card background
- `--theme-text-muted` - Muted/secondary text

### localStorage Key

- Key: `xivdyetools_theme`
- Value: Theme name (e.g., "standard-light")
- Persistence: Across browser sessions

---

## StorageService (`src/services/storage-service.ts`)

**Purpose**: Safe localStorage access with error handling.

### Usage Examples

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

### Key Features

- **Type-Safe**: Generic <T> for type inference
- **Error Handling**: Try-catch internally, returns defaults on error
- **No Exceptions**: Graceful degradation if storage unavailable
- **Quota Management**: Handles `QuotaExceededError`
- **JSON Serialization**: Automatic stringify/parse

---

## Data Structures

### FFXIV Dyes (`src/assets/json/colors_xiv.json`)

Each dye object follows this structure:

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

### Category Priority (Dropdown Order)

| Priority | Category | Display Order |
|----------|----------|---------------|
| 0 | Neutral | First |
| 2 | A-Z Colors | Middle |
| 98 | Special | Near end |
| 99 | Facewear | Last |

### localStorage Keys Reference

| Key | Tool | Purpose |
|-----|------|---------|
| `xivdyetools_theme` | All tools | Current theme |
| `xivdyetools_dark_mode` | Legacy | (Deprecated) |
| `xivdyetools_dual_dyes` | Accessibility Checker | Dual dyes toggle |
| `xivdyetools_show_prices` | All tools | Price display toggle |
| `xivdyetools_last_tool` | All tools | Last opened tool |
| `xivdyetools_price_cache` | All tools | Market price cache |
| `xivdyetools_saved_palettes` | Harmony Explorer | Saved color palettes |
| `xivdyetools_harmony_filters` | Harmony Explorer | Filter preferences |
| `xivdyetools_harmony_suggestions_mode` | Harmony Explorer | Simple/Expanded mode |
| `xivdyetools_harmony_companion_dyes` | Harmony Explorer | Companion dyes count (1-3) |

**Note**: Future refactoring should standardize keys to follow pattern: `xivdyetools_[toolname]_[setting]`

---

## External APIs & Data Sources

### Universalis API (Market Board)

**Endpoint**: `https://universalis.app/api/v2/aggregated/{dataCenter}/{itemID}/{scope}`

**Used by**:
- Color Harmony Explorer (optional)
- Color Matcher (optional)
- Dye Comparison (optional)

**Response Structure**:
```typescript
interface PriceData {
  itemID: number;
  worldID?: number;
  lastUploadTime: number;
  currentAveragePrice: number;
  currentAveragePriceNQ: number;
  currentMaxPrice: number;
  currentMinPrice: number;
  historyServer: [];  // Historical prices
}
```

**Key Features**:
- Session-level caching to minimize API calls
- Automatic cache invalidation (stale data detection)
- Error handling with graceful fallback
- Toast notifications for user feedback
- Optional feature (works without API)
- Uses aggregated endpoint for Data Center-wide pricing

### FFXIV Data Centers & Worlds

**Source**: Manual curation from Universalis API documentation

**Structure**: Hierarchical data center → worlds mapping

---

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

---

## FFXIV Data Sources

- **Dye Database**: Manual curation from FFXIV Gamerescape + in-game testing
- **Data Centers & Worlds**: From Universalis API documentation
- **Color Values**: RGB/HSV calculated from hex, HSV verified against in-game appearance
- **Market Prices**: Real-time from Universalis API aggregated data
- **Dye Acquisition**: Manual verification of dye sources

---

## Service Dependencies

```
DyeService
  ├─ Depends on: (none - independent)
  └─ Used by: ColorService, Harmony Explorer, Color Matcher, Dye Comparison, Dye Mixer

ColorService
  ├─ Depends on: (none - independent)
  └─ Used by: All tools

APIService
  ├─ Depends on: StorageService (caching)
  └─ Used by: Color Harmony Explorer, Color Matcher, Dye Comparison

ThemeService
  ├─ Depends on: StorageService (persistence)
  └─ Used by: All tools, app-layout component

StorageService
  ├─ Depends on: (none - independent)
  └─ Used by: All other services + components
```

---

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design and file organization
- **[TOOLS.md](./TOOLS.md)** - Individual tool descriptions
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[README.md](../docs/README.md)** - Documentation index
