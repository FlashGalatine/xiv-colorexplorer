# XIV Dye Tools - System Architecture

System design, file organization, development workflow, and responsive design patterns for XIV Dye Tools v2.0.0.

---

## Architecture: v2.0.0 TypeScript + Vite + Lit

### Modern Component-Based Architecture

v2.0.0 refactored from monolithic HTML files to a modern TypeScript + Lit component architecture:

**Key Benefits**:
- **Type Safety**: Full TypeScript with strict mode enabled
- **Modular Design**: Service layer + component layer separation of concerns
- **Build Optimization**: Vite for fast development and optimized production builds
- **No Duplication**: Shared services used across all tools
- **Easy Testing**: Unit tests for all services (140 tests, 100% pass rate)
- **Framework Agnostic**: Lit for web components, framework-independent

**Legacy Files**: Original monolithic HTML files (v1.6.x) preserved in `legacy/` folder for historical reference

---

## File Organization (v2.0.0)

```
src/
├── main.ts                                         # Application entry point
├── index.html                                      # HTML shell
├── components/                                     # Lit web components
│   ├── app-layout.ts                              # Main application shell
│   ├── accessibility-checker-tool.ts              # Colorblindness simulator
│   ├── color-matcher-tool.ts                      # Image color matching
│   ├── dye-comparison-chart.ts                    # Multi-dye visualization
│   ├── dye-mixer-tool.ts                          # Color interpolation
│   ├── harmony-generator-tool.ts                  # Color harmony exploration
│   ├── base-component.ts                          # Base class for all components
│   ├── color-wheel-display.ts                     # Harmony visualization
│   ├── harmony-type.ts                            # Harmony type selector
│   ├── dye-selector.ts                            # Dye dropdown component
│   ├── theme-switcher.ts                          # Theme selection UI
│   ├── tools-dropdown.ts                          # Tools navigation
│   ├── mobile-bottom-nav.ts                       # Mobile navigation bar
│   └── index.ts                                   # Component exports
│
├── services/                                       # Business logic layer
│   ├── api-service.ts                             # Universalis API integration
│   ├── color-service.ts                           # Color algorithms (accessibility, harmony)
│   ├── dye-service.ts                             # Dye database management
│   ├── storage-service.ts                         # localStorage wrapper
│   ├── theme-service.ts                           # 10-theme system
│   └── __tests__/                                 # Unit tests (100% pass rate)
│
├── shared/                                         # Shared utilities
│   ├── constants.ts                               # Application constants
│   ├── types.ts                                   # TypeScript type definitions
│   └── utils.ts                                   # Helper functions
│
├── styles/                                         # Styling
│   ├── globals.css                                # Global styles
│   ├── themes.css                                 # 12 theme CSS variables
│   └── components.css                             # Component-specific styles
│
├── assets/
│   ├── json/
│   │   ├── colors_xiv.json                        # ~125 FFXIV dyes database
│   │   ├── data-centers.json                      # FFXIV data centers
│   │   └── worlds.json                            # FFXIV worlds per data center
│   └── icons/                                      # SVG and icon assets
│
├── public/                                         # Static assets
│   ├── favicon.ico
│   ├── favicon.png
│   └── logo.svg
│
├── dist/                                           # Build output (production)
├── package.json                                    # Dependencies and build scripts
├── vite.config.ts                                  # Vite configuration
├── tailwind.config.js                              # Tailwind CSS configuration
├── tsconfig.json                                   # TypeScript configuration
│
├── README.md                                       # User documentation
├── CHANGELOG.md                                    # Version history
├── FAQ.md                                          # User FAQs
├── CLAUDE.md                                       # Development quick reference
├── TODO.md                                         # Development roadmap
└── LICENSE                                         # MIT License

docs/                                               # Developer documentation
├── README.md                                       # Documentation index
├── ARCHITECTURE.md                                 # (This file) System design
├── SERVICES.md                                     # Service layer deep dive
├── TOOLS.md                                        # Individual tool descriptions
└── TROUBLESHOOTING.md                              # Common issues & solutions
```

### Legacy Files (v1.6.x)

**Location**: `legacy/` folder contains original monolithic HTML files:
- `legacy/coloraccessibility_stable.html`
- `legacy/colorexplorer_stable.html`
- `legacy/colormatcher_stable.html`
- `legacy/dyecomparison_stable.html`
- `legacy/dye-mixer_stable.html`
- (+ experimental versions)

These are preserved for historical reference and comparison but are **not actively maintained**.

---

## Development Workflow (v2.0.0)

### Testing Checklist Before Committing

**No experimental/stable branching needed** - TypeScript build system provides testing separation:

**Testing Checklist**:
- [ ] Works in Chrome, Firefox, Safari, Edge
- [ ] Light mode and all 12 theme variants work correctly
- [ ] Responsive design at 1080p and smaller
- [ ] localStorage persistence works (refresh page, settings retained)
- [ ] Browser console shows no errors or warnings
- [ ] All error scenarios tested (missing data, API failures, invalid input)

