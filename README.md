# FFXIV Color Explorer

A comprehensive web-based toolset for Final Fantasy XIV players to explore dye colors, create harmonious color palettes, and match colors from images for in-game gear and housing projects.

**Two Powerful Tools:**
- **Color Harmony Explorer** - Generate color palettes based on color theory principles
- **Color Matcher** - Upload images and find the closest matching FFXIV dyes

## Features

### 🎨 Color Harmony Explorer (v1.1.0)
Generate color harmonies based on FFXIV's dye palette using established color theory principles:
- **Complementary** - Colors opposite on the color wheel
- **Analogous** - Colors adjacent on the color wheel
- **Triadic** - Three colors evenly spaced around the color wheel
- **Split-Complementary** - Base color plus two colors adjacent to its complement
- **Tetradic (Rectangular)** - Four colors in two complementary pairs
- **Square** - Four colors evenly spaced around the color wheel

**Interactive Features:**
- **Color Wheel Highlighting** - Hover over color swatches to see their position illuminated on the color wheel
- **Deviance Rating System** - 0-10 scale showing how closely matched dyes align with ideal color theory (green = excellent, yellow = good, red = poor)
- **Deviance Line Visualization** - Hover over deviance badges to see lines connecting base colors to matched colors on the wheel
- **Zoom Functionality** - Enlarge any harmony section for detailed viewing with Zoom In/Out buttons, Escape key to exit, or click backdrop
- **Two-Column Layout** - Optimized for 1080p displays with sticky sidebar containing all controls and 2-column harmony results grid
- **Version Display** - Shows v1.1.0 (stable) or v1.2.0-dev (experimental) in page header

### 🔍 Color Matcher (v1.1.0)
Upload an image or pick a color to find the closest matching FFXIV dye:
- Direct color picker for precise color selection
- Image upload with eyedropper tool (drag-and-drop supported)
- Configurable sample size (1x1 to 64x64 pixels) for color averaging
- RGB Euclidean distance algorithm for accurate matching

**Advanced Image Controls:**
- **Zoom Controls** - Zoom In/Out (25%-1000%), Zoom to Fit, Zoom to Width (ideal for portrait images), Reset to 100%
- **Keyboard Shortcuts** - `+` zoom in, `-` zoom out, `W` zoom to width, `R` reset zoom
- **Mouse Controls** - Shift+MouseWheel (zoom), Shift+LeftClickDrag (pan), Shift+MiddleClick (zoom to fit), Shift+RightClick (reset zoom)
- **Auto Zoom to Fit** - Automatically scales large images (>wrapper size) for optimal viewing
- **Clear Image Button** - Remove loaded image with one click
- **Centered Canvas** - Images properly centered regardless of orientation or size

**Intelligent Filtering:**
- **Facewear Colors** - Automatically excluded from all suggestions
- **Exclude Metallic Dyes** - Optional checkbox to remove metallic finishes from results
- **Exclude Pure White & Jet Black** - Optional checkbox (default: OFF) for extreme colors

**Dark Mode Support:**
- Toggle button with moon icon in header
- Persistent preference storage
- Matches Color Explorer's dark mode theme
- All controls styled for both light and dark modes

### 💰 Market Board Integration
Fetch real-time dye prices from the Universalis API:
- Support for all FFXIV data centers and worlds
- Selective price fetching by dye category (Base, Craft, Beast Tribe, Cosmic, Special)
- Automatic price caching to reduce API calls
- Toggle between original acquisition methods and market prices

### 🎯 Advanced Filtering
Customize your color exploration:
- Filter by acquisition method (vendors, crafting, ventures, etc.)
- Exclude metallic dyes from results
- Exclude facewear-specific colors
- Exclude Jet Black and Pure White for more nuanced palettes
- Search colors by name, category, or hex code

### 📤 Export Options
Save your color palettes in multiple formats:
- JSON export with complete palette data
- CSS custom properties (variables)
- SCSS variables
- Copy individual or all hex codes to clipboard

