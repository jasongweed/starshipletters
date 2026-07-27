import test from "node:test";
import assert from "node:assert/strict";
import { isStickLeft, isStickRight, isTriggerDown, computeFirePulse } from "../js/gamepad.js";

test("isStickLeft/isStickRight respect the deadzone", () => {
  assert.equal(isStickLeft(-0.1), false);
  assert.equal(isStickLeft(-0.5), true);
  assert.equal(isStickRight(0.1), false);
  assert.equal(isStickRight(0.5), true);
});

test("isStickLeft and isStickRight are never both true", () => {
  for (let x = -1; x <= 1; x += 0.1) {
    assert.ok(!(isStickLeft(x) && isStickRight(x)));
  }
});

test("isTriggerDown respects the press threshold", () => {
  assert.equal(isTriggerDown(0), false);
  assert.equal(isTriggerDown(0.4), false);
  assert.equal(isTriggerDown(0.6), true);
  assert.equal(isTriggerDown(1), true);
});

test("computeFirePulse only fires on the transition from released to pressed", () => {
  assert.equal(computeFirePulse(true, false), true);
  assert.equal(computeFirePulse(true, true), false);
  assert.equal(computeFirePulse(false, true), false);
  assert.equal(computeFirePulse(false, false), false);
});
