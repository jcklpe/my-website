export type CodeThemeName = 'phosphor2' | 'midnight' | 'signal';

export const CODE_THEME_LABELS: Record<CodeThemeName, string> = {
  phosphor2: 'Phosphor',
  midnight: 'Midnight',
  signal: 'Signal',
};

export const CODE_THEME_SURFACES: Record<
  CodeThemeName,
  { background: string; foreground: string; glow: string; scanline: string }
> = {
  phosphor2: {
    background: '#352826',
    foreground: '#FECC55',
    glow: 'rgba(254, 204, 85, 0.12)',
    scanline: 'rgba(254, 204, 85, 0.08)',
  },
  midnight: {
    background: '#2438A4',
    foreground: '#E0EAFF',
    glow: 'rgba(150, 180, 255, 0.16)',
    scanline: 'rgba(150, 180, 255, 0.05)',
  },
  signal: {
    background: '#163A39',
    foreground: '#66FFA9',
    glow: 'rgba(102, 255, 169, 0.12)',
    scanline: 'rgba(102, 255, 169, 0.08)',
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
