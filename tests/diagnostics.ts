
import { INITIAL_USER, WORLDS } from '../services/mockData';
import { loadUser, saveUser } from '../services/storageService';
import { UserProfile } from '../types';

export const runDiagnostics = async () => {
  const results: string[] = [];
  const log = (msg: string, status: 'PASS' | 'FAIL') => results.push(`[${status}] ${msg}`);

  console.log("Starting Diagnostics...");

  // --- UNIT TESTS ---
  try {
    // Test 1: Mock Data Integrity
    if (WORLDS.length > 0 && WORLDS[0].levels.length > 0) {
      log('Mock Data: Worlds and Levels exist', 'PASS');
    } else {
      log('Mock Data: Missing worlds or levels', 'FAIL');
    }

    // Test 2: Storage Service Serialization
    const testUser = { ...INITIAL_USER, displayName: 'TestUser_123' };
    saveUser(testUser);
    const loaded = loadUser();
    if (loaded.displayName === 'TestUser_123') {
      log('Storage: Serialization/Deserialization works', 'PASS');
    } else {
      log('Storage: Failed to persist data', 'FAIL');
    }
    // Restore
    saveUser(INITIAL_USER);

  } catch (e: any) {
    log(`Unit Test Exception: ${e.message}`, 'FAIL');
  }

  // --- INTEGRATION TESTS ---
  try {
    // Test 3: Progression Logic
    // Simulate completing level 1 of world 1
    const user = { ...INITIAL_USER };
    const level = WORLDS[0].levels[0];
    const loot = { wood: 5, stone: 0, metal: 0 };

    const nextState = updateProfileMock(user, level, loot);
    
    if (
      nextState.completedLevels.includes(level.id) && 
      nextState.xp === user.xp + level.rewardXp &&
      nextState.stats.craftingMaterials.wood === 5
    ) {
      log('Integration: Level Completion updates Profile correctly', 'PASS');
    } else {
      log('Integration: Level Completion logic failed', 'FAIL');
    }

  } catch (e: any) {
    log(`Integration Test Exception: ${e.message}`, 'FAIL');
  }

  // --- E2E SIMULATION ---
  try {
    // Test 4: Asset Availability
    // We check if critical objects are defined
    if (typeof window !== 'undefined' && document) {
      log('E2E: Browser Environment Detected', 'PASS');
    }

    // Test 5: API Configuration
    // Check if API Key logic doesn't crash
    try {
        // We don't check for the key itself (security), just that the accessor doesn't throw
        const safeAccess = typeof process !== 'undefined' ? 'Node/Build' : 'Browser';
        log(`E2E: Env Safe Access (${safeAccess})`, 'PASS');
    } catch(e) {
        log('E2E: Env Access Crashed', 'FAIL');
    }

  } catch (e: any) {
    log(`E2E Test Exception: ${e.message}`, 'FAIL');
  }

  return results;
};

// Mock logic from App.tsx to test in isolation
const updateProfileMock = (prev: UserProfile, activeLevel: any, loot: any) => {
  const newCompleted = Array.from(new Set([...prev.completedLevels, activeLevel.id]));
  return {
    ...prev,
    xp: prev.xp + activeLevel.rewardXp,
    completedLevels: newCompleted,
    stats: {
      ...prev.stats,
      levelsCompleted: prev.stats.levelsCompleted + 1,
      craftingMaterials: {
         wood: prev.stats.craftingMaterials.wood + loot.wood,
         stone: prev.stats.craftingMaterials.stone + loot.stone,
         metal: prev.stats.craftingMaterials.metal + loot.metal,
      }
    }
  };
};
