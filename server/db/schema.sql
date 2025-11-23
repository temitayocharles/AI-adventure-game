-- World Hero Adventures - Production Schema
-- Full COPPA compliance, indexes, constraints

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Parents (COPPA)
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  verified_at TIMESTAMP WITH TIME ZONE,
  consent_given_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_parents_email ON parents(email);

-- Users
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  email TEXT UNIQUE,
  birthdate DATE,
  parent_id uuid REFERENCES parents(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_active boolean DEFAULT true
);
CREATE INDEX idx_users_parent_id ON users(parent_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  avatar jsonb DEFAULT '{}'::jsonb,
  unlocked_worlds jsonb DEFAULT '[]'::jsonb,
  inventory jsonb DEFAULT '[]'::jsonb,
  achievements jsonb DEFAULT '[]'::jsonb,
  xp integer DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Worlds
CREATE TABLE IF NOT EXISTS worlds (
  id serial PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  disaster_type TEXT,
  meta jsonb DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_worlds_slug ON worlds(slug);

-- Levels
CREATE TABLE IF NOT EXISTS levels (
  id serial PRIMARY KEY,
  world_id integer NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  objectives jsonb DEFAULT '[]'::jsonb,
  difficulty TEXT DEFAULT 'easy',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_levels_world_id ON levels(world_id);

-- Game State
CREATE TABLE IF NOT EXISTS game_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  level_id integer REFERENCES levels(id) ON DELETE CASCADE,
  checkpoint jsonb,
  last_saved TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, level_id)
);
CREATE INDEX idx_game_state_user_id ON game_state(user_id);
CREATE INDEX idx_game_state_level_id ON game_state(level_id);

-- Multiplayer Rooms
CREATE TABLE IF NOT EXISTS multiplayer_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES users(id) ON DELETE CASCADE,
  participants jsonb DEFAULT '[]'::jsonb,
  state_snapshot jsonb DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT now() + INTERVAL '24 hours'
);
CREATE INDEX idx_multiplayer_rooms_host_id ON multiplayer_rooms(host_id);
CREATE INDEX idx_multiplayer_rooms_created_at ON multiplayer_rooms(created_at);

-- Drawings (UGC)
CREATE TABLE IF NOT EXISTS drawings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  storage_path TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_drawings_user_id ON drawings(user_id);
CREATE INDEX idx_drawings_status ON drawings(status);

-- Moderation Queue
CREATE TABLE IF NOT EXISTS moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL,
  payload jsonb NOT NULL,
  status TEXT DEFAULT 'pending',
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected', 'flagged'))
);
CREATE INDEX idx_moderation_queue_status ON moderation_queue(status);
CREATE INDEX idx_moderation_queue_created_at ON moderation_queue(created_at);

-- AI Calls (Logging & Audit)
CREATE TABLE IF NOT EXISTS ai_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  prompt_hash TEXT,
  model TEXT,
  response_summary jsonb,
  safety_flag boolean DEFAULT false,
  cost_estimate numeric DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_ai_calls_user_id ON ai_calls(user_id);
CREATE INDEX idx_ai_calls_created_at ON ai_calls(created_at);

-- Sessions (Optional for auth)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Achievements (Future)
CREATE TABLE IF NOT EXISTS achievements (
  id serial PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User Achievements (Future)
CREATE TABLE IF NOT EXISTS user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id integer NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

