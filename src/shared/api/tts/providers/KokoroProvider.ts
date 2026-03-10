/**
 * Kokoro TTS Provider Implementation
 *
 * Implements the ITTSProvider interface for Kokoro TTS (local WebGPU-based).
 * Runs entirely in the browser, no API key required.
 */

import {
    ITTSProvider,
    TTSProviderType,
    TTSVoice,
    TTSSettings,
    KokoroTTSSettings,
    TTSProviderError,
} from '../types';

// We'll dynamically import kokoro-js to avoid bundling issues
let kokoroInstance: any = null;
let kokoroInitPromise: Promise<any> | null = null;

// Default settings for Kokoro
const DEFAULT_SETTINGS: KokoroTTSSettings = {
    speed: 0.9,
};

// Default voice ID
const DEFAULT_VOICE_ID = 'af_bella';

// Available Kokoro voices (static list based on kokoro-js documentation)
const KOKORO_VOICES: TTSVoice[] = [
    { voice_id: 'af_bella', name: 'Bella (American Female)', description: 'Natural American female voice' },
    { voice_id: 'af_nicole', name: 'Nicole (American Female)', description: 'Clear American female voice' },
    { voice_id: 'af_sarah', name: 'Sarah (American Female)', description: 'Warm American female voice' },
    { voice_id: 'af_sky', name: 'Sky (American Female)', description: 'Bright American female voice' },
    { voice_id: 'am_adam', name: 'Adam (American Male)', description: 'Deep American male voice' },
    { voice_id: 'am_michael', name: 'Michael (American Male)', description: 'Clear American male voice' },
    { voice_id: 'bf_emma', name: 'Emma (British Female)', description: 'British female voice' },
    { voice_id: 'bf_isabella', name: 'Isabella (British Female)', description: 'Elegant British female voice' },
    { voice_id: 'bm_george', name: 'George (British Male)', description: 'British male voice' },
    { voice_id: 'bm_lewis', name: 'Lewis (British Male)', description: 'Clear British male voice' },
];

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const MODEL_LOAD_TIMEOUT_MS = 60000;

export class KokoroTTSProvider implements ITTSProvider {
    readonly type: TTSProviderType = 'kokoro';

    isConfigured(): boolean {
        // Kokoro is always "configured" since it runs locally
        // We just need WebGPU support in the browser
        return true;
    }

    getDefaultSettings(): KokoroTTSSettings {
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
        console.log('🎬 Kokoro generateSpeech called');
        console.log('📝 Text:', text);
        console.log('🎙️ Voice ID:', voiceId);
        console.log('⚙️ Settings:', settings);

        const kokoroSettings = settings as KokoroTTSSettings;

        try {
            // Dynamically import kokoro-js
            if (!kokoroInstance) {
                kokoroInstance = await this.ensureKokoroModelLoaded();
            }

            // Generate audio
            console.log('🔊 Generating audio...');
            const normalizedText = this.prepareText(text, voiceId);
            const audio = await kokoroInstance.generate(normalizedText, {
                voice: voiceId,
                speed: kokoroSettings.speed || DEFAULT_SETTINGS.speed,
            });

            // Convert to WAV blob
            const wavBuffer = audio.toWav();
            const blob = new Blob([wavBuffer], { type: 'audio/wav' });

            console.log('✅ Audio generated:', blob.size, 'bytes');
            return blob;
        } catch (error) {
            console.error('❌ Kokoro TTS error:', error);
            throw new TTSProviderError(
                `Failed to generate speech: ${error instanceof Error ? error.message : 'Unknown error'}`,
                'kokoro',
                error instanceof Error ? error : undefined
            );
        }
    }

    async getAvailableVoices(): Promise<TTSVoice[]> {
        console.log('🎤 Kokoro getAvailableVoices called');
        // Return static list of voices
        return KOKORO_VOICES;
    }

    /**
     * Normalize settings from various formats to Kokoro format
     */
    normalizeSettings(settings: any): KokoroTTSSettings {
        if (!settings || typeof settings !== 'object') {
            return { ...DEFAULT_SETTINGS };
        }

        return {
            speed:
                typeof settings.speed === 'number'
                    ? Math.max(0.5, Math.min(2.0, settings.speed))
                    : DEFAULT_SETTINGS.speed,
        };
    }

    private prepareText(text: string, voiceId: string): string {
        const trimmed = text.trim();
        if (!trimmed) return text;

        // For single English words, keep input minimal to avoid generating extra phrases.
        const isEnglishVoice = voiceId.startsWith('a') || voiceId.startsWith('b');
        const isSingleWord = !/\s/.test(trimmed);
        const isLatinOnly = /^[A-Za-z'-]+$/.test(trimmed);

        if (isEnglishVoice && isSingleWord && isLatinOnly) {
            return `${trimmed}.`;
        }

        return trimmed;
    }

    private async ensureKokoroModelLoaded(): Promise<any> {
        if (kokoroInstance) return kokoroInstance;
        if (kokoroInitPromise) return kokoroInitPromise;

        kokoroInitPromise = (async () => {
            console.log('📦 Loading Kokoro model (first time may take a moment)...');
            const { KokoroTTS } = await import('kokoro-js');

            const hasWebGPU = typeof navigator !== 'undefined' && !!navigator.gpu;
            const loadProfiles: Array<{ dtype: 'fp32' | 'fp16' | 'q8' | 'q4' | 'q4f16'; device: 'wasm' | 'webgpu' }> = [
                // Most stable path in browser for broad hardware support
                { dtype: 'q8', device: 'wasm' },
                // Smaller fallback if memory is constrained
                { dtype: 'q4', device: 'wasm' },
                // Optional acceleration path
                ...(hasWebGPU ? [{ dtype: 'fp32' as const, device: 'webgpu' as const }] : []),
            ];

            let lastError: unknown = null;
            for (const profile of loadProfiles) {
                try {
                    console.log(`🧪 Trying Kokoro init: device=${profile.device}, dtype=${profile.dtype}`);
                    const model = await this.withTimeout(
                        KokoroTTS.from_pretrained(MODEL_ID, {
                            dtype: profile.dtype,
                            device: profile.device,
                            progress_callback: (p: { status?: string; file?: string; progress?: number }) => {
                                if (typeof p?.progress === 'number') {
                                    console.log(`📥 Kokoro load ${Math.round(p.progress * 100)}% ${p.file || ''}`.trim());
                                } else if (p?.status) {
                                    console.log(`📥 Kokoro load: ${p.status}`);
                                }
                            },
                        }),
                        MODEL_LOAD_TIMEOUT_MS,
                        `Kokoro model load timeout after ${MODEL_LOAD_TIMEOUT_MS / 1000}s`
                    );

                    console.log(`✅ Kokoro model loaded successfully (device=${profile.device}, dtype=${profile.dtype})`);
                    return model;
                } catch (error) {
                    lastError = error;
                    console.warn(`⚠️ Kokoro init failed for device=${profile.device}, dtype=${profile.dtype}:`, error);
                }
            }

            throw lastError instanceof Error
                ? lastError
                : new Error('Failed to initialize Kokoro model with all fallback profiles');
        })();

        try {
            kokoroInstance = await kokoroInitPromise;
            return kokoroInstance;
        } finally {
            kokoroInitPromise = null;
        }
    }

    private withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                reject(new Error(message));
            }, timeoutMs);

            promise
                .then(result => {
                    window.clearTimeout(timeoutId);
                    resolve(result);
                })
                .catch(error => {
                    window.clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }
}
