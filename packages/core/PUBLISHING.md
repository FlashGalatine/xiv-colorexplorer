# Publishing xivdyetools-core to npm

## Pre-Publishing Checklist

✅ Package built successfully (`npm run build`)
✅ All tests passing (`npm test`)
✅ README.md updated with comprehensive documentation
✅ package.json metadata complete (author, keywords, repository)
✅ Version number set correctly (1.0.0)

## Step 1: Create npm Account (if needed)

If you don't have an npm account:

1. Go to https://www.npmjs.com/signup
2. Create an account
3. Verify your email address

## Step 2: Login to npm

Open your terminal in the `packages/core` directory and run:

```bash
npm login
```

You'll be prompted for:
- **Username**: Your npm username
- **Password**: Your npm password
- **Email**: Your npm email
- **One-time password**: (if you have 2FA enabled)

## Step 3: Verify Package Contents

Before publishing, check what will be included:

```bash
npm pack --dry-run
```

This shows:
- Total package size
- All files that will be published
- What's excluded by `.gitignore` or `.npmignore`

Expected output:
```
npm notice package: xivdyetools-core@1.0.0
npm notice === Tarball Contents ===
npm notice 1.2kB  package.json
npm notice 8.5kB  README.md
npm notice xxxkB  dist/...
npm notice === Tarball Details ===
npm notice name:          xivdyetools-core
npm notice version:       1.0.0
npm notice package size:  XXX kB
npm notice unpacked size: XXX kB
npm notice total files:   XX
```

## Step 4: Test the Package Locally (Optional but Recommended)

Create a test tarball and install it locally:

```bash
npm pack
# Creates: xivdyetools-core-1.0.0.tgz

# Test in another directory
cd /tmp
npm init -y
npm install /path/to/xivdyetools-core-1.0.0.tgz

# Test the import
node
> const { ColorService } = require('xivdyetools-core');
> console.log(ColorService.hexToRgb('#FF6B6B'));
```

## Step 5: Publish to npm

### Publish as Public Package

```bash
cd packages/core
npm publish --access public
```

**Note:** The `--access public` flag is required for scoped packages (xivdyetools-core).

### What Happens During Publish

1. `prepublishOnly` script runs automatically:
   - Builds the package (`npm run build`)
   - Runs tests (`npm test`)
2. Package is uploaded to npm registry
3. You'll see output like:

```
+ xivdyetools-core@1.0.0
```

## Step 6: Verify Publication

1. **Check npm registry:**
   ```bash
   npm view xivdyetools-core
   ```

2. **Visit npm package page:**
   https://www.npmjs.com/package/xivdyetools-core

3. **Test installation:**
   ```bash
   cd /tmp
   npm init -y
   npm install xivdyetools-core
   ```

## Step 7: Update Git Repository

Commit the changes and tag the release:

```bash
cd ../../  # Back to root
git add packages/core
git commit -m "Release: xivdyetools-core@1.0.0

- Initial release of core package
- ColorService, DyeService, APIService
- 136 FFXIV dyes with full metadata
- Environment-agnostic design
- Pluggable cache backends"

git tag core-v1.0.0
git push origin main --tags
```

## Post-Publishing Tasks

### 1. Create GitHub Release

1. Go to https://github.com/FlashGalatine/xivdyetools/releases/new
2. Tag: `core-v1.0.0`
3. Title: `xivdyetools-core v1.0.0`
4. Description:
   ```markdown
   Initial release of the XIV Dye Tools core package!

   ## Features
   - ✨ ColorService - RGB/HSV/Hex conversions
   - 🎨 DyeService - 136 FFXIV dyes with matching & harmonies
   - 📡 APIService - Universalis API integration with caching
   - 🌍 Environment-agnostic (Node.js, browser, edge)

   ## Installation
   ```bash
   npm install xivdyetools-core
   ```

   ## Documentation
   See [README](https://www.npmjs.com/package/xivdyetools-core) for full documentation.
   ```

### 2. Update Main Repository README

Add a section about the core package:

```markdown
## Packages

This repository is organized as a monorepo:

- **[xivdyetools-core](https://www.npmjs.com/package/xivdyetools-core)** - Core color algorithms and dye database (npm package)
- **Web App** - Interactive color tools (this repository)
- **Discord Bot** - Coming soon!
```

### 3. Announce the Release

- Share on Discord/Reddit/Twitter
- Update project documentation
- Notify any collaborators

## Future Updates

### Patch Release (1.0.x)

Bug fixes only:

```bash
cd packages/core
npm version patch  # 1.0.0 → 1.0.1
npm publish --access public
git push --tags
```

### Minor Release (1.x.0)

New features, backwards compatible:

```bash
npm version minor  # 1.0.0 → 1.1.0
npm publish --access public
git push --tags
```

### Major Release (x.0.0)

Breaking changes:

```bash
npm version major  # 1.0.0 → 2.0.0
npm publish --access public
git push --tags
```

## Troubleshooting

### Error: "You must sign up for private packages"

**Solution:** Add `--access public` flag:
```bash
npm publish --access public
```

### Error: "You do not have permission to publish"

**Solutions:**
1. Verify you're logged in: `npm whoami`
2. Check package name isn't taken: `npm view xivdyetools-core`
3. Ensure you own the `@xivdyetools` scope

### Error: "Cannot publish over existing version"

**Solution:** Increment version:
```bash
npm version patch
npm publish --access public
```

### Error: "prepublishOnly script failed"

**Solution:** Fix build/test errors:
```bash
npm run build  # Check for TypeScript errors
npm test       # Check for test failures
```

## Unpublishing (Emergency Only)

⚠️ **Warning:** Only unpublish within 72 hours if absolutely necessary!

```bash
npm unpublish xivdyetools-core@1.0.0
```

**Better alternative:** Publish a patch version with the fix:
```bash
npm version patch
npm publish --access public
```

---

**Ready to publish? Run:**
```bash
cd packages/core
npm login
npm publish --access public
```

Good luck! 🚀
