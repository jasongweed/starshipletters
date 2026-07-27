import test from "node:test";
import assert from "node:assert/strict";
import { computeFitSize, CANVAS_ASPECT_RATIO } from "../js/layout.js";

test("computeFitSize is width-constrained in a wide, short container", () => {
  const { width, height } = computeFitSize(1000, 200, CANVAS_ASPECT_RATIO);
  assert.ok(height <= 200);
  assert.ok(Math.abs(width / height - CANVAS_ASPECT_RATIO) < 1e-6);
});

test("computeFitSize is height-constrained in a narrow, tall container", () => {
  const { width, height } = computeFitSize(300, 2000, CANVAS_ASPECT_RATIO);
  assert.ok(width <= 300);
  assert.ok(Math.abs(width / height - CANVAS_ASPECT_RATIO) < 1e-6);
});

test("computeFitSize never returns a negative size when available space is negative", () => {
  const { width, height } = computeFitSize(300, -50, CANVAS_ASPECT_RATIO);
  assert.equal(width, 0);
  assert.equal(height, 0);
});

test("computeFitSize returns the exact container size when it already matches the aspect ratio", () => {
  const { width, height } = computeFitSize(480, 600, CANVAS_ASPECT_RATIO);
  assert.ok(Math.abs(width - 480) < 1e-6);
  assert.ok(Math.abs(height - 600) < 1e-6);
});
