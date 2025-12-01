# XIV Dye Tools - Comprehensive Feature Testing Checklist

> **Generated**: December 1, 2025
> **Purpose**: Manual QA testing before optimization and coverage tasks
> **Scope**: All features implemented in Phases 1-4 of the UI/UX roadmap

---

## Testing Environment Setup

### Browser Testing Matrix
- [x] **Chrome (latest)** - Primary testing browser
- [ ] **Firefox (latest)** - Secondary testing
- [ ] **Safari (latest)** - macOS/iOS testing
- [ ] **Edge (latest)** - Windows testing
- [ ] **Mobile Safari** - iOS responsive testing
- [ ] **Chrome Mobile** - Android responsive testing

### Pre-Testing Checklist
- [x] Clear localStorage: `localStorage.clear()` in DevTools console
- [x] Clear IndexedDB: DevTools > Application > IndexedDB > Delete database
- [x] Disable browser extensions that may interfere
- [x] Test in both normal and incognito mode
- [x] Network throttling available (DevTools > Network > Slow 3G)

---

## Phase 1: Foundation Features

### F1: Loading Spinners for API Calls
**Location**: Market Board section in Harmony Generator, market prices on dye cards

- [x] Enable "Show Prices" in Market Board settings
- [ ] Select a dye in Harmony Generator - spinner should appear while fetching
- [ ] Spinner respects reduced motion (pulse instead of spin)
- [ ] Throttle network to Slow 3G - spinner visible for longer duration
- [ ] Spinner disappears when data loads or on error

### F2: Toast Notification System
**Location**: Global - appears in bottom-right corner

- [x] **Success toast**: Click "Copy Hex" on any dye card
- [ ] **Error toast**: Disconnect network, try to refresh prices
- [ ] **Info toast**: Complete a tutorial step (if triggered)
- [x] Toast auto-dismisses after ~4 seconds
- [x] Multiple toasts stack (max 5)
- [x] Toast has close (X) button
- [x] Swipe-to-dismiss on mobile devices
- [ ] Toast respects current theme colors

### F3: Empty State Designs
**Location**: Various components when no results

- [x] **Dye Selector**: Search for "zzzzzzz" - should show "No dyes match your search"
- [x] **Dye Selector**: Apply all exclusion filters - verify empty state
- [ ] **Harmony Generator**: Without base dye selected - shows empty state
- [ ] **Color Matcher**: Without image uploaded - shows upload prompt
- [ ] Empty states have helpful action buttons where applicable

### T1: SVG Harmony Type Icons
**Location**: Harmony Generator - harmony type buttons

- [x] All 9 harmony types have SVG icons (not emoji)
- [ ] Icons adapt to current theme (use currentColor)
- [x] Icons visible in both light and dark themes
- [x] Icons have proper alt text/titles for accessibility
- [ ] Hover effects work on harmony type buttons

### A1: Keyboard Navigation for Dye Selector
**Location**: Any dye selector grid

- [x] Tab to dye grid, press Enter to focus first dye
- [x] Arrow keys navigate between dyes (respects grid layout)
- [x] Home/End keys jump to first/last dye
- [x] PageUp/PageDown for multi-row jumps
- [x] Enter/Space selects focused dye
- [x] Escape clears selection or blurs
- [x] `/` or `Ctrl+F` focuses search input
- [x] Smooth scroll-into-view when navigating to off-screen dyes
- [x] Focus ring clearly visible on focused dye

---

## Phase 2: Discoverability Features

### O1: First-Time Welcome Modal
**Location**: App startup (first visit only)

- [x] Clear localStorage, refresh page - modal appears
- [x] Modal shows 5 tool cards with icons
- [x] "Quick Tips" section displays correctly
- [x] "Don't show again" checkbox works
- [x] "Get Started" button closes modal and marks as seen
- [x] Close (X) button works
- [x] Click outside modal closes it (if enabled)
- [ ] Escape key closes modal
- [x] Modal respects current theme colors
- [x] After dismissing, modal doesn't reappear on refresh

### O2: Contextual Tooltips for Advanced Features
**Location**: Various tools with info (ⓘ) icons

