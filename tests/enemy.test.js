import test from "node:test";
import assert from "node:assert/strict";
import { ENEMY_WIDTH, randomSpawnX, randomSpawnDelay } from "../js/enemy.js";

test("randomSpawnX stays within the canvas bounds", () => {
  for (let i = 0; i < 100; i++) {
    const x = randomSpawnX(480, []);
    assert.ok(x >= 0 && x <= 480 - ENEMY_WIDTH);
  }
});

test("randomSpawnX avoids overlapping existing ships when there's room", () => {
  const existingX = [50, 300];
  for (let i = 0; i < 50; i++) {
    // Generous attempts count so the "give up and return any x" fallback
    // essentially never triggers here, keeping this assertion non-flaky.
    const x = randomSpawnX(480, existingX, 30);
    const tooClose = existingX.some((other) => Math.abs(other - x) < ENEMY_WIDTH * 1.3);
    assert.equal(tooClose, false);
  }
});

test("randomSpawnDelay stays within the requested range", () => {
  for (let i = 0; i < 100; i++) {
    const delay = randomSpawnDelay(500, 1400);
    assert.ok(delay >= 500 && delay <= 1400);
  }
});
