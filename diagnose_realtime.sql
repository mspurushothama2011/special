-- Diagnostic queries to check what's wrong with Realtime
-- Run these one by one in Supabase SQL Editor:

-- 1. Check if realtime is enabled on messages table
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
-- Should show 'public' | 'messages' in results

-- 2. Check RLS policies on messages table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'messages';
-- Should show the SELECT and INSERT policies

-- 3. If messages table is NOT in the realtime publication, run this:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- 4. Verify again:
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
