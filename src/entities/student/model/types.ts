export interface Student {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  coins: number;
  streak: number;
  xp: number;
  level: number;
  avatarUrl?: string;
}

export interface StudentStats {
  totalCoins: number;
  currentStreak: number;
  starsEarned: number;
  totalStars: number;
  badgesEarned: number;
  totalBadges: number;
  accuracy: number;
  wordsMastered: number;
}
