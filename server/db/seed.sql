-- Seed data for World Hero Adventures
-- Run after schema.sql with: psql $DATABASE_URL -f db/seed.sql

INSERT INTO worlds (slug, name, disaster_type, meta) VALUES
('w_earthquake', 'Earthquake Escape', 'earthquake', '{"icon": "🏚️", "color": "from-orange-400 to-red-600", "weather": "clear", "description": "Navigate a town shaken by tremors."}'),
('w_tsunami', 'Tsunami Tower', 'tsunami', '{"icon": "🌊", "color": "from-cyan-400 to-blue-600", "weather": "rain", "description": "Race against rising waters!"}'),
('w_volcano', 'Volcano Valley', 'volcano', '{"icon": "🌋", "color": "from-red-500 to-orange-700", "weather": "ash", "description": "Survive the lava flow."}'),
('w_desert', 'Desert Drought', 'drought', '{"icon": "🏜️", "color": "from-yellow-500 to-orange-600", "weather": "clear", "description": "Find water in the wasteland."}')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO levels (world_id, name, objectives, difficulty) VALUES
(1, 'Level 1: Ground Shake', '["Move to safe zone", "Collect supplies", "Reach checkpoint"]'::jsonb, 'easy'),
(1, 'Level 2: Aftershock', '["Avoid falling debris", "Help others", "Escape safely"]'::jsonb, 'medium'),
(1, 'Level 3: Rebuild', '["Gather resources", "Build shelter", "Restore hope"]'::jsonb, 'hard'),
(2, 'Level 1: Rising Tide', '["Reach higher ground", "Save belongings", "Warn others"]'::jsonb, 'easy'),
(2, 'Level 2: Big Wave', '["Navigate current", "Rescue items", "Find refuge"]'::jsonb, 'hard'),
(3, 'Level 1: Lava Alert', '["Evacuate zone", "Collect resources", "Reach safety"]'::jsonb, 'easy'),
(3, 'Level 2: Hot Times', '["Cross hazard zone", "Gather supplies", "Help community"]'::jsonb, 'hard'),
(4, 'Level 1: Find Water', '["Search for wells", "Ration supplies", "Help others"]'::jsonb, 'easy'),
(4, 'Level 2: Survive Heat', '["Find shelter", "Collect resources", "Stay strong"]'::jsonb, 'medium')
ON CONFLICT DO NOTHING;

INSERT INTO achievements (slug, name, description, icon) VALUES
('first_level', 'First Hero', 'Complete your first level', '🎖️'),
('speedrun', 'Speed Demon', 'Complete a level in under 1 minute', '⚡'),
('explorer', 'World Explorer', 'Unlock all worlds', '🗺️'),
('crafter', 'Master Crafter', 'Craft 10 items', '⚒️'),
('helper', 'Community Helper', 'Help 5 NPCs', '🤝'),
('collector', 'Collector', 'Collect 100 items', '📦')
ON CONFLICT (slug) DO NOTHING;
