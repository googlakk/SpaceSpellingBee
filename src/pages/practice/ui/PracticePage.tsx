import { useState, useEffect } from "react";
import { Card } from "@/shared/ui/card";
import { Check, X, Flame } from "lucide-react";
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
import { mockWords } from "@/shared/api/mock/words";
import { ROUTES } from "@/shared/config/routes";

type CharacterState = "idle" | "happy" | "encouraging";

export const PracticePage = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [coins, setCoins] = useState(1250);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState(0);
  const [characterState, setCharacterState] = useState<CharacterState>("idle");
  const [characterMessage, setCharacterMessage] = useState<string>(
    "Listen carefully and spell the word!"
  );

  const currentWord = mockWords[currentWordIndex];
  const totalWords = mockWords.length;

  const handleCheckAnswer = () => {
    const result = checkAnswer(userInput, currentWord.word);
    
    setFeedback(result.isCorrect ? "correct" : "incorrect");
    
    if (result.isCorrect) {
      // Success flow
      setCharacterState("happy");
      setCharacterMessage(`Amazing! You got it right! +${result.coinsEarned} coins`);
      setCoins(prev => prev + result.coinsEarned);
      setStreak(prev => updateStreak(prev, true));
      
      // Confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      
      // Move to next word
      setTimeout(() => {
        if (currentWordIndex < totalWords - 1) {
          setCurrentWordIndex(prev => prev + 1);
          setUserInput("");
          setFeedback(null);
          setCharacterState("idle");
          setCharacterMessage("Listen carefully and spell the word!");
          setProgress(calculateProgress(currentWordIndex + 1, totalWords));
        } else {
          // Round complete!
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.5 }
          });
          setCharacterMessage("🎉 Round Complete! You're amazing!");
        }
      }, 1500);
    } else {
      // Error flow
      setCharacterState("encouraging");
      setCharacterMessage(`Oops! The correct spelling is: ${currentWord.word}. Try again!`);
      setStreak(prev => updateStreak(prev, false));
      
      setTimeout(() => {
        setUserInput("");
        setFeedback(null);
        setCharacterState("idle");
        setCharacterMessage("Listen carefully and spell the word!");
      }, 2000);
    }
  };

  const streakMilestone = getStreakMilestone(streak);

  useEffect(() => {
    setProgress(calculateProgress(currentWordIndex, totalWords));
  }, [currentWordIndex, totalWords]);

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header 
        showBackButton 
        backRoute={ROUTES.TRAINING}
        coins={coins}
        streak={streak}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <ProgressBar 
              current={currentWordIndex + 1}
              total={totalWords}
              label="Round Progress"
            />
          </div>

          {/* Character */}
          <Character 
            state={characterState}
            message={characterMessage}
          />

          {/* Feedback Messages */}
          {feedback && (
            <div className="text-center mb-4">
              {feedback === "correct" && (
                <p className="text-lg text-success font-bold flex items-center justify-center gap-2">
                  <Check className="h-5 w-5" />
                  {characterMessage}
                </p>
              )}
              {feedback === "incorrect" && (
                <p className="text-lg text-error font-bold flex items-center justify-center gap-2">
                  <X className="h-5 w-5" />
                  {characterMessage}
                </p>
              )}
            </div>
          )}

          {/* Audio Button */}
          <div className="mb-8">
            <AudioButton
              text={currentWord.word}
              disabled={feedback !== null}
            />
          </div>

          {/* Input Field */}
          <Card className="p-8 shadow-medium">
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
            <Card className="mt-6 p-4 bg-streak/10 border-streak">
              <div className="flex items-center justify-center gap-2">
                <Flame className="h-6 w-6 text-streak animate-wiggle" />
                <span className="font-bold text-streak text-lg">
                  {streakMilestone}
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
