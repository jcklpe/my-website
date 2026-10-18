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

// Complete block surface colors let the optional hue-cycle preview use the same endpoints as the ordinary theme blend.
export const CODE_THEME_BLOCK_STYLES: Record<
  CodeThemeName,
  Record<string, string>
> = {
  midnight: {
    '--code-crt-bg': '#0818a0',
    '--code-crt-spot': 'rgba(120, 160, 255, 0.25)',
    '--code-crt-glow': 'rgba(100, 150, 255, 0.17)',
    '--code-crt-scanline': 'rgba(150, 180, 255, 0.03)',
    '--code-crt-edge': 'rgba(125, 165, 255, 0.24)',
    '--code-crt-glass': 'rgba(205, 225, 255, 0.08)',
    '--code-token-bloom': 'rgba(190, 215, 255, 0.42)',
    '--code-selection-background': '#121B50',
    '--code-selection-text': '#FFFFFF',
  },
  phosphor2: {
    '--code-crt-bg': 'var(--color-ink)',
    '--code-crt-spot': 'rgba(200, 120, 20, 0.22)',
    '--code-crt-glow': 'rgba(180, 100, 10, 0.12)',
    '--code-crt-scanline': 'rgba(255, 160, 30, 0.07)',
    '--code-crt-edge': 'rgba(254, 204, 85, 0.2)',
    '--code-crt-glass': 'rgba(255, 222, 135, 0.07)',
    '--code-token-bloom': 'rgba(254, 204, 85, 0.34)',
    '--code-selection-background': '#FECC55',
    '--code-selection-text': '#0C0705',
  },
  signal: {
    '--code-crt-bg': 'var(--color-ink)',
    '--code-crt-spot': 'rgba(40, 200, 100, 0.18)',
    '--code-crt-glow': 'rgba(30, 180, 80, 0.11)',
    '--code-crt-scanline': 'rgba(50, 220, 110, 0.06)',
    '--code-crt-edge': 'rgba(102, 255, 169, 0.2)',
    '--code-crt-glass': 'rgba(160, 255, 205, 0.07)',
    '--code-token-bloom': 'rgba(102, 255, 169, 0.32)',
    '--code-selection-background': '#66FFA9',
    '--code-selection-text': '#030605',
  },
};
