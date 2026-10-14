import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeBeam } from './beam.mjs';
test('uniform load matches closed-form reactions, moment, and deflection', () => {
  const L = 2, w = 100, E = 200e9, I = 1e-6;
  const r = analyzeBeam({ length: L, elasticModulus: E, secondMoment: I, uniformLoad: w, samples: 1001 });
  assert.equal(r.leftReaction, w * L / 2);
  assert.equal(r.rightReaction, w * L / 2);
  assert.ok(Math.abs(r.maxMoment - w * L * L / 8) < 1e-8);
  assert.ok(Math.abs(r.maxDeflection - 5 * w * L ** 4 / (384 * E * I)) < 1e-7);
  assert.ok(Math.abs(r.deflection.at(-1)) < 1e-12);
});
test('off-center point load reactions satisfy statics', () => {
  const r = analyzeBeam({ length: 4, elasticModulus: 2e11, secondMoment: 1e-6, pointLoads: [{ force: 100, position: 1 }] });
  assert.equal(r.leftReaction, 75);
  assert.equal(r.rightReaction, 25);
});
