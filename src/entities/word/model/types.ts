export interface Word {
  id: number;
  word: string;
  language: 'en' | 'ky' | 'ru';
  level: 'junior' | 'senior';
  round: number;
  audioUrl?: string;
}

export interface WordProgress {
  wordId: number;
  correctAttempts: number;
  totalAttempts: number;
  lastPracticedAt: Date;
  status: 'new' | 'learning' | 'mastered' | 'struggling';
}
