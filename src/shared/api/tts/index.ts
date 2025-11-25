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
  TTSProviderConfig,
} from './types';

// Export errors
export {
  TTSProviderError,
  TTSProviderNotConfiguredError,
} from './types';

// Export providers
export { OpenAITTSProvider } from './providers/OpenAIProvider';
export { ElevenLabsTTSProvider } from './providers/ElevenLabsProvider';

// Export manager and convenience functions
export {
  TTSManager,
  ttsManager,
  generateSpeech,
  getAvailableVoices,
  getDefaultSettings,
  isProviderConfigured,
} from './TTSManager';
