export interface RoundProgress {
  roundId: number;
  levelType: 'junior' | 'senior';
  totalWords: number;
  completedWords: number;
  correctAnswers: number;
  stars: number;
  completed: boolean;
}

export interface LevelProgress {
  level: 'junior' | 'senior';
  totalRounds: number;
  completedRounds: number;
  progress: number;
}
