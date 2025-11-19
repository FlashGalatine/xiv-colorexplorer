# Theme Editor - Development Tool

A standalone HTML tool for editing XIV Dye Tools themes. This is for **development use only** and is not part of the production build.

## Features

- 🎨 **Visual Color Editor**: Click color swatches to open a color picker
- 🔄 **Live Preview**: See changes in real-time as you edit colors
- 📋 **CSS Export**: Copy generated CSS directly to clipboard
- 💾 **Import/Export**: Save and load themes as JSON files
- 🎯 **All 8 Theme Colors**: Edit primary, background, text, border, and more
- 🌈 **10 Theme Variants**: Edit any of the 10 light/dark theme combinations

## Usage

1. **Open the editor**: Simply open `theme-editor.html` in your browser (no server needed)

2. **Select a theme**: Choose which theme to edit from the dropdown

3. **Edit colors**: 
   - Click any color swatch to open the color picker
   - Or type hex values directly into the input fields

4. **Preview**: See your changes in the live preview panel

5. **Export**:
   - **Copy CSS**: Click "Copy CSS" to copy the generated CSS to clipboard
   - **Export JSON**: Save your theme as a JSON file for backup/sharing
   - **Import JSON**: Load a previously saved theme

## Color Variables

Each theme has 8 color variables:

- **Primary**: Main accent color (buttons, links, highlights)
- **Background**: Main page background
- **Text**: Primary text color
- **Border**: Border and divider colors
- **Background Secondary**: Secondary background areas
- **Card Background**: Card and panel backgrounds
- **Card Hover**: Hover state for cards
- **Text Muted**: Muted/secondary text color

## Generated CSS Format

The editor generates CSS in this format:

```css
html.theme-standard-light {
  --theme-primary: #781A1A;
  --theme-background: #FFFFFF;
  --theme-text: #1F2937;
  --theme-border: #E5E7EB;
  --theme-background-secondary: #F3F4F6;
  --theme-card-background: #FFFFFF;
  --theme-card-hover: #F3F4F6;
  --theme-text-muted: #6B7280;
}
```

## Integration

After editing a theme:

1. Copy the generated CSS from the editor
2. Find the corresponding theme section in `src/styles/themes.css`
3. Replace the CSS variables in the `html.theme-{name}` selector
4. Update the theme palette in `src/services/theme-service.ts` (THEME_PALETTES object)

## Notes

- This tool is **not included** in the production build
- All changes are client-side only (no server needed)
- Themes are stored in browser memory (refresh to reset)
- Use "Load Default" to restore original theme values

