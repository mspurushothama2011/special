-- Instructions: Run this in Supabase SQL Editor AFTER you've created the accounts manually
-- You need to create these two accounts in Supabase Auth Dashboard first:
-- 1. Email: partner1@couple.app, Password: (choose a password)
-- 2. Email: partner2@couple.app, Password: (choose a password)

-- Then update the profiles table with usernames
-- Replace the UUIDs below with the actual user IDs from auth.users table

-- To get the user IDs, run this first:
-- SELECT id, email FROM auth.users;

-- Then update with actual IDs:
-- UPDATE profiles SET username = 'Partner1' WHERE id = 'UUID_FROM_AUTH_USERS_FOR_PARTNER1';
-- UPDATE profiles SET username = 'Partner2' WHERE id = 'UUID_FROM_AUTH_USERS_FOR_PARTNER2';
