# FFXIV Color Explorer

A web-based tool for Final Fantasy XIV players to explore dye colors and create harmonious color palettes for their in-game gear and housing projects.

## Features

### 🎨 Color Harmony Explorer
Generate color harmonies based on FFXIV's dye palette using established color theory principles:
- **Complementary** - Colors opposite on the color wheel
- **Analogous** - Colors adjacent on the color wheel
- **Triadic** - Three colors evenly spaced around the color wheel
- **Split-Complementary** - Base color plus two colors adjacent to its complement
- **Tetradic (Rectangular)** - Four colors in two complementary pairs
- **Square** - Four colors evenly spaced around the color wheel

### 🔍 Color Matcher
Upload an image or pick a color to find the closest matching FFXIV dye:
- Direct color picker for precise color selection
- Image upload with eyedropper tool
- Configurable sample size (1x1 to 64x64 pixels) for color averaging
- RGB Euclidean distance algorithm for accurate matching

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
Toggle between light and dark themes with persistent preference storage.

## Getting Started

### Online Access
Simply open `colorexplorer_stable.html` in any modern web browser. No installation or server required!

### Local Development
1. Clone this repository
2. Open `colorexplorer_stable.html` in your browser
3. For development, edit `colorexplorer_experimental.html` instead

The application is entirely client-side and requires no build process.

## Usage

### Finding Color Harmonies
1. Select a base color from the dropdown or use the search bar
2. Choose your desired data center/world for market prices
3. Configure your exclusion filters as needed
4. Click "Refresh Market Prices" to fetch current market data
5. Explore the generated color harmonies displayed below
6. Export your favorite palettes or copy hex codes

### Matching Colors from Images
1. Open `colormatcher.html`
2. Upload an image or drag-and-drop
3. Click on the image to sample colors
4. Adjust sample size for different matching precision
5. View the closest matching FFXIV dye

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
