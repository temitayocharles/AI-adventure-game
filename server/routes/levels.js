/**
 * server/routes/levels.js
 * Level endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/worlds/:worldId/levels
 * Get all levels for a world
 * Response: { levels: LevelData[] }
 */
router.get('/world/:worldId', async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const pool = req.app.locals.pool;
    
    const result = await pool.query(`
      SELECT 
        l.id,
        l.world_id,
        l.name,
        l.order_idx,
        l.difficulty,
        l.reward_xp,
        l.meta,
        l.created_at
      FROM levels l
      WHERE l.world_id = $1
      ORDER BY l.order_idx ASC
    `, [worldId]);
    
    const levels = result.rows.map(l => ({
      id: String(l.id),
      worldId: String(l.world_id),
      name: l.name,
      order_idx: l.order_idx,
      difficulty: l.difficulty,
      rewardXp: l.reward_xp,
      meta: l.meta || {}
    }));
    
    return res.json({ levels });
  } catch (err) {
    console.error('❌ Error fetching levels:', err.message);
    return res.status(500).json({ error: "Failed to fetch levels" });
  }
});

/**
 * GET /api/v1/levels/:levelId
 * Get single level by ID
 * Response: { level: LevelData }
 */
router.get('/:levelId', async (req, res, next) => {
  try {
    const { levelId } = req.params;
    const pool = req.app.locals.pool;
    
    const result = await pool.query(`
      SELECT 
        id, 
        world_id, 
        name, 
        order_idx,
        difficulty, 
        reward_xp, 
        meta, 
        created_at 
      FROM levels 
      WHERE id = $1
    `, [levelId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Level not found" });
    }
    
    const l = result.rows[0];
    return res.json({
      level: {
        id: String(l.id),
        worldId: String(l.world_id),
        name: l.name,
        order_idx: l.order_idx,
        difficulty: l.difficulty,
        rewardXp: l.reward_xp,
        meta: l.meta || {}
      }
    });
  } catch (err) {
    console.error('❌ Error fetching level:', err.message);
    return res.status(500).json({ error: "Failed to fetch level" });
  }
});

export default router;
