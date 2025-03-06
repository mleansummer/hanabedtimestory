/*
  # Add photo columns to stories table

  1. Changes
    - Add `child_photo_url` column to store the uploaded child's photo
    - Add `page_images` column to store an array of generated story page images

  2. Notes
    - Both columns are nullable since they might not always be needed
    - Using text[] for page_images to store multiple image URLs
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'child_photo_url'
  ) THEN
    ALTER TABLE stories ADD COLUMN child_photo_url text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'page_images'
  ) THEN
    ALTER TABLE stories ADD COLUMN page_images text[];
  END IF;
END $$;