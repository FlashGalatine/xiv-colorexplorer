# XIV Dye Tools Discord Bot

A Discord bot that brings the color harmony explorer to Discord, allowing users to generate FFXIV dye color palettes directly from slash commands.

## Features

- **Slash Commands** - Easy-to-use Discord slash commands for color harmony exploration
- **Color Harmony Generation** - All 6 harmony types:
  - Complementary
  - Analogous
  - Triadic
  - Split-Complementary
  - Tetradic (Rectangular)
  - Square
- **Dye Matching** - Find the closest FFXIV dye match for any color
- **Embedded Results** - Beautiful Discord embeds showing color swatches and harmony results
- **Market Board Integration** - Optional real-time pricing from Universalis API

## Example Usage

```
/harmony dye:"Dragoon Blue" theory:"square"
/harmony hex:"#0099FF" theory:"complementary"
/match hex:"#FF6B6B"
/dye name:"Snow White"
```

## Architecture

This bot uses **Cloudflare Workers** to run serverless on the edge network.

### Technology Stack

- **Hosting:** Cloudflare Workers
- **Platform:** Discord Bot via Interactions API
- **Language:** JavaScript (Node.js compatible)
- **Color Library:** Custom color harmony algorithms (extracted from XIV Dye Tools)

### Why Cloudflare Workers?

- ✅ Completely free tier
- ✅ No need to keep a server running 24/7
- ✅ Fast global distribution
- ✅ Perfect for Discord slash commands (stateless)
- ✅ Easy integration with Discord Interactions API
- ✅ Scales infinitely

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed technical design.

## Quick Start

### 1. Prerequisites

- Node.js 18+ (for local development)
- A Discord Bot Token
- Discord Bot Public Key
- Cloudflare account (free tier works)

### 2. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/FlashGalatine/xivdyetools.git
cd xivdyetools/discordbot

# Install dependencies
npm install
```

### 3. Create Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to Bot section, click "Add Bot"
4. Copy the Bot Token
5. Enable "Message Content Intent" (optional, not needed for slash commands)
6. Go to Interactions Endpoint URL section
7. You'll set this after deploying to Cloudflare

### 4. Deploy to Cloudflare

```bash
# Install Wrangler CLI
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Deploy
wrangler publish
```

### 5. Configure Discord Bot

1. In Cloudflare Workers dashboard, find your worker URL
2. Copy the URL to Discord Developer Portal → Interactions Endpoint URL
3. Add your Discord Bot Token as an environment variable

### 6. Register Slash Commands

```bash
node scripts/register-commands.js
```

### 7. Invite Bot to Server

1. In Discord Developer Portal, go to OAuth2 → URL Generator
2. Select scopes: `bot`, `applications.commands`
3. Select permissions: `Send Messages`, `Embed Links`, `Attach Files`
4. Copy the generated URL and open it to invite the bot

## Environment Variables

Create a `.env` file (for local testing) or set in Cloudflare Workers:

```env
DISCORD_TOKEN=your_bot_token_here
DISCORD_PUBLIC_KEY=your_public_key_here
UNIVERSALIS_API=https://universalis.app/api/v2
```

## File Structure

```
discordbot/
├── README.md                 # This file
├── ARCHITECTURE.md          # Technical design details
├── package.json             # Node dependencies
├── wrangler.toml           # Cloudflare Workers config
├── src/
│   ├── worker.js           # Main Cloudflare Workers entry point
│   ├── discord.js          # Discord Interactions API handler
│   ├── colors.js           # Color harmony algorithms
│   ├── commands.js         # Slash command handlers
│   ├── embeds.js           # Discord embed builders
│   └── utils.js            # Utility functions
├── scripts/
│   ├── register-commands.js # Register slash commands with Discord
│   └── test-local.js       # Local testing utility
└── data/
    └── colors.json         # FFXIV dye database (symlink to parent)
```

## Commands

### `/harmony`

Generate a color harmony palette.

**Parameters:**
- `dye` - FFXIV dye name (e.g., "Dragoon Blue")
- `hex` - Hex color code (e.g., "#0099FF")
- `theory` - Harmony type: complementary, analogous, triadic, split-complementary, tetradic, square

**Example:**
```
/harmony dye:"Dragoon Blue" theory:"square"
/harmony hex:"#FF6B6B" theory:"triadic"
```

### `/match`

Find the closest FFXIV dye match for a color.

**Parameters:**
- `hex` - Hex color code (required)
- `exclude_metallic` - Exclude metallic dyes (optional)

**Example:**
```
/match hex:"#0099FF"
```

### `/dye`

Look up information about a specific dye.

**Parameters:**
- `name` - Dye name (required)

**Example:**
```
/dye name:"Snow White"
```

## Development

### Local Testing

```bash
# Run local testing server
npm run dev

# In another terminal, run the test utility
node scripts/test-local.js
```

### Debugging

The bot logs interactions to Cloudflare Workers console. Access logs in the Cloudflare Dashboard.

## Pricing

**Cloudflare Workers:**
- Free tier: 100,000 requests/day
- Paid: $0.50 per million requests

For reference:
- 1,000 users each running 10 commands/day = 10,000 requests/day (free tier)
- 100,000 users each running 10 commands/day = 1,000,000 requests/day (~$0.50)

## Common Issues

### "Invalid Interaction Token"
- Make sure your Discord Bot Public Key is correct
- Verify DISCORD_PUBLIC_KEY environment variable

### "Interaction Failed"
- Check that Interactions Endpoint URL is set correctly in Discord Developer Portal
- Ensure the worker is deployed and accessible

### "Unknown Command"
- Run `node scripts/register-commands.js` again
- Wait a few minutes for Discord to sync commands

## Contributing

Contributions welcome! Please follow these guidelines:

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

MIT License - see [LICENSE](../LICENSE) file

## Support

For issues and questions:
- GitHub Issues: [xivdyetools/issues](https://github.com/FlashGalatine/xivdyetools/issues)
- Discord: [Join our server](https://discord.gg/example)

## Credits

- Built by Flash Galatine (Balmung)
- Color data from FFXIV (Square Enix)
- Market board data from Universalis
- Originally inspired by the web-based XIV Dye Tools

## Disclaimer

This is a fan-made tool and is not affiliated with or endorsed by Square Enix Co., Ltd. FINAL FANTASY is a registered trademark of Square Enix Holdings Co., Ltd.
