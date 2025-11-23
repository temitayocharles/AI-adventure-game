
export enum ViewState {
  LOADING,
  ONBOARDING,
  PARENTAL_GATE,
  WORLD_MAP,
  LEVEL_PLAY,
  CRAFTING,
  PROFILE,
  MODERATION
}

export enum GameMode {
  EXPLORER,
  PUZZLE,
  BUILDER
}

export type Theme = 'light' | 'dark';
export type WeatherType = 'clear' | 'rain' | 'snow' | 'ash';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type HairStyle = 'normal' | 'spiky' | 'bob' | 'punk';
export type Accessory = 'none' | 'glasses' | 'hat' | 'crown' | 'headphones';
export type AvatarModel = 'human' | 'robot' | 'animal';
export type FaceStyle = 'normal' | 'happy' | 'serious';
export type BodyType = 'normal' | 'slim' | 'broad';

export interface AvatarColors {
  skin: string;
  top: string;
  bottom: string;
}

export interface AvatarConfig {
  model: AvatarModel;
  colors: AvatarColors;
  hairStyle: HairStyle;
  accessory: Accessory;
  faceStyle: FaceStyle;
  bodyType: BodyType;
}

export interface GameSettings {
  enableEffects: boolean; // Toggles weather/seasons
  musicVolume: number;
}

export interface UserStats {
  totalPlayTime: number; // minutes
  itemsCollected: number;
  levelsCompleted: number;
  craftingMaterials: {
    wood: number;
    stone: number;
    metal: number;
  };
}

export interface Friend {
  id: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  isOnline: boolean;
}

export interface FriendRequest {
  id: string;
  fromUser: string;
  displayName: string;
  timestamp: number;
}

export interface CraftingRecipe {
  id: string;
  name: string;
  cost: { wood: number; stone: number; metal: number };
  resultItem: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  avatarConfig: AvatarConfig;
  settings: GameSettings;
  stats: UserStats;
  isParent: boolean;
  age: number;
  xp: number;
  currency: number;
  inventory: string[];
  completedLevels: string[];
  unlockedWorlds: string[];
  theme: Theme;
  friends: Friend[];
  friendRequests: FriendRequest[];
  activeQuest?: {
    title: string;
    steps: string[];
    funFact: string;
    worldId: string;
  };
}

export interface WorldData {
  id: string;
  name: string;
  description: string;
  color: string; // Gradient classes
  baseColor: string; // Hex for sky/particles
  weather: WeatherType;
  season: Season;
  icon: string; 
  levels: LevelData[];
  isLocked: boolean;
}

export interface LevelData {
  id: string;
  title: string;
  worldId: string;
  type: GameMode;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Expert';
  objectives: string[];
  rewardXp: number;
  isGenerated?: boolean; // Flag for AI levels
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sprinkle' | 'system';
  text: string;
  timestamp: number;
}
