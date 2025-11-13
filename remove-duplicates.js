#!/usr/bin/env node

/**
 * Batch Script: Remove Duplicate Functions from Tool Files
 * Removes functions that are now in shared-components.js
 */

const fs = require('fs');
const path = require('path');

// Define which functions to remove from each file
const removalConfig = {
    'colorexplorer_experimental.html': [
        'colorDistance',
        'hsvToRgb',
        'getCategoryPriority',
        'sortColorsByCategory'
    ],
    'colormatcher_experimental.html': [
        'hexToRgb',
        'rgbToHex',
        'colorDistance',
        'APIThrottler'
    ],
    'dyecomparison_experimental.html': [
        'colorDistance',
        'hsvToRgb',
        'getCategoryPriority',
        'sortDyesByCategory',
        'APIThrottler'
    ]
    // Color Accessibility already done manually
};

/**
 * Find and remove a function definition from JavaScript code
 * Handles both regular functions and classes
 * @param {string} code - The source code
 * @param {string} functionName - Name of function/class to remove
 * @returns {string} Code with function removed
 */
function removeFunctionDefinition(code, functionName) {
    // Pattern for regular functions
    // Matches: function functionName(...) { ... }
    // Including preceding comments and whitespace
    const functionPattern = new RegExp(
        `(\\s*\\/\\/.*\\n)*\\s*function ${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\s*\\}\\s*`,
        'g'
    );

    // Pattern for classes
    // Matches: class ClassName { ... }
    const classPattern = new RegExp(
        `(\\s*\\/\\/.*\\n)*\\s*class ${functionName}\\s*\\{[\\s\\S]*?\\n\\s*\\}\\s*`,
        'g'
    );

    let result = code;

    // Try function pattern first
    if (functionPattern.test(code)) {
        result = result.replace(functionPattern, '\n');
        console.log(`  ✓ Removed function: ${functionName}`);
        return result;
    }

    // Try class pattern
    if (classPattern.test(code)) {
        result = result.replace(classPattern, '\n');
        console.log(`  ✓ Removed class: ${functionName}`);
        return result;
    }

    // Try multi-line comment + function pattern
    const commentFunctionPattern = new RegExp(
        `\\s*\\/\\*\\*[\\s\\S]*?\\*\\/\\s*function ${functionName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\s*\\}\\s*`,
        'g'
    );

    if (commentFunctionPattern.test(code)) {
        result = result.replace(commentFunctionPattern, '\n');
        console.log(`  ✓ Removed function with docs: ${functionName}`);
        return result;
    }

    console.log(`  ✗ Could not find: ${functionName}`);
    return result;
}

/**
 * Remove duplicate utility functions from a tool file
 * @param {string} filePath - Path to the HTML file
 * @param {string[]} functionsToRemove - Array of function names to remove
 */
function removeFromFile(filePath, functionsToRemove) {
    console.log(`\nProcessing: ${path.basename(filePath)}`);

    if (!fs.existsSync(filePath)) {
        console.error(`  ✗ File not found: ${filePath}`);
        return;
    }

    let code = fs.readFileSync(filePath, 'utf8');
    const originalSize = code.length;

    for (const funcName of functionsToRemove) {
        code = removeFunctionDefinition(code, funcName);
    }

    // Clean up multiple consecutive blank lines
    code = code.replace(/\n\n\n+/g, '\n\n');

    const newSize = code.length;
    const linesSaved = Math.round((originalSize - newSize) / 50); // Rough estimate

    fs.writeFileSync(filePath, code, 'utf8');
    console.log(`  📊 Removed ~${linesSaved} lines (${originalSize} → ${newSize} bytes)`);
}

// Main execution
console.log('🔧 Batch Removing Duplicate Functions\n');
console.log('=' .repeat(50));

const baseDir = path.dirname(__filename);

for (const [fileName, functionsToRemove] of Object.entries(removalConfig)) {
    const filePath = path.join(baseDir, fileName);
    removeFromFile(filePath, functionsToRemove);
}

console.log('\n' + '='.repeat(50));
console.log('✅ Batch removal complete!');
console.log('\nNext steps:');
console.log('1. Test all 4 tools in browser');
console.log('2. Check browser console for any errors');
console.log('3. Verify functionality of each tool');
console.log('4. Run Phase 6.2 (Market Prices component)');
