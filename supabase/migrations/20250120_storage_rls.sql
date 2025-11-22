-- Add RLS policies for storage buckets

-- Note: RLS on storage.objects is already enabled by Supabase
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy for business-logos bucket - Allow authenticated users to upload
DROP POLICY IF EXISTS "Users can view all logos" ON storage.objects;
CREATE POLICY "Users can view all logos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'business-logos');

DROP POLICY IF EXISTS "Users can upload logos" ON storage.objects;
CREATE POLICY "Users can upload logos" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'business-logos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own logos" ON storage.objects;
CREATE POLICY "Users can update their own logos" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'business-logos'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete their own logos" ON storage.objects;
CREATE POLICY "Users can delete their own logos" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'business-logos'
    AND auth.role() = 'authenticated'
  );

-- Policy for background-music bucket - Allow authenticated users to upload
DROP POLICY IF EXISTS "Users can view all music" ON storage.objects;
CREATE POLICY "Users can view all music" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'background-music');

DROP POLICY IF EXISTS "Users can upload music" ON storage.objects;
CREATE POLICY "Users can upload music" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'background-music'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can update their own music" ON storage.objects;
CREATE POLICY "Users can update their own music" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'background-music'
    AND auth.role() = 'authenticated'
  );

DROP POLICY IF EXISTS "Users can delete their own music" ON storage.objects;
CREATE POLICY "Users can delete their own music" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'background-music'
    AND auth.role() = 'authenticated'
  );
