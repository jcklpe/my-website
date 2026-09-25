type HalftoneController = {
  invalidate: () => void;
  setFlightActive: (active: boolean) => void;
};

let requested: boolean | null = null;
let controller: HalftoneController | null = null;
let flightActive = false;

export function isLiveHalftoneRequested() {
  if (typeof window === 'undefined') return false;
  requested ??=
    new URLSearchParams(window.location.search).get('experimentalHalftone') !==
    '0';
  return requested;
}

export function setLiveHalftoneController(next: HalftoneController | null) {
  controller = next;
  controller?.setFlightActive(flightActive);
}

export function invalidateLiveHalftone() {
  controller?.invalidate();
}

export function setLiveHalftoneFlightActive(active: boolean) {
  flightActive = active;
  controller?.setFlightActive(flightActive);
}

// Image decode and live shader paint are separate readiness events. A failed or slow renderer must release a usable image rather than leave navigation hidden.
export function waitForLiveHalftonePaint(image: HTMLImageElement) {
  if (
    !isLiveHalftoneRequested() ||
    !document.documentElement.classList.contains('is-live-halftone-pending')
  )
    return Promise.resolve();

  const root = image.closest<HTMLElement>(
    '.card-halftone-box, .hero-halftone-box, .media-treatment, .frame-halftone, .strip-halftone-box',
  );
  if (!root) return Promise.resolve();
  const isReady = () =>
    root.classList.contains('is-live-halftone-ready') ||
    root.classList.contains('is-live-halftone-failed');
  if (isReady()) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const observer = new MutationObserver(() => {
      if (isReady()) finish();
    });
    const timeout = window.setTimeout(() => {
      root.classList.add('is-live-halftone-failed');
      finish();
    }, 700);
    function finish() {
      clearTimeout(timeout);
      observer.disconnect();
      resolve();
    }
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
  });
}
