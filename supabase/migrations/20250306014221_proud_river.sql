/*
  # Setup storage for story images

  1. New Storage Buckets
    - story-images: For storing all story-related images
      - Cover images
      - Page illustrations
      - Child photos

  2. Security
    - Enable public access for story images
    - Add storage policies for authenticated users
*/

-- Create bucket for story images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('story-images', 'story-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create upload policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Authenticated users can upload story images'
    ) THEN
        CREATE POLICY "Authenticated users can upload story images"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'story-images');
    END IF;
END $$;

-- Create update policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Users can update their own story images'
    ) THEN
        CREATE POLICY "Users can update their own story images"
        ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = 'story-images' AND owner = auth.uid());
    END IF;
END $$;

-- Create read policy if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects' 
        AND policyname = 'Public can view story images'
    ) THEN
        CREATE POLICY "Public can view story images"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'story-images');
    END IF;
END $$;