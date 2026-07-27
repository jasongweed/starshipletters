export const ENEMY_WIDTH = 48;
export const ENEMY_HEIGHT = 36;
const BASE_FALL_SPEED = 40; // px/sec
const MIN_SEPARATION_FACTOR = 1.3;

export class Enemy {
  constructor(x, y, letter) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
  }

  update(dt, speedMultiplier) {
    this.y += BASE_FALL_SPEED * speedMultiplier * dt;
  }

  isOffscreen(canvasHeight) {
    return this.y > canvasHeight;
  }
}

export function randomSpawnX(canvasWidth, existingX = [], attempts = 6) {
  const minSeparation = ENEMY_WIDTH * MIN_SEPARATION_FACTOR;
  for (let i = 0; i < attempts; i++) {
    const x = Math.random() * (canvasWidth - ENEMY_WIDTH);
    if (existingX.every((other) => Math.abs(other - x) >= minSeparation)) {
      return x;
    }
  }
  return Math.random() * (canvasWidth - ENEMY_WIDTH);
}

export function randomSpawnDelay(minMs, maxMs) {
  return minMs + Math.random() * (maxMs - minMs);
}
