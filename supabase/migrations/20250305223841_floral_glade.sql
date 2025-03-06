/*
  # Create storage buckets and policies

  1. New Storage Buckets
    - `story-images` bucket for storing all story-related images
      - With a `temp` folder for temporary image processing
  
  2. Security
    - Enable public access to read images
    - Allow authenticated users to upload and manage their images
    - Allow temporary file uploads in the temp folder
*/

-- Create the story-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to read images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'story-images');

-- Allow authenticated users to insert images
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-images' AND
  (CASE
    WHEN name LIKE 'temp/%'
    THEN true  -- Allow temp uploads
    ELSE auth.uid()::text = split_part(name, '/', 1)  -- User can only upload to their folder
  END)
);

-- Allow authenticated users to update their images
CREATE POLICY "Users can update their images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-images' AND
  auth.uid()::text = split_part(name, '/', 1)
) WITH CHECK (
  bucket_id = 'story-images' AND
  auth.uid()::text = split_part(name, '/', 1)
);

-- Allow authenticated users to delete their images
CREATE POLICY "Users can delete their images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'story-images' AND
  (
    auth.uid()::text = split_part(name, '/', 1) OR  -- User's own files
    name LIKE 'temp/%'  -- Temp files
  )
);