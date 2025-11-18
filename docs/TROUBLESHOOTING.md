# XIV Dye Tools - Troubleshooting & Common Gotchas

Common issues developers encounter and their solutions, plus important gotchas to watch out for.

---

## Common Gotchas & Warnings

### 1. Service Layer Dependencies

**⚠️ Important**:
- v2.0.0 uses a service layer pattern
- Services are singletons shared across all components
- Changing a service affects all tools that use it

**How to Handle**:
- Test changes in ALL tools that use the service
- Check `src/services/__tests__/` for existing tests
- Add tests when modifying service behavior
- Services to watch: `DyeService`, `ColorService`, `APIService`, `ThemeService`, `StorageService`

**Example - Modifying ColorService**:
```typescript
// If you modify getColorDistance() in ColorService...
// Test these tools: Color Matcher, Dye Comparison, Color Harmony Explorer
```

**Example - Service Usage Mapping**:
```
ColorService:
  ├─ Color Accessibility Checker (colorblind simulation)
  ├─ Color Harmony Explorer (harmony calculations)
  ├─ Color Matcher (RGB distance matching)
  ├─ Dye Comparison (distance metrics)
  └─ Dye Mixer (interpolation)

DyeService:
  ├─ Color Harmony Explorer (filtering)
  ├─ Color Matcher (closest match)
  ├─ Dye Comparison (selection)
  └─ Dye Mixer (intermediate dyes)

APIService:
  ├─ Color Harmony Explorer (market prices)
  ├─ Color Matcher (market prices)
  └─ Dye Comparison (market prices)

ThemeService:
  ├─ All tools (theme application)
  └─ Components (CSS variables)

StorageService:
  ├─ All tools (preferences persistence)
  └─ All services (data caching)
```

---

### 2. Theme System CSS Variables

**⚠️ Important**:
- All colors use CSS custom properties: `var(--theme-primary)`, `var(--theme-text)`, etc.
- **Never use hardcoded colors** (e.g., `#3B82F6`, `blue-600`)
- Theme changes apply globally across all components

**Available Theme Variables**:
- `--theme-primary` - Primary accent color
- `--theme-background` - Main background
- `--theme-text` - Primary text color
- `--theme-border` - Border colors
- `--theme-background-secondary` - Secondary background
- `--theme-card-background` - Card background
- `--theme-text-muted` - Muted/secondary text

**How to Use**:
```typescript
// ✅ CORRECT - Use CSS variable
style: 'color: var(--theme-primary);'

// ❌ WRONG - Hardcoded color
className: 'text-blue-600'
```

**When Adding New Colors to a Theme**:
1. Define in `src/styles/themes.css` for all 12 themes
2. Test in light AND dark variants
3. Verify contrast ratio (WCAG AA minimum: 4.5:1 for text)
4. Test in all 5 tools

---

### 3. Version Number Synchronization

**⚠️ Important**:
- Version appears in multiple files: `package.json`, `README.md`, `CHANGELOG.md`, `FAQ.md`, `CLAUDE.md`, `docs/README.md`
- Use consistent versioning (v2.0.0, v2.1.0, etc.)

**When Bumping Version** (e.g., v2.0.0 → v2.1.0):

1. **Update package.json**:
   ```bash
   npm version minor  # Or: npm version patch, npm version major
   # This automatically updates package.json and creates a git tag
   ```

2. **Update documentation files**:
   ```bash
   grep -rn "v2\.0\.0" README.md CHANGELOG.md FAQ.md CLAUDE.md docs/
   # Replace all occurrences with v2.1.0
   # Can use find-and-replace in editor
   ```

3. **Update CHANGELOG.md**:
   ```markdown
   ## v2.1.0 - November XX, 2025

   ### Added
   - New feature descriptions

   ### Changed
   - Improvements and updates

   ### Fixed
   - Bug fixes
   ```

4. **Commit and tag**:
   ```bash
   git add .
   git commit -m "Release: v2.1.0 - [description]"
   git tag v2.1.0
   git push origin main --tags
   ```

**Note**: v2.0.0 uses single-codebase architecture. All tools share the same version number.

---

### 4. Development Server Required

**⚠️ Important**:
- Vite dev server required for development
- Opening `dist/index.html` directly won't work properly
- Module imports require HTTP server

