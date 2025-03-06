/*
  # Create storage buckets and policies

  1. Storage Buckets
    - `story-pdfs`: For storing generated PDF files
    - `story-images`: For storing story images and illustrations

  2. Security
    - Enable public read access for both buckets
    - Allow authenticated users to manage their own files
    - Set up proper RLS policies for file access
*/

-- Create storage buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('story-pdfs', 'story-pdfs', true),
  ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for story-pdfs bucket
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access for PDFs" ON storage.objects;
  CREATE POLICY "Allow public read access for PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-pdfs');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to upload PDFs" ON storage.objects;
  CREATE POLICY "Allow authenticated users to upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'story-pdfs' AND
    (storage.foldername(name))[1] IN (
      SELECT stories.id::text
      FROM stories
      JOIN children ON children.id = stories.child_id
      WHERE children.profile_id = auth.uid()
    )
  );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow users to update their own PDFs" ON storage.objects;
  CREATE POLICY "Allow users to update their own PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'story-pdfs' AND
    (storage.foldername(name))[1] IN (
      SELECT stories.id::text
      FROM stories
      JOIN children ON children.id = stories.child_id
      WHERE children.profile_id = auth.uid()
    )
  );
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

-- Set up storage policies for story-images bucket
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow public read access for images" ON storage.objects;
  CREATE POLICY "Allow public read access for images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
  CREATE POLICY "Allow authenticated users to upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'story-images');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow users to update their own images" ON storage.objects;
  CREATE POLICY "Allow users to update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'story-images');
EXCEPTION WHEN undefined_object THEN NULL;
END $$;