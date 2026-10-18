import { crtWarmupLight, lifeCrtWarmupAge } from './life-crt';

let sequence = 0;

export function distortRouteCrt(root: HTMLElement) {
  const age = lifeCrtWarmupAge();
  const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (age < 0 || age >= 2.8 || preference.matches) return () => {};
  const strength = Math.min(7, crtWarmupLight(age).glow * 16);
  if (strength < 0.1) return () => {};
  // Filter only visible content units, avoiding a raster surface as tall as the whole article. The Conway background keeps its own shader.
  const elements = Array.from(
    root.querySelectorAll<HTMLElement>('.section-heading, .body > *'),
  ).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.top < innerHeight && rect.bottom > 0;
  });
  const id = `route-crt-distortion-${++sequence}`;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.setAttribute('aria-hidden', 'true');
  svg.dataset.routeCrtDistortion = '';
  svg.style.position = 'fixed';
  const duration = Math.min(800, (2.8 - age) * 1000);
  svg.innerHTML = `<defs><filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.035" numOctaves="1" seed="7" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="${strength}" xChannelSelector="R" yChannelSelector="G"><animate attributeName="scale" values="${strength};${-strength * 0.45};${strength * 0.2};0" keyTimes="0;0.25;0.55;1" dur="${duration}ms" begin="0s" fill="freeze" /></feDisplacementMap></filter></defs>`;
  document.body.append(svg);
  const originals = elements.map((element) => ({
    element,
    filter: element.style.filter,
  }));
  for (const element of elements) {
    const filter = getComputedStyle(element).filter;
    element.style.filter =
      `${filter === 'none' ? '' : filter} url(#${id})`.trim();
  }
  let timer = 0;
  function dispose() {
    clearTimeout(timer);
    for (const { element, filter } of originals) element.style.filter = filter;
    svg.remove();
    preference.removeEventListener('change', dispose);
  }
  preference.addEventListener('change', dispose);
  timer = window.setTimeout(dispose, duration);
  return dispose;
}
