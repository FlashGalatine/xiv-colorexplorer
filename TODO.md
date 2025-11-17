# TODO List - XIV Dye Tools v2.0.0

**Last Updated**: November 17, 2025
**Current Version**: v2.0.0
**Status**: Post-TypeScript Migration - Documentation & Feature Restoration Phase

This TODO list organizes upcoming development work across 4 priority tiers based on comprehensive codebase research conducted November 2025.

---

## 🔴 CRITICAL PRIORITY (Do First)

**Estimated Total Time**: ~2.5 hours
**Goal**: Fix blocking issues, resolve lint errors, sync documentation

### 1. Fix TypeScript Lint Errors (23 errors)

**Status**: ❌ Not Started
**Estimated Time**: 1-2 hours
**Files Affected**:
- `src/services/__tests__/theme-service.test.ts`

**Issue Description**:
Test files use `any` type for Jest mock functions, violating TypeScript strict mode:
```typescript
// ❌ Current (line 66, 69, 74, 85, 90, etc.)
(localStorage.getItem as any).mockReturnValue('standard-dark');

// ✅ Should be
(localStorage.getItem as jest.MockedFunction<typeof localStorage.getItem>).mockReturnValue('standard-dark');
```

**Lines with Errors**: 66, 69, 74, 85, 90, 121, 124, 148, 168, 171, 192, 206, 239, 252, 268, 272, 289, 301, 314, 317, 345, 352

**Action Items**:
- [ ] Create proper type definitions for localStorage mock
- [ ] Replace all `as any` casts with typed mocks
- [ ] Verify tests still pass after changes
- [ ] Run `npm run lint` to confirm all errors resolved

**Acceptance Criteria**:
- Zero TypeScript errors in test files
- All 140 tests continue to pass
- Lint command exits with 0 errors

**Reference**: `feedback/lint-problems.txt:5-27`

---

### 2. Remove Unused Variable

**Status**: ❌ Not Started
**Estimated Time**: 5 minutes
**File**: `src/components/color-matcher-tool.ts:396`

**Issue**: Variable `canvasContainer` is declared but never used

**Action Items**:
- [ ] Review context around line 396
- [ ] Remove variable or prefix with underscore `_canvasContainer` if intentionally unused
- [ ] Verify build succeeds

**Acceptance Criteria**:
- No "unused variable" lint warnings
- Color Matcher tool functionality unaffected

**Reference**: `feedback/lint-problems.txt:5`

---

### 3. Update Documentation Versions (FAQ.md)

**Status**: ❌ Not Started
**Estimated Time**: 20 minutes
**File**: `FAQ.md`

**Issue**: FAQ.md claims current version is v1.5.2 and references outdated v1.6.0 features

**Lines to Update**:
- Line 9: "v1.5.2 (November 14, 2025)" → "v2.0.0 (November 17, 2025)"
- Line 23-24: Update localStorage context (remove v1.6.0 references)
- Line 176: "Color Accessibility Checker (BETA v1.5.0)" → "v2.0.0"
- Line 202: "Version 1.5.2" → "v2.0.0"

**Action Items**:
- [ ] Find/replace "1.5.2" → "2.0.0"
- [ ] Find/replace "1.6.0" → "2.0.0"
- [ ] Update dates to November 17, 2025
- [ ] Remove "BETA" designations (all tools are stable now)
- [ ] Review for any other version number inconsistencies

**Acceptance Criteria**:
- All version references say "v2.0.0"
- No contradictory version numbers remain
- Dates reflect current release

---

### 4. Update Documentation Versions (CLAUDE.md)

**Status**: ❌ Not Started
**Estimated Time**: 30 minutes
**File**: `CLAUDE.md`

**Issue**: CLAUDE.md references v1.6.1 throughout and describes outdated monolithic HTML architecture

**Lines to Update**:
- Lines 9-13: All tools listed as "v1.6.1" → "v2.0.0"
- Line 15: "Current Status: v1.6.1 Production" → "v2.0.0 Production"
- Line 17: "Deployment: All experimental versions synced with stable (v1.6.1)" → Update to reflect TypeScript/Vite architecture
- Line 244: Update Phase 12 status (now complete)

