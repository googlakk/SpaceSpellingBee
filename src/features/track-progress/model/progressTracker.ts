export interface ProgressState {
  currentWordIndex: number;
  totalWords: number;
  correctAnswers: number;
  streak: number;
  coinsEarned: number;
}

export const calculateProgress = (
  currentIndex: number,
  total: number
): number => {
  if (total === 0) return 0;
  return Math.round(((currentIndex + 1) / total) * 100);
};

export const updateStreak = (
  currentStreak: number,
  isCorrect: boolean
): number => {
  return isCorrect ? currentStreak + 1 : 0;
};

export const getStreakMilestone = (streak: number): string | null => {
  if (streak === 3) return "🔥 Fire streak!";
  if (streak === 5) return "⭐ Star power!";
  if (streak === 10) return "🏆 Champion!";
  return null;
};

export const calculateXP = (
  correctAnswers: number,
  totalAttempts: number
): number => {
  const accuracy = totalAttempts > 0 ? correctAnswers / totalAttempts : 0;
  return Math.min(Math.round(accuracy * 100), 100);
};
