/**
 * XIV Dye Tools - Shared Components & Utilities
 * Provides common functionality for all tools (navigation, footer, dark mode, etc.)
 */

// ===== STORAGE KEYS =====
const THEME_KEY = 'xivdyetools_theme';

// ===== THEME UTILITY FUNCTIONS =====
/**
 * Get computed CSS variable value from body element
 * Used by canvas rendering and dynamic color styling
 * @param {string} varName - CSS variable name (with or without --)
 * @returns {string} The computed CSS variable value
 */
function getThemeColor(varName) {
    const cleanVarName = varName.startsWith('--') ? varName : `--${varName}`;
    const value = getComputedStyle(document.body).getPropertyValue(cleanVarName).trim();
    return value;
}

// ===== SAFE STORAGE UTILITIES =====
/**
 * Safely retrieve a value from localStorage with error handling
 * @param {string} key - The storage key
 * @param {*} defaultValue - The default value if key doesn't exist or error occurs
 * @returns {*} The stored value or default value
 */
function safeGetStorage(key, defaultValue) {
    try {
        const value = localStorage.getItem(key);
        return value !== null ? value : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage (key: ${key}):`, error);
        return defaultValue;
    }
}

/**
 * Safely store a value in localStorage with error handling
 * @param {string} key - The storage key
 * @param {*} value - The value to store
 */
function safeSetStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        if (error.name === 'QuotaExceededError') {
            console.warn(`localStorage quota exceeded for key: ${key}`);
        } else {
            console.error(`Error writing to localStorage (key: ${key}):`, error);
        }
    }
}

/**
 * Safely fetch and validate JSON data with error handling
 * @param {string} url - URL to fetch JSON from
 * @param {*} fallbackData - Data to return if fetch fails (default: [])
 * @returns {Promise} Promise that resolves to parsed JSON or fallbackData
 */
function safeFetchJSON(url, fallbackData = []) {
    return fetch(url)
        .then(response => {
            const contentType = response.headers.get('content-type');
            console.log(`[safeFetchJSON] Fetching ${url}: HTTP ${response.status}, Content-Type: ${contentType}`);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // First, try to get the response as text so we can inspect it
            return response.text().then(text => {
                console.log(`[safeFetchJSON] Response received, length: ${text.length} chars`);

                // Try to parse the text as JSON
                try {
                    const data = JSON.parse(text);
                    console.log(`[safeFetchJSON] Successfully parsed JSON from ${url}`);
                    return data;
                } catch (parseError) {
                    console.error(`[safeFetchJSON] JSON parse failed for ${url}:`, parseError.message);
                    console.error(`[safeFetchJSON] Response preview (first 300 chars): ${text.substring(0, 300)}`);
                    throw new Error(`Invalid JSON response: ${parseError.message}`);
                }
            });
        })
        .catch(error => {
            console.error(`[safeFetchJSON] Failed to load JSON from ${url}:`, error.message);
            return fallbackData;
        });
}

// ===== COLOR CONVERSION UTILITIES =====
/**
 * Convert hexadecimal color string to RGB object
 * Standardized across all tools
 *
 * @param {string} hex - Hex color string (with or without '#')
 * @returns {Object} RGB object with r, g, b (0-255), falls back to black on error
 * @example
 * hexToRgb("#FF0000") // { r: 255, g: 0, b: 0 }
 * hexToRgb("00FF00") // { r: 0, g: 255, b: 0 }
 */
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }; // Fallback to black on invalid input
}

/**
 * Convert RGB color values to hexadecimal string
 * Standardized across all tools
 *
 * @param {number} r - Red channel (0-255)
 * @param {number} g - Green channel (0-255)
 * @param {number} b - Blue channel (0-255)
 * @returns {string} Hex color string in format "#RRGGBB"
 */
function rgbToHex(r, g, b) {
    const componentToHex = (c) => ('0' + Math.round(c).toString(16)).slice(-2);
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

/**
 * Convert RGB color values to HSV (Hue, Saturation, Value)
 *
 * @param {number} r - Red channel value (0-255)
 * @param {number} g - Green channel value (0-255)
 * @param {number} b - Blue channel value (0-255)
 * @returns {Object} HSV object with properties:
 *   - h {number} Hue in degrees (0-360)
 *   - s {number} Saturation as percentage (0-100)
 *   - v {number} Value as percentage (0-100)
 * @example
 * const hsv = rgbToHsv(255, 0, 0); // Red: { h: 0, s: 100, v: 100 }
 */
function rgbToHsv(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta === 0) h = 0;
    else if (max === r) h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / delta + 2) / 6;
    else h = ((r - g) / delta + 4) / 6;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        v: Math.round(v * 100)
    };
}

/**
 * Convert HSV color values to RGB
 *
 * @param {number} h - Hue in degrees (0-360)
 * @param {number} s - Saturation as percentage (0-100)
 * @param {number} v - Value as percentage (0-100)
 * @returns {Object} RGB object with r, g, b values (0-255)
 */
function hsvToRgb(h, s, v) {
    // Normalize saturation and value to 0-1 range
    s /= 100;
    v /= 100;

    // Calculate chroma and intermediate variables
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;

    // Determine RGB components based on hue sector
    let r_prime, g_prime, b_prime;
    if (h >= 0 && h < 60) { [r_prime, g_prime, b_prime] = [c, x, 0]; }
    else if (h >= 60 && h < 120) { [r_prime, g_prime, b_prime] = [x, c, 0]; }
    else if (h >= 120 && h < 180) { [r_prime, g_prime, b_prime] = [0, c, x]; }
    else if (h >= 180 && h < 240) { [r_prime, g_prime, b_prime] = [0, x, c]; }
    else if (h >= 240 && h < 300) { [r_prime, g_prime, b_prime] = [x, 0, c]; }
    else { [r_prime, g_prime, b_prime] = [c, 0, x]; }

    // Convert to 0-255 range and return
    return {
        r: Math.round((r_prime + m) * 255),
        g: Math.round((g_prime + m) * 255),
        b: Math.round((b_prime + m) * 255)
    };
}

/**
 * Calculate Euclidean distance between two colors in RGB space
 *
 * Uses the standard RGB Euclidean distance formula:
 * distance = sqrt((r1-r2)² + (g1-g2)² + (b1-b2)²)
 *
 * Range: 0 (identical colors) to ~441 (white vs black)
 * Used for finding closest matching dyes and color similarity analysis
 *
 * @param {Object} rgb1 - First color with properties r, g, b (0-255)
 * @param {Object} rgb2 - Second color with properties r, g, b (0-255)
 * @returns {number} Euclidean distance in RGB space
 * @example
 * const dist = colorDistance({ r: 255, g: 0, b: 0 }, { r: 0, g: 0, b: 0 }); // 255
 */
function colorDistance(rgb1, rgb2) {
    // Guard: Validate input objects
    if (!rgb1 || !rgb2 || typeof rgb1.r !== 'number' || typeof rgb2.r !== 'number') {
        console.warn('Invalid color objects passed to colorDistance');
        return 0;
    }

    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

/**
 * Wrapper for backward compatibility - converts hex to RGB and calls colorDistance
 * @param {string} hex1 - First color hex string
 * @param {string} hex2 - Second color hex string
 * @returns {number} Color distance between the two hex colors
 * @deprecated Use colorDistance() directly with RGB objects instead
 */
function getColorDistance(hex1, hex2) {
    const rgb1 = hexToRgb(hex1);
    const rgb2 = hexToRgb(hex2);
    return colorDistance(rgb1, rgb2);
}

// ===== CATEGORY & DYE UTILITIES =====
/**
 * Get category priority for sorting
 * Standardized category ordering across all tools:
 * - Neutral: 0
 * - Colors (A-Z): 1-26 (when encountered in data, treated as priority 2 for unknown categories)
 * - Special: 98
 * - Facewear: 99 (typically excluded from filtering)
 *
 * @param {string} category - The dye category name
 * @returns {number} Priority value for sorting (lower values appear first)
 */
function getCategoryPriority(category) {
    const priorityMap = {
        'Neutral': 0,
        'Special': 98,
        'Facewear': 99
    };
    // Default priority for unknown "Colors" categories is 1-26 range (2 as default)
    return priorityMap[category] !== undefined ? priorityMap[category] : 2;
}

/**
 * Sort dyes by category (using priority) and then by name alphabetically
 * Used by all dropdown population functions for consistent ordering
 *
 * @param {Array} dyes - Array of dye objects
 * @returns {Array} Sorted dye array
 */
function sortDyesByCategory(dyes) {
    return [...dyes].sort((a, b) => {
        const aPriority = getCategoryPriority(a.category);
        const bPriority = getCategoryPriority(b.category);

        // Sort by category priority first
        if (aPriority !== bPriority) {
            return aPriority - bPriority;
        }

        // Then by category name alphabetically (for unknown categories)
        const categoryComparison = a.category.localeCompare(b.category);
        if (categoryComparison !== 0) {
            return categoryComparison;
        }

        // Finally by dye name alphabetically
        return a.name.localeCompare(b.name);
    });
}

/**
 * Populate a dye dropdown with organized categories and standardized sorting
 * Creates optgroups for each category, sorted by priority, with dyes alphabetically ordered
 *
 * Pattern: Used by all tools for consistent dropdown generation
 * - All dyes sorted by getCategoryPriority() and then by name
 * - Dyes grouped into optgroups by category
 * - Each optgroup contains dyes alphabetically sorted by name
 * - Option values use itemID for database lookup
 *
 * @param {HTMLSelectElement} select - The select dropdown element to populate
 * @param {Array} dyeArray - Array of dye objects (defaults to global ffxivDyes if available)
 */
function populateDyeDropdown(select, dyeArray = null) {
    // Guard: Validate select element
    if (!select) {
        console.warn('populateDyeDropdown: Invalid select element');
        return;
    }

    // Use provided array or fall back to global ffxivDyes
    const dyes = dyeArray || (typeof ffxivDyes !== 'undefined' ? ffxivDyes : []);

    if (!dyes || dyes.length === 0) {
        console.warn('populateDyeDropdown: No dye data available');
        return;
    }

    // Clear existing options (but keep the default option if it exists)
    const defaultOption = select.querySelector('option');
    if (defaultOption && defaultOption.textContent.includes('...')) {
        // Keep the default option
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
    } else {
        select.innerHTML = '';
    }

    // Sort dyes using standardized function
    const sortedDyes = sortDyesByCategory(dyes);

    // Group dyes by category
    const dyesByCategory = {};
    sortedDyes.forEach(dye => {
        if (!dyesByCategory[dye.category]) {
            dyesByCategory[dye.category] = [];
        }
        dyesByCategory[dye.category].push(dye);
    });

    // Get categories in priority order
    const categories = Object.keys(dyesByCategory).sort((a, b) => {
        const aPriority = getCategoryPriority(a);
        const bPriority = getCategoryPriority(b);
        if (aPriority !== bPriority) return aPriority - bPriority;
        return a.localeCompare(b);
    });

    // Populate dropdown with optgroups
    categories.forEach(category => {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;

        // Dyes are already sorted alphabetically from sortDyesByCategory
        dyesByCategory[category].forEach(dye => {
            const option = document.createElement('option');
            option.value = dye.itemID;
            option.textContent = dye.name;
            optgroup.appendChild(option);
        });

        select.appendChild(optgroup);
    });
}

// ===== API THROTTLER CLASS =====
/**
 * API Request Throttler for Universalis API
 * Prevents rate limiting by enforcing minimum interval between requests
 * Uses a queue system to process requests sequentially
 */
class APIThrottler {
    constructor(minInterval = 500) {
        this.minInterval = minInterval; // Milliseconds between requests
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

        // Wait if not enough time has passed since last request
        if (timeSinceLastRequest < this.minInterval) {
            const waitTime = this.minInterval - timeSinceLastRequest;
            await new Promise(r => setTimeout(r, waitTime));
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

// Global throttler instance for Universalis API (500ms minimum between requests)
// Available to all tools and pages that load shared-components.js
const apiThrottler = new APIThrottler(500);

// ===== MIGRATION FUNCTIONS =====
/**
 * Migrate legacy dark mode preferences to new unified theme system
 * Gracefully converts old tool-specific localStorage keys to new system
 *
 * Legacy keys: colorMatcher_darkMode, colorExplorer_darkMode, dyeComparison_darkMode
 * New key: xivdyetools_theme (unified across all tools)
 *
 * Migration logic:
 * 1. If new key already exists, skip migration (already migrated)
 * 2. Check for any old dark mode keys
 * 3. If found, convert to appropriate theme (standard-dark or standard-light)
 * 4. Clean up old keys to prevent confusion
 */
function migrateThemePreferences() {
    const oldKeys = [
        'colorMatcher_darkMode',
        'colorExplorer_darkMode',
        'dyeComparison_darkMode'
    ];
    const newKey = THEME_KEY; // 'xivdyetools_theme'

    // Guard: If already migrated, don't process again
    if (safeGetStorage(newKey, null) !== null) {
        return;
    }

    // Check for any old dark mode setting
    for (const oldKey of oldKeys) {
        const wasDarkMode = safeGetStorage(oldKey, null);
        if (wasDarkMode === 'true') {
            // User had dark mode enabled - migrate to dark theme
            safeSetStorage(newKey, 'standard-dark');
            console.log(`Migrated theme preference from ${oldKey} (dark) to ${newKey}`);
            break;
        }
    }

    // If no migration occurred, set default light theme
    if (safeGetStorage(newKey, null) === null) {
        safeSetStorage(newKey, 'standard-light');
    }

    // Clean up old keys to prevent confusion
    oldKeys.forEach(key => {
        localStorage.removeItem(key);
    });
}

// ===== THEME FUNCTIONS =====
/**
 * Available unified themes with light/dark variants
 * Format: "base-variant" where base is the theme and variant is light/dark
 */
const AVAILABLE_THEMES = [
    'standard-light',    // Standard Light (default)
    'standard-dark',     // Standard Dark
    'hydaelyn-light',    // Hydaelyn Light (Light Blue)
    'hydaelyn-dark',     // Hydaelyn Dark (Dark Blue)
    'classic-ff-light',  // Classic Final Fantasy Light (Medium Blue)
    'classic-ff-dark',   // Classic Final Fantasy Dark (Very Dark Blue)
    'parchment-light',   // Parchment Light (Warm Beige)
    'parchment-dark',    // Parchment Dark (Dark Brown)
    'sugar-riot-light',  // Sugar Riot Light (Bright Pink)
    'sugar-riot-dark'    // Sugar Riot Dark (Deep Pink)
];

/**
 * Get CSS class name for unified theme
 * Unified themes use the full name as CSS class (e.g., "theme-classic-ff-light")
 * @param {string} themeName - Unified theme name (e.g., "hydaelyn-dark", "standard-light")
 * @returns {string} CSS class name to apply (or null for standard-light which is default)
 */
function getThemeClassName(themeName) {
    // Standard light is the default, no class needed
    if (themeName === 'standard-light') {
        return null;
    }

    // Return the unified name as-is (e.g., "classic-ff-light" becomes "theme-classic-ff-light")
    return themeName;
}

/**
 * Initialize theme from localStorage
 */
function initTheme() {
    const savedTheme = safeGetStorage(THEME_KEY, 'standard-light');
    setTheme(savedTheme);
}

/**
 * Set active theme - applies unified theme class with all colors defined
 * @param {string} themeName - Unified theme name (e.g., "hydaelyn-dark", "standard-light")
 */
function setTheme(themeName) {
    if (!AVAILABLE_THEMES.includes(themeName)) {
        console.warn(`Invalid theme: ${themeName}. Defaulting to standard-light.`);
        themeName = 'standard-light';
    }

    // Remove all existing theme classes (from old naming or other themes)
    AVAILABLE_THEMES.forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });

    // Also remove any old-style classes that might exist
    ['theme-light', 'theme-dark', 'theme-hydaelyn', 'theme-classic-ff', 'theme-parchment', 'theme-sugar-riot'].forEach(className => {
        document.body.classList.remove(className);
    });

    // Remove dark-mode class (no longer used with unified themes)
    document.body.classList.remove('dark-mode');

    // Apply new unified theme class
    const themeClass = getThemeClassName(themeName);
    if (themeClass) {
        document.body.classList.add(`theme-${themeClass}`);
    }

    // Save to localStorage
    safeSetStorage(THEME_KEY, themeName);

    // Dispatch custom event for theme change
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: themeName } }));
}

/**
 * Get current active theme
 * @returns {string} Current unified theme name
 */
function getActiveTheme() {
    return safeGetStorage(THEME_KEY, 'standard-light');
}

// ===== DROPDOWN FUNCTIONS =====
/**
 * Toggle dropdown menu visibility
 * @param {HTMLElement} button - The button that triggered the dropdown
 */
function toggleDropdown(button) {
    const dropdown = button.nextElementSibling;
    if (!dropdown) return;

    dropdown.classList.toggle('show');
}

/**
 * Toggle theme switcher menu visibility
 * @param {HTMLElement} button - The button that triggered the theme switcher
 */
function toggleThemeSwitcher(button) {
    const menu = button.nextElementSibling;
    if (!menu) return;

    menu.classList.toggle('show');
}

/**
 * Global handler for closing menus when clicking outside
 * Attached once on page load to handle all dropdowns and menus
 */
document.addEventListener('click', (e) => {
    // Close Tools dropdown if clicking outside
    const toolsDropdown = document.querySelector('.nav-dropdown .nav-dropdown-menu.show');
    if (toolsDropdown && !e.target.closest('.nav-dropdown')) {
        toolsDropdown.classList.remove('show');
    }

    // Close Theme menu if clicking outside
    const themeMenu = document.querySelector('.theme-switcher .theme-switcher-menu.show');
    if (themeMenu && !e.target.closest('.theme-switcher')) {
        themeMenu.classList.remove('show');
    }
});

// ===== COMPONENT LOADING FUNCTIONS =====
/**
 * Load an external component HTML file and insert it into the DOM
 * Includes graceful fallback for network/loading failures
 *
 * @param {string} url - The URL of the component file
 * @param {string} containerId - The ID of the container element
 */
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const html = await response.text();
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = html;
        } else {
            console.warn(`Container with ID "${containerId}" not found`);
        }
    } catch (error) {
        console.error(`Failed to load component from ${url}:`, error);

        // Show minimal fallback UI
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div style="padding: 0.75rem; background-color: #fff3cd; color: #856404; border-radius: 4px; font-size: 12px;">
                    <small><strong>⚠️</strong> Navigation unavailable (${error.message}).
                    <a href="index.html" style="color: #856404; text-decoration: underline;">Return home</a></small>
                </div>
            `;
        }
    }
}

