import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    saveProgress,
    loadProgress,
    clearProgress,
    getAllProgressKeys,
    clearAllProgress,
    getProgressKey,
} from './progressStorage';

// Mock localStorage
const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
        getItem: vi.fn((key: string) => store[key] ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store[key] = value;
        }),
        removeItem: vi.fn((key: string) => {
            delete store[key];
        }),
        clear: vi.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('progressStorage', () => {
    beforeEach(() => {
        localStorageMock.clear();
        vi.clearAllMocks();
    });

    describe('getProgressKey', () => {
        it('generates key with prefix', () => {
            expect(getProgressKey('sub-1')).toBe('practice_progress_sub-1');
        });
    });

    describe('saveProgress', () => {
        it('saves progress to localStorage', () => {
            saveProgress('sub-1', { currentWordIndex: 3, coins: 25, streak: 2, hintsUsed: 1 });
            expect(localStorageMock.setItem).toHaveBeenCalledWith(
                'practice_progress_sub-1',
                expect.stringContaining('"currentWordIndex":3'),
            );
        });

        it('includes lastUpdated timestamp', () => {
            saveProgress('sub-1', { currentWordIndex: 0, coins: 0, streak: 0, hintsUsed: 0 });
            const savedValue = localStorageMock.setItem.mock.calls[0][1] as string;
            const parsed = JSON.parse(savedValue);
            expect(parsed.lastUpdated).toBeDefined();
            expect(new Date(parsed.lastUpdated).getTime()).not.toBeNaN();
        });
    });

    describe('loadProgress', () => {
        it('returns null when no progress saved', () => {
            expect(loadProgress('non-existent')).toBeNull();
        });

        it('returns saved progress', () => {
            const progress = { currentWordIndex: 5, coins: 50, streak: 3, hintsUsed: 0, lastUpdated: '2026-01-01T00:00:00.000Z' };
            localStorageMock.setItem('practice_progress_sub-1', JSON.stringify(progress));
            expect(loadProgress('sub-1')).toEqual(progress);
        });
    });

    describe('clearProgress', () => {
        it('removes progress from localStorage', () => {
            localStorageMock.setItem('practice_progress_sub-1', '{}');
            clearProgress('sub-1');
            expect(localStorageMock.removeItem).toHaveBeenCalledWith('practice_progress_sub-1');
        });
    });

    describe('getAllProgressKeys', () => {
        it('returns only progress keys', () => {
            localStorageMock.setItem('practice_progress_sub-1', '{}');
            localStorageMock.setItem('practice_progress_sub-2', '{}');
            localStorageMock.setItem('other_key', '{}');
            const keys = getAllProgressKeys();
            expect(keys).toHaveLength(2);
            expect(keys).toContain('practice_progress_sub-1');
            expect(keys).toContain('practice_progress_sub-2');
        });
    });

    describe('clearAllProgress', () => {
        it('removes all progress keys', () => {
            localStorageMock.setItem('practice_progress_sub-1', '{}');
            localStorageMock.setItem('practice_progress_sub-2', '{}');
            clearAllProgress();
            expect(localStorageMock.removeItem).toHaveBeenCalledTimes(2);
        });
    });
});
