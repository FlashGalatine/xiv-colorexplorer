# Changelog

All notable changes to the XIV Dye Tools project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.2] - 2025-10-30

### Added
- **Dye Comparison v1.1.0 - Color Chart Visualization**
  - **Hue-Saturation 2D Color Chart**
    - Canvas-based visualization showing dye positions in 2D color space
    - X-axis: Hue (0-360°) showing color spectrum
    - Y-axis: Saturation (0-100%) showing color intensity
    - Colored circles mark actual dye positions using their hex colors
    - Interactive gradient background displays full color space
    - Saturation percentages labeled on left axis (0%, 25%, 50%, 75%, 100%)
    - 1080p optimized with 1000×750px canvas resolution
    - Responsive padding: 70px left, 40px other sides
    - Dark mode support with background color adaptation

  - **Brightness 1D Chart**
    - Linear visualization of dye brightness/value distribution
    - Y-axis scale: Black (0%) to White (100%)
    - Vertical colored lines indicate each dye's brightness position
    - Lines use actual dye hex colors for visual reference
    - 1080p optimized with 1000×750px canvas resolution
    - Responsive padding: 50px left/right, 40px top/bottom
    - Dark mode support with background color adaptation

  - **Dynamic Chart Updates**
    - Charts automatically render when dyes are selected
    - Charts update in real-time as dyes are added/removed
    - Smooth transitions between chart states
    - Proper alignment of chart bottom edges (fixed padding issues)

  - **1080p Display Optimization**
    - Canvas resolution increased from 400x300 to 1000x750 for both charts
    - Responsive typography with 2xl breakpoints
    - Increased padding and spacing for larger screens
    - Better visual hierarchy and grid layouts
    - Optimized font sizing for readability at 1920x1080

  - **Color Quality Improvements**
    - Circles and lines now display using actual dye hex colors
    - Replaced fixed color palette with dynamic color values
    - More accurate visual representation of actual FFXIV dyes
    - Improved color accuracy for color theory understanding

### Changed
- Updated Dye Comparison from v1.0.0 to v1.1.0
- Created `dyecomparison_stable.html` as primary stable version
- Updated all tool navigation dropdowns to reference `dyecomparison_stable.html`
  - Updated in `index.html`
  - Updated in `colorexplorer_stable.html`
  - Updated in `colormatcher_stable.html`
  - Updated in `dyecomparison_stable.html`

### Technical Details
- New `drawHueSaturationChart()` function:
  - Creates 2D canvas with gradient color space representation
  - Converts dye HSV values to canvas coordinates
  - Draws circles at precise hue-saturation positions
  - Implements proper padding calculations for label display
  - Uses requestAnimationFrame for smooth rendering

- New `drawBrightnessChart()` function:
  - Creates 1D linear canvas visualization
  - Maps brightness values (0-100) to Y-axis coordinates
  - Draws vertical lines for each selected dye
  - Implements padding management for proper spacing

- New `hsvToRgb(h, s, v)` helper function:
  - Converts HSV color space to RGB for canvas rendering
  - Handles edge cases (achromatic colors, gray values)
  - Produces accurate RGB values for gradient backgrounds

- New `updateColorCharts()` function:
  - Coordinates visibility and rendering of both charts
  - Controls chart display based on selected dyes
  - Triggers re-rendering on dye selection changes

- Canvas context properties optimized for 1080p:
  - Font size: 14px (previously smaller)
  - Line width: 2px for better visibility
  - Font family: 'Inter', sans-serif for consistency

- Chart positioning uses margin and padding to ensure proper alignment:
  - Removed individual padding from brightness-container
  - Unified padding approach across both charts

## [1.2.1] - 2025-10-30

### Added
- **Color Matcher v1.2.0 Enhancements**
  - **Dark Mode Support for Market Board Server Dropdown**
    - Market Board Server dropdown now properly darkens in dark mode
    - Dropdown options and option groups styled for dark theme
    - Improved dark mode consistency across all Market Board controls

  - **Intelligent Image Zoom System**
    - Auto-detects portrait-oriented images and extra large images
    - Automatically applies "Zoom to Width" for portrait images (height > width)
    - Automatically applies "Zoom to Width" for images significantly taller than wrapper (height > 1.5x wrapper height)
    - Uses "Zoom to Fit" for landscape and standard aspect ratio images
    - Provides optimal viewing experience without manual zoom adjustments

