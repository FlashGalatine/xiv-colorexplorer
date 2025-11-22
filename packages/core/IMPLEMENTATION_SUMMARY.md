# xivdyetools-core Implementation Summary

## ✅ Phase 1: Core Package - **COMPLETE**

### What We Built

A standalone, environment-agnostic npm package containing all shared business logic for XIV Dye Tools projects.

### Package Contents

#### 1. **Services (3)**
- ✅ `ColorService` - Color conversion algorithms (RGB/HSV/Hex), colorblindness simulation
- ✅ `DyeService` - Dye database management, matching, harmony generation
- ✅ `APIService` - Universalis API integration with pluggable cache backends

#### 2. **Types & Interfaces**
- Color types: `RGB`, `HSV`, `HexColor`
- Dye type: `Dye` (FFXIV dye database schema)
- API types: `PriceData`, `CachedData<T>`
- Error handling: `AppError`, `ErrorCode` enum
- Cache backend interface: `ICacheBackend`

#### 3. **Constants**
- Color constraints (RGB, HSV ranges)
- Colorblindness matrices (Brettel 1997)
- Universalis API configuration
- Cache TTL and rate limiting settings

#### 4. **Utilities**
- Math: `clamp`, `lerp`, `round`, `distance`
- Arrays: `unique`, `groupBy`, `sortByProperty`, `filterNulls`
- Validation: `isValidHexColor`, `isValidRGB`, `isValidHSV`
- Async: `sleep`, `retry` (with exponential backoff)
- Integrity: `generateChecksum`

#### 5. **Data**
- 136 FFXIV dyes with RGB/HSV/metadata
- Imported with Node.js v20+ import assertions

---

## 🔑 Key Architectural Decisions

### 1. **Dependency Injection Over Singletons**

**Before (Web App):**
```typescript
// Singleton pattern - hard to test, environment-specific
const dyeService = DyeService.getInstance();
const apiService = APIService.getInstance();
```

**After (Core Package):**
```typescript
// Constructor injection - testable, flexible
const dyeService = new DyeService(dyeDatabase);
const apiService = new APIService(cacheBackend);
```

**Benefits:**
- Easy to mock for testing
- No global state
- Works in any JavaScript environment

### 2. **Pluggable Cache Backends**

Introduced `ICacheBackend` interface with implementations for:
- ✅ **MemoryCacheBackend** - In-memory (default, no persistence)
- 🔜 **LocalStorageCacheBackend** - Browser localStorage (web app)
- 🔜 **RedisCacheBackend** - Redis (Discord bot)

**Usage:**
```typescript
// Web app (browser)
import { APIService } from 'xivdyetools-core';
const localStorageCache = new LocalStorageCacheBackend();
const apiService = new APIService(localStorageCache);

// Discord bot (Node.js)
import { APIService } from 'xivdyetools-core';
import Redis from 'ioredis';
const redisCache = new RedisCacheBackend(redis);
const apiService = new APIService(redisCache);
```

### 3. **Environment Agnostic**

The package works in:
- ✅ Node.js (Discord bot, CLI tools, APIs)
- ✅ Browsers (web app via bundlers like Vite)
- ✅ Edge runtimes (Cloudflare Workers, Vercel Edge)

No environment-specific code in core services!

---

## 📊 Test Results

All 5 test suites passed:

```
✅ ColorService: hexToRgb, rgbToHsv, rgbToHex, getColorDistance
✅ DyeService: 136 dyes loaded, findClosestDye, findTriadicDyes, getCategories
✅ APIService: MemoryCacheBackend, clearCache, getCacheStats, formatPrice
✅ Utilities: clamp, lerp, isValidHexColor, generateChecksum, sleep
✅ Constants: RGB_MAX, HUE_MAX, VISION_TYPES, UNIVERSALIS_API_BASE
```

---

## 📦 Package Build Output

```
packages/core/dist/
├── constants/
│   ├── index.d.ts
│   ├── index.js
│   └── index.js.map
├── data/
│   └── colors_xiv.json (136 dyes)
├── services/
│   ├── ColorService.{d.ts, js, js.map}
│   ├── DyeService.{d.ts, js, js.map}
│   └── APIService.{d.ts, js, js.map}
├── types/
│   ├── index.d.ts
│   ├── index.js
│   └── index.js.map
├── utils/
│   ├── index.d.ts
│   ├── index.js
│   └── index.js.map
└── index.{d.ts, js, js.map}
```

**Total Size:** ~100 KB (unminified), ~30 KB (gzipped)

---

## 🚀 Next Steps

### Option A: Publish to npm (Recommended for Production)

