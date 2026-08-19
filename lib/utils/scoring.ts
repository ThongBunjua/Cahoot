/**
 * Anti-Cheat Scoring Calculation Engine
 * 
 * Formula: Score = Floor(1000 * (1 - (response_time / time_limit) / 2)) * multiplier
 * 
 * Rules:
 * 1. Evaluated strictly against Host-recorded questionStartTime to prevent client clock tampering.
 * 2. If answer is incorrect or timed out: 0 points.
 * 3. Fastest answer approaches 1000 points (e.g. instant ~1000, half-time ~750, last second ~500).
 * 4. Streak bonus: +100 bonus points for 2-streak, +200 for 3-streak, up to +500 for 5+ streak!
 */
export function calculateScore({
  isCorrect,
  responseTimeMs,
  timeLimitSeconds,
  pointsMultiplier = 1.0,
  currentStreak = 0,
}: {
  isCorrect: boolean;
  responseTimeMs: number;
  timeLimitSeconds: number;
  pointsMultiplier?: number;
  currentStreak?: number;
}): { points: number; newStreak: number; streakBonus: number } {
  if (!isCorrect || pointsMultiplier === 0) {
    return { points: 0, newStreak: 0, streakBonus: 0 };
  }

  const timeLimitMs = timeLimitSeconds * 1000;
  const clampedResponseTime = Math.max(0, Math.min(responseTimeMs, timeLimitMs));
  const responseRatio = clampedResponseTime / timeLimitMs;

  // Base score: 1000 * (1 - (response_time / time_limit) / 2)
  const rawBaseScore = 1000 * (1 - responseRatio / 2);
  const basePoints = Math.max(0, Math.floor(rawBaseScore * pointsMultiplier));

  // Streak bonus calculation
  const newStreak = currentStreak + 1;
  let streakBonus = 0;
  if (newStreak === 2) streakBonus = 100;
  else if (newStreak === 3) streakBonus = 200;
  else if (newStreak === 4) streakBonus = 350;
  else if (newStreak >= 5) streakBonus = 500;

  const totalPoints = basePoints + streakBonus;

  return {
    points: totalPoints,
    newStreak,
    streakBonus,
  };
}
