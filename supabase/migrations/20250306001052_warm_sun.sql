/*
  # Add page images array to stories table

  1. Changes
    - Add page_images column to stories table to store generated images
    - Column type is text[] to store an array of image URLs

  2. Notes
    - This allows us to save generated images for each story page
    - Images will be reused when viewing the story again
*/

ALTER TABLE stories ADD COLUMN IF NOT EXISTS page_images text[];