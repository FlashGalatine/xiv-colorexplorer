# Changelog

All notable changes to the FFXIV Color Explorer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
