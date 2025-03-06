/*
  # Create storage bucket and policies for story images

  1. Storage Setup
    - Creates a public bucket named 'story-images' if it doesn't exist
    - Enables public access for reading images
    - Restricts write access to authenticated users only

  2. Security Policies
    - Adds policies for authenticated users to upload images
    - Adds policy for public read access
    - Adds policies for users to manage their own files
*/

-- Create the storage bucket if it doesn't exist
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('story-images', 'story-images', true)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Create policy to allow authenticated users to upload files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Authenticated users can upload images'
  ) THEN
    CREATE POLICY "Authenticated users can upload images"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'story-images' AND
      (LOWER(storage.filename(name)) LIKE '%.jpg' OR
       LOWER(storage.filename(name)) LIKE '%.jpeg' OR
       LOWER(storage.filename(name)) LIKE '%.png')
    );
  END IF;
END $$;

-- Create policy to allow public read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Public read access'
  ) THEN
    CREATE POLICY "Public read access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'story-images');
  END IF;
END $$;

-- Create policy to allow authenticated users to delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can delete own files'
  ) THEN
    CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'story-images' AND auth.uid() = owner);
  END IF;
END $$;

-- Create policy to allow authenticated users to update their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Users can update own files'
  ) THEN
    CREATE POLICY "Users can update own files"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'story-images' AND auth.uid() = owner);
  END IF;
END $$;