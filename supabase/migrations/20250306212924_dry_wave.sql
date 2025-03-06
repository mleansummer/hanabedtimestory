/*
  # Add PDF fields to stories table

  1. Changes
    - Add `pdf_url` column to store the URL of the generated PDF
    - Add `has_pdf` column to track if a PDF has been generated
    - Add appropriate RLS policies for the new columns

  2. Security
    - Update RLS policies to allow authenticated users to access their own PDFs
*/

-- Add new columns
ALTER TABLE stories
ADD COLUMN IF NOT EXISTS pdf_url text,
ADD COLUMN IF NOT EXISTS has_pdf boolean DEFAULT false;

-- Update RLS policies to include new columns
CREATE POLICY "Users can update pdf fields for their own stories"
ON stories
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM children
    WHERE children.id = stories.child_id
    AND children.profile_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM children
    WHERE children.id = stories.child_id
    AND children.profile_id = auth.uid()
  )
);