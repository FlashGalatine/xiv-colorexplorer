# Current Issues and Suggestions with the XIV Dye Tools

> **Found a bug or have a suggestion?**
>
> Please report issues on **[GitHub Issues](https://github.com/FlashGalatine/xivdyetools-web-app/issues)** or discuss on **[Discord](https://discord.gg/5VUSKTZCe5)**.
>
> Community feedback helps us improve the tools for everyone! ✨

---

## ✅ Resolved in v2.0.0 (November 18, 2025)

- **Sticky header + theme tokens**: Header/footers now use `--theme-primary`, Standard Light = `#781A1A`, Standard Dark = `#C99156` with deeper card backgrounds, and hover states pull from the new `--theme-card-hover` variable.
- **Background vs. card clarification**: `--theme-background` only drives the `app-shell`/body, while `--theme-card-background` handles cards. Documented in `docs/STYLE_GUIDE.md`.
- **Harmony Explorer math**: Triadic, tetradic, square, compound, and split-complementary harmonies share a new hue-offset helper; companion dyes render correctly and the color wheel reflects the same angles. Regression tests added in `harmony-generator-tool.test.ts`.
- **Color Matcher UX**: Minimum zoom lowered to 10%, Shift+Scroll required for wheel zoom, and a privacy notice (linking to `docs/PRIVACY.md`) confirms images never leave the browser.
- **375px mobile overflow**: The Generate + Clear button rows now stack vertically on small screens (affects Harmony Explorer, Accessibility Checker, Dye Comparison, Dye Mixer, and any tool embedding `dye-selector`).
- **Market Board integration**: Already present across tools; documentation updated to highlight this so it is no longer treated as a missing feature.

---

## 🚧 Outstanding Feedback & Suggestions

### Tools Navigation / Theme Switcher
- Resort the theme list alphabetically for non-standard themes (UI polish).

### Harmony Explorer
- *Anomaly*: Some users report that hovering certain dots nudges them slightly off the donut canvas. Needs targeted repro steps.

### Color Matcher
- *Suggestion*: Reintroduce the v1.6.x “Camera Upload” option on mobile (under investigation in TODO Task 17).

### Dye Mixer / Comparison / Accessibility
- No open bugs, but keep testing mobile breakpoints whenever new controls are added.