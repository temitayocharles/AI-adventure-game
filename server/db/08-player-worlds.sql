-- 08-player-worlds.sql
-- Stage 5: Per-player world unlocking

CREATE TABLE IF NOT EXISTS player_worlds (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  world_id INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, world_id)
);

CREATE INDEX IF NOT EXISTS idx_player_worlds_player ON player_worlds(player_id);
CREATE INDEX IF NOT EXISTS idx_player_worlds_world ON player_worlds(world_id);
CREATE INDEX IF NOT EXISTS idx_player_worlds_unlocked_at ON player_worlds(player_id, unlocked_at);
