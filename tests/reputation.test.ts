/**
 * Unit tests for reputation logic.
 * Responsibility: Verify the correctness of level names and progress calculations.
 */

import { describe, it, expect } from 'vitest';
import { getLevelName, getLevelProgress } from '../src/utils/reputation';

describe('Reputation Logic', () => {
  describe('getLevelName', () => {
    it('returns "初学者" for reputation < 100', () => {
      expect(getLevelName(0)).toBe('初学者');
      expect(getLevelName(99)).toBe('初学者');
    });

    it('returns "中級者" for reputation between 100 and 499', () => {
      expect(getLevelName(100)).toBe('中級者');
      expect(getLevelName(499)).toBe('中級者');
    });

    it('returns "上級者" for reputation between 500 and 999', () => {
      expect(getLevelName(500)).toBe('上級者');
      expect(getLevelName(999)).toBe('上級者');
    });

    it('returns "マスター" for reputation >= 1000', () => {
      expect(getLevelName(1000)).toBe('マスター');
      expect(getLevelName(5000)).toBe('マスター');
    });
  });

  describe('getLevelProgress', () => {
    it('calculates progress correctly for first level', () => {
      const { progress } = getLevelProgress(50);
      expect(progress).toBe(50);
    });

    it('calculates progress correctly for second level', () => {
      // (150 - 100) / (500 - 100) = 50 / 400 = 12.5%
      const { progress } = getLevelProgress(150);
      expect(progress).toBe(12.5);
    });
  });
});
