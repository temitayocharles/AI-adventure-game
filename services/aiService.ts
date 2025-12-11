/**
 * services/aiService.ts
 * Client-side wrapper for AI-powered features
 * 
 * Features:
 * - Dynamic level generation
 * - NPC conversations
 * - Adaptive difficulty calculation
 * 
 * All methods have fallbacks if API fails
 */

import { gameAPI } from './gameAPI';
import {
  FALLBACK_NPC_RESPONSES,
  FALLBACK_DIFFICULTY_MESSAGE,
  generateFallbackLevel,
  selectNPCFallback
} from './aiServiceFallbacks';

interface Platform {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Goal {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Hazard {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'spike' | 'lava' | 'pit';
}

interface GeneratedLevel {
  platforms: Platform[];
  goal: Goal;
  hazards: Hazard[];
  meta: {
    theme: string;
    description?: string;
    difficulty?: string;
  };
  generated: boolean;
  timestamp: string;
}

interface NPCChatResponse {
  npcId: string;
  reply: string;
  emotion: 'happy' | 'thoughtful' | 'excited' | 'concerned';
  suggestions: string[];
  timestamp: string;
}

interface AdaptiveDifficultyResponse {
  difficulty: 'easy' | 'medium' | 'hard';
  recommendation: string;
  adaptiveMetrics: {
    completionTime: number;
    attempts: number;
    playerSkill: number;
    performance: number;
  };
}

export class AIService {
  private apiBase: string;
  private token: string | null = null;

  constructor() {
    this.apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:4000';
  }

  /**
   * Generate a dynamic level based on world and difficulty
   */
  async generateDynamicLevel(worldId: number, difficulty: 'easy' | 'medium' | 'hard' = 'medium', playerSkillLevel: number = 5): Promise<GeneratedLevel> {
    try {
      const token = localStorage.getItem('world_hero_jwt_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.apiBase}/api/v1/ai/generate-level`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          worldId,
          difficulty,
          playerSkillLevel
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate level: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('🎮 Generated level:', data);
      return data;
    } catch (error) {
      console.error('❌ Level generation error - using fallback:', error);
      
      // Use procedural fallback level generation
      const fallbackLevel = generateFallbackLevel(difficulty, worldId);
      
      return {
        level: fallbackLevel,
        generated: false,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Have a conversation with an NPC character
   */
  async chatWithNPC(
    npcId: 'sprinkle' | 'elder' | 'merchant' | 'guardian',
    message: string,
    context?: {
      currentLevel?: number;
      worldId?: number;
      playerStats?: any;
    }
  ): Promise<NPCChatResponse> {
    try {
      const token = localStorage.getItem('world_hero_jwt_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.apiBase}/api/v1/ai/npc-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          npcId,
          message,
          context: context || {}
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to chat with NPC: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`💬 NPC ${npcId} replied:`, data.reply);
      return data;
    } catch (error) {
      console.error('❌ NPC chat error - using fallback:', error);
      
      // Use smart fallback response
      const fallbackKey = selectNPCFallback(message, npcId);
      const fallback = FALLBACK_NPC_RESPONSES[fallbackKey];
      
      return {
        npcId,
        reply: fallback.reply,
        emotion: fallback.emotion as any,
        suggestions: fallback.suggestions,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate adaptive difficulty based on player performance
   */
  async getAdaptiveDifficulty(
    levelId: number,
    completionTime: number,
    attempts: number,
    playerSkill: number = 5
  ): Promise<AdaptiveDifficultyResponse> {
    try {
      const token = localStorage.getItem('world_hero_jwt_token');
      if (!token) throw new Error('Not authenticated');

      const response = await fetch(`${this.apiBase}/api/v1/ai/adaptive-difficulty`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          levelId,
          completionTime,
          attempts,
          playerSkill
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate difficulty: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📊 Adaptive difficulty:', data);
      return data;
    } catch (error) {
      console.error('❌ Difficulty calculation error - using fallback:', error);
      
      // Use fallback heuristic-based difficulty
      const recommendation = FALLBACK_DIFFICULTY_MESSAGE({
        completionTime,
        attempts,
        playerSkill
      });
      
      return {
        difficulty: attempts <= 2 && completionTime < 60 ? 'hard' : attempts > 4 ? 'easy' : 'medium',
        recommendation,
        adaptiveMetrics: {
          completionTime,
          attempts,
          playerSkill,
          performance: Math.max(0, Math.min(1, (120 - completionTime) / 120))
        }
      };
    }
  }

  /**
   * Generate NPC dialogue based on world theme
   */
  generateNPCPersonality(npcType: string): string {
    const personalities: Record<string, string> = {
      'sprinkle': '✨ Sprinkle - Helpful companion',
      'elder': '🧙 Village Elder - Wise guide',
      'merchant': '🏪 Merchant - Trader & hint giver',
      'guardian': '👻 Guardian Spirit - Mystical mentor'
    };
    return personalities[npcType] || personalities['sprinkle'];
  }

  /**
   * Create a prompt for hint generation
   */
  createHintPrompt(levelNumber: number, worldName: string, difficulty: string): string {
    return `
Give a helpful hint for a young gamer (age 6-12) stuck on level ${levelNumber} in the "${worldName}" world.
Difficulty: ${difficulty}

The hint should be encouraging, brief (1-2 sentences), and not give away the solution.
`;
  }

  /**
   * Create a prompt for story/dialogue generation
   */
  createStoryPrompt(worldId: number, characterName: string, context: string): string {
    return `
Write a short, fun dialogue line for "${characterName}" in a platformer game.
Context: ${context}

Keep it under 2 sentences, age-appropriate for 6-12 year olds, and encouraging.
`;
  }
}

// Export singleton instance
export const aiService = new AIService();
