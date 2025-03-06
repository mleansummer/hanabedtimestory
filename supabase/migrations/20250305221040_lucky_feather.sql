/*
  # Create storage bucket for story images

  1. Storage
    - Create 'story-images' bucket for storing story-related images
    - Enable public access for story images
  
  2. Security
    - Add policy for authenticated users to upload images
    - Add policy for public access to view images
*/

-- Create a new storage bucket for story images
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true);

-- Allow authenticated users to upload files to the story-images bucket
CREATE POLICY "Authenticated users can upload story images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-images'
  AND owner = auth.uid()
);

-- Allow public access to view story images
CREATE POLICY "Public can view story images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'story-images');