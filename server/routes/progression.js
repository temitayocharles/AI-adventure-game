/**
 * server/routes/progression.js
 * Player progression endpoints (per-player levels, unlocks, completion)
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/players/me/levels?worldId=X
 * Get player's levels for a world (with completion/unlock status)
 * Protected: requires JWT token
 * Response: { levels: { id, name, worldId, completed, unlocked, ... }[] }
 */
router.get('/me/levels', requireAuth, async (req, res, next) => {
  try {
    const playerId = req.user.id;
    const { worldId } = req.query;
    const pool = req.app.locals.pool;
    
    let query = `
      SELECT 
        l.id,
        l.world_id,
        l.name,
        l.order_idx,
        l.difficulty,
        l.reward_xp,
        l.meta,
        COALESCE(pp.completed, false) as completed,
        pp.completed_at,
        COALESCE(pu.id IS NOT NULL, false) as unlocked,
        l.order_idx = 0 as is_first_level
      FROM levels l
      LEFT JOIN player_progress pp ON l.id = pp.level_id AND pp.player_id = $1
      LEFT JOIN player_unlocks pu ON l.id = pu.level_id AND pu.player_id = $1
    `;
    
    const params = [playerId];
    
    if (worldId) {
      query += ` WHERE l.world_id = $2`;
      params.push(worldId);
    }
    
    query += ` ORDER BY l.world_id ASC, l.order_idx ASC`;
    
    const result = await pool.query(query, params);
    
    const levels = result.rows.map(l => ({
      id: String(l.id),
      worldId: String(l.world_id),
      name: l.name,
      order_idx: l.order_idx,
      difficulty: l.difficulty,
      rewardXp: l.reward_xp,
      completed: l.completed,
      completedAt: l.completed_at,
      // First level (order_idx=0) is always unlocked by default, or if it's in player_unlocks
      unlocked: l.is_first_level || l.unlocked,
      meta: l.meta || {}
    }));
    
    return res.json({ levels });
  } catch (err) {
    console.error('❌ Error fetching player levels:', err.message);
    return res.status(500).json({ error: "Failed to fetch levels" });
  }
});

/**
 * POST /api/v1/players/me/levels/:levelId/complete
 * Mark a level as completed for the player
 * Protected: requires JWT token
 * Server-side validation: enforces sequential completion (previous level must be done)
 * Response: { completed: true, unlockedNextLevel: boolean, rewards: { xp: number } }
 */
router.post('/me/levels/:levelId/complete', requireAuth, async (req, res, next) => {
  const client = await req.app.locals.pool.connect();
  
  try {
    const playerId = req.user.id;
    const levelId = parseInt(req.params.levelId, 10);
    
    if (isNaN(levelId)) {
      return res.status(400).json({ error: "Invalid levelId" });
    }
    
    // Start transaction
    await client.query('BEGIN TRANSACTION');
    
    // Lock the level row to prevent race conditions
    const levelResult = await client.query(
      `SELECT id, world_id, order_idx, reward_xp FROM levels WHERE id = $1 FOR UPDATE`,
      [levelId]
    );
    
    if (levelResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Level not found" });
    }
    
    const level = levelResult.rows[0];
    
    // Check if player has already completed this level
    const alreadyCompletedResult = await client.query(
      `SELECT completed FROM player_progress WHERE player_id = $1 AND level_id = $2`,
      [playerId, levelId]
    );
    
    if (alreadyCompletedResult.rows.length > 0 && alreadyCompletedResult.rows[0].completed) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Level already completed" });
    }
    
    // If not first level, check if previous level is completed
    if (level.order_idx > 0) {
      const prevLevelResult = await client.query(
        `SELECT id FROM levels WHERE world_id = $1 AND order_idx = $2 LIMIT 1`,
        [level.world_id, level.order_idx - 1]
      );
      
      if (prevLevelResult.rows.length > 0) {
        const prevLevelId = prevLevelResult.rows[0].id;
        const prevCompletedResult = await client.query(
          `SELECT completed FROM player_progress WHERE player_id = $1 AND level_id = $2`,
          [playerId, prevLevelId]
        );
        
        if (!prevCompletedResult.rows.length || !prevCompletedResult.rows[0].completed) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: "Previous level must be completed first" });
        }
      }
    }
    
    // Insert or update player_progress
    await client.query(
      `INSERT INTO player_progress (player_id, level_id, completed, completed_at)
       VALUES ($1, $2, true, now())
       ON CONFLICT (player_id, level_id) DO UPDATE SET completed = true, completed_at = now()`,
      [playerId, levelId]
    );
    
    // Unlock next level (if exists)
    const nextLevelResult = await client.query(
      `SELECT id FROM levels WHERE world_id = $1 AND order_idx = $2 LIMIT 1`,
      [level.world_id, level.order_idx + 1]
    );
    
    let unlockedNextLevel = false;
    if (nextLevelResult.rows.length > 0) {
      const nextLevelId = nextLevelResult.rows[0].id;
      await client.query(
        `INSERT INTO player_unlocks (player_id, level_id) VALUES ($1, $2)
         ON CONFLICT (player_id, level_id) DO NOTHING`,
        [playerId, nextLevelId]
      );
      unlockedNextLevel = true;
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`✅ Level ${levelId} completed for player ${playerId}`);
    
    return res.json({
      completed: true,
      unlockedNextLevel,
      rewards: {
        xp: level.reward_xp
      }
    });
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('Error rolling back transaction:', rollbackErr.message);
    }
    console.error('❌ Error completing level:', err.message, err.stack);
    return res.status(500).json({ error: "Failed to complete level" });
  } finally {
    client.release();
  }
});

