import test from "node:test";
import assert from "node:assert/strict";
import {
  ALPHABET,
  LOWERCASE_ALPHABET,
  NUMBER_SYMBOLS,
  randomLetter,
  createInitialState,
  isSlowed,
  scoreSpeedMultiplier,
  registerHit,
  pickEnemyLetter,
  buildSymbolPool,
  getSymbolKind,
  SLOWDOWN_DURATION_MS,
  SLOWDOWN_FACTOR,
  SCORE_PER_HIT,
} from "../js/letterSequence.js";

test("randomLetter never returns the excluded letter", () => {
  for (let i = 0; i < 200; i++) {
    assert.notEqual(randomLetter("A"), "A");
  }
});

test("randomLetter only returns letters from the alphabet", () => {
  const letter = randomLetter();
  assert.ok(ALPHABET.includes(letter));
});

test("createInitialState starts at score 0 with no active slowdown", () => {
  const state = createInitialState();
  assert.equal(state.score, 0);
  assert.equal(isSlowed(state, 0), false);
  assert.ok(ALPHABET.includes(state.target));
});

test("registerHit on a correct letter increases score and picks a new target", () => {
  const state = { target: "B", score: 20, slowdownUntil: 0 };
  const { state: next, correct } = registerHit(state, "B", 1000);
  assert.equal(correct, true);
  assert.equal(next.score, 20 + SCORE_PER_HIT);
  assert.notEqual(next.target, "B");
  assert.equal(next.slowdownUntil, 0);
});

test("registerHit on a wrong letter applies slowdown and does not change score or target", () => {
  const state = { target: "B", score: 20, slowdownUntil: 0 };
  const { state: next, correct } = registerHit(state, "Z", 1000);
  assert.equal(correct, false);
  assert.equal(next.score, 20);
  assert.equal(next.target, "B");
  assert.equal(next.slowdownUntil, 1000 + SLOWDOWN_DURATION_MS);
});

test("isSlowed reflects whether now is before slowdownUntil", () => {
  const state = { target: "A", score: 0, slowdownUntil: 5000 };
  assert.equal(isSlowed(state, 4000), true);
  assert.equal(isSlowed(state, 5000), false);
  assert.equal(isSlowed(state, 6000), false);
});

test("scoreSpeedMultiplier increases with score and caps at the configured max", () => {
  const low = scoreSpeedMultiplier(0);
  const mid = scoreSpeedMultiplier(100);
  const high = scoreSpeedMultiplier(1000);
  assert.equal(low, 1);
  assert.ok(mid > low);
  assert.ok(high > mid);
  assert.equal(high, 3);
});

test("SLOWDOWN_FACTOR is a genuine slowdown, not a speedup", () => {
  assert.ok(SLOWDOWN_FACTOR < 1);
});

test("pickEnemyLetter forces the target letter when no active ship carries it", () => {
  const letter = pickEnemyLetter(["C", "D"], "B");
  assert.equal(letter, "B");
});

test("pickEnemyLetter returns a valid letter when the target is already covered", () => {
  for (let i = 0; i < 50; i++) {
    const letter = pickEnemyLetter(["B", "D"], "B");
    assert.ok(ALPHABET.includes(letter));
  }
});

test("pickEnemyLetter sometimes duplicates the target so multiple correct ships can coexist", () => {
  let sawDuplicate = false;
  for (let i = 0; i < 500; i++) {
    if (pickEnemyLetter(["B"], "B") === "B") {
      sawDuplicate = true;
      break;
    }
  }
  assert.ok(sawDuplicate);
});

test("buildSymbolPool defaults to just the uppercase alphabet", () => {
  const pool = buildSymbolPool();
  assert.deepEqual(pool, ALPHABET);
});

test("buildSymbolPool adds lowercase letters and numbers when requested", () => {
  const pool = buildSymbolPool({ includeLowercase: true, includeNumbers: true });
  assert.equal(pool.length, ALPHABET.length + LOWERCASE_ALPHABET.length + NUMBER_SYMBOLS.length);
  assert.ok(LOWERCASE_ALPHABET.every((letter) => pool.includes(letter)));
  assert.ok(NUMBER_SYMBOLS.every((number) => pool.includes(number)));
});

test("buildSymbolPool can exclude uppercase when includeUppercase is false", () => {
  const pool = buildSymbolPool({ includeUppercase: false, includeLowercase: true });
  assert.deepEqual(pool, LOWERCASE_ALPHABET);
});

test("getSymbolKind classifies uppercase, lowercase, and number symbols", () => {
  assert.equal(getSymbolKind("A"), "uppercase");
  assert.equal(getSymbolKind("z"), "lowercase");
  assert.equal(getSymbolKind("7"), "number");
  assert.equal(getSymbolKind("20"), "number");
});

test("randomLetter draws from a custom pool when one is given", () => {
  const pool = ["1", "2", "3"];
  for (let i = 0; i < 50; i++) {
    assert.ok(pool.includes(randomLetter(undefined, pool)));
  }
});

test("registerHit picks the next target from a custom pool", () => {
  const pool = ["1", "2", "3"];
  const state = { target: "1", score: 0, slowdownUntil: 0 };
  for (let i = 0; i < 50; i++) {
    const { state: next } = registerHit(state, "1", 0, pool);
    assert.ok(pool.includes(next.target));
  }
});

test("pickEnemyLetter draws from a custom pool when the target is covered", () => {
  const pool = ["1", "2", "3"];
  for (let i = 0; i < 50; i++) {
    assert.ok(pool.includes(pickEnemyLetter(["1", "2"], "1", pool)));
  }
});
