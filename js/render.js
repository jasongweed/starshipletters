export function render(ctx, canvas, player, enemies, bullets) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#4dd8ff";
  ctx.fillRect(player.x, player.y, player.width, player.height);
  ctx.fillStyle = "#05061a";
  ctx.fillRect(player.x + player.width / 2 - 3, player.y - 10, 6, 10);

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
