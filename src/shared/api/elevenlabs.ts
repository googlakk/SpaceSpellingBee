const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
}

// Default voice settings для Eleven v3 (alpha)
const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  stability: 0.5, // Natural режим
  similarity_boost: 0.75,
};

// Default voice ID - used as fallback
const DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

export async function generateSpeech(
  text: string,
  voiceId?: string,
  voiceSettings?: VoiceSettings
): Promise<Blob> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is not configured');
  }

  const finalVoiceId = voiceId || DEFAULT_VOICE_ID;
  const finalSettings = voiceSettings || DEFAULT_VOICE_SETTINGS;

  const response = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${finalVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_v3',
        voice_settings: finalSettings,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`ElevenLabs API error: ${error}`);
  }

  return await response.blob();
}

export async function getAvailableVoices(): Promise<ElevenLabsVoice[]> {
  if (!ELEVENLABS_API_KEY) {
    throw new Error('ElevenLabs API key is not configured');
  }

  const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
    headers: {
      'xi-api-key': ELEVENLABS_API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch voices');
  }

  const data = await response.json();
  return data.voices;
}
