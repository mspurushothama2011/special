-- Remove the CHECK constraint on events.type to allow any custom text
-- Run this in Supabase SQL Editor:

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;

-- Now the type column can accept any text value
