/**
 * Color Harmony Algorithms
 *
 * Core color science functions:
 * - Color space conversions (HEX ↔ RGB ↔ HSV)
 * - Harmony generation (complementary, analogous, triadic, etc.)
 * - Color matching (Euclidean distance in RGB space)
 *
 * Extracted and adapted from colorexplorer_stable.html
 */

/**
 * Convert hex color to RGB
 * @param {string} hex - Hex color code (e.g., "#FF0000")
 * @returns {object} RGB object {r, g, b}
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Convert RGB to hex color
 * @param {object} rgb - RGB object {r, g, b}
 * @returns {string} Hex color code (e.g., "#FF0000")
 */
export function rgbToHex(rgb) {
  return '#' + [rgb.r, rgb.g, rgb.b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

/**
 * Convert RGB to HSV
 * @param {object} rgb - RGB object {r, g, b} with values 0-255
 * @returns {object} HSV object {h, s, v} with h: 0-360, s: 0-100, v: 0-100
 */
export function rgbToHsv(rgb) {
  let r = rgb.r / 255;
  let g = rgb.g / 255;
  let b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  // Hue
  let h = 0;
  if (delta !== 0) {
    if (max === r) {
      h = 60 * (((g - b) / delta) % 6);
    } else if (max === g) {
      h = 60 * (((b - r) / delta) + 2);
    } else {
      h = 60 * (((r - g) / delta) + 4);
    }
    if (h < 0) h += 360;
  }

  // Saturation
  const s = max === 0 ? 0 : (delta / max) * 100;

  // Value
  const v = max * 100;

  return { h: Math.round(h), s: Math.round(s * 100) / 100, v: Math.round(v * 100) / 100 };
}

/**
 * Convert HSV to RGB
 * @param {object} hsv - HSV object {h, s, v} with h: 0-360, s: 0-100, v: 0-100
 * @returns {object} RGB object {r, g, b}
 */
export function hsvToRgb(hsv) {
  let h = hsv.h;
  let s = hsv.s / 100;
  let v = hsv.v / 100;

  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;

  let r, g, b;

  if (h < 60) {
    r = c; g = x; b = 0;
  } else if (h < 120) {
    r = x; g = c; b = 0;
  } else if (h < 180) {
    r = 0; g = c; b = x;
  } else if (h < 240) {
    r = 0; g = x; b = c;
  } else if (h < 300) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

/**
 * Calculate Euclidean distance between two RGB colors
 * @param {object} rgb1 - First RGB color
 * @param {object} rgb2 - Second RGB color
 * @returns {number} Distance (0-441.67 for RGB 0-255)
 */
export function colorDistance(rgb1, rgb2) {
  const dr = rgb1.r - rgb2.r;
  const dg = rgb1.g - rgb2.g;
  const db = rgb1.b - rgb2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Generate color harmony palette
 *
 * @param {object} baseHsv - Base color in HSV
 * @param {string} harmonyType - Type: complementary, analogous, triadic, etc.
 * @returns {array} Array of HSV colors
 */
export function generateHarmony(baseHsv, harmonyType) {
  const harmony = [baseHsv];
  let targetHues = [];

  switch (harmonyType) {
    case 'complementary':
      targetHues = [(baseHsv.h + 180) % 360];
      break;

    case 'analogous':
      targetHues = [
        (baseHsv.h + 30) % 360,
        (baseHsv.h - 30 + 360) % 360
      ];
      break;

    case 'triadic':
      targetHues = [
        (baseHsv.h + 120) % 360,
        (baseHsv.h + 240) % 360
      ];
      break;

    case 'split-complementary':
      targetHues = [
        (baseHsv.h + 150) % 360,
        (baseHsv.h + 210) % 360
      ];
      break;

    case 'tetradic':
      targetHues = [
        (baseHsv.h + 60) % 360,
        (baseHsv.h + 180) % 360,
        (baseHsv.h + 240) % 360
      ];
      break;

    case 'square':
      targetHues = [
        (baseHsv.h + 90) % 360,
        (baseHsv.h + 180) % 360,
        (baseHsv.h + 270) % 360
      ];
      break;

    default:
      return harmony;
  }

  // Create harmony colors with same saturation and value
  for (const targetHue of targetHues) {
    harmony.push({
      h: targetHue,
      s: baseHsv.s,
      v: baseHsv.v
    });
  }

  return harmony;
}

/**
 * Find the closest color in a palette
 *
 * @param {object} targetRgb - Target RGB color to match
 * @param {array} palette - Array of color objects {name, hex, rgb}
 * @param {object} options - Filter options {exclude_metallic, exclude_facewear, etc.}
 * @returns {object} Closest color object
 */
export function findClosestColor(targetRgb, palette, options = {}) {
  let minDistance = Infinity;
  let closest = null;

  for (const color of palette) {
    // Apply filters
    if (options.exclude_metallic && color.name?.includes('Metallic')) continue;
    if (options.exclude_facewear && color.category === 'Facewear') continue;

    const distance = colorDistance(targetRgb, color.rgb);
    if (distance < minDistance) {
      minDistance = distance;
      closest = color;
    }
  }

  return closest;
}

/**
 * Generate a harmony using actual dye database
 * Returns matched FFXIV dyes for ideal harmony colors
 *
 * @param {object} dye - FFXIV dye object
 * @param {string} harmonyType - Harmony type
 * @param {array} palette - FFXIV dye palette
 * @returns {array} Array of matched dyes
 */
export function generateHarmonyWithDyes(dye, harmonyType, palette) {
  const baseRgb = hexToRgb(dye.hex);
  const baseHsv = rgbToHsv(baseRgb);

  // Generate ideal harmony colors
  const harmonyHsvs = generateHarmony(baseHsv, harmonyType);

  // Match to actual FFXIV dyes
  const harmonyDyes = [];
  for (const harmonyHsv of harmonyHsvs) {
    const rgb = hsvToRgb(harmonyHsv);
    const matched = findClosestColor(rgb, palette);
    if (matched) {
      harmonyDyes.push({
        ...matched,
        idealHsv: harmonyHsv,
        matchedHsv: rgbToHsv(matched.rgb),
        distance: colorDistance(rgb, matched.rgb)
      });
    }
  }

  return harmonyDyes;
}

/**
 * Calculate deviance rating (0-10 scale)
 * How far off the matched color is from the ideal harmony color
 *
 * @param {number} distance - RGB Euclidean distance
 * @returns {number} Rating 0-10 (0 = perfect, 10 = very different)
 */
export function calculateDevianceRating(distance) {
  // Max distance in RGB space is sqrt(255^2 + 255^2 + 255^2) ≈ 441.67
  // Normalize to 0-10 scale
  const maxDistance = 441.67;
  const rating = (distance / maxDistance) * 10;
  return Math.min(10, Math.max(0, Math.round(rating * 2) / 2)); // Round to nearest 0.5
}

/**
 * Format deviance rating as color for embeds
 *
 * @param {number} rating - Rating 0-10
 * @returns {object} {color, text, emoji}
 */
export function getDevianceColor(rating) {
  if (rating <= 3) {
    return { color: 0x22c55e, text: '✅ Excellent', emoji: '🟢' };
  } else if (rating <= 6) {
    return { color: 0xeab308, text: '⚠️ Good', emoji: '🟡' };
  } else {
    return { color: 0xef4444, text: '❌ Poor', emoji: '🔴' };
  }
}