### Fixed
- Market Board Server dropdown styling in dark mode on Color Matcher
- Image zoom detection logic for various image orientations and sizes

## [1.2.0] - 2025-10-30

### Released
- **Color Matcher** (v1.2.0) - Stable release with major UI overhaul
- **Dye Comparison** (v1.0.0) - Stable release
- **Color Harmony Explorer** (v1.1.0) - Stable release

### Added
- **Color Matcher v1.2.0 UI Overhaul** (`colormatcher.html`)
  - **Two-Column Layout Redesign**
    - Left panel (380px fixed width) contains all dye information and controls:
      - Color picker with hex display
      - Closest match results with category and acquisition info
      - Exclusion filters (metallic, facewear, extremes)
      - Market Board server selection and price settings
    - Right panel displays image upload, sample size selector, image canvas, and empty state
    - Sticky left panel remains accessible when scrolling through tall images
    - Optimized for 1080p displays (1920x1080) with minimal scrolling
    - Responsive design switches to single-column on smaller screens (<1024px)
  - **Dark Mode Fixes**
    - Sample Size dropdown properly darkens in dark mode with readable text
    - Text colors for filter labels and "Pick Your Color" now readable in dark mode
    - All dropdowns and input fields properly styled for both light and dark themes
  - **Eyedropper Preview Positioning**
    - Fixed eyedropper preview circle positioning to follow cursor accurately
    - Uses correct positioning reference (imageContainer) for precise placement
    - 40px offset maintains consistent visual feedback
  - **Empty State Display**
    - Empty state message only displays when no image is loaded
    - Properly hides when image is successfully uploaded
    - Restores when image is cleared
  - **1080p Optimization**
    - Removed max-width constraints allowing full use of available screen space
    - Reduced padding and margins for more compact interface
    - Optimized heading sizes and typography
    - Compact zoom control buttons
    - All interactive elements properly sized and spaced for 1080p displays
  - **Layout and Spacing Refinements**
    - Body padding reduced for tighter vertical spacing
    - Panel padding optimized for compact display
    - Improved visual hierarchy with adjusted margins and gaps
    - Better alignment of all UI elements

- **Dye Comparison Tool** (`dyecomparison.html`) - v1.0.0
  - New tool to compare up to 4 FFXIV dyes side-by-side
  - Compare complete dye information: name, category, hex, RGB, HSV, acquisition method, and price
  - **Color Distance Matrix** - Visual representation of color similarities between selected dyes
    - Green cells: Distance < 50 (very similar colors)
    - Yellow cells: Distance 50-99 (similar colors)
    - Red cells: Distance ≥ 100 (dissimilar colors)
    - Uses RGB Euclidean distance algorithm
  - **Smart Dropdown with Category Organization**
    - Dyes organized by category using `<optgroup>` elements
    - Category order: Neutral → Colors (alphabetical) → Special → Facewear
    - All dyes alphabetically sorted within each category
    - Matches sorting style of Color Harmony Explorer for consistency
  - **Export Options**
    - Export as JSON: Download complete dye comparison data with timestamp
    - Export as CSS: Generate CSS custom properties (variables) for selected dyes
    - Copy Summary: Copy formatted text summary to clipboard
    - Copy Hex Codes: Copy dye names with hex codes to clipboard
  - **Dark Mode Support**
    - Full dark mode styling for all elements
    - Dropdown menus properly darkened in dark mode
    - Color Distance Matrix background and borders adapted for dark theme
    - Persistent preference storage in localStorage
  - **HSV Value Tooltips**
    - Hover over "HSV:" label shows tooltip: "HSV values can be used in other games like Monster Hunter Wilds"
    - Cursor changes to help icon on hover for better UX
  - **UI/UX Features**
    - Disabled state for export/clear buttons until dyes are selected
    - Toast notifications for successful exports (green notification, 3-second timeout)
    - Clear All button to reset all selections
    - Disabled export buttons enable automatically when dyes are selected
    - Complete footer with creator attribution and social links

- **Portal Landing Page** (`index.html`)
  - New index.html serves as central hub for all XIV Dye Tools
  - 3-column grid layout showcasing all available tools:
    - Color Harmony Explorer (v1.1.0)
    - Color Matcher (v1.1.0)
    - Dye Comparison (v1.0.0)
  - "Try Experimental Features" section with link to experimental Color Harmony Explorer
  - "All Tools Feature" highlights section showcasing shared features
  - Dark mode support with persistent preference
  - Portal navigation: Experimental version notice, feature highlights, footer with all social links

