export class AudioPlayer {
  private static instance: AudioPlayer;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  private constructor() {}

  static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  play(text: string, language: string = 'en-US', rate: number = 0.8): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Остановить текущее воспроизведение
        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        utterance.rate = rate;
        
        utterance.onend = () => {
          this.currentUtterance = null;
          resolve();
        };
        
        utterance.onerror = (event) => {
          this.currentUtterance = null;
          reject(event);
        };

        this.currentUtterance = utterance;
        speechSynthesis.speak(utterance);
      } catch (error) {
        reject(error);
      }
    });
  }

  stop(): void {
    if (this.currentUtterance) {
      speechSynthesis.cancel();
      this.currentUtterance = null;
    }
  }

  isPlaying(): boolean {
    return speechSynthesis.speaking;
  }
}

export const audioPlayer = AudioPlayer.getInstance();
