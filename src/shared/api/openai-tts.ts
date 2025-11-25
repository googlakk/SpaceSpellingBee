const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/speech';

export interface OpenAIVoice {
  voice_id: string;
  name: string;
  description: string;
}

export interface TTSSettings {
  model: 'tts-1' | 'tts-1-hd';
  speed: number; // 0.25 to 4.0, default 1.0
}

// Available OpenAI voices with descriptions
export const AVAILABLE_VOICES: OpenAIVoice[] = [
  {
    voice_id: 'onyx',
    name: 'Onyx',
    description: 'Professional male voice with gravitas - ideal for clear narration',
  },
  {
    voice_id: 'echo',
    name: 'Echo',
    description: 'Male voice with authority',
  },
  {
    voice_id: 'alloy',
    name: 'Alloy',
    description: 'Neutral voice',
  },
  {
    voice_id: 'fable',
    name: 'Fable',
    description: 'Expressive male voice',
  },
  {
    voice_id: 'nova',
    name: 'Nova',
    description: 'Energetic female voice',
  },
  {
    voice_id: 'shimmer',
    name: 'Shimmer',
    description: 'Warm female voice',
  },
];

// Default settings for professional, clear narration
const DEFAULT_TTS_SETTINGS: TTSSettings = {
  model: 'tts-1-hd', // High quality model
  speed: 0.85, // Slightly slower for clear pronunciation
};

// Default voice - Onyx (professional male narrator)
const DEFAULT_VOICE_ID = 'onyx';

/**
 * Generates speech audio from text using OpenAI TTS API
 * @param text - The text to convert to speech
 * @param voiceId - Voice to use (default: 'onyx' - professional male narrator)
 * @param settings - TTS settings (model and speed)
 * @returns Promise<Blob> - Audio data as MP3
 */
export async function generateSpeech(
  text: string,
  voiceId?: string,
  settings?: Partial<TTSSettings>
): Promise<Blob> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured');
  }

  const finalVoiceId = voiceId || DEFAULT_VOICE_ID;
  const finalSettings = { ...DEFAULT_TTS_SETTINGS, ...settings };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: finalSettings.model,
        input: text,
        voice: finalVoiceId,
        speed: finalSettings.speed,
        response_format: 'mp3',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI TTS API error: ${response.status} - ${errorText}`);
    }

    // OpenAI returns audio data directly as blob
    const audioBlob = await response.blob();
    return audioBlob;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate speech: ${error.message}`);
    }
    throw new Error('Failed to generate speech: Unknown error');
  }
}

/**
 * Returns list of available voices
 * Note: OpenAI has a fixed set of voices, no API call needed
 */
export async function getAvailableVoices(): Promise<OpenAIVoice[]> {
  return AVAILABLE_VOICES;
}

/**
 * Validates if a voice ID is valid
 */
export function isValidVoice(voiceId: string): boolean {
  return AVAILABLE_VOICES.some(voice => voice.voice_id === voiceId);
}

/**
 * Normalizes voice settings from database to ensure compatibility
 * Handles migration from old ElevenLabs format to new OpenAI TTS format
 */
export function normalizeVoiceSettings(settings: any): TTSSettings {
  if (!settings || typeof settings !== 'object') {
    return DEFAULT_TTS_SETTINGS;
  }

  // Check if it's already in OpenAI format
  if (settings.model && settings.speed !== undefined) {
    return {
      model: (settings.model === 'tts-1' || settings.model === 'tts-1-hd')
        ? settings.model
        : DEFAULT_TTS_SETTINGS.model,
      speed: typeof settings.speed === 'number' ? settings.speed : DEFAULT_TTS_SETTINGS.speed,
    };
  }

  // Return defaults for old ElevenLabs format or invalid data
  return DEFAULT_TTS_SETTINGS;
}