- **Navigation Dropdown System**
  - Replaced inline navigation links with dropdown menu on all tools
  - Dropdown button labeled "Tools ▼" appears in header of each tool
  - Dropdown menu includes links to all stable tools:
    - Color Harmony Explorer
    - Color Matcher
    - Dye Comparison
    - All Tools (portal page)
  - Dropdown styling:
    - Indigo button color (matches theme)
    - Auto-closes when clicking outside dropdown
    - Smooth animations and transitions
    - Full dark mode support
  - Implemented on all three tools:
    - colorexplorer_stable.html
    - colormatcher.html
    - dyecomparison.html

### Changed
- Updated project name from "FFXIV Color Explorer" to "XIV Dye Tools" (comprehensive toolset brand)
- Fixed dye count in portal from 228 to 125 (correctly excludes 11 Facewear colors)
- Improved dark mode styling throughout all tools:
  - "How to use" tooltip box properly darkened in dyecomparison.html
  - Color Distance Matrix empty cells now have dark backgrounds in dark mode
  - "Try Experimental Features" box styled for dark mode in portal
  - "All Tools Feature" box bright in light mode, properly darkened in dark mode

### Fixed
- Fixed HSV value display in dyecomparison.html to show as integers (no decimal places)
  - Hue (H): Rounded to nearest integer
  - Saturation (S): Rounded to nearest integer
  - Value (V): Rounded to nearest integer
- Fixed dropdown menu styling for dark mode in dyecomparison.html
  - Select elements now properly styled with dark backgrounds
  - Optgroup elements styled appropriately
  - Option items have proper dark mode colors
- Fixed dark mode styling for portal page elements
  - Amber alert box (Experimental Features) properly darkened
  - Feature highlights section background properly applied
- Fixed navigation consistency across all tools
  - All tools now use consistent dropdown navigation
  - Tools link to stable builds (colorexplorer_stable.html)

### Technical Details
- New `toggleDropdown()` function for dropdown menu interaction
  - Toggles visibility class on dropdown menu
  - Auto-closes dropdown when clicking outside using event delegation
  - Implemented globally in all three tools
- Dye Comparison dropdown implementation:
  - `populateDropdowns()` sorts dyes using category priority system
  - Creates optgroup elements for each category
  - Implements same sorting logic as Color Harmony Explorer for consistency
- Dye Comparison export functions:
  - `exportAsJSON()`: Creates Blob with JSON data, triggers download
  - `exportAsCSS()`: Generates CSS with sanitized dye names as custom properties
  - `copyHexCodes()`: Formats dye names with uppercase hex codes for clipboard
  - `copySummary()`: Creates formatted text summary with color distances
- Portal layout uses responsive 3-column grid (`md:grid-cols-3`)
- Container width expanded to `max-w-7xl` to accommodate three columns
- Dropdown styling uses custom CSS classes with Tailwind fallbacks for dark mode

## [1.1.0] - 2025-10-29

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

