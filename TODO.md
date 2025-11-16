# 📋 XIVDyeTools Development Roadmap

**Current Version:** v1.6.0
**Last Updated:** Phase 9 Complete
**Status:** Production-Ready with High-Priority Fixes Applied

---

## 📊 Phase Status Summary

| Phase | Name | Status | Details |
|-------|------|--------|---------|
| **Phase 1-8** | Initial Development | ✅ COMPLETE | Core tools, features, theming |
| **Phase 9** | Bug Audit & Security Hardening | ✅ COMPLETE | 32+ bugs fixed, CSP headers, fonts |
| **Phase 10** | Testing & Validation | ⏳ NEXT | Cross-browser, mobile, scenarios |
| **Phase 11** | Code Quality & Documentation | 🔲 PLANNED | Remove duplication, update docs |
| **Phase 12** | Architecture Refactor | 🔲 FUTURE | TypeScript, build system (Vite) |

---

## ✅ Phase 9: Bug Audit & Security Hardening (COMPLETE)

### CRITICAL Bugs Fixed ✅
- [x] Added null checks to DOM element access (10 instances)
  - Implemented `safeGetElementValue()` and `safeParseInt()` utilities
  - Prevents crashes if HTML elements missing from DOM

### HIGH Priority Bugs Fixed ✅
- [x] Validated file input arrays before access (6 instances)
  - File input, camera capture, drag-drop handlers
  - Prevents undefined errors when user cancels dialogs
- [x] Added length checks to touch event arrays (12 instances)
  - Mobile touch gesture reliability improved
  - Handles rare touch sequences on various devices

### MEDIUM Priority Bugs Fixed ✅
- [x] Added radix parameter to parseInt() calls (~7 instances)
  - coloraccessibility: URL params, dye comparison import
  - colorexplorer: array index parsing
- [x] Added array bounds checking for parsed indices (3 instances)
  - Validates `!isNaN(index) && index >= 0 && index < array.length`
  - Prevents undefined array element access

### LOW Priority Bugs Fixed ✅
- [x] String operations without length validation (hex color parsing)
  - Added hex format validation before string slice operations
- [x] Canvas context null checks (colormatcher)
  - Verifies context exists before canvas operations
- [x] Array method chaining without null checks (dye-mixer)
  - Added positions array bounds validation with fallback UI

### Security Enhancements ✅
- [x] Content Security Policy (CSP) headers added to all 11 HTML files
  - Prevents XSS, clickjacking, and form injection attacks
- [x] Event delegation pattern implemented
  - Replaced inline onclick handlers with data attributes
  - Centralized event handling in `shared-components.js`
- [x] innerHTML sanitization improvements
  - Added `escapeHTML()` utility for user input
- [x] Self-hosted Google Fonts (WOFF2 format)
  - Removed Google CDN dependency for privacy
  - 30% smaller file sizes with WOFF2 format
  - 38 new @font-face declarations in CSS

### Documentation ✅
- [x] Created comprehensive Bug Audit Report
  - Documented 40+ bug instances across 6 categories
  - Before/after code examples with line numbers
  - Testing checklist for validation

---

## ⏳ Phase 10: Testing & Validation (NEXT)

### Browser Compatibility Testing
- [ ] Test in Chrome (primary browser)
- [ ] Test in Firefox (secondary)
- [ ] Test in Safari (iOS 12+)
- [ ] Test in Edge (Chromium-based)
- [ ] Verify console shows no errors or warnings

### Mobile & Touch Testing
- [ ] Test touch gestures on iOS devices
- [ ] Test touch gestures on Android devices
- [ ] Test swipe gestures (all tools with swipe features)
- [ ] Test color picker on mobile
- [ ] Test drag-drop on mobile browsers

### Responsive Design Testing
- [ ] Test at 375px (mobile)
- [ ] Test at 768px (tablet)
- [ ] Test at 1080p (desktop)
- [ ] Test at 1440p (large desktop)
- [ ] Verify button clickability on all sizes

### Feature-Specific Testing

**Color Accessibility Checker:**
- [ ] All 4 vision types produce different outputs
- [ ] Accessibility score accuracy (0-100 range)
- [ ] Dual dyes toggle persists in localStorage
- [ ] Contrast ratio calculations correct
- [ ] Test with all 6 outfit slots filled

**Color Harmony Explorer:**
- [ ] All 6 harmony types display correctly
- [ ] Color wheel highlights match harmony selections
- [ ] Zoom functionality works (open/close)
- [ ] Market prices fetch correctly (API optional)
- [ ] CSV/JSON/SCSS export formats valid

