-- 03-levels.sql
-- Stage 1: Seed levels for each world

INSERT INTO levels (world_id, name, order_idx, difficulty, reward_xp, meta) 
SELECT w.id, v.name, v.order_idx, v.difficulty, v.reward_xp, v.meta
FROM (
  VALUES
    -- Earthquake Escape (world_id=1)
    ('Earthquake Escape', 1, 'Level 1: The First Tremor', 0, 'easy', 50, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Earthquake Escape', 1, 'Level 2: Collapsing Corridor', 1, 'medium', 75, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}, {"x": 300, "y": 200, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Earthquake Escape', 1, 'Level 3: The Big One', 2, 'hard', 100, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 180, "y": 250, "w": 80, "h": 20}, {"x": 320, "y": 200, "w": 80, "h": 20}, {"x": 450, "y": 150, "w": 100, "h": 20}], "goal": {"x": 500, "y": 50, "w": 50, "h": 50}}'::jsonb),
    -- Tsunami Tower (world_id=2)
    ('Tsunami Tower', 2, 'Level 1: Rising Waters', 0, 'easy', 50, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Tsunami Tower', 2, 'Level 2: The Wave Approaches', 1, 'medium', 75, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}, {"x": 300, "y": 200, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Tsunami Tower', 2, 'Level 3: Safety at the Top', 2, 'hard', 100, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 180, "y": 250, "w": 80, "h": 20}, {"x": 320, "y": 200, "w": 80, "h": 20}, {"x": 450, "y": 150, "w": 100, "h": 20}], "goal": {"x": 500, "y": 50, "w": 50, "h": 50}}'::jsonb),
    -- Volcano Valley (world_id=3)
    ('Volcano Valley', 3, 'Level 1: Lava Flow', 0, 'easy', 50, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Volcano Valley', 3, 'Level 2: Dodging Rocks', 1, 'medium', 75, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}, {"x": 300, "y": 200, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Volcano Valley', 3, 'Level 3: Inferno', 2, 'hard', 100, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 180, "y": 250, "w": 80, "h": 20}, {"x": 320, "y": 200, "w": 80, "h": 20}, {"x": 450, "y": 150, "w": 100, "h": 20}], "goal": {"x": 500, "y": 50, "w": 50, "h": 50}}'::jsonb),
    -- Desert Drought (world_id=4)
    ('Desert Drought', 4, 'Level 1: Finding Water', 0, 'easy', 50, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Desert Drought', 4, 'Level 2: Mirage Maze', 1, 'medium', 75, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 150, "y": 250, "w": 100, "h": 20}, {"x": 300, "y": 200, "w": 100, "h": 20}], "goal": {"x": 400, "y": 50, "w": 50, "h": 50}}'::jsonb),
    ('Desert Drought', 4, 'Level 3: Oasis', 2, 'hard', 100, '{"platforms": [{"x": 0, "y": 300, "w": 100, "h": 20}, {"x": 180, "y": 250, "w": 80, "h": 20}, {"x": 320, "y": 200, "w": 80, "h": 20}, {"x": 450, "y": 150, "w": 100, "h": 20}], "goal": {"x": 500, "y": 50, "w": 50, "h": 50}}'::jsonb)
) v(world_name, world_order, name, order_idx, difficulty, reward_xp, meta)
INNER JOIN worlds w ON w.name = v.world_name
ON CONFLICT DO NOTHING;
