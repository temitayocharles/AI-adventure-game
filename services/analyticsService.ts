/**
 * services/analyticsService.ts
 * Game analytics and event tracking for metrics collection
 * Tracks gameplay events, player progression, and engagement
 */

export interface GameEvent {
  eventType: string;
  timestamp: number;
  userId?: string;
  data: Record<string, any>;
}

export interface PlayerMetrics {
  totalLevelsCompleted: number;
  totalPlayTime: number; // in seconds
  averageCompletion Time: number;
  totalDeaths: number;
  achievementsUnlocked: number;
  itemsCrafted: number;
  friendsAdded: number;
  lastSessionEnd: Date;
}

export class AnalyticsService {
  private events: GameEvent[] = [];
  private sessionStart: number = Date.now();
  private eventBuffer: GameEvent[] = [];
  private bufferTimer: NodeJS.Timeout | null = null;
  private bufferSize = 10;
  private flushInterval = 30000; // 30 seconds
  private storageKey = 'world_hero_events';

  constructor() {
    this.loadEventsFromStorage();
    this.startFlushTimer();
  }

  /**
   * Track a game event
   */
  public trackEvent(
    eventType: string,
    data: Record<string, any> = {},
    userId?: string
  ): void {
    const event: GameEvent = {
      eventType,
      timestamp: Date.now(),
      userId,
      data
    };

    this.eventBuffer.push(event);

    // Flush if buffer is full
    if (this.eventBuffer.length >= this.bufferSize) {
      this.flush();
    }

    console.log(`📊 Event tracked: ${eventType}`, data);
  }

  /**
   * Track level completion
   */
  public trackLevelComplete(
    levelId: string,
    worldId: string,
    completionTime: number,
    attempts: number,
    userId?: string
  ): void {
    this.trackEvent(
      'level_complete',
      {
        levelId,
        worldId,
        completionTime,
        attempts,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track level failure/death
   */
  public trackLevelFailed(
    levelId: string,
    worldId: string,
    reason: string,
    userId?: string
  ): void {
    this.trackEvent(
      'level_failed',
      {
        levelId,
        worldId,
        reason,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track item collection
   */
  public trackItemCollected(
    itemType: string,
    itemId: string,
    location: string,
    userId?: string
  ): void {
    this.trackEvent(
      'item_collected',
      {
        itemType,
        itemId,
        location,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track crafting
   */
  public trackCraft(
    recipeId: string,
    itemCrafted: string,
    materialsUsed: Record<string, number>,
    userId?: string
  ): void {
    this.trackEvent(
      'item_crafted',
      {
        recipeId,
        itemCrafted,
        materialsUsed,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track achievement unlock
   */
  public trackAchievementUnlocked(
    achievementId: string,
    achievementTitle: string,
    userId?: string
  ): void {
    this.trackEvent(
      'achievement_unlocked',
      {
        achievementId,
        achievementTitle,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track NPC interaction
   */
  public trackNPCInteraction(
    npcId: string,
    npcName: string,
    action: string,
    userId?: string
  ): void {
    this.trackEvent(
      'npc_interaction',
      {
        npcId,
        npcName,
        action,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track AI feature usage
   */
  public trackAIUsage(
    feature: 'quest_generation' | 'npc_chat' | 'difficulty_adaptation' | 'level_generation',
    success: boolean,
    fallbackUsed: boolean,
    userId?: string
  ): void {
    this.trackEvent(
      'ai_usage',
      {
        feature,
        success,
        fallbackUsed,
        timestamp: new Date().toISOString()
      },
      userId
    );
  }

  /**
   * Track session metrics
   */
  public trackSessionEnd(userId?: string): void {
    const sessionDuration = (Date.now() - this.sessionStart) / 1000; // in seconds
    
    this.trackEvent(
      'session_end',
      {
        sessionDuration,
        eventCount: this.events.length + this.eventBuffer.length,
        timestamp: new Date().toISOString()
      },
      userId
    );

    // Flush all remaining events
    this.flush();
  }

  /**
   * Flush events to backend/storage
   */
  public flush(): void {
    if (this.eventBuffer.length === 0) return;

    // Add buffer to events
    this.events.push(...this.eventBuffer);
    this.eventBuffer = [];

    // Save to local storage
    this.saveEventsToStorage();

    // Optionally send to server (for production)
    this.sendToServer();
  }

  /**
   * Send events to server
   */
  private async sendToServer(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
      const token = localStorage.getItem('world_hero_jwt_token');

      if (!token) {
        console.warn('No auth token available for analytics');
        return;
      }

      const response = await fetch(`${apiBase}/api/v1/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          events: this.events,
          clientTimestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        // Clear sent events
        this.events = [];
        console.log('✅ Analytics flushed to server');
      } else {
        console.warn('Failed to send analytics:', response.statusText);
      }
    } catch (err) {
      console.warn('Failed to send analytics to server:', err);
      // Keep events in storage for retry
    }
  }

  /**
   * Save events to localStorage
   */
  private saveEventsToStorage(): void {
    try {
      const storageData = {
        events: this.events,
        lastSaved: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(storageData));
    } catch (err) {
      console.warn('Failed to save analytics to storage:', err);
    }
  }

  /**
   * Load events from localStorage
   */
  private loadEventsFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const { events } = JSON.parse(stored);
        this.events = events || [];
      }
    } catch (err) {
      console.warn('Failed to load analytics from storage:', err);
    }
  }

  /**
   * Start automatic flush timer
   */
  private startFlushTimer(): void {
    this.bufferTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Get current session metrics
   */
  public getSessionMetrics() {
    const sessionDuration = (Date.now() - this.sessionStart) / 1000;
    const eventCount = this.events.length + this.eventBuffer.length;

    return {
      sessionDuration,
      eventCount,
      sessionStart: new Date(this.sessionStart),
      sessionEnd: new Date()
    };
  }

  /**
   * Clear all events (for testing)
   */
  public clearEvents(): void {
    this.events = [];
    this.eventBuffer = [];
    localStorage.removeItem(this.storageKey);
    console.log('✅ Analytics cleared');
  }

  /**
   * Destroy analytics service
   */
  public destroy(): void {
    if (this.bufferTimer) {
      clearInterval(this.bufferTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();

export default analyticsService;
