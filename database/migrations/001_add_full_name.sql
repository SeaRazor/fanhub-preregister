-- Migration: Add full_name column to registrations table
-- This migration adds support for storing user full names

-- Add full_name column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'registrations' 
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE registrations ADD COLUMN full_name VARCHAR(255);
    
    -- For existing records without full_name, set a default value
    -- This should be temporary as we'll require full_name going forward
    UPDATE registrations SET full_name = 'User' WHERE full_name IS NULL;
    
    -- Now make the column NOT NULL
    ALTER TABLE registrations ALTER COLUMN full_name SET NOT NULL;
    
    RAISE NOTICE 'Added full_name column to registrations table';
  ELSE
    RAISE NOTICE 'full_name column already exists in registrations table';
  END IF;
END $$;