import { createInputState } from "./input.js";
import { Player } from "./player.js";
import { Enemy, ENEMY_HEIGHT, randomSpawnX, randomSpawnDelay } from "./enemy.js";
import { Bullet, rectsOverlap } from "./bullets.js";
import {
  createInitialState,
  registerHit,
  isSlowed,
  scoreSpeedMultiplier,
  pickEnemyLetter,
  SLOWDOWN_FACTOR,
} from "./letterSequence.js";
import { createTrailEmitter } from "./particles.js";
import { playShootSound, playCorrectHitSound, unlockAudio } from "./audio.js";
import { speakLetter, initVoices, setVoice, pickPreferredVoice, unlockSpeech } from "./speech.js";
import { createGamepadState } from "./gamepad.js";
import { watchCanvasFit } from "./layout.js";
import { render } from "./render.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const gameArea = document.getElementById("game-area");
const touchControls = document.getElementById("touch-controls");
const targetLabelEl = document.getElementById("target-label");
const targetLetterEl = document.getElementById("target-letter");
const scoreEl = document.getElementById("score");
const statusEl = document.getElementById("status-message");
const moreShipsBtn = document.getElementById("btn-more-ships");
const shipCountEl = document.getElementById("ship-count");
const speedSlider = document.getElementById("speed-slider");
const speedValueEl = document.getElementById("speed-value");
const modeToggleBtn = document.getElementById("btn-mode-toggle");
const replayBtn = document.getElementById("btn-replay-sound");
const voiceSelect = document.getElementById("voice-select");

const SPAWN_MIN_MS = 500;
const SPAWN_MAX_MS = 1400;
const MAX_ENEMIES_CAP = 8;

const input = createInputState();
const gamepadState = createGamepadState();
const player = new Player(canvas.width, canvas.height);
const trail = createTrailEmitter();
watchCanvasFit(canvas, gameArea, touchControls);

function unlockAudioOnFirstInput() {
  unlockAudio();
  unlockSpeech();
}
window.addEventListener("touchstart", unlockAudioOnFirstInput, { once: true, passive: true });
window.addEventListener("mousedown", unlockAudioOnFirstInput, { once: true });
window.addEventListener("keydown", unlockAudioOnFirstInput, { once: true });
let bullets = [];
let enemies = [];
let letterState = createInitialState();
let maxEnemies = 3;
let spawnTimer = 0;
let manualSpeedMultiplier = Number(speedSlider.value);
let listenMode = false;

moreShipsBtn.addEventListener("click", () => {
  maxEnemies = Math.min(MAX_ENEMIES_CAP, maxEnemies + 1);
  shipCountEl.textContent = String(maxEnemies);
  if (maxEnemies >= MAX_ENEMIES_CAP) moreShipsBtn.disabled = true;
});

speedSlider.addEventListener("input", () => {
  manualSpeedMultiplier = Number(speedSlider.value);
  speedValueEl.textContent = `${manualSpeedMultiplier.toFixed(1)}x`;
});

modeToggleBtn.addEventListener("click", () => {
  listenMode = !listenMode;
  modeToggleBtn.textContent = listenMode ? "\u{1F441} Visual Mode" : "\u{1F50A} Listening Mode";
  replayBtn.hidden = !listenMode;
  voiceSelect.hidden = !listenMode;
  updateHud();
  if (listenMode) speakLetter(letterState.target);
});

replayBtn.addEventListener("click", () => {
  speakLetter(letterState.target);
});

voiceSelect.addEventListener("change", () => {
  setVoice(voiceSelect.value);
});

window.addEventListener("gamepadconnected", () => showStatus("\u{1F3AE} Gamepad connected"));
window.addEventListener("gamepaddisconnected", () => showStatus("\u{1F3AE} Gamepad disconnected"));

