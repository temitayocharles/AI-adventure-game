/**
 * server/multiplayer.js
 * Real-time multiplayer synchronization via WebSocket
 * 
 * Features:
 * - Player position sync
 * - Shared world state
 * - Level progress broadcast
 * - Leaderboard updates
 * - PvP mechanics (optional)
 */

import { Server } from 'socket.io';

// Active players in each world/level
const activePlayers = new Map(); // worldId -> Set of { playerId, username, position, levelId }
const leaderboard = new Map(); // worldId -> sorted by xp

/**
 * Initialize multiplayer handlers
 * @param {Server} io - Socket.io instance
 * @param {Pool} pool - Postgres connection pool
 */
export function initMultiplayer(io, pool) {
  io.on('connection', (socket) => {
    const sessionData = {
      playerId: null,
      username: null,
      worldId: null,
      levelId: null,
      position: { x: 50, y: 50 },
      xp: 0
    };

    console.log(`✅ Player connected: ${socket.id}`);

    /**
     * Player joins world
     * Broadcast to all players in that world
     */
    socket.on('join-world', async (data) => {
      const { playerId, username, worldId } = data;
      
      sessionData.playerId = playerId;
      sessionData.username = username;
      sessionData.worldId = worldId;

      // Add to active players
      if (!activePlayers.has(worldId)) {
        activePlayers.set(worldId, new Set());
      }
      activePlayers.get(worldId).add(sessionData);

      socket.join(`world-${worldId}`);

      console.log(`✅ Player ${username} joined world ${worldId}`);

      // Broadcast to world
      io.to(`world-${worldId}`).emit('player-joined', {
        playerId,
        username,
        position: sessionData.position
      });

      // Send current players in world
      const playersInWorld = Array.from(activePlayers.get(worldId) || []);
      socket.emit('world-state', {
        players: playersInWorld.map(p => ({
          playerId: p.playerId,
          username: p.username,
          position: p.position,
          levelId: p.levelId
        }))
      });

      // Fetch leaderboard
      try {
        const result = await pool.query(`
          SELECT 
            p.id, 
            p.username, 
            COALESCE(SUM(l.reward_xp), 0) as total_xp
          FROM players p
          LEFT JOIN player_progress pp ON p.id = pp.player_id AND pp.completed = true
          LEFT JOIN levels l ON pp.level_id = l.id
          WHERE l.world_id = $1 OR $1 IS NULL
          GROUP BY p.id
          ORDER BY total_xp DESC
          LIMIT 10
        `, [worldId === 'all' ? null : worldId]);

        socket.emit('leaderboard', {
          worldId,
          players: result.rows.map(row => ({
            playerId: row.id,
            username: row.username,
            xp: parseInt(row.total_xp)
          }))
        });
      } catch (err) {
        console.error('❌ Error fetching leaderboard:', err.message);
      }
    });

    /**
     * Player position update (while playing level)
     * Broadcast to nearby players
     */
    socket.on('position-update', (data) => {
      const { position, levelId } = data;
      
      sessionData.position = position;
      sessionData.levelId = levelId;

      // Broadcast to world (throttle for performance)
      io.to(`world-${sessionData.worldId}`).emit('player-moved', {
        playerId: sessionData.playerId,
        username: sessionData.username,
        position,
        levelId
      });
    });

    /**
     * Level completed
     * Update leaderboard and broadcast achievement
     */
    socket.on('level-completed', async (data) => {
      const { levelId, worldId, xp } = data;

      sessionData.xp += xp;

      console.log(`🎉 Player ${sessionData.username} completed level ${levelId}`);

      // Broadcast achievement
      io.to(`world-${worldId}`).emit('achievement', {
        playerId: sessionData.playerId,
        username: sessionData.username,
        event: 'level-completed',
        levelId,
        xp,
        timestamp: new Date()
      });

      // Update leaderboard
      try {
        const result = await pool.query(`
          SELECT 
            p.id,
            p.username,
            COALESCE(SUM(l.reward_xp), 0) as total_xp
          FROM players p
          LEFT JOIN player_progress pp ON p.id = pp.player_id AND pp.completed = true
          LEFT JOIN levels l ON pp.level_id = l.id
          WHERE p.id = $1
          GROUP BY p.id
        `, [sessionData.playerId]);

        if (result.rows.length > 0) {
          io.to(`world-${worldId}`).emit('leaderboard-update', {
            playerId: sessionData.playerId,
            username: sessionData.username,
            xp: parseInt(result.rows[0].total_xp),
            rank: 'calculating...'
          });
        }
      } catch (err) {
        console.error('❌ Error updating leaderboard:', err.message);
      }
    });

    /**
     * Player challenge/duel initiation (PvP)
     */
    socket.on('challenge-player', (data) => {
      const { targetPlayerId, levelId } = data;

      io.to(`player-${targetPlayerId}`).emit('challenge-received', {
        challenger: {
          playerId: sessionData.playerId,
          username: sessionData.username
        },
        levelId,
        challengeId: `challenge-${Date.now()}`
      });

      console.log(`⚔️ ${sessionData.username} challenged ${targetPlayerId} in level ${levelId}`);
    });

    /**
     * PvP match results
     */
    socket.on('match-result', (data) => {
      const { winnerId, loserId, levelId, worldId } = data;

      io.to(`world-${worldId}`).emit('match-completed', {
        winner: winnerId,
        loser: loserId,
        levelId,
        timestamp: new Date()
      });

      console.log(`🏆 Match result: ${winnerId} vs ${loserId}`);
    });

    /**
     * Disconnect handler
     */
    socket.on('disconnect', () => {
      if (sessionData.worldId && activePlayers.has(sessionData.worldId)) {
        activePlayers.get(sessionData.worldId).delete(sessionData);
      }

      console.log(`❌ Player disconnected: ${socket.id} (${sessionData.username})`);

      // Broadcast disconnect
      io.to(`world-${sessionData.worldId}`).emit('player-left', {
        playerId: sessionData.playerId,
        username: sessionData.username
      });
    });

    /**
     * Chat/messaging
     */
    socket.on('chat-message', (data) => {
      const { message, worldId } = data;

      io.to(`world-${worldId}`).emit('chat-received', {
        playerId: sessionData.playerId,
        username: sessionData.username,
        message,
        timestamp: new Date()
      });

      console.log(`💬 [${sessionData.username}] ${message}`);
    });
  });

  return io;
}

/**
 * Get active players in a world
 */
export function getWorldPlayers(worldId) {
  return Array.from(activePlayers.get(worldId) || []);
}

/**
 * Get leaderboard for a world
 */
export async function getLeaderboard(pool, worldId, limit = 10) {
  try {
    const result = await pool.query(`
      SELECT 
        p.id,
        p.username,
        COALESCE(SUM(l.reward_xp), 0) as total_xp,
        COUNT(CASE WHEN pp.completed = true THEN 1 END) as levels_completed
      FROM players p
      LEFT JOIN player_progress pp ON p.id = pp.player_id
      LEFT JOIN levels l ON pp.level_id = l.id
      WHERE l.world_id = $1 OR $1 IS NULL
      GROUP BY p.id
      ORDER BY total_xp DESC
      LIMIT $2
    `, [worldId === 'all' ? null : worldId, limit]);

    return result.rows;
  } catch (err) {
    console.error('❌ Error fetching leaderboard:', err.message);
    return [];
  }
}

export default initMultiplayer;
