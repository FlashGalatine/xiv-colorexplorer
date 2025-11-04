# XIV Dye Tools - Frequently Asked Questions

## General Questions

**Q: What are XIV Dye Tools?**
A: XIV Dye Tools is a free suite of three client-side web utilities designed to help FFXIV players with color and dye management. The tools include Color Harmony Explorer, Color Matcher, and Dye Comparison—all available at https://xivdyetools.projectgalatine.com/

**Q: Do these tools cost money?**
A: No, all tools are completely free with no ads, paywalls, or premium features.

**Q: Is there an app version?**
A: Not currently. The tools are web-based and optimized for desktop browsers. You can use them on mobile, but the experience is better on larger screens.

**Q: How are these tools made? Is AI involved?**
A: The tools were developed with AI assistance, built using vanilla JavaScript. The code is open source and available on GitHub (https://github.com/FlashGalatine/xivdyetools) under the MIT license.

**Q: Who made these tools?**
A: XIV Dye Tools was created by Flash Galatine (Balmung) as a passion project for the FFXIV community.

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
A: Yes! Color Accessibility Checker (BETA v1.0.0) simulates deuteranopia, protanopia, tritanopia, and monochrome vision. This helps ensure your glamour choices are distinguishable for all players.

**Q: What languages are supported?**
A: Currently English only, but the tools are language-agnostic for most features (color data is universal).

**Q: Can I use these tools for commercial purposes?**
A: The tools are free for personal use. For commercial use, check the MIT license terms or contact the creator.

**Q: How often is the dye database updated?**
A: The database is updated whenever new FFXIV dyes are released. Check back occasionally or follow @ProjectGalatine on social media for updates.

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