/**
 * GET /api/v1/players/me/progress
 * Get player's completion history
 * Protected: requires JWT token
 * Response: { progress: { levelId, completed, completedAt, worldId }[] }
 */
router.get('/me/progress', requireAuth, async (req, res, next) => {
  try {
    const playerId = req.user.id;
    const pool = req.app.locals.pool;
    
    const result = await pool.query(`
      SELECT 
        pp.level_id,
        pp.completed,
        pp.completed_at,
        l.world_id
      FROM player_progress pp
      LEFT JOIN levels l ON pp.level_id = l.id
      WHERE pp.player_id = $1 AND pp.completed = true
      ORDER BY l.world_id ASC, l.order_idx ASC
    `, [playerId]);
    
    const progress = result.rows.map(p => ({
      levelId: String(p.level_id),
      worldId: String(p.world_id),
      completed: p.completed,
      completedAt: p.completed_at
    }));
    
    return res.json({ progress });
  } catch (err) {
    console.error('❌ Error fetching player progress:', err.message);
    return res.status(500).json({ error: "Failed to fetch progress" });
  }
});

/**
 * POST /api/v1/players/me/worlds/:worldId/unlock
 * Unlock a world for the player
 * Protected: requires JWT token
 * Response: { unlocked: true, unlockedAt: timestamp }
 */
router.post('/me/worlds/:worldId/unlock', requireAuth, async (req, res, next) => {
  try {
    const playerId = req.user.id;
    const { worldId } = req.params;
    const pool = req.app.locals.pool;
    
    // Check world exists
    const worldResult = await pool.query('SELECT id FROM worlds WHERE id = $1', [worldId]);
    if (worldResult.rows.length === 0) {
      return res.status(404).json({ error: "World not found" });
    }
    
    // Insert unlock (idempotent)
    const result = await pool.query(
      `INSERT INTO player_worlds (player_id, world_id, unlocked_at)
       VALUES ($1, $2, now())
       ON CONFLICT (player_id, world_id) DO NOTHING
       RETURNING unlocked_at`,
      [playerId, worldId]
    );
    
    console.log(`✅ World ${worldId} unlocked for player ${playerId}`);
    
    return res.json({
      unlocked: true,
      unlockedAt: result.rows[0]?.unlocked_at || new Date()
    });
  } catch (err) {
    console.error('❌ Error unlocking world:', err.message);
    return res.status(500).json({ error: "Failed to unlock world" });
  }
});

export default router;