initVoices((voices) => {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  const listedVoices = englishVoices.length ? englishVoices : voices;

  voiceSelect.innerHTML = "";
  listedVoices.forEach((voice) => {
    const option = document.createElement("option");
    option.value = voice.voiceURI;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });

  const preferred = pickPreferredVoice(listedVoices);
  if (preferred) {
    voiceSelect.value = preferred.voiceURI;
    setVoice(preferred.voiceURI);
  }
});

let statusTimeoutId = null;
function showStatus(message) {
  statusEl.textContent = message;
  clearTimeout(statusTimeoutId);
  statusTimeoutId = setTimeout(() => {
    statusEl.textContent = "";
  }, 1500);
}

function updateHud() {
  if (listenMode) {
    targetLabelEl.textContent = "Listen and shoot:";
    targetLetterEl.textContent = "\u{1F50A}";
  } else {
    targetLabelEl.textContent = "Find and shoot:";
    targetLetterEl.textContent = letterState.target;
  }
  scoreEl.textContent = String(letterState.score);
}

function spawnEnemy(letter) {
  const x = randomSpawnX(canvas.width, enemies.map((e) => e.x));
  const y = -ENEMY_HEIGHT - Math.random() * 40;
  enemies.push(new Enemy(x, y, letter));
}

let lastTime = null;

function frame(time) {
  if (lastTime === null) lastTime = time;
  const dt = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;
  const now = time;

  const slowed = isSlowed(letterState, now);
  const speedMult = scoreSpeedMultiplier(letterState.score) * manualSpeedMultiplier;
  const enemyMultiplier = speedMult * (slowed ? SLOWDOWN_FACTOR : 1);
  const playerMultiplier = slowed ? SLOWDOWN_FACTOR : 1;

  const gamepadInput = gamepadState.poll();
  const combinedInput = {
    left: input.left || gamepadInput.left,
    right: input.right || gamepadInput.right,
  };

  player.update(dt, combinedInput, playerMultiplier);
  trail.update(dt, player.x + player.width / 2, player.y + player.height);

  if (player.canFire(now) && (input.fire || gamepadInput.firePulse)) {
    const spawn = player.fire(now, playerMultiplier);
    bullets.push(new Bullet(spawn.x, spawn.y));
    playShootSound();
  }

  bullets.forEach((bullet) => bullet.update(dt));
  bullets = bullets.filter((bullet) => bullet.active);

  enemies.forEach((enemy) => enemy.update(dt, enemyMultiplier));
  enemies = enemies.filter((enemy) => !enemy.isOffscreen(canvas.height));

  const activeLetters = enemies.map((enemy) => enemy.letter);
  const needsCoverage = enemies.length < maxEnemies && !activeLetters.includes(letterState.target);

  spawnTimer -= dt * 1000;
  if (needsCoverage) {
    spawnEnemy(letterState.target);
    spawnTimer = randomSpawnDelay(SPAWN_MIN_MS, SPAWN_MAX_MS) / speedMult;
  } else if (spawnTimer <= 0 && enemies.length < maxEnemies) {
    spawnEnemy(pickEnemyLetter(activeLetters, letterState.target));
    spawnTimer = randomSpawnDelay(SPAWN_MIN_MS, SPAWN_MAX_MS) / speedMult;
  }

  hitCheck: for (const bullet of bullets) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (rectsOverlap(bullet, enemy)) {
        bullet.active = false;
        const { state, correct } = registerHit(letterState, enemy.letter, now);
        letterState = state;
        showStatus(correct ? "Nice shot!" : "Not that one — slow down!");
        if (correct) {
          playCorrectHitSound();
          if (listenMode) speakLetter(letterState.target);
          enemies.splice(i, 1);
        }
        updateHud();
        break hitCheck;
      }
    }
  }
  bullets = bullets.filter((bullet) => bullet.active);

  render(ctx, canvas, player, enemies, bullets, trail.particles);
  requestAnimationFrame(frame);
}

updateHud();
requestAnimationFrame(frame);
