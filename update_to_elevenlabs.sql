-- Update all languages to use ElevenLabs provider
-- This will switch from OpenAI to ElevenLabs for TTS

-- Update languages table to use ElevenLabs provider and default voice
UPDATE languages
SET
  tts_provider = 'elevenlabs',
  voice_id = 'nPczCjzI2devNBz1zQrb',  -- Your selected ElevenLabs voice
  voice_settings = jsonb_build_object(
    'stability', 0.54,
    'similarity_boost', 0.47,
    'style', 0.47,
    'use_speaker_boost', true
  )
WHERE tts_provider IS NULL OR tts_provider = 'openai';

-- Check the results
SELECT
  id,
  name,
  tts_provider,
  voice_id,
  voice_settings
FROM languages
ORDER BY name;
