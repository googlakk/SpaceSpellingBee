/**
 * TTS (Text-to-Speech) API Module
 *
 * Central export point for the TTS system.
 * Provides unified access to multiple TTS providers (OpenAI, ElevenLabs, etc.)
 */

// Export types
export type {
  ITTSProvider,
  TTSProviderType,
  TTSVoice,
  TTSSettings,
  OpenAITTSSettings,
  ElevenLabsTTSSettings,
  ElevenLabsModel,
  KokoroTTSSettings,
  TTSProviderConfig,
} from './types';

// Export errors
export {
  TTSProviderError,
  TTSProviderNotConfiguredError,
} from './types';

// Note: Provider classes are NOT exported here intentionally.
// TTSManager loads providers lazily via dynamic import() to keep
// them out of the initial bundle. Access providers through ttsManager.

// Export manager and convenience functions
export {
  TTSManager,
  ttsManager,
  generateSpeech,
  getAvailableVoices,
  getDefaultSettings,
  isProviderConfigured,
} from './TTSManager';
