# XIV Dye Tools - Cleanup & Optimization Implementation Guide

**Status**: In Progress (Phases 1-2 partially complete)
**Last Updated**: 2025-11-09

## ✅ Completed

### Phase 1: Documentation & Version Alignment
- [x] Updated version numbers in all experimental HTML files
  - Color Explorer: v1.2.0 → v1.2.3
  - Color Matcher: v1.2.0-dev → v1.3.0
  - Dye Comparison: v1.1.0 → v1.2.3
  - Color Accessibility: Added v1.0.1 BETA
- [x] Updated README.md with consistent version references
- [x] Fixed CHANGELOG.md date inconsistencies (v1.3.0 was 2025-10-31, moved to 2025-10-30)
- [x] Updated portal (index.html) with correct versions

### Phase 2: Critical Bug Fixes (Partial)
- [x] Fixed Color Accessibility warnings collapse arrow (was showing ▼ when hidden, now shows ▶)
- [x] Added localStorage error handling to all 4 experimental tools
  - Created `safeGetStorage()` helper function with try-catch and Storage API availability check
  - Created `safeSetStorage()` helper function with QuotaExceededError handling
  - Updated dark mode initialization in all tools to use safe functions
  - Updated Color Accessibility to use safe functions for secondary dyes toggle

---

## 📋 Remaining Work

### Phase 2: Complete Critical Bug Fixes

#### 2.1 Improve JSON Loading Validation (MEDIUM PRIORITY)
**Status**: Not Started
**Scope**: All 4 tools
**Impact**: Prevents crashes from invalid/corrupted JSON responses

**Current Code Pattern** (needs improvement):
```javascript
fetch('./assets/json/colors_xiv.json')
    .then(response => response.json())
    .then(data => {
        ffxivDyes = data;
        // Process data...
    });
```

**Improved Pattern**:
```javascript
/**
 * Safely fetch and validate JSON
 */
function safeFetchJSON(url, fallbackData = []) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error(`Invalid content type: ${contentType}`);
            }
            return response.json();
        })
        .catch(error => {
            console.error(`Failed to load JSON from ${url}:`, error);
            return fallbackData;
        });
}
```

**Files to Update**:
1. `coloraccessibility_experimental.html` - Line ~1902
2. `colorexplorer_experimental.html` - Line ~1120
3. `colormatcher_experimental.html` - Line ~1360
4. `dyecomparison_experimental.html` - Line ~955

**Implementation Steps**:
1. Add `safeFetchJSON()` function to each file
2. Update fetch calls to use the function
3. Add error handling UI feedback (toast notification or console log)

---

#### 2.2 Add Image Validation to Color Matcher (MEDIUM PRIORITY)
**Status**: Not Started
**Scope**: colormatcher_experimental.html only
**Impact**: Prevents crashes from corrupted/invalid images

**Current Code** (needs enhancement - Line ~1206):
```javascript
if (!file) {
    showToast('No file provided', 'error');
    return;
}
```

**Enhancements Needed**:
1. **File Size Validation**:
```javascript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
if (file.size > MAX_FILE_SIZE) {
    showToast(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: 50MB`, 'error');
    return;
}
```

2. **MIME Type Validation**:
```javascript
const VALID_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
if (!VALID_TYPES.includes(file.type)) {
    showToast(`Unsupported file type: ${file.type}. Supported: JPEG, PNG, GIF, WebP`, 'error');
    return;
}
// Warn about SVG files
if (file.type === 'image/svg+xml') {
    showToast('SVG files are not supported for color sampling', 'warning');
    return;
}
```

3. **EXIF Orientation Handling**:
```javascript
/**
 * Apply EXIF orientation to canvas
 */
