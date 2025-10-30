/**
 * Discord Slash Command Handlers
 *
 * Implements the three main commands:
 * - /harmony - Generate color harmonies
 * - /match - Find closest dye match
 * - /dye - Look up dye information
 */

import {
  hexToRgb, rgbToHsv, generateHarmonyWithDyes,
  calculateDevianceRating, getDevianceColor
} from './colors.js';
import {
  createHarmonyEmbed, createMatchEmbed, createDyeEmbed, createErrorEmbed
} from './embeds.js';

// In production, this would come from KV store
// For now, we'll import from the shared colors data
let colorDatabase = null;

/**
 * Load FFXIV color database
 * In production, this would be stored in Cloudflare KV
 */
async function loadColorDatabase(env) {
  if (!colorDatabase) {
    // Try to load from KV first
    if (env.COLORS_KV) {
      const cached = await env.COLORS_KV.get('colors_xiv');
      if (cached) {
        colorDatabase = JSON.parse(cached);
        return colorDatabase;
      }
    }
    // Fallback: would be loaded from file or API
    colorDatabase = require('../data/colors.json');
  }
  return colorDatabase;
}

/**
 * Find dye by name (case-insensitive)
 */
function findDyeByName(name, palette) {
  return palette.find(dye => dye.name.toLowerCase() === name.toLowerCase());
}

/**
 * Handle /harmony command
 * Generates color harmony palette based on FFXIV dye
 */
export async function handleHarmonyCommand(options, env) {
  try {
    const palette = await loadColorDatabase(env);
    let baseDye = null;

    // Get base color from dye name or hex
    if (options.dye) {
      baseDye = findDyeByName(options.dye, palette);
      if (!baseDye) {
        return createErrorEmbed(`Dye not found: "${options.dye}". Use /dye to find the correct name.`);
      }
    } else if (options.hex) {
      // Validate hex format
      if (!/^#[0-9A-F]{6}$/i.test(options.hex)) {
        return createErrorEmbed(`Invalid hex color: "${options.hex}". Use format #RRGGBB`);
      }
      // Create temporary dye object for matching
      const rgb = hexToRgb(options.hex);
      baseDye = {
        name: options.hex,
        hex: options.hex,
        rgb: rgb,
        hsv: rgbToHsv(rgb),
        category: 'Custom'
      };
    } else {
      return createErrorEmbed('Please specify either `dye` name or `hex` color code.');
    }

    // Get harmony theory
    const theory = (options.theory || 'complementary').toLowerCase();
    const validTheories = ['complementary', 'analogous', 'triadic', 'split-complementary', 'tetradic', 'square'];
    if (!validTheories.includes(theory)) {
      return createErrorEmbed(`Invalid harmony theory: "${theory}". Options: ${validTheories.join(', ')}`);
    }

    // Generate harmony
    const harmonyDyes = generateHarmonyWithDyes(baseDye, theory, palette);

    // Create embed
    return createHarmonyEmbed(baseDye, theory, harmonyDyes);

  } catch (error) {
    console.error('Harmony command error:', error);
    return createErrorEmbed('Error generating harmony. Please try again.');
  }
}

/**
 * Handle /match command
 * Finds closest FFXIV dye match for a color
 */
export async function handleMatchCommand(options, env) {
  try {
    const palette = await loadColorDatabase(env);

    // Get color to match
    if (!options.hex) {
      return createErrorEmbed('Please specify a `hex` color code (e.g., #FF0000)');
    }

    // Validate hex format
    if (!/^#[0-9A-F]{6}$/i.test(options.hex)) {
      return createErrorEmbed(`Invalid hex color: "${options.hex}". Use format #RRGGBB`);
    }

    const targetRgb = hexToRgb(options.hex);
    if (!targetRgb) {
      return createErrorEmbed(`Invalid hex color: "${options.hex}"`);
    }

    // Find closest match
    let minDistance = Infinity;
    let bestMatch = null;

    for (const dye of palette) {
      // Apply filters
      if (options.exclude_metallic && dye.name?.includes('Metallic')) continue;
      if (options.exclude_facewear && dye.category === 'Facewear') continue;

      const distance = Math.sqrt(
        (targetRgb.r - dye.rgb.r) ** 2 +
        (targetRgb.g - dye.rgb.g) ** 2 +
        (targetRgb.b - dye.rgb.b) ** 2
      );

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = dye;
      }
    }

    if (!bestMatch) {
      return createErrorEmbed('No matching dye found.');
    }

    return createMatchEmbed(options.hex, bestMatch, minDistance);

  } catch (error) {
    console.error('Match command error:', error);
    return createErrorEmbed('Error matching color. Please try again.');
  }
}

/**
 * Handle /dye command
 * Look up information about a specific FFXIV dye
 */
export async function handleDyeCommand(options, env) {
  try {
    const palette = await loadColorDatabase(env);

    // Get dye name
    if (!options.name) {
      return createErrorEmbed('Please specify a dye `name`.');
    }

    // Find dye
    const dye = findDyeByName(options.name, palette);
    if (!dye) {
      return createErrorEmbed(`Dye not found: "${options.name}". Please check the spelling.`);
    }

    // Create embed with dye info
    return createDyeEmbed(dye);

  } catch (error) {
    console.error('Dye command error:', error);
    return createErrorEmbed('Error looking up dye. Please try again.');
  }
}
