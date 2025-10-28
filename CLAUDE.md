# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ColorExplorer is a web-based tool for Final Fantasy XIV (FFXIV) players to explore dye colors and create color harmony palettes. The application provides two main interfaces:
1. **Color Harmony Explorer** - Generate complementary, analogous, triadic, and other color harmony palettes based on FFXIV dye colors
2. **Color Matcher** - Upload images or pick colors to find the closest matching FFXIV dye

## Architecture

This is a static HTML/JavaScript application with no build process. All files are standalone HTML pages that can be opened directly in a browser.

### File Structure

- **colorexplorer_stable.html** - Production version of the color harmony explorer
- **colorexplorer_experimental.html** - Development version with new features
- **colorexplorer.html** - Legacy/older version
- **colormatcher.html** - Image-based color matching tool
- **assets/json/** - Data files
  - `colors_xiv.json` - Main color database (228 FFXIV dyes with RGB, HSV, hex, acquisition methods, item IDs)
  - `data-centers.json` - FFXIV data center information for market board integration
  - `worlds.json` - FFXIV world/server information
- **colors_xiv.json** - Root-level copy of the color database

### Core Data Model

Each color in `colors_xiv.json` has:
```json
{
  "itemID": 5729,
  "category": "Neutral",
  "name": "Snow White",
  "hex": "#e4dfd0",
  "acquisition": "Ixali Vendor",
  "price": 216,
  "currency": "Gil",
  "rgb": {"r": 228, "g": 223, "b": 208},
  "hsv": {"h": 45, "s": 8.77, "v": 89.41}
}
```

Categories include: Neutral, Special, Facewear, and standard color categories.

## Key Features

### Color Harmony Explorer (colorexplorer_stable.html)

**Color Theory Implementation:**
- Complementary (180° hue rotation)
- Analogous (±30° hue rotation)
- Triadic (120° and 240° hue rotation)
- Split-Complementary (150° and 210° hue rotation)
- Tetradic/Rectangular (60°, 180°, 240° hue rotation)
- Square (90°, 180°, 270° hue rotation)

The harmony generation works by:
1. Converting selected dye's hex to HSV color space
2. Calculating target hues based on harmony type
3. Converting target HSV back to RGB
4. Finding closest matching dye using Euclidean distance in RGB space

**Market Board Integration:**
- Fetches real-time prices from Universalis API
- Supports both individual worlds and entire data centers
- Batch fetches up to 100 items at a time
- Respects user preferences for which dye types to price (base, craft, beast tribe, cosmic, special)
- Caches prices to reduce API calls

**Export Options:**
- JSON export with all palette data
- CSS variables format
- SCSS variables format
- Copy hex codes to clipboard

**Filtering:**
- Filter by acquisition method
- Exclude metallic dyes
- Exclude facewear-specific colors

### Color Matcher (colormatcher.html)

- Color picker for direct color selection
- Image upload with eyedropper tool
- Configurable sample size (1x1 to 64x64 pixels) for averaging colors
- Option to exclude metallic dyes from matching
- Uses RGB Euclidean distance for closest match calculation

## Development Workflow

### Running the Application

Simply open any HTML file in a web browser. No server or build process required.

For local testing with proper CORS handling (if needed):
```bash
python -m http.server 8000
# or
npx http-server
```

Then navigate to `http://localhost:8000/colorexplorer_stable.html`

### Making Changes

1. Edit `colorexplorer_experimental.html` for new features
2. Test thoroughly in browser
3. When stable, update `colorexplorer_stable.html`
4. Keep `colorexplorer.html` as a backup/legacy version

### Working with Color Data

The color database is duplicated at root and in `assets/json/`. When updating:
- Prefer editing `assets/json/colors_xiv.json` as the canonical source
- Sync to root if needed for compatibility

Color matching algorithm uses RGB Euclidean distance:
```javascript
function colorDistance(rgb1, rgb2) {
    const dr = rgb1.r - rgb2.r;
    const dg = rgb1.g - rgb2.g;
    const db = rgb1.b - rgb2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
}
```

## Dependencies

All dependencies are loaded via CDN:
- **Tailwind CSS** - UI framework (via cdn.tailwindcss.com)
- **Google Fonts** - Inter font family
- **Universalis API** - Market board price data (https://universalis.app/api/v2/)

No package manager or node_modules required.

## Common Tasks

### Adding a New Dye Color

1. Add entry to `assets/json/colors_xiv.json`:
   - Include itemID from FFXIV game data
   - Specify category (Neutral, color name, Special, or Facewear)
   - Provide hex color code
   - Add acquisition method and price
   - Include pre-calculated RGB and HSV values
2. Refresh the page to see changes

### Modifying Harmony Calculations

Edit the `generateHarmony()` function in the HTML file. The function takes a base color and harmony type, then returns an array of matching colors by:
1. Calculating target hues based on the harmony formula
2. Creating target RGB values at same saturation/value
3. Finding closest actual dyes using `findClosestColor()`

### Updating Market Board Settings

Price categories are defined in the `PRICE_CATEGORIES` constant:
```javascript
const PRICE_CATEGORIES = {
    'baseDyes': { name: 'Base Dyes', acquisitions: ['Dye Vendor', 'Ixali Vendor'], default: false },
    'craftDyes': { name: 'Craft Dyes', acquisitions: ['Crafting'], default: true },
    // ...
};
```

Modify `shouldFetchPrice()` to change which dyes get market prices fetched.

## API Integration Notes

**Universalis API:**
- Endpoint: `https://universalis.app/api/v2/{world-or-dc}/{itemIds}`
- Rate limits: Be respectful, batch requests when possible
- Response includes listings with `pricePerUnit` for lowest market board price
- Supports comma-separated item IDs (up to 100 per request)
- Can query by world ID or data center name
