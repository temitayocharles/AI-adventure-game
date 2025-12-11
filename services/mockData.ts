
import { WorldData, GameMode, UserProfile, CraftingRecipe } from "../types";

export const INITIAL_USER: UserProfile = {
  id: 'u_123',
  displayName: 'RookieHero',
  avatarConfig: {
    model: 'human',
    colors: {
      skin: '#f6dba6', 
      top: '#3b82f6',  
      bottom: '#1e293b' 
    },
    hairStyle: 'normal',
    accessory: 'none',
    faceStyle: 'normal',
    bodyType: 'normal'
  },
  settings: {
    enableEffects: true,
    musicVolume: 0.5
  },
  stats: {
    totalPlayTime: 0,
    itemsCollected: 0,
    levelsCompleted: 0,
    craftingMaterials: { wood: 5, stone: 2, metal: 1 } // Give some starting mats for demo
  },
  isParent: false,
  age: 8,
  xp: 120,
  currency: 50,
  inventory: ['flashlight', 'apple', 'map'],
  completedLevels: [],
  unlockedWorlds: ['1', '2', '3', '4'],
  theme: 'dark',
  friends: [
    {
      id: 'f_1',
      displayName: 'PixelPal',
      isOnline: true,
      avatarConfig: {
        model: 'robot',
        colors: { skin: '#ccc', top: '#ef4444', bottom: '#333' },
        hairStyle: 'normal',
        accessory: 'none',
        faceStyle: 'normal',
        bodyType: 'normal'
      }
    }
  ],
  friendRequests: []
};

export const RECIPES: CraftingRecipe[] = [
  { id: 'r_1', name: 'Wood Torch', cost: { wood: 2, stone: 0, metal: 0 }, resultItem: 'flashlight' },
  { id: 'r_2', name: 'Stone Key', cost: { wood: 0, stone: 3, metal: 0 }, resultItem: 'key' },
  { id: 'r_3', name: 'Metal Map', cost: { wood: 1, stone: 0, metal: 2 }, resultItem: 'map' }
];

export const EMOJI_PACK = ['😀', '😎', '🥳', '🤔', '👍', '❤️', '🌳', '🏠', '🚀', '🐱'];

// Helper to generate levels procedurally to ensure we go beyond level 16
const generateLevels = (worldId: string, worldName: string, count: number, startDiff: number): any[] => {
  const levels = [];
  const difficulties = ['Easy', 'Medium', 'Hard', 'Expert'];
  const modes = [GameMode.EXPLORER, GameMode.BUILDER, GameMode.PUZZLE];

  for (let i = 1; i <= count; i++) {
    const diffIndex = Math.min(Math.floor((i + startDiff) / 3), 3);
    const mode = modes[i % 3];
    
    levels.push({
      id: `${worldId}_l_${i}`,
      worldId: worldId,
      title: `${worldName} ${i}`,
      type: mode,
      difficulty: difficulties[diffIndex],
      objectives: [
        `Explore sector ${i}`,
        i % 2 === 0 ? 'Find the hidden Gem' : 'Collect all Bananas',
        i > 3 ? 'Avoid the obstacles' : 'Learn the path'
      ],
      rewardXp: 50 + (i * 25),
      isGenerated: i > 4 
    });
  }
  return levels;
};

export const WORLDS: WorldData[] = [
  {
    id: 'w_1',
    name: 'Rainforest Realm',
    description: 'Save the trees and meet the animals!',
    color: 'from-green-400 to-emerald-600',
    baseColor: '#10b981',
    weather: 'rain',
    season: 'summer',
    icon: '🌳',
    isLocked: false,
    levels: generateLevels('w_1', 'Jungle Trek', 6, 0)
  },
  {
    id: 'w_2',
    name: 'Volcano Valley',
    description: 'The floor is lava! Watch out for ash.',
    color: 'from-orange-400 to-red-600',
    baseColor: '#ef4444',
    weather: 'ash',
    season: 'autumn',
    icon: '🌋',
    isLocked: true,
    levels: generateLevels('w_2', 'Lava Run', 6, 1)
  },
  {
    id: 'w_3',
    name: 'Arctic Archives',
    description: 'Slippery ice and ancient secrets.',
    color: 'from-cyan-400 to-blue-600',
    baseColor: '#3b82f6',
    weather: 'snow',
    season: 'winter',
    icon: '❄️',
    isLocked: true,
    levels: generateLevels('w_3', 'Ice Path', 6, 2)
  },
  {
    id: 'w_4',
    name: 'Desert Dunes',
    description: 'Hot sands and hidden tombs.',
    color: 'from-yellow-400 to-orange-500',
    baseColor: '#f59e0b',
    weather: 'clear',
    season: 'summer',
    icon: '🌵',
    isLocked: true,
    levels: generateLevels('w_4', 'Sand Storm', 6, 2)
  },
  {
    id: 'w_5',
    name: 'Cyber City',
    description: 'The future is neon. Logic puzzles await.',
    color: 'from-purple-500 to-pink-600',
    baseColor: '#8b5cf6',
    weather: 'clear',
    season: 'spring', 
    icon: '🏙️',
    isLocked: true,
    levels: generateLevels('w_5', 'Neon Grid', 6, 3)
  }
];
