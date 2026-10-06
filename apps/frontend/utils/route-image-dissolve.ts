let filterSequence = 0;

// A fixed Bayer tile makes coverage increase steadily rather than flickering like random noise. Each threshold occupies a 2px square in the image's CSS coordinate space.
const bayerRanks = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];
const cells: string[] = [];
for (const [row, ranks] of bayerRanks.entries()) {
  for (const [column, rank] of ranks.entries()) {
    const gray = Math.round(((rank + 0.5) / 16) * 255);
    cells.push(
      `<rect x="${column}" y="${row}" width="1" height="1" fill="rgb(${gray},${gray},${gray})" />`,
    );
  }
}
const tileMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 4 4" shape-rendering="crispEdges">${cells.join('')}</svg>`;
const thresholdTile = `data:image/svg+xml,${encodeURIComponent(tileMarkup)}`;

function dissolveFilter(entering: boolean, duration: number, delay: number) {
  const id = `route-image-dissolve-${++filterSequence}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.routeImageDissolveFilter = '';
  Object.assign(svg.style, { position: 'fixed', pointerEvents: 'none' });
  const initialBias = entering ? 0.05 : 1.05;
  const finalBias = entering ? 1.05 : 0.05;
  // Place the entry burst after the 200ms ground release, with enough dot coverage to see it. Reverse its held positions for departure.
  const tearTimes = entering
    ? '0;0.54;0.64;0.74;0.84;1'
    : '0;0.16;0.26;0.36;0.46;1';
  const redOffsets = entering ? '0;20;-12;8;0;0' : '0;8;-12;20;0;0';
  const cyanOffsets = entering ? '0;-14;8;-6;0;0' : '0;-6;8;-14;0;0';

  // A pixel appears when progress exceeds 0.45 × (1 − brightness) + 0.55 × its Bayer threshold. Work in alpha so arithmetic color clamping cannot distort the threshold. Original brightness owns coverage even while the color channels separate.
  svg.innerHTML = `
    <defs>
      <filter id="${id}" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.2126 0.7152 0.0722 0 0" result="brightness" />
        <feImage href="${thresholdTile}" x="0" y="0" width="8" height="8" result="tile" />
        <feTile in="tile" result="pattern" />
        <feColorMatrix in="pattern" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="thresholds" />
        <feComposite in="brightness" in2="thresholds" operator="arithmetic" k2="0.45" k3="-0.55" k4="${initialBias}" result="coverage">
          <animate attributeName="k4" from="${initialBias}" to="${finalBias}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feComposite>
        <feComponentTransfer in="coverage" result="mask">
          <feFuncA type="discrete" tableValues="0 1" />
        </feComponentTransfer>
        <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="red" />
        <feOffset in="red" result="shifted-red">
          <animate attributeName="dx" values="${redOffsets}" keyTimes="${tearTimes}" calcMode="discrete" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="cyan" />
        <feOffset in="cyan" result="shifted-cyan">
          <animate attributeName="dx" values="${cyanOffsets}" keyTimes="${tearTimes}" calcMode="discrete" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feBlend in="shifted-red" in2="shifted-cyan" mode="screen" result="registered" />
        <feComposite in="registered" in2="SourceAlpha" operator="in" result="registered-image" />
        <feComposite in="registered-image" in2="mask" operator="in" />
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

export function animateRouteImageDissolve(
  image: HTMLImageElement,
  entering: boolean,
  windowDuration: number,
  delay: number,
) {
  // Keep the stagger inside the established route clock. Native SVG owns coverage and color registration; discrete transforms move the painted image without changing its layout box.
  const duration = windowDuration - delay;
  const style = getComputedStyle(image);
  const restFilter = style.filter === 'none' ? '' : style.filter;
  const dissolve = dissolveFilter(entering, duration, delay);
  const filter = `${restFilter} url(#${dissolve.id})`.trim();
  const restTransform = style.transform === 'none' ? '' : style.transform;
  const restClip = style.clipPath;
  const jumps = [
    { offset: 0, x: 0, clipPath: restClip },
    { offset: 0.54, x: 12, clipPath: 'inset(8% 0 18% 0)' },
    { offset: 0.64, x: -8, clipPath: restClip },
    { offset: 0.74, x: 4, clipPath: 'inset(28% 0 12% 0)' },
    { offset: 0.84, x: 0, clipPath: restClip },
    { offset: 1, x: 0, clipPath: restClip },
  ];
  const keyframes = jumps.map(({ offset, x, clipPath }) => ({
    offset,
    filter,
    clipPath,
    transform: `${restTransform} translateX(${x}px)`.trim(),
    easing: 'steps(1, end)',
  }));
  // Each interval holds its position until the next cut. Keep the filter URL constant; cancellation restores authored styles through the coordinator's animation registry.
  const animation = image.animate(keyframes, {
    duration,
    delay,
    direction: entering ? 'normal' : 'reverse',
    fill: 'both',
  });
  return { animation, dispose: dissolve.dispose };
}
