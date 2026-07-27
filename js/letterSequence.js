export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const SCORE_PER_HIT = 10;
export const SLOWDOWN_DURATION_MS = 2500;
export const SLOWDOWN_FACTOR = 0.4;
export const SPEED_SCORE_CAP = 200;
export const MAX_SCORE_SPEED_MULTIPLIER = 3;
export const DUPLICATE_TARGET_CHANCE = 0.35;

export function randomLetter(exclude) {
  const pool = exclude ? ALPHABET.filter((letter) => letter !== exclude) : ALPHABET;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function createInitialState() {
  return {
    target: randomLetter(),
    score: 0,
    slowdownUntil: 0,
  };
}

export function isSlowed(state, now) {
  return now < state.slowdownUntil;
}

export function scoreSpeedMultiplier(score) {
  return 1 + Math.min(score / SPEED_SCORE_CAP, MAX_SCORE_SPEED_MULTIPLIER - 1);
}

export function registerHit(state, hitLetter, now) {
  if (hitLetter === state.target) {
    return {
      state: {
        ...state,
        score: state.score + SCORE_PER_HIT,
        target: randomLetter(state.target),
      },
      correct: true,
    };
  }
  return {
    state: {
      ...state,
      slowdownUntil: now + SLOWDOWN_DURATION_MS,
    },
    correct: false,
  };
}

export function pickEnemyLetter(activeLetters, target) {
  if (!activeLetters.includes(target)) return target;
  if (Math.random() < DUPLICATE_TARGET_CHANCE) return target;
  return randomLetter();
}