/**
 * Initialize all shared components (nav, footer)
 */
function initComponents() {
    loadComponent('components/nav.html', 'nav-container');
    loadComponent('components/footer.html', 'footer-container');
}

/**
 * Remove loading placeholders after components are loaded
 */
function removeLoadingPlaceholders() {
    document.querySelectorAll('.component-loading').forEach(el => {
        el.classList.remove('component-loading');
    });
}

// ===== MARKET BOARD UTILITIES =====
/**
 * Centralized price category definitions used by all tools
 * Defines which dye acquisitions belong to which category
 * Used for market price filtering and display
 */
const PRICE_CATEGORIES = {
    'baseDyes': {
        name: 'Base Dyes',
        acquisitions: ['Dye Vendor'],
        default: false
    },
    'craftDyes': {
        name: 'Craft Dyes',
        acquisitions: ['Crafting', 'Treasure Chest'],
        default: true
    },
    'alliedSocietyDyes': {
        name: 'Allied Society Dyes',
        acquisitions: ['Amalj\'aa Vendor', 'Ixali Vendor', 'Sahagin Vendor', 'Kobold Vendor', 'Sylphic Vendor'],
        default: false
    },
    'cosmicDyes': {
        name: 'Cosmic Dyes',
        acquisitions: ['Cosmic Exploration', 'Cosmic Fortunes'],
        default: true
    },
    'specialDyes': {
        name: 'Special Dyes',
        category: 'Special',
        default: true
    }
};

