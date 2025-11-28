# Localization Implementation TODO

**Feature:** Multi-language support (i18n)
**Target Version:** 2.1.0
**Date Started:** 2025-11-27

---

## Phase 1: Foundation

### 1.1 Update Core Dependency
- [ ] Update `package.json`: `xivdyetools-core` from `^1.1.0` to `^1.2.0`
- [ ] Run `npm install`
- [ ] Verify core LocalizationService is available

### 1.2 Create Type Definitions
- [ ] Create `src/shared/i18n-types.ts`
  - [ ] Define `LocaleCode` type (`'en' | 'ja' | 'de' | 'fr' | 'ko' | 'zh'`)
  - [ ] Define `LocaleDisplay` interface
  - [ ] Define web app translation key types (optional, for strict typing)

### 1.3 Create LanguageService
- [ ] Create `src/services/language-service.ts`
  - [ ] Implement `initialize()` - load saved locale or detect browser
  - [ ] Implement `setLocale(locale)` - set locale in core + load web translations
  - [ ] Implement `getCurrentLocale()` - return current locale
  - [ ] Implement `subscribe(listener)` - return unsubscribe function
  - [ ] Implement `t(key)` - get web app translation with fallback
  - [ ] Implement proxy methods: `getDyeName()`, `getCategory()`, `getHarmonyType()`, `getVisionType()`, `getAcquisition()`
  - [ ] Implement `detectBrowserLocale()` - parse navigator.language
  - [ ] Implement `loadWebAppTranslations(locale)` - dynamic import of JSON

### 1.4 Update Constants
- [ ] Modify `src/shared/constants.ts`
  - [ ] Add `SUPPORTED_LOCALES` array
  - [ ] Add `DEFAULT_LOCALE` constant
  - [ ] Add `LOCALE_DISPLAY_INFO` array with flags and names
  - [ ] Add `STORAGE_KEYS.LOCALE`

### 1.5 Update Service Exports
- [ ] Modify `src/services/index.ts` to export `LanguageService`

**Git Commit:** `feat(i18n): add LanguageService and localization foundation`

---

## Phase 2: UI Component

### 2.1 Create LanguageSelector Component
- [ ] Create `src/components/language-selector.ts`
  - [ ] Extend `BaseComponent`
  - [ ] Implement `render()` - button + dropdown with flags
  - [ ] Implement `bindEvents()` - toggle, selection, outside click, ESC
  - [ ] Implement `onMount()` - subscribe to LanguageService and ThemeService
  - [ ] Implement `onUnmount()` - cleanup subscriptions
  - [ ] Add `close-other-dropdowns` event coordination

### 2.2 Update AppLayout
- [ ] Modify `src/components/app-layout.ts`
  - [ ] Add `#language-selector-container` div to header right container
  - [ ] Position between tools dropdown and theme switcher
  - [ ] Initialize `LanguageSelector` in `onMount()`
  - [ ] Destroy `LanguageSelector` in `destroy()`

### 2.3 Update Component Exports
- [ ] Modify `src/components/index.ts` to export `LanguageSelector`

**Git Commit:** `feat(i18n): add LanguageSelector component to header`

---

## Phase 3: Translation Files

### 3.1 Create English Translations (Source of Truth)
- [ ] Create `src/locales/` directory
- [ ] Create `src/locales/en.json` with all ~250 strings
  - [ ] `app` section (title, loading, error)
  - [ ] `header` section (tools, theme, language)
  - [ ] `footer` section (version, createdBy, disclaimer)
  - [ ] `tools` section (all 5 tools: title, shortName, description, subtitle)
  - [ ] `common` section (generate, select, copy, export, etc.)
  - [ ] `harmony` section (tool-specific)
  - [ ] `matcher` section (tool-specific)
  - [ ] `accessibility` section (tool-specific)
  - [ ] `comparison` section (tool-specific)
  - [ ] `mixer` section (tool-specific)
  - [ ] `filters` section
  - [ ] `marketBoard` section
  - [ ] `export` section
  - [ ] `errors` section
  - [ ] `success` section
  - [ ] `themes` section

### 3.2 Create Translated Versions
- [ ] Create `src/locales/ja.json` (Japanese)
- [ ] Create `src/locales/de.json` (German)
- [ ] Create `src/locales/fr.json` (French)
- [ ] Create `src/locales/ko.json` (Korean)
- [ ] Create `src/locales/zh.json` (Chinese)

