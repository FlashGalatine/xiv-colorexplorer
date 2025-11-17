# XIV Dye Tools - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] - 2025-11-16

### 🎯 Overview
Complete TypeScript/Vite refactor bringing modern architecture, type safety, and maintainability to XIV Dye Tools. All 5 tools ported to component-based architecture with comprehensive unit testing.

### ✨ New Features

#### Architecture & Infrastructure
- **TypeScript Strict Mode** - Full type safety across entire codebase
- **Vite Build System** - ~5x faster build times, optimized bundling
- **Component Architecture** - Reusable UI components with lifecycle hooks
- **Service Layer** - Centralized business logic (ColorService, DyeService, ThemeService, StorageService)
- **Unit Testing** - 140 tests with >90% coverage on core services

#### User Features
- **Duplicate Dye Selection** - Accessibility Checker allows selecting same dye multiple times
- **Improved Search** - Category filtering and search now stable without focus loss
- **Better Visual Feedback** - Category button highlighting updates correctly
- **Enhanced Theme System** - 10 theme variants with proper colors

### 🐛 Bug Fixes

#### Phase 12.5 (Bug Fixes)
- **Facewear Exclusion** - Facewear dyes no longer suggested for color matching
- **Triadic Harmony** - Base color excluded from triadic harmony results
- **Harmony Suggestion Limiting** - Top 6 harmony suggestions by deviance score
- **Button Text Contrast** - All button text set to white on primary colors
- **Theme Backgrounds** - Distinct backgrounds for light themes
- **Harmony Card Headers** - Theme-aware header styling with proper contrast

#### Phase 12.6 (Integration & Stability)
- **Event Listener** - Fixed Accessibility Checker event handling
- **Neutral Button Visual Bug** - Category button highlighting corrected
- **Search Input Focus Loss** - Search box preserves value and focus
- **Category Highlighting** - Button states update correctly when switching
- **DOM Update Optimization** - Smart update() only re-renders changed sections

### 🚀 Performance Improvements

- **Build Time** - ~5x faster with Vite (2-3s vs 10-15s)
- **Bundle Size** - 141.37 kB JS + 37.08 kB CSS (optimized)
- **Component Updates** - Smart update() avoids full re-renders
- **Canvas Optimization** - Resolution reduction maintains performance
- **Memory Management** - Proper cleanup and lifecycle hooks

### 📦 Dependency Updates

- **Build Tool** - Vite 5.4.21
- **Language** - TypeScript 5.x (strict mode)
- **Testing** - Vitest 1.x with v8 coverage
- **Styling** - Tailwind CSS with theme system

### 🔧 Technical Changes

#### Codebase Structure
```
Before (v1.6.x):          After (v2.0.0):
- Monolithic HTML files   - src/components/
- No TypeScript           - src/services/
- No build system         - src/shared/
- Manual testing          - src/styles/
                          - Vite build system
                          - 140 unit tests
```

#### Services
- **ColorService** - RGB/HSV, colorblindness, contrast
- **DyeService** - Database, filtering, harmony
- **ThemeService** - 10-theme system
- **StorageService** - localStorage wrapper

### 📊 Test Coverage

| Service | Statements | Status |
|---------|-----------|--------|
| ThemeService | 98.06% | ✅ |
| DyeService | 94.9% | ✅ |
| ColorService | 89.87% | ✅ |
| StorageService | 79.78% | ✅ |

**Tests**: 140/140 passing (100%)

### 🎨 Theme System

All 10 themes fully functional:
- Standard (Light/Dark)
- Hydaelyn (Light/Dark)
- Classic FF (Light/Dark)
- Parchment (Light/Dark)
- Sugar Riot (Light/Dark)

### ⚠️ Breaking Changes

**For Users**: None - All v1.6.x features work identically

**For Developers**: 
- Build system changed to Vite
- Import paths use @ aliases
- TypeScript required

### 🔄 Migration from v1.6.x

No action needed for users.
- Settings automatically migrated
- No data loss
- Bookmarks continue to work

### ♿ Accessibility

- WCAG AA compliance
- Colorblindness simulation (Brettel 1997)
- Keyboard navigation
- High contrast support

### 📱 Responsive Design

- Mobile-first design
- Bottom navigation for mobile
- Tools dropdown for desktop
- Responsive themes

### 🔐 Security

- Strict CSP headers
- Input validation
- No external dependencies
- Private method encapsulation

---

## [1.6.1] - 2025-11-13

### ✨ Features
- 4 stable tools
- Theme system
- localStorage persistence

### 🐛 Fixes
- Theme switching
- Color calculations
- Database loading

---

## [1.0.0] - Initial Release

Initial community release with Color Accessibility Checker.

---

**Generated**: 2025-11-16
**License**: MIT
