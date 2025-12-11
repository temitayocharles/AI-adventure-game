/**
 * services/aiServiceFallbacks.ts
 * Fallback responses when AI service is unavailable
 * 
 * These provide sensible defaults so the game remains playable
 * even if Gemini API fails or is rate-limited
 */

// Fallback quest templates for each world
export const FALLBACK_QUESTS: Record<string, { title: string; steps: string[]; funFact: string }> = {
  'w_1': {
    title: 'Earthquake Escape',
    steps: [
      'Navigate through shifting ground',
      'Avoid collapsing platforms',
      'Reach the safe zone'
    ],
    funFact: 'Did you know? Earthquakes happen when tectonic plates shift beneath the Earth\'s surface!'
  },
  'w_2': {
    title: 'Tsunami Tower',
    steps: [
      'Climb the emergency tower',
      'Reach higher as water rises',
      'Stay ahead of the waves'
    ],
    funFact: 'Did you know? Tsunamis can travel at speeds up to 500 mph in the ocean!'
  },
  'w_3': {
    title: 'Volcano Valley',
    steps: [
      'Cross the lava fields carefully',
      'Navigate around volcanic vents',
      'Escape the ash clouds'
    ],
    funFact: 'Did you know? Lava can reach temperatures of 2,200°F (1,200°C)!'
  },
  'w_4': {
    title: 'Desert Dunes',
    steps: [
      'Navigate shifting sand dunes',
      'Find sources of water',
      'Reach the oasis'
    ],
    funFact: 'Did you know? Some deserts can reach over 120°F (49°C) during the day!'
  },
  'dynamic': {
    title: 'Epic Adventure',
    steps: [
      'Explore unknown challenges',
      'Use your skills to overcome obstacles',
      'Reach the final goal'
    ],
    funFact: 'Every adventure is unique - you\'re making it special!'
  }
};

// Fallback NPC responses for different prompt types
export const FALLBACK_NPC_RESPONSES: Record<string, { reply: string; emotion: string; suggestions: string[] }> = {
  'help_stuck': {
    reply: 'Try moving left and right to find the best path. Don\'t be afraid to jump!',
    emotion: 'thoughtful',
    suggestions: ['Another hint', 'Tell me how to jump', 'What else can I do?']
  },
  'hint_level': {
    reply: 'Look for the goal (the gold square). The path there is trickier than it looks!',
    emotion: 'excited',
    suggestions: ['More hints', 'I need help jumping', 'How do I get over there?']
  },
  'encouragement': {
    reply: 'You\'re doing great! Keep trying - every attempt makes you stronger!',
    emotion: 'happy',
    suggestions: ['Tell me a joke', 'How do I win?', 'What\'s next?']
  },
  'world_info': {
    reply: 'This world is full of challenges and surprises. Good luck, hero!',
    emotion: 'happy',
    suggestions: ['Tell me more', 'How do I start?', 'Any tips?']
  },
  'default': {
    reply: 'I\'m here to help! What would you like to know?',
    emotion: 'happy',
    suggestions: ['Give me a hint', 'Encourage me', 'Tell me about this world']
  }
};

// Fallback adaptive difficulty recommendations
export const FALLBACK_DIFFICULTY_MESSAGE = (stats: {
  completionTime: number;
  attempts: number;
  playerSkill: number;
}): string => {
  const { completionTime, attempts, playerSkill } = stats;

  // Simple algorithm: speed and attempt count
  if (completionTime < 30 && attempts <= 2) {
    return 'Amazing! You completed that super fast. You\'re ready for a bigger challenge!';
  } else if (completionTime < 60 && attempts <= 3) {
    return 'Nice work! You\'re getting better. Ready for the next level?';
  } else if (completionTime < 120 && attempts <= 4) {
    return 'Good effort! Keep practicing - each level makes you stronger!';
  } else if (attempts > 5) {
    return 'Don\'t give up! Some levels take time to master. You\'re doing your best!';
  } else {
    return 'You made it! That was a solid effort. Next level?';
  }
};

