# 🎨 World Hero Adventures - Complete Art Specification

**Document Version**: 1.0  
**Date**: December 11, 2025  
**Purpose**: Comprehensive art requirements for all game assets

---

## 📋 Table of Contents

1. [Visual Style Guide](#visual-style-guide)
2. [Asset Inventory](#asset-inventory)
3. [Character Sprites](#character-sprites)
4. [World Tilesets](#world-tilesets)
5. [UI/HUD Graphics](#uihud-graphics)
6. [Particle Effects](#particle-effects)
7. [Color Palettes](#color-palettes)
8. [Animation Specifications](#animation-specifications)
9. [File Structure](#file-structure)
10. [AI Prompt Templates](#ai-prompt-templates)

---

## 🎨 Visual Style Guide

### Overall Aesthetic
- **Style**: Retro pixel art (16-bit era inspired)
- **Pixel Size**: 16x16 base unit for sprites, 32x32 for tiles
- **Color Depth**: 8-bit inspired (limited, vibrant palette)
- **Influences**: Kirby, Mega Man, Super Mario Bros
- **Tone**: Colorful, friendly, non-violent, educational

### Technical Specifications
- **Resolution**: 1920x1080 base (scales responsively)
- **Aspect Ratio**: 16:9 (with 4:3 mobile fallback)
- **Canvas Render Scale**: 2x upscaling for pixel-perfect rendering
- **Parallax Depth Layers**: 4 layers minimum

### Design Philosophy
- **Target Age**: 6-12 years old
- **Readability**: Large, clear sprites (no tiny details)
- **Accessibility**: High contrast, colorblind-friendly colors
- **Consistency**: Same art style across all worlds
- **Performance**: Optimized sprite sheets, max 256 colors per tileset

---

## 📦 Asset Inventory

### Total Assets Needed

| Category | Count | Priority | Status |
|----------|-------|----------|--------|
| **Player Sprites** | 1 character | CRITICAL | ⏳ TODO |
| **NPC Sprites** | 4 characters | HIGH | ⏳ TODO |
| **Enemy Sprites** | 8 types | MEDIUM | ⏳ TODO |
| **World Tilesets** | 4 complete sets | CRITICAL | ⏳ TODO |
| **Platforms** | 12 unique types | HIGH | ⏳ TODO |
| **Items/Collectibles** | 15 types | HIGH | ⏳ TODO |
| **UI Elements** | 30+ sprites | HIGH | ⏳ TODO |
| **Effects/Particles** | 20+ effects | MEDIUM | ⏳ TODO |
| **Backgrounds** | 8 parallax sets | HIGH | ⏳ TODO |
| **Total Sprite Sheets** | 8-10 sheets | - | ⏳ TODO |

---

## 👤 Character Sprites

### 1. Player Character - "The Hero"

**Sprite Sheet Layout**:
```
Idle (4 frames)        | Walking Right (6 frames) | Jumping (3 frames)
Walking Left (6 frames) | Running Right (6 frames) | Falling (2 frames)
```

**Dimensions**: 32x32 pixels per frame

**Animations**:
- **Idle**: 4 frames, loop (breathing, subtle movement)
- **Walking Left**: 6 frames, smooth stride
- **Walking Right**: 6 frames, mirror of left
- **Running**: 6 frames, faster pace, longer stride
- **Jumping Up**: 3 frames (start, peak, mid-fall)
- **Falling**: 2 frames (falling, about-to-land)
- **Landing**: 1 frame (impact)
- **Hurt**: 2 frames (flash effect)

**Color Palette**:
- Skin: Light peachy tone
- Hair: Bright yellow or dark brown
- Outfit: Blue/red primary colors
- Shoes: Contrasting color (yellow/orange)

**Technical**:
- Frame size: 32x32 with 2px padding
- Sheet size: 320x320 (recommended)
- Facing: Right-facing for walking/running (flip for left)
- Shadow: 4px drop shadow, 50% opacity

---

### 2. NPC Characters

#### A. Sprinkle (Mascot - Cheerful)
- **Type**: Fairy/Sprite character
- **Size**: 24x24 pixels
- **Color**: Bright purple/pink with sparkles
- **Animations**: 
  - Idle: 3 frames, floating motion
  - Talk: 2 frames, mouth movement
  - Celebrate: 4 frames, jumping with sparkles
  - Sad: 1 frame

**Sprite Sheet**: 96x48 pixels

#### B. Elder (Wise Mentor)
- **Type**: Older character with wisdom visual
- **Size**: 32x40 pixels
- **Color**: Brown/gray, gentle features
- **Animations**:
  - Idle: 2 frames
  - Gesturing: 3 frames
  - Nodding: 2 frames

**Sprite Sheet**: 160x80 pixels

#### C. Merchant (Trader)
- **Type**: Cheerful vendor
- **Size**: 32x32 pixels
- **Color**: Green/brown, shop-owner aesthetic
- **Animations**:
  - Idle: 2 frames
  - Counting money: 2 frames
  - Waving: 2 frames

**Sprite Sheet**: 96x64 pixels

#### D. Guardian (Protector)
- **Type**: Strong protector figure
- **Size**: 32x40 pixels
- **Color**: Gold/blue armor
- **Animations**:
  - Standing: 1 frame
  - Arm raise: 2 frames
  - Alert: 2 frames

**Sprite Sheet**: 128x80 pixels

---

### 3. Enemy Sprites (8 types)

| Enemy | Size | Frames | Theme | World |
|-------|------|--------|-------|-------|
| **Stone Golem** | 32x32 | 2 | Earthquake | World 1 |
| **Rock Spike** | 16x32 | 1 | Earthquake | World 1 |
| **Water Blob** | 24x24 | 4 | Tsunami | World 2 |
| **Whirlpool** | 32x32 | 3 | Tsunami | World 2 |
| **Lava Slug** | 32x24 | 3 | Volcano | World 3 |
| **Ash Cloud** | 40x32 | 2 | Volcano | World 3 |
| **Sand Scorpion** | 32x24 | 3 | Desert | World 4 |
| **Dust Devil** | 32x32 | 4 | Desert | World 4 |

**Enemy Design Notes**:
- Non-violent (no gore/blood)
- Clearly avoidable
- Obvious "bad" visual indicators
- 2-4 animation frames minimum

---

## 🗺️ World Tilesets

### World 1: Earthquake Escape 🏛️

**Tileset Name**: `earthquake_tileset.png`  
**Tile Size**: 32x32 pixels  
**Sheet Size**: 512x512 pixels (16x16 tiles)

**Required Tiles**:
- Ground/dirt base (4 variants)
- Cracked ground (4 variants)
- Stone blocks (6 variants)
- Broken columns (3 variants)
- Stairs (4 directions)
- Platform edge (left/right)
- Decorative ruins (4 types)

**Color Palette**:
- Primary: Browns (#8B6F47, #A0826D)
- Accent: Grays (#5A5A5A, #8C7853)
- Cracks: Dark brown (#4A3C28)
- Highlights: Light tan (#D2B48C)

**Background Parallax Layers** (4 layers):
1. Sky with clouds
2. Distant ruins
3. Mid-ground hills
4. Foreground debris

---

### World 2: Tsunami Tower 🌊

**Tileset Name**: `tsunami_tileset.png`  
**Tile Size**: 32x32 pixels  
**Sheet Size**: 512x512 pixels

**Required Tiles**:
- Water platforms (3 states: normal, ripple, wave)
- Ice blocks (4 variants)
- Wooden platforms (3 variants)
- Rope (vertical/horizontal)
- Kelp (3 variants)
- Building blocks (4 types)
- Wave effects (2 types)

**Color Palette**:
- Water: Blues (#1E90FF, #4169E1, #87CEEB)
- Ice: Cyan/white (#E0F6FF, #B0E0E6)
- Wood: Browns (#8B4513, #A0522D)
- Foam: White (#FFFACD)

**Background Parallax Layers**:
1. Storm clouds
2. Distant tower
3. Mid-ocean horizon
4. Wave particles

---

### World 3: Volcano Valley 🌋

**Tileset Name**: `volcano_tileset.png`  
**Tile Size**: 32x32 pixels  
**Sheet Size**: 512x512 pixels

**Required Tiles**:
- Lava platforms (3 states: cool, glowing, bubbling)
- Dark rock (4 variants)
- Ash blocks (3 variants)
- Lava bucket shapes (3 types)
- Crystal formations (3 types)
- Magma flow (animated)

**Color Palette**:
- Lava: Reds/Oranges (#FF4500, #FF6347, #FF8C00)
- Rock: Dark grays (#2F4F4F, #36454F)
- Ash: Light grays (#A9A9A9, #C0C0C0)
- Glow: Bright orange (#FFD700)

**Background Parallax Layers**:
1. Smoke clouds
2. Distant volcano
3. Lava lake
4. Foreground rock spikes

---

### World 4: Desert Drought 🏜️

**Tileset Name**: `desert_tileset.png`  
**Tile Size**: 32x32 pixels  
**Sheet Size**: 512x512 pixels

**Required Tiles**:
- Sand blocks (4 variants, with dunes)
- Rocky outcrops (4 variants)
- Cacti (3 types)
- Stone pillars (3 types)
- Water pools (2 states)
- Rope/vine (vertical/horizontal)

**Color Palette**:
- Sand: Golds/Tans (#DAA520, #F0E68C, #BDB76B)
- Rock: Browns (#8B7355, #A0826D)
- Water: Blues (#4169E1)
- Sky: Yellows (#FFFACD, #FFE4B5)

**Background Parallax Layers**:
1. Sun/sky
2. Distant dunes
3. Mid-ground rocks
4. Sand particles blowing

---

## 🎯 UI/HUD Graphics

### HUD Elements (32x32 base size)

**Health/Status**:
- Heart icon (empty/full variants)
- Shield icon (empty/full variants)
- Star icon (for ratings)
- XP bar segments

**Controls**:
- Arrow buttons (up/down/left/right)
- Jump button (rounded square)
- Action button (A/B/X/Y style)
- Menu button (hamburger icon)

**Items/Inventory**:
- Water bottle icon
- Stone/rock icon
- Wood/log icon
- Coin icon
- Key icon
- Chest icon

**World Icons**:
- Earthquake icon (shaking ground)
- Tsunami icon (wave)
- Volcano icon (eruption)
- Desert icon (dunes)

**Status Icons**:
- Completed level (checkmark)
- Locked level (padlock)
- New level (star)
- In progress (arrow)

### Menu Assets

**Button Styles**:
- Standard button (96x32)
- Small button (64x24)
- Large button (128x48)
- Toggle button (on/off states)

**Panel Backgrounds**:
- Semi-transparent overlay (repeated texture)
- Dialog box corners (9-slice parts)
- Health/status bar backgrounds

**Text Effects**:
- Level up glow
- Damage numbers
- Pickup text
- Achievement notification

---

## ✨ Particle Effects

### Explosion/Impact
- 6 frame animation loop
- 32x32 sprite sheet
- Colors: Orange, yellow, red (for lava/fire)

### Water Splash
- 5 frame animation
- 48x48 sprite sheet
- Colors: Blue, white foam

### Dust Cloud
- 4 frame animation
- 32x32 sprite sheet
- Colors: Brown, tan

### Sparkle/Shine
- 3 frame animation
- 16x16 sprite sheet
- Colors: Gold, white

### Victory Confetti
- 4 frame animation
- 24x24 sprite sheet
- Multiple colors per sheet

### Power Up Glow
- 4 frame pulsing animation
- 32x32 sprite sheet
- Color: Gold with white glow

---

## 🎨 Color Palettes

### World 1 - Earthquake (Cool Earthy)
```
Primary: #8B6F47, #A0826D
Secondary: #5A5A5A, #8C7853
Accent: #D2B48C, #4A3C28
UI: #2C2C2C, #FFFFFF
```

### World 2 - Tsunami (Cool Blues)
```
Primary: #1E90FF, #4169E1
Secondary: #87CEEB, #B0E0E6
Accent: #FFD700, #FFFACD
UI: #003366, #FFFFFF
```

### World 3 - Volcano (Hot Reds)
```
Primary: #FF4500, #FF6347
Secondary: #FF8C00, #FFD700
Accent: #2F4F4F, #36454F
UI: #8B0000, #FFFFFF
```

### World 4 - Desert (Warm Yellows)
```
Primary: #DAA520, #F0E68C
Secondary: #BDB76B, #8B7355
Accent: #4169E1, #A0826D
UI: #8B4513, #FFFFFF
```

### Universal Palette (UI/Effects)
```
Positive: #00AA00 (green)
Negative: #FF0000 (red)
Neutral: #FFAA00 (orange)
Information: #0088FF (blue)
Success: #00DDAA (cyan-green)
```

---

## 🎬 Animation Specifications

### Frame Rates
- **Idle animations**: 8 FPS (slower, relaxed)
- **Walking/moving**: 10 FPS (natural pace)
- **Running/action**: 12 FPS (energetic)
- **UI animations**: 8 FPS (smooth, not distracting)
- **Effects**: 12-15 FPS (dynamic)

### Animation Timing
- **Loop**: True for idle/walking/effects
- **Hold last frame**: True for transitions (jump peak, landing)
- **Reverse play**: Some effects (fade in/out)

### Easing Functions (Sprite Movement)
- **Jump arc**: Ease-out up, ease-in down
- **Impact bounce**: Ease-out bounce
- **Particle fade**: Linear fade to transparent

---

## 📁 File Structure

### Recommended Directory Organization
```
/assets/
├── /sprites/
│   ├── /player/
│   │   ├── player_animations.png       (320x320)
│   │   └── player_shadows.png          (64x32)
│   ├── /npcs/
│   │   ├── sprinkle.png                (96x48)
│   │   ├── elder.png                   (160x80)
│   │   ├── merchant.png                (96x64)
│   │   └── guardian.png                (128x80)
│   └── /enemies/
│       ├── stone_golem.png             (64x64)
│       ├── water_blob.png              (48x48)
│       ├── lava_slug.png               (64x48)
│       └── ... (5 more)
├── /tilesets/
│   ├── earthquake_tileset.png          (512x512)
│   ├── tsunami_tileset.png             (512x512)
│   ├── volcano_tileset.png             (512x512)
│   └── desert_tileset.png              (512x512)
├── /backgrounds/
│   ├── earthquake_bg_1.png             (1920x1080)
│   ├── earthquake_bg_2.png
│   ├── ... (3 more per world)
├── /ui/
│   ├── buttons.png                     (512x128)
│   ├── icons.png                       (256x256)
│   ├── status_bars.png                 (256x32)
│   └── fonts/
│       └── pixel_font_32.png           (bitmap font)
├── /effects/
│   ├── explosion.png                   (32x32)
│   ├── splash.png                      (48x48)
│   ├── dust.png                        (32x32)
│   └── sparkle.png                     (16x16)
└── /data/
    ├── sprite_manifest.json            (metadata)
    ├── animation_timings.json          (frame data)
    └── collision_data.json             (hitbox definitions)
```

### Sprite Manifest Format (JSON)
```json
{
  "sprites": {
    "player_idle": {
      "file": "sprites/player/player_animations.png",
      "x": 0, "y": 0,
      "width": 32, "height": 32,
      "frames": 4,
      "fps": 8,
      "loop": true
    },
    "player_walk_right": {
      "file": "sprites/player/player_animations.png",
      "x": 128, "y": 0,
      "width": 32, "height": 32,
      "frames": 6,
      "fps": 10,
      "loop": true
    }
  },
  "tilesets": {
    "earthquake": {
      "file": "tilesets/earthquake_tileset.png",
      "tileWidth": 32,
      "tileHeight": 32
    }
  }
}
```

---

## 🤖 AI Prompt Templates

### For Midjourney / Stable Diffusion

#### Player Character
```
Create a retro 32x32 pixel art sprite sheet of a young hero character 
facing right. Include idle (4 frames), walking (6 frames), jumping (3 frames), 
and falling (2 frames). 
Style: 16-bit retro, Kirby-inspired, bright colors
Outfit: Blue/red adventure outfit with yellow shoes
Colors: peachy skin, yellow hair, no dark outlines, friendly expression
--niji --ar 5:1 --s 50
```

#### Earthquake Tileset
```
Create a 512x512 pixel art tileset sheet with 16x16 grid of 32x32 tiles.
Theme: Ancient Greek ruins with earthquake damage
Include: cracked ground, stone blocks, broken columns, rubble piles, stairs
Style: Brown/gray palette, 16-bit retro
Colors dominant: #8B6F47, #5A5A5A, #D2B48C
Clear tile boundaries, repeatable patterns
--niji --ar 1:1 --s 50
```

#### Tsunami World Background
```
Create a parallax background layer (1920x540) for a platformer game.
Theme: Ocean during tsunami, tower visible in distance
Style: Retro pixel art, 4-layer parallax effect visible
Colors: Blues (#1E90FF, #4169E1), sky yellows
Include: Storm clouds, water, distant tower silhouette
--niji --ar 16:9 --s 50
```

#### NPC Character - Sprinkle
```
Create a 24x24 pixel art sprite of a cheerful fairy character.
Animate 3 floating idle frames and 4 celebration jump frames
Style: Cute, magical, Kirby-inspired
Colors: Bright purple/pink (#DA70D6) with sparkles
Include: Wings, happy expression, glow effect
--niji --ar 2:1 --s 50
```

#### Enemy - Water Blob
```
Create a 24x24 pixel art sprite of a water blob enemy.
Animate 4 bouncing/shape-changing frames
Style: Slime-like creature, non-threatening
Colors: Blue (#1E90FF), white foam, simple features
Include: Round body, no eyes/mouth, smooth edges
--niji --ar 1:1 --s 50
```

#### Particle Effect - Explosion
```
Create a 32x32 pixel art explosion effect sprite sheet.
6 frames of expansion animation
Style: Bright, energetic, 16-bit retro
Colors: Orange (#FF6347), yellow (#FFD700), red (#FF4500)
Include: Smoke puffs, expanding radius, fades to transparent
--niji --ar 3:1 --s 50
```

---

## 📋 Asset Checklist

### Critical Assets (Must Have)
- [ ] Player character sprite sheet
- [ ] 4 world tilesets (earthquake, tsunami, volcano, desert)
- [ ] 4 platforms per world
- [ ] Sprinkle NPC character
- [ ] Basic UI buttons
- [ ] World selection icons

### High Priority Assets
- [ ] 3 remaining NPC characters (Elder, Merchant, Guardian)
- [ ] 4 background parallax sets
- [ ] Item/collectible sprites (water, stone, wood, coin)
- [ ] Status icons (health, XP, completion)
- [ ] Jump/landing particle effects

### Medium Priority Assets
- [ ] Enemy sprites (8 types)
- [ ] Advanced UI elements (menus, dialogs)
- [ ] Additional particle effects (4+ types)
- [ ] Animated decorations (flags, signs, etc.)

### Nice-to-Have Assets
- [ ] World transition animations
- [ ] Boss character sprites
- [ ] Special power-up effects
- [ ] Weather effects (rain, dust storms)
- [ ] Custom pixel font

---

## 🎯 Integration Instructions for Developers

### Sprite Loading (PixiJS)
```typescript
// Load sprite sheet
const spriteSheet = PIXI.Texture.from('assets/sprites/player/player_animations.png');

// Create animated sprite
const sprite = new PIXI.AnimatedSprite([
  new PIXI.Texture(spriteSheet, new Rectangle(0, 0, 32, 32)),
  new PIXI.Texture(spriteSheet, new Rectangle(32, 0, 32, 32)),
  // ... more frames
]);

sprite.animationSpeed = 0.1; // Based on FPS spec
sprite.play();
```

### Tilemap Integration (Tiled Editor)
```typescript
// Load from Tiled JSON
const tiledMap = await fetch('assets/tilesets/earthquake.tmj').then(r => r.json());
const tileset = PIXI.Texture.from(tiledMap.tilesets[0].image);

// Render tiles with collision detection
for (const tile of tiledMap.layers[0].data) {
  // Render and add collision box
}
```

### Background Parallax
```typescript
// Create parallax layers
const layers = [
  { texture: 'bg_sky.png', speed: 0.2 },
  { texture: 'bg_distant.png', speed: 0.4 },
  { texture: 'bg_mid.png', speed: 0.6 },
  { texture: 'bg_close.png', speed: 0.8 }
];

// Update on camera movement
container.x = cameraX * layer.speed;
```

---

## 📞 Questions & Support

For questions about these specifications:
1. Refer back to this document
2. Check the World class in `services/mockData.ts` for world definitions
3. Review `types.ts` for data structure requirements
4. Refer to PixiJS documentation for rendering options

---

**Last Updated**: December 11, 2025  
**Status**: Ready for artist/AI generation
