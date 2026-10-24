import type PhotoSwipe from 'photoswipe';
import { createFeaturedMediaTrails } from './featured-media-trails';

// PhotoSwipe owns the real image and crop; these optional echoes never hold up its handoff.
export function attachLightboxTrails(
  viewer: PhotoSwipe,
  settings: { count: number; opacity: number; spread: number },
) {
  const trails = createFeaturedMediaTrails();
  let image: HTMLImageElement | undefined;
  let owner: HTMLElement | undefined;
  let ready = Promise.resolve();
  let flightId = 0;
  let removeStartListener = () => {};

  function stop() {
    flightId++;
    removeStartListener();
    trails.stop();
  }

  function prepare() {
    stop();
    image = undefined;
    const data = viewer.currSlide?.data;
    const src = data?.msrc || data?.src;
    if (!src) return;
    image = new Image();
    image.src = src;
    ready = trails.prepare(image.src, 'photo');
  }

  function play(closing: boolean) {
    const slide = viewer.currSlide;
    const bounds = viewer.getThumbBounds();
    if (!slide || !image || !owner || !bounds || viewer.mainScroll.isShifted())
      return;
    const duration = closing
      ? viewer.options.hideAnimationDuration
      : viewer.options.showAnimationDuration;
    if (!duration || !slide.width || !slide.height) return;

    const crop = bounds.innerRect;
    const inline = {
      left: bounds.x - (crop?.x ?? 0),
      top: bounds.y - (crop?.y ?? 0),
      width: crop?.w ?? bounds.w,
      height: crop?.h ?? (bounds.w * slide.height) / slide.width,
    };
    // The opener temporarily overwrites pan/zoom with the thumbnail geometry. Bounds still hold the settled initial center.
    const zoom = closing ? slide.currZoomLevel : slide.zoomLevels.initial;
    const pan = closing ? slide.pan : slide.bounds.center;
    const expanded = {
      left: pan.x,
      top: pan.y,
      width: slide.width * zoom,
      height: slide.height * zoom,
    };
    removeStartListener();
    const currentFlight = ++flightId;
    const trailImage = image;
    const trailOwner = owner;
    const flight = {
      from: closing ? expanded : inline,
      to: closing ? inline : expanded,
      radiusFrom: '0px',
      radiusTo: '0px',
      duration,
      easing: viewer.options.easing,
      treatment: 'photo' as const,
      ...settings,
    };
    const onStart = (event: TransitionEvent) => {
      if (
        event.target !== slide.container ||
        event.propertyName !== 'transform'
      )
        return;
      removeStartListener();
      // PhotoSwipe defers its CSS transform after the opener event. Follow the actual transition so echoes cannot lead the image.
      const startedAt = performance.now() - event.elapsedTime * 1000;
      void ready.then(() => {
        // Join at the current point in the curve, never replay the source position or delay the real image.
        if (
          currentFlight !== flightId ||
          performance.now() - startedAt > duration * 0.4
        )
          return;
        trails.play(trailOwner, trailImage, { ...flight, startedAt });
      });
    };
    slide.container.addEventListener('transitionstart', onStart);
    removeStartListener = () =>
      slide.container.removeEventListener('transitionstart', onStart);
  }

  viewer.on('firstUpdate', () => {
    owner = document.createElement('div');
    owner.className = 'pswp-trails';
    owner.setAttribute('aria-hidden', 'true');
    // Above the backdrop, below the moving image and controls.
    viewer.element?.insertBefore(owner, viewer.scrollWrap ?? null);
  });
  viewer.on('change', prepare);
  viewer.on('openingAnimationStart', () => play(false));
  viewer.on('closingAnimationStart', () => play(true));
  viewer.on('resize', stop);
  viewer.on('destroy', () => {
    stop();
    trails.dispose();
    owner?.remove();
  });
}
