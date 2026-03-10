import { describe, it, expect } from 'vitest';
import { checkAnswer, calculateAccuracy, CheckAnswerResult } from './checkAnswer';

describe('checkAnswer', () => {
    it('returns correct with 10 coins on first attempt', () => {
        const result: CheckAnswerResult = checkAnswer('hello', 'hello', 1);
        expect(result.isCorrect).toBe(true);
        expect(result.coinsEarned).toBe(10);
        expect(result.correctWord).toBe('hello');
    });

    it('returns correct with 5 coins on second attempt', () => {
        const result = checkAnswer('world', 'world', 2);
        expect(result.isCorrect).toBe(true);
        expect(result.coinsEarned).toBe(5);
    });

    it('returns correct with 2 coins on third attempt', () => {
        const result = checkAnswer('test', 'test', 3);
        expect(result.isCorrect).toBe(true);
        expect(result.coinsEarned).toBe(2);
    });

    it('returns correct with 0 coins on fourth+ attempt', () => {
        const result = checkAnswer('test', 'test', 4);
        expect(result.isCorrect).toBe(true);
        expect(result.coinsEarned).toBe(0);
    });

    it('returns incorrect with 0 coins', () => {
        const result = checkAnswer('helo', 'hello', 1);
        expect(result.isCorrect).toBe(false);
        expect(result.coinsEarned).toBe(0);
        expect(result.correctWord).toBe('hello');
    });

    it('is case-insensitive', () => {
        const result = checkAnswer('HELLO', 'hello', 1);
        expect(result.isCorrect).toBe(true);
    });

    it('trims whitespace', () => {
        const result = checkAnswer('  hello  ', 'hello', 1);
        expect(result.isCorrect).toBe(true);
    });

    it('defaults to attempt 1 if not specified', () => {
        const result = checkAnswer('hello', 'hello');
        expect(result.isCorrect).toBe(true);
        expect(result.coinsEarned).toBe(10);
    });
});

describe('calculateAccuracy', () => {
    it('returns 0 for zero attempts', () => {
        expect(calculateAccuracy(0, 0)).toBe(0);
    });

    it('returns 100 for all correct', () => {
        expect(calculateAccuracy(10, 10)).toBe(100);
    });

    it('returns 50 for half correct', () => {
        expect(calculateAccuracy(5, 10)).toBe(50);
    });

    it('rounds to nearest integer', () => {
        expect(calculateAccuracy(1, 3)).toBe(33);
    });
});
