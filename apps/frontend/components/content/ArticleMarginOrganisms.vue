<script setup lang="ts">
  const host = ref<HTMLElement | null>(null);
  const patches = ref<
    Array<{ id: string; left: number; top: number; width: number }>
  >([]);
  const transitionState = useFeaturedMediaTransitionState();
  const initialized = ref<Set<string>>(new Set());
  const nearby = new Set<string>();
  let preparationObserver: IntersectionObserver | null = null;
  let preparationTimer: ReturnType<typeof setTimeout> | null = null;
  const visible = ref<Set<string>>(new Set());
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let frame = 0;
  let disposed = false;
  let bodyElement: Element | null = null;
  const patchHeight = 420;

  // Prepare one nearby patch per task, after route choreography settles. Keep it mounted on return scrolling; distant patches never compete with page entry.
  function prepareNext() {
    if (disposed || preparationTimer || transitionState.value.active) return;
    const id = patches.value.find(
      (patch) => nearby.has(patch.id) && !initialized.value.has(patch.id),
    )?.id;
    if (!id) return;
    preparationTimer = setTimeout(() => {
      preparationTimer = null;
      if (disposed || transitionState.value.active) return;
      if (nearby.has(id))
        initialized.value = new Set([...initialized.value, id]);
      prepareNext();
    }, 32);
  }
  watch(
    () => transitionState.value.active,
    (active) => {
      if (!active) prepareNext();
    },
  );

  // Document coordinates are stable during scrolling. Replan only when article layout changes; measure actual content surfaces so wide/full blocks and apparatus reserve their space before a patch is placed.
  async function measure() {
    frame = 0;
    const article = host.value?.closest('article');
    const body = article?.querySelector<HTMLElement>('[data-rd-article-body]');
    if (!article || !body || !host.value) return;
    const origin = host.value.getBoundingClientRect();
    const bodyRect = body.getBoundingClientRect();
    const width = Math.min(330, (origin.width - 800) / 2 - 40);
    if (width < 140 || window.innerWidth < 992) {
      patches.value = [];
      initialized.value = new Set();
      nearby.clear();
      preparationObserver?.disconnect();
      intersectionObserver?.disconnect();
      return;
    }
    const obstacles = Array.from(
      body.querySelectorAll<HTMLElement>(
        '.alignwide, .alignfull, .alignleft, .alignright, figure, table, pre, blockquote, .footnote-sidenote',
      ),
    ).map((el) => el.getBoundingClientRect());
    const planned: typeof patches.value = [];
    const first = Math.max(
      window.innerHeight * 1.5 - (origin.top + window.scrollY),
      bodyRect.top - origin.top + 80,
    );
    for (
      let top = first;
      top + patchHeight < bodyRect.bottom - origin.top && planned.length < 8;
      top += 620
    ) {
      const sides =
        planned.length % 2
          ? [origin.width - width - 16, 16]
          : [16, origin.width - width - 16];
      for (const left of sides) {
        const blocked = obstacles.some(
          (rect) =>
            rect.right + 32 > origin.left + left &&
            rect.left - 32 < origin.left + left + width &&
            rect.bottom + 40 > origin.top + top &&
            rect.top - 40 < origin.top + top + patchHeight,
        );
        if (blocked) continue;
        planned.push({ id: `patch-${Math.round(top)}`, left, top, width });
        break;
      }
    }
    const plannedIds = new Set(planned.map((patch) => patch.id));
    initialized.value = new Set(
      [...initialized.value].filter((id) => plannedIds.has(id)),
    );
    patches.value = planned;
    await nextTick();
    if (disposed) return;
    preparationObserver?.disconnect();
    nearby.clear();
    preparationObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.patchId!;
          if (entry.isIntersecting) nearby.add(id);
          else nearby.delete(id);
        }
        prepareNext();
      },
      { rootMargin: `${window.innerHeight}px 0px` },
    );
    intersectionObserver?.disconnect();
    intersectionObserver = new IntersectionObserver(
      (entries) => {
        const next = new Set(visible.value);
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.patchId!;
          if (entry.isIntersecting) next.add(id);
          else next.delete(id);
        }
        visible.value = next;
      },
      { rootMargin: '100px' },
    );
    host.value
      ?.querySelectorAll<HTMLElement>('[data-patch-id]')
      .forEach((el) => {
        preparationObserver?.observe(el);
        intersectionObserver?.observe(el);
      });
  }
  function schedule() {
    if (!disposed && !frame)
      frame = requestAnimationFrame(() => void measure());
  }
  onMounted(() => {
    resizeObserver = new ResizeObserver(schedule);
    const body = host.value
      ?.closest('article')
      ?.querySelector('[data-rd-article-body]');
    bodyElement = body ?? null;
    bodyElement?.addEventListener('load', schedule, true);
    if (body) resizeObserver.observe(body);
    window.addEventListener('resize', schedule, { passive: true });
    document.fonts.ready.then(schedule);
    schedule();
  });
  onBeforeUnmount(() => {
    disposed = true;
    bodyElement?.removeEventListener('load', schedule, true);
    cancelAnimationFrame(frame);
    if (preparationTimer) clearTimeout(preparationTimer);
    preparationObserver?.disconnect();
    resizeObserver?.disconnect();
    intersectionObserver?.disconnect();
    window.removeEventListener('resize', schedule);
  });
</script>

<template>
  <div ref="host" class="organisms" aria-hidden="true">
    <div
      v-for="patch in patches"
      :key="patch.id"
      class="patch"
      :data-patch-id="patch.id"
      :style="{
        left: `${patch.left}px`,
        top: `${patch.top}px`,
        width: `${patch.width}px`,
        height: `${patchHeight}px`,
      }"
    >
      <HomeReactionDiffusionBackground
        v-if="initialized.has(patch.id)"
        :paused="!visible.has(patch.id)"
        presentation="patch"
      />
    </div>
  </div>
</template>

<style scoped>
  .organisms {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }
  .patch {
    position: absolute;
    pointer-events: none;
  }
</style>
