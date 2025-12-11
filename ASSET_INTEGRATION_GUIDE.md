# 🎮 Asset Integration Guide

**Purpose**: How to integrate art assets into the game engine  
**Status**: Ready to implement once assets are created

---

## Quick Reference

### Asset Loading Service (Ready to Code)
```typescript
// services/assetLoader.ts - TO BE CREATED

export class AssetLoader {
  private static textures: Map<string, PIXI.Texture> = new Map();
  
  // Load sprite sheet
  static async loadSpriteSheet(name: string, path: string) {
    const texture = await PIXI.Texture.from(path);
    this.textures.set(name, texture);
    return texture;
  }
  
  // Get animation frames from sheet
  static getAnimationFrames(sheetName: string, config: {
    startX: number,
    startY: number,
    frameWidth: number,
    frameHeight: number,
    frameCount: number
  }): PIXI.Texture[] {
    const sheet = this.textures.get(sheetName);
    const frames: PIXI.Texture[] = [];
    
    for (let i = 0; i < config.frameCount; i++) {
      const x = config.startX + (i * config.frameWidth);
      const rect = new Rectangle(x, config.startY, config.frameWidth, config.frameHeight);
      frames.push(new PIXI.Texture(sheet, rect));
    }
    return frames;
  }
}
```

### Integration Points in Existing Code

#### 1. Player Sprite (Update `LevelEngine.ts`)
**Current Code** (Line ~120):
```typescript
this.player = new PIXI.Graphics();
this.player.beginFill(0xff0000);
this.player.drawRect(0, 0, 32, 32);
this.player.endFill();
```

**Replace With**:
```typescript
// Load player sprite
const playerFrames = AssetLoader.getAnimationFrames('player_idle', {
  startX: 0, startY: 0,
  frameWidth: 32, frameHeight: 32,
  frameCount: 4
});

this.player = new PIXI.AnimatedSprite(playerFrames);
this.player.animationSpeed = 0.1;
this.player.play();
```

#### 2. Platforms (Update `LevelView.tsx`)
**Current Code** (generates green rectangles):
```typescript
platforms: [
  { x: 0, y: 300, w: 800, h: 20 },
  { x: 150, y: 250, w: 100, h: 20 }
]
```

**Replace With**:
```typescript
// Load from tileset based on world
const tilesetName = worldId === 1 ? 'earthquake' : /* ... */;
const platformTile = AssetLoader.getTile(tilesetName, 'platform_horizontal');

// Render with tiling
const platform = new PIXI.TilingSprite(
  platformTile,
  platformData.w,
  platformData.h
);
platform.position.set(platformData.x, platformData.y);
engine.app.stage.addChild(platform);
```

#### 3. Backgrounds (New Feature)
**Add to `LevelView.tsx`**:
```typescript
// Add parallax backgrounds
useEffect(() => {
  if (!canvasContainerRef.current) return;
  
  const worldTheme = getWorldTheme(currentLevelData.worldId);
  const parallaxLayers = [
    { texture: `${worldTheme}_bg_sky.png`, speed: 0.2 },
    { texture: `${worldTheme}_bg_distant.png`, speed: 0.4 },
    { texture: `${worldTheme}_bg_mid.png`, speed: 0.6 }
  ];
  
  for (const layer of parallaxLayers) {
    const sprite = new PIXI.Sprite(
      AssetLoader.getTexture(layer.texture)
    );
    sprite.scale.set(2);
    engine.app.stage.addChildAt(sprite, 0);
  }
}, [currentLevelData]);
```

#### 4. NPCs (Update `NPCDialog.tsx`)
**Current Code** (just text):
```typescript
<div className="avatar-placeholder">
  <Sprinkle size={48} />
</div>
```

**Replace With**:
```typescript
const getNPCSprite = (npcId: string) => {
  const frames = AssetLoader.getAnimationFrames(`${npcId}_idle`, {
    startX: 0, startY: 0,
    frameWidth: 24, frameHeight: 24,
    frameCount: 3
  });
  return new PIXI.AnimatedSprite(frames);
};

<div className="avatar-placeholder">
  {pixiRenderer && getNPCSprite(npcId)}
</div>
```

---

## 🔧 Implementation Order

### Phase 1: Player & Basic Animation (Week 1)
1. Create `services/assetLoader.ts`
2. Load player sprite sheet
3. Update `LevelEngine.ts` to use player sprite
4. Test animation playback

**Files to Create**: assetLoader.ts (150 lines)  
**Files to Modify**: LevelEngine.ts, LevelView.tsx  
**Time**: 2-3 hours

### Phase 2: Platforms & Tilesets (Week 1-2)
1. Create tileset loader
2. Update level rendering to use tilesets
3. Test collision with new tiles

**Files to Modify**: LevelView.tsx, levelEngine.ts  
**Time**: 2-3 hours

### Phase 3: Backgrounds & Effects (Week 2)
1. Add parallax background system
2. Implement particle effects
3. Test performance

**Files to Create**: particleEffects.ts (150 lines)  
**Files to Modify**: LevelView.tsx  
**Time**: 2-3 hours

### Phase 4: NPCs & UI (Week 2-3)
1. Update NPC rendering
2. Load UI button sprites
3. Replace icon fonts with custom graphics

**Files to Modify**: NPCDialog.tsx, UI components  
**Time**: 2-3 hours

---

## 📊 Asset Directory Structure (Finalized)

