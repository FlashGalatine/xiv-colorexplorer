# Discord Bot Architecture

## Overview

The XIV Dye Tools Discord Bot is a serverless application deployed on Cloudflare Workers that integrates with Discord's Interactions API to provide real-time color harmony exploration directly within Discord.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Discord Client                            │
│                 (User types slash command)                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    POST /interactions
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                 Cloudflare Workers Edge Network                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Worker (worker.js)                             │  │
│  │  - Verifies Discord signature                            │  │
│  │  - Routes requests to handlers                           │  │
│  │  - Handles Interactions API protocol                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      Discord Handler (discord.js)                        │  │
│  │  - Parses interaction payloads                           │  │
│  │  - Routes to command handlers                            │  │
│  │  - Builds response embeds                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │      Command Handlers (commands.js)                      │  │
│  │  - /harmony → Color harmony generator                    │  │
│  │  - /match   → Color matcher                              │  │
│  │  - /dye     → Dye information lookup                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │    Color Algorithms (colors.js)                          │  │
│  │  - HSV/RGB color space conversion                        │  │
│  │  - Harmony generation (6 types)                          │  │
│  │  - Euclidean distance color matching                     │  │
│  │  - Dye database operations                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                             │
                    Return Embed Response
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                    Discord Client                                │
│              (Displays colored embed with results)              │
└────────────────────────────────────────────────────────────────┘
```

## Request/Response Flow

### 1. User Interaction

User types slash command in Discord:
```
/harmony dye:"Dragoon Blue" theory:"square"
```

### 2. Discord Sends Interaction

Discord POST to Interactions Endpoint URL:
```json
{
  "type": 2,
  "data": {
    "name": "harmony",
    "options": [
      { "name": "dye", "value": "Dragoon Blue" },
      { "name": "theory", "value": "square" }
    ]
  },
  "member": {
    "user": { "id": "123456789", "username": "player" }
  }
}
```

### 3. Cloudflare Worker Receives Request

```
worker.js
  ├─ Verify Discord signature (security)
  ├─ Parse JSON payload
  ├─ Handle PING for URL verification
  └─ Route to Discord handler
```

### 4. Discord Handler Processes Interaction

```
discord.js
  ├─ Extract command name and options
  ├─ Validate user input
  ├─ Route to appropriate command handler
  └─ Handle errors gracefully
```

### 5. Command Handler Executes Logic

```
commands.js
  ├─ For /harmony:
  │   ├─ Find matching dye in database
  │   ├─ Call harmony generation algorithm
  │   ├─ Format results
  │   └─ Return embed
  │
  ├─ For /match:
  │   ├─ Parse hex color
  │   ├─ Calculate distances to all dyes
  │   ├─ Return closest match
  │   └─ Format embed
  │
  └─ For /dye:
      ├─ Look up dye information
      ├─ Fetch optional market prices
      └─ Format embed
```

### 6. Color Algorithms

```
colors.js
  ├─ colorHexToHsv() - Convert hex to HSV
  ├─ hsvToRgb() - Convert HSV to RGB
  ├─ rgbToHex() - Convert RGB to hex
  ├─ generateHarmony() - Calculate harmony colors
  ├─ findClosestColor() - Match color to dye
  └─ calculateColorDistance() - Euclidean distance
