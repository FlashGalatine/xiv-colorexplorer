# Discord Bot Setup Guide

Complete step-by-step instructions for deploying the XIV Dye Tools Discord Bot to Cloudflare Workers.

## Prerequisites

- Node.js 18+ installed
- npm installed
- A Cloudflare account (free tier works)
- A Discord application with a bot token

## Your Configuration

✅ **Application ID:** `1433508594426445878`
✅ **Public Key:** `b5c2cf83215f815b2dec238236a9ac00a6ad1cd9d4576fdaaa8f0afc77192a14`

You still need: **Bot Token** (get from Discord Developer Portal)

## Step 1: Get Your Bot Token

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application: **XIV Dye Tools Discord Bot**
3. Go to **Bot** section in left sidebar
4. Under **TOKEN**, click "Copy"
5. Save this somewhere safe (don't share it!)

You'll use this in Step 4.

## Step 2: Install Dependencies

```bash
cd discordbot
npm install
```

This installs required packages:
- `wrangler` - Cloudflare Workers CLI
- `tweetnacl` - For Ed25519 signature verification

## Step 3: Authenticate with Cloudflare

```bash
npm install -g wrangler
wrangler login
```

This will open a browser to authenticate with Cloudflare. Log in with your Cloudflare account.

## Step 4: Set Environment Secrets

Store your sensitive credentials in Cloudflare Workers:

```bash
# Set your Discord Public Key
wrangler secret put DISCORD_PUBLIC_KEY
# Paste: b5c2cf83215f815b2dec238236a9ac00a6ad1cd9d4576fdaaa8f0afc77192a14
# Press Enter twice (once to paste, once to confirm)

# Set your Discord Bot Token
wrangler secret put DISCORD_TOKEN
# Paste: your_bot_token_from_step_1
# Press Enter twice
```

**Note:** Secrets are stored securely and won't be visible in your code.

## Step 5: Deploy to Cloudflare

```bash
npm run deploy
# or: wrangler publish
```

Output will show:
```
✓ Uploaded xiv-dye-tools-discord-bot (version xxxxxxxx)
Your worker is published at: https://xiv-dye-tools-discord-bot.YOUR_SUBDOMAIN.workers.dev
```

**Save your worker URL** - you'll need it in the next step.

## Step 6: Configure Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **General Information** tab
4. Look for "Interactions Endpoint URL"
5. Paste your worker URL from Step 5:
   ```
   https://xiv-dye-tools-discord-bot.YOUR_SUBDOMAIN.workers.dev
   ```
6. Click **Save Changes**

Discord will send a verification request to your worker. If it succeeds, you'll see ✅ next to the URL.

**If verification fails:**
- Check that your Public Key is correct in step 4
- Check that your worker URL is correct
- Try deploying again: `npm run deploy`

## Step 7: Register Slash Commands

```bash
node scripts/register-commands.js
```

You should see:
```
✅ Registered /harmony
   ID: 1234567890...

✅ Registered /match
   ID: 1234567890...

✅ Registered /dye
   ID: 1234567890...

✨ Command registration complete!
```

**Note:** Discord takes a few minutes to sync commands. You might need to restart Discord or wait a bit to see them.

## Step 8: Invite Bot to Your Server

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **OAuth2** → **URL Generator**
4. Select scopes:
   - ✅ `bot`
   - ✅ `applications.commands`
5. Select permissions:
   - ✅ `Send Messages`
   - ✅ `Embed Links`
   - ✅ `Attach Files`
6. Copy the generated URL
7. Open it in your browser to invite the bot

## Step 9: Test Your Bot

In any Discord server where the bot is a member, try a command:

```
/harmony dye:"Dragoon Blue" theory:"square"
/match hex:"#0099FF"
/dye name:"Snow White"
```

You should see beautiful color harmony embeds!

## Troubleshooting

### "Interaction Failed" Error

**Problem:** Discord shows "Interaction failed" when using a command

**Solutions:**
1. Verify Interactions Endpoint URL is correct in Discord Portal
2. Check that your worker is deployed: `npm run deploy`
3. Check worker logs in Cloudflare Dashboard
4. Verify DISCORD_PUBLIC_KEY is set: `wrangler secret list`

### Commands Don't Appear

**Problem:** Slash commands not showing up in Discord

**Solutions:**
1. Re-register commands: `node scripts/register-commands.js`
2. Restart Discord app completely
3. Wait a few minutes (Discord syncs can take time)
4. Check that bot has `applications.commands` permission

### "No Matching Dye" Error

**Problem:** /harmony returns "Dye not found" for valid dye names

**Solutions:**
1. Check dye name spelling (case-insensitive, but must match exactly)
2. Use `/dye name:"Snow White"` to verify dye exists
3. Check that color database is loaded properly

### Verification Failed

**Problem:** "Interactions Endpoint URL verification failed"

**Solutions:**
1. Double-check Public Key is correct
2. Verify worker URL is accessible (open it in browser)
3. Re-deploy: `npm run deploy`
4. Check Cloudflare dashboard for errors

## Local Testing (Optional)

To test locally before deploying:

```bash
npm run dev
```

This starts a local worker on `http://localhost:8787`. You can test with:

```bash
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d @test-interaction.json
```

## Updating the Bot

To update code and deploy changes:

```bash
# Make your code changes
git add .
git commit -m "Update bot feature"

# Deploy to Cloudflare
npm run deploy
```

Changes are live immediately!

## Monitoring

View your bot's activity in the Cloudflare Dashboard:

1. Go to Cloudflare Dashboard
2. Workers → xiv-dye-tools-discord-bot
3. View logs, errors, and metrics

## Next Steps

- **Add more commands** - Edit `src/commands.js`
- **Customize embeds** - Edit `src/embeds.js`
- **Add market prices** - Implement Universalis API calls
- **Store user preferences** - Use Cloudflare KV
- **Add buttons/menus** - Discord message components

## Support

- Check [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- Check [README.md](./README.md) for feature documentation
- Discord Docs: https://discord.com/developers/docs/interactions/receiving-and-responding
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/

## Security Notes

✅ Never commit your Bot Token to Git
✅ Always use `wrangler secret put` for sensitive values
✅ The Public Key verification happens automatically
✅ Secrets are encrypted in Cloudflare

Done! Your Discord bot should now be live! 🎉
