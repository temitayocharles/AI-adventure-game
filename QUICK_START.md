# Quick Start Guide - World Hero Adventures

## ✅ What's New

Your repository now has **complete backend implementation** with:

1. ✅ JWT-based authentication (demo-login endpoint)
2. ✅ Per-player progression system (sequential level unlocking)
3. ✅ Database migrations (8 files, 4 worlds, 12 levels)
4. ✅ API endpoints (worlds, levels, player progress)
5. ✅ PixiJS 2D game engine with physics
6. ✅ Transaction-safe level completion

---

## 🚀 Get Running in 3 Steps

### Step 1: Install Dependencies

```bash
cd /Users/charlie/Downloads/world-hero-adventures

# Install frontend
npm install

# Install server
cd server
npm install
cd ..
```

### Step 2: Create Environment File

```bash
cat > server/.env << 'EOF'
JWT_SECRET=dev-secret-change-in-production
DATABASE_URL=postgresql://postgres:password@postgres:5432/world_hero
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
NODE_ENV=development
EOF
```

### Step 3: Run with Docker

```bash
docker-compose up --build
```

**Access**:
- Frontend: http://localhost:5173
- Server: http://localhost:4000
- Database: localhost:5432

---

## 🧪 Quick Test

### 1. Check Server Health
```bash
curl http://localhost:4000/api/health
```
Response: `{"status":"ok","ts":"..."}`

### 2. Demo Login
```bash
curl -X POST http://localhost:4000/api/v1/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice"}'
```
Response:
```json
{
  "token": "eyJhbGc...",
  "playerId": 97,
  "username": "alice",
  "expiresIn": "7d"
}
```

### 3. Get Worlds (using token)
```bash
TOKEN="eyJhbGc..." # From step 2

curl http://localhost:4000/api/v1/worlds \
  -H "Authorization: Bearer $TOKEN"
```
Response: 4 worlds (Earthquake, Tsunami, Volcano, Desert)

### 4. Get Player Levels
```bash
curl "http://localhost:4000/api/v1/players/me/levels?worldId=1" \
  -H "Authorization: Bearer $TOKEN"
```
Response: 3 levels with completion flags

### 5. Complete a Level
```bash
curl -X POST "http://localhost:4000/api/v1/players/me/levels/1/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```
Response: `{"completed":true,"unlockedNextLevel":true,"rewards":{"xp":50}}`

---

## 📁 Key Files

### Backend Routes
```
server/routes/
├── auth.js          # POST /demo-login
├── worlds.js        # GET /worlds, POST /unlock
├── levels.js        # GET /levels
└── progression.js   # GET /me/levels, POST /complete, GET /me/progress
```

### Database
```
server/db/
├── 01-schema.sql         # Core tables
├── 02-seed-worlds.sql    # 4 worlds
├── 03-levels.sql         # 12 levels
├── 04-player-progress.sql
├── 05-jwt-users.sql
├── 06-achievements.sql
├── 07-player-unlocks.sql
└── 08-player-worlds.sql
```

### Frontend Services
```
services/
├── gameAPI.ts        # JWT login, worlds, levels, completion
└── levelEngine.ts    # PixiJS 2D platformer engine
```

---

## 🔒 Security Features

✅ **JWT Authentication** - Stateless token-based auth
✅ **Per-Player Isolation** - Each player's progress independent
✅ **Sequential Progression** - Can't skip levels
✅ **Rate Limiting** - 100 requests/hour per player
✅ **Transaction Safety** - No race conditions on level completion
✅ **Input Validation** - All server inputs sanitized

---

## 🎮 Game Architecture

### Player Flow
```
Login (JWT token) 
  → Load Worlds (4 disaster scenarios)
  → Load Levels (3 levels per world)
  → Play Level (PixiJS engine, AABB physics)
  → Complete Level (server validates, unlocks next)
  → Progression tracked per-player in database
```

### Progression Rules
- First level of each world unlocked by default
- Must complete level N to unlock level N+1
- Server enforces sequential completion
- Transactional database ensures no race conditions

