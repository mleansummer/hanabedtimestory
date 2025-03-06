/*
  # Update stories table structure for enhanced content

  1. Changes
    - Add `paragraphs` column to store structured story content
    - Add `reading_time` column to track estimated reading duration
    - Add validation trigger for paragraph structure

  2. New Structure
    - paragraphs: Array of objects containing:
      - text: The paragraph content
      - page_number: Order in the story
      - image_url: URL of the generated image
    - reading_time: Integer (seconds) for estimated reading duration
*/

-- Add new columns for structured content
ALTER TABLE stories 
ADD COLUMN IF NOT EXISTS paragraphs JSONB[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS reading_time INTEGER DEFAULT 300; -- 5 minutes in seconds

-- Create a function to validate paragraph structure
CREATE OR REPLACE FUNCTION validate_paragraph_structure()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if each paragraph has required fields
  IF NOT (
    SELECT bool_and(
      (p->>'text' IS NOT NULL) AND
      (p->>'page_number' IS NOT NULL)
    )
    FROM unnest(NEW.paragraphs) AS p
  ) THEN
    RAISE EXCEPTION 'Invalid paragraph structure';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to validate paragraphs before insert/update
DROP TRIGGER IF EXISTS validate_paragraphs ON stories;
CREATE TRIGGER validate_paragraphs
  BEFORE INSERT OR UPDATE ON stories
  FOR EACH ROW
  EXECUTE FUNCTION validate_paragraph_structure();

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Attempt to drop existing policies
  BEGIN
    DROP POLICY IF EXISTS "Users can read own stories" ON stories;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can insert own stories" ON stories;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
  
  BEGIN
    DROP POLICY IF EXISTS "Users can update own stories" ON stories;
  EXCEPTION
    WHEN undefined_object THEN
      NULL;
  END;
END $$;

-- Enable RLS
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can read own stories"
  ON stories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = stories.child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own stories"
  ON stories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.profile_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own stories"
  ON stories
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = stories.child_id
      AND children.profile_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM children
      WHERE children.id = child_id
      AND children.profile_id = auth.uid()
    )
  );