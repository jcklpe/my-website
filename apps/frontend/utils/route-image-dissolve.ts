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

function dissolveFilter(
  image: HTMLImageElement,
  entering: boolean,
  duration: number,
  delay: number,
) {
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
  const { width, height } = image.getBoundingClientRect();
  const upperBand = {
    y: Math.round(height * 0.3),
    height: Math.max(3, Math.round(height * 0.16)),
  };
  const lowerBand = {
    y: Math.round(height * 0.64),
    height: Math.max(2, Math.round(height * 0.09)),
  };
  // Registration jumps between held positions; only the color haze softens continuously. Mirror the burst within the departure clock.
  const tearTimes = entering
    ? '0;0.32;0.43;0.56;0.7;1'
    : '0;0.3;0.44;0.57;0.68;1';
  const redOffsets = entering ? '0;18;-10;7;0;0' : '0;7;-10;18;0;0';
  const cyanOffsets = entering ? '0;-12;7;-5;0;0' : '0;-5;7;-12;0;0';
  const blurTimes = entering
    ? '0;0.3;0.36;0.48;0.62;0.72;1'
    : '0;0.28;0.38;0.52;0.64;0.7;1';
  const blurValues = entering ? '0;0;2.4;1.8;0.8;0;0' : '0;0;0.8;1.8;2.4;0;0';

  // A pixel appears when progress exceeds 0.45 × (1 − brightness) + 0.55 × its Bayer threshold. Work in alpha so arithmetic color clamping cannot distort the threshold. Blur only the separated colors before applying the mask, keeping the dots crisp and their brightness ordering independent of the tear.
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
        <feFlood x="0" y="${upperBand.y}" width="${width}" height="${upperBand.height}" flood-color="white" result="upper-band" />
        <feFlood x="0" y="${lowerBand.y}" width="${width}" height="${lowerBand.height}" flood-color="white" result="lower-band" />
        <feMerge result="bands">
          <feMergeNode in="upper-band" />
          <feMergeNode in="lower-band" />
        </feMerge>
        <feColorMatrix in="SourceGraphic" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="red" />
        <feOffset in="red" result="shifted-red">
          <animate attributeName="dx" values="${redOffsets}" keyTimes="${tearTimes}" calcMode="discrete" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feGaussianBlur in="shifted-red" stdDeviation="0" result="soft-red">
          <animate attributeName="stdDeviation" values="${blurValues}" keyTimes="${blurTimes}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feGaussianBlur>
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1" result="cyan" />
        <feOffset in="cyan" result="shifted-cyan">
          <animate attributeName="dx" values="${cyanOffsets}" keyTimes="${tearTimes}" calcMode="discrete" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feGaussianBlur in="shifted-cyan" stdDeviation="0" result="soft-cyan">
          <animate attributeName="stdDeviation" values="${blurValues}" keyTimes="${blurTimes}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feGaussianBlur>
        <feBlend in="soft-red" in2="soft-cyan" mode="screen" result="registered" />
        <feComposite in="registered" in2="SourceAlpha" operator="in" result="registered-image" />
        <feComposite in="registered-image" in2="bands" operator="in" result="colored-bands" />
        <feComposite in="SourceGraphic" in2="bands" operator="out" result="rest-image" />
        <feComposite in="rest-image" in2="colored-bands" operator="arithmetic" k2="1" k3="1" result="torn" />
        <feComposite in="torn" in2="mask" operator="in" />
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
  const dissolve = dissolveFilter(image, entering, duration, delay);
  const filter = `${restFilter} url(#${dissolve.id})`.trim();
  const restTransform = style.transform === 'none' ? '' : style.transform;
  const jumps = [
    { offset: 0, x: 0, y: 0 },
    { offset: 0.32, x: 7, y: -1 },
    { offset: 0.43, x: -4, y: 2 },
    { offset: 0.56, x: 2, y: 0 },
    { offset: 0.7, x: 0, y: 0 },
    { offset: 1, x: 0, y: 0 },
  ];
  const keyframes = jumps.map(({ offset, x, y }) => ({
    offset,
    filter,
    transform: `${restTransform} translate(${x}px, ${y}px)`.trim(),
    easing: 'steps(1, end)',
  }));
  // Each interval holds its position until the next cut. Keep the filter URL constant; cancellation restores both authored properties through the coordinator's animation registry.
  const animation = image.animate(keyframes, {
    duration,
    delay,
    direction: entering ? 'normal' : 'reverse',
    fill: 'both',
  });
  return { animation, dispose: dissolve.dispose };
}
