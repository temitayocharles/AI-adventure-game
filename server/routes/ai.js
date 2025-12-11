/**
 * server/routes/ai.js
 * AI-powered dynamic content generation via Gemini API
 * 
 * Endpoints:
 * - POST /api/v1/ai/generate-level - Dynamic level generation
 * - POST /api/v1/ai/npc-chat - NPC conversations
 * - POST /api/v1/ai/adaptive-difficulty - Adjust level difficulty
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { GoogleGenAI } from '@google/genai';

const router = Router();
const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * POST /api/v1/ai/generate-level
 * Generate a unique level based on world theme and difficulty
 * Protected: requires JWT token
 * 
 * Request: { worldId, difficulty, playerSkillLevel }
 * Response: { level: { platforms, goal, hazards, meta } }
 */
router.post('/generate-level', requireAuth, async (req, res) => {
  try {
    const { worldId, difficulty = 'medium', playerSkillLevel = 5 } = req.body || {};
    const playerId = req.user.id;

    if (!worldId) {
      return res.status(400).json({ error: 'worldId is required' });
    }

    // Get world info
    const pool = req.app.locals.pool;
    const worldResult = await pool.query('SELECT name, meta FROM worlds WHERE id = $1', [worldId]);
    
    if (worldResult.rows.length === 0) {
      return res.status(404).json({ error: 'World not found' });
    }

    const worldName = worldResult.rows[0].name;
    const worldMeta = worldResult.rows[0].meta || {};

    // Generate level with Gemini
    const prompt = `
You are a game level designer. Generate a platformer level in JSON format.

World: ${worldName}
Difficulty: ${difficulty} (easy/medium/hard)
Player Skill: ${playerSkillLevel}/10

Generate JSON with this exact structure:
{
  "platforms": [{"x": number, "y": number, "w": number, "h": number}],
  "goal": {"x": number, "y": number, "w": 50, "h": 50},
  "hazards": [{"x": number, "y": number, "w": number, "h": number, "type": "spike|lava|pit"}],
  "meta": {"theme": string, "description": string}
}

Constraints:
- Canvas is 800x600
- Player starts at (50, 50)
- ${difficulty === 'easy' ? '3-4 platforms, goal at y=100' : difficulty === 'hard' ? '8+ platforms, goal at y=50' : '5-6 platforms, goal at y=75'}
- Hazards should match world (${worldName})
- Make it fun and fair

Respond with ONLY valid JSON.`;

    const response = await client.models.generateContent({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let levelData = null;
    if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      const text = response.candidates[0].content.parts[0].text;
      levelData = JSON.parse(text);
    }

    if (!levelData || !levelData.platforms) {
      throw new Error('Invalid level generation response');
    }

    console.log(`✅ Generated level for player ${playerId} in world ${worldId}`);

    return res.json({
      level: {
        platforms: levelData.platforms,
        goal: levelData.goal,
        hazards: levelData.hazards || [],
        meta: levelData.meta || { theme: worldName, difficulty }
      },
      generated: true,
      timestamp: new Date()
    });
  } catch (err) {
    console.error('❌ Error generating level:', err.message);
    return res.status(500).json({ error: 'Failed to generate level' });
  }
});

/**
 * POST /api/v1/ai/npc-chat
 * Have a conversation with an NPC
 * Protected: requires JWT token
 * 
 * Request: { npcId, message, context }
 * Response: { reply: string, emotion: string, suggestions: string[] }
 */
router.post('/npc-chat', requireAuth, async (req, res) => {
  try {
    const { npcId, message, context = {} } = req.body || {};
    const playerId = req.user.id;

    if (!npcId || !message) {
      return res.status(400).json({ error: 'npcId and message are required' });
    }

    // Get NPC personality
    const npcPersonality = {
      'sprinkle': 'You are Sprinkle, a helpful and encouraging AI companion. Be kind, brief (1-3 sentences), and age-appropriate for children 6-12.',
      'elder': 'You are a wise village elder. Speak with experience and offer guidance about levels and worlds.',
      'merchant': 'You are a friendly merchant. Help players with trading and hints about hidden items.',
      'guardian': 'You are a guardian spirit. Offer cryptic wisdom and encouragement.'
    };

    const personality = npcPersonality[npcId] || npcPersonality['sprinkle'];

    const prompt = `${personality}

Player message: "${message}"
Context: ${JSON.stringify(context)}

Respond in JSON:
{
  "reply": "Your response (1-3 sentences)",
  "emotion": "happy|thoughtful|excited|concerned",
  "suggestions": ["option1", "option2"]
}

Be supportive and fun. Respond with ONLY valid JSON.`;

    const response = await client.models.generateContent({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });

    let chatData = null;
    if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      const text = response.candidates[0].content.parts[0].text;
      chatData = JSON.parse(text);
    }

    if (!chatData || !chatData.reply) {
      throw new Error('Invalid chat response');
    }

    console.log(`💬 NPC ${npcId} chatted with player ${playerId}`);

    return res.json({
      npcId,
      reply: chatData.reply,
      emotion: chatData.emotion || 'happy',
      suggestions: chatData.suggestions || [],
      timestamp: new Date()
    });
  } catch (err) {
    console.error('❌ Error in NPC chat:', err.message);
    
    // Provide sensible fallback
    const fallbackResponses = {
      'sprinkle': {
        reply: 'I\'m having a bit of trouble thinking right now, but you\'re doing great! Keep going!',
        emotion: 'happy',
        suggestions: ['Tell me more', 'I need a hint', 'Can you help?']
      },
      'elder': {
        reply: 'My wisdom is elusive at the moment, but trust in yourself, young hero.',
        emotion: 'thoughtful',
        suggestions: ['What should I do?', 'Any advice?', 'Tell me more']
      },
      'merchant': {
        reply: 'My wares are in disarray! But feel free to explore on your own.',
        emotion: 'concerned',
        suggestions: ['What do you have?', 'Anything to trade?', 'Never mind']
      },
      'guardian': {
        reply: 'The veil between us grows thick, but your journey continues.',
        emotion: 'thoughtful',
        suggestions: ['Guide me', 'What\'s ahead?', 'I\'m ready']
      }
    };
    
    const npcId = req.body?.npcId || 'sprinkle';
    const fallback = fallbackResponses[npcId] || fallbackResponses['sprinkle'];
    
    return res.json({
      npcId,
      reply: fallback.reply,
      emotion: fallback.emotion,
      suggestions: fallback.suggestions,
      timestamp: new Date(),
      fallback: true
    });
  }
});

