// Home-surface side of the featured-media transition: the elements AROUND the
// clicked case-study card assemble out (forward, home → detail) and back in
// (reverse, detail → home), so nothing on the home page pops in or out of
// existence — it comes together as a set around the card that flies.
//
// Why JS (Web Animations API) rather than CSS classes: the split is positional
// (each unit moves up or down depending on whether it sits above or below the
// clicked card) and staggered by distance from the card — both need measured
// geometry at transition time, which CSS can't express. The clicked card and
// its own section are deliberately excluded; the card itself is handled by the
// flying clone.
//
// Coupling: the forward hold that lets the out-animation play before navigation
// lives in useFeaturedMediaTransition (waitForSurroundingsExit); it reads the
// same --surroundings-duration token, so the two stay in lockstep.

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

  return source?.closest<HTMLElement>('.case-study-card') ?? null;
}

// Sibling top-level home sections (excluding the one that contains the clicked
// card) plus the sibling cards (excluding the clicked one). The clicked card's
// own section is dropped as a whole so the card doesn't get dragged with it; its
// sibling cards are re-collected individually.
function collectSurroundingUnits(clicked: HTMLElement): HTMLElement[] {
  const sections = Array.from(
    document.querySelectorAll<HTMLElement>('.home-page > *'),
  ).filter((section) => !section.contains(clicked));

  const cards = Array.from(
    document.querySelectorAll<HTMLElement>('.case-study-card'),
  ).filter((card) => card !== clicked);

  return [...sections, ...cards];
}

export function useHomeTransitionChoreography() {
  const state = useFeaturedMediaTransitionState();

  function animateSurroundings(direction: 'out' | 'in') {
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
    const duration = surroundingsDuration();
    const easing = surroundingsEasing(direction);
    const entranceDelay = direction === 'in' ? surroundingsEntranceDelay() : 0;

    const units = collectSurroundingUnits(clicked)
      .map((element) => ({ element, rect: element.getBoundingClientRect() }))
      // In-frame only — no point animating elements the viewer can't see.
      .filter(({ rect }) => rect.bottom > 0 && rect.top < viewportHeight)
      .map((unit) => {
        const middle = unit.rect.top + unit.rect.height / 2;
        const above = middle < cardMiddle;
        // Translate fully OUT of frame in the element's direction — no fade, so
        // it stays fully opaque the whole time it's on screen and simply leaves.
        // Above the card: up until its bottom clears the top. Below: down until
        // its top clears the bottom.
        const offFrame = above
          ? -(unit.rect.bottom + SURROUNDINGS_CLEAR_BUFFER_PX)
          : viewportHeight - unit.rect.top + SURROUNDINGS_CLEAR_BUFFER_PX;
        return {
          element: unit.element,
          offFrame,
          distance: Math.abs(middle - cardMiddle),
        };
      })
      // Closest to the card leaves/arrives first — the set radiates from it.
      .sort((a, b) => a.distance - b.distance);

    units.forEach((unit, index) => {
      const offFrame = { transform: `translateY(${unit.offFrame}px)` };
      const inPlace = { transform: 'translateY(0)' };

      unit.element.animate(
        direction === 'out' ? [inPlace, offFrame] : [offFrame, inPlace],
        {
          duration,
          delay: entranceDelay + index * SURROUNDINGS_STAGGER_MS,
          easing,
          // out: hold the off-frame end state until the page unmounts. in: hold
          // the off-frame start state through the stagger delay, then release so
          // the element returns to its natural style (no lingering transform).
          fill: direction === 'out' ? 'forwards' : 'backwards',
        },
      );
    });
  }

  return { animateSurroundings };
}
