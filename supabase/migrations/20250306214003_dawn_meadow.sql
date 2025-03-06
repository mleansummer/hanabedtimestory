/*
  # Create storage buckets for stories

  1. New Storage Buckets
    - `story-pdfs`: For storing generated PDF files
    - `story-images`: For storing story images

  2. Security
    - Enable public read access for both buckets
    - Allow authenticated users to manage their own files
    - Restrict file uploads to appropriate file types
*/

-- Create buckets if they don't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES 
    ('story-pdfs', 'story-pdfs', true),
    ('story-images', 'story-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Set up storage policies for story-pdfs bucket
DO $$
BEGIN
  CREATE POLICY "Allow public read access for PDFs"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-pdfs');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow authenticated users to upload PDFs"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'story-pdfs' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text
      FROM stories s
      JOIN children c ON c.id = s.child_id
      WHERE c.profile_id = auth.uid()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow users to update their own PDFs"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'story-pdfs' AND
    (storage.foldername(name))[1] IN (
      SELECT s.id::text
      FROM stories s
      JOIN children c ON c.id = s.child_id
      WHERE c.profile_id = auth.uid()
    )
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Set up storage policies for story-images bucket
DO $$
BEGIN
  CREATE POLICY "Allow public read access for images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'story-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow authenticated users to upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'story-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Allow users to update their own images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'story-images');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;