/**
 * POST /api/v1/ai/adaptive-difficulty
 * Adjust level difficulty based on player performance
 * Protected: requires JWT token
 * 
 * Request: { levelId, completionTime, attempts, playerSkill }
 * Response: { difficulty: string, recommendation: string }
 */
router.post('/adaptive-difficulty', requireAuth, async (req, res) => {
  try {
    const { levelId, completionTime, attempts, playerSkill = 5 } = req.body || {};

    if (!levelId || completionTime === undefined || attempts === undefined) {
      return res.status(400).json({ error: 'levelId, completionTime, and attempts are required' });
    }

    // Simple algorithm: adjust based on performance
    let difficulty = 'medium';
    let recommendation = '';

    // If completed quickly with few attempts, increase difficulty
    if (completionTime < 30 && attempts <= 2) {
      difficulty = 'hard';
      recommendation = 'You completed that quickly! Try the next level for a bigger challenge.';
    }
    // If took moderate time, stay at current
    else if (completionTime < 120 && attempts <= 3) {
      difficulty = 'medium';
      recommendation = 'Great job! You\'re improving. Ready for the next level?';
    }
    // If took long or many attempts, reduce difficulty
    else {
      difficulty = 'easy';
      recommendation = 'That was tough! Take some time to practice, then try the next level.';
    }

    // Use AI to personalize recommendation
    const prompt = `Generate an encouraging message for a ${playerSkill}/10 skill player who:
- Completed a level in ${completionTime} seconds
- Took ${attempts} attempts
- Current difficulty: ${difficulty}

Keep it to 1 sentence, age-appropriate for 6-12 year olds, and uplifting.`;

    const response = await client.models.generateContent({
      model: process.env.AI_MODEL || 'gemini-2.5-flash',
      contents: prompt
    });

    let personalMessage = recommendation;
    if (response.candidates && response.candidates[0]?.content?.parts?.[0]?.text) {
      personalMessage = response.candidates[0].content.parts[0].text;
    }

    return res.json({
      difficulty,
      recommendation: personalMessage,
      adaptiveMetrics: {
        completionTime,
        attempts,
        playerSkill,
        performance: (120 - completionTime) / 120 // 0-1 score
      }
    });
  } catch (err) {
    console.error('❌ Error in adaptive difficulty - using fallback:', err.message);
    
    // Fallback heuristic-based difficulty
    const { completionTime = 120, attempts = 3, playerSkill = 5 } = req.body || {};
    
    let difficulty = 'medium';
    let recommendation = 'Great job! Keep improving!';

    if (completionTime < 30 && attempts <= 2) {
      difficulty = 'hard';
      recommendation = 'Wow! You\'re a natural! Ready for a real challenge?';
    } else if (completionTime < 120 && attempts <= 3) {
      difficulty = 'medium';
      recommendation = 'Nice work! You\'re getting better every time!';
    } else if (attempts > 5) {
      difficulty = 'easy';
      recommendation = 'Don\'t give up! You\'re learning with every try!';
    }

    return res.json({
      difficulty,
      recommendation,
      adaptiveMetrics: {
        completionTime,
        attempts,
        playerSkill,
        performance: Math.max(0, Math.min(1, (120 - completionTime) / 120))
      },
      fallback: true
    });
  }
});

export default router;
