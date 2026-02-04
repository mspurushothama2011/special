-- Fix Row Level Security for Realtime Chat
-- Run this in Supabase SQL Editor:

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view all messages" ON messages;
DROP POLICY IF EXISTS "Users can insert their own messages" ON messages;

-- Allow all authenticated users to SELECT messages (required for Realtime)
CREATE POLICY "Users can view all messages"
ON messages FOR SELECT
TO authenticated
USING (true);

-- Allow users to insert their own messages
CREATE POLICY "Users can insert their own messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Verify RLS is enabled
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Verify realtime is enabled
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
