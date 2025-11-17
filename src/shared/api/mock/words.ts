import type { Word } from '@/entities/word/model/types';

export const mockWords: Word[] = [
  { id: 1, word: 'hello', language: 'en', level: 'junior', round: 1 },
  { id: 2, word: 'world', language: 'en', level: 'junior', round: 1 },
  { id: 3, word: 'spelling', language: 'en', level: 'junior', round: 1 },
  { id: 4, word: 'practice', language: 'en', level: 'junior', round: 1 },
  { id: 5, word: 'champion', language: 'en', level: 'junior', round: 1 },
];

export const getWordsByLevel = (level: 'junior' | 'senior'): Word[] => {
  return mockWords.filter(word => word.level === level);
};

export const getWordById = (id: number): Word | undefined => {
  return mockWords.find(word => word.id === id);
};