**Solution**:
- Always use `npm run dev` for development
- Use `npm run preview` to test production build
- Never use `file:///` protocol

**Error Message You'll See**:
```
Access to script at 'file:///.../main.ts' has been blocked by CORS policy
```

---

### 5. 375 px Button Overflow

**Symptoms**: Buttons such as “Generate” or “Clear” bleed past their container on iPhone SE/Pixel 5 widths (~375 px).

**Cause**: Horizontal button rows (`flex gap-2`) with fixed-width buttons (`px-6`) that never wrap.

**Fix Pattern**:

```typescript
className: 'flex flex-col sm:flex-row gap-2'
// ...
className: 'w-full sm:w-auto px-6 py-2 ...'
```

- Use `flex-col` on mobile, switch to `flex-row` at `sm`.
- Add `w-full sm:w-auto` to buttons so they stretch on narrow screens.
- `dye-selector` and `harmony-generator-tool` already follow this pattern—copy it for new components.

**Testing**: Resize devtools to 375 px or use responsive mode to confirm buttons stack correctly.

---

## Problem: localStorage Not Persisting

**Symptoms**: Theme selection doesn't persist after page refresh

**Diagnosis Steps**:
1. Open DevTools (F12)
2. Go to Application tab → Storage → localStorage
3. Look for `xivdyetools_theme` key
4. If key is missing, storage might be disabled or full

**Solutions**:

1. **Check if browser storage is enabled**:
   - Chrome: Settings → Privacy and Security → Site Settings → Cookies and site data
   - Firefox: about:preferences → Privacy & Security → Cookies and Site Data
   - Safari: Preferences → Privacy → Website Data

2. **Check localStorage quota**:
   ```javascript
   // In browser console
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('Storage available');
   } catch (e) {
     console.error('Storage full or disabled:', e.message);
   }
   ```

3. **Clear browser cache**:
   - Ctrl+Shift+Delete / Cmd+Shift+Delete
   - Select "All time" and "Cookies and cached images"
   - Retry

4. **Check for QuotaExceededError** in console:
   - Open DevTools Console tab
   - Look for red errors with "QuotaExceededError"
   - If found, clear localStorage: `localStorage.clear()`

5. **Verify StorageService is being called**:
   - Set breakpoint in `src/services/storage-service.ts`
   - Confirm `setItem()` is called when setting theme
   - Check return value

---

## Problem: Theme Not Applying

**Symptoms**: Selected theme doesn't appear, colors don't change

**Diagnosis Steps**:
1. Inspect `<body>` element (right-click → Inspect)
2. Check if class is applied: should be `standard-light`, `hydaelyn-dark`, etc.
3. Check if CSS variables are defined in `src/styles/themes.css`

**Solutions**:

1. **Verify body element has correct class**:
   ```javascript
   // In browser console
   console.log(document.body.className); // Should show theme name
   ```

2. **Verify CSS variables are defined**:
   ```javascript
   // In browser console
   const styles = getComputedStyle(document.body);
   console.log(styles.getPropertyValue('--theme-primary')); // Should show color
   ```

3. **Check for CSS conflicts**:
   - Inspect element and look for conflicting styles
   - Verify `src/styles/themes.css` has highest specificity
   - Check that `!important` is not used improperly

4. **Hard refresh to clear cache**:
   - Ctrl+Shift+R / Cmd+Shift+R
   - Or: DevTools → Network tab → Disable cache

5. **Verify ThemeService.setTheme() was called**:
   - Add console.log in ThemeService
   - Check browser console for theme change logs
   - Verify localStorage key `xivdyetools_theme` is set

**Debug Code**:
```typescript
// Add to ThemeService.setTheme() for debugging
static setTheme(themeName: ThemeName): void {
  console.log('Setting theme to:', themeName);
  document.body.className = themeName;
  appStorage.setItem(STORAGE_KEYS.THEME, themeName);
  console.log('Theme set. Body class:', document.body.className);
  this.notifyListeners(themeName);
}
```

---

## Problem: API Integration Not Working

**Symptoms**: Market prices not showing, but tools still work

**Diagnosis**:
- This is **not a critical failure** - API is optional
- Tools work without prices (graceful fallback)

**Solutions**:

