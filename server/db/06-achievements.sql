-- 06-achievements.sql
-- Stage 4: Achievement system

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_achievements (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_player_achievements_player ON player_achievements(player_id);
CREATE INDEX IF NOT EXISTS idx_player_achievements_achievement ON player_achievements(achievement_id);

-- Seed some basic achievements
INSERT INTO achievements (name, description, icon, points) VALUES
  ('First Steps', 'Complete your first level', '👣', 10),
  ('Speedrunner', 'Complete a level in under 30 seconds', '⚡', 20),
  ('World Explorer', 'Unlock all worlds', '🗺️', 50),
  ('Completionist', 'Complete all levels', '⭐', 100)
ON CONFLICT DO NOTHING;