// Fallback chat responses for Sprinkle
export const FALLBACK_CHAT_RESPONSES = {
  greeting: 'Hi there! I\'m Sprinkle. What can I help you with?',
  help: 'Try using the arrow keys or WASD to move, and Space or W to jump!',
  stuck: 'Don\'t worry! Every level has a solution. Keep trying - you\'ll figure it out!',
  celebrate: 'You did it! You\'re awesome! 🎉',
  confused: 'Hmm, I\'m not sure I understood that. Can you say it differently?',
  default: 'That sounds interesting! Tell me more!'
};

// Fallback procedurally-generated level structure
export const generateFallbackLevel = (
  difficulty: 'easy' | 'medium' | 'hard',
  seed: number
): {
  platforms: Array<{ x: number; y: number; w: number; h: number }>;
  goal: { x: number; y: number; w: number; h: number };
  hazards: Array<{ x: number; y: number; w: number; h: number; type: string }>;
  meta: { theme: string; difficulty: string };
} => {
  // Use seed for deterministic generation
  const rng = (s: number) => Math.sin(s) * 10000 - Math.floor(Math.sin(s) * 10000);

  const platforms: Array<{ x: number; y: number; w: number; h: number }> = [
    // Ground
    { x: 0, y: 520, w: 800, h: 80 }
  ];

  let currentX = 100;
  let currentY = 450;
  const platformCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;

  for (let i = 0; i < platformCount; i++) {
    const platformHeight = 20;
    const platformWidth = 80 + (rng(seed + i) % 60);
    const gapSize = 60 + (rng(seed + i + 100) % 40);

    currentX += gapSize;
    currentY -= 40 + (rng(seed + i + 200) % 30);

    // Keep within bounds
    if (currentX > 700) currentX = 700;
    if (currentY < 100) currentY = 100;

    platforms.push({
      x: currentX,
      y: currentY,
      w: platformWidth,
      h: platformHeight
    });
  }

  // Goal at the end
  const goal = {
    x: currentX + 50,
    y: Math.max(currentY - 100, 50),
    w: 50,
    h: 50
  };

  // Add hazards for harder levels
  const hazards: Array<{ x: number; y: number; w: number; h: number; type: string }> = [];
  if (difficulty === 'hard') {
    hazards.push(
      { x: 150, y: 480, w: 40, h: 20, type: 'spike' },
      { x: 350, y: 400, w: 40, h: 20, type: 'spike' },
      { x: 550, y: 350, w: 40, h: 20, type: 'spike' }
    );
  }

  return {
    platforms,
    goal,
    hazards,
    meta: {
      theme: 'Fallback Level',
      difficulty
    }
  };
};

/**
 * Detect which fallback to use based on context
 */
export const selectNPCFallback = (message: string, npcType: string): string => {
  const lower = message.toLowerCase();

  // Detect message intent
  if (lower.includes('stuck') || lower.includes('help') || lower.includes('can\'t')) {
    return 'help_stuck';
  } else if (lower.includes('hint') || lower.includes('how')) {
    return 'hint_level';
  } else if (lower.includes('good') || lower.includes('awesome') || lower.includes('great')) {
    return 'encouragement';
  } else if (lower.includes('world') || lower.includes('about') || lower.includes('this')) {
    return 'world_info';
  }

  return 'default';
};

/**
 * Simple chat response matcher
 */
export const matchChatFallback = (message: string): string => {
  const lower = message.toLowerCase();

  if (lower.match(/hello|hi|hey/)) {
    return FALLBACK_CHAT_RESPONSES.greeting;
  } else if (lower.match(/help|how|controls|move|jump/)) {
    return FALLBACK_CHAT_RESPONSES.help;
  } else if (lower.match(/stuck|can't|impossible|hard/)) {
    return FALLBACK_CHAT_RESPONSES.stuck;
  } else if (lower.match(/done|finished|completed|won|yes/)) {
    return FALLBACK_CHAT_RESPONSES.celebrate;
  } else if (lower.match(/what|huh|confused|don't understand/)) {
    return FALLBACK_CHAT_RESPONSES.confused;
  }

  return FALLBACK_CHAT_RESPONSES.default;
};