1. **Create npm account** (if you don't have one):
   ```bash
   npm adduser
   ```

2. **Publish package:**
   ```bash
   cd packages/core
   npm publish --access public
   ```

3. **Use in projects:**
   ```bash
   npm install xivdyetools-core
   ```

### Option B: Use locally with npm link (Development)

1. **Link package globally:**
   ```bash
   cd packages/core
   npm link
   ```

2. **Link in web app:**
   ```bash
   cd ../..  # Back to root
   npm link xivdyetools-core
   ```

3. **Link in Discord bot** (when created):
   ```bash
   cd ../xivdyetools-discord-bot
   npm link xivdyetools-core
   ```

### Option C: GitHub Packages (Private or Organization)

1. **Create `.npmrc` in package:**
   ```
   @yourusername:registry=https://npm.pkg.github.com
   ```

2. **Authenticate with GitHub PAT:**
   ```bash
   npm login --registry=https://npm.pkg.github.com
   ```

3. **Publish:**
   ```bash
   npm publish
   ```

---

## 📝 Migration Guide for Web App

### Before (Web App v2.0.x)
```typescript
// src/services/dye-service.ts
import { DyeService } from './services/dye-service';
const dyeService = DyeService.getInstance();
```

### After (With Core Package)
```typescript
// Install package
// npm install xivdyetools-core

// Use package
import { DyeService, dyeDatabase } from 'xivdyetools-core';
const dyeService = new DyeService(dyeDatabase);
```

### Benefits
- ✅ Single source of truth
- ✅ Automatic updates across projects
- ✅ Smaller web app bundle (reusable code extracted)
- ✅ Enables Discord bot, CLI tools, APIs

---

## 🎯 Discord Bot Development (Phase 2)

Now that the core package is ready, we can build the Discord bot:

### Prerequisites
- ✅ Core package built and tested
- 🔜 Create Discord application on [Discord Developer Portal](https://discord.com/developers/applications)
- 🔜 Set up Redis (local or Upstash cloud)
- 🔜 Create new repository `xivdyetools-discord-bot`

### Bot Architecture
```
xivdyetools-discord-bot/
├── src/
│   ├── commands/
│   │   ├── harmony.ts          # /harmony command
│   │   ├── match.ts            # /match command
│   │   ├── accessibility.ts    # /accessibility command
│   │   ├── comparison.ts       # /comparison command
│   │   └── mixer.ts            # /mixer command
│   ├── renderers/
│   │   ├── ColorWheelRenderer.ts   # Canvas color wheel
│   │   ├── GradientRenderer.ts     # Canvas gradient
│   │   └── SwatchGridRenderer.ts   # Colorblind swatches
│   ├── cache/
│   │   └── RedisCacheBackend.ts    # Redis implementation
│   └── index.ts
├── package.json
└── Dockerfile
```

### Dependencies
```json
{
  "dependencies": {
    "xivdyetools-core": "^1.0.0",
    "discord.js": "^14.14.1",
    "canvas": "^2.11.2",
    "sharp": "^0.33.1",
    "ioredis": "^5.3.2"
  }
}
```

---

## 🎨 Example: Implementing /harmony Command

```typescript
import { SlashCommandBuilder } from 'discord.js';
import { DyeService, dyeDatabase, ColorService } from 'xivdyetools-core';
import { ColorWheelRenderer } from '../renderers/ColorWheelRenderer';

const dyeService = new DyeService(dyeDatabase);

export const harmonyCommand = {
  data: new SlashCommandBuilder()
    .setName('harmony')
    .setDescription('Generate color harmonies from FFXIV dyes')
    .addStringOption(option =>
      option.setName('color')
        .setDescription('Hex color (e.g., #FF6B6B)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Harmony type')
        .setRequired(true)
        .addChoices(
          { name: 'Triadic', value: 'triadic' },
          { name: 'Complementary', value: 'complementary' },
          { name: 'Analogous', value: 'analogous' }
        )),

  async execute(interaction) {
    const color = interaction.options.getString('color');
    const type = interaction.options.getString('type');

    // Use core package services
    const baseDye = dyeService.findClosestDye(color);
    const harmonyDyes = type === 'triadic'
      ? dyeService.findTriadicDyes(color)
      : dyeService.findComplementaryPair(color);

    // Render color wheel
    const renderer = new ColorWheelRenderer();
    const imageBuffer = renderer.render(baseDye, harmonyDyes);

    // Send Discord embed
    await interaction.reply({
      embeds: [{
        title: `${type} Harmony for ${baseDye.name}`,
        description: `Base: ${baseDye.name} (${baseDye.hex})\n` +
                     `Harmony: ${harmonyDyes.map(d => d.name).join(', ')}`,
        image: { url: 'attachment://harmony.png' }
      }],
      files: [{ attachment: imageBuffer, name: 'harmony.png' }]
    });
  }
};
```

---

## 📈 Progress Summary

| Task | Status | Notes |
|------|--------|-------|
| Extract ColorService | ✅ Complete | 100% reusable, no changes |
| Extract DyeService | ✅ Complete | Singleton removed, environment-agnostic |
| Extract APIService | ✅ Complete | Pluggable cache backends added |
| Add types & constants | ✅ Complete | All exported via public API |
| Add utilities | ✅ Complete | sleep, retry, generateChecksum added |
| Build package | ✅ Complete | TypeScript compilation successful |
| Test package | ✅ Complete | All 5 test suites passing |
| Publish to npm | ⏳ Pending | Awaiting npm credentials |
| Refactor web app | ⏳ Pending | After npm publish |
| Create Discord bot | ⏳ Pending | Phase 2 starting |

---

## 🔗 Resources

- **Core Package:** `packages/core/` (this repository)
- **Web App:** Root directory
- **Discord Bot Docs:** `docs/discord-bot/`
- **npm Package Docs:** [PACKAGE_GUIDE.md](../../docs/discord-bot/PACKAGE_GUIDE.md)
- **Discord.js Guide:** https://discord.js.org
- **Universalis API:** https://universalis.app/docs

---

**Generated:** November 22, 2025
**Author:** XIV Dye Tools Team
**Version:** xivdyetools-core@1.0.0
