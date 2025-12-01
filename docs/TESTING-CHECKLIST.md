# XIV Dye Tools - Comprehensive Feature Testing Checklist

> **Generated**: December 1, 2025
> **Purpose**: Manual QA testing before optimization and coverage tasks
> **Scope**: All features implemented in Phases 1-4 of the UI/UX roadmap

---

## Testing Environment Setup

### Browser Testing Matrix
- [ ] **Chrome (latest)** - Primary testing browser
- [ ] **Firefox (latest)** - Secondary testing
- [ ] **Safari (latest)** - macOS/iOS testing
- [ ] **Edge (latest)** - Windows testing
- [ ] **Mobile Safari** - iOS responsive testing
- [ ] **Chrome Mobile** - Android responsive testing

### Pre-Testing Checklist
- [ ] Clear localStorage: `localStorage.clear()` in DevTools console
- [ ] Clear IndexedDB: DevTools > Application > IndexedDB > Delete database
- [ ] Disable browser extensions that may interfere
- [ ] Test in both normal and incognito mode
- [ ] Network throttling available (DevTools > Network > Slow 3G)

---

## Phase 1: Foundation Features

### F1: Loading Spinners for API Calls
**Location**: Market Board section in Harmony Generator, market prices on dye cards

- [ ] Enable "Show Prices" in Market Board settings
- [ ] Select a dye in Harmony Generator - spinner should appear while fetching
- [ ] Spinner respects reduced motion (pulse instead of spin)
- [ ] Throttle network to Slow 3G - spinner visible for longer duration
- [ ] Spinner disappears when data loads or on error

### F2: Toast Notification System
**Location**: Global - appears in bottom-right corner

- [ ] **Success toast**: Click "Copy Hex" on any dye card
- [ ] **Error toast**: Disconnect network, try to refresh prices
- [ ] **Info toast**: Complete a tutorial step (if triggered)
- [ ] Toast auto-dismisses after ~4 seconds
- [ ] Multiple toasts stack (max 5)
- [ ] Toast has close (X) button
- [ ] Swipe-to-dismiss on mobile devices
- [ ] Toast respects current theme colors

### F3: Empty State Designs
**Location**: Various components when no results

- [ ] **Dye Selector**: Search for "zzzzzzz" - should show "No dyes match your search"
- [ ] **Dye Selector**: Apply all exclusion filters - verify empty state
- [ ] **Harmony Generator**: Without base dye selected - shows empty state
- [ ] **Color Matcher**: Without image uploaded - shows upload prompt
- [ ] Empty states have helpful action buttons where applicable

### T1: SVG Harmony Type Icons
**Location**: Harmony Generator - harmony type buttons

- [ ] All 9 harmony types have SVG icons (not emoji)
- [ ] Icons adapt to current theme (use currentColor)
- [ ] Icons visible in both light and dark themes
- [ ] Icons have proper alt text/titles for accessibility
- [ ] Hover effects work on harmony type buttons

### A1: Keyboard Navigation for Dye Selector
**Location**: Any dye selector grid

- [ ] Tab to dye grid, press Enter to focus first dye
- [ ] Arrow keys navigate between dyes (respects grid layout)
- [ ] Home/End keys jump to first/last dye
- [ ] PageUp/PageDown for multi-row jumps
- [ ] Enter/Space selects focused dye
- [ ] Escape clears selection or blurs
- [ ] `/` or `Ctrl+F` focuses search input
- [ ] Smooth scroll-into-view when navigating to off-screen dyes
- [ ] Focus ring clearly visible on focused dye

---

## Phase 2: Discoverability Features

### O1: First-Time Welcome Modal
**Location**: App startup (first visit only)

