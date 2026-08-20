import type { Ref } from 'vue';
import type {
  FeaturedImage,
  GutenbergBlock,
  WordPressCaseStudy,
  WordPressPost,
} from '~/types/wordpress';
import { warmContentBlockModules } from '~/utils/block-components';

type DetailBlocks = GutenbergBlock[];

type DetailCacheEntry<T> = {
  cachedAt: number;
  value: T;
};

type DetailCache<T> = Record<string, DetailCacheEntry<T>>;

const postShellRequests = new Map<string, Promise<WordPressPost | null>>();
const postBlockRequests = new Map<string, Promise<DetailBlocks | null>>();
const caseStudyShellRequests = new Map<
  string,
  Promise<WordPressCaseStudy | null>
>();
const caseStudyBlockRequests = new Map<string, Promise<DetailBlocks | null>>();

type QueuedCaseStudyPrefetch = {
  run: () => Promise<void>;
  slug: string;
};

const warmedMediaUrls = new Set<string>();
const queuedViewportCaseStudySlugs = new Set<string>();
const startedViewportCaseStudySlugs = new Set<string>();
const viewportCaseStudyQueue: QueuedCaseStudyPrefetch[] = [];

let activeViewportCaseStudyPrefetches = 0;
let isViewportCaseStudyQueueScheduled = false;

const serverPostShellCache = new Map<string, DetailCacheEntry<WordPressPost>>();
const serverPostBlockCache = new Map<string, DetailCacheEntry<DetailBlocks>>();
const serverCaseStudyShellCache = new Map<
  string,
  DetailCacheEntry<WordPressCaseStudy>
>();
const serverCaseStudyBlockCache = new Map<
  string,
  DetailCacheEntry<DetailBlocks>
>();

const detailCacheTtlMs = 5 * 60 * 1000;
const detailCacheMaxEntries = 50;
const maxViewportCaseStudyPrefetches = 1;
const viewportPrefetchIdleTimeoutMs = 1_000;
const viewportPrefetchFallbackDelayMs = 140;

function isFreshCacheEntry<T>(
  entry: DetailCacheEntry<T> | undefined,
  now = Date.now(),
) {
  return Boolean(entry && now - entry.cachedAt < detailCacheTtlMs);
}

function mediaUrl(media?: FeaturedImage | null) {
  return media?.sourceUrl?.trim() ?? '';
}

function mediaSrcSet(media?: FeaturedImage | null) {
  return media?.srcSet?.trim() ?? '';
}

function warmFeaturedMedia(media?: FeaturedImage | null) {
  if (!import.meta.client) {
    return;
  }

  const sourceUrl = mediaUrl(media);
  const sourceSet = mediaSrcSet(media);
  const cacheKey = sourceSet || sourceUrl;

  if (!sourceUrl || warmedMediaUrls.has(cacheKey)) {
    return;
  }

  warmedMediaUrls.add(cacheKey);

  const image = new Image();
  image.decoding = 'async';
  if (sourceSet) {
    image.srcset = sourceSet;
    image.sizes = '100vw';
  }
  image.src = sourceUrl;
}

function readStateCache<T>(cache: DetailCache<T>, slug: string) {
  const entry = cache[slug];

  if (!isFreshCacheEntry(entry)) {
    return undefined;
  }

  return entry?.value;
}

function writeStateCache<T>(
  cache: Ref<DetailCache<T>>,
  slug: string,
  value: T,
) {
  cache.value = {
    ...cache.value,
    [slug]: {
      cachedAt: Date.now(),
      value,
    },
  };
}

function readServerCache<T>(
  cache: Map<string, DetailCacheEntry<T>>,
  slug: string,
) {
  const entry = cache.get(slug);

  if (!isFreshCacheEntry(entry)) {
    cache.delete(slug);
    return undefined;
  }

  return entry?.value;
}

