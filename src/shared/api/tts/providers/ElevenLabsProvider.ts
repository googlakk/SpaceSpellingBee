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
  ElevenLabsModel,
  TTSProviderError,
  TTSProviderNotConfiguredError,
} from '../types';

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

// Default settings для ElevenLabs
const DEFAULT_SETTINGS: ElevenLabsTTSSettings = {
  model: 'eleven_v3',
  stability: 0.5, // Natural режим (сбалансированный)
  similarity_boost: 0.75, // Высокая четкость для образовательного контента
  style: 0.0, // Neutral (used only for v2)
  use_speaker_boost: true, // (used only for v2)
};

// Default voice ID
const DEFAULT_VOICE_ID = 'nPczCjzI2devNBz1zQrb';

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
    console.log('🎬 ElevenLabs generateSpeech called');
    console.log('📝 Text:', text);
    console.log('🎙️ Voice ID:', voiceId);
    console.log('⚙️ Settings:', settings);

    if (!this.isConfigured()) {
      console.error('❌ ElevenLabs not configured!');
      throw new TTSProviderNotConfiguredError('elevenlabs');
    }

    const elevenLabsSettings = settings as ElevenLabsTTSSettings;
    const modelId: ElevenLabsModel = elevenLabsSettings.model || 'eleven_v3';

    // For short texts (single words), prevent ElevenLabs from hallucinating extra content
    // and slow down pronunciation for clarity
    const wordCount = text.trim().split(/\s+/).length;
    const isSingleWord = wordCount <= 2;
    const trimmedWord = text.trim();

    // Use turbo v2.5 by default for single words as it hallucinates less, unless it's explicitly v3
    let resolvedModelId = modelId;
    if (isSingleWord && modelId !== 'eleven_v3') {
      resolvedModelId = 'eleven_turbo_v2_5';
    }
    const isV2 = resolvedModelId === 'eleven_multilingual_v2' || resolvedModelId === 'eleven_turbo_v2_5';

    // Add punctuation and pause to signal the end of the phrase
    const preparedText = isSingleWord
      ? `"${trimmedWord}".`
      : text;

    try {
      const voiceSettings: Record<string, any> = {
        // High stability (0.8-1.0) makes voice more monotonous and strict to the text
        stability: isSingleWord ? 0.85 : elevenLabsSettings.stability,
        // Keep similarity around 0.75, higher values add noise for short words
        similarity_boost: isSingleWord ? 0.75 : elevenLabsSettings.similarity_boost,
      };

      if (isV2) {
        // Zero style exaggeration for neutral, clean pronunciation without extra artifacts
        voiceSettings.style = isSingleWord ? 0.0 : (elevenLabsSettings.style ?? 0.0);
        voiceSettings.use_speaker_boost = elevenLabsSettings.use_speaker_boost ?? true;
        // Adjust speed if available (speed is sometimes supported in v2/turbo)
        if (isSingleWord) {
          voiceSettings.speed = 0.85;
        }
      }

      const requestBody: Record<string, any> = {
        text: preparedText,
        model_id: resolvedModelId,
        voice_settings: voiceSettings,
        // Disable text normalization — prevents the model from expanding/interpreting the text
        apply_text_normalization: isSingleWord ? 'off' : 'auto',
      };

      if (isV2 && isSingleWord) {
        // previous_text / next_text give v2 context about what comes before/after
        // Empty strings signal this is an isolated utterance — no surrounding context
        requestBody.previous_text = ' ';
        requestBody.next_text = ' ';
      }

      // language_code only for v3
      if (!isV2) {
        requestBody.language_code = 'en';
      }

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
