/*
  # Initial Schema Setup

  1. New Tables
    - `profiles`: User profiles linked to auth.users
    - `children`: Children belonging to profiles
    - `stories`: Stories generated for children

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Ensure proper cascading deletes

  3. Relationships
    - profiles.id references auth.users
    - children.profile_id references profiles
    - stories.child_id references children
*/

-- Create profiles table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username text UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policies for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile"
    ON profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create children table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS children (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid REFERENCES profiles ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    age integer NOT NULL,
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policies for children
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own children"
    ON children
    FOR SELECT
    TO authenticated
    USING (profile_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can insert own children"
    ON children
    FOR INSERT
    TO authenticated
    WITH CHECK (profile_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own children"
    ON children
    FOR UPDATE
    TO authenticated
    USING (profile_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own children"
    ON children
    FOR DELETE
    TO authenticated
    USING (profile_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create stories table if it doesn't exist
DO $$ BEGIN
  CREATE TABLE IF NOT EXISTS stories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id uuid REFERENCES children ON DELETE CASCADE NOT NULL,
    theme text NOT NULL,
    content text NOT NULL,
    image_url text,
    child_photo_url text,
    page_images text[],
    created_at timestamptz DEFAULT now()
  );
EXCEPTION
  WHEN duplicate_table THEN NULL;
END $$;

-- Enable RLS and create policies for stories
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own stories"
    ON stories
    FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM children
        WHERE children.id = child_id
        AND children.profile_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
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
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own stories"
    ON stories
    FOR UPDATE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM children
        WHERE children.id = child_id
        AND children.profile_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete own stories"
    ON stories
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM children
        WHERE children.id = child_id
        AND children.profile_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;