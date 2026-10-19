import { crtWarmupLight, lifeCrtWarmupAge } from './life-crt';

export function distortRouteCrt(root: HTMLElement) {
  const age = lifeCrtWarmupAge();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (age < 0 || age >= 2.8 || preference.matches) return () => {};
  const duration = Math.min(560, (2.8 - age) * 1000);
  const reach = Math.hypot(innerWidth, innerHeight) / 2;
  const strength = Math.min(22, 14 + crtWarmupLight(age).glow * 18);
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
  for (const line of lines) line.dataset.routeCrtTarget = 'text';
  const frames = new Set<HTMLElement>();
  for (const image of root.querySelectorAll<HTMLImageElement>('.body img')) {
    if (image.complete && image.naturalWidth > 0 && visible(image))
      frames.add(image.closest('figure') ?? image);
  }
  // Batch geometry reads before starting animations. Text lines and image frames sample the same radial projection; no image copies, SVG filters or growing offscreen surfaces are needed.
  const targets = [...lines, ...frames].map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      element,
      x: rect.left + rect.width / 2 - innerWidth / 2,
      y: rect.top + rect.height / 2 - innerHeight / 2,
      rest: getComputedStyle(element).transform,
    };
  });
  for (const { element } of overflow) element.style.overflow = 'visible';
  const displacement = (distance: number, milliseconds: number) => {
    const delay = 35 + 180 * Math.min(1, distance / reach);
    const phase = (milliseconds - delay) / 280;
    if (phase <= 0 || phase >= 1) return 0;
    return strength * Math.sin(phase * Math.PI * 2) * Math.exp(-1.8 * phase);
  };
  const animations = targets.map(({ element, x, y, rest }) => {
    const distance = Math.hypot(x, y);
    const ux = distance > 0 ? x / distance : 0;
    const uy = distance > 0 ? y / distance : 0;
    const keyframes = Array.from({ length: 17 }, (_, step) => {
      const offset = step / 16;
      // Fit the complete wave into the remaining warmup instead of cutting its settle short.
      const milliseconds = offset * 560;
      const shift = displacement(distance, milliseconds);
      const near = Math.max(0, distance - 8);
      const slope =
        (displacement(distance + 8, milliseconds) -
          displacement(near, milliseconds)) /
        (distance + 8 - near);
      const radial = Math.max(0.83, Math.min(1.18, 1 + slope));
      const tangential = Math.max(
        0.9,
        Math.min(1.14, 1 + shift / Math.max(80, distance)),
      );
      const difference = radial - tangential;
      const a = tangential + difference * ux * ux;
      const b = difference * ux * uy;
      const d = tangential + difference * uy * uy;
      const matrix = `matrix(${a},${b},${b},${d},${ux * shift},${uy * shift})`;
      return {
        offset,
        transform: `${rest === 'none' ? '' : rest} ${matrix}`.trim(),
      };
    });
    const animation = element.animate(keyframes, {
      duration,
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
  timer = window.setTimeout(dispose, duration + 16);
  return dispose;
}
