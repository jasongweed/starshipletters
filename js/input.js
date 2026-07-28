const KEY_MAP = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  Space: "fire",
};

export function createInputState() {
  const state = { left: false, right: false, up: false, down: false, fire: false };

  window.addEventListener("keydown", (e) => {
    const key = KEY_MAP[e.code];
    if (key) {
      state[key] = true;
      e.preventDefault();
    }
  });

  window.addEventListener("keyup", (e) => {
    const key = KEY_MAP[e.code];
    if (key) {
      state[key] = false;
      e.preventDefault();
    }
  });

  bindTouchButton(state, "btn-left", "left");
  bindTouchButton(state, "btn-right", "right");
  bindTouchButton(state, "btn-fire", "fire");

  return state;
}

function bindTouchButton(state, elementId, key) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const press = (e) => {
    e.preventDefault();
    state[key] = true;
  };
  const release = (e) => {
    e.preventDefault();
    state[key] = false;
  };

  el.addEventListener("touchstart", press, { passive: false });
  el.addEventListener("touchend", release, { passive: false });
  el.addEventListener("touchcancel", release, { passive: false });
  el.addEventListener("mousedown", press);
  el.addEventListener("mouseup", release);
  el.addEventListener("mouseleave", release);
}
