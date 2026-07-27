function drawTrail(ctx, particles) {
  for (const particle of particles) {
    const alpha = 1 - particle.progress;
    const radius = 4 + particle.progress * 10;
    ctx.beginPath();
    ctx.fillStyle = `rgba(180, 190, 200, ${alpha * 0.6})`;
    ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPlayer(ctx, player) {
  const { x, y, width, height } = player;
  const centerX = x + width / 2;

  const flicker = 0.7 + Math.random() * 0.3;
  const flameHeight = 18 * flicker;
  const flameGradient = ctx.createLinearGradient(centerX, y + height, centerX, y + height + flameHeight);
  flameGradient.addColorStop(0, "#fff3b0");
  flameGradient.addColorStop(0.5, "#ffa63f");
  flameGradient.addColorStop(1, "rgba(255, 90, 30, 0)");
  ctx.fillStyle = flameGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - width * 0.18, y + height - 2);
  ctx.lineTo(centerX + width * 0.18, y + height - 2);
  ctx.lineTo(centerX, y + height + flameHeight);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#e8ecf1";
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + width * 0.78, y + height * 0.55);
  ctx.lineTo(x + width * 0.78, y + height);
  ctx.lineTo(x + width * 0.22, y + height);
  ctx.lineTo(x + width * 0.22, y + height * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#4dd8ff";
  ctx.beginPath();
  ctx.moveTo(centerX, y);
  ctx.lineTo(x + width * 0.6, y + height * 0.4);
  ctx.lineTo(x + width * 0.4, y + height * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#ff6b6b";
  ctx.beginPath();
  ctx.moveTo(x + width * 0.22, y + height * 0.65);
  ctx.lineTo(x, y + height);
  ctx.lineTo(x + width * 0.22, y + height);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x + width * 0.78, y + height * 0.65);
  ctx.lineTo(x + width, y + height);
  ctx.lineTo(x + width * 0.78, y + height);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "#161a40";
  ctx.beginPath();
  ctx.arc(centerX, y + height * 0.35, width * 0.1, 0, Math.PI * 2);
  ctx.fill();
}

export function render(ctx, canvas, player, enemies, bullets, trailParticles) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawTrail(ctx, trailParticles);
  drawPlayer(ctx, player);

  ctx.font = 'bold 20px "Trebuchet MS", sans-serif';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  for (const enemy of enemies) {
    ctx.fillStyle = "#ff6b6b";
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(enemy.letter, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
  }

  ctx.fillStyle = "#ffd23f";
  for (const bullet of bullets) {
    ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  }
}
