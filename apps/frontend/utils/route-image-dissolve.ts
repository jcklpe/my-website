import { preparedDitherMasks, prepareDitherMasks } from './route-dither-mask';
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

export type ImageDissolvePattern = 'atkinson' | 'bayer';

type ThresholdTile = { href: string; size: number };
let bayerTile: ThresholdTile | undefined;

function thresholdTile() {
  if (bayerTile) return bayerTile;
  // Recursively expand Bayer's ordered matrix to 8×8; fine marks create more intermediate dither structures than the old 4×4 tile.
  let ranks = [[0]];
  while (ranks.length < 8) {
    const size = ranks.length;
    const expanded = Array.from(
      { length: size * 2 },
      () => new Array<number>(size * 2),
    );
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const rank = ranks[y]![x]! * 4;
        expanded[y]![x] = rank;
        expanded[y]![x + size] = rank + 2;
        expanded[y + size]![x] = rank + 3;
        expanded[y + size]![x + size] = rank + 1;
      }
    }
    ranks = expanded;
  }
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 16;
  const context = canvas.getContext('2d')!;
  for (const [y, row] of ranks.entries()) {
    for (const [x, rank] of row.entries()) {
      const gray = Math.round(((rank + 0.5) / 64) * 255);
      context.fillStyle = `rgb(${gray},${gray},${gray})`;
      context.fillRect(x * 2, y * 2, 2, 2);
    }
  }
  bayerTile = { href: canvas.toDataURL(), size: 16 };
  return bayerTile;
}

export function prepareRouteImageDissolve(
  image: HTMLImageElement,
  pattern: ImageDissolvePattern,
) {
  if (pattern === 'atkinson') return prepareDitherMasks(image);
  return Promise.resolve(null);
}

function dissolveFilter(
  entering: boolean,
  duration: number,
  delay: number,
  pattern: ImageDissolvePattern,
  image: HTMLImageElement,
) {
  const tile = thresholdTile();
  const prepared =
    pattern === 'atkinson' ? preparedDitherMasks(image) : undefined;
  const id = `route-image-dissolve-${++filterSequence}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  svg.dataset.routeImageDissolveFilter = '';
  svg.dataset.ditherAlgorithm = prepared ? 'atkinson' : 'bayer';
  Object.assign(svg.style, { position: 'fixed', pointerEvents: 'none' });
  const initialBias = entering ? -0.3 : 0.7;
  const finalBias = entering ? 0.7 : -0.3;
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

  // Brightness owns 80% of the reveal order. Bayer or Atkinson textures only its advancing tonal edge, before the independent color registration.
  let mask = `        <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.2126 0.7152 0.0722 0 0" result="brightness" />
        <feImage href="${tile.href}" x="0" y="0" width="${tile.size}" height="${tile.size}" result="tile" />
        <feTile in="tile" result="pattern" />
        <feColorMatrix in="pattern" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="thresholds" />
        <feComposite in="brightness" in2="thresholds" operator="arithmetic" k2="0.8" k3="-0.2" k4="${initialBias}" result="coverage">
          <animate attributeName="k4" from="${initialBias}" to="${finalBias}" dur="${duration}ms" begin="indefinite" fill="freeze" />
        </feComposite>
        <feComponentTransfer in="coverage" result="mask">
          <feFuncA type="discrete" tableValues="0 1" />
        </feComponentTransfer>
`;
  if (prepared) {
    const frames = entering ? prepared.frames : [...prepared.frames].reverse();
    mask = `
      <feImage href="${frames[0]}" width="100%" height="100%" preserveAspectRatio="none" result="coverage-image">
        <animate attributeName="href" values="${frames.join(';')}" keyTimes="${frames.map((_, i) => i / (frames.length - 1)).join(';')}" calcMode="discrete" dur="${duration}ms" begin="indefinite" fill="freeze" />
      </feImage>
      <feColorMatrix in="coverage-image" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="coverage" />
      <feComponentTransfer in="coverage" result="mask"><feFuncA type="discrete" tableValues="0 1" /></feComponentTransfer>`;
  }
  svg.innerHTML = `
    <defs>
      <filter id="${id}" x="0" y="0" width="100%" height="100%" primitiveUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
        ${mask}
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
  pattern: ImageDissolvePattern = 'atkinson',
) {
  // Keep the stagger inside the established route clock. Native SVG owns coverage and color registration while the image's geometry stays authored.
  const duration = windowDuration - delay;
  const style = getComputedStyle(image);
  const restFilter = style.filter === 'none' ? '' : style.filter;
  const dissolve = dissolveFilter(entering, duration, delay, pattern, image);
  const filter = `${restFilter} url(#${dissolve.id})`.trim();
  // The constant filter animation attaches the mask and gives the coordinator its completion/cancellation clock. Its URL is never tweened.
  const animation = image.animate([{ filter }, { filter }], {
    duration,
    delay,
    fill: 'both',
  });
  return { animation, dispose: dissolve.dispose };
}
