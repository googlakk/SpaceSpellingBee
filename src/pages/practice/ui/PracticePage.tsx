import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Check, X, Flame, Loader2, Lightbulb, List, Rocket, Star, Trophy, Eye, EyeOff } from "lucide-react";
import confetti from "canvas-confetti";
import { Header } from "@/widgets/header/ui/Header";
import { Character } from "@/widgets/character/ui/Character";
import { AnswerInput } from "@/features/check-answer/ui/AnswerInput";
import { AudioButton } from "@/features/play-audio/ui/AudioButton";
import { ProgressBar } from "@/features/track-progress/ui/ProgressBar";
import { checkAnswer } from "@/features/check-answer/model/checkAnswer";
import {
  updateStreak,
  getStreakMilestone,
  calculateProgress
} from "@/features/track-progress/model/progressTracker";
import { supabase, Word } from "@/shared/api/supabase";
import { ROUTES } from "@/shared/config/routes";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CharacterState = "idle" | "happy" | "encouraging";

export const PracticePage = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [coins, setCoins] = useState(1250);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [characterMessage, setCharacterMessage] = useState<string>(
    "🎯 Mission briefing: Listen and spell the word correctly!"
  );
  const [showHint, setShowHint] = useState(false);
  const [showAllWords, setShowAllWords] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    setLoading(true);
    try {
      const sublevelId = localStorage.getItem('selected_sublevel_id');

      if (!sublevelId) {
        toast.error('No mission selected. Redirecting to mission control...');
        navigate(ROUTES.TRAINING);
        return;
      }

      const { data, error } = await supabase
        .from('words')
        .select('*')
        .eq('sublevel_id', sublevelId)
        .order('word');

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.error('No words found. Please add words in command center.');
        navigate(ROUTES.TRAINING);
        return;
      }

      setWords(data);
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Failed to load mission data');
      navigate(ROUTES.TRAINING);
    } finally {
      setLoading(false);
    }
  };

  const currentWord = words[currentWordIndex];
  const totalWords = words.length;

  const handleHintClick = () => {
    setShowHint(!showHint);
    if (!showHint) {
      setHintsUsed(prev => prev + 1);
      toast.info("Hint activated! -5 coins", { duration: 2000 });
      setCoins(prev => Math.max(0, prev - 5));
    }
  };

  const handleCheckAnswer = () => {
    const result = checkAnswer(userInput, currentWord.word);

    setFeedback(result.isCorrect ? "correct" : "incorrect");

    if (result.isCorrect) {
      // Success flow
      setCharacterState("happy");
      setCharacterMessage(`🚀 Mission accomplished! +${result.coinsEarned} stellar credits`);
      setCoins(prev => prev + result.coinsEarned);
      setStreak(prev => updateStreak(prev, true));
      setShowHint(false);

      // Cosmic confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#00FFFF', '#FF00FF', '#00FF00']
      });

      // Move to next word
      setTimeout(() => {
        if (currentWordIndex < totalWords - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setUserInput("");
          setFeedback(null);
          setCharacterState("idle");
          setCharacterMessage("🎯 Next target acquired! Listen carefully!");
          setProgress(calculateProgress(currentWordIndex + 1, totalWords));
        } else {
          // Mission complete!
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#00FFFF', '#FF00FF', '#00FF00']
          });
          setCharacterMessage("🏆 MISSION COMPLETE! You're a spelling champion!");
        }
      }, 1500);
    } else {
      // Error flow
      setCharacterState("encouraging");
      setCharacterMessage(`⚠️ Incorrect! The word is: ${currentWord.word}. Retry mission!`);
      setStreak(prev => updateStreak(prev, false));

      setTimeout(() => {
        setUserInput("");
        setFeedback(null);
        setShowHint(false);
        setCharacterState("idle");
        setCharacterMessage("🎯 Mission briefing: Listen and spell correctly!");
      }, 2000);
    }
  };

  const streakMilestone = getStreakMilestone(streak);

  useEffect(() => {
    setProgress(calculateProgress(currentWordIndex, totalWords));
  }, [currentWordIndex, totalWords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic stars-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <Rocket className="h-16 w-16 animate-bounce-subtle mx-auto text-primary mb-6 glow-cyan" />
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
          <p className="text-lg text-glow-cyan font-display">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gradient-cosmic stars-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <Trophy className="h-16 w-16 mx-auto text-accent mb-6 glow-pink" />
          <p className="text-lg text-muted-foreground">No mission data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic stars-bg">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      <Header
        showBackButton
        backRoute={ROUTES.TRAINING}
        coins={coins}
        streak={streak}
      />

      <main className="relative container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground font-display">Mission Progress</span>
                <span className="text-sm font-bold text-primary">{currentWordIndex + 1} / {totalWords}</span>
              </div>
              <ProgressBar
                current={currentWordIndex + 1}
                total={totalWords}
                label=""
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleHintClick}
              className="flex-1 glass-card border-accent/30 hover:border-accent hover:bg-accent/10 group"
            >
              {showHint ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showHint ? "Hide Hint" : "Show Hint"}
              <span className="ml-2 text-xs text-muted-foreground">(-5 coins)</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAllWords(true)}
              className="flex-1 glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
            >
              <List className="h-4 w-4 mr-2" />
              All Words ({totalWords})
            </Button>
          </div>

          {/* Hint Display */}
          {showHint && (
            <div className="mb-6 glass-card rounded-2xl p-6 border-accent border-2 glow-pink animate-slide-down">
              <div className="flex items-center gap-3 mb-3">
                <Lightbulb className="h-6 w-6 text-accent animate-pulse" />
                <span className="font-bold text-accent font-display">HINT ACTIVATED</span>
              </div>
              <p className="text-3xl font-bold text-center text-glow-pink tracking-widest font-display">
                {currentWord.word.toUpperCase()}
              </p>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Hints used: {hintsUsed}
              </p>
            </div>
          )}

          {/* Character */}
          <div className="mb-6">
            <Character
              state={characterState}
              message={characterMessage}
            />
          </div>

          {/* Feedback Messages */}
          {feedback && (
            <div className="text-center mb-6 animate-scale-in">
              {feedback === "correct" && (
                <div className="glass-card rounded-2xl p-6 border-success border-2 glow-cyan">
                  <Check className="h-12 w-12 mx-auto text-success mb-3" />
                  <p className="text-xl text-success font-bold">{characterMessage}</p>
                </div>
              )}
              {feedback === "incorrect" && (
                <div className="glass-card rounded-2xl p-6 border-error border-2">
                  <X className="h-12 w-12 mx-auto text-error mb-3 animate-shake" />
                  <p className="text-xl text-error font-bold">{characterMessage}</p>
                </div>
              )}
            </div>
          )}

          {/* Audio Button */}
          <div className="mb-8">
            <AudioButton
              audioUrl={currentWord.audio_url}
              text={currentWord.word}
              disabled={feedback !== null}
              autoPlay={true}
            />
          </div>

          {/* Input Field */}
          <Card className="glass-card p-8 shadow-large border-primary/20 glow-cyan">
            <AnswerInput
              value={userInput}
              onChange={setUserInput}
              onSubmit={handleCheckAnswer}
              disabled={feedback !== null}
              feedback={feedback}
            />
          </Card>

          {/* Streak Indicator */}
          {streakMilestone && (
            <Card className="mt-6 glass-card p-6 bg-gradient-secondary border-streak glow-purple">
              <div className="flex items-center justify-center gap-3">
                <Flame className="h-8 w-8 text-streak animate-bounce-subtle" />
                <span className="font-bold text-streak text-2xl font-display">
                  {streakMilestone}
                </span>
                <Flame className="h-8 w-8 text-streak animate-bounce-subtle" />
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* All Words Modal */}
      <Dialog open={showAllWords} onOpenChange={setShowAllWords}>
        <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-glow-cyan flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Mission Words Database
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Total words in this mission: {totalWords}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
            {words.map((word, index) => (
              <div
                key={word.id}
                className={`glass-card p-4 rounded-xl transition-all hover:scale-105 ${
                  index === currentWordIndex
                    ? 'border-2 border-primary glow-cyan bg-primary/10'
                    : index < currentWordIndex
                    ? 'border border-success/30 bg-success/5'
                    : 'border border-muted/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                  {index < currentWordIndex && (
                    <Check className="h-3 w-3 text-success ml-auto" />
                  )}
                  {index === currentWordIndex && (
                    <Rocket className="h-3 w-3 text-primary ml-auto animate-bounce-subtle" />
                  )}
                </div>
                <p className="text-lg font-semibold text-center">{word.word}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
