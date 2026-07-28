import test from "node:test";
import assert from "node:assert/strict";
import {
  Enemy,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  randomSpawnX,
  randomSpawnDelay,
  computeCrossfireSpawn,
  randomCrossfireSpawn,
} from "../js/enemy.js";

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

test("Enemy.update moves along its velocity vector scaled by speed and multiplier", () => {
  const enemy = new Enemy(100, 100, "A", 1, 0);
  enemy.update(1, 2);
  assert.ok(enemy.x > 100);
  assert.equal(enemy.y, 100);
});

test("Enemy defaults to moving straight down when no velocity is given", () => {
  const enemy = new Enemy(100, 100, "A");
  enemy.update(1, 1);
  assert.equal(enemy.x, 100);
  assert.ok(enemy.y > 100);
});

test("Enemy.isOffscreen is false just outside an edge within the margin", () => {
  const enemy = new Enemy(-ENEMY_WIDTH - 10, 100, "A");
  assert.equal(enemy.isOffscreen(480, 600), false);
});

test("Enemy.isOffscreen is true well beyond any edge", () => {
  assert.equal(new Enemy(-1000, 100, "A").isOffscreen(480, 600), true);
  assert.equal(new Enemy(1000, 100, "A").isOffscreen(480, 600), true);
  assert.equal(new Enemy(100, -1000, "A").isOffscreen(480, 600), true);
  assert.equal(new Enemy(100, 1000, "A").isOffscreen(480, 600), true);
});

test("computeCrossfireSpawn from the left edge heads rightward with no jitter", () => {
  const spawn = computeCrossfireSpawn("left", 480, 600, ENEMY_WIDTH, ENEMY_HEIGHT, 0);
  assert.equal(spawn.x, -ENEMY_WIDTH);
  assert.ok(spawn.y >= 0 && spawn.y <= 600 - ENEMY_HEIGHT);
  assert.ok(Math.abs(spawn.vx - 1) < 1e-9);
  assert.ok(Math.abs(spawn.vy - 0) < 1e-9);
});

test("computeCrossfireSpawn from the right edge heads leftward with no jitter", () => {
  const spawn = computeCrossfireSpawn("right", 480, 600, ENEMY_WIDTH, ENEMY_HEIGHT, 0);
  assert.equal(spawn.x, 480);
  assert.ok(Math.abs(spawn.vx + 1) < 1e-9);
});

test("computeCrossfireSpawn from the top edge heads downward with no jitter", () => {
  const spawn = computeCrossfireSpawn("top", 480, 600, ENEMY_WIDTH, ENEMY_HEIGHT, 0);
  assert.equal(spawn.y, -ENEMY_HEIGHT);
  assert.ok(spawn.x >= 0 && spawn.x <= 480 - ENEMY_WIDTH);
  assert.ok(Math.abs(spawn.vy - 1) < 1e-9);
});

test("computeCrossfireSpawn from the bottom edge heads upward with no jitter", () => {
  const spawn = computeCrossfireSpawn("bottom", 480, 600, ENEMY_WIDTH, ENEMY_HEIGHT, 0);
  assert.equal(spawn.y, 600);
  assert.ok(Math.abs(spawn.vy + 1) < 1e-9);
});

test("randomCrossfireSpawn always returns a unit-length velocity vector", () => {
  for (let i = 0; i < 50; i++) {
    const spawn = randomCrossfireSpawn(480, 600, ENEMY_WIDTH, ENEMY_HEIGHT);
    const magnitude = Math.sqrt(spawn.vx * spawn.vx + spawn.vy * spawn.vy);
    assert.ok(Math.abs(magnitude - 1) < 1e-6);
  }
});
