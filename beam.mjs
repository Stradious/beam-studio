export function analyzeBeam(input) {
  const { length: L, elasticModulus: E, secondMoment: I } = input;
  const w = input.uniformLoad ?? 0;
  const loads = input.pointLoads ?? [];
  const samples = input.samples ?? 801;
  for (const [name, value] of Object.entries({ length: L, elasticModulus: E, secondMoment: I, uniformLoad: w })) {
    if (!Number.isFinite(value) || (name !== 'uniformLoad' && value <= 0)) throw new Error(`${name} must be a finite ${name === 'uniformLoad' ? 'number' : 'positive number'}`);
  }
  if (!Number.isInteger(samples) || samples < 3 || samples > 100001) throw new Error('samples must be an integer from 3 to 100001');
  for (const load of loads) {
    if (!Number.isFinite(load.force) || !Number.isFinite(load.position) || load.position < 0 || load.position > L) throw new Error('Each point load needs finite force and position within the span');
  }
  const rightReaction = (w * L * (L / 2) + loads.reduce((s, p) => s + p.force * p.position, 0)) / L;
  const leftReaction = w * L + loads.reduce((s, p) => s + p.force, 0) - rightReaction;
  const dx = L / (samples - 1);
  const x = Array.from({ length: samples }, (_, i) => i * dx);
  const moment = x.map(pos => leftReaction * pos - w * pos * pos / 2 - loads.reduce((s, p) => s + p.force * Math.max(0, pos - p.position), 0));
  // Trapezoidal integration of y'' = -M/EI; y is positive downward.
  const curvature = moment.map(m => -m / (E * I));
  const slope0 = [0];
  const displacement0 = [0];
  for (let i = 1; i < samples; i++) {
    slope0.push(slope0[i - 1] + dx * (curvature[i - 1] + curvature[i]) / 2);
    displacement0.push(displacement0[i - 1] + dx * (slope0[i - 1] + slope0[i]) / 2);
  }
  const correction = -displacement0.at(-1) / L;
  const deflection = displacement0.map((v, i) => v + correction * x[i]);
  const maxMoment = moment.reduce((a, b) => Math.abs(a) >= Math.abs(b) ? a : b);
  const maxDeflection = deflection.reduce((a, b) => Math.abs(a) >= Math.abs(b) ? a : b);
  return { x, moment, deflection, leftReaction, rightReaction, maxMoment, maxDeflection };
}

export function beamSvg(result, title = 'Beam analysis') {
  const W = 900, H = 560, left = 75, right = 865;
  const panels = [{ label: 'Bending moment (N·m)', values: result.moment, top: 75 }, { label: 'Downward deflection (mm)', values: result.deflection.map(v => v * 1000), top: 325 }];
  const escaped = String(title).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`, `<rect width="100%" height="100%" fill="#0b1220"/><text x="${left}" y="35" fill="#fff" font-size="22" font-family="sans-serif">${escaped}</text>`];
  for (const p of panels) {
    const min = Math.min(0, ...p.values), max = Math.max(0, ...p.values), range = max - min || 1;
    const y = v => p.top + 170 - (v - min) / range * 160;
    const points = p.values.map((v, i) => `${(left + i / (p.values.length - 1) * (right - left)).toFixed(2)},${y(v).toFixed(2)}`).join(' ');
    parts.push(`<text x="${left}" y="${p.top - 14}" fill="#cbd5e1" font-size="17" font-family="sans-serif">${p.label}</text>`);
    parts.push(`<line x1="${left}" x2="${right}" y1="${y(0)}" y2="${y(0)}" stroke="#475569"/>`);
    parts.push(`<polyline points="${points}" fill="none" stroke="#38bdf8" stroke-width="3"/>`);
    parts.push(`<text x="${right}" y="${p.top + 190}" text-anchor="end" fill="#94a3b8" font-size="13" font-family="sans-serif">${result.x.at(-1)} m</text>`);
  }
  return parts.join('') + '</svg>';
}
