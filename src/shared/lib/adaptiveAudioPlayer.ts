interface PlayOptions {
  volume?: number;
  playbackRate?: number;
  onEnded?: () => void;
  trimLeadingSilence?: boolean; // Kept for interface compatibility
  maxTrimSeconds?: number;
}

export class AdaptiveAudioPlayer {
  private audioContext: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentAudioFallback: HTMLAudioElement | null = null;
  private gainNode: GainNode | null = null;
  private baseVolume = 1;
  private playbackRate = 1;

  async play(url: string, options: PlayOptions = {}): Promise<void> {
    const {
      volume = 1,
      playbackRate = 1,
      onEnded,
    } = options;

    this.stop();
    this.baseVolume = volume;
    this.playbackRate = playbackRate;

    try {
      const context = this.getAudioContext();
      if (context.state === 'suspended') {
        await context.resume();
      }

      // Fetch and decode the audio data.
      // This is critical because decoding audio data perfectly resamples the TTS audio
      // (which is often 24kHz) to the mobile device's native frequency (like 48kHz).
      // Using normal HTMLAudioElement + MediaElementAudioSourceNode on iOS Safari
      // causes a known bug where the audio is played at 2x speed (sounding "squeezed").
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer);

      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = this.playbackRate;

      const gain = context.createGain();
      gain.gain.value = this.baseVolume;

      source.connect(gain);
      gain.connect(context.destination);

      const currentSourceNode = source;
      source.onended = () => {
        if (this.currentSource === currentSourceNode) {
          this.currentSource = null;
        }
        onEnded?.();
      };

      // By scheduling playback 0.3 seconds in the future, the AudioContext starts
      // outputting silence immediately. This gives Bluetooth headphones and mobile 
      // DACs the time they need to "wake up" from power-saving mode, ensuring the 
      // first consonant of the word arrives completely intact.
      source.start(context.currentTime + 0.3);

      this.currentSource = source;
      this.gainNode = gain;

    } catch (error) {
      console.warn('WebAudio playback failed (possibly CORS or decode error), falling back to native Audio', error);
      
      const audio = new Audio(url);
      audio.crossOrigin = 'anonymous';
      audio.volume = this.baseVolume;
      audio.playbackRate = this.playbackRate;

      const currentAudio = audio;
      audio.onended = () => {
        if (this.currentAudioFallback === currentAudio) {
          this.currentAudioFallback = null;
        }
        onEnded?.();
      };

      this.currentAudioFallback = audio;
      await audio.play();
    }
  }

  setVolume(volume: number): void {
    this.baseVolume = volume;
    
    if (this.gainNode && this.audioContext) {
      const now = this.audioContext.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setTargetAtTime(volume, now, 0.03);
    }
    
    if (this.currentAudioFallback) {
      this.currentAudioFallback.volume = volume;
    }
  }

  setPlaybackRate(playbackRate: number): void {
    this.playbackRate = playbackRate;
    
    if (this.currentSource) {
      this.currentSource.playbackRate.value = playbackRate;
    }
    
    if (this.currentAudioFallback) {
      this.currentAudioFallback.playbackRate = playbackRate;
    }
  }

  stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.stop();
        this.currentSource.disconnect();
      } catch (e) {
        // Ignore stop errors if already stopped
      }
      this.currentSource.onended = null;
      this.currentSource = null;
    }

    if (this.currentAudioFallback) {
      this.currentAudioFallback.pause();
      this.currentAudioFallback.currentTime = 0;
      this.currentAudioFallback.onended = null;
      this.currentAudioFallback = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new window.AudioContext();
    }
    return this.audioContext;
  }
}

export const adaptiveAudioPlayer = new AdaptiveAudioPlayer();
