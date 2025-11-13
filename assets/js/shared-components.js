/**
 * XIV Dye Tools - Shared Components & Utilities
 * Provides common functionality for all tools (navigation, footer, dark mode, etc.)
 */

// ===== STORAGE KEYS =====
const THEME_KEY = 'xivdyetools_theme';

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
 * Map unified theme names to CSS classes and dark-mode flag
 * @param {string} themeName - Unified theme name (e.g., "hydaelyn-dark")
 * @returns {Object} Object with themeClass and isDarkMode properties
 */
function parseThemeName(themeName) {
    const [base, variant] = themeName.split('-');
    const isDarkMode = variant === 'dark';

    // Map base theme names to CSS class names
    const classMap = {
        'standard': null,          // No class for standard light (default)
        'hydaelyn': 'hydaelyn',
        'classic': 'classic-ff',   // "classic-ff" in CSS
        'parchment': 'parchment',
        'sugar': 'sugar-riot'      // "sugar-riot" in CSS
    };

    // Handle "classic-ff-light" case
    let baseClass = null;
    if (themeName.startsWith('standard')) {
        baseClass = null;
    } else if (themeName.startsWith('hydaelyn')) {
        baseClass = 'hydaelyn';
    } else if (themeName.startsWith('classic-ff')) {
        baseClass = 'classic-ff';
    } else if (themeName.startsWith('parchment')) {
        baseClass = 'parchment';
    } else if (themeName.startsWith('sugar-riot')) {
        baseClass = 'sugar-riot';
    }

    return { themeClass: baseClass, isDarkMode };
}

/**
 * Initialize theme from localStorage
 */
function initTheme() {
    const savedTheme = safeGetStorage(THEME_KEY, 'standard-light');
    setTheme(savedTheme);
}

/**
 * Set active theme - handles both theme selection and light/dark mode
 * @param {string} themeName - Unified theme name (e.g., "hydaelyn-dark", "standard-light")
 */
function setTheme(themeName) {
    if (!AVAILABLE_THEMES.includes(themeName)) {
        console.warn(`Invalid theme: ${themeName}. Defaulting to standard-light.`);
        themeName = 'standard-light';
    }

    // Parse the unified theme name
    const { themeClass, isDarkMode } = parseThemeName(themeName);

    // Remove all theme classes
    ['light', 'dark', 'hydaelyn', 'classic-ff', 'parchment', 'sugar-riot'].forEach(theme => {
        document.body.classList.remove(`theme-${theme}`);
    });

    // Remove dark-mode class
    document.body.classList.remove('dark-mode');

    // Add new theme class if not standard light
    if (themeClass) {
        document.body.classList.add(`theme-${themeClass}`);
    } else if (themeName === 'standard-dark') {
        // Special case: standard dark uses theme-dark class
        document.body.classList.add('theme-dark');
    }

    // Add dark-mode class if needed
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
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