function writeServerCache<T>(
  cache: Map<string, DetailCacheEntry<T>>,
  slug: string,
  value: T,
) {
  cache.set(slug, {
    cachedAt: Date.now(),
    value,
  });

  for (const [cacheKey, entry] of cache) {
    if (isFreshCacheEntry(entry) && cache.size <= detailCacheMaxEntries) {
      continue;
    }

    cache.delete(cacheKey);
  }
}

function warmBlocks(blocks: DetailBlocks | null | undefined) {
  warmContentBlockModules(blocks ?? []);
}

function scheduleIdle(callback: () => void) {
  if (!import.meta.client) {
    return;
  }

  const requestIdleCallback = window.requestIdleCallback;

  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(callback, {
      timeout: viewportPrefetchIdleTimeoutMs,
    });
    return;
  }

  globalThis.setTimeout(callback, viewportPrefetchFallbackDelayMs);
}

function processViewportCaseStudyQueue() {
  if (!import.meta.client) {
    return;
  }

  isViewportCaseStudyQueueScheduled = false;

  while (
    activeViewportCaseStudyPrefetches < maxViewportCaseStudyPrefetches &&
    viewportCaseStudyQueue.length
  ) {
    const nextTask = viewportCaseStudyQueue.shift();

    if (!nextTask) {
      return;
    }

    queuedViewportCaseStudySlugs.delete(nextTask.slug);
    activeViewportCaseStudyPrefetches += 1;

    void nextTask
      .run()
      .catch(() => {})
      .finally(() => {
        activeViewportCaseStudyPrefetches -= 1;
        scheduleViewportCaseStudyQueue();
      });
  }
}

function scheduleViewportCaseStudyQueue() {
  if (!import.meta.client || isViewportCaseStudyQueueScheduled) {
    return;
  }

  isViewportCaseStudyQueueScheduled = true;
  scheduleIdle(processViewportCaseStudyQueue);
}

