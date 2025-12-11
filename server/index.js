import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { Pool } from "pg";
import { v4 as uuidv4 } from "uuid";
import { GoogleGenAI } from "@google/genai";
import { authMiddleware, rateLimitMiddleware, requireAuth } from "./middleware/auth.js";
import { securityHeadersMiddleware, sanitizeInput, isValidUUID } from "./middleware/security.js";
import authRoutes from "./routes/auth.js";
import worldsRoutes from "./routes/worlds.js";
import levelsRoutes from "./routes/levels.js";
import progressionRoutes from "./routes/progression.js";
import aiRoutes from "./routes/ai.js";
import initMultiplayer from "./multiplayer.js";

dotenv.config();

const PORT = process.env.PORT || 4000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Set up Postgres pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Express app
const app = express();
app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(securityHeadersMiddleware);
app.use(bodyParser.json({ limit: "1mb" }));

// Make pool available to routes
app.locals.pool = pool;

// Create http server and socket.io
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: FRONTEND_ORIGIN }
});

// Structured logging
const log = (level, msg, data = {}) => {
  console.log(`[${new Date().toISOString()}] ${level.toUpperCase()}: ${msg}`, Object.keys(data).length > 0 ? data : "");
};

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Global error handler
app.use((err, req, res, next) => {
  log("error", "Unhandled error", { message: err.message, stack: err.stack });
  res.status(500).json({ error: "Internal server error", requestId: req.id });
});

// Simple health check
app.get("/api/health", (req, res) => res.json({ status: "ok", ts: new Date() }));

// Mount routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/worlds", worldsRoutes);
app.use("/api/v1/levels", levelsRoutes);
app.use("/api/v1/players", progressionRoutes);
app.use("/api/v1/ai", aiRoutes);

// Initialize multiplayer (WebSocket)
initMultiplayer(io, pool);

/**
 * AI proxy endpoint (with safety wrapper + rate limiting)
 * POST /api/v1/ai/query
 * body: { userId, promptType, promptPayload }
 */
app.post("/api/v1/ai/query", rateLimitMiddleware, asyncHandler(async (req, res) => {
  const { userId, promptType, promptPayload } = req.body || {};
  const systemPrompt = `You are 'Sprinkle', a calm, kind child-friendly assistant for ages 6-12. Keep answers short (1-3 sentences), simple, positive, and non-frightening. If uncertain, advise to ask a grown-up. No medical/legal instructions.`;

  try {
    const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await client.models.generateContent({
      model: process.env.AI_MODEL || "gemini-2.5-flash",
      contents: `System: ${systemPrompt}\n\nUser request (${promptType}): ${JSON.stringify(promptPayload)}\n\nRespond briefly and safely.`,
      config: { responseMimeType: "text/plain" }
    });

    const reply = response.text || "";
    log("info", "AI query processed", { userId, promptType, replyLength: reply.length });

    // Log ai_call (non-blocking)
    (async () => {
      try {
        await pool.query(
          `INSERT INTO ai_calls (user_id, prompt_hash, model, response_summary, created_at) VALUES ($1,$2,$3,$4,now())`,
          [userId || null, uuidv4(), process.env.AI_MODEL || "gemini-2.5-flash", reply.slice(0, 250)]
        );
      } catch (e) {
        log("error", "Failed to log ai_call", { error: e.message });
      }
    })();

    return res.json({ reply });
  } catch (e) {
    log("error", "AI proxy error, using fallback", { userId, error: e.message });
    
    // Provide sensible fallback based on prompt type
    let fallbackReply = "I'm having a bit of trouble thinking right now, but you're doing great!";
    
    if (promptType === 'quest') {
      const worldName = promptPayload?.worldName || 'Adventure';
      fallbackReply = JSON.stringify({
        title: `${worldName} Quest`,
        steps: [
          'Explore the challenges ahead',
          'Use your skills to overcome obstacles',
          'Reach your goal'
        ],
        funFact: 'Every adventure is unique - you\'re making it special!'
      });
    } else if (promptType === 'chat') {
      fallbackReply = "I'm here to help! What would you like to know?";
    }
    
    return res.json({ reply: fallbackReply, fallback: true });
  }
}));

/**
 * Profile & Inventory Sync Endpoints
 */
app.post("/api/v1/profile/update", asyncHandler(async (req, res) => {
  const { userId, displayName, avatarConfig, xp } = req.body || {};
  if (!userId) return res.status(400).json({ error: "missing userId" });

  try {
    await pool.query(
      `INSERT INTO profiles (user_id, avatar, xp) VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET avatar = $2, xp = $3
       RETURNING *`,
      [userId, JSON.stringify(avatarConfig || {}), xp || 0]
    );
    log("info", "Profile updated", { userId });
    return res.json({ updated: true });
  } catch (e) {
    log("error", "Profile update failed", { userId, error: e.message });
    return res.status(500).json({ error: "Profile update failed" });
  }
}));

