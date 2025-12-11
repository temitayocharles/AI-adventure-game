/**
 * Game API service - JWT-based player progression API
 * Handles authentication, world/level loading, and progression tracking
 */

// Use relative URL if on HTTPS to avoid mixed content errors
const API_BASE = window.location.protocol === 'https:' 
  ? '/api/v1'
  : ((import.meta as any)?.env?.VITE_API_BASE?.replace(/\/+$/, '') || 'http://localhost:4000') + '/api/v1';

const TOKEN_KEY = 'world_hero_jwt_token';
const PLAYER_ID_KEY = 'world_hero_player_id';
const USERNAME_KEY = 'world_hero_username';

console.log("🔧 gameAPI using API_BASE:", API_BASE);

/**
 * Get stored JWT token from localStorage
 */
function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/**
 * Store JWT token in localStorage
 */
function setToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    console.error('❌ Failed to store token:', err);
  }
}

/**
 * Clear stored credentials
 */
function clearCredentials(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(USERNAME_KEY);
  } catch {
    // Ignore
  }
}

/**
 * Get Authorization header with Bearer token
 */
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

/**
 * Normalize world data from server → client format
 */
function transformWorldData(rawWorld: any) {
  const meta = rawWorld.meta || {};

  return {
    id: String(rawWorld.id),
    name: rawWorld.name,
    slug: rawWorld.slug,
    description: rawWorld.description || `Experience ${rawWorld.name}`,
    color: meta.color || 'from-blue-400 to-purple-600',
    baseColor: '#1e293b',
    weather: meta.weather || 'clear',
    season: 'spring',
    icon: rawWorld.icon || '🌍',
    levels: [] // Loaded separately
  };
}

/**
 * Normalize level data
 */
function transformLevelData(rawLevel: any) {
  return {
    id: String(rawLevel.id),
    worldId: String(rawLevel.world_id || rawLevel.worldId),
    name: rawLevel.name,
    difficulty: rawLevel.difficulty,
    rewardXp: rawLevel.reward_xp || rawLevel.rewardXp || 100,
    completed: rawLevel.completed || false,
    unlocked: rawLevel.unlocked !== false,
    meta: rawLevel.meta || {}
  };
}

