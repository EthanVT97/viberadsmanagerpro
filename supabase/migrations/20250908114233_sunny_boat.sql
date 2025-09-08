/*
  # Create storage buckets for campaign media

  1. Storage Buckets
    - `campaign-images` - For storing campaign image assets
    - `campaign-videos` - For storing campaign video assets

  2. Security
    - Enable RLS on storage buckets
    - Add policies for authenticated users to manage their own files
    - Set up proper file size and type restrictions
*/

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  (
    'campaign-images',
    'campaign-images',
    true,
    5242880, -- 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'campaign-videos',
    'campaign-videos', 
    true,
    52428800, -- 50MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo']
  )
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for campaign-images bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own campaign images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can view their own campaign images"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can update their own campaign images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own campaign images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campaign-images' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Create policies for campaign-videos bucket
CREATE POLICY IF NOT EXISTS "Users can upload their own campaign videos"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'campaign-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can view their own campaign videos"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'campaign-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can update their own campaign videos"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'campaign-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY IF NOT EXISTS "Users can delete their own campaign videos"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'campaign-videos' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public access to view files (for displaying ads)
CREATE POLICY IF NOT EXISTS "Public can view campaign images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campaign-images');

CREATE POLICY IF NOT EXISTS "Public can view campaign videos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'campaign-videos');