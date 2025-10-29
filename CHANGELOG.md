# Changelog

All notable changes to the FFXIV Color Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased] - Experimental Build Only

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
- Color wheels now include `data-harmony-type` attribute for proper scoping
- Color dots include `data-hex` attribute for identification
- `createColorSwatchHTML()` updated to accept `harmonyType` parameter and bind hover events
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
