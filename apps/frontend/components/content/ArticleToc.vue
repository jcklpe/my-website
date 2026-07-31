<script setup lang="ts">
  const props = defineProps<{
    target?: HTMLElement | null;
    scanKey?: unknown;
    variant?: 'writing' | 'case-study';
  }>();

  type TocVisibilityReason =
    | 'initial setup'
    | 'content mutation'
    | 'geometry resize'
    | 'content load'
    | 'window load'
    | 'window resize'
    | 'window scroll'
    | 'heading state'
    | 'scan change';

  interface TocDebugRect {
    left: number;
    top: number;
    width: number;
    height: number;
  }

  interface TocDebugImage {
    src: string;
    complete: boolean;
    naturalWidth: number;
    naturalHeight: number;
    renderedWidth: number;
    renderedHeight: number;
  }

  interface TocDebugObstacle {
    label: string;
    rawRect: TocDebugRect;
    measuredRect: TocDebugRect;
    outset: number;
    overlapWidth: number;
    overlapHeight: number;
    overlapRatio: number;
    meaningful: boolean;
    images: TocDebugImage[];
  }

  interface TocDebugSnapshot {
    sequence: number;
    reason: TocVisibilityReason;
    timestamp: string;
    geometryReadyBeforeEvaluation: boolean;
    tocRect: TocDebugRect | null;
    tocArea: number;
    meaningfulOverlapCount: number;
    largestOverlapRatio: number;
    obscured: boolean;
    decision: string;
    obstacles: TocDebugObstacle[];
  }

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
  const tocDebugEnabled = ref(false);
  const tocDebugSnapshot = ref<TocDebugSnapshot | null>(null);
  let tocDebugSequence = 0;
  let visibilityFrameId = 0;
  let pendingVisibilityReason: TocVisibilityReason = 'initial setup';
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
  const tocDebugRelevantObstacles = computed(() =>
    (tocDebugSnapshot.value?.obstacles ?? []).filter(
      (obstacle) => obstacle.overlapWidth > 0 && obstacle.overlapHeight > 0,
    ),
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
    const width =
      Math.min(first.right, second.right) - Math.max(first.left, second.left);
    const height =
      Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);

    return {
      width: Math.max(0, width),
      height: Math.max(0, height),
    };
  }

  function debugRect(rect: DOMRect): TocDebugRect {
    return {
      left: Math.round(rect.left * 10) / 10,
      top: Math.round(rect.top * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
    };
  }

  function debugObstacleLabel(element: HTMLElement) {
    const classes = [...element.classList].slice(0, 3).join('.');
    return `${element.tagName.toLowerCase()}${classes ? `.${classes}` : ''}`;
  }

  function debugObstacleImages(element: HTMLElement): TocDebugImage[] {
    const images =
      element instanceof HTMLImageElement
        ? [element]
        : [...element.querySelectorAll('img')];

    return images.map((image) => {
      const rect = image.getBoundingClientRect();

      return {
        src: image.currentSrc || image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
        renderedWidth: Math.round(rect.width * 10) / 10,
        renderedHeight: Math.round(rect.height * 10) / 10,
      };
    });
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

  function tocObstacleGeometry(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);
    const parsedOutset = Number.parseFloat(
      styles.getPropertyValue('--toc-obstacle-outset'),
    );
    const outset = Number.isFinite(parsedOutset) ? parsedOutset : 0;

    return {
      rawRect: rect,
      measuredRect: new DOMRect(
        rect.left - outset,
        rect.top - outset,
        rect.width + outset * 2,
        rect.height + outset * 2,
      ),
      outset,
    };
  }

  function candidateObstacles(candidate: Element) {
    const declaredObstacles = [
      ...(candidate.matches('[data-toc-obstacle]') ? [candidate] : []),
      ...candidate.querySelectorAll('[data-toc-obstacle]'),
    ].filter(
      (element): element is HTMLElement => element instanceof HTMLElement,
    );

    if (!declaredObstacles.length) {
      return candidate instanceof HTMLElement ? [candidate] : [];
    }

    return declaredObstacles.filter(
      (element) =>
        !declaredObstacles.some(
          (possibleAncestor) =>
            possibleAncestor !== element && possibleAncestor.contains(element),
        ),
    );
  }

  function publishTocDebugSnapshot(snapshot: TocDebugSnapshot) {
    if (!tocDebugEnabled.value) return;

    tocDebugSnapshot.value = snapshot;
    console.debug('[toc-debug]', snapshot);
  }

  function updateTocObscured(reason: TocVisibilityReason) {
    const geometryReadyBeforeEvaluation = tocGeometryReady.value;

    if (
      !import.meta.client ||
      window.matchMedia('(max-width: 1180px)').matches
    ) {
      tocObscured.value = false;
      publishTocDebugSnapshot({
        sequence: ++tocDebugSequence,
        reason,
        timestamp: new Date().toISOString(),
        geometryReadyBeforeEvaluation,
        tocRect: null,
        tocArea: 0,
        meaningfulOverlapCount: 0,
        largestOverlapRatio: 0,
        obscured: false,
        decision: 'desktop geometry disabled at this viewport',
        obstacles: [],
      });
      return;
    }

    const rail = railElement.value;
    const contentFlow = rail?.closest<HTMLElement>('.content-flow');

    if (!contentFlow || !rail || !hasHeadings.value) {
      tocObscured.value = false;
      publishTocDebugSnapshot({
        sequence: ++tocDebugSequence,
        reason,
        timestamp: new Date().toISOString(),
        geometryReadyBeforeEvaluation,
        tocRect: null,
        tocArea: 0,
        meaningfulOverlapCount: 0,
        largestOverlapRatio: 0,
        obscured: false,
        decision: 'rail, content flow, or headings unavailable',
        obstacles: [],
      });
      return;
    }

    const tocRect = expandedTocRect(rail);
    const tocIsVisible = tocRect.bottom > 0 && tocRect.top < window.innerHeight;

    if (!tocIsVisible) {
      tocObscured.value = false;
      publishTocDebugSnapshot({
        sequence: ++tocDebugSequence,
        reason,
        timestamp: new Date().toISOString(),
        geometryReadyBeforeEvaluation,
        tocRect: debugRect(tocRect),
        tocArea: tocRect.width * tocRect.height,
        meaningfulOverlapCount: 0,
        largestOverlapRatio: 0,
        obscured: false,
        decision: 'expanded rail is outside the viewport',
        obstacles: [],
      });
      return;
    }

    const candidates = Array.from(contentFlow.children).filter(
      (element) => !element.classList.contains('article-toc'),
    );
    const tocArea = tocRect.width * tocRect.height;
    let meaningfulOverlapCount = 0;
    let largestOverlapRatio = 0;
    const debugObstacles: TocDebugObstacle[] = [];

    const obstacles = candidates.flatMap(candidateObstacles);

    for (const obstacle of obstacles) {
      const geometry = tocObstacleGeometry(obstacle);
      const overlap = overlapSize(tocRect, geometry.measuredRect);
      const overlapRatio =
        tocArea > 0 ? (overlap.width * overlap.height) / tocArea : 0;
      const meaningful = overlap.width >= 24 && overlap.height >= 18;

      debugObstacles.push({
        label: debugObstacleLabel(obstacle),
        rawRect: debugRect(geometry.rawRect),
        measuredRect: debugRect(geometry.measuredRect),
        outset: geometry.outset,
        overlapWidth: Math.round(overlap.width * 10) / 10,
        overlapHeight: Math.round(overlap.height * 10) / 10,
        overlapRatio: Math.round(overlapRatio * 1000) / 1000,
        meaningful,
        images: debugObstacleImages(obstacle),
      });

      if (!meaningful) continue;

      meaningfulOverlapCount += 1;
      largestOverlapRatio = Math.max(largestOverlapRatio, overlapRatio);
    }

    const obscured = meaningfulOverlapCount >= 3 || largestOverlapRatio >= 0.4;
    tocObscured.value = obscured;
    publishTocDebugSnapshot({
      sequence: ++tocDebugSequence,
      reason,
      timestamp: new Date().toISOString(),
      geometryReadyBeforeEvaluation,
      tocRect: debugRect(tocRect),
      tocArea: Math.round(tocArea),
      meaningfulOverlapCount,
      largestOverlapRatio: Math.round(largestOverlapRatio * 1000) / 1000,
      obscured,
      decision: obscured
        ? meaningfulOverlapCount >= 3
          ? 'hidden by at least three meaningful overlaps'
          : 'hidden by one obstacle covering at least 40%'
        : 'shown because neither hide threshold was met',
      obstacles: debugObstacles,
    });
  }

  function scheduleTocVisibilityUpdate(
    reason: TocVisibilityReason = 'initial setup',
  ) {
    if (!import.meta.client) return;

    pendingVisibilityReason = reason;
    window.cancelAnimationFrame(visibilityFrameId);
    visibilityFrameId = window.requestAnimationFrame(() => {
      updateTocObscured(pendingVisibilityReason);
    });
  }

  function setupVisibilityTracking() {
    cleanupVisibilityTracking?.();

    if (!import.meta.client) return;

    const contentFlow =
      railElement.value?.closest<HTMLElement>('.content-flow');
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

      for (const obstacle of contentFlow.querySelectorAll<HTMLElement>(
        '[data-toc-obstacle]',
      )) {
        resizeObserver.observe(obstacle);
      }
    }

    if (contentFlow) {
      mutationObserver = new MutationObserver(() => {
        observeGeometry();
        scheduleTocVisibilityUpdate('content mutation');
      });
      mutationObserver.observe(contentFlow, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });

      contentFlow.addEventListener('load', onContentLoad, true);
    }

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(() => {
        tocGeometryReady.value = true;
        scheduleTocVisibilityUpdate('geometry resize');
      });
      observeGeometry();
    } else {
      tocGeometryReady.value = true;
    }

    window.addEventListener('scroll', onVisibilityScroll, {
      passive: true,
    });
    window.addEventListener('resize', onVisibilityResize);
    window.addEventListener('load', onWindowLoad);

    cleanupVisibilityTracking = () => {
      window.cancelAnimationFrame(visibilityFrameId);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
      contentFlow?.removeEventListener('load', onContentLoad, true);
      window.removeEventListener('scroll', onVisibilityScroll);
      window.removeEventListener('resize', onVisibilityResize);
      window.removeEventListener('load', onWindowLoad);
    };

    scheduleTocVisibilityUpdate('initial setup');
  }

  function onContentLoad() {
    scheduleTocVisibilityUpdate('content load');
  }

  function onWindowLoad() {
    scheduleTocVisibilityUpdate('window load');
  }

  function onVisibilityResize() {
    scheduleTocVisibilityUpdate('window resize');
  }

  function onVisibilityScroll() {
    scheduleTocVisibilityUpdate('window scroll');
  }

  onMounted(() => {
    tocDebugEnabled.value =
      new URLSearchParams(window.location.search).get('toc-debug') === '1';
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
    scheduleTocVisibilityUpdate('scan change');
  });

  watch([hasHeadings, desktopCollapsed], () => {
    scheduleTocVisibilityUpdate('heading state');
  });

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

  <Teleport v-if="tocDebugEnabled && tocDebugSnapshot" to="body">
    <div
      v-if="tocDebugSnapshot.tocRect"
      class="toc-debug-box toc-debug-toc"
      :style="{
        left: `${tocDebugSnapshot.tocRect.left}px`,
        top: `${tocDebugSnapshot.tocRect.top}px`,
        width: `${tocDebugSnapshot.tocRect.width}px`,
        height: `${tocDebugSnapshot.tocRect.height}px`,
      }"
    />

    <template
      v-for="(obstacle, index) in tocDebugRelevantObstacles"
      :key="`${tocDebugSnapshot.sequence}-${index}`"
    >
      <div
        class="toc-debug-box toc-debug-obstacle-raw"
        :style="{
          left: `${obstacle.rawRect.left}px`,
          top: `${obstacle.rawRect.top}px`,
          width: `${obstacle.rawRect.width}px`,
          height: `${obstacle.rawRect.height}px`,
        }"
      />
      <div
        class="toc-debug-box toc-debug-obstacle-measured"
        :style="{
          left: `${obstacle.measuredRect.left}px`,
          top: `${obstacle.measuredRect.top}px`,
          width: `${obstacle.measuredRect.width}px`,
          height: `${obstacle.measuredRect.height}px`,
        }"
      />
    </template>

    <section class="toc-debug-panel" aria-label="TOC geometry diagnostics">
      <strong>TOC geometry #{{ tocDebugSnapshot.sequence }}</strong>
      <div>Trigger: {{ tocDebugSnapshot.reason }}</div>
      <div>
        Ready before pass: {{ tocDebugSnapshot.geometryReadyBeforeEvaluation }}
      </div>
      <div>Decision: {{ tocDebugSnapshot.decision }}</div>
      <div>
        Largest:
        {{ Math.round(tocDebugSnapshot.largestOverlapRatio * 1000) / 10 }}% ·
        Meaningful: {{ tocDebugSnapshot.meaningfulOverlapCount }}
      </div>
      <div v-if="tocDebugSnapshot.tocRect">
        TOC: {{ tocDebugSnapshot.tocRect.width }}×{{
          tocDebugSnapshot.tocRect.height
        }}
        at {{ tocDebugSnapshot.tocRect.left }},
        {{ tocDebugSnapshot.tocRect.top }}
      </div>
      <ol v-if="tocDebugRelevantObstacles.length" class="toc-debug-list">
        <li
          v-for="(obstacle, index) in tocDebugRelevantObstacles"
          :key="`${tocDebugSnapshot.sequence}-summary-${index}`"
        >
          {{ obstacle.label }} ·
          {{ Math.round(obstacle.overlapRatio * 1000) / 10 }}% · raw
          {{ obstacle.rawRect.width }}×{{ obstacle.rawRect.height }} · outset
          {{ obstacle.outset }}
          <span
            v-for="(image, imageIndex) in obstacle.images"
            :key="imageIndex"
          >
            · image {{ image.complete ? 'complete' : 'loading' }}
            {{ image.naturalWidth }}×{{ image.naturalHeight }} →
            {{ image.renderedWidth }}×{{ image.renderedHeight }}
          </span>
        </li>
      </ol>
      <div v-else>No obstacle rectangles intersect the expanded TOC.</div>
      <small
        >Blue: expanded TOC · green: painted surface · red: measured
        surface</small
      >
    </section>
  </Teleport>
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

  .is-level-2 {
    --toc-level: 2;
  }
  .is-level-3 {
    --toc-level: 3;
  }
  .is-level-4 {
    --toc-level: 4;
  }
  .is-level-5 {
    --toc-level: 5;
  }
  .is-level-6 {
    --toc-level: 6;
  }

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

  :global(.toc-debug-box) {
    position: fixed;
    z-index: var(--z-highest);
    box-sizing: border-box;
    pointer-events: none;
  }

  :global(.toc-debug-toc) {
    border: 3px solid rgb(0 90 255 / 90%);
    background: rgb(0 90 255 / 10%);
  }

  :global(.toc-debug-obstacle-raw) {
    border: 2px dashed rgb(0 145 70 / 90%);
    background: rgb(0 145 70 / 8%);
  }

  :global(.toc-debug-obstacle-measured) {
    border: 2px solid rgb(230 30 50 / 90%);
    background: rgb(230 30 50 / 8%);
  }

  :global(.toc-debug-panel) {
    position: fixed;
    right: var(--space-3);
    bottom: var(--space-3);
    z-index: var(--z-highest);
    width: min(34rem, calc(100vw - var(--space-6)));
    max-height: 44vh;
    overflow: auto;
    padding: var(--space-3);
    border: 2px solid var(--color-ink);
    background: rgb(255 255 255 / 96%);
    box-shadow: 4px 4px 0 var(--color-ink);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1.4;
    pointer-events: none;
  }

  :global(.toc-debug-list) {
    margin: var(--space-2) 0;
    padding-left: var(--space-4);
  }
</style>
