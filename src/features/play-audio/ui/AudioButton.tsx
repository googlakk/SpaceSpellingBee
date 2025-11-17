import { useState, useRef, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Volume2, Volume1, VolumeX, Gauge, Play, Pause } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { audioPlayer } from "../model/audioPlayer";

interface AudioButtonProps {
  text: string;
  audioUrl?: string | null;
  language?: string;
  disabled?: boolean;
  autoPlay?: boolean;
  onPlayComplete?: () => void;
}

export const AudioButton = ({
  text,
  audioUrl,
  language = "en-US",
  disabled = false,
  autoPlay = false,
  onPlayComplete,
}: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showControls, setShowControls] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);

      // If we have a pre-recorded audio URL, use it
      if (audioUrl) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }

        const audio = new Audio(audioUrl);
        audio.volume = volume;
        audio.playbackRate = playbackRate;
        audioRef.current = audio;

        await audio.play();

        audio.onended = () => {
          setIsPlaying(false);
          audioRef.current = null;
          onPlayComplete?.();
        };
      } else {
        // Fallback to TTS
        await audioPlayer.play(text, language);
        setIsPlaying(false);
        onPlayComplete?.();
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      audioRef.current = null;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handlePlaybackRateChange = (value: number[]) => {
    const newRate = value[0];
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  // Auto-play when word changes
  useEffect(() => {
    if (autoPlay && !disabled) {
      // Small delay to ensure proper loading
      const timer = setTimeout(() => {
        handlePlay();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [text, audioUrl, autoPlay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const getVolumeIcon = () => {
    if (volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  };

  const VolumeIcon = getVolumeIcon();

  return (
    <div className="text-center">
      {/* Main Play Button */}
      <div className="relative inline-block">
        <Button
          size="lg"
          onClick={isPlaying ? handleStop : handlePlay}
          disabled={disabled}
          className={`rounded-full w-24 h-24 bg-gradient-primary hover:scale-110 glow-cyan shadow-large transition-all ${
            isPlaying ? "animate-pulse-glow" : ""
          } relative overflow-hidden group`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          {isPlaying ? (
            <Pause className="h-8 w-8 relative z-10" />
          ) : (
            <Volume2 className="h-8 w-8 relative z-10 group-hover:scale-110 transition-transform" />
          )}
        </Button>

        {/* Orbiting particles */}
        {!disabled && (
          <>
            <div className="absolute top-0 right-0 w-2 h-2 bg-accent rounded-full animate-spin-slow" style={{ transformOrigin: '90px 90px' }} />
            <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-secondary rounded-full animate-spin-slow" style={{ transformOrigin: '90px -15px', animationDelay: '2s' }} />
          </>
        )}
      </div>

      <p className="text-sm text-muted-foreground mt-3">
        {isPlaying ? "Playing..." : "Click to hear"}
      </p>

      {/* Audio Controls */}
      <div className="mt-6 max-w-xs mx-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowControls(!showControls)}
          className="mb-3 text-primary hover:text-primary hover:bg-primary/10"
        >
          <Gauge className="h-4 w-4 mr-2" />
          {showControls ? "Hide" : "Show"} Audio Controls
        </Button>

        {showControls && (
          <div className="glass-card rounded-2xl p-6 space-y-6 animate-slide-down">
            {/* Volume Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <VolumeIcon className="h-4 w-4 text-primary" />
                  <span className="text-foreground font-medium">Volume</span>
                </div>
                <span className="text-muted-foreground">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={handleVolumeChange}
                min={0}
                max={1}
                step={0.1}
                className="cursor-pointer"
              />
            </div>

            {/* Playback Speed Control */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-secondary" />
                  <span className="text-foreground font-medium">Speed</span>
                </div>
                <span className="text-muted-foreground">{playbackRate.toFixed(1)}x</span>
              </div>
              <Slider
                value={[playbackRate]}
                onValueChange={handlePlaybackRateChange}
                min={0.5}
                max={2.0}
                step={0.1}
                className="cursor-pointer"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0.5x (Slow)</span>
                <span>1.0x (Normal)</span>
                <span>2.0x (Fast)</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setVolume(1.0);
                  setPlaybackRate(1.0);
                  if (audioRef.current) {
                    audioRef.current.volume = 1.0;
                    audioRef.current.playbackRate = 1.0;
                  }
                }}
                className="flex-1 border-primary/30 hover:border-primary hover:bg-primary/10"
              >
                Reset
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPlaybackRate(0.75);
                  if (audioRef.current) {
                    audioRef.current.playbackRate = 0.75;
                  }
                }}
                className="flex-1 border-accent/30 hover:border-accent hover:bg-accent/10"
              >
                Slow
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
