-- 04-player-progress.sql
-- Stage 2: Player progression tracking

-- Already created in 01-schema.sql, just add index optimization
CREATE INDEX IF NOT EXISTS idx_player_progress_completed_at ON player_progress(player_id, completed_at DESC);