1. **Check if Universalis API is accessible**:
   ```javascript
   // In browser console
   fetch('https://universalis.app/api/v2/aggregated/primary/1/primary')
     .then(r => r.json())
     .then(d => console.log('API accessible:', d))
     .catch(e => console.error('API error:', e));
   ```

2. **Check browser console for errors**:
   - Open DevTools → Console tab
   - Look for fetch/CORS errors
   - Check "Network" tab to see API requests

3. **Verify API configuration**:
   - Check `UNIVERSALIS_API_BASE` in `src/shared/constants.ts`
   - Should be: `https://universalis.app/api/v2`
   - Verify timeout is reasonable (5000ms default)

4. **Check cache**:
   ```typescript
   // In browser console
   const apiService = window.APIService;
   apiService.clearCache(); // If exposed for debugging
   ```

5. **Features work without API**:
   - Color Harmony Explorer: Shows without prices
   - Color Matcher: Shows without prices
   - Dye Comparison: Shows without prices
   - This is intentional - graceful degradation

---

## Problem: Canvas Charts Not Rendering

**Symptoms**: Dye Comparison charts appear blank or undefined

**Diagnosis Steps**:
1. Open DevTools Console
2. Look for canvas-related errors
3. Verify dye colors are valid hex values
4. Check that canvas element exists in DOM

**Solutions**:

1. **Check browser supports Canvas 2D**:
   ```javascript
   // In browser console
   const canvas = document.createElement('canvas');
   const ctx = canvas.getContext('2d');
   console.log('Canvas supported:', ctx !== null);
   ```

