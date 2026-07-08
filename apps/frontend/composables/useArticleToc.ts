export interface ArticleTocHeading {
  id: string;
  text: string;
  level: 2 | 3 | 4 | 5 | 6;
}

interface ArticleTocOptions {
  root: Ref<HTMLElement | null>;
  scanKey?: Ref<unknown>;
  minHeadings?: number;
}

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'section';
}

function uniqueHeadingId(baseId: string, usedIds: Set<string>): string {
  let candidate = baseId;
  let index = 2;

  while (usedIds.has(candidate) || document.getElementById(candidate)) {
    candidate = `${baseId}-${index}`;
    index += 1;
  }

  usedIds.add(candidate);
  return candidate;
}

export function useArticleToc(options: ArticleTocOptions) {
  const headings = ref<ArticleTocHeading[]>([]);
  const activeId = ref<string | null>(null);
  const prefersReducedMotion = ref(false);

  let cleanupScroll: (() => void) | null = null;
  let cleanupMutationObserver: (() => void) | null = null;
  let scanFrameId = 0;

  function articleHeadings(): HTMLHeadingElement[] {
    const root = options.root.value;
    if (!root) return [];

    return Array.from(
      root.querySelectorAll<HTMLHeadingElement>('h2, h3, h4, h5, h6'),
    ).filter((heading) => {
      if (!heading.textContent?.trim()) return false;
      if (heading.closest('nav')) return false;
      return true;
    });
  }

  function updateActiveHeading() {
    const headingElements = articleHeadings();
    if (headingElements.length === 0) {
      activeId.value = null;
      return;
    }

    const activationLine = window.innerHeight * 0.28;
    let current = headingElements[0] ?? null;

    for (const heading of headingElements) {
      const rect = heading.getBoundingClientRect();

      if (rect.top <= activationLine) {
        current = heading;
      } else {
        break;
      }
    }

    activeId.value = current?.id ?? null;
  }

  function scanHeadings() {
    if (!import.meta.client) return;

    const usedIds = new Set<string>();
    const headingElements = articleHeadings();
    const nextHeadings = headingElements.map((heading) => {
      const text = heading.textContent?.replace(/\s+/g, ' ').trim() ?? '';
      const existingId = heading.id;
      const id = existingId || uniqueHeadingId(slugifyHeading(text), usedIds);

      if (!existingId) {
        heading.id = id;
      } else {
        usedIds.add(existingId);
      }

      return {
        id,
        text,
        level: Number(heading.tagName.slice(1)) as ArticleTocHeading['level'],
      };
    });

    headings.value =
      nextHeadings.length >= (options.minHeadings ?? 3) ? nextHeadings : [];

    if (headings.value.length === 0) {
      activeId.value = null;
      return;
    }

    updateActiveHeading();
  }

  function scheduleHeadingScan() {
    if (!import.meta.client) return;

    window.cancelAnimationFrame(scanFrameId);

    void nextTick(() => {
      scanFrameId = window.requestAnimationFrame(scanHeadings);
    });
  }

  function scrollToHeading(id: string) {
    if (!import.meta.client) return;

    const target = document.getElementById(id);
    if (!target) return;

    target.scrollIntoView({
      behavior: prefersReducedMotion.value ? 'auto' : 'smooth',
      block: 'start',
    });

    history.pushState(null, '', `#${id}`);
    activeId.value = id;
  }

  function setupScrollTracking() {
    cleanupScroll?.();

    if (!import.meta.client) return;

    let frameId = 0;
    const onScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    cleanupScroll = () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }

  function setupMutationObserver() {
    cleanupMutationObserver?.();

    if (!import.meta.client || !options.root.value) return;

    const observer = new MutationObserver(scheduleHeadingScan);
    observer.observe(options.root.value, {
      childList: true,
      subtree: true,
    });

    cleanupMutationObserver = () => {
      observer.disconnect();
    };
  }

  onMounted(() => {
    prefersReducedMotion.value = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    scheduleHeadingScan();
    setupScrollTracking();
    setupMutationObserver();
  });

  watch(
    () => options.scanKey?.value,
    scheduleHeadingScan,
    { flush: 'post', immediate: true },
  );

  watch(
    () => options.root.value,
    () => {
      setupMutationObserver();
      scheduleHeadingScan();
    },
    { flush: 'post' },
  );

  onBeforeUnmount(() => {
    if (import.meta.client) {
      window.cancelAnimationFrame(scanFrameId);
    }
    cleanupMutationObserver?.();
    cleanupMutationObserver = null;
    cleanupScroll?.();
    cleanupScroll = null;
  });

  return {
    headings,
    activeId,
    scanHeadings,
    scrollToHeading,
  };
}
