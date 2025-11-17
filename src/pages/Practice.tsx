import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { 
  Volume2, 
  Coins, 
  Flame,
  ChevronLeft,
  Check,
  X,
  Sparkles
} from "lucide-react";
import confetti from "canvas-confetti";

// Mock word data
const mockWords = [
  { id: 1, word: "hello", language: "en" },
  { id: 2, word: "world", language: "en" },
  { id: 3, word: "spelling", language: "en" },
  { id: 4, word: "practice", language: "en" },
  { id: 5, word: "champion", language: "en" },
];

const Practice = () => {
  const navigate = useNavigate();
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [coins, setCoins] = useState(1250);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [characterState, setCharacterState] = useState<"idle" | "happy" | "encouraging">("idle");

  const currentWord = mockWords[currentWordIndex];
  const totalWords = mockWords.length;

  const playAudio = () => {
    setIsPlaying(true);
    // Simulate audio playback
    const utterance = new SpeechSynthesisUtterance(currentWord.word);
    utterance.lang = "en-US";
    utterance.rate = 0.8;
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  const checkAnswer = () => {
    const isCorrect = userInput.toLowerCase().trim() === currentWord.word.toLowerCase();
    
    setFeedback(isCorrect ? "correct" : "incorrect");
    
    if (isCorrect) {
      // Celebration!
      setCharacterState("happy");
      setCoins(prev => prev + 10);
      setStreak(prev => prev + 1);
      
      // Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Move to next word after delay
      setTimeout(() => {
        if (currentWordIndex < totalWords - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setUserInput("");
          setFeedback(null);
          setCharacterState("idle");
          setProgress(((currentWordIndex + 1) / totalWords) * 100);
        } else {
          // Round complete!
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 }
          });
        }
      }, 1500);
    } else {
      setCharacterState("encouraging");
      setStreak(0);
      
      setTimeout(() => {
        setUserInput("");
        setFeedback(null);
        setCharacterState("idle");
      }, 2000);
    }
  };

  useEffect(() => {
    // Play audio on mount
    playAudio();
  }, [currentWordIndex]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm shadow-soft sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/training")}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-coin/20 px-4 py-2 rounded-full animate-coin-flip">
                <Coins className="h-5 w-5 text-coin" />
                <span className="font-bold text-coin">{coins}</span>
              </div>
              {streak > 0 && (
                <div className="flex items-center gap-2 bg-streak/20 px-4 py-2 rounded-full">
                  <Flame className="h-5 w-5 text-streak" />
                  <span className="font-bold text-streak">{streak}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Practice Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Round Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentWordIndex + 1}/{totalWords}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Character */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div 
                className={`text-9xl transition-all duration-300 ${
                  characterState === "happy" ? "animate-bounce-slow" :
                  characterState === "encouraging" ? "animate-wiggle" :
                  "animate-float"
                }`}
              >
                🐝
              </div>
              {characterState === "happy" && (
                <div className="absolute -top-4 -right-4 text-4xl animate-bounce-slow">🎉</div>
              )}
              {characterState === "encouraging" && (
                <div className="absolute -top-4 -right-4 text-4xl">💪</div>
              )}
            </div>
            
            <div className="mt-4">
              {feedback === null && (
                <p className="text-lg text-muted-foreground">Listen carefully and spell the word!</p>
              )}
              {feedback === "correct" && (
                <p className="text-lg text-success font-bold flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  Amazing! You got it right! +10 coins
                </p>
              )}
              {feedback === "incorrect" && (
                <p className="text-lg text-error font-bold flex items-center justify-center gap-2">
                  <X className="h-5 w-5" />
                  Oops! The correct spelling is: <span className="text-primary">{currentWord.word}</span>
                </p>
              )}
            </div>
          </div>

          {/* Audio Button */}
          <div className="text-center mb-8">
            <Button
              size="lg"
              onClick={playAudio}
              disabled={isPlaying || feedback !== null}
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

          {/* Input Field */}
          <Card className="p-8 shadow-medium">
            <div className="space-y-4">
              <label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Type your answer:
              </label>
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !feedback && checkAnswer()}
                placeholder="Spell the word..."
                disabled={feedback !== null}
                className={`text-2xl text-center h-16 rounded-2xl border-4 transition-all ${
                  feedback === "correct" ? "border-success bg-success/10" :
                  feedback === "incorrect" ? "border-error bg-error/10 animate-shake" :
                  "border-primary/30 focus:border-primary"
                }`}
                autoFocus
              />
              <Button
                onClick={checkAnswer}
                disabled={!userInput || feedback !== null}
                className="w-full rounded-full h-14 text-lg bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                Check Answer
              </Button>
            </div>
          </Card>

          {/* Streak Indicator */}
          {streak >= 3 && (
            <Card className="mt-6 p-4 bg-streak/10 border-streak">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 text-streak animate-wiggle" />
                <span className="font-bold text-streak text-lg">
                  {streak} word streak! Keep going!
                </span>
                <Flame className="h-6 w-6 text-streak animate-wiggle" />
              </div>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default Practice;