export function useContentDetailPrefetch() {
  const config = useRuntimeConfig();
  const isStaticGenerated = Boolean(config.public.staticGenerated);
  const postShellCache = useState<DetailCache<WordPressPost>>(
    'content-detail-post-shells',
    () => ({}),
  );
  const postBlockCache = useState<DetailCache<DetailBlocks>>(
    'content-detail-post-blocks',
    () => ({}),
  );
  const caseStudyShellCache = useState<DetailCache<WordPressCaseStudy>>(
    'content-detail-case-study-shells',
    () => ({}),
  );
  const caseStudyBlockCache = useState<DetailCache<DetailBlocks>>(
    'content-detail-case-study-blocks',
    () => ({}),
  );

  function storePostShell(slug: string, post: WordPressPost | null) {
    if (!post) {
      return;
    }

    writeStateCache(postShellCache, slug, post);

    if (import.meta.server) {
      writeServerCache(serverPostShellCache, slug, post);
    }
  }

  function storePostBlocks(slug: string, blocks: DetailBlocks | null) {
    if (!blocks) {
      return;
    }

    writeStateCache(postBlockCache, slug, blocks);

    if (import.meta.server) {
      writeServerCache(serverPostBlockCache, slug, blocks);
    }
  }

  function storeCaseStudyShell(
    slug: string,
    caseStudy: WordPressCaseStudy | null,
  ) {
    if (!caseStudy) {
      return;
    }

    writeStateCache(caseStudyShellCache, slug, caseStudy);

    if (import.meta.server) {
      writeServerCache(serverCaseStudyShellCache, slug, caseStudy);
    }
  }

  function storeCaseStudyBlocks(slug: string, blocks: DetailBlocks | null) {
    if (!blocks) {
      return;
    }

    writeStateCache(caseStudyBlockCache, slug, blocks);

    if (import.meta.server) {
      writeServerCache(serverCaseStudyBlockCache, slug, blocks);
    }
  }

  async function fetchPostShell(slug: string) {
    const post = await queryWordPressPostShellBySlug(slug);
    storePostShell(slug, post);

    return post;
  }

  async function fetchPostBlocks(slug: string) {
    const blocks = await queryWordPressPostBlocksBySlug(slug);
    storePostBlocks(slug, blocks);
    warmBlocks(blocks);

    return blocks;
  }

  async function fetchCaseStudyShell(slug: string) {
    const caseStudy = await queryWordPressCaseStudyShellBySlug(slug);
    storeCaseStudyShell(slug, caseStudy);

    return caseStudy;
  }

  async function fetchCaseStudyBlocks(slug: string) {
    const blocks = await queryWordPressCaseStudyBlocksBySlug(slug);
    storeCaseStudyBlocks(slug, blocks);
    warmBlocks(blocks);

    return blocks;
  }

  function readPostShell(slug: string) {
    const cachedPost = readStateCache(postShellCache.value, slug);

    if (cachedPost) {
      return cachedPost;
    }

    if (import.meta.server) {
      const serverPost = readServerCache(serverPostShellCache, slug);

      if (serverPost) {
        writeStateCache(postShellCache, slug, serverPost);
      }

      return serverPost;
    }

    return undefined;
  }

  function readPostBlocks(slug: string) {
    const cachedBlocks = readStateCache(postBlockCache.value, slug);

    if (cachedBlocks !== undefined) {
      return cachedBlocks;
    }

    if (import.meta.server) {
      const serverBlocks = readServerCache(serverPostBlockCache, slug);

      if (serverBlocks !== undefined) {
        writeStateCache(postBlockCache, slug, serverBlocks);
      }

      return serverBlocks;
    }

    return undefined;
  }

  function readCaseStudyShell(slug: string) {
    const cachedCaseStudy = readStateCache(caseStudyShellCache.value, slug);

    if (cachedCaseStudy) {
      return cachedCaseStudy;
    }

    if (import.meta.server) {
      const serverCaseStudy = readServerCache(serverCaseStudyShellCache, slug);

      if (serverCaseStudy) {
        writeStateCache(caseStudyShellCache, slug, serverCaseStudy);
      }

      return serverCaseStudy;
    }

    return undefined;
  }

  function readCaseStudyBlocks(slug: string) {
    const cachedBlocks = readStateCache(caseStudyBlockCache.value, slug);

    if (cachedBlocks !== undefined) {
      return cachedBlocks;
    }

    if (import.meta.server) {
      const serverBlocks = readServerCache(serverCaseStudyBlockCache, slug);

      if (serverBlocks !== undefined) {
        writeStateCache(caseStudyBlockCache, slug, serverBlocks);
      }

      return serverBlocks;
    }

    return undefined;
  }

  async function getPostShell(slug: string) {
    const cachedPost = readPostShell(slug);

    if (cachedPost) {
      return cachedPost;
    }

    if (!import.meta.client) {
      return fetchPostShell(slug);
    }

    const existingRequest = postShellRequests.get(slug);

    if (existingRequest) {
      return existingRequest;
    }

    const request = fetchPostShell(slug).finally(() => {
      postShellRequests.delete(slug);
    });

    postShellRequests.set(slug, request);

    return request;
  }

  async function getPostBlocks(slug: string) {
    const cachedBlocks = readPostBlocks(slug);

    if (cachedBlocks !== undefined) {
      warmBlocks(cachedBlocks);
      return cachedBlocks;
    }

    if (!import.meta.client) {
      return fetchPostBlocks(slug);
    }

    const existingRequest = postBlockRequests.get(slug);

    if (existingRequest) {
      return existingRequest;
    }

    const request = fetchPostBlocks(slug).finally(() => {
      postBlockRequests.delete(slug);
    });

    postBlockRequests.set(slug, request);

    return request;
  }

  async function getCaseStudyShell(slug: string) {
    const cachedCaseStudy = readCaseStudyShell(slug);

    if (cachedCaseStudy) {
      return cachedCaseStudy;
    }

    if (!import.meta.client) {
      return fetchCaseStudyShell(slug);
    }

    const existingRequest = caseStudyShellRequests.get(slug);

    if (existingRequest) {
      return existingRequest;
    }

    const request = fetchCaseStudyShell(slug).finally(() => {
      caseStudyShellRequests.delete(slug);
    });

    caseStudyShellRequests.set(slug, request);

    return request;
  }

  async function getCaseStudyBlocks(slug: string) {
    const cachedBlocks = readCaseStudyBlocks(slug);

    if (cachedBlocks !== undefined) {
      warmBlocks(cachedBlocks);
      return cachedBlocks;
    }

    if (!import.meta.client) {
      return fetchCaseStudyBlocks(slug);
    }

    const existingRequest = caseStudyBlockRequests.get(slug);

    if (existingRequest) {
      return existingRequest;
    }

    const request = fetchCaseStudyBlocks(slug).finally(() => {
      caseStudyBlockRequests.delete(slug);
    });

    caseStudyBlockRequests.set(slug, request);

    return request;
  }

  async function getPost(slug: string) {
    const post = await getPostShell(slug);

    if (!post) {
      return null;
    }

    const blocks = await getPostBlocks(slug);

    return {
      ...post,
      blocks: blocks ?? [],
    };
  }

  async function getCaseStudy(slug: string) {
    const caseStudy = await getCaseStudyShell(slug);

    if (!caseStudy) {
      return null;
    }

    const blocks = await getCaseStudyBlocks(slug);

    return {
      ...caseStudy,
      blocks: blocks ?? [],
    };
  }

  function hasFreshPostShell(slug: string) {
    return Boolean(readPostShell(slug));
  }

  function hasFreshPostBlocks(slug: string) {
    return readPostBlocks(slug) !== undefined;
  }

  function hasFreshCaseStudyShell(slug: string) {
    return Boolean(readCaseStudyShell(slug));
  }

  function hasFreshCaseStudyBlocks(slug: string) {
    return readCaseStudyBlocks(slug) !== undefined;
  }

  function prefetchPost(slug: string, media?: FeaturedImage | null) {
    warmFeaturedMedia(media);

    if (!slug || !import.meta.client || isStaticGenerated) {
      return;
    }

    if (!hasFreshPostShell(slug)) {
      void getPostShell(slug).catch(() => {});
    }

    if (!hasFreshPostBlocks(slug)) {
      void getPostBlocks(slug).catch(() => {});
    }
  }

  function prefetchCaseStudy(slug: string, media?: FeaturedImage | null) {
    warmFeaturedMedia(media);

    if (!slug || !import.meta.client || isStaticGenerated) {
      return;
    }

    if (!hasFreshCaseStudyShell(slug)) {
      void getCaseStudyShell(slug).catch(() => {});
    }

    if (!hasFreshCaseStudyBlocks(slug)) {
      void getCaseStudyBlocks(slug).catch(() => {});
    }
  }

  function prefetchCaseStudyFromViewport(
    slug: string,
    media?: FeaturedImage | null,
  ) {
    warmFeaturedMedia(media);

    if (
      !slug ||
      !import.meta.client ||
      isStaticGenerated ||
      startedViewportCaseStudySlugs.has(slug) ||
      queuedViewportCaseStudySlugs.has(slug) ||
      (hasFreshCaseStudyShell(slug) && hasFreshCaseStudyBlocks(slug))
    ) {
      return;
    }

    queuedViewportCaseStudySlugs.add(slug);
    viewportCaseStudyQueue.push({
      slug,
      run: async () => {
        startedViewportCaseStudySlugs.add(slug);

        await Promise.all([
          hasFreshCaseStudyShell(slug)
            ? Promise.resolve(null)
            : getCaseStudyShell(slug),
          hasFreshCaseStudyBlocks(slug)
            ? Promise.resolve(null)
            : getCaseStudyBlocks(slug),
        ]);
      },
    });

    scheduleViewportCaseStudyQueue();
  }

  return {
    getCaseStudy,
    getCaseStudyBlocks,
    getCaseStudyShell,
    getPost,
    getPostBlocks,
    getPostShell,
    prefetchCaseStudy,
    prefetchCaseStudyFromViewport,
    prefetchPost,
  };
}
