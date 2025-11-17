export interface CheckAnswerResult {
  isCorrect: boolean;
  coinsEarned: number;
  correctWord: string;
}

export const checkAnswer = (
  userInput: string,
  correctWord: string,
  attemptNumber: number = 1
): CheckAnswerResult => {
  const normalizedInput = userInput.toLowerCase().trim();
  const normalizedCorrect = correctWord.toLowerCase().trim();
  const isCorrect = normalizedInput === normalizedCorrect;

  let coinsEarned = 0;
  if (isCorrect) {
    // Награда зависит от попытки
    if (attemptNumber === 1) coinsEarned = 10;
    else if (attemptNumber === 2) coinsEarned = 5;
    else if (attemptNumber === 3) coinsEarned = 2;
  }

  return {
    isCorrect,
    coinsEarned,
    correctWord,
  };
};

export const calculateAccuracy = (
  correctAnswers: number,
  totalAttempts: number
): number => {
  if (totalAttempts === 0) return 0;
  return Math.round((correctAnswers / totalAttempts) * 100);
};
