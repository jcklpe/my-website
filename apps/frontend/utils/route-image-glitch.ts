let filterSequence = 0;

function chromaticFilter(entering: boolean, duration: number, delay: number) {
  const id = `route-image-glitch-${++filterSequence}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.routeImageGlitchFilter = '';
  Object.assign(svg.style, { position: 'fixed', pointerEvents: 'none' });
  const offsets = entering ? [8, -3, 4, 1, 0] : [0, 1, 4, -3, 8];
  const redOffsets = offsets.join(';');
  const cyanOffsets = offsets.map((offset) => -offset).join(';');
  const keyTimes = entering ? '0;0.2;0.45;0.7;1' : '0;0.3;0.55;0.8;1';
  const blurValues = entering
    ? '3;1.8;1.2;0.7;0.3;0;0'
    : '0;0;0.3;0.7;1.2;1.8;3';
  const blurTimes = entering
    ? '0;0.16;0.3;0.46;0.6;0.82;1'
    : '0;0.18;0.4;0.54;0.7;0.84;1';

  // Split the original pixels rather than loading tinted image copies. The final mask preserves the image's alpha and contains the color fringe within its surface.
  svg.innerHTML = `
    <defs>
      <filter id="${id}" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="red" />
        <feOffset in="red" result="shifted-red">
          <animate attributeName="dx" values="${redOffsets}" keyTimes="${keyTimes}" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="cyan" />
        <feOffset in="cyan" result="shifted-cyan">
          <animate attributeName="dx" values="${cyanOffsets}" keyTimes="${keyTimes}" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feBlend in="shifted-red" in2="shifted-cyan" mode="screen" result="split" />
        <feComposite in="split" in2="SourceAlpha" operator="in" result="masked" />
        <feGaussianBlur in="masked">
          <animate attributeName="stdDeviation" values="${blurValues}" keyTimes="${blurTimes}" calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1;0.42 0 0.58 1" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feGaussianBlur>
      </filter>
    </defs>`;
  document.body.append(svg);
  for (const animation of svg.querySelectorAll<SVGAnimationElement>(
    'animate',
  )) {
    animation.beginElementAt(delay / 1000);
  }
  return { id, dispose: () => svg.remove() };
}

export function animateRouteImageGlitch(
  image: HTMLImageElement,
  entering: boolean,
  windowDuration: number,
  delay: number,
) {
  // Stagger starts inside the existing clock rather than extending the route guard's wait.
  const duration = windowDuration - delay;
  const style = getComputedStyle(image);
  const restTransform = style.transform;
  const restClip = style.clipPath === 'none' ? 'inset(0)' : style.clipPath;
  const restFilter = style.filter === 'none' ? '' : style.filter;
  const color = chromaticFilter(entering, duration, delay);
  const shifted = (distance: number) =>
    restTransform === 'none'
      ? `translateX(${distance}px)`
      : `translateX(${distance}px) ${restTransform}`;
  // CSS filter lists containing url() interpolate discretely. Keep that list constant and tween the SVG offsets/blur natively instead.
  const filter = `${restFilter} url(#${color.id})`.trim();

  // Broad tracking bands keep the picture readable while smooth displacement, defocus and color registration make the interruption look authored.
  const animation = image.animate(
    [
      {
        opacity: 0,
        clipPath: 'inset(36% 0 36% 0)',
        transform: shifted(8),
        filter,
        offset: 0,
      },
      {
        opacity: 1,
        clipPath: 'inset(4% 0 8% 0)',
        transform: shifted(-4),
        filter,
        offset: 0.16,
      },
      {
        opacity: 1,
        clipPath: 'inset(12% 0 3% 0)',
        transform: shifted(3),
        filter,
        offset: 0.3,
      },
      {
        opacity: 1,
        clipPath: 'inset(0)',
        transform: shifted(-1),
        filter,
        offset: 0.46,
      },
      {
        opacity: 1,
        clipPath: 'inset(2% 0 4% 0)',
        transform: shifted(1),
        filter,
        offset: 0.6,
      },
      {
        opacity: 1,
        clipPath: restClip,
        transform: restTransform,
        filter,
        offset: 0.82,
      },
      {
        opacity: 1,
        clipPath: restClip,
        transform: restTransform,
        filter,
        offset: 1,
      },
    ].map((frame) => ({ ...frame, easing: 'ease-in-out' })),
    {
      duration,
      delay,
      direction: entering ? 'normal' : 'reverse',
      easing: 'linear',
      fill: 'both',
    },
  );
  return { animation, dispose: color.dispose };
}
