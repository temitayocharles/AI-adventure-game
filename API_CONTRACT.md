# API Contract - Frontend Integration Guide

## Overview

This document specifies the exact API contract for frontend integration. All endpoints are production-ready.

---

## Authentication

### Login (Get JWT Token)

```http
POST /api/v1/auth/demo-login
Content-Type: application/json

{
  "username": "alice"
}
```

**Response** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "playerId": 97,
  "username": "alice",
  "expiresIn": "7d"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "username is required"
}
```

**Client Action**:
```typescript
// Store token in localStorage
localStorage.setItem('world_hero_jwt_token', response.token);
localStorage.setItem('world_hero_player_id', response.playerId);
localStorage.setItem('world_hero_username', response.username);

// Use gameAPI service
const result = await gameAPI.loginDemo('alice');
// Token automatically stored + used in future requests
```

---

## Worlds

### Get All Worlds

```http
GET /api/v1/worlds
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "worlds": [
    {
      "id": "1",
      "name": "Earthquake Escape",
      "slug": "earthquake-escape",
      "description": "Navigate through rumbling terrain and collapsing platforms",
      "icon": "🌍",
      "color": "from-yellow-400 to-orange-600",
      "meta": {
        "color": "from-yellow-400 to-orange-600",
        "weather": "clear"
      }
    },
    // ... 3 more worlds
  ]
}
```

**Error** (401 Unauthorized):
```json
{
  "error": "Unauthorized: missing or invalid token"
}
```

**Client Usage**:
```typescript
const { worlds } = await gameAPI.getWorlds();
// worlds = [
//   { id: "1", name: "Earthquake Escape", icon: "🌍", ... },
//   { id: "2", name: "Tsunami Tower", icon: "🌊", ... },
//   { id: "3", name: "Volcano Valley", icon: "🌋", ... },
//   { id: "4", name: "Desert Drought", icon: "🏜️", ... }
// ]
```

### Get Single World

```http
GET /api/v1/worlds/:worldId
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "world": {
    "id": "1",
    "name": "Earthquake Escape",
    "slug": "earthquake-escape",
    "description": "...",
    "icon": "🌍",
    "color": "from-yellow-400 to-orange-600"
  }
}
```

### Unlock World

```http
POST /api/v1/worlds/:worldId/unlock
Authorization: Bearer <token>
Content-Type: application/json

{}
```

**Response** (200 OK):
```json
{
  "unlocked": true,
  "unlockedAt": "2024-12-19T10:30:45.123Z"
}
```

**Client Usage**:
```typescript
const { unlocked } = await gameAPI.unlockWorld(worldId);
```

---

## Levels

### Get Levels in World

```http
GET /api/v1/players/me/levels?worldId=1
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "levels": [
    {
      "id": "1",
      "worldId": "1",
      "name": "Level 1: The First Tremor",
      "order_idx": 0,
      "difficulty": "easy",
      "rewardXp": 50,
      "completed": false,
      "completedAt": null,
      "unlocked": true,
      "meta": {
        "platforms": [
          { "x": 0, "y": 300, "w": 100, "h": 20 },
          { "x": 150, "y": 250, "w": 100, "h": 20 }
        ],
        "goal": { "x": 400, "y": 50, "w": 50, "h": 50 }
      }
    },
    {
      "id": "2",
      "worldId": "1",
      "name": "Level 2: Collapsing Corridor",
      "order_idx": 1,
      "difficulty": "medium",
      "rewardXp": 75,
      "completed": false,
      "completedAt": null,
      "unlocked": false,
      "meta": { ... }
    },
    {
      "id": "3",
      "worldId": "1",
      "name": "Level 3: The Big One",
      "order_idx": 2,
      "difficulty": "hard",
      "rewardXp": 100,
      "completed": false,
      "completedAt": null,
      "unlocked": false,
      "meta": { ... }
    }
  ]
}
```

**Business Logic**:
- `unlocked: true` → Level is playable (all previous levels complete)
- `unlocked: false` → Level is locked (previous level not completed)
- First level always `unlocked: true`
- Second/third levels unlock as first/second complete

**Client Usage**:
```typescript
const { levels } = await gameAPI.getPlayerLevels(worldId);