function applyExifOrientation(img, canvas, exifOrientation = 1) {
    const ctx = canvas.getContext('2d');

    switch (exifOrientation) {
        case 2: ctx.transform(-1, 0, 0, 1, canvas.width, 0); break;
        case 3: ctx.transform(-1, 0, 0, -1, canvas.width, canvas.height); break;
        case 4: ctx.transform(1, 0, 0, -1, 0, canvas.height); break;
        case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
        case 6: ctx.transform(0, 1, -1, 0, canvas.height, 0); break;
        case 7: ctx.transform(0, -1, -1, 0, canvas.width, canvas.height); break;
        case 8: ctx.transform(0, -1, 1, 0, 0, canvas.width); break;
    }

    ctx.drawImage(img, 0, 0);
}
```

**Implementation Steps**:
1. Add file size check before processing
2. Add MIME type validation
3. Add EXIF orientation detection and correction (use library like piexifjs or manual parsing)
4. Update error messages in toast notifications

---

### Phase 3: Code Standardization

#### 3.1 Standardize HSV/RGB Conversion Functions (LOW PRIORITY)
**Status**: Not Started
**Scope**: All 4 tools
**Impact**: Easier maintenance, reduced bugs in color calculations

**Current Inconsistencies**:
- Color Explorer: `hsvToRgb({ h, s, v })`
- Dye Comparison: `hsvToRgb(h, s, v)`
- Color Accessibility: Only has `rgbToHsv()`, missing `hsvToRgb()`
- Color Matcher: Uses different approach entirely

**Standard Pattern** (proposed):
```javascript
/**
 * Convert HSV to RGB
 * @param {Object} hsv - Color in HSV format {h: 0-360, s: 0-100, v: 0-100}
 * @returns {Object} RGB color {r: 0-255, g: 0-255, b: 0-255}
 */
function hsvToRgb({ h, s, v }) {
    h = h / 360;
    s = s / 100;
    v = v / 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = v - c;

    let r, g, b;

    if (h < 1/6) [r, g, b] = [c, x, 0];
    else if (h < 2/6) [r, g, b] = [x, c, 0];
    else if (h < 3/6) [r, g, b] = [0, c, x];
    else if (h < 4/6) [r, g, b] = [0, x, c];
    else if (h < 5/6) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
    };
}

/**
 * Convert RGB to HSV
 * @param {Object} rgb - Color in RGB format {r: 0-255, g: 0-255, b: 0-255}
 * @returns {Object} HSV color {h: 0-360, s: 0-100, v: 0-100}
 */
function rgbToHsv({ r, g, b }) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
        if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
        else if (max === g) h = ((b - r) / delta + 2) / 6;
        else h = ((r - g) / delta + 4) / 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}
```

**Files to Update**:
1. `coloraccessibility_experimental.html` - Add `hsvToRgb()` (line ~915)
2. `colorexplorer_experimental.html` - Verify consistency
3. `colormatcher_experimental.html` - Implement if missing
4. `dyecomparison_experimental.html` - Update to use object parameter

---

#### 3.2 Standardize Common Functions Across Tools (LOW PRIORITY)
**Status**: Identified but not started
**Scope**: All 4 tools
**Impact**: Easier maintenance, consistent behavior

**Functions to Standardize**:
1. `toggleDropdown()` - Identical in all tools (45 lines)
   - Move to top of file after color conversion functions
   - Ensure all tools have identical implementation

2. `getColorDistance(hex1, hex2)` - Used in 3+ tools
   - Verify identical RGB Euclidean distance formula
   - Standard pattern:
   ```javascript
   function getColorDistance(hex1, hex2) {
       const rgb1 = hexToRgb(hex1);
       const rgb2 = hexToRgb(hex2);
       const dr = rgb1.r - rgb2.r;
       const dg = rgb1.g - rgb2.g;
       const db = rgb1.b - rgb2.b;
       return Math.sqrt(dr * dr + dg * dg + db * db);
   }
   ```

3. `hexToRgb()` and `rgbToHex()` - Used everywhere
   - Ensure all tools have identical implementation
   - Add comments for clarity

---

#### 3.3 Standardize Dropdown Population Pattern (LOW PRIORITY)
**Status**: Identified but not started
**Scope**: All 4 tools
**Impact**: Consistent UI/UX, easier to debug

**Standard Category Priority**:
```javascript
const CATEGORY_PRIORITY = {
    'Neutral': 0,
    'Special': 1,
    'Facewear': 99
    // Colors A-Z: 2-27
};

