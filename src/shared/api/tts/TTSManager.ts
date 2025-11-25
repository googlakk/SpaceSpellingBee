/**
 * TTS Manager - Central management for all TTS providers
 *
 * This singleton class manages multiple TTS providers (OpenAI, ElevenLabs, etc.)
 * and provides a unified interface for generating speech across different services.
 */

import {
  ITTSProvider,
  TTSProviderType,
  TTSProviderConfig,
  TTSVoice,
  TTSSettings,
  TTSProviderError,
} from './types';
import { OpenAITTSProvider } from './providers/OpenAIProvider';
import { ElevenLabsTTSProvider } from './providers/ElevenLabsProvider';

export class TTSManager {
  private static instance: TTSManager;
  private providers: Map<TTSProviderType, ITTSProvider>;
  private defaultProvider: TTSProviderType = 'openai';

  private constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  /**
   * Get the singleton instance of TTSManager
   */
  public static getInstance(): TTSManager {
    if (!TTSManager.instance) {
      TTSManager.instance = new TTSManager();
    }
    return TTSManager.instance;
  }

  /**
   * Initialize all available TTS providers
   */
  private initializeProviders(): void {
    // Register OpenAI provider
    this.providers.set('openai', new OpenAITTSProvider());

    // Register ElevenLabs provider
    this.providers.set('elevenlabs', new ElevenLabsTTSProvider());
  }

  /**
   * Get a specific provider by type
   */
  public getProvider(type: TTSProviderType): ITTSProvider {
    const provider = this.providers.get(type);
    if (!provider) {
      throw new TTSProviderError(`Provider '${type}' not found`, type);
    }
    return provider;
  }

  /**
   * Get all registered providers
   */
  public getAllProviders(): ITTSProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get all configured (ready to use) providers
   */
  public getConfiguredProviders(): ITTSProvider[] {
    return this.getAllProviders().filter(provider => provider.isConfigured());
  }

  /**
   * Set the default provider
   */
  public setDefaultProvider(type: TTSProviderType): void {
    if (!this.providers.has(type)) {
      throw new TTSProviderError(`Provider '${type}' not found`, type);
    }
    this.defaultProvider = type;
  }

  /**
   * Get the default provider
   */
  public getDefaultProvider(): ITTSProvider {
    return this.getProvider(this.defaultProvider);
  }

  /**
   * Generate speech using a specific provider
   */
  public async generateSpeech(
    text: string,
    config: TTSProviderConfig
  ): Promise<Blob> {
    const provider = this.getProvider(config.provider);

    if (!provider.isConfigured()) {
      throw new TTSProviderError(
        `Provider '${config.provider}' is not configured`,
        config.provider
      );
    }

    return provider.generateSpeech(text, config.voiceId, config.settings);
  }

  /**
   * Generate speech using the default provider
   */
  public async generateSpeechWithDefaults(text: string): Promise<Blob> {
    const provider = this.getDefaultProvider();
    const voiceId = provider.getDefaultVoiceId();
    const settings = provider.getDefaultSettings();

    return provider.generateSpeech(text, voiceId, settings);
  }

  /**
   * Get available voices for a specific provider
   */
  public async getAvailableVoices(
    providerType: TTSProviderType
  ): Promise<TTSVoice[]> {
    const provider = this.getProvider(providerType);

    if (!provider.isConfigured()) {
      throw new TTSProviderError(
        `Provider '${providerType}' is not configured`,
        providerType
      );
    }

    return provider.getAvailableVoices();
  }

  /**
   * Get default settings for a specific provider
   */
  public getDefaultSettings(providerType: TTSProviderType): TTSSettings {
    const provider = this.getProvider(providerType);
    return provider.getDefaultSettings();
  }

  /**
   * Check if a provider is configured and ready to use
   */
  public isProviderConfigured(providerType: TTSProviderType): boolean {
    const provider = this.providers.get(providerType);
    return provider ? provider.isConfigured() : false;
  }

  /**
   * Get list of all provider types
   */
  public getProviderTypes(): TTSProviderType[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Create a provider config with defaults
   */
  public createDefaultConfig(
    providerType: TTSProviderType
  ): TTSProviderConfig {
    const provider = this.getProvider(providerType);
    return {
      provider: providerType,
      voiceId: provider.getDefaultVoiceId(),
      settings: provider.getDefaultSettings(),
    };
  }

  /**
   * Validate and normalize provider config
   */
  public normalizeConfig(config: Partial<TTSProviderConfig>): TTSProviderConfig {
    const providerType = config.provider || this.defaultProvider;
    const provider = this.getProvider(providerType);

    return {
      provider: providerType,
      voiceId: config.voiceId || provider.getDefaultVoiceId(),
      voiceName: config.voiceName,
      settings: config.settings || provider.getDefaultSettings(),
    };
  }
}

// Export singleton instance
export const ttsManager = TTSManager.getInstance();

// Export convenience functions
export const generateSpeech = (text: string, config: TTSProviderConfig) =>
  ttsManager.generateSpeech(text, config);

export const getAvailableVoices = (providerType: TTSProviderType) =>
  ttsManager.getAvailableVoices(providerType);

export const getDefaultSettings = (providerType: TTSProviderType) =>
  ttsManager.getDefaultSettings(providerType);

export const isProviderConfigured = (providerType: TTSProviderType) =>
  ttsManager.isProviderConfigured(providerType);
