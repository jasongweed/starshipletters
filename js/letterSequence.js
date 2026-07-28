export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
export const LOWERCASE_ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");
export const NUMBER_SYMBOLS = Array.from({ length: 20 }, (_, i) => String(i + 1));

export const SCORE_PER_HIT = 10;
export const SLOWDOWN_DURATION_MS = 2500;
export const SLOWDOWN_FACTOR = 0.4;
export const SPEED_SCORE_CAP = 200;
export const MAX_SCORE_SPEED_MULTIPLIER = 3;
export const DUPLICATE_TARGET_CHANCE = 0.05;

export function buildSymbolPool({ includeUppercase = true, includeLowercase = false, includeNumbers = false } = {}) {
  let pool = [];
  if (includeUppercase) pool = pool.concat(ALPHABET);
  if (includeLowercase) pool = pool.concat(LOWERCASE_ALPHABET);
  if (includeNumbers) pool = pool.concat(NUMBER_SYMBOLS);
  return pool;
}

export function getSymbolKind(symbol) {
  if (/^[0-9]+$/.test(symbol)) return "number";
  if (/^[a-z]$/.test(symbol)) return "lowercase";
  return "uppercase";
}

export function randomLetter(exclude, pool = ALPHABET) {
  const candidates = exclude ? pool.filter((symbol) => symbol !== exclude) : pool;
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function createInitialState(pool = ALPHABET) {
  return {
    target: randomLetter(undefined, pool),
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

export function registerHit(state, hitLetter, now, pool = ALPHABET) {
  if (hitLetter === state.target) {
    return {
      state: {
        ...state,
        score: state.score + SCORE_PER_HIT,
        target: randomLetter(state.target, pool),
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

export function pickEnemyLetter(activeLetters, target, pool = ALPHABET) {
  if (!activeLetters.includes(target)) return target;
  if (Math.random() < DUPLICATE_TARGET_CHANCE) return target;
  return randomLetter(undefined, pool);
}
