-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read all love notes" ON love_notes;
DROP POLICY IF EXISTS "Users can read their love notes" ON love_notes;
DROP POLICY IF EXISTS "Users can create love notes" ON love_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON love_notes;
DROP POLICY IF EXISTS "Users can reveal notes" ON love_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON love_notes;

-- Drop the table if it exists (WARNING: This deletes all data)
DROP TABLE IF EXISTS love_notes;

-- Create love_notes table
CREATE TABLE love_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_user UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    author_name TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days') NOT NULL,
    revealed_at TIMESTAMPTZ,
    revealed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Create indexes for efficient querying
CREATE INDEX idx_love_notes_expires ON love_notes(expires_at);
CREATE INDEX idx_love_notes_from_user ON love_notes(from_user);
CREATE INDEX idx_love_notes_revealed ON love_notes(revealed_at);

-- Enable Row Level Security
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: All authenticated users can read all notes (shared between couple)
CREATE POLICY "Users can read all love notes"
    ON love_notes FOR SELECT
    USING (auth.role() = 'authenticated');

-- RLS Policy: Users can create notes
CREATE POLICY "Users can create love notes"
    ON love_notes FOR INSERT
    WITH CHECK (from_user = auth.uid());

-- RLS Policy: Users can delete their own notes
CREATE POLICY "Users can delete own notes"
    ON love_notes FOR DELETE
    USING (from_user = auth.uid());

-- RLS Policy: Users can update notes to reveal them
CREATE POLICY "Users can reveal notes"
    ON love_notes FOR UPDATE
    USING (auth.role() = 'authenticated');
