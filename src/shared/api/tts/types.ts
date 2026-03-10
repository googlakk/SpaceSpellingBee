/**
 * TTS Provider Types and Interfaces
 *
 * This file defines the abstract interfaces for TTS (Text-to-Speech) providers,
 * allowing the application to support multiple TTS services (OpenAI, ElevenLabs, etc.)
 * with a unified interface.
 */

// Provider type enum
export type TTSProviderType = 'openai' | 'elevenlabs' | 'kokoro';

// Voice information interface (common for all providers)
export interface TTSVoice {
  voice_id: string;
  name: string;
  description?: string;
}

// Provider-specific settings types
export interface OpenAITTSSettings {
  model: 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-audio-preview';
  speed: number; // 0.25 to 4.0
  instruction?: string; // For gpt-4o-audio models
}

// ElevenLabs model type
export type ElevenLabsModel = 'eleven_multilingual_v2' | 'eleven_turbo_v2_5' | 'eleven_v3';

// Unified ElevenLabs settings
// style and use_speaker_boost are only used with eleven_multilingual_v2
export interface ElevenLabsTTSSettings {
  model?: ElevenLabsModel;
  stability: number;
  similarity_boost: number;
  style?: number; // v2 only
  use_speaker_boost?: boolean; // v2 only
  speed?: number; // v2.5 / v3
}

// Union type for all provider settings
export type TTSSettings = OpenAITTSSettings | ElevenLabsTTSSettings | KokoroTTSSettings;

// Settings for Kokoro TTS (local)
export interface KokoroTTSSettings {
  speed: number; // 0.5 to 2.0, default 1.0
}

// Configuration for a TTS provider
export interface TTSProviderConfig {
  provider: TTSProviderType;
  voiceId: string; // For Kokoro: 'af_bella', etc.
  voiceName?: string;
  settings: TTSSettings;
}

// Abstract TTS Provider interface
export interface ITTSProvider {
  /**
   * The type of this provider
   */
  readonly type: TTSProviderType;

  /**
   * Generate speech from text
   * @param text - The text to convert to speech
   * @param voiceId - The voice ID to use
   * @param settings - Provider-specific settings
   * @returns Promise<Blob> - Audio data
   */
  generateSpeech(
    text: string,
    voiceId: string,
    settings: TTSSettings
  ): Promise<Blob>;

  /**
   * Get list of available voices for this provider
   * @returns Promise<TTSVoice[]> - List of available voices
   */
  getAvailableVoices(): Promise<TTSVoice[]>;

  /**
   * Validate if the provider is configured and ready to use
   * @returns boolean - True if provider is ready
   */
  isConfigured(): boolean;

  /**
   * Get default settings for this provider
   * @returns TTSSettings - Default settings
   */
  getDefaultSettings(): TTSSettings;

  /**
   * Get default voice ID for this provider
   * @returns string - Default voice ID
   */
  getDefaultVoiceId(): string;
}

// Error types
export class TTSProviderError extends Error {
  constructor(
    message: string,
    public provider: TTSProviderType,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'TTSProviderError';
  }
}

export class TTSProviderNotConfiguredError extends TTSProviderError {
  constructor(provider: TTSProviderType) {
    super(`TTS Provider '${provider}' is not configured`, provider);
    this.name = 'TTSProviderNotConfiguredError';
  }
}