**Color Matcher:**
- [ ] Drag-drop image upload works
- [ ] Clipboard paste (Ctrl+V / Cmd+V) works
- [ ] Color picker hex input works
- [ ] Eyedropper tool samples colors correctly
- [ ] Sample size averaging accurate (1×1 to 64×64)
- [ ] Image zoom controls functional

**Dye Comparison:**
- [ ] Color distance matrix renders correctly
- [ ] Hue-Saturation 2D chart displays all quadrants
- [ ] Brightness 1D chart renders properly
- [ ] Export to JSON is valid format
- [ ] Export to CSS is valid format
- [ ] Copy hex codes to clipboard works

**Dye Mixer:**
- [ ] Gradient calculations accurate
- [ ] Intermediate dye suggestions correct
- [ ] Position percentages calculate properly
- [ ] Save/load gradients from localStorage
- [ ] Export gradient data works

### localStorage Persistence Testing
- [ ] Theme selection persists after refresh
- [ ] Tool-specific settings persist
- [ ] Hard refresh (Ctrl+Shift+R) clears appropriately
- [ ] Session persistence works
- [ ] Corrupted localStorage data handled gracefully

### Error Scenario Testing
- [ ] Missing DOM elements handled
- [ ] Invalid color values handled
- [ ] Network failures (API unavailable)
- [ ] File input cancellation
- [ ] Image load failures
- [ ] Malformed JSON data
- [ ] Empty localStorage

### Performance Testing
- [ ] Page load time < 2 seconds
- [ ] Color calculations responsive (< 100ms)
- [ ] Canvas rendering smooth (60 FPS target)
- [ ] No memory leaks with heavy use
- [ ] Debouncing works for rapid inputs

---

## 🔲 Phase 11: Code Quality & Documentation (PLANNED)

### Code Duplication Reduction
- [ ] Audit utility function duplication across 4 tools
  - Estimate: ~1,600+ duplicate lines total
  - Pattern: Same functions in each tool file
- [ ] Move all remaining utilities to `shared-components.js`
  - Color conversion functions
  - Color distance calculations
  - Harmony type calculations
  - Canvas rendering utilities
- [ ] Remove local copies from tool files
- [ ] Update imports to use shared utilities
- [ ] Test all tools after consolidation

### Code Organization
- [ ] Add section markers to monolithic files
  - `<!-- SECTION: SHARED UTILITIES -->`
  - `<!-- SECTION: INITIALIZATION -->`
  - `<!-- SECTION: EVENT HANDLERS -->`
  - `<!-- SECTION: RENDERING -->`
- [ ] Create function index at top of each file
- [ ] Document complex algorithms
  - Brettel 1997 colorblindness matrices
  - HSV color wheel calculations
  - RGB distance metrics

### Documentation Updates
- [ ] Update CLAUDE.md with new utilities in shared-components.js
- [ ] Add API documentation for shared utilities
  - Function signatures
  - Parameter descriptions
  - Return types
  - Usage examples
- [ ] Create ARCHITECTURE.md
  - System design overview
  - Data flow diagrams
  - Component interactions
  - Technology decisions
- [ ] Update README.md
  - Feature overview
  - User guide links
  - Browser support matrix
- [ ] Update CHANGELOG.md
  - Phase 9 bug fixes
  - Security enhancements
  - Breaking changes (if any)

### Testing Documentation
- [ ] Create TESTING.md
  - Manual testing procedures
  - Test scenario descriptions
  - Expected outcomes
  - Known limitations
- [ ] Create TEST_RESULTS.md
  - Browser compatibility matrix
  - Device/OS testing results
  - Performance benchmarks
  - Known issues

### Code Quality
- [ ] Set up ESLint configuration
  - Enforce parseInt radix parameter
  - Enforce null checks before array access
  - Flag potential XSS issues
  - Check for unused variables
- [ ] Add pre-commit hooks
  - Run ESLint before commit
  - Validate HTML structure
  - Check file sizes
- [ ] Code review checklist
  - Security review items
  - Performance considerations
  - Accessibility standards

---

## 🔲 Phase 12: Architecture Refactor (FUTURE)

### TypeScript Migration
- [ ] Set up TypeScript compiler
- [ ] Create type definitions for data structures
  - Dye interface
  - Color objects (RGB, HSV, Hex)
  - Tool configuration objects
- [ ] Migrate utility functions to TypeScript
  - Add strict null checking
  - Add parameter types
  - Add return types
- [ ] Benefits:
  - Compile-time error checking
  - Better IDE autocomplete
  - Documentation via types
  - Refactoring safety

