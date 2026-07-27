import test from "node:test";
import assert from "node:assert/strict";
import {
  ALPHABET,
  randomLetter,
  createInitialState,
  isSlowed,
  scoreSpeedMultiplier,
  registerHit,
  pickEnemyLetter,
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

test("pickEnemyLetter returns a random letter when the target is already covered", () => {
  for (let i = 0; i < 50; i++) {
    const letter = pickEnemyLetter(["B", "D"], "B");
    assert.ok(ALPHABET.includes(letter));
  }
});
