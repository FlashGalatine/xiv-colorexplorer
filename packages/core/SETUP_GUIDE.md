# xivdyetools-core - Dedicated Repository Setup Guide

This guide walks you through setting up the dedicated GitHub repository for `xivdyetools-core`.

## 📋 Prerequisites

- GitHub account with access to https://github.com/FlashGalatine/xivdyetools-core
- NPM account with publish permissions
- Git installed locally

## 🚀 Step-by-Step Setup

### 1. Initialize the New Repository

```bash
# Navigate to the core package directory
cd packages/core

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: xivdyetools-core v1.0.1

- Core color algorithms (ColorService)
- FFXIV dye database (DyeService)
- Universalis API integration (APIService)
- 38 passing tests
- Full TypeScript support
- Environment-agnostic design"

# Add remote repository
git remote add origin https://github.com/FlashGalatine/xivdyetools-core.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Set up NPM Token for GitHub Actions

> **Note**: NPM is deprecating "Automation" tokens in favor of "Granular Access Tokens" which provide better security through scoped permissions and expiration dates. Use Granular Access Tokens for new projects.

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
2. Click "Generate New Token" → **"Granular Access Token"** (recommended)
3. Configure the token:
   - **Token name**: `GITHUB_ACTIONS_XIVDYETOOLS_CORE`
   - **Expiration**: Choose your preference (e.g., 1 year, or "No expiration" for simplicity)
   - **Packages and scopes**:
     - Select "Only select packages and scopes"
     - Click "Select packages"
     - Choose `xivdyetools-core`
     - Permissions: Set to **"Read and write"**
   - **Organizations**: No organization access needed (leave empty)
   - **IP Allowlist**: Leave empty (GitHub Actions IPs vary)
4. Click "Generate Token" and **copy it immediately** (you won't see it again!)

5. Go to https://github.com/FlashGalatine/xivdyetools-core/settings/secrets/actions
6. Click "New repository secret"
7. Name: `NPM_TOKEN`
8. Value: Paste the token from step 4
9. Click "Add secret"

### 3. Configure Repository Settings

#### Enable GitHub Actions
1. Go to https://github.com/FlashGalatine/xivdyetools-core/settings/actions
2. Under "Actions permissions", select "Allow all actions and reusable workflows"
3. Click "Save"

#### Enable GitHub Releases
1. Go to https://github.com/FlashGalatine/xivdyetools-core/settings
2. Under "Features", ensure "Issues" and "Discussions" are enabled
3. This allows GitHub Actions to create releases automatically

### 4. Add Repository Topics

Go to https://github.com/FlashGalatine/xivdyetools-core and add topics:
- `ffxiv`
- `final-fantasy-xiv`
- `color-theory`
- `typescript`
- `color-algorithms`
- `npm-package`
- `accessibility`
- `colorblind`

### 5. Create First Release (Optional)

Since v1.0.1 is already on NPM, you can create a GitHub release to match:

```bash
# Tag the current commit
git tag v1.0.1
git push origin v1.0.1
```

This will trigger the GitHub Action to create a release (but won't republish to NPM since the version already exists).

## 🔄 Development Workflow

### For New Versions

1. **Develop in monorepo** (`XIVDyeTools/packages/core/`)
2. **Update version** in `package.json`
3. **Build and test**:
   ```bash
   npm run build
   npm test
   ```
4. **Commit changes** to the dedicated repo:
   ```bash
   cd packages/core
   git add .
   git commit -m "feat: Add new feature"
   git push
   ```
5. **Create version tag**:
   ```bash
   git tag v1.0.2
   git push origin v1.0.2
   ```
6. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to NPM
   - Create GitHub release

### Sync from Monorepo (Alternative)

If you prefer to keep developing in the monorepo and sync periodically:

```bash
# In monorepo
cd packages/core
git add .
git commit -m "Update core package"

# Copy to dedicated repo
cd /path/to/xivdyetools-core
cp -r /path/to/XIVDyeTools/packages/core/* .
git add .
git commit -m "Sync from monorepo"
git push
```

## 📦 Publishing Manually (If Needed)

If GitHub Actions fails or you want to publish manually:

```bash
cd packages/core

# Build
npm run build

# Test
npm test

# Publish
npm publish --access public
```

## ✅ Verification Checklist

- [ ] Repository created and initialized
- [ ] All files pushed to GitHub
- [ ] NPM_TOKEN secret configured
- [ ] GitHub Actions enabled
- [ ] Repository topics added
- [ ] CI workflow runs successfully (check Actions tab)
- [ ] README displays correctly on GitHub
- [ ] NPM package page shows new GitHub repo (may take a few minutes)

## 🔗 Important Links

- **GitHub Repository**: https://github.com/FlashGalatine/xivdyetools-core
- **NPM Package**: https://www.npmjs.com/package/xivdyetools-core
- **Main Project**: https://github.com/FlashGalatine/xivdyetools
- **Discord Bot**: https://github.com/FlashGalatine/xivdyetools-discord

## 📝 Next Steps

After setup:
1. Update the main `xivdyetools` README to link to the new core repo
2. Consider adding badges to the core README (CI status, npm version, etc.)
3. Set up automated dependency updates (Dependabot)
4. Create CONTRIBUTING.md if you want external contributions

## 🆘 Troubleshooting

### GitHub Actions fails to publish
- Verify NPM_TOKEN is set correctly in repository secrets
- Check that the token has "Automation" permissions
- Ensure package version in package.json is incremented

### Git push rejected
- Make sure you're on the main branch
- If the repo already exists on GitHub with different content, use `git push -f` (only on first push)

### NPM package page doesn't update
- It may take 5-10 minutes for NPM to refresh metadata
- Clear your browser cache
- Try the NPM CLI: `npm view xivdyetools-core`

---

**Created**: 2025-11-22
**Last Updated**: 2025-11-22
