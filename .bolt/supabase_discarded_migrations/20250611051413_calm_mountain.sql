/*
  # Initial BrainFeed Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `full_name` (text)
      - `avatar_url` (text, nullable)
      - `points` (integer, default 0)
      - `streak` (integer, default 0)
      - `last_activity` (timestamptz, default now())
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `interests`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `icon` (text)
      - `color` (text)
      - `created_at` (timestamptz, default now())

    - `user_interests`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `interest_id` (uuid, references interests)
      - `created_at` (timestamptz, default now())

    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `owner_id` (uuid, references profiles)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `team_members`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references profiles)
      - `role` (text, default 'member')
      - `joined_at` (timestamptz, default now())

    - `posts`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `content_type` (text)
      - `content_url` (text)
      - `thumbnail_url` (text)
      - `author` (text)
      - `published_at` (timestamptz)
      - `tags` (text[])
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `created_at` (timestamptz, default now())

    - `user_post_interactions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references posts)
      - `interaction_type` (text) -- 'like', 'save', 'view'
      - `created_at` (timestamptz, default now())

    - `quiz_sessions`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `post_id` (uuid, references posts)
      - `questions` (jsonb)
      - `answers` (jsonb)
      - `score` (integer)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Functions
    - Auto-create profile on user signup
    - Update profile updated_at timestamp
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  points integer DEFAULT 0,
  streak integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create interests table
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_interests table
CREATE TABLE IF NOT EXISTS user_interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  interest_id uuid REFERENCES interests(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, interest_id)
);

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  content_type text NOT NULL CHECK (content_type IN ('paper', 'video', 'article')),
  content_url text NOT NULL,
  thumbnail_url text,
  author text NOT NULL,
  published_at timestamptz DEFAULT now(),
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  comments_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create user_post_interactions table
CREATE TABLE IF NOT EXISTS user_post_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  interaction_type text NOT NULL CHECK (interaction_type IN ('like', 'save', 'view')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id, interaction_type)
);

-- Create quiz_sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  questions jsonb NOT NULL,
  answers jsonb,
  score integer,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_post_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Interests policies (public read)
CREATE POLICY "Anyone can view interests"
  ON interests FOR SELECT
  TO authenticated
  USING (true);

-- User interests policies
CREATE POLICY "Users can view all user interests"
  ON user_interests FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interests"
  ON user_interests FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Users can view all teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Team owners can update teams"
  ON teams FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Team members policies
CREATE POLICY "Users can view team members"
  ON team_members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Team owners can manage members"
  ON team_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM teams 
      WHERE teams.id = team_members.team_id 
      AND teams.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can join teams"
  ON team_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Posts policies (public read)
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

-- User post interactions policies
CREATE POLICY "Users can view all interactions"
  ON user_post_interactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own interactions"
  ON user_post_interactions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Quiz sessions policies
CREATE POLICY "Users can view own quiz sessions"
  ON quiz_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own quiz sessions"
  ON quiz_sessions FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

-- Insert default interests
INSERT INTO interests (name, description, icon, color) VALUES
  ('Artificial Intelligence', 'Machine learning, neural networks, and AI applications', 'Brain', '#6366f1'),
  ('Machine Learning', 'Algorithms, data science, and predictive modeling', 'Cpu', '#8b5cf6'),
  ('Physics', 'Quantum mechanics, relativity, and fundamental forces', 'Atom', '#06b6d4'),
  ('Biology', 'Genetics, evolution, and life sciences', 'Dna', '#10b981'),
  ('Chemistry', 'Molecular structures, reactions, and materials', 'FlaskConical', '#f59e0b'),
  ('Mathematics', 'Pure and applied mathematics, statistics', 'Calculator', '#ef4444'),
  ('Computer Science', 'Algorithms, programming, and software engineering', 'Code', '#84cc16'),
  ('Neuroscience', 'Brain function, cognition, and neural networks', 'Brain', '#f97316'),
  ('Data Science', 'Big data, analytics, and visualization', 'BarChart3', '#3b82f6'),
  ('Robotics', 'Automation, mechatronics, and intelligent systems', 'Bot', '#6b7280'),
  ('Quantum Computing', 'Quantum algorithms and quantum information', 'Zap', '#ec4899'),
  ('Biotechnology', 'Genetic engineering and biomedical applications', 'Microscope', '#14b8a6')
ON CONFLICT (name) DO NOTHING;