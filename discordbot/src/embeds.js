/**
 * Discord Embed Builders
 *
 * Creates beautiful Discord embeds for command responses
 */

import { rgbToHex, calculateDevianceRating, getDevianceColor } from './colors.js';

/**
 * Create harmony palette embed
 */
export function createHarmonyEmbed(baseDye, harmonyType, harmonyDyes) {
  const title = `${formatHarmonyType(harmonyType)} Harmony - ${baseDye.name}`;
  const color = baseDye.rgb ? rgbToColor(baseDye.rgb) : 0x6366f1;

  const fields = [];

  // Add base dye
  fields.push({
    name: '🎨 Base Color',
    value: createDyeField(baseDye),
    inline: false
  });

  // Add harmony colors
  for (let i = 0; i < harmonyDyes.length; i++) {
    const dye = harmonyDyes[i];
    const deviance = calculateDevianceRating(dye.distance);
    const devianceColor = getDevianceColor(deviance);

    fields.push({
      name: `${String.fromCharCode(65 + i)} - ${dye.name}`,
      value: createDyeField(dye) +
        `\n**Deviance:** ${devianceColor.emoji} ${deviance}/10`,
      inline: false
    });
  }

  return {
    title: title,
    color: color,
    fields: fields,
    footer: {
      text: 'XIV Dye Tools Discord Bot'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create color match embed
 */
export function createMatchEmbed(hexColor, matchedDye, distance) {
  const percentMatch = Math.round((1 - distance / 441.67) * 100);

  return {
    title: `Color Match Results`,
    color: rgbToColor(matchedDye.rgb),
    fields: [
      {
        name: '🎯 Target Color',
        value: `\`\`\`\n${hexColor}\n\`\`\``,
        inline: true
      },
      {
        name: '✅ Best Match',
        value: createDyeField(matchedDye),
        inline: true
      },
      {
        name: '📊 Match Quality',
        value: `${percentMatch}% Similar`,
        inline: false
      }
    ],
    footer: {
      text: 'XIV Dye Tools Discord Bot'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create dye information embed
 */
export function createDyeEmbed(dye) {
  const fields = [];

  // Basic info
  fields.push({
    name: '🏷️ Name',
    value: dye.name,
    inline: true
  });

  fields.push({
    name: '📁 Category',
    value: dye.category || 'Unknown',
    inline: true
  });

  // Color values
  fields.push({
    name: '🎨 Color Values',
    value: `\`\`\`\nHex: ${dye.hex}\nRGB: ${dye.rgb.r}, ${dye.rgb.g}, ${dye.rgb.b}\nHSV: ${dye.hsv.h}°, ${dye.hsv.s}%, ${dye.hsv.v}%\n\`\`\``,
    inline: false
  });

  // Acquisition
  if (dye.acquisition) {
    fields.push({
      name: '🛍️ Acquisition',
      value: dye.acquisition,
      inline: true
    });
  }

  // Price
  if (dye.price) {
    fields.push({
      name: '💰 Price',
      value: `${dye.price} ${dye.currency || 'Gil'}`,
      inline: true
    });
  }

  // Item ID
  if (dye.itemID) {
    fields.push({
      name: '🆔 Item ID',
      value: `${dye.itemID}`,
      inline: true
    });
  }

  return {
    title: `Dye Information - ${dye.name}`,
    color: rgbToColor(dye.rgb),
    fields: fields,
    footer: {
      text: 'XIV Dye Tools Discord Bot'
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Create error embed
 */
export function createErrorEmbed(message) {
  return {
    title: '❌ Error',
    description: message,
    color: 0xef4444,
    footer: {
      text: 'XIV Dye Tools Discord Bot'
    }
  };
}

/**
 * Helper: Create dye field value with color swatch
 */
function createDyeField(dye) {
  let value = `**${dye.name}**\n`;
  value += `Hex: \`${dye.hex}\`\n`;
  value += `RGB: \`${dye.rgb.r}, ${dye.rgb.g}, ${dye.rgb.b}\``;
  return value;
}

/**
 * Helper: Format harmony type name nicely
 */
function formatHarmonyType(type) {
  const names = {
    'complementary': 'Complementary',
    'analogous': 'Analogous',
    'triadic': 'Triadic',
    'split-complementary': 'Split-Complementary',
    'tetradic': 'Tetradic',
    'square': 'Square'
  };
  return names[type] || type;
}

/**
 * Helper: Convert RGB to Discord embed color (integer)
 */
function rgbToColor(rgb) {
  return (rgb.r << 16) + (rgb.g << 8) + rgb.b;
}
