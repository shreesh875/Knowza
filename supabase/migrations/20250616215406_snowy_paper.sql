/*
  # Fix user signup trigger function

  1. Database Functions
    - Create or replace the `handle_new_user()` function to properly create profiles for new users
    - Function extracts user metadata (full_name, username) and creates a profile record

  2. Triggers
    - Create or replace the trigger on `auth.users` table to automatically call the function
    - Ensures every new user gets a corresponding profile record

  3. Security
    - Function runs with SECURITY DEFINER to have proper permissions
    - Handles potential conflicts gracefully with ON CONFLICT clause
*/

-- Create or replace the function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    username,
    points,
    streak,
    onboarding_completed,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    0,
    0,
    false,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to automatically create profiles for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();