# CLAUDE.md - XIV Dye Tools Quick Reference

Quick reference guide for developers working with XIV Dye Tools v2.0.0. For detailed information, see the `docs/` folder.

## Project Overview

XIV Dye Tools is a client-side web application providing five specialized tools for Final Fantasy XIV players:

1. **Color Accessibility Checker** - Simulate colorblindness (5 vision types)
2. **Color Harmony Explorer** - Generate color palettes using color theory
3. **Color Matcher** - Upload images and find matching FFXIV dyes
4. **Dye Comparison** - Compare up to 4 dyes with visualizations
5. **Dye Mixer** - Find intermediate dyes for color transitions

**Status**: v2.0.0 Production (TypeScript/Vite/Lit)
**Repository**: Main branch
**Latest**: 2025-11-18

---

## 📚 Documentation Structure

This file is a **quick reference**. For detailed information, see:

| Document | Purpose |
|----------|---------|
| **[docs/README.md](docs/README.md)** | Documentation index & navigation |
| **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** | System design, file structure, workflows |
| **[docs/SERVICES.md](docs/SERVICES.md)** | Service layer, APIs, error handling |
| **[docs/TOOLS.md](docs/TOOLS.md)** | Tool descriptions, algorithms, test scenarios |
| **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** | Common issues, gotchas, solutions |
| **[README.md](README.md)** | User-facing features |
| **[CHANGELOG.md](CHANGELOG.md)** | Version history |

---

## Quick Commands

### Development Server
```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run test         # Run all tests (499+)
npm run lint         # Check code style
```

### Before Committing
```bash
npm run lint         # ✓ Code style passes
npm run test         # ✓ All tests pass
npm run build        # ✓ Build succeeds
npm run preview      # ✓ Preview without errors
```

### Browser Testing Checklist
- [ ] Chrome (primary)
- [ ] Firefox (secondary)
- [ ] Safari (last - quirks likely)
- [ ] All 12 themes (light/dark variants)
- [ ] Responsive: 375px, 768px, 1024px
- [ ] Console: 0 errors, 0 warnings
- [ ] localStorage: Refresh → settings persist

---

## Common Gotchas

**⚠️ Never hardcode colors** - Use CSS variables: `var(--theme-primary)` not `#3B82F6`

**⚠️ Services are singletons** - Changing ColorService affects ALL tools. Test them all.

**⚠️ Always use `npm run dev`** - Never open `dist/index.html` directly (CORS issues)

**⚠️ Version numbers sync** - Update: package.json, README.md, CHANGELOG.md, docs/, CLAUDE.md

For details, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

---

## Development Patterns

### Adding a Feature to a Tool
```bash
1. Edit: src/components/[tool-name].ts
2. Update tests if needed: src/services/__tests__/
3. npm run test
4. npm run dev
5. Commit: "Feature: Description (ToolName)"
```

### Updating a Shared Service
```bash
1. Edit: src/services/[service-name].ts
2. Add tests: src/services/__tests__/
3. npm run test
4. Test ALL tools using service in dev
5. npm run build && npm run preview
6. Commit: "Service: Description (ServiceName)"
```

### Adding localStorage to a Feature
```typescript
import { StorageService } from './services/storage-service';

// Reading
const value = StorageService.getItem('xivdyetools_mykey', 'default');

// Writing
StorageService.setItem('xivdyetools_mykey', newValue);

// In component init
connectedCallback() {
  const saved = StorageService.getItem('xivdyetools_mykey', 'default');
  this.restoreState(saved);
}
```

### Adding a New Theme
```bash
1. Add CSS to: src/styles/themes.css
2. Update: src/shared/constants.ts
3. Add option to: src/components/theme-switcher.ts
4. Test in: npm run dev
5. Commit: "Theme: Add [ThemeName]"
```

---

## Version Management

**Current Version**: v2.0.0
**Released**: November 18, 2025
**Status**: Production

### Bumping Version (v2.0.0 → v2.1.0)

```bash
npm version minor          # Updates package.json + creates git tag

# Update all docs
grep -r "v2\.0\.0" *.md docs/  # Find all references
# Replace with v2.1.0

# Add to CHANGELOG.md
## v2.1.0 - November XX, 2025
- New features
- Bug fixes

git add .
git commit -m "Release: v2.1.0 - [description]"
git tag v2.1.0
git push origin main --tags
```

---

## Browser Support

**Supported**: Chrome, Firefox, Safari, Edge
**Requires**: ES6+ (arrow functions, fetch, Canvas 2D)

All modern browsers with ES6 support work. Chrome is primary, Safari may have quirks.

---

## Service Dependencies

```
DyeService        → Used by: Harmony, Matcher, Comparison, Mixer
ColorService      → Used by: All tools
APIService        → Used by: Harmony, Matcher, Comparison
ThemeService      → Used by: All tools + app-layout
StorageService    → Used by: All services + components
```

If you modify a service, test all tools that use it.

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/components/app-layout.ts` | App shell & navigation |
| `src/services/color-service.ts` | Core color algorithms |
| `src/services/dye-service.ts` | Dye database |
| `src/services/theme-service.ts` | Theme management |
| `src/styles/themes.css` | 12 theme colors |
| `src/shared/constants.ts` | App configuration |
| `src/assets/json/colors_xiv.json` | Dye database (~125 dyes) |

---

## Important Notes

**localStorage Keys** (`xivdyetools_*`):
- `theme` - Current theme name
- `dual_dyes` - Accessibility Checker toggle
- `harmony_filters` - Harmony filter prefs
- `harmony_suggestions_mode` - Simple/Expanded
- `harmony_companion_dyes` - Companion count (1-3)

**Bundle Size**: ~7-30 KB per tool (gzipped)

**Test Coverage**: 499+ tests, 100% pass rate

**TypeScript**: Strict mode enabled

---

## Related Documentation

- **[docs/README.md](docs/README.md)** - Start here for navigation
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design & workflows
- **[docs/SERVICES.md](docs/SERVICES.md)** - Service layer & APIs
- **[docs/TOOLS.md](docs/TOOLS.md)** - Tool algorithms & features
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Problems & solutions

---

**Last Updated**: November 18, 2025
**Version**: v2.0.0
