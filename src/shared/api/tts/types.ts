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
  model: 'tts-1' | 'tts-1-hd';
  speed: number; // 0.25 to 4.0
}

// Настройки для Eleven Multilingual v2
export interface ElevenLabsV2TTSSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

// Настройки для Eleven v3 (alpha) - более простая структура
export interface ElevenLabsV3TTSSettings {
  stability: number; // Creative/Natural/Robust режим
  similarity_boost: number; // Clarity + Similarity Enhancement
  // Примечание: v3 НЕ поддерживает use_speaker_boost и style
}

// Union type для всех версий ElevenLabs
export type ElevenLabsTTSSettings = ElevenLabsV2TTSSettings | ElevenLabsV3TTSSettings;

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
