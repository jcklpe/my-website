// Home surroundings move away from the selected card and return around its measured destination. The primary shared elements belong to the flying clone.
// The coordinator waits for the actual departures to finish and paint before navigating.

const FALLBACK_SNAPPY_EASE_OUT = 'cubic-bezier(0.2, 0.85, 0.32, 1)';
const FALLBACK_SNAPPY_EASE_IN = 'cubic-bezier(0.85, 0.2, 1, 0.32)';
// Extra px beyond the viewport edge so an element fully clears the frame.
const SURROUNDINGS_CLEAR_BUFFER_PX = 32;
const SURROUNDINGS_STAGGER_MS = 35;

function prefersReducedMotion() {
  return (
    import.meta.client &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function cssTimeMilliseconds(name: string, fallback: number) {
  if (!import.meta.client) {
    return fallback;
  }

  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parsed = raw.endsWith('ms')
    ? Number.parseFloat(raw)
    : raw.endsWith('s')
      ? Number.parseFloat(raw) * 1000
      : Number.parseFloat(raw);

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function surroundingsDuration() {
  return cssTimeMilliseconds('--surroundings-duration', 500);
}

function surroundingsEntranceDelay() {
  return cssTimeMilliseconds('--content-delay', 0);
}

function motionProperty(name: string, fallback: string) {
  if (!import.meta.client) {
    return fallback;
  }

  return (
    getComputedStyle(document.documentElement).getPropertyValue(name).trim() ||
    fallback
  );
}

function surroundingsEasing(direction: 'out' | 'in') {
  return direction === 'out'
    ? motionProperty('--snappy-ease-in', FALLBACK_SNAPPY_EASE_IN)
    : motionProperty('--snappy-ease-out', FALLBACK_SNAPPY_EASE_OUT);
}

function clickedCardForKey(key: string): HTMLElement | null {
  const source = document.querySelector<HTMLElement>(
    `[data-featured-media-source="${key}"]`,
  );

  return source?.closest<HTMLElement>('.case-study-card, .post-card') ?? null;
}

function collectSurroundingUnits(clicked: HTMLElement): HTMLElement[] {
  const home = clicked.closest('.home-page');
  if (!home) return [];

  const sections = Array.from(home.children).filter(
    (section): section is HTMLElement =>
      section instanceof HTMLElement && !section.contains(clicked),
  );
  const writing = clicked.closest('.latest-writing-section');
  if (writing) {
    const siblings = Array.from(
      writing.querySelectorAll<HTMLElement>('.bento-post-list > li'),
    ).filter((item) => !item.contains(clicked));
    const furniture = Array.from(writing.children).filter(
      (element): element is HTMLElement =>
        element instanceof HTMLElement && !element.contains(clicked),
    );
    return [...sections, ...furniture, ...siblings];
  }

  const cards = Array.from(
    clicked
      .closest('.selected-work-section')
      ?.querySelectorAll<HTMLElement>('.case-study-card') ?? [],
  ).filter((card) => card !== clicked);
  const selectedWorkLabel = clicked
    .closest('.selected-work-section')
    ?.querySelector<HTMLElement>('.section-label');
  return [
    ...sections,
    ...(selectedWorkLabel ? [selectedWorkLabel] : []),
    ...cards,
  ];
}

function writingExitDirection(rect: DOMRect, selected: DOMRect) {
  const x = rect.left + rect.width / 2 - selected.left - selected.width / 2;
  const y = rect.top + rect.height / 2 - selected.top - selected.height / 2;
  const overlapsRow =
    Math.min(rect.bottom, selected.bottom) > Math.max(rect.top, selected.top);
  const overlapsColumn =
    Math.min(rect.right, selected.right) > Math.max(rect.left, selected.left);
  if (overlapsRow && !overlapsColumn) return x < 0 ? 'left' : 'right';
  if (overlapsColumn && !overlapsRow) return y < 0 ? 'up' : 'down';

  // Diagonal/partial-overlap ties favor vertical flow; normalize by both cards' sizes so a large bento tile does not dominate the decision.
  const horizontalSeparation =
    Math.abs(x) / ((rect.width + selected.width) / 2);
  const verticalSeparation =
    Math.abs(y) / ((rect.height + selected.height) / 2);
  if (horizontalSeparation > verticalSeparation)
    return x < 0 ? 'left' : 'right';
  return y < 0 ? 'up' : 'down';
}

function clipsDescendants(style: CSSStyleDeclaration) {
  return (
    style.overflowX !== 'visible' ||
    style.overflowY !== 'visible' ||
    style.clipPath !== 'none'
  );
}

function isUnpainted(style: CSSStyleDeclaration) {
  return (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0'
  );
}

function extendBounds(bounds: DOMRect, rect: DOMRect) {
  const left = Math.min(bounds.left, rect.left);
  const top = Math.min(bounds.top, rect.top);
  const right = Math.max(bounds.right, rect.right);
  const bottom = Math.max(bounds.bottom, rect.bottom);
  bounds.x = left;
  bounds.y = top;
  bounds.width = right - left;
  bounds.height = bottom - top;
}

// Content can paint well outside its unit's box: the hero portrait hangs below `.home-intro`, and the Selected Work heading overflows a zero-height label. A clipping descendant cannot paint outside itself, so its subtree is skipped; walking a whole Home click costs about a millisecond.
function extendByPaintedDescendants(element: Element, bounds: DOMRect) {
  for (const child of Array.from(element.children)) {
    const style = getComputedStyle(child);

    if (isUnpainted(style)) {
      continue;
    }

    const rect = child.getBoundingClientRect();

    if (rect.width && rect.height) {
      extendBounds(bounds, rect);
    }

    if (!clipsDescendants(style)) {
      extendByPaintedDescendants(child, bounds);
    }
  }
}

// What a unit actually paints. Deciding in-frame membership and exit distance from the unit's own box left partly visible content standing still until the page swapped.
function paintedRect(element: HTMLElement) {
  const bounds = DOMRect.fromRect(element.getBoundingClientRect());

  if (!clipsDescendants(getComputedStyle(element))) {
    extendByPaintedDescendants(element, bounds);
  }

  return bounds;
}

export function useHomeTransitionChoreography() {
  const state = useFeaturedMediaTransitionState();
  const animations = new Set<Animation>();
  function clearAnimations() {
    for (const animation of animations) animation.cancel();
    animations.clear();
  }
  onBeforeUnmount(clearAnimations);

  function animateSurroundings(direction: 'out' | 'in') {
    clearAnimations();
    if (prefersReducedMotion()) {
      return;
    }

    const key = state.value.key;

    if (!key) {
      return;
    }

    const clicked = clickedCardForKey(key);

    if (!clicked) {
      return;
    }

    const cardRect = clicked.getBoundingClientRect();
    const cardMiddle = cardRect.top + cardRect.height / 2;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isWriting = Boolean(clicked.closest('.latest-writing-section'));
    const duration = surroundingsDuration();
    const easing = surroundingsEasing(direction);
    const entranceDelay = direction === 'in' ? surroundingsEntranceDelay() : 0;

    const units = collectSurroundingUnits(clicked)
      .map((element) => ({
        element,
        rect: element.getBoundingClientRect(),
        painted: paintedRect(element),
      }))
      // In-frame only — no point animating elements the viewer can't see. Painted bounds count a decoration that is visible while its unit's box is not.
      .filter(
        ({ painted }) => painted.bottom > 0 && painted.top < viewportHeight,
      )
      .map((unit) => {
        const middle = unit.rect.top + unit.rect.height / 2;
        let exit = middle < cardMiddle ? 'up' : 'down';
        if (isWriting && unit.element.matches('.bento-post-list > li')) {
          exit = writingExitDirection(unit.rect, cardRect);
        }
        // Travel far enough to clear everything the unit paints, not just its box.
        let x = 0;
        let y = 0;
        if (exit === 'left')
          x = -(unit.painted.right + SURROUNDINGS_CLEAR_BUFFER_PX);
        if (exit === 'right')
          x = viewportWidth - unit.painted.left + SURROUNDINGS_CLEAR_BUFFER_PX;
        if (exit === 'up')
          y = -(unit.painted.bottom + SURROUNDINGS_CLEAR_BUFFER_PX);
        if (exit === 'down')
          y = viewportHeight - unit.painted.top + SURROUNDINGS_CLEAR_BUFFER_PX;
        return {
          element: unit.element,
          x,
          y,
          distance: isWriting
            ? Math.hypot(
                unit.rect.left +
                  unit.rect.width / 2 -
                  cardRect.left -
                  cardRect.width / 2,
                middle - cardMiddle,
              )
            : Math.abs(middle - cardMiddle),
        };
      })
      // Closest to the card leaves/arrives first — the set radiates from it.
      .sort((a, b) => a.distance - b.distance);

    units.forEach((unit, index) => {
      const baseTransform = getComputedStyle(unit.element).transform;
      const inPlace = { transform: baseTransform };
      const offFrame = {
        transform:
          `${baseTransform === 'none' ? '' : baseTransform} translate(${unit.x}px, ${unit.y}px)`.trim(),
      };
      // Departures must finish inside the coordinator's --surroundings-duration hold or the page swaps mid-exit; the back-loaded ease-in leaves a unit cut at 90% of its time only about half way out. Arrivals have no swap to beat.
      const fitsHold = isWriting || direction === 'out';
      const stagger = fitsHold
        ? Math.min(index * SURROUNDINGS_STAGGER_MS, duration * 0.3)
        : index * SURROUNDINGS_STAGGER_MS;

      const animation = unit.element.animate(
        direction === 'out' ? [inPlace, offFrame] : [offFrame, inPlace],
        {
          duration: fitsHold ? duration - stagger : duration,
          delay: entranceDelay + stagger,
          easing,
          // out: hold the off-frame end state until the page unmounts. in: hold
          // the off-frame start state through the stagger delay, then release so
          // the element returns to its natural style (no lingering transform).
          fill: direction === 'out' ? 'forwards' : 'backwards',
        },
      );
      animations.add(animation);
      if (direction === 'in') {
        void animation.finished.then(
          () => {
            animation.cancel();
            animations.delete(animation);
          },
          () => {},
        );
      }
    });
  }

  return { animateSurroundings };
}
