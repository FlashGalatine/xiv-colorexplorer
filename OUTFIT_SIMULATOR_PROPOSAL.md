# FFXIV Outfit Color Simulator - Implementation Proposal

## Overview

A tool that allows players to visualize how different dye combinations look on complete outfits, bridging the gap between individual color analysis (Color Matcher, Dye Comparison) and practical outfit planning.

## The Core Challenge: Rendering Dyed Gear

### Challenge: Browser Rendering vs In-Game Rendering

**The Problem:**
- FFXIV uses a proprietary rendering engine with specific shaders, materials, and lighting
- Dyes interact differently with various material types (cloth, leather, metal)
- Same dye can look drastically different on different gear due to material properties
- Browser-based 3D (WebGL/Three.js) cannot accurately replicate FFXIV's shader system

**Why This Matters:**
- A dye preview that looks "wrong" compared to in-game is worse than no preview at all
- Players need to trust the tool's output to make decisions
- Misleading previews could frustrate users who dye expensive gear based on inaccurate simulations

## Proposed Implementation Approaches

### Approach 1: Screenshot-Based Color Overlay (Recommended)

**How It Works:**
1. Maintain a library of standardized gear screenshots (undyed/default state)
2. Use canvas manipulation to recolor dyeable areas based on selected dye hex colors
3. Display before/after comparison or live-updated preview

**Technical Implementation:**
- Single HTML file following existing architecture pattern
- Two-column layout: Left (controls), Right (preview canvas)
- Load gear reference images from `assets/images/gear/` directory
- Use HTML5 Canvas API for color manipulation
- Apply color overlay/multiply blend modes to approximate dyeing

**Pros:**
- No 3D rendering complexity
- Fast, lightweight, client-side only (fits existing architecture)
- Can be reasonably accurate if overlay algorithms are tuned
- Works on all browsers without WebGL requirements

**Cons:**
- Labor-intensive to create gear screenshot library
- Limited to specific gear pieces you've photographed
- Cannot rotate/view from different angles
- Color manipulation won't perfectly match in-game material behavior
- Requires maintaining gear library as new patches add items

**Data Structure Needed:**
```json
{
  "gearID": 12345,
  "slot": "Body",
  "name": "Chivalric Coat of Fending",
  "imageUrl": "assets/images/gear/chivalric_coat_fending.png",
  "dyeableAreas": [
    {
      "name": "primary",
      "maskUrl": "assets/images/gear/masks/chivalric_coat_fending_primary.png"
    },
    {
      "name": "secondary",
      "maskUrl": "assets/images/gear/masks/chivalric_coat_fending_secondary.png"
    }
  ],
  "defaultColors": {
    "primary": "#3a2f2f",
    "secondary": "#8b7355"
  }
}
```

### Approach 2: 3D Model Viewer (Advanced, Not Recommended)

**How It Works:**
1. Extract FFXIV 3D models using community tools (TexTools, xivModdingFramework)
2. Load models into Three.js WebGL viewer
3. Apply dye colors to material textures
4. Allow camera rotation and preview

**Pros:**
- Most visually impressive
- Can rotate and view from any angle
- Closer to in-game experience

**Cons:**
- Extremely complex implementation (300+ hours of development)
- Model extraction requires reverse-engineering game files (legal gray area)
- Still won't match in-game shaders accurately
- Large file sizes (models + textures)
- Performance issues on lower-end devices
- Breaks "no build process" architecture (would need asset bundling)
- Requires ongoing maintenance with every FFXIV patch

**Verdict:** Not feasible for this project's scope and architecture.

### Approach 3: Hybrid - Color Swatch Preview Only

**How It Works:**
1. Don't simulate gear appearance at all
2. Instead, show how multiple dyes work together as a palette
3. Display large color swatches for each armor slot with visual relationships
4. Include harmony analysis (complementary, analogous, etc.)

**Technical Implementation:**
- Extension of existing Dye Comparison tool
- Add "Outfit Mode" that organizes 6-8 dyes by slot (Head, Body, Hands, Legs, Feet, Weapon)
- Show color relationships using existing color wheel visualization
- Calculate palette harmony scores

**Pros:**
- Extremely simple to implement (2-3 days vs weeks/months)
- Leverages existing Dye Comparison codebase
- No asset library needed
- Accurate (just shows actual dye colors, no rendering approximation)
- Fits perfectly into existing architecture

**Cons:**
- Doesn't show how dyes look on actual gear
- Less visually exciting
- Relies on user imagination

### Approach 4: Community-Sourced Screenshot Gallery

**How It Works:**
1. Create a reference gallery tool
2. Users can submit screenshots of dyed gear
3. Tag with gear name, dye used, job class
4. Others can search/browse for inspiration

**Pros:**
- Crowdsourced content grows organically
- Shows real in-game results (100% accurate)
- Community engagement aspect

