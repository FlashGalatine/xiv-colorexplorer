# Discord Bot - Git Subtree Setup

This guide shows how to sync the Discord bot code to a separate GitHub repository while keeping it organized in this project.

## Architecture

```
xivdyetools (main repo)
└── discordbot/
    ├── [code]
    └── [syncs to separate repo]

xiv-discord-bot (separate repo)
└── [same discordbot/ code]
```

Both repositories contain the same `discordbot/` folder, but they can be developed and deployed independently.

## One-Time Setup

### Step 1: Create Separate GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create new repository: `xiv-discord-bot`
3. Initialize with README (or leave empty)
4. Copy the HTTPS URL: `https://github.com/YOUR_USERNAME/xiv-discord-bot.git`

### Step 2: Add Subtree to Main Repository

From the main `xivdyetools` directory:

```bash
git subtree add --prefix discordbot https://github.com/YOUR_USERNAME/xiv-discord-bot.git main --squash
```

The `--squash` flag combines all commits into one (cleaner history).

### Step 3: Commit Changes

```bash
git add .gitignore
git commit -m "Enable Discord bot syncing to separate repository"
git push origin main
```

## Regular Workflow

### When You Update the Discord Bot

Make changes in `discordbot/` as normal:

```bash
# Make changes
nano discordbot/src/commands.js

# Commit to main repo
git add discordbot/
git commit -m "Update harmony command logic"
git push origin main
```

### Sync to Separate Repository

When you want to push bot updates to the separate repo:

```bash
# From the root of xivdyetools
git subtree push --prefix discordbot https://github.com/YOUR_USERNAME/xiv-discord-bot.git main
```

Or add it as a remote for easier commands:

```bash
# One-time setup
git remote add discord-bot https://github.com/YOUR_USERNAME/xiv-discord-bot.git

# Then you can use
git subtree push --prefix discordbot discord-bot main
```

## Benefits

✅ **Single source of truth** - Code lives in this repo
✅ **Independent deployment** - Others can clone just the Discord bot repo
✅ **Version control** - Full history in both repos
✅ **Easy updates** - Simple git command to sync
✅ **Flexible sharing** - Share bot repo publicly while keeping web tools private

## Updating From Separate Repository

If someone makes changes in the separate `xiv-discord-bot` repo and you want to pull them back:

```bash
git subtree pull --prefix discordbot https://github.com/YOUR_USERNAME/xiv-discord-bot.git main --squash
```

Or if you set up the remote:

```bash
git subtree pull --prefix discordbot discord-bot main --squash
```

## Troubleshooting

### "Subtree doesn't contain commit..."

This usually means the histories don't match. Use `--squash` when adding:

```bash
git subtree add --prefix discordbot https://github.com/YOUR_USERNAME/xiv-discord-bot.git main --squash
```

### Want to Remove Subtree Later?

If you need to remove the subtree integration:

```bash
git rm -r discordbot
git commit -m "Remove Discord bot subtree"
# Now discordbot/ is just a regular folder
```

## Advanced: Automated Syncing

You can create a GitHub Action to auto-sync changes:

```yaml
name: Sync Discord Bot

on:
  push:
    paths:
      - 'discordbot/**'
    branches:
      - main

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Push subtree
        run: |
          git subtree push --prefix discordbot \
            https://x-access-token:${{ secrets.GITHUB_TOKEN }}@github.com/${{ github.repository_owner }}/xiv-discord-bot.git main
```

## Resources

- [Git Subtree Documentation](https://git-scm.com/book/en/v2/Git-Tools-Subtrees)
- [Git Subtree Tutorial](https://www.atlassian.com/git/tutorials/git-subtree)

## Summary

Your setup allows:
1. **Main repo** (`xivdyetools`) - Contains all XIV Dye Tools with discordbot integrated
2. **Discord bot repo** (`xiv-discord-bot`) - Standalone copy perfect for sharing/documentation
3. **Easy syncing** - One command to push changes to separate repo

Perfect for a monorepo workflow! 🎉
