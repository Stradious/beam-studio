# Beam Studio

A zero-dependency, simply supported beam analyzer. It computes support reactions from force and moment balance, evaluates bending moment along the span, and integrates curvature twice to estimate deflection. The integration constant enforces zero displacement at both supports.

## Run

```powershell
node cli.mjs example.json
node --test test.mjs
```

The CLI prints reactions and peak values, then writes an SVG with moment and deflection diagrams beside the input file. Edit the JSON to explore another case.

Input units are SI: length in m, force in N, distributed load in N/m, elastic modulus in Pa, and second moment of area in m⁴. Positive loads act downward. This is a small-deflection Euler–Bernoulli model with constant `E` and `I`; it does not check stress, shear deformation, buckling, or safety factors.

## Example

The included case is a 3 m steel beam under 300 N/m plus a 500 N point load at 1.2 m. Try changing `samples` to check numerical convergence.
