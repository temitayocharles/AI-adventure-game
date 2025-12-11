/**
 * server/routes/auth.js
 * Authentication endpoints (demo login, token generation)
 */

import { Router } from 'express';
import { generateJWT } from '../middleware/auth.js';

const router = Router();

/**
 * POST /api/v1/auth/demo-login
 * Demo login endpoint - issues JWT token for testing
 * 
 * Body: { username: string }
 * Response: { token: string, playerId: number, username: string }
 */
router.post('/demo-login', async (req, res) => {
  try {
    const { username } = req.body || {};
    
    if (!username || username.trim().length === 0) {
      return res.status(400).json({ error: "username is required" });
    }
    
    const pool = req.app.locals.pool;
    
    // Look up or create player in database
    const existingResult = await pool.query(
      'SELECT id FROM players WHERE username = $1',
      [username]
    );
    
    let playerId;
    
    if (existingResult.rows.length > 0) {
      playerId = existingResult.rows[0].id;
    } else {
      // Create new player
      const createResult = await pool.query(
        'INSERT INTO players (username, created_at) VALUES ($1, now()) RETURNING id',
        [username]
      );
      playerId = createResult.rows[0].id;
    }
    
    const token = generateJWT(playerId, username);
    
    console.log(`✅ Demo login issued for user: ${username} (playerId: ${playerId})`);
    
    return res.json({
      token,
      playerId,
      username,
      expiresIn: '7d'
    });
  } catch (err) {
    console.error('❌ Demo login error:', err.message);
    return res.status(500).json({ error: "Login failed" });
  }
});

export default router;
