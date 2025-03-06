/*
  # Add page_images column to stories table

  1. Changes
    - Add `page_images` column to `stories` table to store generated page images
    - Column type is text[] to store an array of image URLs
    - Nullable to maintain compatibility with existing stories
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' 
    AND column_name = 'page_images'
  ) THEN
    ALTER TABLE stories ADD COLUMN page_images text[];
  END IF;
END $$;