**Git Commit:** `feat(i18n): add translation files for 6 languages`

---

## Phase 4: Component Refactoring

### 4.1 Core Components
- [ ] Update `src/main.ts`
  - [ ] Import `LanguageService`
  - [ ] Call `LanguageService.initialize()` before app init
  - [ ] Subscribe to language changes for tool navigation updates

### 4.2 Navigation Components
- [ ] Update `src/components/tools-dropdown.ts`
  - [ ] Replace hardcoded tool names with `LanguageService.t()`
  - [ ] Subscribe to language changes
- [ ] Update `src/components/mobile-bottom-nav.ts`
  - [ ] Replace hardcoded short names with `LanguageService.t()`
  - [ ] Subscribe to language changes

### 4.3 Layout Components
- [ ] Update `src/components/app-layout.ts`
  - [ ] Localize header title
  - [ ] Localize footer text
  - [ ] Subscribe to language changes
- [ ] Update `src/components/theme-switcher.ts`
  - [ ] Localize theme display names
  - [ ] Subscribe to language changes

### 4.4 Tool Components
- [ ] Update `src/components/harmony-generator-tool.ts`
  - [ ] Localize title, subtitle
  - [ ] Localize harmony type names (use core `getHarmonyType()`)
  - [ ] Localize all UI labels
  - [ ] Subscribe to language changes
- [ ] Update `src/components/color-matcher-tool.ts`
  - [ ] Localize all UI text
  - [ ] Subscribe to language changes
- [ ] Update `src/components/accessibility-checker-tool.ts`
  - [ ] Localize vision type labels (use core `getVisionType()`)
  - [ ] Localize all UI text
  - [ ] Subscribe to language changes
- [ ] Update `src/components/dye-comparison-tool.ts`
  - [ ] Localize all UI text
  - [ ] Subscribe to language changes
- [ ] Update `src/components/dye-mixer-tool.ts`
  - [ ] Localize all UI text
  - [ ] Subscribe to language changes

### 4.5 Supporting Components
- [ ] Update `src/components/dye-selector.ts`
  - [ ] Localize dye names (use core `getDyeName()`)
  - [ ] Localize category names (use core `getCategory()`)
  - [ ] Subscribe to language changes
- [ ] Update `src/components/dye-filters.ts`
  - [ ] Localize filter labels
  - [ ] Subscribe to language changes
- [ ] Update `src/components/market-board.ts`
  - [ ] Localize category labels
  - [ ] Localize UI text
  - [ ] Subscribe to language changes
- [ ] Update `src/components/palette-exporter.ts`
  - [ ] Localize export options
  - [ ] Subscribe to language changes

**Git Commit:** `feat(i18n): refactor all components to use localized strings`

---

## Phase 5: Testing & Documentation

### 5.1 Unit Tests
- [ ] Create `src/services/__tests__/language-service.test.ts`
  - [ ] Test initialization
  - [ ] Test locale switching
  - [ ] Test subscriber notification
  - [ ] Test translation retrieval
  - [ ] Test fallback behavior
- [ ] Create `src/components/__tests__/language-selector.test.ts`
  - [ ] Test render
  - [ ] Test dropdown behavior
  - [ ] Test language selection

### 5.2 Documentation
- [ ] Update `package.json` version to `2.1.0`
- [ ] Update project `CLAUDE.md` with localization section
- [ ] Update `README.md` to document language support

### 5.3 Manual Testing
- [ ] Test all 6 languages
- [ ] Test browser language detection
- [ ] Test localStorage persistence
- [ ] Test mobile bottom nav
- [ ] Verify dye names use official translations
- [ ] Verify no regressions

**Git Commit:** `test(i18n): add localization tests and documentation`

---

## Post-Implementation

### Native Speaker Review
- [ ] English - self-review
- [ ] Japanese - needs review
- [ ] German - needs review
- [ ] French - needs review
- [ ] Korean - needs review
- [ ] Chinese - needs review

### Final Steps
- [ ] Address any review feedback
- [ ] Final testing pass
- [ ] Version bump and release

---

## Progress Tracking

| Phase | Status | Commit |
|-------|--------|--------|
| Phase 1: Foundation | Not Started | |
| Phase 2: UI Component | Not Started | |
| Phase 3: Translation Files | Not Started | |
| Phase 4: Component Refactoring | Not Started | |
| Phase 5: Testing & Documentation | Not Started | |
