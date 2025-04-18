-- First, create a parent record linked to your Supabase auth account
-- You need to replace 'a172413a-e990-4b00-b237-77c047f2fc98' with your actual Supabase auth user ID
-- You can find this in the Supabase dashboard under Authentication -> Users
INSERT INTO parents (id, email, name) 
VALUES ('a172413a-e990-4b00-b237-77c047f2fc98', 'example@example.com', 'Parent Name');

-- Create initial tasks
INSERT INTO tasks (name, description, icon, points, frequency) VALUES
('Brush teeth', 'Brush your teeth in the morning and evening', '🪥', 5, 'daily'),
('Make bed', 'Make your bed neatly in the morning', '🛏️', 3, 'daily'),
('Read a book', 'Read for at least 20 minutes', '📚', 10, 'daily'),
('Clean room', 'Tidy up your bedroom', '🧹', 15, 'weekly'),
('Help with dishes', 'Help wash or put away dishes', '🍽️', 8, 'daily');

-- Insert kids (after the parent is created)
INSERT INTO kids (parent_id, name, age, avatar, points, streak)
VALUES
  ('a172413a-e990-4b00-b237-77c047f2fc98', 'Alex', 8, '👦', 50, 3),
  ('a172413a-e990-4b00-b237-77c047f2fc98', 'Emma', 6, '👧', 35, 2);

-- After inserting kids, get their IDs for assigning tasks
-- Assign tasks to the first kid
WITH kid_data AS (
  SELECT id FROM kids WHERE parent_id = 'a172413a-e990-4b00-b237-77c047f2fc98' AND name = 'Alex' LIMIT 1
)
INSERT INTO kid_tasks (kid_id, task_id)
SELECT 
  (SELECT id FROM kid_data),
  id
FROM tasks;

-- Assign tasks to the second kid
WITH kid_data AS (
  SELECT id FROM kids WHERE parent_id = 'a172413a-e990-4b00-b237-77c047f2fc98' AND name = 'Emma' LIMIT 1
)
INSERT INTO kid_tasks (kid_id, task_id)
SELECT 
  (SELECT id FROM kid_data),
  id
FROM tasks;

-- Create sample task logs for the first kid
WITH kid_data AS (
  SELECT id FROM kids WHERE parent_id = 'a172413a-e990-4b00-b237-77c047f2fc98' AND name = 'Alex' LIMIT 1
)
INSERT INTO task_logs (task_id, kid_id, date, ai_validated, parent_approved, points_awarded)
SELECT
  (SELECT id FROM tasks WHERE name = 'Brush teeth'),
  (SELECT id FROM kid_data),
  CURRENT_DATE - INTERVAL '1 day',
  TRUE,
  TRUE,
  5;

-- Create sample task logs for the second kid
WITH kid_data AS (
  SELECT id FROM kids WHERE parent_id = 'a172413a-e990-4b00-b237-77c047f2fc98' AND name = 'Emma' LIMIT 1
)
INSERT INTO task_logs (task_id, kid_id, date, ai_validated, parent_approved, points_awarded)
SELECT
  (SELECT id FROM tasks WHERE name = 'Make bed'),
  (SELECT id FROM kid_data),
  CURRENT_DATE - INTERVAL '1 day',
  TRUE,
  TRUE,
  3; 