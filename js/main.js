import { createInputState } from "./input.js";
import { Player } from "./player.js";
import {
  Enemy,
  ENEMY_WIDTH,
  ENEMY_HEIGHT,
  randomSpawnX,
  randomSpawnDelay,
  randomCrossfireSpawn,
} from "./enemy.js";
import { Bullet, rectsOverlap } from "./bullets.js";
import {
  createInitialState,
  registerHit,
  isSlowed,
  scoreSpeedMultiplier,
  pickEnemyLetter,
  buildSymbolPool,
  SLOWDOWN_FACTOR,
} from "./letterSequence.js";
import { createTrailEmitter } from "./particles.js";
import { playShootSound, playCorrectHitSound, unlockAudio } from "./audio.js";
import { speakLetter, initVoices, setVoice, pickPreferredVoice, unlockSpeech } from "./speech.js";
import { createGamepadState } from "./gamepad.js";
import { watchCanvasFit } from "./layout.js";
import { createStarfield } from "./starfield.js";
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
const crossfireToggleBtn = document.getElementById("btn-crossfire-toggle");
const uppercaseToggleBtn = document.getElementById("btn-uppercase-toggle");
const lowercaseToggleBtn = document.getElementById("btn-lowercase-toggle");
const numbersToggleBtn = document.getElementById("btn-numbers-toggle");

const SPAWN_MIN_MS = 500;
const SPAWN_MAX_MS = 1400;
const MAX_ENEMIES_CAP = 8;

const input = createInputState();
const gamepadState = createGamepadState();
const player = new Player(canvas.width, canvas.height);
const trail = createTrailEmitter();
const starfield = createStarfield(canvas.width, canvas.height);
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
let includeUppercase = true;
let includeLowercase = false;
let includeNumbers = false;
let symbolPool = buildSymbolPool({ includeUppercase, includeLowercase, includeNumbers });
let letterState = createInitialState(symbolPool);
let maxEnemies = 3;
let spawnTimer = 0;
let manualSpeedMultiplier = Number(speedSlider.value);
let listenMode = false;
let crossfireMode = false;

function refreshSymbolPool() {
  symbolPool = buildSymbolPool({ includeUppercase, includeLowercase, includeNumbers });
}

// Returns false (and blocks the toggle) if turning this category off would
// leave all three symbol categories disabled, which would empty the pool.
function canDisable(otherA, otherB) {
  return otherA || otherB;
}

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

crossfireToggleBtn.addEventListener("click", () => {
  crossfireMode = !crossfireMode;
  crossfireToggleBtn.textContent = crossfireMode ? "\u{1F680} Classic Mode" : "\u{1F6F8} Crossfire Mode";
  if (!crossfireMode) player.resetToBottom();
});

uppercaseToggleBtn.addEventListener("click", () => {
  if (includeUppercase && !canDisable(includeLowercase, includeNumbers)) {
    showStatus("Keep at least one letter type on");
    return;
  }
  includeUppercase = !includeUppercase;
  uppercaseToggleBtn.textContent = includeUppercase ? "\u{1F520} Remove Uppercase" : "\u{1F520} Add Uppercase";
  refreshSymbolPool();
});

lowercaseToggleBtn.addEventListener("click", () => {
  if (includeLowercase && !canDisable(includeUppercase, includeNumbers)) {
    showStatus("Keep at least one letter type on");
    return;
  }
  includeLowercase = !includeLowercase;
  lowercaseToggleBtn.textContent = includeLowercase ? "\u{1F521} Remove Lowercase" : "\u{1F521} Add Lowercase";
  refreshSymbolPool();
});

numbersToggleBtn.addEventListener("click", () => {
  if (includeNumbers && !canDisable(includeUppercase, includeLowercase)) {
    showStatus("Keep at least one letter type on");
    return;
  }
  includeNumbers = !includeNumbers;
  numbersToggleBtn.textContent = includeNumbers ? "\u{1F522} Remove Numbers" : "\u{1F522} Add Numbers";
  refreshSymbolPool();
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
  if (crossfireMode) {
    const spawn = randomCrossfireSpawn(canvas.width, canvas.height, ENEMY_WIDTH, ENEMY_HEIGHT);
    enemies.push(new Enemy(spawn.x, spawn.y, letter, spawn.vx, spawn.vy));
    return;
  }
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
    up: crossfireMode && (input.up || gamepadInput.up),
    down: crossfireMode && (input.down || gamepadInput.down),
  };

  player.update(dt, combinedInput, playerMultiplier);
  trail.update(dt, player.x + player.width / 2, player.y + player.height);
  starfield.update(dt);

  if (player.canFire(now) && (input.fire || gamepadInput.firePulse)) {
    const spawn = player.fire(now, playerMultiplier);
    bullets.push(new Bullet(spawn.x, spawn.y));
    playShootSound();
  }

  bullets.forEach((bullet) => bullet.update(dt));
  bullets = bullets.filter((bullet) => bullet.active);

  enemies.forEach((enemy) => enemy.update(dt, enemyMultiplier));
  enemies = enemies.filter((enemy) => !enemy.isOffscreen(canvas.width, canvas.height));

  const activeLetters = enemies.map((enemy) => enemy.letter);
  const needsCoverage = enemies.length < maxEnemies && !activeLetters.includes(letterState.target);

  spawnTimer -= dt * 1000;
  if (needsCoverage) {
    spawnEnemy(letterState.target);
    spawnTimer = randomSpawnDelay(SPAWN_MIN_MS, SPAWN_MAX_MS) / speedMult;
  } else if (spawnTimer <= 0 && enemies.length < maxEnemies) {
    spawnEnemy(pickEnemyLetter(activeLetters, letterState.target, symbolPool));
    spawnTimer = randomSpawnDelay(SPAWN_MIN_MS, SPAWN_MAX_MS) / speedMult;
  }

  hitCheck: for (const bullet of bullets) {
    for (let i = 0; i < enemies.length; i++) {
      const enemy = enemies[i];
      if (rectsOverlap(bullet, enemy)) {
        const { state, correct } = registerHit(letterState, enemy.letter, now, symbolPool);
        letterState = state;
        if (correct) {
          bullet.active = false;
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

  render(ctx, canvas, player, enemies, bullets, trail.particles, starfield.stars);
  requestAnimationFrame(frame);
}

updateHud();
requestAnimationFrame(frame);