**Cons:**
- Requires backend/database (violates client-side architecture)
- Needs moderation system
- Slow to populate initially
- Not a "simulator" - just a reference gallery

## Recommended Path Forward

### Phase 1: Enhanced Dye Comparison - "Outfit Palette Mode" (1-2 days)

Extend `dyecomparison_stable.html` with a new mode:

**Features:**
- Select 6 dyes representing an outfit (Head, Body, Hands, Legs, Feet, Accessory)
- Visual layout showing how colors work together spatially (arranged like a character silhouette)
- Harmony analysis: Are the colors complementary? Too similar? Good contrast?
- Export palette as shareable code or image

**Why Start Here:**
- Minimal effort, immediate value
- Tests user interest before heavy investment
- Can always enhance later with screenshot overlays

### Phase 2 (Optional): Screenshot Overlay System (2-3 weeks)

If Phase 1 is successful and users want more:

**Focused Scope:**
- Start with 10-15 popular glamour pieces (voted by community)
- Create standardized screenshot library for those pieces only
- Build canvas-based color overlay system
- Allow saving/sharing outfit combinations

**Screenshot Creation Process:**
1. Use in-game character (specific race/gender for consistency)
2. Photograph each piece in default/undyed state
3. Standard lighting conditions (Idyllshire, overcast)
4. Front, side, back views
5. Manually create alpha masks for dyeable areas using image editing software

### Phase 3 (Future): Expand Gear Library (Ongoing)

- Add 5-10 new gear pieces per month based on community requests
- Prioritize endgame glamour sets and iconic pieces
- Community contributions (users submit standardized screenshots following template)

## Alternative Consideration: Color Accessibility Checker

Given your interest in Option 3, this could be **easier to implement and more unique**:

**Features:**
- Upload outfit screenshot or select multiple dyes
- Simulate deuteranopia, protanopia, tritanopia, achromatopsia
- Show side-by-side comparisons: normal vision vs colorblind simulation
- Contrast ratio calculator for text readability (useful for FC crests, nameplates)
- Warnings when dye combinations are indistinguishable

**Technical Implementation:**
- Single HTML file, two-column layout
- Color transformation matrices for each colorblindness type
- Canvas-based image filtering
- Reuse existing dye database from `colors_xiv.json`

**Why This Might Be Better:**
- Completely unique - no other FFXIV tool does this
- Socially valuable (promotes inclusivity)
- Technically achievable in 3-5 days
- Fits existing architecture perfectly
- No asset library needed if starting with dye swatches
- Can work with uploaded screenshots OR selected dyes from database

## Integration with Existing Tools

### Option 5: Enhance Color Matcher with Batch Extraction

**Features:**
- After uploading screenshot, extract top 5-10 dominant colors automatically
- Display all extracted colors with matching dyes
- One-click to send palette to "Outfit Palette Mode" in Dye Comparison

**Implementation:**
- Use k-means clustering on uploaded image pixels
- Extract cluster centroids as dominant colors
- Match each centroid against dye database
- Add "Extract Palette" button below image canvas

**Effort:** 1-2 days

## Technical Specifications Summary

### For Outfit Palette Mode (Recommended Start)
- **File:** `outfitplanner_stable.html` (new file) OR extend `dyecomparison_stable.html`
- **Layout:** Two-column (left: dye selectors, right: palette visualization)
- **Data:** Reuse `colors_xiv.json`
- **Storage:** localStorage for saved palettes
- **Integration:** Link from Tools dropdown menu

### For Color Accessibility Checker (Alternative)
- **File:** `colorblindness_stable.html` (new file)
- **Layout:** Two-column (left: controls + colorblind type selector, right: before/after comparison)
- **Algorithms:** Color transformation matrices (well-documented, readily available)
- **Input:** Selected dyes OR uploaded image
- **Output:** Simulated vision comparisons + contrast warnings

## Recommendation

**Start with Color Accessibility Checker** because:
1. Unique value proposition (no competition)
2. Technically feasible within project constraints
3. Socially valuable
4. 3-5 day implementation
5. No asset library needed
6. Perfect fit for existing architecture

**Then consider Outfit Palette Mode** as a natural enhancement to Dye Comparison (1-2 days).

**Defer screenshot-based simulator** until you have capacity for the multi-week asset creation process and can validate demand.

---

## Questions to Consider

1. **Would you prefer a quick-win accessibility tool or a longer-term outfit simulator project?**
2. **If going with outfit simulator, are you willing to manually create screenshot libraries? (Estimated 30-60 minutes per gear piece)**
3. **Should outfit planning focus on color relationships (abstract) or visual accuracy (gear-specific)?**
4. **Would you consider user-contributed screenshots, or prefer to maintain quality control yourself?**
