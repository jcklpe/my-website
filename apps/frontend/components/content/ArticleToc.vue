<script setup lang="ts">
  const props = defineProps<{
    target?: HTMLElement | null;
    scanKey?: unknown;
    variant?: 'writing' | 'case-study';
  }>();

  const root = computed(() => props.target ?? null);
  const scanKey = computed(() => props.scanKey);
  const { headings, activeId, scrollToHeading } = useArticleToc({
    root,
    scanKey,
  });

  const desktopCollapsed = ref(false);
  const desktopAutoCollapsed = ref(false);
  const mobileOpen = ref(false);
  const lastScrollY = ref(0);
  const collapseEligibleScrollY = ref<number | null>(null);
  const suppressCollapseUntil = ref(0);
  const railElement = ref<HTMLElement | null>(null);
  const desktopListElement = ref<HTMLElement | null>(null);
  const tocObscured = ref(false);
  const tocGeometryReady = ref(false);
  let visibilityFrameId = 0;
  let cleanupVisibilityTracking: (() => void) | null = null;

  const hasHeadings = computed(() => headings.value.length > 0);
  const rootClass = computed(() => ({
    'is-collapsed': desktopCollapsed.value,
    'is-obscured': tocObscured.value,
    'is-geometry-pending': !tocGeometryReady.value,
    'is-case-study': props.variant === 'case-study',
  }));
  const tocEntries = computed(() =>
    headings.value.map((heading) => ({
      ...heading,
      label: heading.text.replace(/^\s*\d+[a-z]?\s+[—–-]\s+/i, ''),
    })),
  );

  function toggleDesktop() {
    desktopCollapsed.value = !desktopCollapsed.value;
    desktopAutoCollapsed.value = false;
  }

  function toggleMobile() {
    mobileOpen.value = !mobileOpen.value;
  }

  function selectHeading(id: string) {
    suppressCollapseUntil.value = Date.now() + 1600;
    scrollToHeading(id);
    mobileOpen.value = false;
  }

  function onWindowScroll() {
    const currentScrollY = window.scrollY;
    const scrolledDown = currentScrollY > lastScrollY.value;
    lastScrollY.value = currentScrollY;
    const railRect = railElement.value?.getBoundingClientRect();

    if (
      desktopCollapsed.value ||
      desktopAutoCollapsed.value ||
      !hasHeadings.value ||
      !scrolledDown ||
      Date.now() < suppressCollapseUntil.value ||
      !railRect
    ) {
      return;
    }

    const railIsFullyVisible =
      railRect.top >= 0 && railRect.bottom <= window.innerHeight;

    if (railIsFullyVisible && collapseEligibleScrollY.value === null) {
      collapseEligibleScrollY.value = currentScrollY;
    }

    if (
      collapseEligibleScrollY.value !== null &&
      currentScrollY - collapseEligibleScrollY.value > 160
    ) {
      desktopCollapsed.value = true;
      desktopAutoCollapsed.value = true;
    }
  }

  function overlapSize(first: DOMRect, second: DOMRect) {
    const width = Math.min(first.right, second.right) -
      Math.max(first.left, second.left);
    const height = Math.min(first.bottom, second.bottom) -
      Math.max(first.top, second.top);

    return {
      width: Math.max(0, width),
      height: Math.max(0, height),
    };
  }

  function expandedTocRect(rail: HTMLElement) {
    const railRect = rail.getBoundingClientRect();
    const listHeight = desktopListElement.value?.scrollHeight ?? 0;
    const expandedRailHeight = desktopCollapsed.value
      ? railRect.height + listHeight
      : railRect.height;
    const expandedHeight = Math.min(
      expandedRailHeight,
      window.innerHeight - railRect.top - 24,
    );

    return new DOMRect(
      railRect.left,
      railRect.top,
      railRect.width,
      Math.max(railRect.height, expandedHeight),
    );
  }

  function updateTocObscured() {
    if (!import.meta.client || window.matchMedia('(max-width: 1180px)').matches) {
      tocObscured.value = false;
      return;
    }

    const rail = railElement.value;
    const contentFlow = rail?.closest<HTMLElement>('.content-flow');

    if (!contentFlow || !rail || !hasHeadings.value) {
      tocObscured.value = false;
      return;
    }

    const tocRect = expandedTocRect(rail);
    const tocIsVisible = tocRect.bottom > 0 && tocRect.top < window.innerHeight;

    if (!tocIsVisible) {
      tocObscured.value = false;
      return;
    }

    const candidates = Array.from(contentFlow.children).filter((element) =>
      !element.classList.contains('article-toc'),
    );
    const tocArea = tocRect.width * tocRect.height;
    let meaningfulOverlapCount = 0;
    let largestOverlapRatio = 0;

    for (const element of candidates) {
      const rect = element.getBoundingClientRect();
      const overlap = overlapSize(tocRect, rect);

      if (overlap.width < 24 || overlap.height < 18) continue;

      meaningfulOverlapCount += 1;
      largestOverlapRatio = Math.max(
        largestOverlapRatio,
        (overlap.width * overlap.height) / tocArea,
      );
    }

    tocObscured.value =
      meaningfulOverlapCount >= 3 || largestOverlapRatio >= 0.4;
  }

  function scheduleTocVisibilityUpdate() {
    if (!import.meta.client) return;

    window.cancelAnimationFrame(visibilityFrameId);
    visibilityFrameId = window.requestAnimationFrame(updateTocObscured);
  }

  function setupVisibilityTracking() {
    cleanupVisibilityTracking?.();

    if (!import.meta.client) return;

    const contentFlow = railElement.value?.closest<HTMLElement>('.content-flow');
    let mutationObserver: MutationObserver | null = null;
    let resizeObserver: ResizeObserver | null = null;

    function observeGeometry() {
      if (!contentFlow || !resizeObserver) return;

      resizeObserver.observe(contentFlow);
      resizeObserver.observe(railElement.value ?? contentFlow);

      if (desktopListElement.value) {
        resizeObserver.observe(desktopListElement.value);
      }

      for (const child of contentFlow.children) {
        resizeObserver.observe(child);
      }
    }

    if (contentFlow) {
      mutationObserver = new MutationObserver(() => {
        observeGeometry();
        scheduleTocVisibilityUpdate();
      });
      mutationObserver.observe(contentFlow, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });

      contentFlow.addEventListener('load', scheduleTocVisibilityUpdate, true);
    }

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        tocGeometryReady.value = true;
        scheduleTocVisibilityUpdate();
      });
      observeGeometry();
    } else {
      tocGeometryReady.value = true;
    }

    window.addEventListener('scroll', scheduleTocVisibilityUpdate, {
      passive: true,
    });
    window.addEventListener('resize', scheduleTocVisibilityUpdate);
    window.addEventListener('load', scheduleTocVisibilityUpdate);

    cleanupVisibilityTracking = () => {
      window.cancelAnimationFrame(visibilityFrameId);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      contentFlow?.removeEventListener('load', scheduleTocVisibilityUpdate, true);
      window.removeEventListener('scroll', scheduleTocVisibilityUpdate);
      window.removeEventListener('resize', scheduleTocVisibilityUpdate);
      window.removeEventListener('load', scheduleTocVisibilityUpdate);
    };

    scheduleTocVisibilityUpdate();
  }

  onMounted(() => {
    lastScrollY.value = window.scrollY;
    window.addEventListener('scroll', onWindowScroll, { passive: true });
    setupVisibilityTracking();
  });

  watch(
    hasHeadings,
    async (headingsAvailable) => {
      if (!headingsAvailable) return;

      await nextTick();
      setupVisibilityTracking();
    },
    { flush: 'post' },
  );

  watch(scanKey, () => {
    desktopCollapsed.value = false;
    desktopAutoCollapsed.value = false;
    mobileOpen.value = false;
    tocObscured.value = false;
    tocGeometryReady.value = false;
    collapseEligibleScrollY.value = null;
    suppressCollapseUntil.value = 0;
    lastScrollY.value = import.meta.client ? window.scrollY : 0;
    scheduleTocVisibilityUpdate();
  });

  watch([hasHeadings, desktopCollapsed], scheduleTocVisibilityUpdate);

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onWindowScroll);
    cleanupVisibilityTracking?.();
    cleanupVisibilityTracking = null;
  });
