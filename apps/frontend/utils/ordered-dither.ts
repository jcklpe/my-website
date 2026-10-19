export type ImageDissolvePattern =
  | 'bayer4'
  | 'bayer8'
  | 'bayer16'
  | 'rosette'
  | 'hatch';

function bayer(size: number) {
  let ranks = [[0]];
  while (ranks.length < size) {
    const side = ranks.length;
    const expanded = Array.from(
      { length: side * 2 },
      () => new Array<number>(side * 2),
    );
    for (let y = 0; y < side; y++) {
      for (let x = 0; x < side; x++) {
        const rank = ranks[y]![x]! * 4;
        expanded[y]![x] = rank;
        expanded[y]![x + side] = rank + 2;
        expanded[y + side]![x] = rank + 3;
        expanded[y + side]![x + side] = rank + 1;
      }
    }
    ranks = expanded;
  }
  return ranks;
}

const bayer4 = bayer(4);
const bayer8 = bayer(8);
const bayer16 = bayer(16);
// Authored pixel-growth screen: four small crosses grow into interlocking rosettes. These are discrete ranked marks, not a smooth radial mask or a named error-diffusion algorithm.
const petalRanks = [
  [9, 1, 10, 5],
  [2, 0, 3, 6],
  [11, 4, 12, 7],
  [13, 8, 14, 15],
];
const clusterOrder = [
  [0, 2],
  [3, 1],
];
const rosette = Array.from({ length: 8 }, (_, y) =>
  Array.from(
    { length: 8 },
    (_, x) =>
      petalRanks[y % 4]![x % 4]! * 4 +
      clusterOrder[Math.floor(y / 4)]![Math.floor(x / 4)]!,
  ),
);
// Grow thin diagonal strokes in both directions, with Bayer ordering inside each stroke band. Ranking keeps every exposed mark present as coverage increases.
const hatchCells = [];
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const forward = (x + y) % 8;
    const backward = (x - y + 8) % 8;
    const band = Math.min(forward, 8 - forward, backward, 8 - backward);
    hatchCells.push({ x, y, band, tie: bayer8[y]![x]! });
  }
}
hatchCells.sort((a, b) => a.band - b.band || a.tie - b.tie);
const hatch = Array.from({ length: 8 }, () => new Array<number>(8));
hatchCells.forEach(({ x, y }, rank) => {
  hatch[y]![x] = rank;
});

export function orderedDitherRanks(pattern: ImageDissolvePattern) {
  if (pattern === 'bayer4') return bayer4;
  if (pattern === 'bayer16') return bayer16;
  if (pattern === 'rosette') return rosette;
  if (pattern === 'hatch') return hatch;
  return bayer8;
}

export function ditherGrain(value: number) {
  if (!Number.isFinite(value)) return 2;
  return Math.max(1, Math.min(2, Math.round(value)));
}

export function ditherSpread(value: number) {
  if (!Number.isFinite(value)) return 0.2;
  return Math.max(0.05, Math.min(0.8, Math.round(value * 20) / 20));
}

// Expand the gaps around 6/16 and 10/16 coverage, where Bayer 4×4 forms cross-like motifs; compress the gap around its 8/16 checkerboard. Coordinates are original threshold → remapped threshold.
const motifThresholdCurve = [
  [0, 0],
  [5 / 16, 0.2],
  [7 / 16, 0.49],
  [9 / 16, 0.51],
  [11 / 16, 0.8],
  [1, 1],
] as const;

export function orderedDitherThreshold(
  rank: number,
  count: number,
  linger: boolean,
) {
  const threshold = (rank + 0.5) / count;
  if (!linger) return threshold;
  for (let step = 1; step < motifThresholdCurve.length; step++) {
    const [start, startValue] = motifThresholdCurve[step - 1]!;
    const [end, endValue] = motifThresholdCurve[step]!;
    if (threshold > end) continue;
    const progress = (threshold - start) / (end - start);
    return startValue + progress * (endValue - startValue);
  }
  return threshold;
}