**Action Items**:
- [ ] Update all version numbers (v1.6.1 → v2.0.0)
- [ ] Update "Architecture" section to reflect TypeScript/Vite structure
- [ ] Remove outdated experimental/stable workflow references
- [ ] Add v2.0.0 architecture documentation (src/ folder structure)
- [ ] Update development workflow section (npm commands, not Python server)

**Acceptance Criteria**:
- Version numbers consistent across document
- Architecture section reflects current v2.0.0 structure
- No references to deprecated HTML monolithic files

---

### 5. Fix Tailwind Config Warning

**Status**: ❌ Not Started
**Estimated Time**: 5 minutes
**File**: `tailwind.config.js`

**Issue**: Build warning about pattern matching all of node_modules, causing performance issues:
```
warn - Pattern: `./**\*.html`
```

**Current Config**:
```javascript
content: ['./**/*.html', './src/**/*.{ts,tsx}']
```

**Proposed Fix**:
```javascript
content: ['./index.html', './src/**/*.{ts,html}']
```

**Action Items**:
- [ ] Update `tailwind.config.js` content array
- [ ] Run `npm run build` to verify warning is gone
- [ ] Confirm CSS is still properly compiled

**Acceptance Criteria**:
- No Tailwind warnings during build
- CSS output unchanged (compare bundle size)
- All styles render correctly

---

## 🟠 HIGH PRIORITY (Next Session)

**Estimated Total Time**: ~10 hours
**Goal**: Clean up production code, restore Market Board feature, upgrade security

### 6. Remove Debug Code from Production

**Status**: ❌ Not Started
**Estimated Time**: 15 minutes
**File**: `src/components/dye-selector.ts`

**Issue**: 5 `console.debug()` statements active in production code (lines 226, 357, 364, 371, 377)

**Context**:
```typescript
// Line 226
console.debug('All attributes on button:', Array.from(button.attributes).map(a => `${a.name}="${a.value}"`));

