/*
  # Add link_url column to ads table

  1. Changes
    - Add `link_url` column to `ads` table as optional text field
    - This column will store URLs for ads that link to external content

  2. Security
    - No changes to existing RLS policies needed
    - Column inherits existing table security
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ads' AND column_name = 'link_url'
  ) THEN
    ALTER TABLE ads ADD COLUMN link_url text;
  END IF;
END $$;