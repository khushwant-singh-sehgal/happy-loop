-- Create the database schema for Happy Loop

-- Parents table (extends Supabase auth users)
CREATE TABLE parents (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Kids table 
CREATE TABLE kids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task assignments (which kids have which tasks)
CREATE TABLE kid_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kid_id UUID REFERENCES kids(id) NOT NULL,
  task_id UUID REFERENCES tasks(id) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kid_id, task_id)
);

-- Task logs (completions)
CREATE TABLE task_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) NOT NULL,
  kid_id UUID REFERENCES kids(id) NOT NULL,
  date DATE NOT NULL,
  ai_validated BOOLEAN NOT NULL DEFAULT FALSE,
  parent_approved BOOLEAN,
  points_awarded INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Media uploads
CREATE TABLE media_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_log_id UUID REFERENCES task_logs(id) NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio')),
  thumbnail_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  kid_id UUID REFERENCES kids(id) NOT NULL,
  date_earned DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rewards
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  point_cost INTEGER NOT NULL,
  available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Earned rewards
CREATE TABLE earned_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reward_id UUID REFERENCES rewards(id) NOT NULL,
  kid_id UUID REFERENCES kids(id) NOT NULL,
  date_earned DATE NOT NULL,
  shipped BOOLEAN NOT NULL DEFAULT FALSE,
  shipped_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Family configuration
CREATE TABLE family_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID REFERENCES parents(id) NOT NULL UNIQUE,
  show_leaderboard BOOLEAN NOT NULL DEFAULT TRUE,
  ai_validation BOOLEAN NOT NULL DEFAULT TRUE,
  notification_frequency TEXT NOT NULL DEFAULT 'daily' CHECK (notification_frequency IN ('daily', 'weekly', 'never')),
  reward_preferences TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leaderboard entries
CREATE TABLE leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL,
  kid_id UUID REFERENCES kids(id),
  points INTEGER NOT NULL,
  streak INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row-level security policies
-- Only allow users to see their own data

-- Parents can only see their own profile
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view own profile" 
  ON parents FOR SELECT 
  USING (auth.uid() = id);

-- Parents can only see their own kids
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view their own kids" 
  ON kids FOR SELECT 
  USING (parent_id = auth.uid());
CREATE POLICY "Parents can insert their own kids" 
  ON kids FOR INSERT 
  WITH CHECK (parent_id = auth.uid());
CREATE POLICY "Parents can update their own kids" 
  ON kids FOR UPDATE 
  USING (parent_id = auth.uid());

-- Anyone can see tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view tasks" 
  ON tasks FOR SELECT 
  TO authenticated 
  USING (true);

-- Parents can only see task logs for their own kids
ALTER TABLE task_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view task logs for their kids" 
  ON task_logs FOR SELECT 
  USING (kid_id IN (SELECT id FROM kids WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can insert task logs for their kids" 
  ON task_logs FOR INSERT 
  WITH CHECK (kid_id IN (SELECT id FROM kids WHERE parent_id = auth.uid()));
CREATE POLICY "Parents can update task logs for their kids" 
  ON task_logs FOR UPDATE 
  USING (kid_id IN (SELECT id FROM kids WHERE parent_id = auth.uid()));

-- Parents can only see media uploads for their own kids
ALTER TABLE media_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Parents can view media uploads for their kids" 
  ON media_uploads FOR SELECT 
  USING (task_log_id IN (
    SELECT tl.id FROM task_logs tl 
    JOIN kids k ON tl.kid_id = k.id 
    WHERE k.parent_id = auth.uid()
  ));

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON family_configs
FOR EACH ROW EXECUTE PROCEDURE trigger_set_updated_at(); 