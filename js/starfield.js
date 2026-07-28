const STAR_COUNT = 60;
const MIN_SPEED = 30; // px/sec
const MAX_SPEED = 90; // px/sec
const MIN_RADIUS = 0.5;
const MAX_RADIUS = 1.8;

function randomStar(canvasWidth, canvasHeight) {
  return {
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
    radius: MIN_RADIUS + Math.random() * (MAX_RADIUS - MIN_RADIUS),
    alpha: 0.3 + Math.random() * 0.7,
  };
}

// A slow, decorative backdrop of drifting points to suggest forward motion
// through space. Purely visual — no gameplay effect.
export function createStarfield(canvasWidth, canvasHeight, count = STAR_COUNT) {
  const stars = Array.from({ length: count }, () => randomStar(canvasWidth, canvasHeight));

  return {
    stars,
    update(dt) {
      for (const star of stars) {
        star.y += star.speed * dt;
        if (star.y > canvasHeight) {
          star.y = 0;
          star.x = Math.random() * canvasWidth;
        }
      }
    },
  };
}
