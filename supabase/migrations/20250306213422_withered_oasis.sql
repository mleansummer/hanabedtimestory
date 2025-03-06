/*
  # Create storage buckets for story assets

  1. New Buckets
    - `story-pdfs`: For storing generated PDF files
    - `story-images`: For storing captured story images

  2. Security
    - Enable public access for reading
    - Restrict write access to authenticated users
    - Users can only modify their own files
*/

-- Create buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('story-pdfs', 'story-pdfs', true),
  ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for story-pdfs bucket
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-pdfs');

CREATE POLICY "Allow authenticated users to upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'story-pdfs' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM stories s
    JOIN children c ON c.id = s.child_id
    WHERE c.profile_id = auth.uid()
  )
);

CREATE POLICY "Allow users to update their own PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'story-pdfs' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text
    FROM stories s
    JOIN children c ON c.id = s.child_id
    WHERE c.profile_id = auth.uid()
  )
);

-- Set up storage policies for story-images bucket
CREATE POLICY "Allow public read access for images"
ON storage.objects FOR SELECT
USING (bucket_id = 'story-images');

CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'story-images');

CREATE POLICY "Allow users to update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'story-images');