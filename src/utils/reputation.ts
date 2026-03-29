/**
 * Reputation logic for the learner board application.
 * Responsibility: Calculate user levels and display names based on reputation scores.
 */

export type UserLevel = '初学者' | '中級者' | '上級者' | 'マスター';

/**
 * Get the level name based on the reputation score.
 * @param reputation The user's reputation score.
 * @returns The level name.
 */
export function getLevelName(reputation: number): UserLevel {
  if (reputation < 100) return '初学者';
  if (reputation < 500) return '中級者';
  if (reputation < 1000) return '上級者';
  return 'マスター';
}

/**
 * Calculate the next level threshold and progress.
 * @param reputation The user's reputation score.
 * @returns An object with nextThreshold and progress percentage.
 */
export function getLevelProgress(reputation: number): { nextThreshold: number; progress: number } {
  if (reputation < 100) return { nextThreshold: 100, progress: (reputation / 100) * 100 };
  if (reputation < 500) return { nextThreshold: 500, progress: ((reputation - 100) / 400) * 100 };
  if (reputation < 1000) return { nextThreshold: 1000, progress: ((reputation - 500) / 500) * 100 };
  return { nextThreshold: 1000, progress: 100 };
}
