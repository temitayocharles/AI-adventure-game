/**
 * services/levelEngine.ts
 * PixiJS-based 2D platformer game engine with physics
 */

import * as PIXI from 'pixi.js';

export interface Vector2 {
  x: number;
  y: number;
}

export interface AABB {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LevelMetadata {
  platforms?: AABB[];
  tilemap?: {
    layers: Array<{
      objects?: AABB[];
    }>;
  };
  goal?: AABB;
}

export interface LevelEngineConfig {
  canvas: HTMLCanvasElement;
  width: number;
  height: number;
  metadata: LevelMetadata;
  onGoalReached?: () => void;
}

const GRAVITY = 1000; // pixels per second squared
const PLAYER_SPEED = 220; // pixels per second
const JUMP_FORCE = 600; // pixels per second

/**
 * AABB collision detection
 */
function aabbIntersect(a: AABB, b: AABB): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/**
 * Check if point is inside AABB
 */
function pointInAABB(p: Vector2, box: AABB): boolean {
  return p.x >= box.x && p.x <= box.x + box.w && p.y >= box.y && p.y <= box.y + box.h;
}

export class LevelEngine {
  private app: PIXI.Application;
  private player: PIXI.Graphics;
  private playerPos: Vector2 = { x: 50, y: 50 };
  private playerVel: Vector2 = { x: 0, y: 0 };
  private platforms: AABB[] = [];
  private goal: AABB | null = null;
  private isJumping = false;
  private keys: Record<string, boolean> = {};
  private lastFrameTime = 0;
  private onGoalReached: (() => void) | null = null;

  constructor(config: LevelEngineConfig) {
    this.onGoalReached = config.onGoalReached || null;

    console.log('🎮 LevelEngine Constructor:', {
      canvasWidth: config.width,
      canvasHeight: config.height,
      canvasElement: config.canvas.tagName,
      canvasClientSize: {
        width: config.canvas.clientWidth,
        height: config.canvas.clientHeight
      },
      platformCount: config.metadata.platforms?.length || 0,
      hasGoal: !!config.metadata.goal
    });

    // Initialize PixiJS
    this.app = new PIXI.Application({
      canvas: config.canvas,
      width: config.width,
      height: config.height,
      backgroundColor: 0x87ceeb // sky blue
    });

    console.log('✅ PixiJS app created:', {
      screenWidth: this.app.screen.width,
      screenHeight: this.app.screen.height,
      stageChildren: this.app.stage.children.length
    });

    // Parse platforms from level metadata
    if (config.metadata.tilemap?.layers) {
      for (const layer of config.metadata.tilemap.layers) {
        if (layer.objects) {
          this.platforms.push(...layer.objects);
        }
      }
    } else if (config.metadata.platforms) {
      this.platforms = config.metadata.platforms;
    }

    console.log('📦 Platforms loaded:', this.platforms.length);

    // Set goal
    if (config.metadata.goal) {
      this.goal = config.metadata.goal;
      console.log('🎯 Goal set:', this.goal);
    }

    // Create player
    this.player = new PIXI.Graphics();
    this.player.beginFill(0xff0000); // Red square
    this.player.drawRect(0, 0, 32, 32);
    this.player.endFill();
    this.player.position.set(this.playerPos.x, this.playerPos.y);
    this.app.stage.addChild(this.player);
    console.log('👤 Player created at:', this.playerPos);

    // Draw platforms
    console.log('🖌️ Drawing platforms...');
    this.drawPlatforms();
    console.log('✅ Platforms drawn, stage children:', this.app.stage.children.length);

    // Draw goal
    if (this.goal) {
      console.log('🖌️ Drawing goal...');
      this.drawGoal();
      console.log('✅ Goal drawn, stage children:', this.app.stage.children.length);
    }

    // Setup input
    this.setupInput();

    // Start game loop
    this.app.ticker.add(() => this.update());
    console.log('✅ Game loop started');
    
    // Force initial render
    setTimeout(() => {
      this.app.render();
      console.log('✅ Initial render complete');
    }, 100);
  }

  private drawPlatforms(): void {
    for (const platform of this.platforms) {
      const rect = new PIXI.Graphics();
      rect.beginFill(0x90ee90); // Light green
      rect.drawRect(0, 0, platform.w, platform.h);
      rect.endFill();
      rect.position.set(platform.x, platform.y);
      this.app.stage.addChild(rect);
    }
  }