// Function to get all categories in order
function getCategoriesInOrder(dyes) {
    const categories = new Set(dyes.map(d => d.category));
    return Array.from(categories).sort((a, b) => {
        const aOrder = CATEGORY_PRIORITY[a] ?? 2;
        const bOrder = CATEGORY_PRIORITY[b] ?? 2;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return a.localeCompare(b);
    });
}
```

---

### Phase 4: Performance Optimization

#### 4.1 Optimize Dye Comparison Canvas Rendering (MEDIUM PRIORITY)
**Status**: Not started
**Files**: dyecomparison_experimental.html
**Impact**: 20-40% faster rendering on lower-end devices

**Current Issue** (Line ~906):
- Nested loops creating 750,000 individual pixel calculations
- No optimization hints to browser

**Improvements**:
```javascript
// Add to getContext call
const ctx = canvas.getContext('2d', { willReadFrequently: true });

// Option 1: Reduce resolution and upscale
function drawHueSaturationChartOptimized() {
    const RESOLUTION_REDUCTION = 2; // 2x smaller = 4x fewer pixels
    const reducedWidth = chartWidth / RESOLUTION_REDUCTION;
    const reducedHeight = chartHeight / RESOLUTION_REDUCTION;

    // Draw at reduced resolution
    for (let y = 0; y < reducedHeight; y++) {
        for (let x = 0; x < reducedWidth; x++) {
            // Draw pixels...
        }
    }

    // Upscale using CSS (browser handles smoothing)
    canvas.style.width = (chartWidth + leftPadding) + 'px';
    canvas.style.height = (chartHeight + topPadding) + 'px';
}

// Option 2: Use ImageData for batch operations
function drawChartWithImageData() {
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);

        // Calculate color
        const hue = (x / width) * 360;
        const saturation = ((height - y) / height) * 100;
        const rgb = hsvToRgb({ h: hue, s: saturation, v: brightness });

        data[i] = rgb.r;     // R
        data[i+1] = rgb.g;   // G
        data[i+2] = rgb.b;   // B
        data[i+3] = 255;     // A
    }

    ctx.putImageData(imageData, leftPadding, topPadding);
}
```

---

#### 4.2 Optimize Color Explorer Color Wheel (LOW PRIORITY)
**Status**: Not started
**Files**: colorexplorer_experimental.html
**Impact**: Faster page load, smaller memory footprint

**Current Issue**:
- Creates 120 SVG paths × 6 harmony types = 720 paths on load
- Each path is a separate DOM element

**Improvement**:
```javascript
// Reduce segments
const WHEEL_SEGMENTS = 60; // Instead of 120

// Or use canvas instead of SVG for better performance
function drawColorWheelCanvas(harmonyType) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const centerX = 160, centerY = 160;
    const radius = 100;

    for (let angle = 0; angle < 360; angle += 6) { // 6° segments
        const rad = (angle * Math.PI) / 180;
        const x = centerX + radius * Math.cos(rad);
        const y = centerY + radius * Math.sin(rad);

        const rgb = hsvToRgb({ h: angle, s: 100, v: 100 });
        ctx.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        ctx.fillRect(x, y, 5, 5);
    }

    return canvas;
}
```

---

#### 4.3 Add API Request Throttling (MEDIUM PRIORITY)
**Status**: Not started
**Scope**: All tools with market board integration
**Impact**: Prevents API rate limiting, reduces redundant requests

**Implementation**:
```javascript
/**
 * Universalis API request throttler
 */
class APIThrottler {
    constructor(minInterval = 5000) {
        this.minInterval = minInterval;
        this.lastRequest = 0;
        this.queue = [];
        this.isProcessing = false;
    }