- [ ] Clear localStorage, refresh page - modal appears
- [ ] Modal shows 5 tool cards with icons
- [ ] "Quick Tips" section displays correctly
- [ ] "Don't show again" checkbox works
- [ ] "Get Started" button closes modal and marks as seen
- [ ] Close (X) button works
- [ ] Click outside modal closes it (if enabled)
- [ ] Escape key closes modal
- [ ] Modal respects current theme colors
- [ ] After dismissing, modal doesn't reappear on refresh

### O2: Contextual Tooltips for Advanced Features
**Location**: Various tools with info (ⓘ) icons

- [ ] **Deviance Rating** (Harmony Generator) - tooltip explains what it means
- [ ] **Sample Size** (Color Matcher) - tooltip explains pixel averaging
- [ ] **WCAG Contrast** (Accessibility Checker) - tooltip explains ratings
- [ ] Tooltips appear on hover (desktop) and tap (mobile)
- [ ] Tooltips position correctly (don't overflow viewport)
- [ ] Tooltips are keyboard accessible (focus triggers them)

### O3: "What's New" Changelog Modal
**Location**: App startup after version update

- [ ] Update version in localStorage to trigger: `localStorage.setItem('xivdyetools_last_version_viewed', '1.0.0')`
- [ ] Refresh page - changelog modal should appear
- [ ] Modal shows recent changes with version number
- [ ] "Got it!" button closes modal
- [ ] "View full changelog" link opens changelog
- [ ] Modal doesn't show if version matches stored version

### T2: Color Matcher Live Preview
**Location**: Color Matcher - when sampling colors

- [ ] Upload an image
- [ ] Click on image to sample color
- [ ] Preview overlay appears showing sampled color vs matched dye color
- [ ] Overlay has magnifying glass icon header
- [ ] Overlay shows "Sample Point Preview" title
- [ ] Overlay positions correctly (doesn't overflow canvas)

### T3: Harmony Generator Quick-Add Actions
**Location**: Harmony Generator - dye action dropdown (⋮ menu)

- [ ] Click ⋮ on any harmony dye card
- [ ] Dropdown shows: Add to Comparison, Add to Mixer, Copy Hex
- [ ] Only one dropdown open at a time (clicking another closes previous)
- [ ] "Add to Comparison" navigates to Comparison tool with dye added
- [ ] "Add to Mixer" navigates to Mixer tool
- [ ] "Copy Hex" copies hex code and shows toast

### Q1: Hover Micro-Interactions on Dye Swatches
**Location**: All dye swatches throughout app

- [ ] Dye swatches scale up slightly on hover (transform: scale)
- [ ] Subtle shadow appears on hover
- [ ] Selected dyes have checkmark indicator
- [ ] Hover effects disabled when `prefers-reduced-motion: reduce`

---

## Phase 3: Polish Features

### A2: Focus Ring Visibility
**Location**: All interactive elements

- [ ] Tab through page - focus rings clearly visible on all focusable elements
- [ ] Focus rings use theme-aware colors
- [ ] Focus ring is 3px solid with 2px offset
- [ ] Focus visible on: buttons, links, inputs, dye swatches, dropdown items

### A3: Screen Reader Announcements
**Location**: Throughout app (requires screen reader)

- [ ] **Test with NVDA/VoiceOver**: Select a dye - announcement occurs
- [ ] Harmony generation results are announced
- [ ] Color matching results are announced
- [ ] Tool navigation is announced
- [ ] Announcements use `aria-live="polite"`

### A4: Reduced Motion Preference Support
**Location**: All animations

- [ ] Enable reduced motion: Windows/macOS system settings
- [ ] Theme transitions become instant (no fade)
- [ ] Toast notifications appear without slide animation
- [ ] Modal opens without zoom animation
- [ ] Dye swatch hover uses opacity instead of scale
- [ ] Loading spinner uses pulse instead of spin

### T4: Dye Mixer Interactive Gradient Stops
**Location**: Dye Mixer - gradient preview

- [ ] Select two dyes in Mixer
- [ ] Gradient preview shows stop markers below the gradient bar
- [ ] Clicking a stop marker highlights the corresponding dye card
- [ ] "Click a stop marker to highlight the corresponding dye" hint visible
- [ ] Stop positions correspond to interpolation steps

### T5: Color Matcher Recent Colors History
**Location**: Color Matcher - below image upload area

- [ ] Sample several colors from an image
- [ ] "Recent Picks" section shows last 5 sampled colors
- [ ] Click a recent color to re-match it
- [ ] "Clear" button removes all recent colors
- [ ] Recent colors persist after page reload (localStorage)
- [ ] Recent colors shown as compact swatches

### O4: Keyboard Shortcuts Reference Panel
**Location**: Press `?` key anywhere in app

- [ ] Press `?` - shortcuts panel modal appears
- [ ] Panel shows all available shortcuts organized by category
- [ ] Navigation shortcuts listed (1-5 for tools, Escape)
- [ ] Quick actions listed (Shift+T, Shift+L)
- [ ] Dye selection shortcuts listed
- [ ] Modal closes with Escape or close button
- [ ] Shortcuts actually work as documented

### Q2: Smooth Theme Transitions
**Location**: Theme switcher

- [ ] Change theme - colors transition smoothly (200ms)
- [ ] Background, text, and borders all transition together
- [ ] Transition disabled when reduced motion preferred
- [ ] No flash or jarring color changes

---

## Phase 4: Advanced Features

### T6: Save Favorite Palettes
**Location**: Harmony Generator - bookmark icon on harmony cards

- [ ] Generate harmonies for a dye
- [ ] Click bookmark icon on a harmony card - palette saved
- [ ] Toast confirms "Palette saved!"
- [ ] Click "Saved Palettes" button to view saved palettes
- [ ] Modal shows all saved palettes with preview
- [ ] Click "Load" to restore palette settings
- [ ] Click "Delete" to remove a palette
- [ ] "Export All" downloads palettes as JSON
- [ ] "Import" allows uploading palette JSON
- [ ] Palettes persist after page reload

### A5: High Contrast Theme Options
**Location**: Theme switcher dropdown

- [ ] **High Contrast (Light)** theme available
- [ ] **High Contrast (Dark)** theme available
- [ ] High contrast themes meet WCAG AAA (21:1 contrast)
- [ ] Pure black/white colors used for maximum contrast
- [ ] All interactive elements clearly visible
- [ ] **Windows High Contrast Mode**: Enable in Windows settings
- [ ] App respects forced-colors media query
- [ ] Color swatches preserve their colors (forced-color-adjust: none)

### T7: Camera Capture for Color Matcher
**Location**: Color Matcher - desktop camera button (hidden on mobile)

- [ ] **Desktop with webcam**: "Use Webcam" button visible
- [ ] **Desktop without webcam**: Button hidden or shows "No camera detected"
- [ ] Click "Use Webcam" - camera preview modal opens
- [ ] Live video feed displays in modal
- [ ] "Capture" button takes still frame
- [ ] Captured image loads into Color Matcher canvas
- [ ] **Mobile**: Uses native `<input capture="environment">` instead
- [ ] Camera permission denied - shows appropriate error message
- [ ] Multiple cameras available - can switch between them

### F4: IndexedDB Offline Mode
**Location**: Throughout app when offline

- [ ] **Test offline**: DevTools > Network > Offline
- [ ] Offline banner appears at top of page
- [ ] Banner message: "You are offline. Some features may be limited."
- [ ] Go online - banner dismisses
- [ ] **Price cache**: Previously fetched prices available offline
- [ ] New price requests show "unavailable while offline" message
- [ ] **Settings persistence**: All settings saved to IndexedDB
- [ ] **Palette persistence**: Saved palettes stored in IndexedDB

### O5: Interactive Tutorial System
**Location**: Can be triggered from Welcome Modal or Help menu

- [ ] Clear tutorials: Run in console to reset all tutorials
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
