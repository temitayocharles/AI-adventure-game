-- 05-jwt-users.sql
-- Stage 3: JWT authentication support

-- Update players table to support JWT-based auth
ALTER TABLE players ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;
ALTER TABLE players ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_players_email ON players(email);
CREATE INDEX IF NOT EXISTS idx_players_created_at ON players(created_at);
