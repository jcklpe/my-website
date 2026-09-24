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