**Manual Testing Steps for localStorage Persistence**:
1. Open tool in browser and make a change (select theme, toggle feature, etc.)
2. Open DevTools (F12), go to Application tab → Storage → localStorage
3. Verify the key was saved (e.g., `xivdyetools_theme`)
4. Refresh page (Ctrl+R / Cmd+R) and confirm change persisted
5. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R) to clear cache, verify again
6. Close and reopen browser window to test session persistence

**Browser Testing Priority Order**:
1. Chrome (primary - most users)
2. Firefox (secondary - good compatibility)
3. Edge (Chromium-based, usually works if Chrome works)
4. Safari (last - most likely to have quirks)

**Checking Console for Errors**:
1. Open DevTools (F12)
2. Go to Console tab
3. Filter by "Error" (red badge in top-left)
4. Filter by "Warning" (yellow badge)
5. All filters should show 0 items before committing

### Before Committing: Complete Test Suite

**1. Component & Theme Testing**:
- [ ] Open in Chrome dev tools, check theme dropdown loads
- [ ] Switch to each theme (Standard, Hydaelyn, Classic FF, Parchment, Sugar Riot, Grayscale)
- [ ] Verify light/dark variants switch correctly
- [ ] Check that theme persists after refresh

**2. Functionality Testing** (per tool):
- **Color Accessibility Checker**:
  - [ ] All 5 vision types produce different outputs
  - [ ] Accessibility score updates correctly
  - [ ] Dual dyes toggle works and persists

- **Color Harmony Explorer**:
  - [ ] All 6 harmony types display
  - [ ] Color wheel highlights work
  - [ ] Zoom functionality opens/closes correctly
  - [ ] Simple/Expanded suggestions modes work
  - [ ] Market prices fetch and display

- **Color Matcher**:
  - [ ] Drag-drop works
  - [ ] Clipboard paste works (Ctrl+V / Cmd+V)
  - [ ] Color picker works
  - [ ] Eyedropper tool works

- **Dye Comparison**:
  - [ ] All 3 charts render (distance matrix, hue-sat, brightness)
  - [ ] Charts show all 4 quadrants if all dyes selected
  - [ ] Export formats are valid (JSON, CSS)

- **Dye Mixer**:
  - [ ] Intermediate dye calculations are accurate
  - [ ] Rankings display by proximity
  - [ ] Visual transitions smooth

**3. localStorage & Persistence Testing**:
- [ ] Select a theme → refresh → theme persists
- [ ] Enable Dual Dyes in Accessibility → refresh → persists
- [ ] Open DevTools → Application → localStorage → verify keys exist
- [ ] Hard refresh (Ctrl+Shift+R) → theme still persists

**4. Console & Error Checking**:
- [ ] F12 to open DevTools
- [ ] Go to Console tab
- [ ] Look for **red errors** (X icon) - should have NONE
- [ ] Look for **yellow warnings** - should have NONE or just browser safe warnings
- [ ] If any errors, note them and fix before committing

**5. Responsive Design Testing**:
- [ ] Resize browser to 1080p width
- [ ] Resize to tablet (768px)
- [ ] Resize to mobile (375px)
- [ ] Check that layouts stack properly
- [ ] Check that buttons are still clickable on mobile

---

## Responsive Design & Mobile Navigation (v2.0.0)

### Navigation Strategy

- **Mobile Devices (≤768px)**: Bottom navigation bar visible, Tools dropdown hidden
- **Tablet/Desktop (>768px)**: Tools dropdown visible in header, bottom nav hidden
- **Breakpoint**: 768px synchronized across all components

### Key Implementation Details

1. **Component-Based Navigation**
   - `<mobile-bottom-nav>` - Mobile navigation component (Lit)
   - `<tools-dropdown>` - Desktop navigation component (Lit)
   - `<theme-switcher>` - Theme selection UI (Lit)
   - All use CSS custom properties for theme-aware styling

2. **Responsive Breakpoint Management**
   - Tailwind breakpoints: `sm:`, `md:`, `lg:` classes control visibility
   - Components render conditionally based on viewport width
   - No duplicate navigation controls at any screen size

3. **Theme Integration**
   - All navigation components respect `var(--theme-*)` variables
   - Theme changes apply immediately without page refresh
   - ThemeService manages theme state across all components

### Testing Checklist for Responsive Design

- [ ] Mobile portrait (375px): Bottom nav visible, tools dropdown hidden
- [ ] Mobile landscape (812px): Tools dropdown visible, bottom nav hidden
- [ ] Tablet (768px edge case): Navigation switches appropriately
- [ ] Desktop (1024px+): Full navigation header visible
- [ ] Theme switcher accessible at all breakpoints
- [ ] No layout shift when resizing viewport

### When Modifying Navigation Components

1. Changes to navigation components in `src/components/` affect all tools
2. Test at multiple breakpoints: 375px, 640px, 768px, 820px, 1024px
3. Verify theme variable usage (no hardcoded colors)
4. Run `npm run build` to ensure TypeScript compiles
5. Test in `npm run preview` before committing

---

## Git Development Workflow (v2.0.0)

### Current Branch Strategy

