/**
 * XIV Dye Tools - Shared Components & Utilities
 * Provides common functionality for all tools (navigation, footer, dark mode, etc.)
 */

// ===== DARK MODE KEY =====
const DARK_MODE_KEY = 'xivdyetools_darkMode';

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

// ===== DARK MODE FUNCTIONS =====
/**
 * Initialize dark mode from localStorage
 */
function initDarkMode() {
    const isDark = safeGetStorage(DARK_MODE_KEY, 'false') === 'true';
    if (isDark) {
        document.body.classList.add('dark-mode');
    }
}

/**
 * Toggle dark mode and sync across all tools
 */
function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    safeSetStorage(DARK_MODE_KEY, isDark.toString());
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
    initComponents();
    initDarkMode();
    removeLoadingPlaceholders();
});
