import { calculateScore } from "./scoring";

function runTests() {
  console.log("--- Starting Scoring Engine Tests ---");

  // Test 1: Immediate answer (0ms response time, 20s limit)
  const t1 = calculateScore({
    isCorrect: true,
    responseTimeMs: 0,
    timeLimitSeconds: 20,
    pointsMultiplier: 1.0,
    currentStreak: 0,
  });
  console.assert(t1.points === 1000, `Expected 1000, got ${t1.points}`);
  console.assert(t1.newStreak === 1, `Expected streak 1, got ${t1.newStreak}`);
  console.log("✓ Test 1 Passed: Immediate response gets maximum 1000 points.");

  // Test 2: Half-time answer (10s on 20s limit -> responseRatio = 0.5 -> 1000 * (1 - 0.25) = 750)
  const t2 = calculateScore({
    isCorrect: true,
    responseTimeMs: 10000,
    timeLimitSeconds: 20,
    pointsMultiplier: 1.0,
    currentStreak: 0,
  });
  console.assert(t2.points === 750, `Expected 750, got ${t2.points}`);
  console.log("✓ Test 2 Passed: Half-time response gets 750 points.");

  // Test 3: Last-second answer (20s on 20s limit -> responseRatio = 1.0 -> 1000 * (1 - 0.5) = 500)
  const t3 = calculateScore({
    isCorrect: true,
    responseTimeMs: 20000,
    timeLimitSeconds: 20,
    pointsMultiplier: 1.0,
    currentStreak: 0,
  });
  console.assert(t3.points === 500, `Expected 500, got ${t3.points}`);
  console.log("✓ Test 3 Passed: Last-second response gets 500 points.");

  // Test 4: Incorrect answer yields 0 points and resets streak
  const t4 = calculateScore({
    isCorrect: false,
    responseTimeMs: 2000,
    timeLimitSeconds: 20,
    pointsMultiplier: 1.0,
    currentStreak: 3,
  });
  console.assert(t4.points === 0, `Expected 0, got ${t4.points}`);
  console.assert(t4.newStreak === 0, `Expected streak 0, got ${t4.newStreak}`);
  console.log("✓ Test 4 Passed: Incorrect answer resets streak and awards 0 points.");

  // Test 5: Double points multiplier (2.0)
  const t5 = calculateScore({
    isCorrect: true,
    responseTimeMs: 0,
    timeLimitSeconds: 20,
    pointsMultiplier: 2.0,
    currentStreak: 0,
  });
  console.assert(t5.points === 2000, `Expected 2000, got ${t5.points}`);
  console.log("✓ Test 5 Passed: 2X multiplier awards 2000 points.");

  // Test 6: Streak bonuses (+100 for 2-streak, +200 for 3-streak, etc.)
  const t6 = calculateScore({
    isCorrect: true,
    responseTimeMs: 0,
    timeLimitSeconds: 20,
    pointsMultiplier: 1.0,
    currentStreak: 1, // Will become 2
  });
  console.assert(t6.points === 1100, `Expected 1100 (1000 base + 100 bonus), got ${t6.points}`);
  console.assert(t6.streakBonus === 100, `Expected streakBonus 100, got ${t6.streakBonus}`);
  console.log("✓ Test 6 Passed: Streak bonuses accurately computed.");

  console.log("--- All Scoring Engine Tests Passed 100% ---");
}

runTests();
