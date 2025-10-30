/**
 * Discord Interactions API Handler
 *
 * Handles parsing, routing, and responding to Discord interactions.
 * Converts command parameters to function calls and builds embeds.
 */

import { handleHarmonyCommand, handleMatchCommand, handleDyeCommand } from './commands.js';
import { createErrorEmbed } from './embeds.js';

/**
 * Handle PING interaction for URL verification
 */
export function handlePing(interaction) {
  return new Response(JSON.stringify({ type: 1 }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Main interaction handler
 * Routes commands to appropriate handlers and builds response
 */
export async function handleInteraction(interaction, env) {
  try {
    const command = interaction.data.name;
    const options = parseOptions(interaction.data.options || []);

    let response;

    // Route to command handler
    switch (command) {
      case 'harmony':
        response = await handleHarmonyCommand(options, env);
        break;
      case 'match':
        response = await handleMatchCommand(options, env);
        break;
      case 'dye':
        response = await handleDyeCommand(options, env);
        break;
      default:
        response = createErrorEmbed(`Unknown command: ${command}`);
    }

    // Format and send response
    return respondToInteraction(response);

  } catch (error) {
    console.error('Interaction handler error:', error);
    const errorEmbed = createErrorEmbed('An error occurred processing your command. Please try again.');
    return respondToInteraction(errorEmbed);
  }
}

/**
 * Parse Discord options into key-value object
 *
 * Discord sends options as array:
 * [{ name: "dye", value: "Dragoon Blue" }, { name: "theory", value: "square" }]
 *
 * Convert to object:
 * { dye: "Dragoon Blue", theory: "square" }
 */
function parseOptions(options) {
  const parsed = {};
  for (const option of options) {
    parsed[option.name] = option.value;
  }
  return parsed;
}

/**
 * Format and send Discord interaction response
 */
function respondToInteraction(embed) {
  const response = {
    type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
    data: {
      embeds: Array.isArray(embed) ? embed : [embed],
      flags: 0 // 64 would make it ephemeral (only visible to user)
    }
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}

/**
 * Create a deferred response for long-running operations
 * Useful for commands that take >3 seconds
 */
export function deferredResponse() {
  const response = {
    type: 5 // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
  };

  return new Response(JSON.stringify(response), {
    headers: { 'Content-Type': 'application/json' }
  });
}
