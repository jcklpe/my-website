import type { CSSProperties, Ref } from 'vue';

type CardFieldOffset = {
  x: number;
  y: number;
  scale: number;
  rotateX: number;
  rotateY: number;
};

export function useHomeCardParallax(
  listElement: Ref<HTMLElement | null>,
  itemSelector: string,
  strength: Ref<number>,
) {
  const itemOffsets = ref<Record<number, CardFieldOffset>>({});
  const { fieldParallaxStrength } = useHomeMotionDebug();
  const transitionState = useFeaturedMediaTransitionState();
  let pointerX = 0;
  let pointerY = 0;
  let motionFrame = 0;
  let hasPointerPosition = false;
  let returnOffsets: Record<number, CardFieldOffset> = {};
  let returnStartedAt = 0;
  const returnDuration = 180;
  let isNearViewport = true;
  let proximityObserver: IntersectionObserver | null = null;
  const preparationDistance = 1500;
  let reducedMotionQuery: MediaQueryList | null = null;

  function clearOffsets() {
    if (Object.keys(itemOffsets.value).length) itemOffsets.value = {};
  }

  function updateOffsets(now: number) {
    motionFrame = 0;
    if (
      !isNearViewport ||
      transitionState.value.active ||
      reducedMotionQuery?.matches
    ) {
      clearOffsets();
      return;
    }

    if (!hasPointerPosition) {
      returnToRest(now);
      return;
    }

    const items =
      listElement.value?.querySelectorAll<HTMLElement>(itemSelector);
    if (!items) return;

    const nextOffsets: Record<number, CardFieldOffset> = {};
    items.forEach((item, index) => {
      const bounds = item.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      const deltaX = centerX - pointerX;
      const deltaY = centerY - pointerY;
      const radius = Math.max(180, Math.hypot(bounds.width, bounds.height));
      const distanceSquared =
        (deltaX * deltaX + deltaY * deltaY) / (radius * radius);
      const influence = Math.exp(-distanceSquared * 1.8);
      const fieldStrength = strength.value * fieldParallaxStrength.value;

      nextOffsets[index] = {
        x: (deltaX / radius) * influence * 3 * fieldStrength,
        y: (deltaY / radius) * influence * 2 * fieldStrength,
        scale: 1 + influence * 0.0025 * fieldStrength,
        // A shallow radial dome: the card normal tilts outward from the pointer, flattening as the field dissipates. Measure the stationary slot so the tilt cannot feed back into itself.
        rotateX: -(deltaY / radius) * influence * 4 * fieldStrength,
        rotateY: (deltaX / radius) * influence * 4 * fieldStrength,
      };
    });
    itemOffsets.value = nextOffsets;
  }

  function requestUpdate() {
    if (!motionFrame) motionFrame = window.requestAnimationFrame(updateOffsets);
  }

  function prepareListUpdate() {
    const list = listElement.value;

    // As with the heading fields, a large jump must prepare the list before an observer notification arrives. All items and compositor hints stay mounted.
    if (!isNearViewport && list) {
      const bounds = list.getBoundingClientRect();
      isNearViewport =
        bounds.bottom >= -preparationDistance &&
        bounds.top <= window.innerHeight + preparationDistance;
    }

    requestUpdate();
  }

  function trackPointer(event: PointerEvent) {
    if (event.pointerType === 'touch' || reducedMotionQuery?.matches) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    hasPointerPosition = true;
    returnOffsets = {};
    requestUpdate();
  }

  function clearPointer() {
    if (!hasPointerPosition) return;
    hasPointerPosition = false;
    returnOffsets = itemOffsets.value;
    returnStartedAt = performance.now();
    requestUpdate();
  }

  function returnToRest(now: number) {
    const progress = Math.min(
      1,
      Math.max(0, (now - returnStartedAt) / returnDuration),
    );
    if (progress === 1 || !Object.keys(returnOffsets).length) {
      returnOffsets = {};
      clearOffsets();
      return;
    }

    // Decay the last painted field rather than moving its focal point. All card, text, tilt, and shadow layers settle together without new geometry reads.
    const remaining = (1 - progress) ** 3;
    const nextOffsets: Record<number, CardFieldOffset> = {};
    for (const [index, offset] of Object.entries(returnOffsets)) {
      nextOffsets[Number(index)] = {
        x: offset.x * remaining,
        y: offset.y * remaining,
        scale: 1 + (offset.scale - 1) * remaining,
        rotateX: offset.rotateX * remaining,
        rotateY: offset.rotateY * remaining,
      };
    }
    itemOffsets.value = nextOffsets;
    requestUpdate();
  }

  function reconcileMotionPreference() {
    if (reducedMotionQuery?.matches) {
      hasPointerPosition = false;
      returnOffsets = {};
      clearOffsets();
      return;
    }

    requestUpdate();
  }

  function layerStyle(index: number, depth = 1): CSSProperties | undefined {
    const offset = itemOffsets.value[index];
    if (!offset) return;
    return {
      transform: `translate3d(${offset.x * depth}px, ${offset.y * depth}px, 0) scale(${1 + (offset.scale - 1) * depth})`,
    };
  }

  function itemStyle(index: number): CSSProperties | undefined {
    const offset = itemOffsets.value[index];
    if (!offset) return;

    return {
      transform: `perspective(1000px) translate3d(${offset.x}px, ${offset.y}px, 0) rotateX(${offset.rotateX}deg) rotateY(${offset.rotateY}deg) scale(${offset.scale})`,
    };
  }

  function shadowStyle(index: number): CSSProperties | undefined {
    const offset = itemOffsets.value[index];
    if (!offset) return;

    // Project onto the flat ground beneath the tilted card. A fixed light from the upper left pushes a lifted card's shadow down/right; radial displacement and opposing shear keep it separate from the card's perspective plane.
    const lift = (offset.scale - 1) * 600;
    const x = offset.x * 1.4 + lift * 0.6;
    const y = offset.y * 1.4 + lift * 0.8;
    const skewX = -offset.rotateY * 0.45;
    const skewY = offset.rotateX * 0.45;

    return {
      transform: `translate3d(calc(0.35rem + ${x}px), calc(0.35rem + ${y}px), 0) skew(${skewX}deg, ${skewY}deg) scale(${1 + lift * 0.001})`,
      filter: `blur(${lift * 0.25}px)`,
    };
  }

  onMounted(() => {
    if (listElement.value) {
      proximityObserver = new IntersectionObserver(
        ([entry]) => {
          if (!entry) return;
          isNearViewport = entry.isIntersecting;
          requestUpdate();
        },
        { rootMargin: `${preparationDistance}px 0px` },
      );
      proximityObserver.observe(listElement.value);
    }

    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', reconcileMotionPreference);
    window.addEventListener('pointermove', trackPointer, { passive: true });
    window.addEventListener('scroll', prepareListUpdate, { passive: true });
    window.addEventListener('resize', prepareListUpdate, { passive: true });
    document.addEventListener('mouseleave', clearPointer);
    window.addEventListener('blur', clearPointer);
  });

  watch([strength, fieldParallaxStrength, transitionState], prepareListUpdate);

  onBeforeUnmount(() => {
    proximityObserver?.disconnect();
    window.cancelAnimationFrame(motionFrame);
    reducedMotionQuery?.removeEventListener(
      'change',
      reconcileMotionPreference,
    );
    window.removeEventListener('pointermove', trackPointer);
    window.removeEventListener('scroll', prepareListUpdate);
    window.removeEventListener('resize', prepareListUpdate);
    document.removeEventListener('mouseleave', clearPointer);
    window.removeEventListener('blur', clearPointer);
  });

  return { itemStyle, layerStyle, shadowStyle };
}