// Line 357
console.debug('Initial click target:', { tag: target.tagName, classes: target.className });
```

**Options**:
1. **Remove entirely** (preferred for production)
2. Replace with `console.info()` (allowed by linter)
3. Gate behind `DEBUG_MODE` constant (already exists in `shared/constants.ts`)

**Action Items**:
- [ ] Decide on approach (recommend: remove entirely)
- [ ] Update all 5 instances
- [ ] Run `npm run lint` to verify warnings gone
- [ ] Test dye selector functionality

**Acceptance Criteria**:
- Zero console.debug warnings in lint output
- Dye selector works correctly
- No debug logs in browser console

**Reference**: `feedback/lint-problems.txt:29-33`

---

### 7. Reintroduce Market Board Feature

**Status**: ❌ Not Started
**Estimated Time**: 4-6 hours
**Priority**: HIGH (user-requested legacy feature)

**Background**:
Market Board integration was fully functional in v1.6.x using Universalis API. The API service layer already exists in v2.0.0 (`src/services/api-service.ts`) but UI components were not migrated.

**What Exists in v2.0.0**:
- ✅ `APIService` class (singleton pattern with caching)
- ✅ localStorage persistence for cached prices
- ✅ Rate limiting and request debouncing
- ✅ Retry logic with exponential backoff
- ✅ TypeScript strict mode compliant

**What's Missing**:
- ❌ UI component for Market Board
- ❌ Server/world dropdown integration
- ❌ Price category filters (Base, Craft, Allied Society, Cosmic, Special)
- ❌ Integration with 3 tools: Color Explorer, Color Matcher, Dye Comparison

**Legacy Implementation Reference**:
- `historical/PHASE_6_2_MARKET_BOARD_CHANGES.md` - Feature documentation
- `components/market-prices.html` - Legacy UI component (needs TypeScript port)
- `assets/js/shared-components.js` - Legacy utilities:
  - `PRICE_CATEGORIES` constant
  - `shouldFetchPrice(dye)` filter logic
  - `initializeMarketBoard(selectElementId)` dropdown population
  - `fetchUniversalisPrice(itemIds, server, throttler)` API calls (now in APIService)
  - `formatPrice(price)` formatting with thousands separator

**Action Items**:

**Phase 1: Create Market Board Component** (~2 hours)
- [ ] Create `src/components/market-board.ts` (TypeScript component)
- [ ] Port UI from `components/market-prices.html`
- [ ] Implement server selection dropdown (use `assets/json/data-centers.json` + `assets/json/worlds.json`)
- [ ] Implement price category filter (5 categories)
- [ ] Add loading states and error handling
- [ ] Style with Tailwind (match current theme system)

**Phase 2: Wire Up APIService** (~1 hour)
- [ ] Import APIService singleton
- [ ] Implement price fetching on dye selection
- [ ] Display formatted prices (with thousands separator)
- [ ] Add localStorage caching (read from APIService cache)
- [ ] Handle rate limiting gracefully (show toast if throttled)

**Phase 3: Integrate with Tools** (~2 hours)
- [ ] Color Harmony Explorer: Add market prices toggle + display
- [ ] Color Matcher: Add market prices for matched dye
- [ ] Dye Comparison: Add market prices for all selected dyes
- [ ] Test with all 3 tools

**Phase 4: Testing** (~1 hour)
- [ ] Test with all data centers (NA, EU, JP, OCE)
- [ ] Test with all 5 price categories
- [ ] Test error scenarios (API down, invalid server, rate limit)
- [ ] Test localStorage persistence (prices cached correctly)
- [ ] Test responsive design (mobile + desktop)

**Acceptance Criteria**:
- Market Board component renders in all 3 tools
- Prices fetch from Universalis API correctly
- Prices cached in localStorage (persist across sessions)
- Error handling graceful (toast notifications)
- Rate limiting respects Universalis API limits
- Responsive design works on mobile
- All 140 existing tests still pass
- No console errors

**Reference**: `historical/PHASE_6_2_MARKET_BOARD_CHANGES.md`

---

### 8. Upgrade Content Security Policy (CSP)

**Status**: ❌ Not Started
**Estimated Time**: 2-3 hours
**Priority**: HIGH (security improvement)

**Current CSP** (meta tag in index.html):
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  font-src 'self';
  img-src 'self' data: blob:;
  connect-src 'self' https://universalis.app;
  base-uri 'self';
  form-action 'none';
">
```

**Security Issues**:
1. ⚠️ `'unsafe-inline'` for scripts weakens XSS protection
2. ⚠️ `'unsafe-inline'` for styles (less critical but still a risk)
3. ⚠️ CSP via meta tag can't use all features (frame-ancestors, report-uri)
4. ⚠️ No nonces or hashes for dynamic content

**Goals**:
- Remove all `'unsafe-inline'` directives
- Move CSP to HTTP headers (requires server configuration)
- Implement nonces for dynamic content
- Add Subresource Integrity (SRI) for any external resources

**Action Items**:

**Phase 1: Audit Inline Scripts** (~30 minutes)
- [ ] Run grep to find any remaining inline scripts in HTML
- [ ] Run grep to find inline styles in HTML
- [ ] Confirm all JavaScript is in external files (should be true in v2.0.0)

**Phase 2: Implement Nonces** (~1 hour)
- [ ] Research nonce implementation for Vite/static sites
- [ ] Add nonce generation to build process (if needed)
- [ ] Update CSP to use nonces: `script-src 'self' 'nonce-{RANDOM}'`
- [ ] Test with all tools

**Phase 3: Move CSP to HTTP Headers** (~1 hour)
- [ ] Document CSP headers for deployment (Netlify, Vercel, Apache, Nginx)
- [ ] Create `.htaccess` or `netlify.toml` with CSP headers
- [ ] Remove CSP meta tag from index.html
- [ ] Test headers in browser DevTools (Security tab)

**Phase 4: Add SRI** (~30 minutes)
- [ ] Review if any external resources exist (should be none)
- [ ] If needed, generate SRI hashes for external resources
- [ ] Add integrity attribute to script/link tags

