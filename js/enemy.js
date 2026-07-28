export const ENEMY_WIDTH = 48;
export const ENEMY_HEIGHT = 36;
const BASE_SPEED = 40; // px/sec
const MIN_SEPARATION_FACTOR = 1.3;
const OFFSCREEN_MARGIN = 80;
const CROSSFIRE_ANGLE_SPREAD = Math.PI / 4; // +/- 45 degrees from straight across

export class Enemy {
  constructor(x, y, letter, vx = 0, vy = 1) {
    this.x = x;
    this.y = y;
    this.letter = letter;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
    this.vx = vx;
    this.vy = vy;
  }

  update(dt, speedMultiplier) {
    const speed = BASE_SPEED * speedMultiplier;
    this.x += this.vx * speed * dt;
    this.y += this.vy * speed * dt;
  }

  isOffscreen(canvasWidth, canvasHeight) {
    return (
      this.x < -this.width - OFFSCREEN_MARGIN ||
      this.x > canvasWidth + OFFSCREEN_MARGIN ||
      this.y < -this.height - OFFSCREEN_MARGIN ||
      this.y > canvasHeight + OFFSCREEN_MARGIN
    );
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

// Spawns a ship at the edge of the canvas, heading in a straight line generally
// across toward the opposite side, with some random angle jitter so each ship's
// individual trajectory differs while still being linear.
export function computeCrossfireSpawn(edge, canvasWidth, canvasHeight, width, height, angleJitter) {
  let x;
  let y;
  let baseAngle;

  switch (edge) {
    case "left":
      x = -width;
      y = Math.random() * (canvasHeight - height);
      baseAngle = 0;
      break;
    case "right":
      x = canvasWidth;
      y = Math.random() * (canvasHeight - height);
      baseAngle = Math.PI;
      break;
    case "top":
      x = Math.random() * (canvasWidth - width);
      y = -height;
      baseAngle = Math.PI / 2;
      break;
    case "bottom":
    default:
      x = Math.random() * (canvasWidth - width);
      y = canvasHeight;
      baseAngle = -Math.PI / 2;
      break;
  }

  const angle = baseAngle + angleJitter;
  return {
    x,
    y,
    vx: Math.cos(angle),
    vy: Math.sin(angle),
  };
}

const CROSSFIRE_EDGES = ["top", "bottom", "left", "right"];

export function randomCrossfireSpawn(canvasWidth, canvasHeight, width, height) {
  const edge = CROSSFIRE_EDGES[Math.floor(Math.random() * CROSSFIRE_EDGES.length)];
  const angleJitter = (Math.random() * 2 - 1) * CROSSFIRE_ANGLE_SPREAD;
  return computeCrossfireSpawn(edge, canvasWidth, canvasHeight, width, height, angleJitter);
}