```
/assets/
├── /sprites/
│   ├── /player/
│   │   ├── idle.png          (320x32, 4 frames)
│   │   ├── walk_right.png    (192x32, 6 frames)
│   │   ├── walk_left.png     (192x32, 6 frames)
│   │   ├── jump.png          (96x32, 3 frames)
│   │   └── fall.png          (64x32, 2 frames)
│   ├── /npcs/
│   │   ├── sprinkle_idle.png (96x24, 3 frames)
│   │   ├── sprinkle_talk.png (64x24, 2 frames)
│   │   ├── elder_idle.png    (64x40, 2 frames)
│   │   └── ... (more NPC animations)
│   └── /enemies/
│       ├── stone_golem.png   (64x32, 2 frames)
│       └── ... (8 enemy types)
├── /tilesets/
│   ├── earthquake.png        (512x512)
│   ├── tsunami.png           (512x512)
│   ├── volcano.png           (512x512)
│   └── desert.png            (512x512)
├── /backgrounds/
│   ├── /earthquake/
│   │   ├── sky.png           (1920x540)
│   │   ├── distant.png       (1920x540)
│   │   ├── mid.png           (1920x540)
│   │   └── close.png         (1920x540)
│   ├── /tsunami/             (4 layers each)
│   ├── /volcano/             (4 layers each)
│   └── /desert/              (4 layers each)
├── /ui/
│   ├── buttons.png           (512x128)
│   ├── icons.png             (256x512)
│   ├── status_bars.png       (256x64)
│   └── dialog_bg.png         (64x64, 9-slice)
├── /effects/
│   ├── explosion.png         (96x32, 6 frames)
│   ├── splash.png            (112x48, 5 frames)
│   ├── dust.png              (96x32, 4 frames)
│   └── sparkle.png           (48x16, 3 frames)
└── /data/
    ├── sprites.json          (sprite frame definitions)
    └── collision.json        (hitbox data)
```

---

## 🎯 For Asset Pack Libraries (itch.io, OpenGameArt)

### What to Search For
1. **Platformer sprites** - "16-bit pixel art platformer sprites"
2. **Tileset packs** - "free platformer tileset 32x32"
3. **Character sprite sheets** - "free pixel art character sprite sheet"
4. **Particle effect packs** - "pixel art particle effects"

### Licensing Requirements
- ✅ Must allow commercial use
- ✅ Must allow modification
- ✅ Preferably CC0 or MIT license
- ✅ Credit author (document in game credits)

### Adaptation Process
If using asset packs:
1. Identify which sprites match your worlds
2. Extract individual tilesets/sprites
3. Create mapping in `assetLoader.ts`
4. Test in game
5. Adjust sizes if needed (resample)

**Recommended Sources**:
- OpenGameArt.org
- itch.io (free assets)
- Kenney.nl (high-quality free packs)
- GraphicsGale (pixel art tools)

---

## 🚀 Getting Started Now

### Step 1: Create Asset Manifest File
```json
// assets/data/manifest.json
{
  "version": "1.0",
  "worlds": {
    "1": {
      "name": "Earthquake Escape",
      "tileset": "earthquake.png",
      "backgrounds": ["sky.png", "distant.png", "mid.png", "close.png"],
      "enemies": ["stone_golem.png", "rock_spike.png"]
    }
  },
  "sprites": {
    "player_idle": {
      "file": "sprites/player/idle.png",
      "frameWidth": 32,
      "frameHeight": 32,
      "frameCount": 4,
      "fps": 8
    }
  }
}
```

### Step 2: Create Stub AssetLoader
```typescript
// services/assetLoader.ts
export class AssetLoader {
  static async preload(manifest: any) {
    console.log('Asset preloading would happen here');
    // Implemented after assets are ready
  }
}
```

### Step 3: Add to Game Initialization
```typescript
// App.tsx or LevelView.tsx
useEffect(() => {
  AssetLoader.preload(assetManifest).catch(err => {
    console.warn('Assets not available, using fallbacks');
  });
}, []);
```

---

## 📋 Checklist for Artist/Asset Creator

When you receive assets, verify:

- [ ] All sprite sheets are PNG format
- [ ] Sprites have proper padding/spacing
- [ ] File names match specification exactly
- [ ] Color palettes match specification
- [ ] Tile sizes are exactly 32x32
- [ ] Sprite dimensions match spec (32x32, 24x24, etc.)
- [ ] Background images are 1920x1080 or 1920x540
- [ ] Animation frame counts match specification
- [ ] No overlapping sprites in sheets
- [ ] Transparent backgrounds (PNG with alpha)

---

## 🎬 Testing Asset Integration

### Manual Test Checklist
1. Load game and enter a level
2. Verify player sprite displays
3. Verify platforms render correctly
4. Verify backgrounds show with parallax
5. Verify NPCs render in dialogs
6. Verify particle effects play
7. Test on mobile (responsive scaling)
8. Profile performance (should be 60 FPS)

### Debug Commands (Console)
```javascript
// Check loaded textures
console.log(AssetLoader.getAllTextures());

// Test sprite animation
AssetLoader.testAnimation('player_idle');

// Measure FPS
performance.mark('frame-start');
// ... frame render ...
performance.mark('frame-end');
```

---

## 🔄 Asset Update Workflow

When updating assets:
1. Name new files with version suffix: `player_idle_v2.png`
2. Update manifest.json
3. Run preload test
4. Deploy updated assets
5. Clear browser cache (`npm run dev` for Vite auto-clear)

---

**Status**: Ready for artist to begin  
**Last Updated**: December 11, 2025
