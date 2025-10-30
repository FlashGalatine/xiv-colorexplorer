#!/bin/bash

# Discord Bot Deployment Script
# This script handles the complete deployment to Cloudflare Workers
#
# IMPORTANT: Save your Discord Token securely after deployment
# Discord Token: MTQzNTA4NTk0NDI2NDQ1ODc4OA (provided by user)

set -e

echo "🚀 XIV Dye Tools Discord Bot - Deployment Script"
echo "=================================================="
echo ""

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm"
    exit 1
fi

echo "✅ Node.js and npm found"
echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Install wrangler globally
echo "🔧 Step 3: Installing Wrangler CLI..."
npm install -g wrangler
echo "✅ Wrangler installed"
echo ""

# Step 4: Authenticate with Cloudflare
echo "🔐 Step 4: Authenticating with Cloudflare..."
echo "   A browser window will open. Log in with your Cloudflare account."
echo ""
wrangler login
echo "✅ Cloudflare authentication complete"
echo ""

# Step 5: Set secrets
echo "🔑 Step 5: Setting up secrets..."
echo ""
echo "Setting DISCORD_PUBLIC_KEY..."
echo "b5c2cf83215f815b2dec238236a9ac00a6ad1cd9d4576fdaaa8f0afc77192a14" | wrangler secret put DISCORD_PUBLIC_KEY
echo "✅ DISCORD_PUBLIC_KEY set"
echo ""

echo "Setting DISCORD_TOKEN..."
read -sp "Enter your Discord Bot Token (will not be displayed): " DISCORD_TOKEN
echo ""
echo "$DISCORD_TOKEN" | wrangler secret put DISCORD_TOKEN
echo "✅ DISCORD_TOKEN set securely"
echo ""

# Step 6: Deploy to Cloudflare
echo "🌐 Step 6: Deploying to Cloudflare Workers..."
npm run deploy
echo "✅ Deployment complete!"
echo ""

# Step 7: Extract worker URL
echo "📝 Step 7: Getting your worker URL..."
WORKER_URL=$(wrangler deployments list --limit 1 2>/dev/null | grep -i "https" | head -1 | awk '{print $1}' || echo "https://xiv-dye-tools-discord-bot.YOUR_SUBDOMAIN.workers.dev")
echo "Your worker URL: $WORKER_URL"
echo ""

# Step 8: Instructions
echo "✅ Deployment Complete!"
echo ""
echo "Next Steps:"
echo "==========="
echo "1. Go to Discord Developer Portal: https://discord.com/developers/applications"
echo "2. Select your application (1433508594426445878)"
echo "3. Go to General Information tab"
echo "4. Find 'Interactions Endpoint URL' field"
echo "5. Paste this URL: $WORKER_URL"
echo "6. Click Save Changes"
echo ""
echo "7. Once saved, register your slash commands:"
echo "   node scripts/register-commands.js"
echo ""
echo "8. Invite your bot to a Discord server"
echo "9. Test with: /harmony dye:\"Dragoon Blue\" theory:\"square\""
echo ""
echo "Done! Your Discord bot is live! 🎉"
