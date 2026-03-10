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
  speed: 1.0,
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
    const isGptAudio = openAISettings.model.includes('gpt-4o');
    const apiUrl = isGptAudio ? 'https://api.openai.com/v1/chat/completions' : OPENAI_API_URL;

    try {
      let body;

      if (isGptAudio) {
        // Chat Completions API for new Audio Models
        body = {
          model: openAISettings.model,
          modalities: ["text", "audio"],
          audio: {
            voice: voiceId,
            format: "wav"
          },
          messages: [
            {
              role: "system",
              content: `You are a professional voice talent recording a vocabulary list for a dictionary application. 
Speak with a natural, clear, and confident human voice.
Your task is to pronounce the word provided by the user beautifully and naturally.

CRITICAL RULES:
1. ONLY speak the exact word provided. 
2. DO NOT add any extra words, conversational filler, greetings, or explanations (e.g., do not say "The word is").
3. DO NOT spell the word out by its letters. Pronounce it as a whole word.
${openAISettings.instruction ? '\nADDITIONAL INSTRUCTIONS:\n' + openAISettings.instruction : ''}`
            },
            {
              role: "user",
              content: text
            }
          ]
        };
      } else {
        // Standard TTS API 
        // Output as WAV for uncompressed cleaner audio.
        body = {
          model: openAISettings.model,
          input: text,
          voice: voiceId,
          speed: openAISettings.speed,
          response_format: 'wav',
        };
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      if (isGptAudio) {
        // Extract base64 audio data from chat completion response and convert to Blob
        const data = await response.json();
        const base64Audio = data.choices[0]?.message?.audio?.data;
        if (!base64Audio) {
          throw new Error('No audio data received from GPT-4o audio API');
        }

        // Convert base64 to Blob
        const byteCharacters = atob(base64Audio);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: 'audio/wav' });
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

    // Determine target model
    let model = DEFAULT_SETTINGS.model;
    if (['tts-1', 'tts-1-hd', 'gpt-4o-mini-audio-preview'].includes(settings.model)) {
      model = settings.model;
    }

    return {
      model,
      speed: typeof settings.speed === 'number'
        ? Math.max(0.25, Math.min(4.0, settings.speed))
        : DEFAULT_SETTINGS.speed,
      instruction: typeof settings.instruction === 'string'
        ? settings.instruction
        : undefined,
    };
  }
}
