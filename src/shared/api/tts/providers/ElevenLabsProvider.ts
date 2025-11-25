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

// Default settings
const DEFAULT_SETTINGS: ElevenLabsTTSSettings = {
  stability: 0.5,
  similarity_boost: 0.75,
  style: 0.0,
  use_speaker_boost: true,
};

// Default voice ID (Sarah)
const DEFAULT_VOICE_ID = 'n1PvBOwxb8X6m7tahp2h';

export class ElevenLabsTTSProvider implements ITTSProvider {
  readonly type: TTSProviderType = 'elevenlabs';

  isConfigured(): boolean {
    return !!ELEVENLABS_API_KEY;
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
    if (!this.isConfigured()) {
      throw new TTSProviderNotConfiguredError('elevenlabs');
    }

    const elevenLabsSettings = settings as ElevenLabsTTSSettings;

    try {
      const response = await fetch(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': ELEVENLABS_API_KEY!,
          },
          body: JSON.stringify({
            text,
            model_id: 'eleven_multilingual_v2',
            voice_settings: elevenLabsSettings,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      throw new TTSProviderError(
        `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'elevenlabs',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    if (!this.isConfigured()) {
      throw new TTSProviderNotConfiguredError('elevenlabs');
    }

    try {
      const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY!,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch voices: ${response.status}`);
      }

      const data = await response.json();

      // Transform ElevenLabs voice format to our common format
      return data.voices.map((voice: any) => ({
        voice_id: voice.voice_id,
        name: voice.name,
        description: voice.description || voice.labels?.description || '',
      }));
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