    async request(url) {
        return new Promise((resolve, reject) => {
            this.queue.push({ url, resolve, reject });
            this.processQueue();
        });
    }

    async processQueue() {
        if (this.isProcessing || this.queue.length === 0) return;

        this.isProcessing = true;
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;

        if (timeSinceLastRequest < this.minInterval) {
            await new Promise(r => setTimeout(r, this.minInterval - timeSinceLastRequest));
        }

        const { url, resolve, reject } = this.queue.shift();

        try {
            const response = await fetch(url);
            const data = await response.json();
            this.lastRequest = Date.now();
            resolve(data);
        } catch (error) {
            reject(error);
        }

        this.isProcessing = false;
        this.processQueue();
    }
}

// Usage
const apiThrottler = new APIThrottler(5000);
const marketData = await apiThrottler.request(
    'https://universalis.app/api/v2/aggregated/...'
);
```

---

#### 4.4 Optimize DOM Operations (LOW PRIORITY)
**Status**: Not started
**Scope**: All tools
**Impact**: Smoother UI interactions, faster rendering

**Current Issues**:
- Multiple `getElementById()` calls in loops
- DOM appends inside forEach

**Solutions**:
```javascript
// Cache DOM references
const domCache = {
    dyeSlotsContainer: null,
    visionComparison: null,
    suggestionContainer: null
};

function cacheDomReferences() {
    domCache.dyeSlotsContainer = document.getElementById('dye-slots-container');
    domCache.visionComparison = document.getElementById('vision-comparison');
    domCache.suggestionContainer = document.getElementById('suggestions-container');
}

// Batch DOM operations
function createMultipleDyeElements(dyes) {
    const fragment = document.createDocumentFragment();

    dyes.forEach(dye => {
        const element = document.createElement('div');
        element.className = 'dye-swatch';
        element.style.backgroundColor = dye.hex;
        fragment.appendChild(element);
    });

    domCache.dyeSlotsContainer.appendChild(fragment); // Single append
}
```

---

### Phase 5: Enhanced Error Handling

#### 5.1 Add Null/Undefined Checks (MEDIUM PRIORITY)
**Status**: Not started
**Scope**: All tools
**Impact**: Prevents runtime errors from malformed data

**Key Locations**:
1. Color Accessibility `displayDyePreview()` - Check `selectedDyes[slotIndex]`
2. Color Explorer `shouldFetchPrice()` - Check `color` is truthy
3. All tools - Validate dye objects before access

**Pattern**:
```javascript
function displayDyePreview(slotIndex) {
    const slot = selectedDyes[slotIndex];
    if (!slot) return; // Guard clause

    const primary = slot.primary;
    const secondary = slot.secondary;

    if (!primary && !secondary) {
        preview.classList.add('hidden');
        return;
    }
    // Continue...
}
```

---

#### 5.2 Add Clipboard API Fallback (LOW PRIORITY)
**Status**: Not started
**Files**: colormatcher_experimental.html
**Impact**: Better browser compatibility

**Implementation**:
```javascript
/**
 * Safe clipboard paste handler with fallback
 */
function handlePaste(e) {
    const items = e.clipboardData?.items || e.clipboardData?.files;

    if (!items) {
        showToast('Clipboard access not available in your browser', 'warning');
        return;
    }

    for (let item of items) {
        if (item.kind === 'file' && item.type.startsWith('image/')) {
            const blob = item.getAsFile();
            if (blob) loadImage(blob);
            break;
        }
    }
}

