import { readFile, writeFile } from 'node:fs/promises';
import { analyzeBeam, beamSvg } from './beam.mjs';
const file = process.argv[2];
if (!file) { console.error('Usage: node beam-studio/cli.mjs path/to/input.json'); process.exit(1); }
try {
  const input = JSON.parse(await readFile(file, 'utf8'));
  const result = analyzeBeam(input);
  const output = file.replace(/\.json$/i, '') + '-result.svg';
  await writeFile(output, beamSvg(result, 'Simply supported beam'));
  console.log(JSON.stringify({ leftReactionN: result.leftReaction, rightReactionN: result.rightReaction, peakMomentNm: result.maxMoment, peakDeflectionMm: result.maxDeflection * 1000, diagram: output }, null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
