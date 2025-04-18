-- Create tables with proper RLS policies

-- PARENTS TABLE
CREATE TABLE IF NOT EXISTS parents (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on parents table
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own profiles
CREATE POLICY parent_read_own_profile ON parents
  FOR SELECT USING (auth.uid() = id);

-- Create policy to allow users to update their own profiles
CREATE POLICY parent_update_own_profile ON parents
  FOR UPDATE USING (auth.uid() = id);

-- Create policy to allow sign-up
CREATE POLICY parent_insert_on_signup ON parents
  FOR INSERT WITH CHECK (auth.uid() = id);

-- KIDS TABLE
CREATE TABLE IF NOT EXISTS kids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  avatar TEXT NOT NULL,
  points INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on kids table
ALTER TABLE kids ENABLE ROW LEVEL SECURITY;

-- Create policy to allow parents to read their own kids
CREATE POLICY kid_read_own ON kids
  FOR SELECT USING (auth.uid() = parent_id);

-- Create policy to allow parents to insert their own kids
CREATE POLICY kid_insert_own ON kids
  FOR INSERT WITH CHECK (auth.uid() = parent_id);

-- Create policy to allow parents to update their own kids
CREATE POLICY kid_update_own ON kids
  FOR UPDATE USING (auth.uid() = parent_id);

-- Create policy to allow parents to delete their own kids
CREATE POLICY kid_delete_own ON kids
  FOR DELETE USING (auth.uid() = parent_id);

-- TASKS TABLE
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL,
  frequency TEXT CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up functions for Supabase auth
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.parents (id, email, name)
  VALUES (NEW.id, NEW.email, 
          COALESCE(NEW.raw_user_meta_data->>'name', 'New Parent'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Set up trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow anonymous access to fetch tasks
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY task_read_all ON tasks FOR SELECT USING (true); 