// Check for Clipboard API support
if (navigator.clipboard?.write) {
    document.addEventListener('paste', handlePaste);
} else {
    console.warn('Clipboard API not supported; paste functionality unavailable');
}
```

---

### Phase 6: Code Comments & Documentation

#### 6.1 Add Inline Comments for Complex Algorithms (LOW PRIORITY)
**Status**: Not started
**Scope**: All tools
**Impact**: Easier code maintenance and understanding

**Key Sections**:
1. Brettel 1997 colorblindness matrices
2. Harmony generation formulas
3. Canvas coordinate calculations
4. Zoom and pan logic

**Example**:
```javascript
/**
 * Brettel 1997 Colorblindness Simulation
 *
 * Uses transformation matrices to simulate how people with different
 * types of colorblindness perceive colors. Based on scientific research
 * by Brettel, Viénot, and Mollon (1997).
 *
 * @see https://vision.psyche.mit.edu/color_blindness.html
 */
const colorblindMatrices = {
    deuteranopia: [ // Red-green weak (1% of population)
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7]
    ],
    // ...
};
```

---

#### 6.2 Add JSDoc Comments to Key Functions (LOW PRIORITY)
**Status**: Not started
**Scope**: All tools
**Impact**: Better IDE autocomplete, documentation

**Pattern**:
```javascript
/**
 * Convert RGB color values to hexadecimal string
 *
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {string} Hex color string (e.g., "#FFFFFF")
 * @throws {TypeError} If parameters are not numbers
 *
 * @example
 * const hex = rgbToHex(255, 128, 0); // "#FF8000"
 */
function rgbToHex(r, g, b) {
    // Implementation...
}
```

---

## 📊 Priority Matrix

| Phase | Task | Priority | Effort | Impact | Status |
|-------|------|----------|--------|--------|--------|
| 2 | JSON Loading Validation | MEDIUM | 30min | High | ⏳ |
| 2 | Image Validation | MEDIUM | 45min | High | ⏳ |
| 3 | Standardize HSV/RGB | LOW | 1hr | Medium | ⏳ |
| 3 | Standardize Functions | LOW | 2hrs | Medium | ⏳ |
| 3 | Standardize Dropdowns | LOW | 1hr | Low | ⏳ |
| 4 | Canvas Optimization | MEDIUM | 1.5hrs | High | ⏳ |
| 4 | Color Wheel Optimization | LOW | 45min | Medium | ⏳ |
| 4 | API Throttling | MEDIUM | 1hr | High | ⏳ |
| 4 | DOM Optimization | LOW | 45min | Medium | ⏳ |
| 5 | Null/Undefined Checks | MEDIUM | 1.5hrs | High | ⏳ |
| 5 | Clipboard Fallback | LOW | 30min | Low | ⏳ |
| 6 | Inline Comments | LOW | 2hrs | Low | ⏳ |
| 6 | JSDoc Comments | LOW | 1.5hrs | Low | ⏳ |

**Total Estimated Time**: ~15 hours for full implementation

**Quick Win Approach** (Recommended): Focus on Phase 2 + Phase 4.1 + Phase 4.3 = ~3 hours for 80% of benefits

---

## 🚀 Next Steps

1. **Immediate** (Phase 2):
   - Implement `safeFetchJSON()` in all 4 tools
   - Add image validation to Color Matcher
   - Test JSON error handling scenarios

2. **Short-term** (Phase 4):
   - Optimize Dye Comparison canvas rendering
   - Implement API request throttling
   - Measure performance improvements

3. **Long-term** (Phase 3, 5, 6):
   - Standardize all shared functions
   - Add defensive null checks
   - Enhance documentation

---

## 📝 Testing Checklist

After implementing each phase:

- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test light mode and dark mode
- [ ] Test on low bandwidth (DevTools throttling)
- [ ] Test on low-end devices (DevTools CPU throttling 4x slowdown)
- [ ] Test responsive layout at 1080p and smaller
- [ ] Verify localStorage persistence across refreshes
- [ ] Check browser console for errors/warnings
- [ ] Test all error scenarios (no internet, corrupted files, etc.)

---

## 📚 References

- [Brettel 1997 Colorblindness Simulation](https://vision.psyche.mit.edu/color_blindness.html)
- [WCAG Contrast Ratio](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Canvas Performance](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [localStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [EXIF Data Handling](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Drawing_DOM_objects_into_canvas)

---