2. **Verify chart data**:
   - Select 2-4 dyes in Dye Comparison
   - Open DevTools Console
   - Check that dyes have valid hex colors (e.g., #FF0000)

3. **Check for canvas errors**:
   - Open DevTools Console
   - Look for errors like "Cannot read property 'strokeStyle' of null"
   - If found, canvas context not initialized

4. **Test zoom controls**:
   - Use +/- buttons to zoom in/out
   - Try "Fit" button to reset zoom
   - Canvas should update

5. **Try different browsers**:
   - Chrome (primary - should always work)
   - Firefox (secondary - good compatibility)
   - Safari (last - may have quirks)
   - If works in one browser but not another, likely browser-specific issue

**Debug Code**:
```typescript
// Add to dye-comparison-tool.ts for debugging
private debugChart(): void {
  console.log('Chart state:');
  console.log('Selected dyes:', this.selectedDyeIds);
  console.log('Canvas element:', this.canvas);
  console.log('Canvas context:', this.ctx);
  if (this.selectedDyes.length === 0) {
    console.warn('No dyes selected for comparison');
  }
}
```

---

## Problem: TypeScript Compilation Errors

**Symptoms**: Build fails, errors in terminal

**Solutions**:

1. **Check error message**:
   ```bash
   npm run build
   # Read error output carefully
   ```

2. **Type errors in services**:
   - Check imports match exported types
   - Verify function signatures match interface definitions
   - Use strict mode checking: `npm run lint`

3. **Missing types**:
   ```bash
   # Look for "Cannot find module '@/...'
   # Verify path aliases in tsconfig.json
   ```

4. **Clean build**:
   ```bash
   rm -rf dist node_modules/.vite
   npm run build
   ```

---

## Problem: Tests Failing

**Symptoms**: `npm run test` shows failures

**Solutions**:

1. **Check test output**:
   ```bash
   npm run test
   # Read which tests are failing
   ```

2. **Run single test file**:
   ```bash
   npm run test -- color-service.test.ts
   ```

3. **Run with verbose output**:
   ```bash
   npm run test -- --reporter=verbose
   ```

4. **Check test coverage**:
   ```bash
   npm run test -- --coverage
   # Identify uncovered code paths
   ```

5. **Update snapshots if intentional**:
   ```bash
   npm run test -- --update
   ```

---

## Problem: Image Not Loading in Color Matcher

**Symptoms**: Drag-drop doesn't work, image shows error

**Solutions**:

1. **Check image format**:
   - Supported: PNG, JPG, GIF, WebP
   - Verify file has correct extension
   - Try a different image file

2. **Check file size**:
   - Maximum: 20MB
   - If larger, compression needed

3. **Check CORS**:
   - Image from same domain: should work
   - Image from external domain: may need CORS headers

4. **Try alternative input methods**:
   - Use color picker instead of image
   - Use eyedropper tool on existing image
   - Paste from clipboard (Ctrl+V / Cmd+V)

5. **Check console for errors**:
   - Open DevTools Console
   - Look for "Not allowed to load local resource"
   - This is expected for file:// protocol, use `npm run dev` instead

---

## Problem: Responsive Design Not Working

**Symptoms**: Layout doesn't adapt to mobile screen, navigation not visible

**Solutions**:

1. **Verify viewport meta tag**:
   ```html
   <!-- Check index.html for -->
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   ```

2. **Test with DevTools device emulation**:
   - F12 → Responsive Design Mode (Ctrl+Shift+M)
   - Select "iPhone 12" or "iPad" preset
   - Navigation should switch at 768px

3. **Check breakpoint**:
   - Mobile: ≤768px (bottom nav visible)
   - Desktop: >768px (tools dropdown visible)
   - Test at exactly 768px edge case

4. **Verify CSS media queries**:
   - `md:` breakpoint = 768px
   - Check `src/styles/globals.css` for responsive rules

5. **Clear cache**:
   - Hard refresh (Ctrl+Shift+R)
   - May be cached CSS issue

---

## Performance Issues

**Symptoms**: App slow, lag when switching tools, canvas rendering slow

**Solutions**:

1. **Check DevTools Performance tab**:
   - F12 → Performance tab
   - Record action (switch tools, change theme)
   - Look for long main thread blocking

2. **Canvas optimization** (Dye Comparison):
   - Already using resolution reduction (`CHART_RESOLUTION_REDUCTION = 2`)
   - Avoid selecting many dyes (performance degrades with 4+ dyes)
   - Try zooming instead of rendering full resolution

3. **Check for memory leaks**:
   - F12 → Memory tab
   - Take heap snapshot before/after action
   - Compare snapshots for growing memory

4. **Reduce image size** (Color Matcher):
   - Large images (>5MB) slower to process
   - Reduce resolution before uploading
   - Use JPEG instead of PNG if quality acceptable

5. **Check network tab**:
   - F12 → Network tab
   - Look for slow API calls
   - Universalis API might be slow (retry logic helps)

---

## Browser Compatibility Issues

**Problem**: Works in Chrome but not Firefox/Safari

**Solutions**:

1. **Check browser console**:
   - Open DevTools in problem browser
   - Look for specific errors
   - Different browsers throw different errors

2. **Common issues by browser**:

   **Firefox**:
   - ESC-6 support might lag Chrome
   - Flexbox may behave slightly differently
   - Canvas performance good

   **Safari**:
   - localStorage might have quota limits
   - Some CSS properties might not work
   - ES6 support slightly behind Chrome

   **Edge**:
   - Chromium-based, usually matches Chrome
   - Usually works if Chrome works

3. **Use feature detection**:
   ```typescript
   // Instead of checking browser, detect feature
   const supportsCanvas = !!document.createElement('canvas').getContext;
   const supportsLocalStorage = typeof localStorage !== 'undefined';
   ```

---

## Harmony Explorer Triadic Bug

**Status**: HIGH PRIORITY - Under Investigation

**Issue**: Some dyes show only 1 triadic match instead of 2

**Affected Dyes**: Dragoon Blue, Carmine Red, Canary Yellow (and possibly others)

**Potential Causes**:
1. Advanced dye filters hiding matches
2. Deviance threshold too high, early termination
3. Harmony calculation bug for specific hue values
4. Insufficient dyes in database for all hue combinations
5. Facewear exclusion removing valid matches

**Investigation Steps** (for developer):
1. Check `findTriadicDyes()` in DyeService
2. Verify harmony angle calculations
3. Test with filters disabled
4. Check deviance scores for triadic dyes
5. Count available dyes for problematic hues

**Workaround**: Use Expanded Suggestions mode to see additional similar dyes

---

## Related Documentation

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design
- **[SERVICES.md](./SERVICES.md)** - Service layer
- **[TOOLS.md](./TOOLS.md)** - Tool descriptions
- **[README.md](../docs/README.md)** - Documentation index
