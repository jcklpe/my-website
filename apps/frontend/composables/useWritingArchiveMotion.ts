// Departures split horizontally; returns preserve the archive’s vertical reading order.
export function writingArchiveDisplacement(
  rect: DOMRect,
  selected: DOMRect,
  direction: 'in' | 'out' = 'in',
) {
  const above = rect.top + rect.height / 2 < selected.top + selected.height / 2;
  if (direction === 'out') {
    return `translateX(${above ? window.innerWidth - rect.left + 32 : -rect.right - 32}px)`;
  }
  return `translateY(${above ? -rect.bottom - 32 : window.innerHeight - rect.top + 32}px)`;
}

export function writingArchiveMotionDuration(
  property = '--surroundings-duration',
) {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(property)
    .trim();
  const value = parseFloat(raw);
  return raw.endsWith('ms') ? value : value * 1000;
}

export function useWritingArchiveMotion(root: Ref<HTMLElement | null>) {
  const state = useFeaturedMediaTransitionState();
  const animations = new Set<Animation>();
  watch(
    () => state.value.active,
    (active, wasActive) => {
      if (!active) {
        for (const animation of animations) animation.cancel();
        animations.clear();
        return;
      }
      if (wasActive || state.value.sourceRole !== 'source') return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const selected = root.value
        ?.querySelector<HTMLElement>(
          `[data-featured-media-source="${state.value.key}"]`,
        )
        ?.closest('.row-item');
      if (!selected || !root.value) return;
      const selectedRect = selected.getBoundingClientRect();
      const style = getComputedStyle(document.documentElement);
      const duration = writingArchiveMotionDuration();
      const units = Array.from(
        root.value.querySelectorAll<HTMLElement>(
          '.section-heading, .year-header, .row-item, .archive-actions',
        ),
      );
      const visible = units.filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          element !== selected &&
          rect.bottom > 0 &&
          rect.top < window.innerHeight
        );
      });
      const rows = Array.from(root.value.querySelectorAll('.row-item'));
      const selectedIndex = rows.indexOf(selected);
      const ringFor = (element: HTMLElement) => {
        let index = rows.indexOf(element);
        if (element.matches('.year-header'))
          index = rows.indexOf(
            element.closest('.year-group')!.querySelector('.row-item')!,
          );
        if (index >= 0) return Math.abs(index - selectedIndex);
        // The archive heading and final controls sit just outside the row sequence.
        return element.matches('.section-heading')
          ? selectedIndex + 1
          : rows.length - selectedIndex;
      };
      const rings = [...new Set(visible.map(ringFor))].sort((a, b) => a - b);
      const step = Math.min(
        writingArchiveMotionDuration('--writing-exit-ring-stagger'),
        writingArchiveMotionDuration('--writing-exit-max-delay') /
          Math.max(1, rings.length - 1),
      );
      for (const element of visible) {
        const rect = element.getBoundingClientRect();
        const delay = rings.indexOf(ringFor(element)) * step;
        const animation = element.animate(
          [
            { transform: getComputedStyle(element).transform },
            {
              transform: writingArchiveDisplacement(rect, selectedRect, 'out'),
            },
          ],
          {
            duration,
            delay,
            easing: style.getPropertyValue('--snappy-ease-in').trim(),
            fill: 'forwards',
          },
        );
        animations.add(animation);
      }
    },
  );
  watch(
    () => state.value.phase,
    (phase) => {
      if (
        phase !== 'moving' ||
        state.value.sourceRole !== 'target' ||
        !root.value
      )
        return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const selected = root.value
        .querySelector<HTMLElement>(
          `[data-featured-media-source="${state.value.key}"]`,
        )
        ?.closest('.row-item');
      if (!selected) return;
      for (const element of root.value.querySelectorAll<HTMLElement>(
        '.section-heading, .archive-actions',
      )) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= innerHeight) continue;
        const animation = element.animate(
          [
            {
              transform: writingArchiveDisplacement(
                rect,
                selected.getBoundingClientRect(),
                'in',
              ),
            },
            { transform: 'translate(0)' },
          ],
          {
            duration: writingArchiveMotionDuration(),
            easing: getComputedStyle(document.documentElement)
              .getPropertyValue('--snappy-ease-out')
              .trim(),
            fill: 'backwards',
          },
        );
        animations.add(animation);
      }
    },
  );
  onBeforeUnmount(() => {
    for (const animation of animations) animation.cancel();
  });
}
