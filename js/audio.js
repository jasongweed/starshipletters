let audioCtx = null;
let unlocked = false;

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

// iOS Safari/WebKit only allows an AudioContext to actually start producing
// sound if it's created/resumed synchronously inside a genuine user-gesture
// handler (touchstart/mousedown/keydown), not from inside a game loop tick.
// Call this directly from such a handler once, before any other playback.
export function unlockAudio() {
  if (unlocked) return;
  const ctx = getContext();
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();
  gainNode.gain.value = 0;
  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);
  oscillator.start(ctx.currentTime);
  oscillator.stop(ctx.currentTime + 0.001);
  unlocked = true;
}

function playBlip(ctx, { startFrequency, endFrequency, duration, type, gain, startTime }) {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(startFrequency, startTime);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);

  gainNode.gain.setValueAtTime(gain, startTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);
}

export function playShootSound() {
  const ctx = getContext();
  playBlip(ctx, {
    startFrequency: 880,
    endFrequency: 440,
    duration: 0.08,
    type: "square",
    gain: 0.12,
    startTime: ctx.currentTime,
  });
}

export function playCorrectHitSound() {
  const ctx = getContext();
  const now = ctx.currentTime;
  playBlip(ctx, {
    startFrequency: 660,
    endFrequency: 660,
    duration: 0.09,
    type: "triangle",
    gain: 0.18,
    startTime: now,
  });
  playBlip(ctx, {
    startFrequency: 990,
    endFrequency: 990,
    duration: 0.15,
    type: "triangle",
    gain: 0.18,
    startTime: now + 0.08,
  });
}
