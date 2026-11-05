import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const { limitedSpotsVisible } = createRequire(import.meta.url)("../js/commitments.js");

test("the limited-spots switch is off until the config line is flipped", () => {
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "veloxlab.studio"
  }), false);
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "www.veloxlab.studio"
  }), false);
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: true,
    hostname: "veloxlab.studio"
  }), true);
});

test("a non-production host shows limited spots while the switch is off", () => {
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "127.0.0.1"
  }), true);
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "localhost"
  }), true);
});

test("the preview query overrides the limited-spots switch and the host", () => {
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "veloxlab.studio",
    preview: "1"
  }), true);
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: true,
    hostname: "veloxlab.studio",
    preview: "0"
  }), false);
  assert.equal(limitedSpotsVisible({
    showLimitedSpots: false,
    hostname: "127.0.0.1",
    preview: "0"
  }), false);
});
