import type { CSSProperties, Ref } from 'vue';

type FieldOffset = { x: number; y: number };

export function useHomeHeadingParallax(
  headingElement: Ref<HTMLElement | null>,
  decorationElement?: Ref<HTMLElement | null>,
) {
  const letterOffsets = ref<Record<string, FieldOffset>>({});
  const decorationOffset = ref<FieldOffset>({ x: 0, y: 0 });
  const transitionState = useFeaturedMediaTransitionState();
  let currentX = 0;
  let currentY = 0;
  let targetX = 0;
  let targetY = 0;
  let currentStrength = 0;
  let targetStrength = 0;
  let frame = 0;
  let hasPointerPosition = false;
  let reducedMotionQuery: MediaQueryList | null = null;

  function updatePointer(event: PointerEvent) {
    if (event.pointerType === 'touch' || reducedMotionQuery?.matches) return;

    targetX = event.clientX;
    targetY = event.clientY;
    targetStrength = 1;

    if (!hasPointerPosition) {
      currentX = targetX;
      currentY = targetY;
      hasPointerPosition = true;
    }

    requestUpdate();
  }

  function clearPointer() {
    targetStrength = 0;
    requestUpdate();
  }

  function fieldOffset(
    bounds: DOMRect,
    horizontalTravel: number,
    verticalTravel: number,
  ): FieldOffset {
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const deltaX = centerX - currentX;
    const deltaY = centerY - currentY;
    const radius = Math.max(120, bounds.height * 2.6);
    const normalizedDistanceSquared =
      (deltaX * deltaX + deltaY * deltaY) / (radius * radius);
    const influence =
      Math.exp(-normalizedDistanceSquared * 1.55) * currentStrength;

    return {
      x: (deltaX / radius) * influence * horizontalTravel,
      y: (deltaY / radius) * influence * verticalTravel,
    };
  }

  function updateOffsets() {
    const heading = headingElement.value;

    if (
      !heading ||
      transitionState.value.active ||
      reducedMotionQuery?.matches
    ) {
      letterOffsets.value = {};
      decorationOffset.value = { x: 0, y: 0 };
      return;
    }

    const nextOffsets: Record<string, FieldOffset> = {};
    const letters = heading.querySelectorAll<HTMLElement>(
      '[data-heading-position]',
    );

    letters.forEach((letter) => {
      const position = letter.dataset.headingPosition;
      if (!position) return;
      nextOffsets[position] = fieldOffset(
        letter.getBoundingClientRect(),
        36,
        28,
      );
    });

    letterOffsets.value = nextOffsets;

    const decoration = decorationElement?.value;
    decorationOffset.value = decoration
      ? fieldOffset(decoration.getBoundingClientRect(), 28, 20)
      : { x: 0, y: 0 };
  }

  function animate() {
    frame = 0;
    currentX += (targetX - currentX) * 0.2;
    currentY += (targetY - currentY) * 0.2;
    currentStrength += (targetStrength - currentStrength) * 0.16;

    if (currentStrength < 0.001 && targetStrength === 0) {
      currentStrength = 0;
      letterOffsets.value = {};
      decorationOffset.value = { x: 0, y: 0 };
      return;
    }

    updateOffsets();

    const pointerSettled =
      Math.abs(targetX - currentX) < 0.05 &&
      Math.abs(targetY - currentY) < 0.05;
    const strengthSettled = Math.abs(targetStrength - currentStrength) < 0.001;

    if (!pointerSettled || !strengthSettled) requestUpdate();
  }

  function requestUpdate() {
    if (!frame) frame = window.requestAnimationFrame(animate);
  }

  function reconcileMotionPreference() {
    if (reducedMotionQuery?.matches) {
      targetStrength = 0;
      currentStrength = 0;
      letterOffsets.value = {};
      decorationOffset.value = { x: 0, y: 0 };
      return;
    }

    requestUpdate();
  }

  function letterStyle(position: string | number): CSSProperties | undefined {
    const offset = letterOffsets.value[String(position)];
    if (!offset) return;

    return {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    };
  }

  function decorationStyle(): CSSProperties | undefined {
    const offset = decorationOffset.value;
    if (!offset.x && !offset.y) return;

    return {
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    };
  }

  onMounted(() => {
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', reconcileMotionPreference);
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate, { passive: true });
    document.addEventListener('mouseleave', clearPointer);
  });

  watch(
    () => transitionState.value.active,
    (active) => {
      if (active) {
        letterOffsets.value = {};
        decorationOffset.value = { x: 0, y: 0 };
        return;
      }

      requestUpdate();
    },
  );

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener('pointermove', updatePointer);
    window.removeEventListener('scroll', requestUpdate);
    window.removeEventListener('resize', requestUpdate);
    document.removeEventListener('mouseleave', clearPointer);
    reducedMotionQuery?.removeEventListener(
      'change',
      reconcileMotionPreference,
    );
  });

  return { decorationStyle, letterStyle };
}
