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
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())
      - `onboarding_completed` (boolean, default false)

    - `interests`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `created_at` (timestamptz, default now())

    - `user_interests`
      - `user_id` (uuid, references profiles)
      - `interest_id` (uuid, references interests)
      - `created_at` (timestamptz, default now())

    - `teams`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

    - `team_members`
      - `team_id` (uuid, references teams)
      - `user_id` (uuid, references profiles)
      - `role` (text, default 'member')
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access where appropriate

  3. Functions
    - Auto-create profile on user signup
    - Update profile updated_at timestamp
*/

-- Create profiles table first (matches existing schema)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  points integer DEFAULT 0,
  streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  onboarding_completed boolean DEFAULT false
);

-- Add foreign key constraint to profiles after creation
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey'
  ) THEN
    ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey 
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create interests table (matches existing schema)
CREATE TABLE IF NOT EXISTS interests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user_interests table (matches existing schema)
CREATE TABLE IF NOT EXISTS user_interests (
  user_id uuid NOT NULL,
  interest_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, interest_id)
);

-- Add foreign key constraints for user_interests
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_interests_user_id_fkey'
  ) THEN
    ALTER TABLE user_interests ADD CONSTRAINT user_interests_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_interests_interest_id_fkey'
  ) THEN
    ALTER TABLE user_interests ADD CONSTRAINT user_interests_interest_id_fkey 
    FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create teams table (matches existing schema)
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create team_members table (matches existing schema)
CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- Add constraints for team_members
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_team_id_fkey'
  ) THEN
    ALTER TABLE team_members ADD CONSTRAINT team_members_team_id_fkey 
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_user_id_fkey'
  ) THEN
    ALTER TABLE team_members ADD CONSTRAINT team_members_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'team_members_role_check'
  ) THEN
    ALTER TABLE team_members ADD CONSTRAINT team_members_role_check 
    CHECK (role = ANY (ARRAY['owner'::text, 'admin'::text, 'member'::text]));
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Profiles are viewable by everyone'
  ) THEN
    CREATE POLICY "Profiles are viewable by everyone"
      ON profiles FOR SELECT
      TO public
      USING (true);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile"
      ON profiles FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Interests policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Interests are viewable by everyone'
  ) THEN
    CREATE POLICY "Interests are viewable by everyone"
      ON interests FOR SELECT
      TO public
      USING (true);
  END IF;
END $$;

-- User interests policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their interests'
  ) THEN
    CREATE POLICY "Users can insert their interests"
      ON user_interests FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage their interests'
  ) THEN
    CREATE POLICY "Users can manage their interests"
      ON user_interests FOR ALL
      TO public
      USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their interests'
  ) THEN
    CREATE POLICY "Users can view their interests"
      ON user_interests FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- Teams policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view their teams'
  ) THEN
    CREATE POLICY "Team members can view their teams"
      ON teams FOR SELECT
      TO public
      USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = teams.id 
        AND team_members.user_id = auth.uid()
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Team owners and admins can update their teams'
  ) THEN
    CREATE POLICY "Team owners and admins can update their teams"
      ON teams FOR UPDATE
      TO public
      USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = teams.id 
        AND team_members.user_id = auth.uid() 
        AND team_members.role = ANY (ARRAY['owner'::text, 'admin'::text])
      ));
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Team owners can delete their teams'
  ) THEN
    CREATE POLICY "Team owners can delete their teams"
      ON teams FOR DELETE
      TO public
      USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = teams.id 
        AND team_members.user_id = auth.uid() 
        AND team_members.role = 'owner'::text
      ));
  END IF;
END $$;

-- Team members policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Team members can view team membership'
  ) THEN
    CREATE POLICY "Team members can view team membership"
      ON team_members FOR SELECT
      TO public
      USING (
        user_id = auth.uid() OR 
        EXISTS (
          SELECT 1 FROM team_members tm
          WHERE tm.team_id = team_members.team_id 
          AND tm.user_id = auth.uid()
        )
      );
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Team owners and admins can manage team members'
  ) THEN
    CREATE POLICY "Team owners and admins can manage team members"
      ON team_members FOR ALL
      TO public
      USING (EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role = ANY (ARRAY['owner'::text, 'admin'::text])
      ));
  END IF;
END $$;

-- Create trigger function for new users
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

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default interests if they don't exist
INSERT INTO interests (name) VALUES
  ('Artificial Intelligence'),
  ('Machine Learning'),
  ('Physics'),
  ('Biology'),
  ('Chemistry'),
  ('Mathematics'),
  ('Computer Science'),
  ('Neuroscience'),
  ('Data Science'),
  ('Robotics'),
  ('Quantum Computing'),
  ('Biotechnology')
ON CONFLICT (name) DO NOTHING;