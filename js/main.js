import { createInputState } from "./input.js";
import { Player } from "./player.js";
import { Enemy, ENEMY_WIDTH } from "./enemy.js";
import { Bullet, rectsOverlap } from "./bullets.js";
import {
  createInitialState,
  registerHit,
  isSlowed,
  scoreSpeedMultiplier,
  pickEnemyLetter,
  SLOWDOWN_FACTOR,
} from "./letterSequence.js";
import { render } from "./render.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const targetLetterEl = document.getElementById("target-letter");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status-message");

const LANE_COUNT = 3;
const laneWidth = canvas.width / LANE_COUNT;

function laneX(index) {
  return laneWidth * index + laneWidth / 2 - ENEMY_WIDTH / 2;
}

const input = createInputState();
const player = new Player(canvas.width, canvas.height);
let bullets = [];
let letterState = createInitialState();

const enemies = [];
for (let i = 0; i < LANE_COUNT; i++) {
  const activeLetters = enemies.map((e) => e.letter);
  enemies.push(new Enemy(laneX(i), pickEnemyLetter(activeLetters, letterState.target)));
}

let statusTimeoutId = null;
function showStatus(message) {
  statusEl.textContent = message;
  clearTimeout(statusTimeoutId);
  statusTimeoutId = setTimeout(() => {
    statusEl.textContent = "";
  }, 1500);
}

function updateHud() {
  targetLetterEl.textContent = letterState.target;
  scoreEl.textContent = String(letterState.score);
}

function respawnEnemy(enemy, laneIndex) {
  const activeLetters = enemies.filter((e) => e !== enemy).map((e) => e.letter);
  enemy.letter = pickEnemyLetter(activeLetters, letterState.target);
  enemy.x = laneX(laneIndex);
  enemy.y = -enemy.height;
}

let lastTime = null;

function frame(time) {
  if (lastTime === null) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  const now = time;

  const slowed = isSlowed(letterState, now);
  const enemyMultiplier = scoreSpeedMultiplier(letterState.score) * (slowed ? SLOWDOWN_FACTOR : 1);
  const playerMultiplier = slowed ? SLOWDOWN_FACTOR : 1;

  player.update(dt, input, playerMultiplier);

  if (input.fire && player.canFire(now)) {
    const spawn = player.fire(now, playerMultiplier);
    bullets.push(new Bullet(spawn.x, spawn.y));
  }

  bullets.forEach((b) => b.update(dt));
  bullets = bullets.filter((b) => b.active);

  enemies.forEach((enemy) => enemy.update(dt, enemyMultiplier, canvas.height));

  hitCheck: for (const bullet of bullets) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (rectsOverlap(bullet, enemy)) {
        bullet.active = false;
        const { state, correct } = registerHit(letterState, enemy.letter, now);
        letterState = state;
        showStatus(correct ? "Nice shot!" : "Not that one — slow down!");
        respawnEnemy(enemy, i);
        updateHud();
        break hitCheck;
      }
    }
  }
  bullets = bullets.filter((b) => b.active);

  render(ctx, canvas, player, enemies, bullets);
  requestAnimationFrame(frame);
}

updateHud();
requestAnimationFrame(frame);
