@echo off
REM Discord Bot Deployment Script for Windows
REM This script handles the complete deployment to Cloudflare Workers

echo.
echo ========================================================
echo   XIV Dye Tools Discord Bot - Deployment Script
echo ========================================================
echo.

REM Step 1: Check prerequisites
echo [1/6] Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js 18+
    pause
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed. Please install npm
    pause
    exit /b 1
)

echo OK: Node.js and npm found
echo.

REM Step 2: Install dependencies
echo [2/6] Installing dependencies...
call npm install
echo OK: Dependencies installed
echo.

REM Step 3: Install wrangler globally
echo [3/6] Installing Wrangler CLI...
call npm install -g wrangler
echo OK: Wrangler installed
echo.

REM Step 4: Authenticate with Cloudflare
echo [4/6] Authenticating with Cloudflare...
echo NOTE: A browser window will open. Log in with your Cloudflare account.
echo.
call wrangler login
echo OK: Cloudflare authentication complete
echo.

REM Step 5: Set secrets
echo [5/6] Setting up secrets...
echo.
echo - Setting DISCORD_PUBLIC_KEY...
echo b5c2cf83215f815b2dec238236a9ac00a6ad1cd9d4576fdaaa8f0afc77192a14 | wrangler secret put DISCORD_PUBLIC_KEY
echo OK: DISCORD_PUBLIC_KEY set
echo.

echo - Setting DISCORD_TOKEN...
set /p DISCORD_TOKEN="Enter your Discord Bot Token: "
echo %DISCORD_TOKEN% | wrangler secret put DISCORD_TOKEN
echo OK: DISCORD_TOKEN set securely
echo.

REM Step 6: Deploy to Cloudflare
echo [6/6] Deploying to Cloudflare Workers...
call npm run deploy
echo.
echo OK: Deployment complete!
echo.

REM Instructions
echo ========================================================
echo   DEPLOYMENT SUCCESSFUL!
echo ========================================================
echo.
echo Next Steps:
echo -----------
echo 1. Go to Discord Developer Portal:
echo    https://discord.com/developers/applications
echo.
echo 2. Select your application (1433508594426445878)
echo.
echo 3. Go to General Information tab
echo.
echo 4. Find "Interactions Endpoint URL" field
echo.
echo 5. Paste your worker URL (shown above in deployment output)
echo.
echo 6. Click Save Changes
echo.
echo 7. Once saved, register your slash commands:
echo    node scripts/register-commands.js
echo.
echo 8. Invite your bot to a Discord server
echo.
echo 9. Test with: /harmony dye:"Dragoon Blue" theory:"square"
echo.
echo Done! Your Discord bot is live! 🎉
echo.
pause
