# XIV Dye Tools - Frequently Asked Questions

## General Questions

**Q: What are XIV Dye Tools?**
A: XIV Dye Tools is a free suite of five client-side web utilities designed to help FFXIV players with color and dye management. The tools include Dye Mixer, Color Accessibility Checker, Color Harmony Explorer, Color Matcher, and Dye Comparison—all available at https://xivdyetools.projectgalatine.com/

**Q: What's the current version?**
A: Version **v2.0.7** (released December 2025). This version includes test coverage improvements, theme system updates, Color Matcher enhancements with copy hex functionality, and improved Theme Editor with WCAG matrix toggles. See the CHANGELOG.md for detailed release notes.

**Q: Do these tools cost money?**
A: No, all tools are completely free with no ads, paywalls, or premium features.

**Q: Is there an app version?**
A: Not currently. The tools are web-based and optimized for desktop browsers. You can use them on mobile, but the experience is better on larger screens.

**Q: How are these tools made? Is AI involved?**
A: The tools were developed with AI assistance, built using vanilla JavaScript. The code is open source and available on GitHub (https://github.com/FlashGalatine/xivdyetools) under the MIT license.

**Q: Who made these tools?**
A: XIV Dye Tools was created by Flash Galatine (Balmung) as a passion project for the FFXIV community.

**Q: Why did v2.0.0 change my saved settings?**
A: Version v2.0.0 migrated from the monolithic HTML architecture to a modern TypeScript/Vite-based system. This required updating how settings are stored. All localStorage keys now follow a consistent naming pattern (`xivdyetools_[setting]`). Your settings will need to be reconfigured on first load, but future updates will preserve them. We apologize for the inconvenience—this was a necessary refactor for long-term code quality and performance.

---

## Technical & Privacy

**Q: Will my data be sent to a server?**
A: No. All processing happens in your browser (client-side only). We do not collect, store, or track any personal data. The only external API call is optional—when you enable "Show Market Prices," we fetch real-time dye pricing from Universalis.

**Q: Which browsers are supported?**
A: Chrome, Edge, Firefox, Safari, and Opera. Any modern browser with ES6+ support will work.

**Q: Can I use these tools offline?**
A: Yes! Most features work offline. Market board pricing requires an internet connection, but all other features (harmony generation, color matching, dye comparison) work without internet.

**Q: Is my dark mode preference saved?**
A: Yes, dark mode preference is stored locally in your browser using localStorage. It persists across sessions.

---

## Dye Mixer

**Q: What does the Dye Mixer do?**
A: The Dye Mixer finds smooth color transitions between two dyes by interpolating through HSV color space. You select a starting dye and ending dye, choose how many intermediate dyes you want (3, 4, 7, or 9), and the tool recommends the closest matching FFXIV dyes for each step of the gradient.

**Q: Why use HSV instead of RGB for interpolation?**
A: HSV (Hue, Saturation, Value) color space produces more natural-looking gradients because it follows human color perception better than RGB. HSV transitions tend to feel more harmonious and less "artificial" than RGB interpolation.

**Q: What is the "Deviance Rating"?**
A: The deviance rating (0-10 scale) measures how closely each recommended dye matches its theoretical position in the gradient. 0 = perfect match, 10 = poor match. Green (0-3) is excellent, Blue (4-6) is good, Orange (7-8) is fair, Red (9-10) is poor. Lower deviance = better color matching.

**Q: Can I save my favorite gradients?**
A: Yes! Click "Save Gradient" to store unlimited gradients with custom names. They're saved to your browser's localStorage and persist across sessions. You can load, view creation date/time, and delete any saved gradient.

**Q: How do I share a gradient with someone else?**
A: Click "Copy Share URL" to get a link that includes all your gradient settings (starting dye, ending dye, number of intermediate dyes, and filter settings). Anyone who opens that link will see your exact gradient configuration.

**Q: What are the dye exclusion filters?**
A: Four filters let you exclude specific dye types from recommendations:
- **Exclude Metallic Dyes** - Removes dyes with "Metallic" in the name
- **Exclude Pastel Dyes** - Removes dyes with "Pastel" in the name
- **Exclude Dark Dyes** - Removes dyes with "Dark" in the name
- **Exclude Cosmic Dyes** - Removes dyes from Cosmic Exploration or Cosmic Fortunes

When you save a gradient or generate a share URL, your filter settings are included.

**Q: What is the "Acquisition" information?**
A: When hovering over a dye card in the recommendations, the Acquisition field shows how to obtain that dye (e.g., "Dye Vendor", "Cosmic Exploration", "Treasure Chest"). This is useful when market board data is unavailable.

**Q: Does the market board pricing work without internet?**
A: No, market board data requires internet. If you can't connect to the Universalis API, the tool shows "Connection failed" but still displays recommendations—you just won't see prices.

**Q: Can I export my gradients?**
A: Currently, saved gradients are stored in your browser's localStorage. You can share them via the "Copy Share URL" feature, but direct export as files is not yet available.

---

## Color Harmony Explorer

**Q: What are the 6 harmony types?**
A: The tool generates Complementary, Analogous, Triadic, Tetradic, Split-Complementary, and Square harmony types based on color theory.

**Q: What does "Deviance Rating" mean?**
A: The deviance rating (0-10 scale) shows how closely a matched FFXIV dye aligns with the ideal color from color theory. Lower numbers = better match to theory.

**Q: Can I export the color palettes?**
A: Yes! You can export harmonies as JSON, CSS, or SCSS files.

**Q: Why don't all colors have perfect matches?**
A: The FFXIV dye palette (125 dyes) is limited, so some theoretical color harmonies don't have exact matches. The deviance rating helps you see the closest available options.

---

## Color Matcher

**Q: What image formats are supported?**
A: PNG, JPG, GIF, WebP, and most common image formats. Drag-and-drop or use the file picker.

**Q: How does color matching work?**
A: The tool uses RGB Euclidean distance (sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²)) to find the closest matching dyes.

