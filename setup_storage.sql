-- Create storage bucket for photos in Supabase Dashboard
-- Go to Storage → Create a new bucket

-- Bucket name: memories
-- Public: Yes (or use RLS policies for private)

-- Then run these policies in SQL Editor:

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'memories');

-- Allow authenticated users to read photos
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'memories');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'memories' AND owner = auth.uid());
