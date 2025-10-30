#!/usr/bin/env node

/**
 * Register Discord Slash Commands
 *
 * This script registers the three main commands with Discord:
 * - /harmony
 * - /match
 * - /dye
 *
 * Run with: node scripts/register-commands.js
 *
 * Requires DISCORD_TOKEN to be set as an environment variable or in .env file
 * DISCORD_APP_ID is hardcoded or can come from wrangler.toml
 */

// Try to load from .env for convenience
try {
  const { config } = await import('dotenv');
  config();
} catch (e) {
  // dotenv not available, that's ok
}

const DISCORD_TOKEN = process.env.DISCORD_TOKEN || '';
const DISCORD_APP_ID = '1433508594426445878'; // Hardcoded application ID

if (!DISCORD_TOKEN) {
  console.error('Error: DISCORD_TOKEN environment variable is required');
  console.error('');
  console.error('To get your token:');
  console.error('1. Go to Discord Developer Portal');
  console.error('2. Select your application');
  console.error('3. Go to Bot section');
  console.error('4. Copy the token');
  console.error('');
  console.error('Then run:');
  console.error('  export DISCORD_TOKEN="your_token_here"');
  console.error('  node scripts/register-commands.js');
  console.error('');
  process.exit(1);
}

const COMMANDS = [
  {
    name: 'harmony',
    description: 'Generate a color harmony palette based on FFXIV dyes',
    options: [
      {
        name: 'dye',
        type: 3, // STRING
        description: 'FFXIV dye name (e.g., Dragoon Blue)',
        required: false
      },
      {
        name: 'hex',
        type: 3, // STRING
        description: 'Hex color code (e.g., #FF0000)',
        required: false
      },
      {
        name: 'theory',
        type: 3, // STRING
        description: 'Harmony theory type',
        required: false,
        choices: [
          { name: 'Complementary', value: 'complementary' },
          { name: 'Analogous', value: 'analogous' },
          { name: 'Triadic', value: 'triadic' },
          { name: 'Split-Complementary', value: 'split-complementary' },
          { name: 'Tetradic', value: 'tetradic' },
          { name: 'Square', value: 'square' }
        ]
      }
    ]
  },
  {
    name: 'match',
    description: 'Find the closest FFXIV dye match for a color',
    options: [
      {
        name: 'hex',
        type: 3, // STRING
        description: 'Hex color code (e.g., #FF0000)',
        required: true
      },
      {
        name: 'exclude_metallic',
        type: 5, // BOOLEAN
        description: 'Exclude metallic dyes from results',
        required: false
      },
      {
        name: 'exclude_facewear',
        type: 5, // BOOLEAN
        description: 'Exclude facewear colors from results',
        required: false
      }
    ]
  },
  {
    name: 'dye',
    description: 'Look up information about an FFXIV dye',
    options: [
      {
        name: 'name',
        type: 3, // STRING
        description: 'Dye name (e.g., Snow White)',
        required: true
      }
    ]
  }
];

async function registerCommands() {
  console.log('📝 Registering Discord slash commands...\n');

  for (const command of COMMANDS) {
    try {
      const response = await fetch(
        `https://discord.com/api/v10/applications/${DISCORD_APP_ID}/commands`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${DISCORD_TOKEN}`
          },
          body: JSON.stringify(command)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        console.error(`❌ Error registering /${command.name}:`);
        console.error(error);
        continue;
      }

      const registered = await response.json();
      console.log(`✅ Registered /${command.name}`);
      console.log(`   ID: ${registered.id}\n`);
    } catch (error) {
      console.error(`❌ Error registering /${command.name}:`, error.message);
    }
  }

  console.log('✨ Command registration complete!');
  console.log('\nNote: Discord may take a few minutes to sync commands to all servers.');
}

registerCommands();