```

### 7. Response to Discord

Worker returns:
```json
{
  "type": 4,
  "data": {
    "embeds": [{
      "title": "Square Harmony - Dragoon Blue",
      "color": 6566400,
      "fields": [...]
    }]
  }
}
```

### 8. Discord Displays to User

Beautiful embed showing harmony results with color swatches.

## Data Models

### Interaction Types

- **PING** (type: 1) - Initial handshake verification
- **APPLICATION_COMMAND** (type: 2) - User executed slash command
- **MESSAGE_COMPONENT** (type: 3) - User clicked button/select menu

### Response Types

- **PONG** (type: 1) - Response to PING
- **CHANNEL_MESSAGE_WITH_SOURCE** (type: 4) - Send public message
- **DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE** (type: 5) - Acknowledge, send later
- **UPDATE_MESSAGE** (type: 7) - Update existing message

### Dye Data Structure

```javascript
{
  "itemID": 5729,
  "name": "Snow White",
  "category": "Neutral",
  "hex": "#e4dfd0",
  "rgb": { "r": 228, "g": 223, "b": 208 },
  "hsv": { "h": 45, "s": 8.77, "v": 89.41 },
  "acquisition": "Ixali Vendor",
  "price": 216,
  "currency": "Gil"
}
```

## Security

### Discord Signature Verification

Every request from Discord includes:
- `X-Signature-Ed25519` header (signature)
- `X-Signature-Timestamp` header (timestamp)

The worker verifies signatures using Ed25519 to ensure requests are truly from Discord.

```javascript
// In worker.js
const signature = request.headers.get('X-Signature-Ed25519');
const timestamp = request.headers.get('X-Signature-Timestamp');
verifyDiscordSignature(body, signature, timestamp);
```

### Environment Variables

Sensitive data stored in Cloudflare Workers KV:
- `DISCORD_PUBLIC_KEY` - For signature verification (public)
- `DISCORD_TOKEN` - For API calls (secret)

## Performance Considerations

### Cold Start Time
- Cloudflare Workers: ~10-50ms first request
- Discord timeout: 3 seconds
- Our typical response: <500ms

### Request Limits
- Free tier: 100,000 requests/day
- Typical user: 5-10 commands/day
- Supports ~10,000 daily active users on free tier

### Caching Strategy

```javascript
// Cache color database in Workers KV
const colors = await COLORS_KV.get('dye_database');

// Cache dye calculations for 1 hour
const harmonies = await HARMONIES_KV.get(cacheKey, { expirationTtl: 3600 });
```

## Error Handling

### Response Errors

1. **Invalid Input**
   - User types invalid hex code
   - Dye name doesn't exist
   - Response: Helpful error message in embed

2. **Discord Signature Invalid**
   - Request not from Discord
   - Response: HTTP 401 Unauthorized

3. **Command Execution Error**
   - Unexpected error during processing
   - Response: Generic error embed, log to Cloudflare

4. **Discord API Error**
   - Error responding back to Discord
   - Response: Log error, user sees "interaction failed"

### Retry Logic

Discord will retry failed interactions 3 times. The worker should be idempotent:
- Same input = same output
- Safe to retry without side effects

## Deployment Process

### Local Development

```bash
npm install
npm run dev
# Worker starts on http://localhost:8787
```

### To Production

```bash
wrangler publish
# Deploys to your Cloudflare account
# Worker URL: https://xivdyetools.YOUR-SUBDOMAIN.workers.dev
```

### Command Registration

```bash
node scripts/register-commands.js
# Registers /harmony, /match, /dye commands with Discord
```

## Scalability

### Horizontal Scaling
- Cloudflare Workers handles automatic scaling
- No server management needed
- Works globally on edge network

### Data Scaling
- Color database: ~250 colors (small, fits in memory)
- KV store: Unlimited (for caching/future features)
- No database required initially

### Cost Scaling
- Free: 100,000 req/day
- $0.50: Per 1M requests beyond free tier
- Scales linearly with usage

## Future Enhancements

### Phase 2: Market Board Integration
- Fetch real-time prices from Universalis
- Include prices in harmony embeds
- Cache prices for 1 hour

### Phase 3: User Profiles
- Store favorite color palettes
- Track command history
- Custom color sets

### Phase 4: Advanced Features
- Button interactions (save palette, export)
- Select menus (choose from multiple matches)
- Animated embeds showing color transitions

### Phase 5: Webhooks
- Slash commands → Web embeds
- Shared palette links
- Web interface integration

## Testing

### Unit Tests
```bash
npm test
```

Tests cover:
- Color space conversions
- Harmony algorithms
- Distance calculations
- Input validation

### Integration Tests
```bash
node scripts/test-local.js
```

Local server with test interactions from Discord.

### Production Monitoring

Monitor in Cloudflare Dashboard:
- Request count
- Error rate
- Performance metrics
- Logs

## References

- [Discord Interactions API](https://discord.com/developers/docs/interactions/receiving-and-responding)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Color Theory](https://en.wikipedia.org/wiki/Color_theory)
- [HSV Color Space](https://en.wikipedia.org/wiki/HSL_and_HSV)