### 🌓 Dark Mode
Toggle between light and dark themes with persistent preference storage. Available in both Color Harmony Explorer and Color Matcher with consistent styling across all UI elements.

## Getting Started

### Online Access
- **Color Harmony Explorer (Stable)**: Open `index.html` in any modern web browser
- **Color Harmony Explorer (Experimental)**: Open `colorexplorer_experimental.html` for latest features
- **Color Matcher**: Open `colormatcher.html` for image-based color matching
- Navigate between tools using the links in each page's header

No installation or server required! All tools work directly in your browser.

### Local Development
1. Clone this repository
2. Open `index.html` in your browser to access the stable Color Harmony Explorer
3. For development of new features, edit `colorexplorer_experimental.html`
4. The Color Matcher (`colormatcher.html`) shares the same version as the stable explorer

The application is entirely client-side and requires no build process or dependencies.

## Usage

### Finding Color Harmonies
1. **Select a Base Color** - Choose from the dropdown or use the search bar in the left sidebar
2. **Configure Filters** - Set acquisition method filters and exclusion options (metallic, facewear, extremes)
3. **Set Market Board** - Choose your data center/world and select which dye categories to price
4. **Fetch Prices** - Click "Refresh Market Prices" to get current market data (optional)
5. **Explore Harmonies** - View 6 color harmony types with interactive color wheels in the right panel
6. **Interact with Results**:
   - Hover over swatches to highlight their position on the color wheel
   - Hover over deviance badges to see visual connections between colors
   - Click Zoom In button to enlarge any harmony section for detailed viewing
7. **Export or Copy** - Save palettes as JSON, CSS, or SCSS, or copy hex codes to clipboard

### Matching Colors from Images
1. **Access Tool** - Click "Color Matcher Tool →" link or open `colormatcher.html`
2. **Load Image** - Upload an image, drag-and-drop, or use the color picker for direct color selection
3. **Configure Options**:
   - Set sample size (1x1 to 64x64) for color averaging
   - Enable/disable metallic dyes filter
   - Enable/disable Pure White & Jet Black filter (Facewear colors always excluded)
4. **Navigate Large Images**:
   - Use Zoom buttons or keyboard shortcuts (`+`, `-`, `W`, `R`)
   - Use Shift+MouseWheel to zoom smoothly
   - Use Shift+LeftClickDrag to pan around zoomed images
   - Click "Fit" or "Width" for optimal viewing of different image orientations
5. **Sample Colors** - Hover and click on the image to pick colors
6. **View Results** - See your selected color and the closest matching FFXIV dye side-by-side

## Data Sources

- **Color Data**: Complete FFXIV dye database with RGB, HSV, hex values, and acquisition methods
- **Market Prices**: Real-time data from [Universalis API](https://universalis.app/)
- **Server Data**: FFXIV data centers and world information

## Technology Stack

- Pure HTML/CSS/JavaScript (no framework dependencies)
- [Tailwind CSS](https://tailwindcss.com/) via CDN for styling
- [Universalis API](https://universalis.app/) for market board data
- localStorage for user preferences

## Browser Compatibility

Works in all modern browsers supporting ES6+:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **Flash Galatine** (Balmung)

- [Lodestone](https://na.finalfantasyxiv.com/lodestone/character/7677106/)
- [Blog](https://blog.projectgalatine.com/)
- [GitHub](https://github.com/FlashGalatine)
- [X / Twitter](https://x.com/AsheJunius)
- [Twitch](https://www.twitch.tv/flashgalatine)
- [BlueSky](https://bsky.app/profile/flashgalatine.bsky.social)
- [Patreon](https://patreon.com/ProjectGalatine)

## Acknowledgments

- Color harmony algorithms based on traditional color theory
- Market board data provided by [Universalis](https://universalis.app/)
- FFXIV game data is property of Square Enix Co., Ltd.
- Built with love for Eorzea's fashionistas ✨

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by Square Enix Co., Ltd. FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
