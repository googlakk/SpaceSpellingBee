/**
 * TTS Manager - Central management for all TTS providers
 *
 * This singleton class manages multiple TTS providers (OpenAI, ElevenLabs, Kokoro)
 * and provides a unified interface for generating speech across different services.
 *
 * Providers are loaded lazily via dynamic import() on first access, keeping
 * provider code out of the initial bundle.
 */

import {
  ITTSProvider,
  TTSProviderType,
  TTSProviderConfig,
  TTSVoice,
  TTSSettings,
  TTSProviderError,
} from './types';

// All known provider types — used for sync checks without loading modules
const REGISTERED_PROVIDERS: readonly TTSProviderType[] = [
  'openai',
  'elevenlabs',
  'kokoro',
] as const;

export class TTSManager {
  private static instance: TTSManager;
  private providers: Map<TTSProviderType, ITTSProvider>;
  private loadingProviders: Map<TTSProviderType, Promise<ITTSProvider>>;
  private defaultProvider: TTSProviderType = 'openai';

  private constructor() {
    this.providers = new Map();
    this.loadingProviders = new Map();
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
   * Lazily load and cache a provider module via dynamic import.
   * Uses a loading promise cache to prevent duplicate concurrent loads.
   */
  private async loadProvider(type: TTSProviderType): Promise<ITTSProvider> {
    // Return cached provider if already loaded
    const cached = this.providers.get(type);
    if (cached) return cached;

    // Return in-flight promise if already loading
    const loading = this.loadingProviders.get(type);
    if (loading) return loading;

    // Start loading
    const promise = this.doLoadProvider(type);
    this.loadingProviders.set(type, promise);

    try {
      const provider = await promise;
      this.providers.set(type, provider);
      return provider;
    } finally {
      this.loadingProviders.delete(type);
    }
  }

  /**
   * Perform the actual dynamic import for a provider type.
   */
  private async doLoadProvider(type: TTSProviderType): Promise<ITTSProvider> {
    switch (type) {
      case 'openai': {
        const { OpenAITTSProvider } = await import('./providers/OpenAIProvider');
        return new OpenAITTSProvider();
      }
      case 'elevenlabs': {
        const { ElevenLabsTTSProvider } = await import('./providers/ElevenLabsProvider');
        return new ElevenLabsTTSProvider();
      }
      case 'kokoro': {
        const { KokoroTTSProvider } = await import('./providers/KokoroProvider');
        return new KokoroTTSProvider();
      }
      default:
        throw new TTSProviderError(`Unknown provider type: '${type}'`, type);
    }
  }

  /**
   * Get a specific provider by type (lazy-loaded).
   */
  public async getProvider(type: TTSProviderType): Promise<ITTSProvider> {
    return this.loadProvider(type);
  }

  /**
   * Get all registered provider types.
   * This is synchronous — no module loading required.
   */
  public getProviderTypes(): TTSProviderType[] {
    return [...REGISTERED_PROVIDERS];
  }

  /**
   * Check if a provider type is registered (known).
   * This is synchronous — checks the static registry, not provider state.
   */
  public isProviderRegistered(type: TTSProviderType): boolean {
    return REGISTERED_PROVIDERS.includes(type);
  }

  /**
   * Check if a provider is configured and ready to use.
   * Loads the provider lazily if needed.
   */
  public async isProviderConfigured(providerType: TTSProviderType): Promise<boolean> {
    if (!this.isProviderRegistered(providerType)) return false;
    try {
      const provider = await this.loadProvider(providerType);
      return provider.isConfigured();
    } catch {
      return false;
    }
  }

  /**
   * Set the default provider
   */
  public setDefaultProvider(type: TTSProviderType): void {
    if (!this.isProviderRegistered(type)) {
      throw new TTSProviderError(`Provider '${type}' not found`, type);
    }
    this.defaultProvider = type;
  }

  /**
   * Get the default provider (lazy-loaded)
   */
  public async getDefaultProvider(): Promise<ITTSProvider> {
    return this.getProvider(this.defaultProvider);
  }

  /**
   * Generate speech using a specific provider
   */
  public async generateSpeech(
    text: string,
    config: TTSProviderConfig
  ): Promise<Blob> {
    const provider = await this.getProvider(config.provider);

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
    const provider = await this.getDefaultProvider();
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
    const provider = await this.getProvider(providerType);

    if (!provider.isConfigured()) {
      throw new TTSProviderError(
        `Provider '${providerType}' is not configured`,
        providerType
      );
    }

    return provider.getAvailableVoices();
  }

  /**
   * Get default settings for a specific provider (lazy-loaded)
   */
  public async getDefaultSettings(providerType: TTSProviderType): Promise<TTSSettings> {
    const provider = await this.getProvider(providerType);
    return provider.getDefaultSettings();
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
