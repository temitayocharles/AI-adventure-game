/**
 * server/routes/worlds.js
 * World endpoints
 */

import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/v1/worlds
 * Get all worlds
 * Response: { worlds: WorldData[] }
 */
router.get('/', async (req, res, next) => {
  try {
    const pool = req.app.locals.pool;
    
    const result = await pool.query(`
      SELECT 
        id, 
        name, 
        slug, 
        description, 
        icon, 
        meta,
        created_at
      FROM worlds
      ORDER BY id ASC
    `);
    
    const worlds = result.rows.map(w => ({
      id: String(w.id),
      name: w.name,
      slug: w.slug,
      description: w.description,
      icon: w.icon,
      color: w.meta?.color || 'from-blue-400 to-purple-600',
      levels: [] // Levels loaded separately
    }));
    
    return res.json({ worlds });
  } catch (err) {
    console.error('❌ Error fetching worlds:', err.message);
    return res.status(500).json({ error: "Failed to fetch worlds" });
  }
});

/**
 * GET /api/v1/worlds/:worldId
 * Get single world by ID
 * Response: { world: WorldData }
 */
router.get('/:worldId', async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const pool = req.app.locals.pool;
    
    const result = await pool.query(
      `SELECT id, name, slug, description, icon, meta, created_at FROM worlds WHERE id = $1`,
      [worldId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "World not found" });
    }
    
    const w = result.rows[0];
    return res.json({
      world: {
        id: String(w.id),
        name: w.name,
        slug: w.slug,
        description: w.description,
        icon: w.icon,
        color: w.meta?.color || 'from-blue-400 to-purple-600'
      }
    });
  } catch (err) {
    console.error('❌ Error fetching world:', err.message);
    return res.status(500).json({ error: "Failed to fetch world" });
  }
});

/**
 * POST /api/v1/worlds/:worldId/unlock
 * Unlock a world for the authenticated player
 * Protected: requires JWT token
 * Response: { unlocked: boolean, unlockedAt: timestamp }
 */
router.post('/:worldId/unlock', requireAuth, async (req, res, next) => {
  try {
    const { worldId } = req.params;
    const playerId = req.user.id;
    const pool = req.app.locals.pool;
    
    // Check world exists
    const worldResult = await pool.query('SELECT id FROM worlds WHERE id = $1', [worldId]);
    if (worldResult.rows.length === 0) {
      return res.status(404).json({ error: "World not found" });
    }
    
    // Insert unlock (idempotent - UNIQUE constraint)
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
