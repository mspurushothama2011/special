-- Add is_yearly column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_yearly BOOLEAN DEFAULT FALSE;

-- Drop the old type constraint
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;

-- Add new constraint with all event types including birthday and special
ALTER TABLE events ADD CONSTRAINT events_type_check 
  CHECK (type IN ('date', 'anniversary', 'trip', 'birthday', 'special', 'other'));