- `main` branch = v2.0.0 production (TypeScript/Vite architecture)
- Feature branches off `main` for new features and bug fixes
- Pull requests merge back to `main` after review

### Creating a Feature Branch

```bash
# Start from main
git checkout main
git pull origin main

# Create feature branch (use descriptive name)
git checkout -b feature/add-new-harmony-type
# or
git checkout -b fix/market-board-caching

# Work on changes...
# Commit regularly with clear messages
git commit -m "Add monochromatic harmony type to color wheel"

# Push to remote
git push -u origin feature/add-new-harmony-type

# When ready, create PR: feature/add-new-harmony-type → main
```

### Commit Message Pattern

```
Brief description (50 chars or less)

- Detailed change 1
- Detailed change 2
- Detailed change 3

Fixes #123 (if applicable)
```

### Testing Before Committing

```bash
npm run lint      # Check code style
npm run test      # Run unit tests (499+ tests)
npm run build     # Verify production build succeeds
npm run preview   # Test production build locally
```

### Searching the Codebase

**Find all uses of a utility function**:
```bash
# Search for "getColorDistance" in TypeScript files
grep -r "getColorDistance" src/

# Count occurrences in specific service
grep -c "getColorDistance" src/services/color-service.ts
```

**Find hardcoded color references**:
```bash
# Search for hex color patterns in TypeScript
grep -E "#[0-9A-Fa-f]{6}" src/components/*.ts | head -20

# Find theme variable usage
grep -r "var(--theme-" src/
```

**Find localStorage key usage**:
```bash
# See all localStorage interactions
grep -rn "localStorage\|appStorage\|getItem\|setItem" src/services/
```

**Find component usage**:
```bash
# Find all uses of a specific component
grep -r "MarketBoard" src/components/

# Find event listeners
grep -r "addEventListener" src/components/
```

---

## Common Development Tasks (v2.0.0)

### Adding a New Feature to a Tool

1. Identify the relevant component file (e.g., `src/components/color-matcher-tool.ts`)
2. Add feature implementation using TypeScript
3. If needed, update service layer (e.g., `src/services/color-service.ts`)
4. Run tests: `npm run test`
5. Test in dev server: `npm run dev`
6. Commit with: "Feature: Description (ComponentName)"

### Updating a Shared Service

1. Edit service file (e.g., `src/services/color-service.ts`)
2. Update or add unit tests in `src/services/__tests__/`
3. Run tests: `npm run test`
4. Identify which tools use the service (grep or TypeScript imports)
5. Test all affected tools in dev server
6. Run full build: `npm run build && npm run preview`
7. Commit with: "Service: Description (ServiceName)"

### Adding a New Component

1. Create component file in `src/components/` (e.g., `my-component.ts`)
2. Extend `BaseComponent` or use Lit decorators
3. Add component to `src/components/index.ts` exports
4. Import and use in tool or app-layout
5. Add styles to `src/styles/components.css` if needed
6. Test responsiveness at 375px, 768px, 1024px
7. Commit with: "Component: Description (ComponentName)"

### Adding localStorage Support for a New Feature

```typescript
import { StorageService } from './services/storage-service';

// Reading (with default fallback)
const value = StorageService.getItem('xivdyetools_myfeature', 'default');

// Writing (in event handler)
StorageService.setItem('xivdyetools_myfeature', newValue);

// During component initialization
connectedCallback() {
  super.connectedCallback();
  const saved = StorageService.getItem('xivdyetools_myfeature', 'default');
  this.restoreState(saved);
}
```

### Adding a New Theme

1. Add CSS variables to `src/styles/themes.css`
2. Update constants in `src/shared/constants.ts`
3. Add theme option to `src/components/theme-switcher.ts`
4. Test theme in all tools
5. Verify persistence after page refresh
6. Commit with: "Theme: Add [ThemeName] theme"

---

## Important Files Reference (v2.0.0)

| File | Purpose | When to Update |
|------|---------|-----------------|
| `src/services/theme-service.ts` | Theme management | Adding themes |
| `src/styles/themes.css` | Theme CSS variables | Defining new theme colors |
| `src/components/theme-switcher.ts` | Theme UI component | Adding theme options |
| `src/services/dye-service.ts` | Dye database service | When FFXIV adds dyes |
| `src/assets/json/colors_xiv.json` | FFXIV dyes data | Raw dye database updates |
| `src/services/color-service.ts` | Color algorithms | Core color calculations |
| `src/services/api-service.ts` | Universalis integration | Market Board API changes |
| `src/components/app-layout.ts` | Main app shell | Overall app structure |
| `src/shared/constants.ts` | Application constants | Feature flag changes |
| `package.json` | Dependencies & scripts | npm configuration |
| `vite.config.ts` | Build configuration | Vite settings |
| `tailwind.config.js` | Tailwind CSS config | Styling framework |

---

## Related Documentation

- **[SERVICES.md](./SERVICES.md)** - Service layer architecture and API details
- **[TOOLS.md](./TOOLS.md)** - Individual tool descriptions and algorithms
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
- **[README.md](../docs/README.md)** - Documentation index
- **[CLAUDE.md](../CLAUDE.md)** - Quick reference guide
