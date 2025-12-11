-- 01-schema.sql
-- World Hero Adventures - Core Schema
-- Stage 1: Foundation tables

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Worlds table
CREATE TABLE IF NOT EXISTS worlds (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_worlds_slug ON worlds(slug);
CREATE INDEX idx_worlds_name ON worlds(name);

-- Levels table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  world_id INTEGER NOT NULL REFERENCES worlds(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  order_idx INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'easy',
  reward_xp INTEGER DEFAULT 100,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_levels_world_id ON levels(world_id);
CREATE INDEX idx_levels_order ON levels(world_id, order_idx);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_players_username ON players(username);

-- Player progress table (completion tracking)
CREATE TABLE IF NOT EXISTS player_progress (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  level_id INTEGER NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(player_id, level_id)
);

CREATE INDEX idx_player_progress_player ON player_progress(player_id);
CREATE INDEX idx_player_progress_level ON player_progress(level_id);
CREATE INDEX idx_player_progress_completed ON player_progress(player_id, completed);