app.post("/api/v1/inventory/save", asyncHandler(async (req, res) => {
  const { userId, inventory, craftingMaterials } = req.body || {};
  if (!userId) return res.status(400).json({ error: "missing userId" });

  try {
    await pool.query(
      `INSERT INTO profiles (user_id, inventory) VALUES ($1, $2)
       ON CONFLICT (user_id) DO UPDATE SET inventory = $2
       RETURNING *`,
      [userId, JSON.stringify(inventory || [])]
    );
    log("info", "Inventory saved", { userId, count: inventory?.length || 0 });
    return res.json({ saved: true });
  } catch (e) {
    log("error", "Inventory save failed", { userId, error: e.message });
    return res.status(500).json({ error: "Inventory save failed" });
  }
}));

/**
 * Minimal game-state endpoints
 */
app.post("/api/v1/game-state/save", asyncHandler(async (req, res) => {
  const { userId, levelId, checkpoint } = req.body || {};
  if (!userId) return res.status(400).json({ error: "missing userId" });
  try {
    const q = `INSERT INTO game_state (id, user_id, level_id, checkpoint, last_saved)
               VALUES ($1,$2,$3,$4,now())
               ON CONFLICT (user_id, level_id)
               DO UPDATE SET checkpoint = $4, last_saved = now()
               RETURNING *`;
    const id = uuidv4();
    const r = await pool.query(q, [id, userId, levelId || null, JSON.stringify(checkpoint || {})]);
    log("info", "Game state saved", { userId, levelId });
    return res.json({ saved: true, row: r.rows[0] });
  } catch (e) {
    log("error", "Save game-state failed", { userId, error: e.message });
    return res.status(500).json({ error: "save failed" });
  }
}));

app.get("/api/v1/game-state/load", asyncHandler(async (req, res) => {
  const { userId, levelId } = req.query;
  if (!userId) return res.status(400).json({ error: "missing userId" });
  try {
    const q = `SELECT * FROM game_state WHERE user_id = $1 AND (level_id = $2 OR $2 IS NULL) ORDER BY last_saved DESC LIMIT 1`;
    const r = await pool.query(q, [userId, levelId || null]);
    log("info", "Game state loaded", { userId, levelId, found: r.rows.length > 0 });
    return res.json({ state: r.rows[0] || null });
  } catch (e) {
    log("error", "Load game-state failed", { userId, error: e.message });
    return res.status(500).json({ error: "load failed" });
  }
}));

/**
 * Worlds & Levels Endpoints
 */
