import test from "node:test";
import assert from "node:assert/strict";
import { pickPreferredVoice } from "../js/speech.js";

test("pickPreferredVoice prefers a Google-branded English voice", () => {
  const voices = [
    { name: "Microsoft David", lang: "en-US", localService: true },
    { name: "Google US English", lang: "en-US", localService: false },
    { name: "Google UK English Female", lang: "en-GB", localService: false },
  ];
  assert.equal(pickPreferredVoice(voices).name, "Google US English");
});

test("pickPreferredVoice falls back to a non-local English voice", () => {
  const voices = [
    { name: "Microsoft David", lang: "en-US", localService: true },
    { name: "Some Network Voice", lang: "en-US", localService: false },
  ];
  assert.equal(pickPreferredVoice(voices).name, "Some Network Voice");
});

test("pickPreferredVoice falls back to the first available English voice", () => {
  const voices = [
    { name: "Microsoft David", lang: "en-US", localService: true },
    { name: "Microsoft Zira", lang: "en-US", localService: true },
  ];
  assert.equal(pickPreferredVoice(voices).name, "Microsoft David");
});

test("pickPreferredVoice falls back to any voice when no English voice exists", () => {
  const voices = [{ name: "French Voice", lang: "fr-FR", localService: true }];
  assert.equal(pickPreferredVoice(voices).name, "French Voice");
});

test("pickPreferredVoice returns null for an empty list", () => {
  assert.equal(pickPreferredVoice([]), null);
});
