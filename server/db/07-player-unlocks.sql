-- 07-player-unlocks.sql
-- Stage 5: Per-player level unlocking

CREATE TABLE IF NOT EXISTS player_unlocks (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, level_id)
);

CREATE INDEX IF NOT EXISTS idx_player_unlocks_player ON player_unlocks(player_id);
CREATE INDEX IF NOT EXISTS idx_player_unlocks_level ON player_unlocks(level_id);
CREATE INDEX IF NOT EXISTS idx_player_unlocks_unlocked_at ON player_unlocks(player_id, unlocked_at);