### Build System Setup (Vite)
- [ ] Install and configure Vite
- [ ] Set up development server
  - Fast hot module replacement
  - Component preprocessing
- [ ] Create production build
  - Minification
  - Asset bundling
  - Code splitting (optional)
- [ ] Deprecate experimental/stable split
  - Single source of truth
  - Easier development workflow
- [ ] Update deployment process

### Component Extraction
- [ ] Extract reusable UI components
  - Color picker modal
  - Dropdown selectors
  - Toast notifications
  - Chart rendering library
- [ ] Create component library
  - Documented API
  - Consistent styling
  - Accessibility built-in
- [ ] Share components across tools
  - Reduce duplication
  - Consistent UX
  - Easier maintenance

### State Management
- [ ] Implement centralized state management
  - Consider: Redux, Zustand, or vanilla module pattern
  - Global app state
  - Tool-specific state
- [ ] Replace localStorage with state system
  - Automatic persistence layer
  - State synchronization across tabs
  - Time-travel debugging (optional)

### Performance Optimizations
- [ ] Profile rendering performance
  - Identify bottlenecks
  - Optimize canvas operations
  - Reduce re-renders
- [ ] Implement lazy loading
  - Load tools on demand
  - Defer non-critical resources
- [ ] Add service worker support
  - Offline functionality
  - Cache strategies
  - Background sync

---

## 🎯 Future Enhancements (Beyond Phase 12)

### Feature Additions
- [ ] Dark/Light mode auto-detection
- [ ] Multiple language support (i18n)
- [ ] Color palette import/export (more formats)
- [ ] Community color palettes
- [ ] Undo/redo functionality
- [ ] Advanced color harmony calculations
- [ ] Integration with FFXIV market boards (live prices)
- [ ] Gear piece dye preview
- [ ] Glamour plate integration

### Platform Expansions
- [ ] Progressive Web App (PWA)
  - Installable app
  - Offline support
  - Push notifications
- [ ] Mobile app (React Native)
  - iOS native features
  - Android features
- [ ] Discord bot integration
  - Query dye colors
  - Share color palettes

### Community & Ecosystem
- [ ] Open source contributions
- [ ] GitHub discussions forum
- [ ] Plugin system for extensions
- [ ] API for third-party tools
- [ ] Community color themes

---

## 📋 Current Blockers & Dependencies

### Not Blocking Current Work
- TypeScript setup (optional enhancement)
- Vite build system (nice to have)
- Component extraction (refactoring, not critical)

### Dependencies for Next Phases
- Testing infrastructure (Phase 10)
- Documentation tools (Phase 11)
- Build system (Phase 12)

---

## 🔗 Related Files

| File | Purpose | Status |
|------|---------|--------|
| BUG_AUDIT_REPORT.md | Comprehensive bug audit | ✅ Complete |
| CLAUDE.md | Development guidelines | ⏳ Needs update |
| CHANGELOG.md | Version history | ⏳ Needs Phase 9 entry |
| README.md | User documentation | ✅ Current |
| FAQ.md | User FAQs | ✅ Current |

---

## 📊 Metrics & Goals

### Code Quality Metrics
- Target: 0 console errors
- Target: 0 accessibility violations (WCAG 2.1 AA)
- Target: 100% test coverage for utilities
- Target: < 5 duplicate lines of code

### Performance Targets
- Page load: < 2 seconds
- Color operations: < 100ms
- Touch response: < 60ms (16.7ms for 60 FPS)
- Bundle size: < 500KB (all tools)

### Test Coverage Goals
- [ ] Browser coverage: 4 major browsers
- [ ] Device coverage: Mobile, tablet, desktop
- [ ] Scenario coverage: Happy path + edge cases
- [ ] Bug regression tests: Prevent Phase 9 issues

---

## 📅 Recommended Timeline

```
Phase 9:  Bug Audit & Security      [✅ COMPLETE - Latest]
Phase 10: Testing & Validation      [⏳ START: 1-2 weeks]
Phase 11: Code Quality & Docs       [🔲 PLANNED: 2-3 weeks]
Phase 12: Architecture Refactor     [🔲 FUTURE: 3-4 weeks]
```

---

**Last Updated:** 2025-11-15
**Next Review:** After Phase 10 completion
**Maintained By:** Development Team

---

## 🤝 Contributing

When adding to this TODO:
1. Use clear, actionable items
2. Include effort estimates (S/M/L)
3. Link to related issues/PRs
4. Update status regularly
5. Move completed items to Phase summary

---

**Version:** 1.0.0
**Format:** GitHub-flavored Markdown
