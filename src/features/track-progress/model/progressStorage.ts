/**
 * Progress Storage Utility
 * Manages saving and loading student progress in localStorage
 */

export interface PracticeProgress {
  currentWordIndex: number;
  coins: number;
  streak: number;
  hintsUsed: number;
  lastUpdated: string;
}

const PROGRESS_KEY_PREFIX = 'practice_progress_';

/**
 * Get the localStorage key for a specific sublevel
 */
export const getProgressKey = (sublevelId: string): string => {
  return `${PROGRESS_KEY_PREFIX}${sublevelId}`;
};

/**
 * Save progress for a specific sublevel
 */
export const saveProgress = (sublevelId: string, progress: Omit<PracticeProgress, 'lastUpdated'>): void => {
  try {
    const key = getProgressKey(sublevelId);
    const progressWithTimestamp: PracticeProgress = {
      ...progress,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(key, JSON.stringify(progressWithTimestamp));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
};

/**
 * Load progress for a specific sublevel
 */
export const loadProgress = (sublevelId: string): PracticeProgress | null => {
  try {
    const key = getProgressKey(sublevelId);
    const savedProgress = localStorage.getItem(key);

    if (savedProgress) {
      return JSON.parse(savedProgress);
    }
    return null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
};

/**
 * Clear progress for a specific sublevel
 */
export const clearProgress = (sublevelId: string): void => {
  try {
    const key = getProgressKey(sublevelId);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
};

/**
 * Get all saved progress keys
 */
export const getAllProgressKeys = (): string[] => {
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(PROGRESS_KEY_PREFIX)) {
        keys.push(key);
      }
    }
  } catch (error) {
    console.error('Error getting progress keys:', error);
  }
  return keys;
};

/**
 * Clear all saved progress
 */
export const clearAllProgress = (): void => {
  try {
    const keys = getAllProgressKeys();
    keys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error('Error clearing all progress:', error);
  }
};
