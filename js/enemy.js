export const ENEMY_WIDTH = 48;
export const ENEMY_HEIGHT = 36;
const BASE_FALL_SPEED = 40; // px/sec

export class Enemy {
  constructor(x, letter) {
    this.x = x;
    this.y = -ENEMY_HEIGHT;
    this.letter = letter;
    this.width = ENEMY_WIDTH;
    this.height = ENEMY_HEIGHT;
  }

  update(dt, speedMultiplier, canvasHeight) {
    this.y += BASE_FALL_SPEED * speedMultiplier * dt;
    if (this.y > canvasHeight) {
      this.y = -this.height;
    }
  }
}
