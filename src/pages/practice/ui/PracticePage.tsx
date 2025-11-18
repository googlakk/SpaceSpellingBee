import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Check, X, Flame, Loader2, Lightbulb, List, Rocket, Star, Trophy, Eye, EyeOff, Volume2, Sparkles, Home } from "lucide-react";
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
import {
  saveProgress as saveProgressToStorage,
  loadProgress as loadProgressFromStorage,
  clearProgress as clearProgressFromStorage
} from "@/features/track-progress/model/progressStorage";
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
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Load progress from localStorage
  useEffect(() => {
    loadWords();
    loadProgress();
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    const sublevelId = localStorage.getItem('selected_sublevel_id');
    if (words.length > 0 && sublevelId) {
      saveProgressToStorage(sublevelId, {
        currentWordIndex,
        coins,
        streak,
        hintsUsed
      });
    }
  }, [currentWordIndex, coins, streak, hintsUsed, words]);

  const loadProgress = () => {
    const sublevelId = localStorage.getItem('selected_sublevel_id');
    if (!sublevelId) return;

    const savedProgress = loadProgressFromStorage(sublevelId);

    if (savedProgress) {
      const wordIndex = savedProgress.currentWordIndex || 0;

      if (wordIndex > 0) {
        setCurrentWordIndex(wordIndex);
        setCoins(savedProgress.coins || 1250);
        setStreak(savedProgress.streak || 0);
        setHintsUsed(savedProgress.hintsUsed || 0);

        toast.success(`Progress restored! Continuing from word ${wordIndex + 1}`, {
          duration: 3000,
          icon: '🚀'
        });
      }
    }
  };

  const resetProgress = () => {
    const sublevelId = localStorage.getItem('selected_sublevel_id');
    if (sublevelId) {
      clearProgressFromStorage(sublevelId);
    }
    setCurrentWordIndex(0);
    setStreak(0);
    setHintsUsed(0);
  };

  const handleWordClick = (index: number) => {
    if (feedback !== null) return; // Don't allow changing word during feedback

    setCurrentWordIndex(index);
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    setShowAllWords(false);
    setCharacterState("idle");
    setCharacterMessage("🎯 New target locked! Listen and spell!");
    setProgress(calculateProgress(index, totalWords));

    toast.info(`Jumping to word ${index + 1}`, { icon: '🎯' });
  };

  const handleRestartMission = () => {
    resetProgress();
    setShowCompletionModal(false);
    setUserInput("");
    setFeedback(null);
    setShowHint(false);
    setCharacterState("idle");
    setCharacterMessage("🚀 Mission restarted! Let's go!");
    setProgress(0);
    toast.success("Mission restarted from the beginning!", { icon: '🚀' });
  };

  const handleReturnToLevels = () => {
    navigate(ROUTES.TRAINING);
  };

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
          // Clear progress when mission is completed
          resetProgress();
          // Show completion modal
          setShowCompletionModal(true);
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
    <div className="h-screen bg-gradient-cosmic stars-bg flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Compact Header for Mobile */}
      <div className="flex-shrink-0">
        <Header
          showBackButton
          backRoute={ROUTES.TRAINING}
          coins={coins}
          streak={streak}
        />
      </div>

      {/* Main Content - Flexible to fill remaining space */}
      <main className="flex-1 flex flex-col relative px-4 overflow-y-auto md:overflow-hidden">
        <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-2 md:py-4">

          {/* Top Section: Compact Progress Bar + Quick Actions */}
          <div className="flex-shrink-0 mb-2 md:mb-4">
            {/* Inline Progress */}
            <div className="glass-card rounded-xl p-2 md:p-3 mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm text-muted-foreground font-display">Progress</span>
                <span className="text-xs md:text-sm font-bold text-primary">{currentWordIndex + 1} / {totalWords}</span>
              </div>
              <ProgressBar
                current={currentWordIndex + 1}
                total={totalWords}
                label=""
              />
            </div>

            {/* Compact Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleHintClick}
                className="flex-1 glass-card border-accent/30 hover:border-accent hover:bg-accent/10 h-8 md:h-9 text-xs md:text-sm px-2"
              >
                {showHint ? <EyeOff className="h-3 w-3 md:h-4 md:w-4 md:mr-1" /> : <Eye className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />}
                <span className="hidden md:inline">{showHint ? "Hide" : "Hint"}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllWords(true)}
                className="flex-1 glass-card border-primary/30 hover:border-primary hover:bg-primary/10 h-8 md:h-9 text-xs md:text-sm px-2"
              >
                <List className="h-3 w-3 md:h-4 md:w-4 md:mr-1" />
                <span className="hidden md:inline">Words</span>
                <span className="md:hidden">({currentWordIndex + 1}/{totalWords})</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetProgress();
                  toast.success("Progress reset!");
                }}
                className="glass-card border-error/30 hover:border-error hover:bg-error/10 h-8 md:h-9 px-2"
                title="Reset progress"
              >
                <Rocket className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            </div>
          </div>

          {/* Hint Display - Compact */}
          {showHint && (
            <div className="flex-shrink-0 mb-2 glass-card rounded-xl p-3 md:p-4 border-accent border-2 glow-pink animate-slide-down">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Lightbulb className="h-4 w-4 md:h-5 md:w-5 text-accent animate-pulse" />
                <span className="text-xs md:text-sm font-bold text-accent font-display">HINT</span>
              </div>
              <p className="text-xl md:text-2xl font-bold text-center text-glow-pink tracking-widest font-display">
                {currentWord.word.toUpperCase()}
              </p>
            </div>
          )}

          {/* Middle Section: Audio + Input (Main Focus Area) */}
          <div className="flex-1 flex flex-col justify-center min-h-0 py-2">

            {/* Compact Character Message - Mobile Only When No Feedback */}
            {!feedback && (
              <div className="flex-shrink-0 mb-3 md:mb-4 text-center md:hidden">
                <div className="inline-block glass-card rounded-xl px-3 py-2 border border-primary/20">
                  <p className="text-xs text-foreground font-medium">{characterMessage}</p>
                </div>
              </div>
            )}

            {/* Desktop Character - Hidden on Mobile */}
            <div className="hidden md:block flex-shrink-0 mb-4">
              <Character
                state={characterState}
                message={characterMessage}
              />
            </div>

            {/* Feedback Messages - Compact */}
            {feedback && (
              <div className="flex-shrink-0 text-center mb-3 md:mb-4 animate-scale-in">
                {feedback === "correct" && (
                  <div className="glass-card rounded-xl p-3 md:p-4 border-success border-2 glow-cyan">
                    <Check className="h-8 w-8 md:h-10 md:w-10 mx-auto text-success mb-2" />
                    <p className="text-sm md:text-lg text-success font-bold">{characterMessage}</p>
                  </div>
                )}
                {feedback === "incorrect" && (
                  <div className="glass-card rounded-xl p-3 md:p-4 border-error border-2">
                    <X className="h-8 w-8 md:h-10 md:w-10 mx-auto text-error mb-2 animate-shake" />
                    <p className="text-sm md:text-lg text-error font-bold">{characterMessage}</p>
                  </div>
                )}
              </div>
            )}

            {/* Audio Button - Compact for Mobile */}
            <div className="flex-shrink-0 mb-3 md:mb-6">
              <div className="text-center">
                {/* Compact Audio Button */}
                <Button
                  size="lg"
                  onClick={() => {
                    const audio = new Audio(currentWord.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(currentWord.word)}`);
                    audio.play().catch(err => {
                      console.error('Audio playback failed:', err);
                      toast.error('Audio playback failed');
                    });
                  }}
                  disabled={feedback !== null}
                  className="rounded-full w-16 h-16 md:w-20 md:h-20 bg-gradient-primary hover:scale-110 glow-cyan shadow-large transition-all relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                  <Volume2 className="h-6 w-6 md:h-8 md:w-8 relative z-10 group-hover:scale-110 transition-transform" />
                </Button>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Tap to hear
                </p>
              </div>
            </div>

            {/* Input Field - Large and Centered (Main Focus) */}
            <div className="flex-shrink-0">
              <div className="glass-card p-3 md:p-6 shadow-large border-primary/20 glow-cyan rounded-xl md:rounded-2xl">
                <AnswerInput
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleCheckAnswer}
                  disabled={feedback !== null}
                  feedback={feedback}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section: Streak (if applicable) */}
          {streakMilestone && (
            <div className="flex-shrink-0 mt-2 md:mt-3">
              <div className="glass-card rounded-xl p-2 md:p-4 bg-gradient-secondary border-streak glow-purple">
                <div className="flex items-center justify-center gap-2">
                  <Flame className="h-5 w-5 md:h-6 md:w-6 text-streak" />
                  <span className="font-bold text-streak text-lg md:text-xl font-display">
                    {streakMilestone}
                  </span>
                  <Flame className="h-5 w-5 md:h-6 md:w-6 text-streak" />
                </div>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {words.map((word, index) => (
              <div
                key={word.id}
                className={`glass-card p-4 rounded-xl transition-all ${
                  index === currentWordIndex
                    ? 'border-2 border-primary glow-cyan bg-primary/10'
                    : index < currentWordIndex
                    ? 'border border-success/30 bg-success/5'
                    : 'border border-muted/20'
                }`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                  {index < currentWordIndex && (
                    <Check className="h-3 w-3 text-success ml-auto" />
                  )}
                  {index === currentWordIndex && (
                    <Rocket className="h-3 w-3 text-primary ml-auto animate-bounce-subtle" />
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const audio = new Audio(word.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(word.word)}`);
                      audio.play().catch(err => {
                        console.error('Audio playback failed:', err);
                        toast.error('Audio playback failed');
                      });
                    }}
                    className="flex-shrink-0 glass-card p-2 rounded-lg hover:bg-accent/20 transition-colors border border-accent/30 hover:border-accent"
                    title="Play audio"
                  >
                    <Volume2 className="h-4 w-4 text-accent" />
                  </button>

                  <button
                    onClick={() => handleWordClick(index)}
                    className="flex-1 text-left hover:bg-primary/10 p-2 rounded-lg transition-colors"
                    disabled={feedback !== null}
                  >
                    <p className="text-lg font-semibold">{word.word}</p>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="glass-card max-w-lg border-success/30">
          <DialogHeader>
            <DialogTitle className="text-3xl font-display text-center text-glow-cyan flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-accent animate-bounce-subtle" />
              Mission Complete!
              <Trophy className="h-8 w-8 text-accent animate-bounce-subtle" />
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-6 space-y-6">
            {/* Congratulations Message */}
            <div className="space-y-3">
              <div className="text-6xl animate-bounce-subtle">🎉</div>
              <h3 className="text-2xl font-bold text-glow-purple font-display">
                Congratulations, Space Cadet!
              </h3>
              <p className="text-muted-foreground">
                You've successfully completed all {totalWords} words in this mission!
              </p>
            </div>

            {/* Stats */}
            <div className="glass-card rounded-2xl p-6 space-y-3 border-2 border-success/30">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  Total Words
                </span>
                <span className="font-bold text-primary">{totalWords}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Coins Earned
                </span>
                <span className="font-bold text-accent">{coins}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Flame className="h-4 w-4 text-streak" />
                  Best Streak
                </span>
                <span className="font-bold text-streak">{streak}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  Hints Used
                </span>
                <span className="font-bold">{hintsUsed}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRestartMission}
                className="w-full rounded-full bg-gradient-primary hover:scale-105 glow-cyan transition-all shadow-large group relative overflow-hidden"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                <Rocket className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform relative z-10" />
                <span className="relative z-10">Restart Mission</span>
              </Button>

              <Button
                onClick={handleReturnToLevels}
                variant="outline"
                className="w-full rounded-full glass-card border-primary/30 hover:border-primary hover:bg-primary/10"
                size="lg"
              >
                <Home className="mr-2 h-5 w-5" />
                Return to Levels
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