- [x] **Deviance Rating** (Harmony Generator) - tooltip explains what it means
- [x] **Sample Size** (Color Matcher) - tooltip explains pixel averaging
- [x] **WCAG Contrast** (Accessibility Checker) - tooltip explains ratings
- [x] Tooltips appear on hover (desktop) and tap (mobile)
- [x] Tooltips position correctly (don't overflow viewport)
- [x] Tooltips are keyboard accessible (focus triggers them)

### O3: "What's New" Changelog Modal
**Location**: App startup after version update

- [x] Update version in localStorage to trigger: `localStorage.setItem('xivdyetools_last_version_viewed', '1.0.0')`
- [x] Refresh page - changelog modal should appear
- [x] Modal shows recent changes with version number
- [x] "Got it!" button closes modal
- [x] "View full changelog" link opens changelog
- [x] Modal doesn't show if version matches stored version

### T2: Color Matcher Live Preview
**Location**: Color Matcher - when sampling colors

- [x] Upload an image
- [x] Click on image to sample color
- [x] Preview overlay appears showing sampled color vs matched dye color
- [x] Overlay has magnifying glass icon header
- [x] Overlay shows "Sample Point Preview" title
- [ ] Overlay positions correctly (doesn't overflow canvas)

### T3: Harmony Generator Quick-Add Actions
**Location**: Harmony Generator - dye action dropdown (⋮ menu)

- [x] Click ⋮ on any harmony dye card
- [x] Dropdown shows: Add to Comparison, Add to Mixer, Copy Hex
- [x] Only one dropdown open at a time (clicking another closes previous)
- [x] "Add to Comparison" navigates to Comparison tool with dye added
- [x] "Add to Mixer" navigates to Mixer tool
- [x] "Copy Hex" copies hex code and shows toast

### Q1: Hover Micro-Interactions on Dye Swatches
**Location**: All dye swatches throughout app

- [x] Dye swatches scale up slightly on hover (transform: scale)
- [ ] Subtle shadow appears on hover
- [ ] Selected dyes have checkmark indicator
- [ ] Hover effects disabled when `prefers-reduced-motion: reduce`

---

## Phase 3: Polish Features

### A2: Focus Ring Visibility
**Location**: All interactive elements

- [x] Tab through page - focus rings clearly visible on all focusable elements
- [x] Focus rings use theme-aware colors
- [x] Focus ring is 3px solid with 2px offset
- [x] Focus visible on: buttons, links, inputs, dye swatches, dropdown items

### A3: Screen Reader Announcements
**Location**: Throughout app (requires screen reader)

- [ ] **Test with NVDA/VoiceOver**: Select a dye - announcement occurs
- [ ] Harmony generation results are announced
- [ ] Color matching results are announced
- [ ] Tool navigation is announced
- [ ] Announcements use `aria-live="polite"`

### A4: Reduced Motion Preference Support
**Location**: All animations

- [x] Enable reduced motion: Windows/macOS system settings
- [x] Theme transitions become instant (no fade)
- [x] Toast notifications appear without slide animation
- [x] Modal opens without zoom animation
- [x] Dye swatch hover uses opacity instead of scale
- [ ] Loading spinner uses pulse instead of spin

### T4: Dye Mixer Interactive Gradient Stops
**Location**: Dye Mixer - gradient preview

- [x] Select two dyes in Mixer
- [x] Gradient preview shows stop markers below the gradient bar
- [x] Clicking a stop marker highlights the corresponding dye card
- [x] "Click a stop marker to highlight the corresponding dye" hint visible
- [x] Stop positions correspond to interpolation steps

### T5: Color Matcher Recent Colors History
**Location**: Color Matcher - below image upload area

- [x] Sample several colors from an image
- [x] "Recent Picks" section shows last 5 sampled colors
- [x] Click a recent color to re-match it
- [x] "Clear" button removes all recent colors
- [x] Recent colors persist after page reload (localStorage)
- [x] Recent colors shown as compact swatches

### O4: Keyboard Shortcuts Reference Panel
**Location**: Press `?` key anywhere in app

- [x] Press `?` - shortcuts panel modal appears
- [x] Panel shows all available shortcuts organized by category
- [x] Navigation shortcuts listed (1-5 for tools, Escape)
- [x] Quick actions listed (Shift+T, Shift+L)
- [x] Dye selection shortcuts listed
- [ ] Modal closes with Escape or close button
- [ ] Shortcuts actually work as documented

### Q2: Smooth Theme Transitions
**Location**: Theme switcher

- [x] Change theme - colors transition smoothly (200ms)
- [x] Background, text, and borders all transition together
- [ ] Transition disabled when reduced motion preferred
- [x] No flash or jarring color changes

---

## Phase 4: Advanced Features

### T6: Save Favorite Palettes
**Location**: Harmony Generator - bookmark icon on harmony cards

- [x] Generate harmonies for a dye
- [x] Click bookmark icon on a harmony card - palette saved
- [x] Toast confirms "Palette saved!"
- [x] Click "Saved Palettes" button to view saved palettes
- [x] Modal shows all saved palettes with preview
- [x] Click "Load" to restore palette settings
- [x] Click "Delete" to remove a palette
- [x] "Export All" downloads palettes as JSON
- [ ] "Import" allows uploading palette JSON
- [x] Palettes persist after page reload

### A5: High Contrast Theme Options
**Location**: Theme switcher dropdown

- [x] **High Contrast (Light)** theme available
- [x] **High Contrast (Dark)** theme available
- [x] High contrast themes meet WCAG AAA (21:1 contrast)
- [x] Pure black/white colors used for maximum contrast
- [x] All interactive elements clearly visible
- [x] **Windows High Contrast Mode**: Enable in Windows settings
- [x] App respects forced-colors media query
- [x] Color swatches preserve their colors (forced-color-adjust: none)

### T7: Camera Capture for Color Matcher
**Location**: Color Matcher - desktop camera button (hidden on mobile)

- [x] **Desktop with webcam**: "Use Webcam" button visible
- [x] **Desktop without webcam**: Button hidden or shows "No camera detected"
- [x] Click "Use Webcam" - camera preview modal opens
- [x] Live video feed displays in modal
- [x] "Capture" button takes still frame
- [x] Captured image loads into Color Matcher canvas
- [ ] **Mobile**: Uses native `<input capture="environment">` instead
- [x] Camera permission denied - shows appropriate error message
- [x] Multiple cameras available - can switch between them

### F4: IndexedDB Offline Mode
**Location**: Throughout app when offline

- [x] **Test offline**: DevTools > Network > Offline
- [ ] Offline banner appears at top of page
- [ ] Banner message: "You are offline. Some features may be limited."
- [ ] Go online - banner dismisses
- [x] **Price cache**: Previously fetched prices available offline
- [x] New price requests show "unavailable while offline" message
- [x] **Settings persistence**: All settings saved to IndexedDB
- [x] **Palette persistence**: Saved palettes stored in IndexedDB

### O5: Interactive Tutorial System
**Location**: Can be triggered from Welcome Modal or Help menu

- [x] Clear tutorials: Run in console to reset all tutorials
  ```javascript
  ['harmony','matcher','comparison','mixer','accessibility'].forEach(t =>
    localStorage.removeItem('xivdyetools_tutorial_' + t)
  );
  ```
- [ ] **Start tutorial**: `TutorialService.start('harmony')` in console
- [ ] Spotlight overlay appears highlighting target element
- [ ] Tooltip shows step title and description
- [ ] "Step X of Y" indicator visible
- [ ] Progress dots show current position
- [ ] "Next" button advances to next step
- [ ] "Previous" button goes back (if not first step)
- [ ] "Skip" button ends tutorial without marking complete
- [ ] "Finish" on last step marks tutorial complete
- [ ] Escape key skips tutorial
- [ ] Spotlight follows target element on window resize
- [ ] Tutorial completion persisted (doesn't repeat)
- [ ] Reduced motion: fade instead of zoom animations

---

## Cross-Cutting Concerns

### Localization (6 Languages)
**Languages**: English, Japanese, German, French, Korean, Chinese

- [ ] Switch to each language via Language selector
- [ ] All UI text updates correctly
- [ ] Tutorial strings localized
- [ ] Offline banner localized
- [ ] Camera capture strings localized
- [ ] No missing translation keys (check console for warnings)

### Theme System (11 Themes)
**Themes**: Standard L/D, Hydaelyn, OG Classic, Parchment, Cotton Candy, Sugar Riot, Grayscale L/D, High Contrast L/D

- [ ] Each theme applies correctly
- [ ] All components respect theme colors
- [ ] Export buttons use theme colors
- [ ] Toast notifications use theme colors
- [ ] Tutorial spotlight/tooltip uses theme colors
- [ ] Modals use theme colors

### Responsive Design
- [ ] **Mobile (< 640px)**: Bottom navigation visible, no horizontal scroll
- [ ] **Tablet (640px - 1024px)**: Layout adjusts appropriately
- [ ] **Desktop (> 1024px)**: Full layout with dropdowns

### Performance
- [ ] Initial load time < 3 seconds on 4G
- [ ] No jank during theme switching
- [ ] Dye selector renders 136 dyes smoothly
- [ ] Image upload/processing doesn't freeze UI

### Accessibility
- [ ] All interactive elements focusable via keyboard
- [ ] Color contrast meets WCAG AA minimum
- [ ] Screen reader can navigate all content
- [ ] No content only conveyed by color alone

---

## Bug Regression Testing

### Previously Fixed Issues (Verify No Regression)
- [ ] Harmony dropdown menus don't stack when clicking multiple
- [ ] Color Matcher tooltip positions correctly with canvas transforms
- [ ] Welcome Modal uses theme colors (not hardcoded)
- [ ] Dye action dropdowns close when clicking elsewhere
- [ ] Mobile bottom nav highlights active tool correctly
- [ ] Search input doesn't lose focus during typing

---

## Sign-Off

| Tester | Date | Browser | Pass/Fail | Notes |
|--------|------|---------|-----------|-------|
| | | | | |
| | | | | |
| | | | | |

---

**Legend**:
- ✅ Pass
- ❌ Fail (document issue)
- ⚠️ Partial (works but with issues)
- N/A Not applicable to this environment
