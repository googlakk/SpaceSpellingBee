-- Switch existing languages and global config to OpenAI announcer-style voice
-- Recommended voice: Onyx (low male)

UPDATE languages
SET
  tts_provider = 'openai',
  voice_id = 'onyx',
  voice_name = 'Onyx',
  voice_settings = jsonb_build_object(
    'model', 'gpt-4o-mini-audio-preview',
    'speed', 0.92,
    'instruction', 'Speak like a professional male announcer with a low, warm, confident tone. Keep the diction crisp, clean, and precise. Sound natural, lively, and studio-quality. Pronounce only the provided word, with no added words or spelling.'
  ),
  updated_at = NOW()
WHERE is_active = true;

UPDATE app_config
SET
  default_voice_id = 'onyx',
  default_voice_name = 'Onyx',
  default_voice_settings = jsonb_build_object(
    'model', 'gpt-4o-mini-audio-preview',
    'speed', 0.92,
    'instruction', 'Speak like a professional male announcer with a low, warm, confident tone. Keep the diction crisp, clean, and precise. Sound natural, lively, and studio-quality. Pronounce only the provided word, with no added words or spelling.'
  ),
  updated_at = NOW();

INSERT INTO app_config (
  default_voice_id,
  default_voice_name,
  default_voice_settings
)
SELECT
  'onyx',
  'Onyx',
  jsonb_build_object(
    'model', 'gpt-4o-mini-audio-preview',
    'speed', 0.92,
    'instruction', 'Speak like a professional male announcer with a low, warm, confident tone. Keep the diction crisp, clean, and precise. Sound natural, lively, and studio-quality. Pronounce only the provided word, with no added words or spelling.'
  )
WHERE NOT EXISTS (SELECT 1 FROM app_config);
