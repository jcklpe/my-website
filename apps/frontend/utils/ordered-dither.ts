// Fixed Bayer 4×4 screen; the approved image dissolve uses 2px marks.
export const bayer4Ranks = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

// Expand the gaps around 6/16 and 10/16 coverage, where Bayer 4×4 forms cross-like motifs; compress the gap around its 8/16 checkerboard. Coordinates are original threshold → remapped threshold.
const motifThresholdCurve = [
  [0, 0],
  [5 / 16, 0.2],
  [7 / 16, 0.49],
  [9 / 16, 0.51],
  [11 / 16, 0.8],
  [1, 1],
] as const;

export function orderedDitherThreshold(rank: number) {
  const threshold = (rank + 0.5) / 16;
  for (let step = 1; step < motifThresholdCurve.length; step++) {
    const [start, startValue] = motifThresholdCurve[step - 1]!;
    const [end, endValue] = motifThresholdCurve[step]!;
    if (threshold > end) continue;
    const progress = (threshold - start) / (end - start);
    return startValue + progress * (endValue - startValue);
  }
  return threshold;
}
