const PLAYER_WIDTH = 44;
const PLAYER_HEIGHT = 32;
const BASE_MOVE_SPEED = 240; // px/sec
const FIRE_COOLDOWN_MS = 400;
const BOTTOM_MARGIN = 12;

export class Player {
  constructor(canvasWidth, canvasHeight) {
    this.width = PLAYER_WIDTH;
    this.height = PLAYER_HEIGHT;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.x = canvasWidth / 2 - this.width / 2;
    this.y = canvasHeight - this.height - BOTTOM_MARGIN;
    this.cooldownUntil = 0;
  }

  update(dt, input, speedMultiplier) {
    const speed = BASE_MOVE_SPEED * speedMultiplier;
    if (input.left) this.x -= speed * dt;
    if (input.right) this.x += speed * dt;
    if (input.up) this.y -= speed * dt;
    if (input.down) this.y += speed * dt;
    this.x = Math.max(0, Math.min(this.canvasWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(this.canvasHeight - this.height, this.y));
  }

  resetToBottom() {
    this.y = this.canvasHeight - this.height - BOTTOM_MARGIN;
  }

  canFire(now) {
    return now >= this.cooldownUntil;
  }

  fire(now, speedMultiplier) {
    this.cooldownUntil = now + FIRE_COOLDOWN_MS / speedMultiplier;
    return { x: this.x + this.width / 2, y: this.y };
  }
}
