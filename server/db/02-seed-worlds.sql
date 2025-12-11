-- 02-seed-worlds.sql
-- Stage 1: Seed initial worlds

INSERT INTO worlds (name, slug, description, icon, meta) VALUES
  ('Earthquake Escape', 'earthquake-escape', 'Navigate through rumbling terrain and collapsing platforms', '🌍', '{"color": "from-yellow-400 to-orange-600", "weather": "clear"}'),
  ('Tsunami Tower', 'tsunami-tower', 'Climb to safety before the waves arrive', '🌊', '{"color": "from-blue-400 to-cyan-600", "weather": "rainy"}'),
  ('Volcano Valley', 'volcano-valley', 'Jump across lava flows and dodge falling rocks', '🌋', '{"color": "from-red-500 to-orange-700", "weather": "smoky"}'),
  ('Desert Drought', 'desert-drought', 'Find water and resources in the dry heat', '🏜️', '{"color": "from-yellow-300 to-amber-600", "weather": "sunny"}')
ON CONFLICT DO NOTHING;
