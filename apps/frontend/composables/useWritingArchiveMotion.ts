// Rows keep their vertical relationship to the selected post. The diagnostic preview can opt into the horizontal comparison without changing production defaults.
export function writingArchiveDisplacement(rect: DOMRect, selected: DOMRect) {
  const above = rect.top + rect.height / 2 < selected.top + selected.height / 2;
  if (document.documentElement.dataset.writingArchiveMotion === 'horizontal') {
    return `translateX(${above ? window.innerWidth - rect.left + 32 : -rect.right - 32}px)`;
  }
  return `translateY(${above ? -rect.bottom - 32 : window.innerHeight - rect.top + 32}px)`;
}

export function writingArchiveMotionDuration() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--surroundings-duration')
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
      for (const element of root.value.querySelectorAll<HTMLElement>(
        '.section-heading, .year-header, .row-item, .archive-actions',
      )) {
        if (element === selected) continue;
        const rect = element.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        const animation = element.animate(
          [
            { transform: 'translate(0)' },
            { transform: writingArchiveDisplacement(rect, selectedRect) },
          ],
          {
            duration,
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
      const selectedRect = selected.getBoundingClientRect();
      const style = getComputedStyle(document.documentElement);
      for (const element of root.value.querySelectorAll<HTMLElement>(
        '.section-heading, .year-header, .archive-actions',
      )) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) continue;
        const animation = element.animate(
          [
            { transform: writingArchiveDisplacement(rect, selectedRect) },
            { transform: 'translate(0)' },
          ],
          {
            duration: writingArchiveMotionDuration(),
            easing: style.getPropertyValue('--snappy-ease-out').trim(),
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