- **Interactive Deviance Line Visualization**
  - Hovering over a deviance badge now draws a line on the color wheel
  - Line connects from the base color dot to the matched color dot
  - Line color dynamically matches the badge color for semantic consistency:
    - Green line (#22c55e) for excellent matches (deviance 0-3)
    - Yellow line (#eab308) for good matches (deviance 3.1-6)
    - Red line (#ef4444) for poor matches (deviance 6.1+)
  - Line appears behind color dots to maintain visibility
  - Helps users visually understand which ideal harmony target the matched dye deviated from
  - Provides intuitive feedback about color relationships on the wheel

- **Zoom Functionality for Harmony Containers**
  - New Zoom In/Out buttons on each harmony section
  - Clicking Zoom In enlarges the harmony container to fill 90% of viewport (max 1200px width)
  - Background darkens with 80% opacity overlay and 4px blur effect
  - Color wheel automatically scales from 160px to 240px (50% larger) when zoomed using responsive SVG viewBox
  - Multiple ways to exit zoom:
    - Click Zoom Out button
    - Click anywhere on darkened backdrop
    - Press Escape key
  - Smooth animations (0.3s ease-out) for entering and exiting zoom
  - Body scroll disabled while zoomed to prevent confusion
  - All interactive features work correctly in zoomed view:
    - Color wheel tooltips display above zoomed content (z-index: 1002)
    - Deviance line visualization
    - Color wheel dot highlighting
    - Copy buttons and all interactions
  - Fully responsive with adjusted sizing for mobile devices (95vw on screens < 1024px)
  - Dark mode compatible with proper styling for backdrop and shadows

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

- **Color Matcher Tool Enhancements** (`colormatcher.html`)
  - **Dark Mode Support**
    - Toggle button with moon icon in header
    - Persists preference in localStorage
    - Matches Color Explorer's dark mode color scheme (#1f2937 background, #374151 containers)
    - All controls properly styled for both light and dark modes
    - File browser button darkens appropriately in dark mode
  - **Exclusion Filters**
    - Facewear colors automatically excluded from all suggestions (always on)
    - "Exclude Metallic Dyes" checkbox (optional)
    - "Exclude Pure White & Jet Black" checkbox (default: OFF)
    - All filters apply to color matching algorithm
  - **Advanced Zoom and Pan Controls**
    - Zoom In/Out buttons with live zoom percentage display (25% to 1000%)
    - **Zoom to Fit**: Scales image to fit entirely within wrapper (max 100%)
    - **Zoom to Width**: Scales image to fill wrapper width (ideal for portrait images)
    - Reset Zoom button returns to 100%
    - Keyboard shortcuts: `+` (zoom in), `-` (zoom out), `W` (zoom to width), `R` (reset)
    - Auto zoom to fit when loading large images (>wrapper dimensions)
  - **Mouse Controls**
    - **Shift+MouseWheel**: Zoom in/out smoothly
    - **Shift+LeftClickDrag**: Pan around zoomed images
    - **Shift+MiddleClick**: Zoom to fit
    - **Shift+RightClick**: Reset zoom to 100%
    - Cursor changes to "grabbing" during pan operations
    - Context menu suppressed during Shift+RightClick
  - **Image Management**
    - Clear Image button to remove loaded image
    - Canvas wrapper with flexbox centering for proper image alignment
    - Max canvas height: 700px (optimized for 1080p displays)
    - High-quality image smoothing for zoomed views
  - **UI/UX Improvements**
    - Footer moved outside main container to bottom of page
    - Container expanded to max-w-6xl (1152px) for better 1080p optimization
    - Updated instructions: "Hover and click on the image to pick a color. Use Shift+Left Drag to pan, Shift+Wheel to zoom."
    - All tooltips updated with keyboard/mouse shortcuts
    - Centered canvas alignment prevents left-aligned images in portrait mode

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
- New `showDevianceLine(hex, harmonyType, strokeColor)` and `hideDevianceLine(harmonyType)` functions for deviance line visualization
  - Creates SVG line element dynamically using `document.createElementNS()`
  - Positions line between base color dot and matched color dot using SVG circle coordinates
  - Accepts dynamic stroke color parameter to match badge color
  - Line inserted before color dots in DOM to maintain proper z-ordering
  - Removes any existing deviance line before creating new one to prevent duplicates
- New `zoomIn(harmonyType)` and `zoomOut()` functions for harmony container zoom
  - Uses CSS classes and fixed positioning to create modal-like zoom effect
  - Manipulates `overflow` property on body element to disable scrolling
  - Toggles visibility of zoom buttons using inline styles
  - Event listeners: onclick for backdrop, onkeydown (Escape key) for exiting zoom
- SVG color wheel updated to use `viewBox` instead of hardcoded width/height attributes
  - Enables responsive scaling with CSS while maintaining coordinate system
  - Inline styles provide default sizing that can be overridden by CSS
- CSS animations and transitions:
  - `.zoom-backdrop` with `fadeIn` keyframe animation (0.3s)
  - `.harmony-section.zoomed` with `zoomIn` keyframe animation (0.3s)
  - Color wheel CSS transitions for smooth scaling
  - Z-index layering: backdrop (1000), zoomed section (1001), tooltip (1002)
- Color wheels now include `data-harmony-type` attribute for proper scoping
- Color dots include `data-hex` attribute for identification
- Harmony sections include `.harmony-section` class and `data-harmony-type` attribute for zoom targeting
- `createColorSwatchHTML()` updated to accept `harmonyType` parameter and bind hover events
  - Deviance badges now include hover events (`onmouseenter`/`onmouseleave`) that trigger line visualization
  - Badge stroke color variable matches Tailwind CSS color values (green-500, yellow-500, red-500)
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
