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
**Latest**: 2025-11-18 (Updated with --theme-text-header support)

---

## Architecture: v2.0.0 TypeScript + Vite + Lit

### Modern Component-Based Architecture

v2.0.0 uses a modern TypeScript + Lit component architecture with a service layer pattern:

**Key Benefits**:
- **Type Safety**: Full TypeScript with strict mode enabled
- **Modular Design**: Service layer + component layer separation of concerns
- **Build Optimization**: Vite for fast development and optimized production builds
- **No Duplication**: Shared services used across all tools
- **Easy Testing**: Unit tests for all services and components (514 tests, 100% pass rate)
- **Theme System**: 12 customizable themes with `--theme-text-header` for header text colors
- **Framework Agnostic**: Lit for web components, framework-independent

**Legacy Files**: Original monolithic HTML files (v1.6.x) preserved in `legacy/` folder for historical reference. See `docs/ARCHITECTURE.md` for migration details.

### File Organization

```
src/
├── main.ts                    # Application entry point
├── components/                 # Lit web components
│   ├── app-layout.ts          # Main application shell
│   ├── accessibility-checker-tool.ts
│   ├── color-matcher-tool.ts
│   ├── dye-comparison-tool.ts
│   ├── dye-mixer-tool.ts
│   ├── harmony-generator-tool.ts
│   ├── base-component.ts     # Base class for all components
│   └── [other UI components]
├── services/                   # Business logic layer (singletons)
│   ├── api-service.ts         # Universalis API integration
│   ├── color-service.ts        # Color algorithms
│   ├── dye-service.ts         # Dye database management
│   ├── storage-service.ts     # localStorage wrapper
│   └── theme-service.ts       # Theme management
├── shared/                     # Shared utilities
│   ├── constants.ts           # Application constants
│   ├── types.ts               # TypeScript type definitions
│   └── utils.ts               # Helper functions
├── styles/                     # Styling
│   ├── globals.css            # Global styles
│   ├── themes.css             # 12 theme CSS variables
│   └── tailwind.css           # Tailwind imports
└── data/                       # Static data files
    └── json/                   # Dye database, data centers, worlds
```

**Legacy Files**: `legacy/` folder contains original v1.6.x monolithic HTML files (no longer maintained).

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
npm run test         # Run all tests (514+)
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

**⚠️ Color Matcher zoom** - Mouse wheel zoom now requires holding `Shift`; testers should note this when verifying scroll + pan interactions.

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

## Theme Tokens & Layout

- Three primary surfaces: `--theme-background` (page chrome), `--theme-card-background` (cards/panels), `--theme-card-hover` (hover/focus).
- `app-layout` exposes `.app-shell`, `.app-header`, `.app-footer` so you never reapply `bg-white` / `dark:bg-gray-900` manually.
- See `docs/STYLE_GUIDE.md` for details on sticky header styling, hover remapping, and 375 px flex patterns.

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

## v2.0.0 Migration from v1.6.x

### Key Architectural Changes

**v1.6.x (Monolithic)**:
- Single HTML file per tool (1,500-1,900 lines)
- Inline JavaScript and CSS
- No build process (direct file serving)
- Code duplication across tools
- Experimental/stable file copies

**v2.0.0 (Modular)**:
- TypeScript + Lit components
- Service layer pattern (singletons)
- Vite build system
- Shared codebase (no duplication)
- Single codebase (no experimental/stable split)

### Migration Path

1. **Development**: Use `npm run dev` instead of Python HTTP server
2. **Build**: Run `npm run build` to generate production files
3. **Testing**: Use `npm run test` (Vitest) instead of manual browser testing
4. **File Locations**: All code moved to `src/` folder structure
5. **Legacy Files**: Original HTML files preserved in `legacy/` folder

### For Contributors

- **New Features**: Add to `src/components/` (not `legacy/`)
- **Services**: Modify `src/services/` (affects all tools)
- **Themes**: Update `src/styles/themes.css`
- **Documentation**: See `docs/` folder for detailed guides

**Historical Documentation**: See `historical/` folder for v1.x development history and phase documentation.

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

**Test Coverage**: 514 tests, 100% pass rate

**TypeScript**: Strict mode enabled

**Privacy**: Image + color tools are 100% client-side. See `docs/PRIVACY.md` if you add new capture/upload features.

---

## Related Documentation

- **[docs/README.md](docs/README.md)** - Start here for navigation
- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design & workflows
- **[docs/SERVICES.md](docs/SERVICES.md)** - Service layer & APIs
- **[docs/TOOLS.md](docs/TOOLS.md)** - Tool algorithms & features
- **[docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md)** - Theme tokens, hover rules, responsive patterns
- **[docs/PRIVACY.md](docs/PRIVACY.md)** - Data-handling guarantees
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Problems & solutions

---

**Last Updated**: November 18, 2025
**Version**: v2.0.0
**Latest Changes**: Added `--theme-text-header` CSS variable for customizable header text colors
