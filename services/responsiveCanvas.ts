/**
 * services/responsiveCanvas.ts
 * Manages responsive canvas sizing for mobile/tablet/desktop
 * Handles orientation changes, DPI scaling, and touch event coordination
 */

export interface CanvasConfig {
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  aspectRatio: 'auto' | number; // auto or 16:9, 4:3, etc
}

export interface ResponsiveState {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  isMobile: boolean;
  dpi: number;
  scaleFactor: number;
}

export class ResponsiveCanvasManager {
  private config: CanvasConfig;
  private state: ResponsiveState;
  private canvas: HTMLCanvasElement | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private orientationChangeHandler: ((state: ResponsiveState) => void) | null = null;

  constructor(config: Partial<CanvasConfig> = {}) {
    this.config = {
      minWidth: 320,
      minHeight: 240,
      maxWidth: 1920,
      maxHeight: 1440,
      aspectRatio: 'auto',
      ...config
    };

    this.state = {
      width: 800,
      height: 600,
      orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape',
      isMobile: this.detectMobile(),
      dpi: this.detectDPI(),
      scaleFactor: 1
    };

    this.setupListeners();
  }

  /**
   * Detect mobile device
   */
  private detectMobile(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768
    );
  }

  /**
   * Detect device DPI
   */
  private detectDPI(): number {
    return window.devicePixelRatio || 1;
  }

  /**
   * Setup event listeners
   */
  private setupListeners(): void {
    window.addEventListener('resize', () => this.handleResize());
    window.addEventListener('orientationchange', () => this.handleOrientationChange());

    // Handle fullscreen changes
    if (document.fullscreenEnabled) {
      document.addEventListener('fullscreenchange', () => this.handleResize());
    }
  }

  /**
   * Handle window resize
   */
  private handleResize(): void {
    const newState = this.calculateDimensions();
    this.state = newState;

    if (this.canvas) {
      this.applyCanvasDimensions(this.canvas, newState);
    }
  }

  /**
   * Handle orientation change
   */
  private handleOrientationChange(): void {
    // Delay to allow OS to update dimensions
    setTimeout(() => {
      this.handleResize();
      if (this.orientationChangeHandler) {
        this.orientationChangeHandler(this.state);
      }
    }, 100);
  }

  /**
   * Calculate optimal canvas dimensions
   */
  private calculateDimensions(): ResponsiveState {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Account for mobile UI (address bar, status bar)
    let availableWidth = windowWidth;
    let availableHeight = windowHeight * 0.95; // Leave 5% margin for UI

    // Detect orientation
    const orientation =
      availableHeight > availableWidth ? 'portrait' : 'landscape';

    // For canvas gameplay, use safe area
    const isMobile = this.detectMobile();
    if (isMobile && orientation === 'portrait') {
      // Portrait: use full width, reduce height for controls
      availableHeight -= 100; // Reserve space for mobile controls
    }

    // Clamp to config limits
    let width = Math.max(
      this.config.minWidth,
      Math.min(this.config.maxWidth, availableWidth)
    );
    let height = Math.max(
      this.config.minHeight,
      Math.min(this.config.maxHeight, availableHeight)
    );

    // Apply aspect ratio if specified
    if (this.config.aspectRatio !== 'auto') {
      const ratio = this.config.aspectRatio as number;
      const currentRatio = width / height;

      if (currentRatio > ratio) {
        // Width too large
        width = height * ratio;
      } else {
        // Height too large
        height = width / ratio;
      }
    }

    // Calculate scale factor for pixel-perfect rendering
    const dpi = this.detectDPI();
    const scaleFactor = dpi > 1 ? Math.min(dpi, 2) : 1;

    return {
      width: Math.floor(width),
      height: Math.floor(height),
      orientation,
      isMobile: this.detectMobile(),
      dpi,
      scaleFactor
    };
  }

  /**
   * Apply dimensions to canvas
   */
  private applyCanvasDimensions(
    canvas: HTMLCanvasElement,
    state: ResponsiveState
  ): void {
    // CSS dimensions
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;

    // Canvas resolution (for DPI scaling)
    const internalWidth = state.width * state.scaleFactor;
    const internalHeight = state.height * state.scaleFactor;

    canvas.width = internalWidth;
    canvas.height = internalHeight;

    // Scale internal drawing context for DPI
    if (state.scaleFactor > 1) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(state.scaleFactor, state.scaleFactor);
      }
    }
  }

  /**
   * Initialize responsive canvas
   */
  public initialize(canvas: HTMLCanvasElement): ResponsiveState {
    this.canvas = canvas;
    const state = this.calculateDimensions();
    this.applyCanvasDimensions(canvas, state);

    // Setup ResizeObserver for live container resizing
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });

    if (canvas.parentElement) {
      this.resizeObserver.observe(canvas.parentElement);
    }

    return state;
  }

  /**
   * Get current state
   */
  public getState(): ResponsiveState {
    return { ...this.state };
  }

  /**
   * Request fullscreen
   */
  public async requestFullscreen(): Promise<void> {
    if (this.canvas && document.fullscreenEnabled) {
      try {
        await this.canvas.requestFullscreen({ navigationUI: 'hide' });
        this.handleResize();
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    }
  }

  /**
   * Exit fullscreen
   */
  public async exitFullscreen(): Promise<void> {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
        this.handleResize();
      } catch (err) {
        console.warn('Exit fullscreen failed:', err);
      }
    }
  }

  /**
   * Lock screen orientation (mobile)
   */
  public async lockOrientation(
    orientation: 'portrait' | 'landscape'
  ): Promise<void> {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock(
          orientation === 'portrait' ? 'portrait-primary' : 'landscape-primary'
        );
      } catch (err) {
        console.warn('Orientation lock failed:', err);
      }
    }
  }

  /**
   * Unlock screen orientation
   */
  public async unlockOrientation(): Promise<void> {
    if (screen.orientation) {
      try {
        screen.orientation.unlock();
      } catch (err) {
        console.warn('Orientation unlock failed:', err);
      }
    }
  }

  /**
   * Register orientation change handler
   */
  public onOrientationChange(
    handler: (state: ResponsiveState) => void
  ): void {
    this.orientationChangeHandler = handler;
  }

  /**
   * Clean up
   */
  public destroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

export default ResponsiveCanvasManager;
