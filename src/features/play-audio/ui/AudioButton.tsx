import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Volume2 } from "lucide-react";
import { audioPlayer } from "../model/audioPlayer";

interface AudioButtonProps {
  text: string;
  language?: string;
  disabled?: boolean;
}

export const AudioButton = ({
  text,
  language = "en-US",
  disabled = false,
}: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      await audioPlayer.play(text, language);
      setIsPlaying(false);
    } catch (error) {
      console.error("Audio playback error:", error);
      setIsPlaying(false);
    }
  };

  return (
    <div className="text-center">
      <Button
        size="lg"
        onClick={handlePlay}
        disabled={disabled || isPlaying}
        className={`rounded-full w-32 h-32 bg-gradient-primary hover:opacity-90 shadow-large ${
          isPlaying ? "animate-pulse-slow" : ""
        }`}
      >
        <Volume2 className="h-12 w-12" />
      </Button>
      <p className="text-sm text-muted-foreground mt-2">
        {isPlaying ? "Playing..." : "Click to hear the word"}
      </p>
    </div>
  );
};
