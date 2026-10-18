import { sneakersColors } from './sneakers-colors';

let filterSequence = 0;

function registrationTint(color: string, sourceWeights: number[]) {
  const channels = [1, 3, 5].map(
    (start) => Number.parseInt(color.slice(start, start + 2), 16) / 255,
  );
  const rows = channels.map((channel) => [
    ...sourceWeights.map((weight) => channel * weight),
    0,
    0,
  ]);
  return [...rows.flat(), 0, 0, 0, 0, 1].join(' ');
}

const warmBasis = '1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1';
const coolBasis = '0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0 1';
const warmTint = registrationTint(sneakersColors[2]!, [1, 0, 0]);
const coolTint = registrationTint(sneakersColors[6]!, [0, 0.5, 0.5]);

// A fixed Bayer tile makes coverage increase steadily rather than flickering like random noise. Each threshold occupies a 4px square in the image's CSS coordinate space.
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
const tileMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 4 4" shape-rendering="crispEdges">${cells.join('')}</svg>`;
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
  // Color registration converges as the first dots fill in, without reversing direction or moving the image itself. Departure spreads the channels as coverage disappears.
  const initialWarm = entering ? 14 : 0;
  const finalWarm = entering ? 0 : 14;
  const initialCool = entering ? -10 : 0;
  const finalCool = entering ? 0 : -10;
  // Coral and mint come from the text gradient. Restore complementary RGB bases as registration converges, so the final photo keeps its authored colors.
  const initialWarmMatrix = entering ? warmTint : warmBasis;
  const finalWarmMatrix = entering ? warmBasis : warmTint;
  const initialCoolMatrix = entering ? coolTint : coolBasis;
  const finalCoolMatrix = entering ? coolBasis : coolTint;
  const colorTimes = entering ? '0;0.7;1' : '0;0.3;1';
  // Keep the palette tint while the channels are visibly separated; restore the original bases in the final 30% of entry (the first 30% of exit reverses this).
  const warmColors = `${initialWarmMatrix};${warmTint};${finalWarmMatrix}`;
  const coolColors = `${initialCoolMatrix};${coolTint};${finalCoolMatrix}`;

  // A pixel appears when progress exceeds 0.45 × (1 − brightness) + 0.55 × its Bayer threshold. Work in alpha so arithmetic color clamping cannot distort the threshold. Original brightness owns coverage even while the color channels separate.
  svg.innerHTML = `
    <defs>
      <filter id="${id}" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.2126 0.7152 0.0722 0 0" result="brightness" />
        <feImage href="${thresholdTile}" x="0" y="0" width="16" height="16" result="tile" />
        <feTile in="tile" result="pattern" />
        <feColorMatrix in="pattern" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="thresholds" />
        <feComposite in="brightness" in2="thresholds" operator="arithmetic" k2="0.45" k3="-0.55" k4="${initialBias}" result="coverage">
          <animate attributeName="k4" from="${initialBias}" to="${finalBias}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feComposite>
        <feComponentTransfer in="coverage" result="mask">
          <feFuncA type="discrete" tableValues="0 1" />
        </feComponentTransfer>
        <feColorMatrix in="SourceGraphic" values="${initialWarmMatrix}" result="warm">
          <animate attributeName="values" values="${warmColors}" keyTimes="${colorTimes}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feColorMatrix>
        <feOffset in="warm" result="shifted-warm">
          <animate attributeName="dx" from="${initialWarm}" to="${finalWarm}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feColorMatrix in="SourceGraphic" values="${initialCoolMatrix}" result="cool">
          <animate attributeName="values" values="${coolColors}" keyTimes="${colorTimes}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feColorMatrix>
        <feOffset in="cool" result="shifted-cool">
          <animate attributeName="dx" from="${initialCool}" to="${finalCool}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feOffset>
        <feBlend in="shifted-warm" in2="shifted-cool" mode="screen" result="registered" />
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
  // Keep the stagger inside the established route clock. Native SVG owns coverage and color registration while the image's geometry stays authored.
  const duration = windowDuration - delay;
  const style = getComputedStyle(image);
  const restFilter = style.filter === 'none' ? '' : style.filter;
  const dissolve = dissolveFilter(entering, duration, delay);
  const filter = `${restFilter} url(#${dissolve.id})`.trim();
  // The constant filter animation attaches the mask and gives the coordinator its completion/cancellation clock. Its URL is never tweened.
  const animation = image.animate([{ filter }, { filter }], {
    duration,
    delay,
    fill: 'both',
  });
  return { animation, dispose: dissolve.dispose };
}