/**
 * Check if a dye should have its price fetched based on current filter settings
 *
 * @param {Object} dye - Dye object with properties: itemID, acquisition, category
 * @returns {boolean} True if dye matches at least one enabled price category filter
 */
function shouldFetchPrice(dye) {
    // Guard: Validate dye object
    if (!dye) return false;
    if (!dye.itemID) return false;

    // Check Special category (uses category field instead of acquisition)
    const specialCheckbox = document.getElementById('mb-price-special');
    if (specialCheckbox && specialCheckbox.checked && dye.category === 'Special') {
        return true;
    }

    // Guard: Validate acquisition exists for other checks
    if (!dye.acquisition) return false;

    // Check Base Dyes
    const baseCheckbox = document.getElementById('mb-price-base');
    if (baseCheckbox && baseCheckbox.checked &&
        PRICE_CATEGORIES.baseDyes.acquisitions.includes(dye.acquisition)) {
        return true;
    }

    // Check Craft Dyes
    const craftCheckbox = document.getElementById('mb-price-craft');
    if (craftCheckbox && craftCheckbox.checked &&
        PRICE_CATEGORIES.craftDyes.acquisitions.includes(dye.acquisition)) {
        return true;
    }

    // Check Allied Society Dyes (formerly "Beast Tribe Dyes")
    const alliedCheckbox = document.getElementById('mb-price-allied');
    if (alliedCheckbox && alliedCheckbox.checked &&
        PRICE_CATEGORIES.alliedSocietyDyes.acquisitions.includes(dye.acquisition)) {
        return true;
    }

    // Check Cosmic Dyes
    const cosmicCheckbox = document.getElementById('mb-price-cosmic');
    if (cosmicCheckbox && cosmicCheckbox.checked &&
        PRICE_CATEGORIES.cosmicDyes.acquisitions.includes(dye.acquisition)) {
        return true;
    }

    return false;
}

