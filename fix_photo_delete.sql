-- Add DELETE policy for photos table
-- Run this in Supabase SQL Editor:

-- Allow authenticated users to delete photos
CREATE POLICY "Photos are deletable by auth users" 
ON photos FOR DELETE 
TO authenticated 
USING (true);

-- If you want users to only delete their own photos:
-- CREATE POLICY "Users can delete own photos" 
-- ON photos FOR DELETE 
-- TO authenticated 
-- USING (uploaded_by = auth.uid());
