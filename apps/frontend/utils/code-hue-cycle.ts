import { CODE_THEME_BLOCK_STYLES } from './code-theme';
import type { CodeThemeName } from './code-theme';

type CycleTarget = {
  element: HTMLElement;
  properties: Record<string, string>;
};

let activeCycle: {
  animation: Animation;
  targets: CycleTarget[];
  preference: MediaQueryList;
} | null = null;

export function supportsCodeHueCycle() {
  return CSS.supports('color', 'oklch(from red l c calc(h - 360))');
}

export function stopCodeHueCycle() {
  const cycle = activeCycle;
  if (!cycle) return;
  activeCycle = null;
  cycle.animation.cancel();
  cycle.preference.removeEventListener('change', stopCodeHueCycle);
  const root = document.documentElement;
  // Clear the cycle without accidentally starting the ordinary 280ms transition from its last sampled frame.
  root.dataset.codeHueCycle = 'settling';
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      if (root.dataset.codeHueCycle === 'settling')
        root.removeAttribute('data-code-hue-cycle');
    }),
  );
  root.style.removeProperty('--code-hue-cycle-progress');
  for (const { element, properties } of cycle.targets) {
    for (const name of Object.keys(properties))
      element.style.removeProperty(name);
  }
}

export function cycleCodeTheme(
  nextTheme: CodeThemeName,
  applyTheme: () => void,
) {
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (preference.matches || !supportsCodeHueCycle()) {
    stopCodeHueCycle();
    applyTheme();
    return;
  }

  // Read the currently painted colors before canceling a previous cycle, so rapid switches continue from the visible palette.
  const targets: CycleTarget[] = [];
  const tokens = document.querySelectorAll<HTMLElement>(
    '.code-block .shiki, .code-block .shiki span[style*="--code-token-"], code[data-inline-highlighted] span[style*="--inline-code-"]',
  );
  for (const element of tokens) {
    const prefix = element.closest('.code-block')
      ? '--code-token-'
      : '--inline-code-';
    const destination = element.style.getPropertyValue(`${prefix}${nextTheme}`);
    if (!destination) continue;
    targets.push({
      element,
      properties: {
        '--code-cycle-from': getComputedStyle(element).color,
        '--code-cycle-to': destination,
      },
    });
  }
  const surface = CODE_THEME_BLOCK_STYLES[nextTheme];
  for (const element of document.querySelectorAll<HTMLElement>('.code-block')) {
    const style = getComputedStyle(element);
    const properties: Record<string, string> = {};
    for (const [property, destination] of Object.entries(surface)) {
      if (property.startsWith('--code-selection-')) continue;
      const role = property.slice('--code-'.length);
      properties[`--code-cycle-from-${role}`] =
        style.getPropertyValue(property);
      properties[`--code-cycle-to-${role}`] = destination;
    }
    targets.push({ element, properties });
  }

  stopCodeHueCycle();
  if (!targets.length) {
    applyTheme();
    return;
  }
  for (const { element, properties } of targets) {
    for (const [name, value] of Object.entries(properties)) {
      element.style.setProperty(name, value);
    }
  }
  const root = document.documentElement;
  root.style.setProperty('--code-hue-cycle-progress', '0');
  root.dataset.codeHueCycle = 'active';
  applyTheme();
  // One inherited numeric animation drives CSS hue interpolation for the whole palette without replacing or retokenizing code.
  const animation = root.animate(
    [
      { '--code-hue-cycle-progress': '0' },
      { '--code-hue-cycle-progress': '1' },
    ],
    { duration: 420, easing: 'ease-in-out', fill: 'both' },
  );
  activeCycle = { animation, targets, preference };
  preference.addEventListener('change', stopCodeHueCycle);
  animation.finished.then(
    () => {
      if (activeCycle?.animation === animation) stopCodeHueCycle();
    },
    () => {},
  );
}