  private drawGoal(): void {
    if (!this.goal) return;

    const goal = new PIXI.Graphics();
    goal.beginFill(0xffd700); // Gold
    goal.drawRect(0, 0, this.goal.w, this.goal.h);
    goal.endFill();
    goal.position.set(this.goal.x, this.goal.y);
    this.app.stage.addChild(goal);
  }

  private setupInput(): void {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys['left'] = true;
      if (key === 'arrowright' || key === 'd') this.keys['right'] = true;
      if (key === ' ' || key === 'arrowup' || key === 'w') {
        this.keys['jump'] = true;
        this.jump();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowleft' || key === 'a') this.keys['left'] = false;
      if (key === 'arrowright' || key === 'd') this.keys['right'] = false;
      if (key === ' ' || key === 'arrowup' || key === 'w') this.keys['jump'] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  private jump(): void {
    if (this.isJumping) return;

    // Check if on ground
    const playerBox: AABB = {
      x: this.playerPos.x,
      y: this.playerPos.y,
      w: 32,
      h: 32
    };

    const belowBox: AABB = {
      x: playerBox.x,
      y: playerBox.y + playerBox.h + 1,
      w: playerBox.w,
      h: 1
    };

    let onGround = false;
    for (const platform of this.platforms) {
      if (aabbIntersect(belowBox, platform)) {
        onGround = true;
        break;
      }
    }

    if (!onGround) return;

    this.playerVel.y = -JUMP_FORCE;
    this.isJumping = true;
  }

  private update(): void {
    const deltaTime = this.app.ticker.deltaMS / 1000;

    // Apply gravity
    this.playerVel.y += GRAVITY * deltaTime;

    // Handle horizontal input
    if (this.keys['left']) {
      this.playerPos.x -= PLAYER_SPEED * deltaTime;
    }
    if (this.keys['right']) {
      this.playerPos.x += PLAYER_SPEED * deltaTime;
    }

    // Update position
    this.playerPos.x += this.playerVel.x * deltaTime;
    this.playerPos.y += this.playerVel.y * deltaTime;

    // Boundary checks
    if (this.playerPos.x < 0) this.playerPos.x = 0;
    if (this.playerPos.x + 32 > this.app.screen.width) {
      this.playerPos.x = this.app.screen.width - 32;
    }

    // Platform collision
    const playerBox: AABB = {
      x: this.playerPos.x,
      y: this.playerPos.y,
      w: 32,
      h: 32
    };

    let onGround = false;
    for (const platform of this.platforms) {
      if (aabbIntersect(playerBox, platform)) {
        // Push player out of platform (simple resolution)
        if (this.playerVel.y > 0) {
          // Falling onto platform
          this.playerPos.y = platform.y - 32;
          this.playerVel.y = 0;
          this.isJumping = false;
          onGround = true;
        }
      }
    }

    // Check if fell off world
    if (this.playerPos.y > this.app.screen.height + 100) {
      this.reset();
    }

    // Check goal
    if (this.goal && pointInAABB(this.playerPos, this.goal)) {
      if (this.onGoalReached) {
        this.onGoalReached();
      }
    }

    // Update player sprite
    this.player.position.set(this.playerPos.x, this.playerPos.y);
  }

  private reset(): void {
    this.playerPos = { x: 50, y: 50 };
    this.playerVel = { x: 0, y: 0 };
    this.isJumping = false;
  }

  /**
   * Mobile control methods
   */
  public moveLeft(): void {
    this.keys['left'] = true;
  }

  public moveRight(): void {
    this.keys['right'] = true;
  }

  public jumpAction(): void {
    if (!this.isJumping) {
      this.playerVel.y = -JUMP_FORCE;
      this.isJumping = true;
    }
  }

  public stop(): void {
    this.keys['left'] = false;
    this.keys['right'] = false;
  }

  public destroy(): void {
    window.removeEventListener('keydown', () => {});
    window.removeEventListener('keyup', () => {});
    this.app.destroy();
  }

  public getPlayerPosition(): Vector2 {
    return { ...this.playerPos };
  }
}
