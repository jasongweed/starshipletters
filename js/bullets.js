const BULLET_WIDTH = 4;
const BULLET_HEIGHT = 14;
const BULLET_SPEED = 320; // px/sec

export class Bullet {
  constructor(x, y) {
    this.x = x - BULLET_WIDTH / 2;
    this.y = y;
    this.width = BULLET_WIDTH;
    this.height = BULLET_HEIGHT;
    this.active = true;
  }

  update(dt) {
    this.y -= BULLET_SPEED * dt;
    if (this.y + this.height < 0) this.active = false;
  }
}

export function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
