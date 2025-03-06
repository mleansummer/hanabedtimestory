/*
  # Add PDF fields to stories table

  1. Changes
    - Add `pdf_url` column to store the URL of the generated PDF
    - Add `has_pdf` column to track if a PDF has been generated
*/

ALTER TABLE stories
ADD COLUMN pdf_url text,
ADD COLUMN has_pdf boolean DEFAULT false;