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

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-dropdown')) {
            dropdown.classList.remove('show');
        }
    }, { once: true });
}

/**
 * Toggle theme switcher menu visibility
 * @param {HTMLElement} button - The button that triggered the theme switcher
 */
function toggleThemeSwitcher(button) {
    const menu = button.nextElementSibling;
    if (!menu) return;

    menu.classList.toggle('show');

    // Close when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.theme-switcher')) {
            menu.classList.remove('show');
        }
    }, { once: true });
}

// ===== COMPONENT LOADING FUNCTIONS =====
/**
 * Load an external component HTML file and insert it into the DOM
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
        // Fallback: show error message in container
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<p style="color: #d32f2f; padding: 1rem;">Failed to load component. Please refresh the page.</p>`;
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

// ===== PAGE INITIALIZATION =====
/**
 * Initialize all shared functionality when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();                   // Theme now handles both light/dark modes
    initComponents();
    removeLoadingPlaceholders();
});
