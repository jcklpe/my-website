// Atkinson distributes one eighth of each quantization error to six forward neighbours, deliberately retaining only three quarters of the error.
export function atkinsonCoverage(
  luminance: Float32Array,
  width: number,
  height: number,
  progress: number,
) {
  const levels = new Float32Array(luminance.length);
  const coverage = new Uint8Array(luminance.length);
  for (let i = 0; i < levels.length; i++) {
    // The photograph's brightness sets the reveal time. Error diffusion textures only the narrow advancing tonal edge.
    levels[i] = Math.max(
      0,
      Math.min(1, (progress - 0.8 * (1 - luminance[i]!)) / 0.2),
    );
  }
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      const old = levels[i]!;
      const next = old >= 0.5 ? 1 : 0;
      coverage[i] = next * 255;
      const error = (old - next) / 8;
      if (error === 0) continue;
      if (x + 1 < width) levels[i + 1]! += error;
      if (x + 2 < width) levels[i + 2]! += error;
      if (y + 1 < height) {
        if (x > 0) levels[i + width - 1]! += error;
        levels[i + width]! += error;
        if (x + 1 < width) levels[i + width + 1]! += error;
      }
      if (y + 2 < height) levels[i + 2 * width]! += error;
    }
  }
  return coverage;
}
