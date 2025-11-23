/**
 * Game API service - fetches game data from server
 */

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

/**
 * Transform raw API world data to frontend WorldData format
 */
function transformWorldData(rawWorld: any) {
  const meta = rawWorld.meta || {};
  return {
    id: String(rawWorld.id),
    name: rawWorld.name,
    description: meta.description || `Experience ${rawWorld.name}`,
    color: meta.color || 'from-blue-400 to-purple-600',
    baseColor: '#1e293b',
    weather: (meta.weather || 'clear') as any,
    season: 'spring' as const,
    icon: meta.icon || '🌍',
    levels: [], // Will be loaded separately if needed
    isLocked: false
  };
}

export const gameAPI = {
  /**
   * Fetch all worlds from server
   */
  async getWorlds() {
    try {
      console.log('📡 Fetching worlds from:', `${API_BASE}/api/v1/worlds`);
      const res = await fetch(`${API_BASE}/api/v1/worlds`);
      console.log('📦 Response status:', res.status);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      console.log('📥 Raw API data:', data);
      
      // Transform each world to match frontend types
      const transformedWorlds = data.worlds.map(transformWorldData);
      console.log('✨ Transformed worlds:', transformedWorlds);
      return { worlds: transformedWorlds };
    } catch (err) {
      console.error('❌ Failed to fetch worlds:', err);
      return null;
    }
  },

  /**
   * Fetch levels for a specific world
   */
  async getLevels(worldId: string | number) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/worlds/${worldId}/levels`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error(`Failed to fetch levels for world ${worldId}:`, err);
      return null;
    }
  },

  /**
   * Save game state to server
   */
  async saveGameState(userId: string, state: any) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/game-state/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(state)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to save game state:', err);
      return null;
    }
  },

  /**
   * Load game state from server
   */
  async loadGameState(userId: string) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/game-state/load?userId=${userId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to load game state:', err);
      return null;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, profile: any) {
    try {
      const res = await fetch(`${API_BASE}/api/v1/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ userId, ...profile })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to update profile:', err);
      return null;
    }
  }
};
