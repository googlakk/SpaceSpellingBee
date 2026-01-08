-- Migration: Add 'kokoro' to the allowed tts_provider values
-- Run this in Supabase SQL Editor

-- Step 1: Drop the existing constraint
ALTER TABLE languages DROP CONSTRAINT IF EXISTS languages_tts_provider_check;

-- Step 2: Add the updated constraint with 'kokoro' included
ALTER TABLE languages ADD CONSTRAINT languages_tts_provider_check 
  CHECK (tts_provider IS NULL OR tts_provider IN ('openai', 'elevenlabs', 'kokoro'));

-- Verify the change
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'languages'::regclass
  AND conname = 'languages_tts_provider_check';
