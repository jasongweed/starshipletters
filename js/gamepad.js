export const STICK_DEADZONE = 0.25;
export const TRIGGER_PRESS_THRESHOLD = 0.5;

// Standard Gamepad layout: axes[0]/axes[1] are the left stick's X/Y axes,
// buttons[7] is the right trigger (R2/RT).
const LEFT_STICK_X_AXIS = 0;
const LEFT_STICK_Y_AXIS = 1;
const RIGHT_TRIGGER_BUTTON_INDEX = 7;

export function isStickLeft(x, deadzone = STICK_DEADZONE) {
  return x < -deadzone;
}

export function isStickRight(x, deadzone = STICK_DEADZONE) {
  return x > deadzone;
}

export function isStickUp(y, deadzone = STICK_DEADZONE) {
  return y < -deadzone;
}

export function isStickDown(y, deadzone = STICK_DEADZONE) {
  return y > deadzone;
}

export function isTriggerDown(value, threshold = TRIGGER_PRESS_THRESHOLD) {
  return value > threshold;
}

export function computeFirePulse(isDown, wasDown) {
  return isDown && !wasDown;
}

export function createGamepadState() {
  let wasTriggerDown = false;

  return {
    poll() {
      const pads = typeof navigator !== "undefined" && navigator.getGamepads ? navigator.getGamepads() : [];
      const gamepad = Array.from(pads).find((pad) => pad && pad.connected);

      if (!gamepad) {
        wasTriggerDown = false;
        return { left: false, right: false, up: false, down: false, firePulse: false };
      }

      const stickX = gamepad.axes[LEFT_STICK_X_AXIS] || 0;
      const stickY = gamepad.axes[LEFT_STICK_Y_AXIS] || 0;
      const triggerButton = gamepad.buttons[RIGHT_TRIGGER_BUTTON_INDEX];
      const triggerValue = triggerButton ? triggerButton.value : 0;

      const isDown = isTriggerDown(triggerValue);
      const firePulse = computeFirePulse(isDown, wasTriggerDown);
      wasTriggerDown = isDown;

      return {
        left: isStickLeft(stickX),
        right: isStickRight(stickX),
        up: isStickUp(stickY),
        down: isStickDown(stickY),
        firePulse,
      };
    },
  };
}
