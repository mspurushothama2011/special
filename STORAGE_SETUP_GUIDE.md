# Supabase Storage Setup Guide

## Step 1: Create Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **New bucket**
3. Name: `memories`
4. **Public bucket**: Toggle ON (or use RLS for private)
5. Click **Create bucket**

## Step 2: Set Up Storage Policies

Go to **Storage** → Click on `memories` bucket → **Policies**

### Click "New Policy" and add these 3 policies:

**Policy 1: Allow Upload**
- Name: `Authenticated users can upload`
- Policy command: `INSERT`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'memories'`

**Policy 2: Allow Read**
- Name: `Authenticated users can view`
- Policy command: `SELECT`  
- Target roles: `authenticated`
- USING expression: `bucket_id = 'memories'`

**Policy 3: Allow Delete**
- Name: `Users can delete own photos`
- Policy command: `DELETE`
- Target roles: `authenticated`
- USING expression: `bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text`

## Alternative: Use SQL Editor

```sql
-- Policy for uploading
CREATE POLICY "Authenticated users can upload photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'memories');

-- Policy for viewing
CREATE POLICY "Authenticated users can view photos"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'memories');

-- Policy for deleting (users can delete their own photos)
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'memories' AND (storage.foldername(name))[1] = auth.uid()::text);
```

## Troubleshooting

**Photos reappear after delete?**
- Make sure the `memories` bucket exists
- Verify all 3 policies are active
- Check browser console for errors
- Ensure you ran the storage setup

**Upload not working?**
- Check if bucket is created
- Verify INSERT policy is active
- Check browser console for CORS errors
