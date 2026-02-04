-- IMPORTANT: Enable Realtime for the Chat feature
-- Run this in your Supabase SQL Editor:

-- Enable realtime on the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Verify it's enabled (should show 'messages' in the list)
SELECT schemaname, tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