/**
 * Initialize market board server/world dropdowns
 * Loads data center and world data from JSON files
 *
 * @param {string} selectElementId - ID of the server select element (default: 'mb-server-select')
 */
async function initializeMarketBoard(selectElementId = 'mb-server-select') {
    try {
        const serverSelect = document.getElementById(selectElementId);
        if (!serverSelect) {
            console.warn(`Market board select element not found: ${selectElementId}`);
            return;
        }

        // Load data center and world data
        const [dcResponse, worldsResponse] = await Promise.all([
            fetch('./assets/json/data-centers.json'),
            fetch('./assets/json/worlds.json')
        ]);

        const dataCenters = await dcResponse.json();
        const worlds = await worldsResponse.json();

        serverSelect.innerHTML = '';

        // Sort Data Centers alphabetically
        const sortedDataCenters = [...dataCenters].sort((a, b) => a.name.localeCompare(b.name));

        // Add Data Centers optgroup
        const dcOptgroup = document.createElement('optgroup');
        dcOptgroup.label = 'Data Centers';
        sortedDataCenters.forEach(dc => {
            const option = document.createElement('option');
            option.value = `DC:${dc.name}`;
            option.textContent = `${dc.name} (${dc.region})`;
            if (dc.name === 'Crystal') {
                option.selected = true;  // Default to Crystal
            }
            dcOptgroup.appendChild(option);
        });
        serverSelect.appendChild(dcOptgroup);

        // Add Worlds optgroups (organized by data center)
        sortedDataCenters.forEach(dc => {
            const worldOptgroup = document.createElement('optgroup');
            worldOptgroup.label = `${dc.name} Worlds`;

            const dcWorlds = worlds
                .filter(w => dc.worlds.includes(w.id))
                .sort((a, b) => a.name.localeCompare(b.name));

            dcWorlds.forEach(world => {
                const option = document.createElement('option');
                option.value = `WORLD:${world.id}`;
                option.textContent = world.name;
                worldOptgroup.appendChild(option);
            });

            serverSelect.appendChild(worldOptgroup);
        });

        console.log(`Market board initialized with ${sortedDataCenters.length} data centers`);
    } catch (error) {
        console.error('Error initializing market board:', error);
    }
}

