/**
 * ElevenLabs TTS Provider Implementation
 *
 * Implements the ITTSProvider interface for ElevenLabs Text-to-Speech API.
 * Supports high-quality, natural-sounding voice synthesis with extensive customization.
 */

import {
  ITTSProvider,
  TTSProviderType,
  TTSVoice,
  TTSSettings,
  ElevenLabsTTSSettings,
  TTSProviderError,
  TTSProviderNotConfiguredError,
} from '../types';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default settings для Eleven v3 (alpha)
const DEFAULT_SETTINGS: ElevenLabsTTSSettings = {
  stability: 0.5, // Natural режим (сбалансированный)
  similarity_boost: 0.75, // Высокая четкость для образовательного контента
};

// Default voice ID
const DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

export class ElevenLabsTTSProvider implements ITTSProvider {
  readonly type: TTSProviderType = 'elevenlabs';

  isConfigured(): boolean {
    const isConfigured = !!ELEVENLABS_API_KEY;
    console.log('🔧 ElevenLabs isConfigured:', isConfigured);
    console.log('🔑 API Key present:', ELEVENLABS_API_KEY ? `Yes (${ELEVENLABS_API_KEY.substring(0, 10)}...)` : 'No');
    return isConfigured;
  }

  getDefaultSettings(): ElevenLabsTTSSettings {
    return { ...DEFAULT_SETTINGS };
  }

  getDefaultVoiceId(): string {
    return DEFAULT_VOICE_ID;
  }

  async generateSpeech(
    text: string,
    voiceId: string,
    settings: TTSSettings
  ): Promise<Blob> {
    console.log('🎬 ElevenLabs generateSpeech called');
    console.log('📝 Text:', text);
    console.log('🎙️ Voice ID:', voiceId);
    console.log('⚙️ Settings:', settings);

    if (!this.isConfigured()) {
      console.error('❌ ElevenLabs not configured!');
      throw new TTSProviderNotConfiguredError('elevenlabs');
    }

    const elevenLabsSettings = settings as ElevenLabsTTSSettings;

    try {
      const requestBody = {
        text,
        model_id: 'eleven_v3', // Используем Eleven v3 (alpha)
        voice_settings: {
          stability: elevenLabsSettings.stability,
          similarity_boost: elevenLabsSettings.similarity_boost,
          // v3 НЕ поддерживает style и use_speaker_boost
        },
        language_code: 'en', // Английский язык (ISO 639-1)
        // НЕ используем apply_text_normalization для v3
      };

      console.log('📤 Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log('📥 TTS Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TTS API error:', response.status, errorText);
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      console.log('✅ Audio generated:', blob.size, 'bytes');
      return blob;
    } catch (error) {
      throw new TTSProviderError(
        `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'elevenlabs',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    console.log('🎤 ElevenLabs getAvailableVoices called');

    if (!this.isConfigured()) {
      console.error('❌ ElevenLabs not configured!');
      throw new TTSProviderNotConfiguredError('elevenlabs');
    }

    try {
      console.log('📡 Fetching voices from:', `${ELEVENLABS_API_URL}/voices`);
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
      });

      console.log('📥 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch voices:', response.status, errorText);
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Voices loaded:', data.voices?.length || 0);

      // Transform ElevenLabs voice format to our common format
      const voices = data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        description: voice.description || voice.labels?.description || '',
      }));

      console.log('🎙️ Transformed voices:', voices.map((v: any) => v.name).join(', '));
      return voices;
    } catch (error) {
      throw new TTSProviderError(
        `Failed to get available voices: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'elevenlabs',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Normalize settings from various formats to ElevenLabs format
   */
  normalizeSettings(settings: any): ElevenLabsTTSSettings {
    if (!settings || typeof settings !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    // If already in ElevenLabs format
    if (
      settings.stability !== undefined ||
      settings.similarity_boost !== undefined
    ) {
      return {
        stability:
          typeof settings.stability === 'number'
            ? Math.max(0, Math.min(1, settings.stability))
            : DEFAULT_SETTINGS.stability,
        similarity_boost:
          typeof settings.similarity_boost === 'number'
            ? Math.max(0, Math.min(1, settings.similarity_boost))
            : DEFAULT_SETTINGS.similarity_boost,
        style:
          typeof settings.style === 'number'
            ? Math.max(0, Math.min(1, settings.style))
            : DEFAULT_SETTINGS.style,
        use_speaker_boost:
          typeof settings.use_speaker_boost === 'boolean'
            ? settings.use_speaker_boost
            : DEFAULT_SETTINGS.use_speaker_boost,
      };
    }

    // Return defaults for invalid data
    return { ...DEFAULT_SETTINGS };
  }
}
