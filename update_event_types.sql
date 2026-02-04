-- Update the events type constraint to include all the types we're using
-- Run this in Supabase SQL Editor:

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;

ALTER TABLE events ADD CONSTRAINT events_type_check 
CHECK (type IN ('date', 'anniversary', 'birthday', 'trip', 'reminder', 'other'));
