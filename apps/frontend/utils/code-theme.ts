export type CodeThemeName = 'phosphor2' | 'midnight' | 'signal';

export const CODE_THEME_LABELS: Record<CodeThemeName, string> = {
  phosphor2: 'Phosphor',
  midnight: 'Midnight',
  signal: 'Signal',
};

// Inline surfaces stay darker than the block treatments so dim tokens remain readable even where the scanline and inset glow overlap.
export const CODE_THEME_SURFACES: Record<
  CodeThemeName,
  { background: string; foreground: string; glow: string; scanline: string }
> = {
  phosphor2: {
    background: '#0C0705',
    foreground: '#FECC55',
    glow: 'rgba(254, 204, 85, 0.02)',
    scanline: 'rgba(254, 204, 85, 0.015)',
  },
  midnight: {
    background: '#050A38',
    foreground: '#E0EAFF',
    glow: 'rgba(150, 180, 255, 0.12)',
    scanline: 'rgba(150, 180, 255, 0.03)',
  },
  signal: {
    background: '#030605',
    foreground: '#66FFA9',
    glow: 'rgba(102, 255, 169, 0.01)',
    scanline: 'rgba(102, 255, 169, 0.01)',
  },
};

export const CODE_THEME_DOTS: Record<CodeThemeName, string> = {
  phosphor2: '#FECC55',
  midnight: '#2657eb',
  signal: '#66FFA9',
};

export const CODE_THEME_OPTIONS = (
  Object.keys(CODE_THEME_LABELS) as CodeThemeName[]
).map((name) => ({
  name,
  label: CODE_THEME_LABELS[name],
  dot: CODE_THEME_DOTS[name],
}));