// In UI:
// - Show completed levels with checkmark
// - Show unlocked levels as playable
// - Show locked levels as grayed out (disabled)
```

### Get Single Level

```http
GET /api/v1/levels/:levelId
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "level": {
    "id": "1",
    "worldId": "1",
    "name": "Level 1: The First Tremor",
    "order_idx": 0,
    "difficulty": "easy",
    "rewardXp": 50,
    "meta": {
      "platforms": [...],
      "goal": {...}
    }
  }
}
```

**Client Usage**:
```typescript
// Used in LevelView to initialize game
const levelMetadata = levelData.meta;
const engine = new LevelEngine({
  canvas,
  width: 800,
  height: 600,
  metadata: levelMetadata,
  onGoalReached: async () => {
    const result = await gameAPI.completeLevel(levelId);
    if (result.completed) {
      // Show completion screen
      // Rewards: result.rewards.xp
      // Next level unlocked: result.unlockedNextLevel
    }
  }
});
```

---

## Player Progress

### Get Player's Levels with State

```http
GET /api/v1/players/me/levels?worldId=1
Authorization: Bearer <token>
```

**Response** (200 OK): [See Levels section above]

**Key Fields**:
- `completed: true/false` - Has player finished this level?
- `completedAt: ISO8601|null` - When completed?
- `unlocked: true/false` - Is level playable?

### Complete Level

```http
POST /api/v1/players/me/levels/:levelId/complete
Authorization: Bearer <token>
Content-Type: application/json

{}
```

**Response** (200 OK):
```json
{
  "completed": true,
  "unlockedNextLevel": true,
  "rewards": {
    "xp": 50
  }
}
```

**Error** (400 Bad Request - Already Completed):
```json
{
  "error": "Level already completed"
}
```

**Error** (400 Bad Request - Previous Level Not Done):
```json
{
  "error": "Previous level must be completed first"
}
```

**Client Usage**:
```typescript
// After player reaches goal in LevelEngine
const result = await gameAPI.completeLevel(levelId);

if (result.completed) {
  // Award XP
  console.log('Earned', result.rewards.xp, 'XP');
  
  // Show next level unlocked
  if (result.unlockedNextLevel) {
    console.log('Next level unlocked!');
  }
  
  // Transition back to world map
  setView(ViewState.WORLD_MAP);
} else {
  console.error('Failed to complete:', result.error);
}
```

### Get Player Progress

```http
GET /api/v1/players/me/progress
Authorization: Bearer <token>
```

**Response** (200 OK):
```json
{
  "progress": [
    {
      "levelId": "1",
      "worldId": "1",
      "completed": true,
      "completedAt": "2024-12-19T09:15:30.123Z"
    },
    {
      "levelId": "2",
      "worldId": "1",
      "completed": true,
      "completedAt": "2024-12-19T09:45:15.456Z"
    }
  ]
}
```

**Client Usage**:
```typescript
// Calculate completion stats
const { progress } = await gameAPI.getPlayerProgress();
const completedCount = progress.length;
const totalLevels = 12; // 3 worlds × 4 levels each
const percentage = (completedCount / totalLevels) * 100;
```

### Unlock World

```http
POST /api/v1/players/me/worlds/:worldId/unlock
Authorization: Bearer <token>
Content-Type: application/json

{}
```

**Response** (200 OK):
```json
{
  "unlocked": true,
  "unlockedAt": "2024-12-19T10:30:45.123Z"
}
```

---

## Error Handling

### Common Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "error": "Unauthorized: missing or invalid token"
}
```

**403 Forbidden** - Admin only
```json
{
  "error": "Forbidden: admin access required"
}
```

**404 Not Found** - Resource doesn't exist
```json
{
  "error": "Level not found"
}
```

**429 Too Many Requests** - Rate limited
```json
{
  "error": "Rate limit exceeded. Try again later."
}
```

**500 Internal Server Error** - Server error
```json
{
  "error": "Failed to complete level"
}
```

---

## Rate Limiting

