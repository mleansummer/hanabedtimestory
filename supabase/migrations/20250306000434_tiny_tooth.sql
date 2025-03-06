/*
  # Add page images to stories table

  1. Changes
    - Add `page_images` column to stories table to store an array of image URLs
    - This allows us to save generated images for each page of the story

  2. Notes
    - Using text[] to store image URLs
    - Maintains existing RLS policies
*/

ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS page_images text[];