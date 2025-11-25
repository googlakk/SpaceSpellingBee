/**
 * OpenAI TTS Provider Implementation
 *
 * Implements the ITTSProvider interface for OpenAI's Text-to-Speech API.
 * Supports high-quality voice synthesis with multiple voices and customizable settings.
 */

import {
  ITTSProvider,
  TTSProviderType,
  TTSVoice,
  TTSSettings,
  OpenAITTSSettings,
  TTSProviderError,
  TTSProviderNotConfiguredError,
} from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/audio/speech';

// Available OpenAI voices
const AVAILABLE_VOICES: TTSVoice[] = [
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

// Default settings
const DEFAULT_SETTINGS: OpenAITTSSettings = {
  model: 'tts-1-hd',
  speed: 0.85,
};

const DEFAULT_VOICE_ID = 'onyx';

export class OpenAITTSProvider implements ITTSProvider {
  readonly type: TTSProviderType = 'openai';

  isConfigured(): boolean {
    return !!OPENAI_API_KEY;
  }

  getDefaultSettings(): OpenAITTSSettings {
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
      throw new TTSProviderNotConfiguredError('openai');
    }

    const openAISettings = settings as OpenAITTSSettings;

    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: openAISettings.model,
          input: text,
          voice: voiceId,
          speed: openAISettings.speed,
          response_format: 'mp3',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      return await response.blob();
    } catch (error) {
      throw new TTSProviderError(
        `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'openai',
        error instanceof Error ? error : undefined
      );
    }
  }

  async getAvailableVoices(): Promise<TTSVoice[]> {
    // OpenAI has a fixed set of voices
    return [...AVAILABLE_VOICES];
  }

  /**
   * Validate if a voice ID is valid for OpenAI
   */
  isValidVoice(voiceId: string): boolean {
    return AVAILABLE_VOICES.some(voice => voice.voice_id === voiceId);
  }

  /**
   * Normalize settings from various formats to OpenAI format
   */
  normalizeSettings(settings: any): OpenAITTSSettings {
    if (!settings || typeof settings !== 'object') {
      return { ...DEFAULT_SETTINGS };
    }

    // If already in OpenAI format
    if (settings.model && settings.speed !== undefined) {
      return {
        model: (settings.model === 'tts-1' || settings.model === 'tts-1-hd')
          ? settings.model
          : DEFAULT_SETTINGS.model,
        speed: typeof settings.speed === 'number'
          ? Math.max(0.25, Math.min(4.0, settings.speed))
          : DEFAULT_SETTINGS.speed,
      };
    }

    // Return defaults for invalid data
    return { ...DEFAULT_SETTINGS };
  }
}
