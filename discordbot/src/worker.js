/**
 * XIV Dye Tools Discord Bot - Cloudflare Workers Entry Point
 *
 * This worker receives Discord interactions and routes them to appropriate handlers.
 * It's the main entry point for all slash commands.
 */

import { verifyDiscordSignature } from './utils.js';
import { handleInteraction, handlePing } from './discord.js';

/**
 * Main handler for Cloudflare Workers
 */
export default {
  async fetch(request, env, ctx) {
    // Only accept POST requests for interactions
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      // Get request headers
      const signature = request.headers.get('X-Signature-Ed25519');
      const timestamp = request.headers.get('X-Signature-Timestamp');

      // Read request body
      const body = await request.text();

      // Verify Discord signature for security
      if (!verifyDiscordSignature(body, signature, timestamp, env.DISCORD_PUBLIC_KEY)) {
        console.warn('Invalid Discord signature');
        return new Response('Unauthorized', { status: 401 });
      }

      // Parse interaction payload
      const interaction = JSON.parse(body);

      // Handle PING for URL verification
      if (interaction.type === 1) {
        return handlePing(interaction);
      }

      // Handle slash commands
      if (interaction.type === 2) {
        return await handleInteraction(interaction, env);
      }

      // Unknown interaction type
      console.warn(`Unknown interaction type: ${interaction.type}`);
      return new Response('Unknown interaction type', { status: 400 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  }
};

/**
 * Scheduled handler for periodic tasks (future use)
 * Can be used to refresh cache, sync data, etc.
 */
export async function scheduled(event, env, ctx) {
  console.log('Running scheduled event:', event.cron);

  // Future: Refresh price cache, sync dye database, etc.
}
