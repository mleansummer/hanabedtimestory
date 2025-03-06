/*
  # Add page images array to stories table

  1. Changes
    - Add `page_images` column to store an array of image URLs for each page of the story

  2. Notes
    - Using text[] to store multiple image URLs
    - Each index corresponds to a page in the story
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stories' AND column_name = 'page_images'
  ) THEN
    ALTER TABLE stories ADD COLUMN page_images text[];
  END IF;
END $$;