**Q: What's "Smart Sampling"?**
A: You can configure sample size (1x1 to 64x64 pixels) to average colors from a region of the image, making it easier to sample complex areas.

**Q: What do the zoom controls do?**
A: You can zoom up to 1000% with keyboard shortcuts (+ to zoom in, - to zoom out, W for width fit, R to reset) or mouse controls (Shift+MouseWheel).

**Q: Why are some dyes filtered out?**
A: Facewear colors are always excluded (they're cosmetic-only). You can optionally exclude Metallic dyes, Pure White, and Jet Black via toggle filters.

**Q: What's "Intelligent Auto Zoom"?**
A: Portrait images automatically zoom to fit width, while landscape images zoom to fit the canvas. This optimizes visibility for different image orientations.

---

## Dye Comparison

**Q: Can I compare more than 4 dyes?**
A: The tool is optimized for up to 4 dyes to keep the interface readable. You can compare different sets by clearing and re-adding dyes.

**Q: What does the Color Distance Matrix show?**
A: It displays Euclidean color distance between each pair of selected dyes. Green (<50) = very similar, Yellow (50-99) = similar, Red (≥100) = dissimilar.

**Q: What information is shown for each dye?**
A: Name, category, hex code, RGB values, HSV values, acquisition method, and current market price (if enabled).

**Q: Can I export the comparison?**
A: Yes! You can export comparison data as JSON or CSS, and copy hex codes to clipboard.

**Q: What are the Hue-Saturation and Brightness charts?**
A: Hue-Saturation shows dyes plotted in a 2D space (hue vs. saturation). Brightness shows color lightness on a linear scale. Both update dynamically as you select/deselect dyes.

---

## Market Board & Pricing

**Q: Where does the market price data come from?**
A: Real-time pricing from Universalis API (https://universalis.app/), a community-run market board aggregator.

**Q: Which data centers are supported?**
A: All FFXIV data centers (North America, Europe, Japan, Oceania) and their worlds.

**Q: Are prices updated in real-time?**
A: Prices are cached to reduce API calls. Refresh the page to get the latest prices.

**Q: What if a dye is unavailable on the market board?**
A: It will show the default NPC vendor price or note if no pricing data is available.

---

## Troubleshooting

**Q: The tool is loading slowly. What should I do?**
A: The dye database (~125 dyes) loads on first use. Refresh the page. If issues persist, check your internet connection or try a different browser.

**Q: Color Matcher isn't detecting colors from my image correctly.**
A: Try adjusting the sample size or picking a different area of the image. Different image compression can affect color accuracy. Using a reference image with clear, solid colors works best.

**Q: My dark mode preference isn't saving.**
A: Check if your browser allows localStorage (it's usually enabled by default). Some private browsing modes disable this.

**Q: Market board prices aren't showing.**
A: Make sure you've enabled "Show Market Prices" and have internet connection. Prices only appear when both conditions are met.

**Q: What if I find a bug?**
A: Report it on GitHub (https://github.com/FlashGalatine/xivdyetools/issues) or join our Discord (https://discord.gg/5VUSKTZCe5) for support.

---

## Accessibility & Features

**Q: Is there a colorblindness simulator?**
A: Yes! Color Accessibility Checker (v2.0.0) simulates deuteranopia, protanopia, tritanopia, and monochrome vision. This helps ensure your glamour choices are distinguishable for all players.

**Q: What languages are supported?**
A: Currently English only, but the tools are language-agnostic for most features (color data is universal).

**Q: Can I use these tools for commercial purposes?**
A: The tools are free for personal use. For commercial use, check the MIT license terms or contact the creator.

**Q: How often is the dye database updated?**
A: The database is updated whenever new FFXIV dyes are released. Check back occasionally or follow me on social media for updates (links below).

---

## Code Quality & Contributions

**Q: How is the codebase organized?**
A: Each tool is a single self-contained HTML file (~1,500-1,900 lines) with embedded CSS and JavaScript. This "monolithic" design has several benefits:
- No build process required—pure vanilla HTML/CSS/JavaScript
- Easy for users to download and inspect individual tools
- Shared utilities are centralized in `shared-components.js` to reduce duplication
- All styling uses Tailwind CSS and custom theme variables

**Q: Can I contribute to XIV Dye Tools?**
A: Yes! The project is open source under the MIT license. Since there's no complex build process, you can easily modify and test the tools locally. Check out the GitHub repository (https://github.com/FlashGalatine/xivdyetools) and CLAUDE.md for development guidelines.

**Q: How are duplicate functions handled across tools?**
A: Version v2.0.0 eliminated code duplication by refactoring the monolithic HTML files into modular TypeScript components and services. All tools now reference a single implementation from the service layer for:
- Color conversion functions (hexToRgb, rgbToHex, rgbToHsv, hsvToRgb)
- Color distance calculations (Euclidean RGB space)
- Storage functions (safeGetStorage, safeSetStorage)
- JSON fetching with validation (safeFetchJSON)
- Theme management

This "single source of truth" approach makes the codebase easier to maintain and update.

**Q: What naming conventions does the codebase follow?**
A: All tools use consistent conventions:
- **Data Variables**: `ffxivDyes` for the dye database (all tools)
- **localStorage Keys**: `xivdyetools_[toolname]_[setting]` (e.g., `xivdyetools_coloraccessibility_secondaryDyes`)
- **Functions**: camelCase with JSDoc comments documenting parameters and return types
- **CSS Classes**: Combination of Tailwind utilities and custom classes for theme-aware styling

**Q: Where can I find documentation for developers?**
A: Check these files in the repository:
- **CLAUDE.md** - Detailed architecture guide, common patterns, and testing procedures
- **CHANGELOG.md** - Complete version history with technical details for each release
- **README.md** - User-facing documentation with feature descriptions and usage examples
- **TAILWIND_SETUP.md** - Guide for CSS modifications and theme system
- **historical/** - Folder with past phase documentation for reference

---

## Contact & Support

**Q: How do I report bugs or request features?**
A: Use GitHub Issues (https://github.com/FlashGalatine/xivdyetools/issues) or join the Discord server (https://discord.gg/5VUSKTZCe5).

**Q: Where can I find the source code?**
A: GitHub: https://github.com/FlashGalatine/xivdyetools

**Q: Are there social media accounts I can follow?**
A: Yes! You can find me on:

- **Twitter/X**: https://x.com/AsheJunius
- **BlueSky**: https://bsky.app/profile/projectgalatine.com
- **Twitch**: https://www.twitch.tv/flashgalatine
- **Blog**: https://blog.projectgalatine.com/
- **GitHub**: https://github.com/FlashGalatine/xivdyetools
- **Discord**: https://discord.gg/5VUSKTZCe5

**Q: Can I donate or support this project?**
A: Join the Patreon (https://patreon.com/ProjectGalatine) to support ongoing development!
