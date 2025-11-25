-- Migration: Add TTS Provider Support to Languages Table
--
-- This migration adds flexible TTS provider support to the languages table,
-- allowing different languages to use different TTS services (OpenAI, ElevenLabs, etc.)

-- Step 1: Add tts_provider column
-- This column stores which TTS provider to use for this language
ALTER TABLE languages
ADD COLUMN IF NOT EXISTS tts_provider TEXT
CHECK (tts_provider IN ('openai', 'elevenlabs'));

-- Step 2: Set default provider for existing languages to 'openai'
-- You can change this to 'elevenlabs' if you prefer
UPDATE languages
SET tts_provider = 'openai'
WHERE tts_provider IS NULL;

-- Step 3: Update voice_settings column type if needed
-- The voice_settings column should support flexible JSON for any provider
-- (This is already JSONB in most cases, but we're making it explicit)
-- Note: If your column is already JSONB, this won't do anything

-- Step 4: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_languages_tts_provider
ON languages(tts_provider);

-- Step 5: Add comments for documentation
COMMENT ON COLUMN languages.tts_provider IS
'TTS provider to use for this language: openai or elevenlabs';

COMMENT ON COLUMN languages.voice_settings IS
'Provider-specific settings stored as JSON. Format depends on tts_provider value.';

-- ============================================================================
-- Migration Notes:
-- ============================================================================
--
-- 1. Backward Compatibility:
--    - Existing rows will default to 'openai' provider
--    - voice_settings remains flexible JSONB to support any provider format
--
-- 2. OpenAI Settings Format:
--    {
--      "model": "tts-1-hd",
--      "speed": 0.85
--    }
--
-- 3. ElevenLabs Settings Format:
--    {
--      "stability": 0.5,
--      "similarity_boost": 0.75,
--      "style": 0.0,
--      "use_speaker_boost": true
--    }
--
-- 4. To change a language to use ElevenLabs:
--    UPDATE languages
--    SET
--      tts_provider = 'elevenlabs',
--      voice_id = 'your_elevenlabs_voice_id',
--      voice_settings = '{"stability": 0.5, "similarity_boost": 0.75, "style": 0.0, "use_speaker_boost": true}'
--    WHERE code = 'en';
--
-- 5. To change a language to use OpenAI:
--    UPDATE languages
--    SET
--      tts_provider = 'openai',
--      voice_id = 'onyx',
--      voice_settings = '{"model": "tts-1-hd", "speed": 0.85}'
--    WHERE code = 'en';
--
-- ============================================================================

-- Optional: Sample data update for English language with OpenAI
-- Uncomment if you want to apply this automatically
/*
UPDATE languages
SET
  tts_provider = 'openai',
  voice_id = 'onyx',
  voice_name = 'Onyx',
  voice_settings = '{"model": "tts-1-hd", "speed": 0.85}'::jsonb
WHERE code = 'en';
*/
