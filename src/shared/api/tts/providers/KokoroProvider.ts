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

// Default settings for Kokoro
const DEFAULT_SETTINGS: KokoroTTSSettings = {
    speed: 1.0,
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
                console.log('📦 Loading Kokoro model (first time may take a moment)...');
                const { KokoroTTS } = await import('kokoro-js');
                kokoroInstance = await KokoroTTS.from_pretrained(
                    'onnx-community/Kokoro-82M-v1.0-ONNX',
                    { dtype: 'q8' }
                );
                console.log('✅ Kokoro model loaded successfully');
            }

            // Generate audio
            console.log('🔊 Generating audio...');
            const audio = await kokoroInstance.generate(text, {
                voice: voiceId,
                speed: kokoroSettings.speed || 1.0,
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
}
