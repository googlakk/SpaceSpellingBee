import { useState, useEffect, memo, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ChevronLeft, ChevronRight, Flame, Loader2, List, Rocket, Star, Trophy, Volume2, Sparkles, Home, Play, Pause, SkipForward, Check, X } from "lucide-react";
import confetti from "canvas-confetti";
import { Header } from "@/widgets/header/ui/Header";
import { Character } from "@/widgets/character/ui/Character";
import { ProgressBar } from "@/features/track-progress/ui/ProgressBar";
import { calculateProgress } from "@/features/track-progress/model/progressTracker";
import { supabase, Word } from "@/shared/api/supabase";
import { ROUTES } from "@/shared/config/routes";
import { toast } from "sonner";
import { adaptiveAudioPlayer } from "@/shared/lib/adaptiveAudioPlayer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CharacterState = "idle" | "happy" | "encouraging";
const WORD_AUDIO_OPTIONS = { trimLeadingSilence: true, maxTrimSeconds: 1.2 } as const;

// Fisher-Yates shuffle algorithm for random word order
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Memoized word list item for performance optimization
const WordListItem = memo<{
  word: Word;
  index: number;
  currentWordIndex: number;
  onWordClick: (index: number) => void;
  onPlayAudio: (audioUrl: string, word: string) => void;
  isDisabled: boolean;
}>(({ word, index, currentWordIndex, onWordClick, onPlayAudio, isDisabled }) => {
  const isCurrent = index === currentWordIndex;
  const isCompleted = index < currentWordIndex;

  const handleAudioClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayAudio(
      word.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(word.word)}`,
      word.word
    );
  }, [word.audio_url, word.word, onPlayAudio]);

  const handleClick = useCallback(() => {
    onWordClick(index);
  }, [index, onWordClick]);

  return (
    <div
      className={`glass-card p-4 rounded-xl transition-all ${isCurrent
        ? 'border-2 border-primary glow-cyan bg-primary/10'
        : isCompleted
          ? 'border border-success/30 bg-success/5'
          : 'border border-muted/20'
        }`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '100px' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
        {isCompleted && (
          <Check className="h-3 w-3 text-success ml-auto" />
        )}
        {isCurrent && (
          <Rocket className="h-3 w-3 text-primary ml-auto animate-bounce-subtle" />
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleAudioClick}
          className="flex-shrink-0 glass-card p-2 rounded-lg hover:bg-accent/20 transition-colors border border-accent/30 hover:border-accent"
          title="Play audio"
        >
          <Volume2 className="h-4 w-4 text-accent" />
        </button>

        <button
          onClick={handleClick}
          className="flex-1 text-left hover:bg-primary/10 p-2 rounded-lg transition-colors"
          disabled={isDisabled}
        >
          <p className="text-lg font-semibold">{word.word}</p>
        </button>
      </div>
    </div>
  );
});

export const PracticePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'olympic'; // Default to olympic for backwards compatibility

  const [words, setWords] = useState<Word[]>([]);
  const [originalWords, setOriginalWords] = useState<Word[]>([]); // Keep original for list display
  const [loading, setLoading] = useState(true);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showAllWords, setShowAllWords] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Practice mode states
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [characterState, setCharacterState] = useState<CharacterState>('idle');

  // Calculate these values early so they can be used in callbacks
  const currentWord = words[currentWordIndex];
  const totalWords = words.length;

  // Determine if this is Olympic Mode
  const isOlympicMode = mode === 'olympic';
  const wordTransitionMs = isOlympicMode ? 1500 : 300;

  // Load words on mount
  useEffect(() => {
    loadWords();
  }, []);

  const handleWordClick = useCallback((index: number) => {
    setCurrentWordIndex(index);
    setShowAllWords(false);
    toast.info(`Showing word ${index + 1}`, { icon: '🎯' });
  }, []);

  const handlePlayAudio = useCallback((audioUrl: string, word: string) => {
    adaptiveAudioPlayer.play(audioUrl, WORD_AUDIO_OPTIONS).catch(err => {
      console.error('Audio playback failed:', err);
      toast.error('Audio playback failed');
    });
  }, []);

  const handleRestartMission = () => {
    setCurrentWordIndex(0);
    setShowCompletionModal(false);
    // Reshuffle words
    const shuffled = shuffleArray([...originalWords]);
    setWords(shuffled);
    toast.success("Words reshuffled!", { icon: '🔀' });
  };

  const handleReturnToLevels = () => {
    navigate(ROUTES.TRAINING);
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentWordIndex(prev => prev - 1);
        setIsTransitioning(false);
      }, wordTransitionMs);
    }
  };

  const checkAnswer = () => {
    if (!currentWord || !answer.trim()) return;

    const isCorrect = answer.trim().toLowerCase() === currentWord.word.toLowerCase();
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    setAttempts(prev => prev + 1);

    if (isCorrect) {
      setCharacterState('happy');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      toast.success('Correct! 🎉');

      // Auto-advance to next word after delay
      setTimeout(() => {
        handleNextWord();
        setAnswer('');
        setFeedback(null);
        setCharacterState('idle');
      }, 1500);
    } else {
      setCharacterState('encouraging');
      toast.error('Try again!');
      // Clear feedback after delay
      setTimeout(() => {
        setFeedback(null);
        setCharacterState('idle');
      }, 1500);
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < totalWords - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
        setAnswer('');
        setFeedback(null);
        setAttempts(0);
        setCharacterState('idle');
        setIsTransitioning(false);
      }, wordTransitionMs);
    } else {
      // Reached end
      setShowCompletionModal(true);
      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#00FFFF', '#FF00FF', '#00FF00']
      });
    }
  };

  const loadWords = async () => {
    setLoading(true);
    try {
      const sublevelId = localStorage.getItem('selected_sublevel_id');

      if (!sublevelId) {
        toast.error('No level selected. Redirecting...');
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
        toast.error('No words found.');
        navigate(ROUTES.TRAINING);
        return;
      }

      // Store original order
      setOriginalWords(data);

      // Shuffle for both modes
      const shuffled = shuffleArray(data);
      setWords(shuffled);
      toast.success(`Loaded ${data.length} words in random order!`, { icon: '🔀' });
    } catch (error) {
      console.error('Error loading words:', error);
      toast.error('Failed to load words');
      navigate(ROUTES.TRAINING);
    } finally {
      setLoading(false);
    }
  };


  // Auto-play audio when word loads or changes
  useEffect(() => {
    if (!loading && currentWord) {
      const audioUrl = currentWord.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(currentWord.word)}`;
      adaptiveAudioPlayer.play(audioUrl, WORD_AUDIO_OPTIONS).catch(err => {
        console.error('Auto-play failed:', err);
      });
    }
  }, [currentWordIndex, loading, currentWord]);

  useEffect(() => {
    return () => {
      adaptiveAudioPlayer.stop();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen gradient-grid-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <Rocket className="h-16 w-16 animate-bounce mx-auto text-indigo-500 mb-6" />
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-500 mb-4" />
          <p className="text-lg text-slate-700 font-semibold">Loading Mission Data...</p>
        </div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen gradient-grid-bg flex items-center justify-center">
        <div className="text-center glass-card rounded-3xl p-12">
          <Trophy className="h-16 w-16 mx-auto text-amber-500 mb-6" />
          <p className="text-lg text-slate-500">No mission data available</p>
        </div>
      </div>
    );
  }

  // ===============================================
  // OLYMPIC PRESENTATION MODE - Big Screen Display
  // ===============================================
  if (isOlympicMode) {
    return (
      <div className="h-screen gradient-grid-bg flex flex-col overflow-hidden">
        {/* Minimal Top Bar - Just progress */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between">
          <div className="text-white/60 text-lg font-medium">
            Spelling Olympiad
          </div>
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold text-white">
              {currentWordIndex + 1} <span className="text-white/50">/</span> {totalWords}
            </span>
          </div>
        </div>

        {/* Progress Bar - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="h-2 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
              style={{ width: `${((currentWordIndex + 1) / totalWords) * 100}%` }}
            />
          </div>
        </div>

        {/* Main Content - Word Focus */}
        <main className="flex-1 flex flex-col items-center justify-center p-8 relative">
          {/* Word Display Card */}
          <div className="w-full max-w-6xl">
            {isTransitioning ? (
              <div className="bg-gradient-to-br from-white/95 to-slate-100/95 backdrop-blur-md rounded-[3rem] shadow-2xl p-16 lg:p-24 flex items-center justify-center min-h-[400px] lg:min-h-[500px]">
                <Loader2 className="h-20 w-20 animate-spin text-indigo-500" />
              </div>
            ) : (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-[3rem] shadow-2xl p-12 lg:p-20 xl:p-24 flex items-center justify-center min-h-[400px] lg:min-h-[500px] animate-scale-in border border-white/50">
                <p
                  className="font-bold text-center text-slate-800 tracking-tight leading-tight"
                  style={{
                    fontSize: `clamp(2rem, ${Math.max(3, 12 - currentWord.word.length * 0.3)}vw, 8rem)`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {currentWord.word}
                </p>
              </div>
            )}
          </div>

          {/* Controls Row */}
          <div className="mt-8 flex items-center gap-6">
            {/* Replay Audio */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                adaptiveAudioPlayer.play(
                  currentWord.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(currentWord.word)}`,
                  WORD_AUDIO_OPTIONS
                ).catch(err => {
                  console.error('Audio playback failed:', err);
                  toast.error('Audio playback failed');
                });
              }}
              disabled={isTransitioning}
              className="rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-8 py-6 text-lg"
            >
              <Volume2 className="h-6 w-6 mr-3" />
              Replay Audio
            </Button>

            {/* Word List */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowAllWords(true)}
              disabled={isTransitioning}
              className="rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 px-6 py-6"
            >
              <List className="h-6 w-6" />
            </Button>
          </div>
        </main>

        {/* Navigation - Large Buttons at Sides */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 p-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePreviousWord}
            disabled={currentWordIndex === 0 || isTransitioning}
            className="rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 h-20 w-20 p-0"
          >
            <ChevronLeft className="h-10 w-10" />
          </Button>
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2 p-4">
          <Button
            size="lg"
            onClick={handleNextWord}
            disabled={currentWordIndex === totalWords - 1 || isTransitioning}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white h-20 w-20 p-0 shadow-xl"
          >
            <ChevronRight className="h-10 w-10" />
          </Button>
        </div>

        {/* Word List Modal */}
        <Dialog open={showAllWords} onOpenChange={setShowAllWords}>
          <DialogContent className="glass-card max-w-4xl max-h-[80vh] overflow-hidden border-primary/30">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <List className="h-6 w-6 text-primary" />
                All Words ({totalWords})
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Click on a word to jump to it
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 py-4">
              {words.map((word, index) => (
                <WordListItem
                  key={word.id}
                  word={word}
                  index={index}
                  currentWordIndex={currentWordIndex}
                  onWordClick={handleWordClick}
                  onPlayAudio={handlePlayAudio}
                  isDisabled={isTransitioning}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Showing word indicator */}
        <div className="absolute bottom-8 right-8 text-white/50 text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Showing word {currentWordIndex + 1}
        </div>
      </div>
    );
  }

  // ===============================================
  // PRACTICE MODE - Standard UI
  // ===============================================
  return (
    <div className="h-screen gradient-grid-bg flex flex-col overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0">
        <Header
          showBackButton
          backRoute={ROUTES.TRAINING}
        />
      </div>

      {/* Main Content - Practice Mode Display */}
      <main className="flex-1 flex flex-col relative px-4 overflow-hidden">
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full py-2 md:py-4">

          {/* Top Section: Progress Bar */}
          <div className="flex-shrink-0 mb-3 md:mb-4">
            <div className="glass-card rounded-xl p-2 md:p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs md:text-sm text-muted-foreground">
                  Practice Mode
                </span>
                <span className="text-xs md:text-sm font-bold text-primary">{currentWordIndex + 1} / {totalWords}</span>
              </div>
              <ProgressBar
                current={currentWordIndex + 1}
                total={totalWords}
                label=""
              />
            </div>
          </div>

          {/* Middle Section: Word Display (Main Focus) */}
          <div className="flex-1 flex flex-col justify-center items-center min-h-0 py-4 gap-6">

            {/* Word Display - Minimal Card with Loading State */}
            <div className="w-full max-w-4xl relative">
              {isTransitioning ? (
                <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm p-12 md:p-20 rounded-3xl border border-white/20 flex items-center justify-center min-h-[250px] md:min-h-[350px]">
                  <Loader2 className="h-12 w-12 md:h-16 md:w-16 animate-spin text-white" />
                </div>
              ) : (
                // Practice Mode: Show input in light card
                <div className="bg-gradient-to-br from-white/95 to-slate-100/95 backdrop-blur-sm p-8 md:p-12 rounded-3xl border border-white/30 shadow-2xl animate-scale-in space-y-6">
                  {/* Feedback Message */}
                  {feedback && (
                    <div
                      className={`flex items-center justify-center gap-3 p-4 rounded-xl ${feedback === 'correct'
                        ? 'bg-success/20 border border-success'
                        : 'bg-destructive/20 border border-destructive'
                        }`}
                    >
                      {feedback === 'correct' ? (
                        <>
                          <Check className="h-6 w-6 text-success" />
                          <span className="text-lg font-bold text-success">Correct!</span>
                        </>
                      ) : (
                        <>
                          <X className="h-6 w-6 text-destructive" />
                          <span className="text-lg font-bold text-destructive">Try Again!</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Input Field */}
                  <div className="space-y-3">
                    <label className="text-sm md:text-base text-muted-foreground block text-center">
                      Type the word you hear:
                    </label>
                    <Input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !feedback) {
                          checkAnswer();
                        }
                      }}
                      placeholder="Type here..."
                      className="text-2xl md:text-4xl text-center h-16 md:h-20 rounded-xl"
                      disabled={!!feedback}
                      autoFocus
                    />
                  </div>

                  {/* Check Button */}
                  {!feedback && (
                    <Button
                      onClick={checkAnswer}
                      disabled={!answer.trim()}
                      className="w-full rounded-xl h-12 md:h-14 text-lg bg-gradient-primary"
                    >
                      Check Answer
                    </Button>
                  )}

                  {/* Attempts Counter */}
                  {attempts > 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Attempts: {attempts}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Audio Button - Small and Below Word */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                adaptiveAudioPlayer.play(
                  currentWord.audio_url || `https://api.voicerss.org/?key=YOUR_API_KEY&hl=en-us&src=${encodeURIComponent(currentWord.word)}`,
                  WORD_AUDIO_OPTIONS
                ).catch(err => {
                  console.error('Audio playback failed:', err);
                  toast.error('Audio playback failed');
                });
              }}
              disabled={isTransitioning}
              className="rounded-full glass-card gap-2 px-4 py-2"
            >
              <Volume2 className="h-4 w-4" />
              <span className="text-xs">Replay Audio</span>
            </Button>
          </div>

          {/* Bottom Section: Navigation Controls */}
          <div className="flex-shrink-0 mb-3 md:mb-4">
            <div className="flex items-center justify-center gap-3">
              {/* Skip Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  if (feedback !== 'correct') {
                    toast.info('Skipping to next word');
                    handleNextWord();
                  }
                }}
                disabled={feedback === 'correct' || isTransitioning}
                className="flex-1 rounded-full glass-card"
              >
                <SkipForward className="h-5 w-5 md:h-6 md:w-6 mr-2" />
                Skip
              </Button>

              {/* Word List Button */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAllWords(true)}
                disabled={isTransitioning}
                className="rounded-full glass-card px-4 md:px-6"
              >
                <List className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            </div>
          </div>

        </div>
      </main>

      {/* All Words Modal */}
      <Dialog open={showAllWords} onOpenChange={setShowAllWords}>
        <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto border-primary/30">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Star className="h-6 w-6 text-primary" />
              Words List
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Total words: {totalWords} (random order)
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {words.map((word, index) => (
              <WordListItem
                key={word.id}
                word={word}
                index={index}
                currentWordIndex={currentWordIndex}
                onWordClick={handleWordClick}
                onPlayAudio={handlePlayAudio}
                isDisabled={false}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Completion Modal */}
      <Dialog open={showCompletionModal} onOpenChange={setShowCompletionModal}>
        <DialogContent className="glass-card max-w-lg border-success/30">
          <DialogHeader>
            <DialogTitle className="text-3xl text-center flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-accent" />
              All Words Complete!
              <Trophy className="h-8 w-8 text-accent" />
            </DialogTitle>
          </DialogHeader>

          <div className="text-center py-6 space-y-6">
            {/* Congratulations Message */}
            <div className="space-y-3">
              <div className="text-6xl">🎉</div>
              <h3 className="text-2xl font-bold">
                Great job!
              </h3>
              <p className="text-muted-foreground">
                {isOlympicMode
                  ? `You've reviewed all ${totalWords} words in Olympic Mode!`
                  : `You've completed all ${totalWords} words in Practice Mode!`}
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
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleRestartMission}
                className="w-full rounded-full bg-gradient-primary transition-all group"
                size="lg"
              >
                <Rocket className="mr-2 h-5 w-5" />
                Shuffle & Restart
              </Button>

              <Button
                onClick={handleReturnToLevels}
                variant="outline"
                className="w-full rounded-full glass-card"
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