**Acceptance Criteria**:
- No `'unsafe-inline'` in CSP
- CSP delivered via HTTP headers (not meta tag)
- All scripts pass CSP checks (no blocked resources)
- Browser DevTools Security tab shows strict CSP
- No console CSP warnings

**Reference**: `historical/CSP-DEV.md`, Phase 9 security improvements

**Note**: If deploying to static hosting (GitHub Pages, Netlify), some CSP features may require configuration in hosting platform settings.

---

## 🟡 MEDIUM PRIORITY (Future Sessions)

**Estimated Total Time**: ~15 hours
**Goal**: Improve test coverage, optimize build, clean up repository

### 9. Add Component Test Coverage

**Status**: ❌ Not Started
**Estimated Time**: 8-12 hours
**Priority**: MEDIUM (quality improvement)

**Current Test Coverage**:
- **Services**: Excellent coverage (79-98%)
  - ThemeService: 98.06% ✅
  - DyeService: 94.9% ✅
  - ColorService: 89.87% ✅
  - StorageService: 79.78% ⚠️
- **Components**: 0% coverage ❌ (no tests exist)
- **Total Tests**: 140 passing (all service tests)

**Missing Test Coverage**:
- `src/components/accessibility-checker-tool.ts` (508 lines)
- `src/components/color-matcher-tool.ts` (656 lines)
- `src/components/color-wheel-display.ts` (186 lines)
- `src/components/dye-comparison-chart.ts` (507 lines)
- `src/components/dye-mixer-tool.ts` (639 lines)
- `src/components/dye-selector.ts` (489 lines)
- `src/components/harmony-type.ts` (85 lines)
- `src/components/theme-switcher.ts` (74 lines)
- `src/components/tools-dropdown.ts` (68 lines)
- `src/components/mobile-bottom-nav.ts` (76 lines)

**Total Untested Code**: ~3,288 lines

**Action Items**:

**Phase 1: Setup Component Testing Infrastructure** (~2 hours)
- [ ] Research Lit component testing best practices
- [ ] Install necessary testing libraries (if not already present)
- [ ] Create example component test file
- [ ] Configure Jest/Vitest for Lit components
- [ ] Add test utilities (render helpers, mock data)

**Phase 2: Test Base Component** (~1 hour)
- [ ] Create `src/components/__tests__/base-component.test.ts`
- [ ] Test theme integration
- [ ] Test lifecycle methods
- [ ] Target: 80%+ coverage

**Phase 3: Test UI Components** (~3-4 hours)
- [ ] Theme Switcher tests (simple, good starting point)
- [ ] Tools Dropdown tests
- [ ] Mobile Bottom Nav tests
- [ ] Color Wheel Display tests
- [ ] Dye Selector tests (most complex)

**Phase 4: Test Tool Components** (~4-6 hours)
- [ ] Accessibility Checker tests
- [ ] Color Matcher tests
- [ ] Dye Comparison tests
- [ ] Dye Mixer tests
- [ ] Harmony Type tests

**Testing Strategy**:
- Focus on user interactions (button clicks, input changes)
- Test state management (selected dyes, theme changes)
- Test integration with services (DyeService, ThemeService)
- Mock external dependencies (APIService, localStorage)
- Use snapshot tests for complex UI structures

**Acceptance Criteria**:
- All components have test files
- Component test coverage >80%
- Integration tests for key user flows
- All tests pass consistently (no flaky tests)
- Test suite runs in <10 seconds

**Reference**: Current test suite in `src/services/__tests__/`

---

### 10. Implement Code Splitting for Lazy-Loaded Tools

**Status**: ❌ Not Started
**Estimated Time**: 3-4 hours
**Priority**: MEDIUM (performance optimization)

**Current Build Output**:
```
index.html                 0.83 kB  │ gzip:  0.48 kB
assets/index-wtf3yrUL.css  39.50 kB │ gzip:  7.07 kB
assets/index-CnrQShGf.js   168.30 kB│ gzip: 39.84 kB
Total dist size: 1.2M
```