export const gameAPI = {
  /**
   * Demo login - get JWT token with username
   * POST /api/v1/auth/demo-login
   */
  async loginDemo(username: string) {
    const url = `${API_BASE}/auth/demo-login`;
    console.log('🔐 Demo login:', username);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });

      if (!res.ok) {
        console.error('❌ Login failed:', res.status, res.statusText);
        return null;
      }

      const data = await res.json();
      console.log('✅ Login successful, token issued');

      // Store credentials
      setToken(data.token);
      try {
        localStorage.setItem(PLAYER_ID_KEY, String(data.playerId));
        localStorage.setItem(USERNAME_KEY, data.username);
      } catch {
        // Ignore
      }

      return {
        token: data.token,
        playerId: data.playerId,
        username: data.username
      };
    } catch (err: any) {
      console.error('❌ Demo login error:', err.message || err);
      return null;
    }
  },

  /**
   * Logout - clear stored token
   */
  logout(): void {
    console.log('🚪 Logout');
    clearCredentials();
  },

  /**
   * Get current player from stored token
   */
  getCurrentPlayer() {
    try {
      const playerId = localStorage.getItem(PLAYER_ID_KEY);
      const username = localStorage.getItem(USERNAME_KEY);
      const token = getToken();

      if (!playerId || !username || !token) {
        return null;
      }

      return {
        playerId: parseInt(playerId, 10),
        username,
        token
      };
    } catch {
      return null;
    }
  },

  /**
   * Fetch all worlds
   * GET /api/v1/worlds
   */
  async getWorlds() {
    const url = `${API_BASE}/worlds`;
    console.log('📡 Fetching worlds from:', url);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('📦 Response status:', res.status);

      if (!res.ok) {
        console.error('❌ Server returned error:', res.status, res.statusText);
        return { worlds: [] };
      }

      const data = await res.json();
      console.log('📥 Raw API data:', data);

      const transformed = (data.worlds || []).map(transformWorldData);
      console.log('✨ Transformed worlds:', transformed);

      return { worlds: transformed };
    } catch (err: any) {
      console.error('❌ Failed to fetch worlds:', err.message || err);
      return { worlds: [] };
    }
  },

  /**
   * Fetch levels for a world (with per-player completion status)
   * GET /api/v1/players/me/levels?worldId=X
   * Protected: requires JWT token
   */
  async getPlayerLevels(worldId?: string | number) {
    const url = worldId
      ? `${API_BASE}/players/me/levels?worldId=${worldId}`
      : `${API_BASE}/players/me/levels`;    console.log(`📡 Fetching player levels: ${url}`);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        console.error(`❌ Failed to fetch levels (${res.status}):`, res.statusText);
        return { levels: [] };
      }

      const data = await res.json();
      const levels = (data.levels || []).map(transformLevelData);
      console.log('✅ Player levels loaded:', levels);

      return { levels };
    } catch (err: any) {
      console.error(`❌ Failed to fetch player levels:`, err.message || err);
      return { levels: [] };
    }
  },

  /**
   * Mark a level as completed
   * POST /api/v1/players/me/levels/:levelId/complete
   * Protected: requires JWT token
   */
  async completeLevel(levelId: string | number) {
    const url = `${API_BASE}/players/me/levels/${levelId}/complete`;
    console.log(`✅ Completing level:`, url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });

      if (!res.ok) {
        console.error(`❌ Failed to complete level (${res.status}):`, res.statusText);
        const error = await res.json();
        return { completed: false, error: error.error };
      }

      const data = await res.json();
      console.log('✅ Level completed:', data);

      return {
        completed: true,
        unlockedNextLevel: data.unlockedNextLevel,
        rewards: data.rewards
      };
    } catch (err: any) {
      console.error('❌ Failed to complete level:', err.message || err);
      return { completed: false, error: 'Network error' };
    }
  },

  /**
   * Get player's completion history
   * GET /api/v1/players/me/progress
   * Protected: requires JWT token
   */
  async getPlayerProgress() {
    const url = `${API_BASE}/players/me/progress`;
    console.log('📋 Fetching player progress:', url);

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        console.error(`❌ Failed to fetch progress (${res.status})`);
        return { progress: [] };
      }

      const data = await res.json();
      console.log('✅ Player progress loaded:', data.progress);

      return { progress: data.progress || [] };
    } catch (err: any) {
      console.error('❌ Failed to fetch progress:', err.message || err);
      return { progress: [] };
    }
  },

  /**
   * Unlock a world for the player
   * POST /api/v1/players/me/worlds/:worldId/unlock
   * Protected: requires JWT token
   */
  async unlockWorld(worldId: string | number) {
    const url = `${API_BASE}/api/v1/players/me/worlds/${worldId}/unlock`;
    console.log('🔓 Unlocking world:', url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({})
      });

      if (!res.ok) {
        console.error(`❌ Failed to unlock world (${res.status})`);
        return { unlocked: false };
      }

      const data = await res.json();
      console.log('✅ World unlocked:', data);

      return { unlocked: true, unlockedAt: data.unlockedAt };
    } catch (err: any) {
      console.error('❌ Failed to unlock world:', err.message || err);
      return { unlocked: false };
    }
  },

  /**
   * Save game state (legacy, for backward compatibility)
   */
  async saveGameState(userId: string, state: any) {
    const url = `${API_BASE}/game-state/save`;
    console.log('💾 Saving game state to:', url);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userId, state })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('❌ Failed to save game state:', err);
      return null;
    }
  },

  /**
   * Load game state (legacy, for backward compatibility)
   */
  async loadGameState(userId: string) {
    const url = `${API_BASE}/game-state/load?userId=${userId}`;
    console.log('📡 Loading game state from:', url);

    try {
      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('❌ Failed to load game state:', err);
      return null;
    }
  }
};

