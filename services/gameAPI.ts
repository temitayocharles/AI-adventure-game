/**
 * Game API service - fetches game data from server
 */

const API_BASE = (import.meta as any).env.VITE_API_BASE || 'http://localhost:4000';

export const gameAPI = {
  /**
   * Fetch all worlds from server
   */
  async getWorlds() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/worlds`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('Failed to fetch worlds:', err);
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
