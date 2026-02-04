-- This creates profile entries for your users automatically
-- Run this in Supabase SQL Editor:

-- First, let's see what user IDs exist:
-- SELECT id, email FROM auth.users;

-- Then insert profiles for both users (replace UUIDs with actual IDs from above query)
-- Alternatively, use this trigger-based approach to auto-create profiles:

-- Create a function to auto-create profiles when users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    CASE 
      WHEN NEW.email = 'msp@couple.app' THEN 'msp'
      WHEN NEW.email = 'abi@couple.app' THEN 'abi'
      ELSE split_part(NEW.email, '@', 1)
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Manually create profiles for existing users (if they don't exist)
INSERT INTO public.profiles (id, email, username)
SELECT 
  id, 
  email,
  CASE 
    WHEN email = 'msp@couple.app' THEN 'msp'
    WHEN email = 'abi@couple.app' THEN 'abi'
    ELSE split_part(email, '@', 1)
  END
FROM auth.users
ON CONFLICT (id) DO NOTHING;
