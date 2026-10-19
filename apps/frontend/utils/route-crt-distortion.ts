import {
  crtTiming,
  crtWarpPoint,
  readCrtWarp,
  stopCrtWarp,
  type CrtEntryTiming,
} from './crt-warp';
import { startRouteCrtText } from './route-crt-text';
import { lifeCrtWarmupAge } from './life-crt';

export function distortRouteCrt(root: HTMLElement, timing: CrtEntryTiming) {
  const age = lifeCrtWarmupAge();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (age < 0 || age * 1000 >= crtTiming.warmup || preference.matches)
    return () => {};
  const { startedAt, duration } = timing;
  const visible = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < innerHeight &&
      rect.bottom > 0
    );
  };
  // Move the decorative Sneakers copies. The accessible CMS text, links and their layout stay intact.
  const inks = Array.from(
    root.querySelectorAll<HTMLElement>('[data-route-motion-ink]'),
  ).filter(visible);
  const clips = inks
    .map((ink) => ink.closest<HTMLElement>('[data-route-motion-line]'))
    .filter((clip) => clip !== null);
  const overflow = clips.map((element) => ({
    element,
    value: element.style.overflow,
  }));
  // Each line already has a stationary decorative wrapper, separate from the Sneakers glyph animation.
  const lines = [...new Set(clips)];

  const frames = new Set<HTMLElement>();
  for (const image of root.querySelectorAll<HTMLImageElement>('.body img')) {
    if (image.complete && image.naturalWidth > 0 && visible(image))
      frames.add(image.closest('figure') ?? image);
  }
  const stopText = startRouteCrtText(root, inks);
  const projected = stopText ? [...frames] : [...lines, ...frames];
  for (const line of lines) line.dataset.routeCrtTarget = 'text';
  // Batch reads before changing clips. GPU text uses its own shared field; frames and the fallback use a local projection.
  const targets = projected.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      element,
      x: rect.left + rect.width / 2 - innerWidth / 2,
      y: rect.top + rect.height / 2 - innerHeight / 2,
      rest: getComputedStyle(element).transform,
    };
  });
  for (const { element } of overflow) element.style.overflow = 'visible';
  const animations = targets.map(({ element, x, y, rest }) => {
    const keyframes = Array.from({ length: 17 }, (_, step) => {
      const offset = step / 16;
      // Sample the flash clock without restarting its rounded wave at the destination handoff.
      const { milliseconds, strength } = readCrtWarp(
        startedAt + offset * duration,
      );
      const project = (px: number, py: number) =>
        crtWarpPoint(px, py, milliseconds, innerWidth, innerHeight, strength);
      const shift = project(x, y);
      const right = project(x + 8, y);
      const left = project(x - 8, y);
      const down = project(x, y + 8);
      const up = project(x, y - 8);
      const a = Math.max(0.85, Math.min(1.15, 1 + (right.x - left.x) / 16));
      const b = Math.max(-0.1, Math.min(0.1, (right.y - left.y) / 16));
      const c = Math.max(-0.1, Math.min(0.1, (down.x - up.x) / 16));
      const d = Math.max(0.85, Math.min(1.15, 1 + (down.y - up.y) / 16));
      const matrix = `matrix(${a},${b},${c},${d},${shift.x},${shift.y})`;
      return {
        offset,
        transform: `${rest === 'none' ? '' : rest} ${matrix}`.trim(),
      };
    });
    const animation = element.animate(keyframes, {
      duration,
      delay: startedAt - performance.now(),
      fill: 'both',
      easing: 'linear',
    });
    void animation.finished.catch(() => {});
    return animation;
  });
  for (const frame of frames) frame.dataset.routeCrtTarget = 'image';
  root.dataset.routeCrtDistortion = 'radial';
  let timer = 0;
  function dispose() {
    clearTimeout(timer);
    stopCrtWarp(timing);
    stopText?.();
    animations.forEach((animation) => animation.cancel());
    for (const line of lines) delete line.dataset.routeCrtTarget;
    for (const frame of frames) delete frame.dataset.routeCrtTarget;
    for (const { element, value } of overflow) element.style.overflow = value;
    delete root.dataset.routeCrtDistortion;
    preference.removeEventListener('change', dispose);
    window.removeEventListener('resize', dispose);
  }
  preference.addEventListener('change', dispose);
  window.addEventListener('resize', dispose);
  // Finish inside the existing 600ms entrance. This effect never enters the navigation completion promises.
  timer = window.setTimeout(
    dispose,
    Math.max(0, startedAt + duration - performance.now()) + 16,
  );
  return dispose;
}
