-- Add missing DELETE policy for events table
-- This allows authenticated users to delete events

CREATE POLICY "Events are deletable by auth users" 
  ON events 
  FOR DELETE 
  TO authenticated 
  USING (true);