app.get("/api/v1/worlds", asyncHandler(async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM worlds ORDER BY id`);
    log("info", "Worlds fetched", { count: r.rows.length });
    return res.json({ worlds: r.rows });
  } catch (e) {
    log("error", "Worlds fetch failed", { error: e.message });
    return res.status(500).json({ error: "fetch failed" });
  }
}));

app.get("/api/v1/worlds/:worldId/levels", asyncHandler(async (req, res) => {
  const { worldId } = req.params;
  try {
    const r = await pool.query(`SELECT * FROM levels WHERE world_id = $1 ORDER BY id`, [worldId]);
    log("info", "Levels fetched", { worldId, count: r.rows.length });
    return res.json({ levels: r.rows });
  } catch (e) {
    log("error", "Levels fetch failed", { worldId, error: e.message });
    return res.status(500).json({ error: "fetch failed" });
  }
}));

/**
 * Moderation Queue Endpoints
 */
app.get("/api/v1/moderation/queue", asyncHandler(async (req, res) => {
  const { status = "pending" } = req.query;
  try {
    const q = status === "all" 
      ? `SELECT * FROM moderation_queue ORDER BY created_at DESC LIMIT 100`
      : `SELECT * FROM moderation_queue WHERE status = $1 ORDER BY created_at DESC LIMIT 100`;
    const params = status === "all" ? [] : [status];
    const r = await pool.query(q, params);
    log("info", "Moderation queue fetched", { status, count: r.rows.length });
    return res.json({ items: r.rows });
  } catch (e) {
    log("error", "Moderation queue fetch failed", { error: e.message });
    return res.status(500).json({ error: "fetch failed" });
  }
}));

app.post("/api/v1/moderation/review", asyncHandler(async (req, res) => {
  const { itemId, reviewAction, notes } = req.body || {};
  if (!itemId || !["approve", "reject", "flag"].includes(reviewAction)) {
    return res.status(400).json({ error: "invalid request" });
  }

  try {
    const status = reviewAction === "approve" ? "approved" : reviewAction === "reject" ? "rejected" : "flagged";
    const r = await pool.query(
      `UPDATE moderation_queue SET status = $1 WHERE id = $2 RETURNING *`,
      [status, itemId]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: "item not found" });
    log("info", "Moderation review submitted", { itemId, reviewAction, status });
    return res.json({ updated: true, row: r.rows[0] });
  } catch (e) {
    log("error", "Moderation review failed", { itemId, error: e.message });
    return res.status(500).json({ error: "review failed" });
  }
}));

app.post("/api/v1/moderation/flag", asyncHandler(async (req, res) => {
  const { itemType, payload } = req.body || {};
  if (!itemType) return res.status(400).json({ error: "missing itemType" });

  try {
    const id = uuidv4();
    await pool.query(
      `INSERT INTO moderation_queue (id, item_type, payload, status, created_at) VALUES ($1, $2, $3, 'pending', now())`,
      [id, itemType, JSON.stringify(payload || {})]
    );
    log("info", "Item flagged for moderation", { itemType, id });
    return res.json({ flagged: true, id });
  } catch (e) {
    log("error", "Flag submission failed", { itemType, error: e.message });
    return res.status(500).json({ error: "flag failed" });
  }
}));

/**
 * Socket.io Multiplayer with Authoritative Server
 * Events:
 *  - 'room:create' -> { hostId }
 *  - 'room:join' -> join existing room & get state
 *  - 'player:action' -> validate & broadcast to room
 *  - 'state:sync' -> periodic state snapshot
 */
const roomState = new Map(); // roomId -> {players: {socketId: playerData}, gameState: {}}

io.on("connection", (socket) => {
  log("info", "Socket connected", { socketId: socket.id });

  socket.on("room:create", async ({ hostId, initialState }) => {
    const roomId = uuidv4();
    socket.join(roomId);
    
    const room = {
      players: { [socket.id]: { userId: hostId, ready: false } },
      gameState: initialState || {},
      createdAt: new Date()
    };
    roomState.set(roomId, room);

    // Persist to DB
    try {
      await pool.query(
        `INSERT INTO multiplayer_rooms (id, host_id, participants, state_snapshot, created_at) VALUES ($1,$2,$3,$4,now())`,
        [roomId, hostId || null, JSON.stringify([hostId || null]), JSON.stringify(room)]
      );
    } catch (e) {
      log("error", "Failed to persist room", { roomId, error: e.message });
    }

    socket.emit("room:created", { roomId, room });
    log("info", "Room created", { roomId, hostId });
  });

  socket.on("room:join", async ({ roomId, userId }) => {
    const room = roomState.get(roomId);
    if (!room) {
      socket.emit("room:error", { message: "Room not found" });
      return;
    }

    socket.join(roomId);
    room.players[socket.id] = { userId, ready: false };

    // Broadcast to others
    socket.to(roomId).emit("player:joined", { userId, socketId: socket.id });
    socket.emit("room:joined", { roomId, room });

    // Persist participant update
    try {
      const participants = Object.values(room.players).map(p => p.userId);
      await pool.query(
        `UPDATE multiplayer_rooms SET participants = $1 WHERE id = $2`,
        [JSON.stringify(participants), roomId]
      );
    } catch (e) {
      log("error", "Failed to update room participants", { roomId, error: e.message });
    }

    log("info", "Player joined room", { roomId, userId, socketId: socket.id });
  });

  socket.on("player:action", ({ roomId, action, validated }) => {
    const room = roomState.get(roomId);
    if (!room) return;

    // Server-side validation (in production, validate game rules here)
    const isValid = action && action.type && typeof action.type === "string";
    if (!isValid) {
      socket.emit("action:invalid", { message: "Invalid action" });
      return;
    }

    // Apply to room state
    room.gameState.lastAction = { by: socket.id, action, ts: Date.now() };

    // Broadcast to other players
    socket.to(roomId).emit("player:action", { by: socket.id, action });
    log("info", "Player action broadcast", { roomId, socketId: socket.id, actionType: action.type });
  });

  socket.on("player:ready", ({ roomId }) => {
    const room = roomState.get(roomId);
    if (!room || !room.players[socket.id]) return;

    room.players[socket.id].ready = true;
    socket.to(roomId).emit("player:ready", { socketId: socket.id });

    // Check if all ready
    const allReady = Object.values(room.players).every(p => p.ready);
    if (allReady) {
      io.to(roomId).emit("game:start", { room });
      log("info", "All players ready, game starting", { roomId });
    }
  });

  socket.on("disconnect", () => {
    // Find and clean up rooms
    for (const [roomId, room] of roomState.entries()) {
      if (room.players[socket.id]) {
        delete room.players[socket.id];
        socket.to(roomId).emit("player:left", { socketId: socket.id });
        
        if (Object.keys(room.players).length === 0) {
          roomState.delete(roomId);
          log("info", "Empty room deleted", { roomId });
        }
      }
    }
    log("info", "Socket disconnected", { socketId: socket.id });
  });
});

// Start server
server.listen(PORT, () => {
  log("info", `Server listening on port ${PORT}`, { env: process.env.NODE_ENV || "development" });
});
