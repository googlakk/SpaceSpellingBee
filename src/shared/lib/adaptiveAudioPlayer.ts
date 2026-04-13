interface PlayOptions {
  volume?: number;
  playbackRate?: number;
  onEnded?: () => void;
  trimLeadingSilence?: boolean;
  maxTrimSeconds?: number;
}

export class AdaptiveAudioPlayer {
  private audioContext: AudioContext | null = null;
  private audio: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private compressorNode: DynamicsCompressorNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private delayNode: DelayNode | null = null;
  private monitorBuffer: Float32Array | null = null;
  private rafId: number | null = null;
  private baseVolume = 1;
  private leadingSilenceCache = new Map<string, number>();

  async play(url: string, options: PlayOptions = {}): Promise<void> {
    const {
      volume = 1,
      playbackRate = 1,
      onEnded,
      trimLeadingSilence = false,
      maxTrimSeconds = 1.2,
    } = options;

    this.stop();
    this.baseVolume = volume;

    const audio = new Audio(url);
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.playbackRate = playbackRate;

    this.audio = audio;

    // Disabled trimLeadingSilence as it causes short TTS words to be truncated.
    // if (trimLeadingSilence) {
    //   await this.applyLeadingSilenceTrim(audio, url, maxTrimSeconds);
    // }

    const currentAudio = audio;
    const handleEnded = () => {
      // The audio element finishes before the delay node clears its buffer.
      // Wait for the delay time (300ms) plus a tiny margin before cleaning up.
      setTimeout(() => {
        // Only run if this is still the active audio session
        if (this.audio !== currentAudio) return;
        
        this.cleanupNodes();
        this.audio = null;
        onEnded?.();
      }, 350); 
    };

    audio.onended = handleEnded;

    try {
      await this.ensureAudioGraph(audio, playbackRate);
      await audio.play();
      this.startAutoGain();
    } catch (error) {
      // Fallback if WebAudio graph can't be created (e.g. CORS restriction)
      this.cleanupNodes();
      this.gainNode = null;
      this.delayNode = null;
      audio.volume = volume;
      await audio.play();
    }
  }

  setVolume(volume: number): void {
    this.baseVolume = volume;
    if (!this.gainNode || !this.audioContext) {
      if (this.audio) {
        this.audio.volume = volume;
      }
      return;
    }

    const now = this.audioContext.currentTime;
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.setTargetAtTime(volume, now, 0.03);
  }

  setPlaybackRate(playbackRate: number): void {
    if (this.audio) {
      this.audio.playbackRate = playbackRate;
    }
  }

  stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.onended = null;
      this.audio = null;
    }

    this.cleanupNodes();
  }

  private async ensureAudioGraph(audio: HTMLAudioElement, playbackRate: number): Promise<void> {
    const context = this.getAudioContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const source = context.createMediaElementSource(audio);
    const gain = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const analyser = context.createAnalyser();

    compressor.threshold.value = -22;
    compressor.knee.value = 24;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.25;

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;

    // Add a conservative delay to prevent mobile DACs/Bluetooth from clipping the very beginning 
    // of short clips (like single words) while they wake up from power-saving silence.
    const delay = context.createDelay(1.0);
    delay.delayTime.value = 0.3; // 300ms

    source.connect(delay);
    delay.connect(gain);
    // Connect analyser before the delay so AutoGain acts with a 300ms lookahead!
    source.connect(analyser); 
    
    gain.connect(compressor);
    compressor.connect(context.destination);

    gain.gain.value = this.baseVolume;
    audio.playbackRate = playbackRate;

    this.sourceNode = source;
    this.delayNode = delay;
    this.gainNode = gain;
    this.compressorNode = compressor;
    this.analyserNode = analyser;
    this.monitorBuffer = new Float32Array(analyser.fftSize);
  }

  private startAutoGain(): void {
    if (!this.analyserNode || !this.gainNode || !this.audioContext || !this.monitorBuffer) {
      return;
    }

    const targetRms = 0.12;
    const minGain = 0.6;
    const maxGain = 2.4;

    const monitor = () => {
      if (!this.analyserNode || !this.gainNode || !this.audioContext || !this.monitorBuffer || !this.audio) {
        return;
      }

      this.analyserNode.getFloatTimeDomainData(this.monitorBuffer);

      let sum = 0;
      for (let i = 0; i < this.monitorBuffer.length; i += 1) {
        const sample = this.monitorBuffer[i];
        sum += sample * sample;
      }

      const rms = Math.sqrt(sum / this.monitorBuffer.length);
      if (rms > 0.0001) {
        const desiredAutoGain = this.clamp(targetRms / rms, minGain, maxGain);
        const desired = this.baseVolume * desiredAutoGain;
        const current = this.gainNode.gain.value;
        const smoothed = current + (desired - current) * 0.08;

        const now = this.audioContext.currentTime;
        this.gainNode.gain.cancelScheduledValues(now);
        this.gainNode.gain.setTargetAtTime(smoothed, now, 0.03);
      }

      this.rafId = window.requestAnimationFrame(monitor);
    };

    monitor();
  }

  private cleanupNodes(): void {
    if (this.rafId !== null) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.sourceNode?.disconnect();
    this.delayNode?.disconnect();
    this.gainNode?.disconnect();
    this.compressorNode?.disconnect();
    this.analyserNode?.disconnect();

    this.sourceNode = null;
    this.delayNode = null;
    this.gainNode = null;
    this.compressorNode = null;
    this.analyserNode = null;
    this.monitorBuffer = null;
  }

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new window.AudioContext();
    }
    return this.audioContext;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private async applyLeadingSilenceTrim(
    audio: HTMLAudioElement,
    url: string,
    maxTrimSeconds: number
  ): Promise<void> {
    const offset = await this.getLeadingSilenceOffset(url, maxTrimSeconds);
    if (offset <= 0.03) {
      return;
    }

    try {
      if (audio.readyState < 1) {
        await this.waitForLoadedMetadata(audio);
      }
      const safeOffset = audio.duration
        ? Math.min(offset, Math.max(0, audio.duration - 0.05))
        : offset;
      audio.currentTime = safeOffset;
    } catch {
      // Ignore trim errors and play normally.
    }
  }

  private async getLeadingSilenceOffset(url: string, maxTrimSeconds: number): Promise<number> {
    const cached = this.leadingSilenceCache.get(url);
    if (cached !== undefined) {
      return Math.min(cached, maxTrimSeconds);
    }

    try {
      const context = this.getAudioContext();
      const response = await fetch(url);
      if (!response.ok) {
        this.leadingSilenceCache.set(url, 0);
        return 0;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));
      const channel = audioBuffer.getChannelData(0);
      const threshold = 0.015;
      const minConsecutive = 256;
      const maxSamples = Math.min(channel.length, Math.floor(maxTrimSeconds * audioBuffer.sampleRate));

      let streak = 0;
      let firstNonSilent = 0;

      for (let i = 0; i < maxSamples; i += 1) {
        if (Math.abs(channel[i]) > threshold) {
          streak += 1;
          if (streak >= minConsecutive) {
            firstNonSilent = i - minConsecutive + 1;
            break;
          }
        } else {
          streak = 0;
        }
      }

      const offset = firstNonSilent > 0 ? firstNonSilent / audioBuffer.sampleRate : 0;
      this.leadingSilenceCache.set(url, offset);
      return offset;
    } catch {
      this.leadingSilenceCache.set(url, 0);
      return 0;
    }
  }

  private waitForLoadedMetadata(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error('Failed to load audio metadata'));
      };
      const onTimeout = () => {
        cleanup();
        reject(new Error('Audio metadata timeout'));
      };

      const cleanup = () => {
        audio.removeEventListener('loadedmetadata', onLoaded);
        audio.removeEventListener('error', onError);
        window.clearTimeout(timeoutId);
      };

      audio.addEventListener('loadedmetadata', onLoaded);
      audio.addEventListener('error', onError);
      const timeoutId = window.setTimeout(onTimeout, 1500);
      audio.load();
    });
  }
}

export const adaptiveAudioPlayer = new AdaptiveAudioPlayer();