**Issue**: All 5 tools bundled into single 168 KB JavaScript file. Users loading "Color Matcher" download code for all 4 other tools unnecessarily.

**Goal**: Split tools into separate chunks, load on-demand

**Benefits**:
- Reduce initial page load time
- Lower bandwidth usage (users only download what they need)
- Improve Time to Interactive (TTI)
- Better caching (tool-specific chunks cache independently)

**Action Items**:

**Phase 1: Configure Vite Code Splitting** (~1 hour)
- [ ] Update `vite.config.ts` with manual chunk configuration
- [ ] Create separate entry points for each tool
- [ ] Configure dynamic imports for tool components
- [ ] Test build output (should see 5+ chunk files)

**Example Vite Config**:
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['lit', '@lit/reactive-element'],
        'accessibility': ['./src/components/accessibility-checker-tool.ts'],
        'matcher': ['./src/components/color-matcher-tool.ts'],
        'comparison': ['./src/components/dye-comparison-chart.ts'],
        'mixer': ['./src/components/dye-mixer-tool.ts'],
        'explorer': ['./src/components/harmony-type.ts']
      }
    }
  }
}
```

**Phase 2: Implement Dynamic Imports** (~1 hour)
- [ ] Update `src/components/app-layout.ts` to lazy-load tools
- [ ] Add loading spinners during tool import
- [ ] Handle import errors gracefully
- [ ] Test with slow network (throttling in DevTools)

**Example Dynamic Import**:
```typescript
async loadTool(toolName: string) {
  this.isLoading = true;
  try {
    switch(toolName) {
      case 'accessibility':
        await import('./accessibility-checker-tool.ts');
        break;
      case 'matcher':
        await import('./color-matcher-tool.ts');
        break;
      // ...
    }
  } catch (error) {
    console.error(`Failed to load tool ${toolName}:`, error);
    showToast('Error loading tool. Please refresh.', 'error');
  } finally {
    this.isLoading = false;
  }
}
```

**Phase 3: Extract Vendor Chunks** (~30 minutes)
- [ ] Separate Lit framework code into vendor bundle
- [ ] Separate Tailwind utilities into vendor bundle
- [ ] Verify vendor chunk is cached across page loads

**Phase 4: Testing & Optimization** (~1 hour)
- [ ] Run Lighthouse performance audit (before/after)
- [ ] Measure bundle size reduction
- [ ] Test on 3G network (Chrome DevTools throttling)
- [ ] Verify all tools load correctly
- [ ] Check that shared code isn't duplicated

**Expected Results**:
- Initial bundle: 168 KB → ~40-50 KB (vendor + app shell)
- Per-tool chunks: ~25-35 KB each
- Total reduction: ~40% smaller initial load
- Lazy-loaded tools appear in Network tab only when clicked

**Acceptance Criteria**:
- Each tool is a separate chunk file
- Vendor code extracted to shared chunk
- Initial page load <50 KB JavaScript
- Tools load on-demand (verify in Network tab)
- No performance regressions (all tools work correctly)
- Lighthouse performance score improves

**Reference**: Vite code splitting docs, current bundle analysis

---

### 11. Clean Up Repository

**Status**: ❌ Not Started
**Estimated Time**: 30 minutes
**Priority**: MEDIUM (housekeeping)

**Issues Found**:

**A. Windows Artifact File**:
- File: `nul` (root directory)
- Cause: Likely from `ls > nul` redirect error (Windows command)
- Action: Delete and add to `.gitignore`

**B. Untracked feedback/ Folder**:
- Path: `feedback/`
- Contains: `lint-problems.txt` and possibly other debug/test files
- Decision needed: Track in git or add to `.gitignore`?

**C. Historical Documentation Consolidation**:
- Path: `historical/` (20+ markdown files)
- Size: Complete development history from v1.0 → v1.6.1
- Opportunity: Archive or consolidate for clarity

**D. Modified Files Not Committed**:
- 13 TypeScript files modified but uncommitted
- May contain work-in-progress changes
- Need review before creating TODO.md commit

**Action Items**:

**Immediate Cleanup** (~15 minutes):
- [ ] Delete `nul` file: `rm nul` (or `del nul` on Windows)
- [ ] Review untracked `feedback/` folder:
  - Option 1: Add to git if contains useful debug info
  - Option 2: Add to `.gitignore` if temporary
- [ ] Review 13 modified files (git diff):
  - Check if changes should be committed
  - Create WIP commit if needed
  - Or stash if experimental

**Historical Documentation** (~15 minutes):
- [ ] Create `historical/README.md` index of all phase docs
- [ ] Consider consolidating small files (e.g., all Phase X.X docs into Phase X)
- [ ] Add archive notice: "This folder contains v1.x development history"
- [ ] No need to delete (valuable history)

**Acceptance Criteria**:
- `nul` file removed
- `feedback/` decision made (tracked or ignored)
- Modified files either committed or stashed
- `historical/` folder organized with index
- Clean `git status` output

---

### 12. Update CLAUDE.md Architecture Documentation

**Status**: ❌ Not Started
**Estimated Time**: 1-2 hours
**Priority**: MEDIUM (documentation improvement)

**Issue**: CLAUDE.md still describes v1.6.1 monolithic HTML architecture, not v2.0.0 TypeScript/Vite structure

**Outdated Sections**:

1. **"Architecture: The Monolithic Pattern"** (lines ~18-30)
   - Describes 1,500-1,900 line HTML files (no longer true)
   - Says "no build process required" (now uses Vite)
   - Talks about code duplication (now modular)

2. **"File Organization"** (lines ~32-60)
   - Lists `*_stable.html` and `*_experimental.html` files (moved to `legacy/`)
   - Doesn't mention `src/` folder structure
   - Missing TypeScript service layer

3. **"Experimental/Stable Workflow"** (lines ~62-120)
   - Entire workflow deprecated (no more experimental/stable copies)
   - Testing checklist still valid but needs updating for npm commands

4. **"Quick Commands & Development Workflow"** (lines ~122-200)
   - Uses Python HTTP server (should use `npm run dev`)
   - No mention of TypeScript compilation
   - CSP instructions outdated

**Action Items**:

**Phase 1: Update Architecture Section** (~30 minutes)
- [ ] Rewrite "Architecture" section to describe v2.0.0 structure:
  - TypeScript + Lit components
  - Vite build system
  - Service layer pattern
  - Shared constants and utilities
- [ ] Keep historical note about monolithic pattern (now in `legacy/`)

**Phase 2: Update File Organization** (~15 minutes)
- [ ] Document current `src/` folder structure:
  ```
  src/
  ├── components/         # Lit web components
  ├── services/          # Business logic layer
  ├── shared/            # Constants, types, utilities
  ├── styles/            # Tailwind + custom CSS
  └── main.ts            # Application entry point
  ```
- [ ] Note that legacy files moved to `legacy/` folder

**Phase 3: Update Development Workflow** (~30 minutes)
- [ ] Replace Python server instructions with:
  - `npm install` - Install dependencies
  - `npm run dev` - Start dev server (Vite)
  - `npm run build` - Production build
  - `npm run preview` - Preview production build
  - `npm run test` - Run tests
  - `npm run lint` - Run linter
- [ ] Update testing checklist for TypeScript environment
- [ ] Remove CSP switching instructions (now automated)

**Phase 4: Add v2.0.0 Migration Guide** (~15 minutes)
- [ ] Create new section: "v2.0.0 Migration from v1.6.x"
- [ ] Document key architectural changes
- [ ] Link to `historical/` folder for v1.x docs

**Acceptance Criteria**:
- Architecture section reflects v2.0.0 TypeScript structure
- File organization shows current `src/` folder
- Development commands use npm/Vite (not Python)
- No references to deprecated experimental/stable workflow
- Migration guide helps contributors understand changes

**Reference**: Current `CLAUDE.md` lines 18-200 (to be updated)

---

## 🟢 LOW PRIORITY (Backlog)

**Estimated Total Time**: ~10 hours
**Goal**: Long-term improvements, technical debt, nice-to-haves

### 13. Improve StorageService Test Coverage

**Status**: ❌ Not Started
**Estimated Time**: 2-3 hours
**Current Coverage**: 79.78%
**Target Coverage**: 90%+

**Current Test File**: `src/services/__tests__/storage-service.test.ts`

**Missing Test Cases**:
- Edge cases for quota exceeded errors
- Concurrent read/write scenarios
- Data corruption handling
- Cache invalidation logic
- Performance tests for large data sets

**Action Items**:
- [ ] Review uncovered lines (use `npm run test -- --coverage`)
- [ ] Write tests for edge cases
- [ ] Add integration tests (with localStorage mock)
- [ ] Test error handling paths
- [ ] Verify coverage reaches 90%+

**Acceptance Criteria**:
- StorageService coverage >90%
- All edge cases tested
- No flaky tests introduced

---

### 14. Add localStorage Encryption and Integrity Checks

**Status**: ❌ Not Started
**Estimated Time**: 4-6 hours
**Priority**: LOW (security enhancement, not critical)

**Current State**:
- localStorage stores data in plain text
- No data integrity checks (could be tampered)
- No size limits enforced (quota exceeded errors possible)

**Security Concerns**:
1. Theme preferences exposed (low risk)
2. Cached market prices could be modified (medium risk)
3. No detection of tampering (low risk for this app)

**Proposed Improvements**:

**A. Data Integrity** (~2 hours):
- [ ] Implement HMAC signing for stored data
- [ ] Add checksum validation on read
- [ ] Detect and handle corrupted data gracefully
- [ ] Clear invalid cache entries automatically

**B. Size Limits** (~1 hour):
- [ ] Enforce maximum cache size (e.g., 5 MB)
- [ ] Implement LRU eviction policy
- [ ] Handle quota exceeded errors gracefully
- [ ] Add telemetry for storage usage

**C. Encryption (Optional)** (~2-3 hours):
- [ ] Research Web Crypto API for client-side encryption
- [ ] Implement AES-GCM encryption for sensitive data
- [ ] Store encryption key securely (IndexedDB or session)
- [ ] Consider performance impact (encryption overhead)

**Note**: For a client-side app with non-sensitive data, encryption may be overkill. Focus on integrity checks first.

**Acceptance Criteria**:
- Data integrity checks implemented
- Corrupted data detected and handled
- Size limits enforced with LRU eviction
- No performance degradation
- All existing functionality works

**Reference**: StorageService implementation in `src/services/storage-service.ts`

---

### 15. Mark legacy/ Folder as Deprecated

**Status**: ❌ Not Started
**Estimated Time**: 30 minutes
**Priority**: LOW (documentation)

**Current State**:
- `legacy/` folder contains 10 monolithic HTML files (v1.6.x)
- Total size: ~884 KB
- Files:
  - `coloraccessibility_stable.html` (105 KB)
  - `coloraccessibility_experimental.html` (103 KB)
  - `colorexplorer_stable.html` (96 KB)
  - `colorexplorer_experimental.html` (95 KB)
  - `colormatcher_stable.html` (85 KB)
  - `colormatcher_experimental.html` (84 KB)
  - `dyecomparison_stable.html` (74 KB)
  - `dyecomparison_experimental.html` (74 KB)
  - `dye-mixer_stable.html` (84 KB)
  - `dye-mixer_experimental.html` (84 KB)

**Purpose**: Keep for historical reference, but clarify they're not maintained

**Action Items**:
- [ ] Create `legacy/README.md` with deprecation notice:
  ```markdown
  # Legacy Files (v1.6.x)

  ⚠️ **DEPRECATED**: These files are no longer maintained.

  This folder contains the original v1.6.x monolithic HTML files.
  For current development, see the v2.0.0 TypeScript codebase in `src/`.

  These files are kept for:
  - Historical reference
  - Comparison with v2.0.0 architecture
  - Rollback capability (if critical v2.0.0 bugs found)

  **Do not edit these files.** All development happens in `src/`.
  ```
- [ ] Add HTML comment to each legacy file (top of file):
  ```html
  <!-- ⚠️ DEPRECATED: This file is no longer maintained. See v2.0.0 in src/ folder. -->
  ```
- [ ] Update main README.md to mention legacy files
- [ ] Consider eventual removal (after v2.0.0 proves stable for 3-6 months)

**Acceptance Criteria**:
- `legacy/README.md` created with clear deprecation notice
- All legacy HTML files have deprecation comment
- Main README.md documents legacy folder
- No confusion about which files to edit

---

### 16. API Security Hardening

**Status**: ❌ Not Started
**Estimated Time**: 3-4 hours
**Priority**: LOW (enhancement, not critical)

**Current API Implementation**: `src/services/api-service.ts`

**Existing Security Features** ✅:
- Rate limiting (respects Universalis API limits)
- Request debouncing (prevents spam)
- Retry logic with exponential backoff
- Error handling with user-friendly messages
- Session-level caching (reduces API calls)

**Potential Security Improvements**:

**A. Cache Validation** (~1 hour):
- [ ] Add cache entry expiration (TTL: 1 hour for prices)
- [ ] Implement cache versioning (invalidate on schema change)
- [ ] Add checksums to detect cache corruption
- [ ] Clear invalid cache entries automatically

**B. Request Signing** (~1 hour):
- [ ] Research if Universalis API supports request signing (likely not)
- [ ] If supported, implement signature generation
- [ ] If not supported, document as not applicable
- [ ] Consider for future private API integrations

**C. Response Validation** (~1 hour):
- [ ] Add JSON schema validation for API responses
- [ ] Detect malformed responses early
- [ ] Handle unexpected fields gracefully
- [ ] Log validation errors for debugging

**D. Size Limits** (~30 minutes):
- [ ] Enforce maximum response size (e.g., 1 MB)
- [ ] Prevent large responses from filling cache
- [ ] Handle oversized responses gracefully
- [ ] Add telemetry for response sizes

**E. API Key Management** (~30 minutes):
- [ ] Document that Universalis is public (no key needed)
- [ ] If future APIs require keys, implement secure storage
- [ ] Never commit API keys to git
- [ ] Use environment variables for sensitive config

**Acceptance Criteria**:
- Cache validation implemented (TTL, checksums)
- Response validation prevents malformed data
- Size limits enforced
- API key management strategy documented
- All security improvements tested

**Note**: Most of these are "nice-to-haves" given Universalis is a public, trusted API. Prioritize other tasks first.

**Reference**: `src/services/api-service.ts` (current implementation)

---

## 📋 Completed Items

*(Items will be moved here as they are completed)*

---

## 📊 Progress Summary

**Total Estimated Time**: ~37.5 hours across all priorities

| Priority | Tasks | Est. Time | Status |
|----------|-------|-----------|--------|
| 🔴 Critical | 5 tasks | ~2.5 hours | ❌ Not Started |
| 🟠 High | 3 tasks | ~10 hours | ❌ Not Started |
| 🟡 Medium | 4 tasks | ~15 hours | ❌ Not Started |
| 🟢 Low | 4 tasks | ~10 hours | ❌ Not Started |

**Next Session Focus**: Complete all Critical priority items (~2.5 hours)

---

## 📝 Notes

- **Version Sync**: Always update FAQ.md, CHANGELOG.md, README.md, and CLAUDE.md together when bumping version
- **Testing**: Run full test suite (`npm run test`) after any service changes
- **Linting**: Run `npm run lint` before committing to catch TypeScript errors early
- **Build**: Run `npm run build` to verify production build succeeds
- **Documentation**: Keep this TODO.md updated as tasks are completed
- **Market Board**: This is the highest-impact user-facing feature to restore

---

## 🔗 References

- Research findings: See comprehensive analysis from November 17, 2025 research session
- Lint problems: `feedback/lint-problems.txt`
- Historical docs: `historical/` folder (20+ phase documentation files)
- Legacy code: `legacy/` folder (v1.6.x monolithic HTML files)
- Current architecture: `src/` folder (v2.0.0 TypeScript/Vite structure)

---

**Last Updated**: November 17, 2025
**Maintained By**: Development Team
**Next Review**: After completing Critical priority items
