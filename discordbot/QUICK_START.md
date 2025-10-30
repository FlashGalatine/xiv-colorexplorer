# Quick Start - Deploy Discord Bot in 2 Minutes

Your Discord bot is ready to deploy! Follow this quick guide to get it live.

## Prerequisites Check ✅

- ✅ Application ID: `1433508594426445878`
- ✅ Public Key: `b5c2cf83215f815b2dec238236a9ac00a6ad1cd9d4576fdaaa8f0afc77192a14`
- ✅ Discord Bot Token: (you have this)
- ✅ Node.js 18+ installed
- ✅ Cloudflare account (free tier)

## One-Command Deployment

### On Windows (PowerShell or Command Prompt):

```bash
cd discordbot
.\DEPLOY.bat
```

Then paste your Discord Bot Token when prompted.

### On macOS/Linux:

```bash
cd discordbot
chmod +x DEPLOY.sh
./DEPLOY.sh
```

Then paste your Discord Bot Token when prompted.

## What the Script Does

1. ✅ Checks prerequisites
2. ✅ Installs npm dependencies
3. ✅ Installs Wrangler CLI
4. ✅ Authenticates with Cloudflare (opens browser)
5. ✅ Sets up secrets securely
6. ✅ Deploys to Cloudflare Workers
7. ✅ Shows your worker URL

## After Deployment

Once the script finishes, you'll see your worker URL. Follow these steps:

### 1. Set Interactions Endpoint URL

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application
3. Go to **General Information** tab
4. Paste your worker URL in **Interactions Endpoint URL**
5. Click **Save Changes**

### 2. Register Slash Commands

```bash
# Inside the discordbot directory
node scripts/register-commands.js
```

You'll be prompted for your Discord Token again.

### 3. Invite Bot to Server

1. Go to **OAuth2** → **URL Generator**
2. Select: `bot` + `applications.commands`
3. Select: `Send Messages`, `Embed Links`, `Attach Files`
4. Copy the URL and open in browser

### 4. Test Your Bot

In Discord, try:
```
/harmony dye:"Dragoon Blue" theory:"square"
/match hex:"#0099FF"
/dye name:"Snow White"
```

## Troubleshooting

### "Interactions Endpoint URL verification failed"
- Double-check your worker URL is correct
- Make sure the Public Key is set correctly
- Restart Discord

### "Commands don't appear"
- Run `node scripts/register-commands.js` again
- Wait a few minutes (Discord syncs slowly)
- Restart Discord

### "Interaction Failed"
- Check Cloudflare dashboard for errors
- Verify Interactions Endpoint URL is set in Discord Portal
- Check that secrets are set: `wrangler secret list`

## Need Help?

See the full setup guide in [SETUP.md](./SETUP.md) for detailed troubleshooting.

## Done! 🎉

Your Discord bot is now live and processing slash commands in real-time!

Stay safe:
- ✅ Never commit your bot token to Git
- ✅ Secrets are stored securely in Cloudflare
- ✅ All signatures are verified with Ed25519