---

## 🛠️ Configuration

### Modify Levels/Worlds

Edit world/level data in migrations:

```bash
# Edit server/db/02-seed-worlds.sql (4 worlds)
# Edit server/db/03-levels.sql (12 levels + metadata)
```

Then reapply migrations:
```bash
docker-compose down -v  # Remove old database
docker-compose up --build  # Recreate with new data
```

### Modify Physics

Edit `/services/levelEngine.ts`:
```typescript
const GRAVITY = 1000;        // pixels/sec²
const PLAYER_SPEED = 220;    // pixels/sec
const JUMP_FORCE = 600;      // pixels/sec
```

---

## 📊 Database Schema

**Key Tables**:
- `worlds` - 4 disaster worlds
- `levels` - 12 levels with platforms/goal metadata
- `players` - Player identities
- `player_progress` - Completion tracking
- `player_unlocks` - Level unlock tracking
- `player_worlds` - World unlock tracking

**Per-Player State**:
- Each (player, level) pair tracks: completed + unlocked
- Sequential checking prevents progression bypass
- All queries filtered by authenticated player ID

---

## 🧬 API Endpoints Summary

| Method | Endpoint | Protected | Purpose |
|--------|----------|-----------|---------|
| POST | `/auth/demo-login` | ❌ | Get JWT token |
| GET | `/worlds` | ✅ | List all worlds |
| GET | `/worlds/:id` | ✅ | Single world |
| POST | `/worlds/:id/unlock` | ✅ | Unlock world |
| GET | `/levels/world/:worldId` | ✅ | Levels in world |
| GET | `/levels/:id` | ✅ | Level metadata |
| GET | `/players/me/levels` | ✅ | My levels (with state) |
| POST | `/players/me/levels/:id/complete` | ✅ | Mark completed |
| GET | `/players/me/progress` | ✅ | My completion history |
| POST | `/players/me/worlds/:id/unlock` | ✅ | My world unlocks |

---

## 🐛 Troubleshooting

### Database Won't Connect
```bash
# Check postgres is running
docker-compose logs postgres

# Verify DATABASE_URL in server/.env
echo $DATABASE_URL

# Manually test connection
psql $DATABASE_URL -c "SELECT 1"
```

### JWT Errors
```
"Unauthorized: invalid token" → Token expired or malformed
"Unauthorized: missing token" → Bearer header missing
```

Solution: Get new token from `/auth/demo-login`

### Levels Not Showing
1. Check database migrations ran: `SELECT COUNT(*) FROM levels;`
2. Check `worldId` parameter matches world IDs in database
3. Verify player has world unlocked: `SELECT * FROM player_worlds WHERE player_id=X;`

---

## 📚 Next Development Tasks

- [ ] Connect frontend App.tsx to JWT login flow
- [ ] Wire LevelView to use gameAPI.completeLevel()
- [ ] Add achievement system UI
- [ ] Implement multiplayer (Socket.io ready)
- [ ] Add Redis-backed rate limiting
- [ ] Deploy to production (GHCR)
- [ ] Add OAuth/SSO authentication

---

## 📞 Code Review Highlights

### What Makes This Production-Ready
1. **Transaction Safety** - Level completion uses database transactions
2. **Sequential Gating** - Server validates progression, not client
3. **Per-Player Isolation** - No cross-player data leaks
4. **Stateless Auth** - JWT tokens allow horizontal scaling
5. **Indexed Queries** - All foreign keys + frequently queried columns indexed
6. **Idempotent Migrations** - Can re-run safely without errors

### What Still Needs Work
- E2E tests (Playwright skeleton exists)
- OAuth/SSO (demo-login only)
- Redis rate limiting (in-memory ok for now)
- Production secrets management
- Admin dashboard UI

---

**Status**: ✅ Backend fully implemented. Frontend integration in progress.

See `IMPLEMENTATION_SUMMARY.md` for detailed technical documentation.