</script>

<template>
  <aside
    v-if="hasHeadings"
    class="article-toc"
    :class="rootClass"
    aria-label="Article contents"
  >
    <div ref="railElement" class="rail">
      <button
        class="toggle desktop-toggle"
        type="button"
        :aria-expanded="!desktopCollapsed"
        aria-controls="article-toc-desktop-list"
        @click="toggleDesktop"
      >
        <span>Contents</span>
      </button>

      <nav
        id="article-toc-desktop-list"
        ref="desktopListElement"
        class="list-wrap desktop-list"
        :aria-hidden="desktopCollapsed ? 'true' : undefined"
      >
        <ol class="list">
          <li
            v-for="heading in tocEntries"
            :key="heading.id"
            class="item"
            :class="[
              `is-level-${heading.level}`,
              { 'is-active': heading.id === activeId },
            ]"
          >
            <a
              class="link"
              :href="`#${heading.id}`"
              @click.prevent="selectHeading(heading.id)"
            >
              {{ heading.label }}
            </a>
          </li>
        </ol>
      </nav>

      <button
        class="toggle mobile-toggle"
        type="button"
        :aria-expanded="mobileOpen"
        aria-controls="article-toc-mobile-list"
        @click="toggleMobile"
      >
        <span>Contents</span>
      </button>

      <nav
        id="article-toc-mobile-list"
        class="list-wrap mobile-list"
        :class="{ 'is-open': mobileOpen }"
        :aria-hidden="mobileOpen ? undefined : 'true'"
      >
        <ol class="list">
          <li
            v-for="heading in tocEntries"
            :key="heading.id"
            class="item"
            :class="[
              `is-level-${heading.level}`,
              { 'is-active': heading.id === activeId },
            ]"
          >
            <a
              class="link"
              :href="`#${heading.id}`"
              @click.prevent="selectHeading(heading.id)"
            >
              {{ heading.label }}
            </a>
          </li>
        </ol>
      </nav>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
  .article-toc {
    --toc-width: clamp(11rem, 15vw, 15rem);
    --toc-start-offset: clamp(4rem, 8vh, 5rem);

    position: absolute;
    top: var(--toc-start-offset);
    left: max(
      var(--space-5),
      calc((100vw - var(--article-column)) / 4 - var(--toc-width) / 2 - 95px)
    );
    // Printed over the page/body ground; rendered article blocks sit above it.
    z-index: var(--z-low);
    width: var(--toc-width);
    height: calc(100% - var(--toc-start-offset));
    max-height: none;
    margin-top: 0;
    padding-top: 0;
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: 0.82rem;
    line-height: 1.3;
    pointer-events: none;
  }

  .article-toc.is-case-study {
    --toc-start-offset: clamp(26rem, 58vh, 34rem);
  }

  .rail {
    position: sticky;
    top: clamp(4.75rem, 9vh, 6rem);
    max-height: calc(100vh - var(--space-7));
    overflow: hidden;
    opacity: 1;
    transition: opacity 180ms var(--snappy-ease-out);
  }

  .is-obscured .rail,
  .is-geometry-pending .rail {
    opacity: 0;
    pointer-events: none;
  }

  .toggle,
  .link {
    pointer-events: auto;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    min-height: 2rem;
    padding: 0;
    border: 0;
    background: transparent;
    color: var(--color-ink);
    font: inherit;
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
  }

  .toggle::before {
    content: '▾';
    display: inline-block;
    width: 0.85em;
    color: var(--color-ink);
    font-size: 0.78rem;
    line-height: 1;
    transform-origin: 45% 55%;
    transition: transform 180ms var(--snappy-ease-out);
  }

  .is-collapsed .desktop-toggle::before,
  .mobile-toggle[aria-expanded='false']::before {
    transform: rotate(-90deg);
  }

  .list-wrap {
    overflow: hidden;
    transition:
      max-height 220ms var(--snappy-ease-out),
      opacity 180ms var(--snappy-ease-out);
  }

  .desktop-list {
    max-height: calc(100vh - var(--space-8));
    opacity: 1;
  }

  .is-collapsed .desktop-list {
    max-height: 0;
    opacity: 0;
    pointer-events: none;
  }

  .list {
    display: grid;
    gap: 0.45rem;
    margin: var(--space-3) 0 0;
    padding: 0 0 var(--space-4);
    list-style: none;
  }

  .item {
    margin: 0;
    padding-left: calc((var(--toc-level, 2) - 2) * 0.58rem);
  }

  .is-level-2 { --toc-level: 2; }
  .is-level-3 { --toc-level: 3; }
  .is-level-4 { --toc-level: 4; }
  .is-level-5 { --toc-level: 5; }
  .is-level-6 { --toc-level: 6; }

  .link {
    display: block;
    padding-left: 0;
    text-indent: 0;
    color: inherit;
    text-decoration: none;
    overflow-wrap: anywhere;
    transition:
      color 160ms var(--snappy-ease-out),
      transform 160ms var(--snappy-ease-out);
  }

  .link:hover,
  .link:focus-visible,
  .is-active .link {
    color: var(--color-primary);
  }

  .is-active .link {
    font-weight: 700;
  }

  .mobile-toggle,
  .mobile-list {
    display: none;
  }

  @media (max-width: 1180px) {
    .article-toc {
      position: relative;
      top: auto;
      left: auto;
      grid-column: content;
      justify-self: stretch;
      z-index: var(--z-mid);
      width: 100%;
      height: auto;
      max-height: none;
      margin: 0 0 var(--space-5);
      padding-inline: 0;
      padding-top: 0;
      pointer-events: auto;
    }

    .rail {
      position: static;
      max-height: none;
      overflow: visible;
    }

    .desktop-toggle,
    .desktop-list {
      display: none;
    }

    .mobile-toggle {
      display: inline-flex;
      min-height: 44px;
    }

    .mobile-list {
      display: block;
      max-height: 0;
      opacity: 0;
      pointer-events: none;
    }

    .mobile-list.is-open {
      max-height: 70vh;
      opacity: 1;
      pointer-events: auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .list-wrap,
    .link,
    .rail {
      transition: none;
    }
  }
</style>