/**
 * Fetch prices from Universalis API for given item IDs
 * Uses throttling to respect API rate limits
 *
 * @param {number[]} itemIds - Array of item IDs to fetch prices for
 * @param {string} server - Server value (e.g., "DC:Crystal" or "WORLD:4")
 * @param {APIThrottler} throttler - APIThrottler instance for rate limiting
 * @returns {Promise<Object>} Object mapping itemId -> price
 */
async function fetchUniversalisPrice(itemIds, server, throttler) {
    if (!itemIds || itemIds.length === 0) return {};
    if (!throttler) {
        console.warn('fetchUniversalisPrice: No throttler provided, using direct fetch');
        throttler = new APIThrottler(500);
    }

    try {
        const serverValue = server.startsWith('DC:') ? server.substring(3) : server.substring(6);
        const itemIdsString = itemIds.join(',');
        const url = `https://universalis.app/api/v2/aggregated/${serverValue}/${itemIdsString}`;

        console.log(`Fetching prices from: ${url}`);
        const data = await throttler.request(url);
        const prices = {};

        if (data.results && Array.isArray(data.results)) {
            data.results.forEach(result => {
                const itemId = result.itemId.toString();
                if (result.nq && result.nq.minListing) {
                    let price = null;

                    // Try to get data center price
                    if (server.startsWith('DC:') && result.nq.minListing.dc && result.nq.minListing.dc.price) {
                        price = result.nq.minListing.dc.price;
                    }
                    // Try to get world price, fall back to data center price
                    else if (server.startsWith('WORLD:')) {
                        if (result.nq.minListing.world && result.nq.minListing.world.price) {
                            price = result.nq.minListing.world.price;
                        } else if (result.nq.minListing.dc && result.nq.minListing.dc.price) {
                            price = result.nq.minListing.dc.price;
                        }
                    }

                    // Fall back to region price if needed
                    if (!price && result.nq.minListing.region && result.nq.minListing.region.price) {
                        price = result.nq.minListing.region.price;
                    }

                    if (price) {
                        prices[itemId] = price;
                    }
                }
            });
        }

        console.log(`Successfully fetched prices for ${Object.keys(prices).length} items`);
        return prices;
    } catch (error) {
        console.error('Error fetching prices from Universalis API:', error);
        throw error;
    }
}

/**
 * Format price number with thousands separator
 *
 * @param {number} price - Price to format
 * @returns {string} Formatted price (e.g., "1,234 gil")
 */
function formatPrice(price) {
    if (!price) return 'N/A';
    return price.toLocaleString('en-US') + ' gil';
}

// ===== PAGE INITIALIZATION =====
/**
 * Initialize all shared functionality when DOM is ready
 * Wrapped in try-catch to prevent errors from blocking tool initialization
 *
 * Initialization order:
 * 1. migrateThemePreferences() - Convert legacy dark mode to new theme system
 * 2. initTheme() - Apply saved theme from localStorage
 * 3. initComponents() - Load nav and footer from component files
 * 4. removeLoadingPlaceholders() - Clean up loading indicators
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        migrateThemePreferences();     // Migrate old dark mode keys to new system
        initTheme();                   // Theme now handles both light/dark modes
        initComponents();
        removeLoadingPlaceholders();
    } catch (error) {
        console.error('Error in shared-components initialization:', error);
        // Don't throw - let tools initialize even if shared components fail
    }
});