**Limit**: 100 requests per hour per player
**Header**: `X-RateLimit-Remaining: <count>`

Example:
```
X-RateLimit-Remaining: 87
```

---

## Token Handling

### Storing Token

```typescript
// gameAPI.ts handles this automatically
// But here's what happens internally:

localStorage.setItem('world_hero_jwt_token', token);
```

### Using Token

```typescript
// All gameAPI calls include Bearer token automatically
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}`
};
```

### Token Expiry

- **Expires**: 7 days
- **Refresh**: User must login again
- **Logout**: Call `gameAPI.logout()` to clear

---

## Frontend Integration Checklist

- [ ] Call `gameAPI.loginDemo(username)` on app start
- [ ] Handle null return if login fails
- [ ] Store token (gameAPI handles this)
- [ ] Call `gameAPI.getWorlds()` to load world cards
- [ ] For each world, call `gameAPI.getPlayerLevels(worldId)` to load levels
- [ ] Show levels as playable/locked based on `unlocked` flag
- [ ] Initialize LevelEngine with level metadata when player selects level
- [ ] Call `gameAPI.completeLevel(levelId)` when onGoalReached fires
- [ ] Handle error cases (already completed, previous not done, etc)
- [ ] Refresh player progress after completion
- [ ] Call `gameAPI.logout()` on logout

---

## Example: Full Login → Play → Complete Flow

```typescript
import { gameAPI } from './services/gameAPI';
import { LevelEngine } from './services/levelEngine';

async function runGame() {
  // 1. LOGIN
  const auth = await gameAPI.loginDemo('alice');
  if (!auth) {
    console.error('Login failed');
    return;
  }
  console.log('Logged in as', auth.username);

  // 2. LOAD WORLDS
  const { worlds } = await gameAPI.getWorlds();
  console.log('Worlds:', worlds.map(w => w.name));

  // 3. SELECT WORLD & LOAD LEVELS
  const worldId = worlds[0].id;
  const { levels } = await gameAPI.getPlayerLevels(worldId);
  console.log('Levels:', levels.map(l => `${l.name} (unlocked: ${l.unlocked})`));

  // 4. SELECT LEVEL & PLAY
  const playableLevel = levels.find(l => l.unlocked && !l.completed);
  if (!playableLevel) {
    console.log('No playable levels');
    return;
  }

  const { level } = await gameAPI.getLevel(playableLevel.id);
  
  // 5. INITIALIZE GAME ENGINE
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const engine = new LevelEngine({
    canvas,
    width: 800,
    height: 600,
    metadata: level.meta,
    onGoalReached: async () => {
      console.log('Goal reached!');
      
      // 6. MARK COMPLETE
      const result = await gameAPI.completeLevel(playableLevel.id);
      if (result.completed) {
        console.log('Level completed! +' + result.rewards.xp + ' XP');
        if (result.unlockedNextLevel) {
          console.log('Next level unlocked!');
        }
      }
      
      // 7. CLEANUP & RETURN TO MAP
      engine.destroy();
      // Reload levels to see updated state
      const updatedLevels = await gameAPI.getPlayerLevels(worldId);
    }
  });

  // Player plays until reaching goal...
}

runGame();
```

---

## Appendix: Level Metadata Format

### Platforms Format
```json
{
  "platforms": [
    { "x": 0, "y": 300, "w": 100, "h": 20 },
    { "x": 150, "y": 250, "w": 100, "h": 20 }
  ],
  "goal": { "x": 400, "y": 50, "w": 50, "h": 50 }
}
```

### Tiled JSON Format (from Tiled editor)
```json
{
  "tilemap": {
    "layers": [
      {
        "name": "platforms",
        "objects": [
          { "x": 0, "y": 300, "w": 100, "h": 20 },
          { "x": 150, "y": 250, "w": 100, "h": 20 }
        ]
      }
    ]
  },
  "goal": { "x": 400, "y": 50, "w": 50, "h": 50 }
}
```

Both formats work with LevelEngine.

---

**Last Updated**: December 2024  
**API Version**: v1  
**Status**: Production Ready ✅
