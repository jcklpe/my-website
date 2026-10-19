import { prepareRouteCrtText } from '~/utils/route-crt-text';
import { prepareLifeFieldHandoff } from '~/utils/life-field';
import { prepareRouteImageDissolve } from '~/utils/route-image-dissolve';
import type { WordPressPage } from '~/types/wordpress';

function fallbackMotionDuration() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 120;
  }

  return featuredMediaTransitionDuration();
}

function scrollToHash(hash: string) {
  if (!hash) {
    return;
  }

  let id = hash.replace(/^#/, '');

  try {
    id = decodeURIComponent(id);
  } catch {
    id = hash.replace(/^#/, '');
  }

  const target = document.getElementById(id);
  target?.scrollIntoView({
    block: 'start',
    inline: 'nearest',
  });
}

async function scrollToHistorySource(source: HTMLElement) {
  source.scrollIntoView({ block: 'center', behavior: 'smooth' });
  // Let native scrolling settle before preflight locks scrolling and measures the flying card.
  const started = performance.now();
  let previousY = window.scrollY;
  let stableFrames = 0;
  await new Promise<void>((resolve) => {
    function sample() {
      const now = performance.now();
      const y = window.scrollY;
      stableFrames = Math.abs(y - previousY) < 0.5 ? stableFrames + 1 : 0;
      previousY = y;
      if ((now - started > 120 && stableFrames >= 4) || now - started > 2000) {
        resolve();
        return;
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
}

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  let textPreparationQueued = false;
  let contentPreparation: Promise<void> | null = null;
  const preparedImages: HTMLImageElement[] = [];
  const prepareContent = () => {
    if (contentPreparation) return;
    contentPreparation = (async () => {
      // Static sites use their generated payload; local SSR uses the same normalized page query as the destination. Nuxt's navigation cache reuses either result.
      let page: WordPressPage | null | undefined;
      if (nuxtApp.$config.public.staticGenerated) {
        const payload = await loadPayload('/side-projects');
        page = payload?.data?.['side-projects-page'];
      } else {
        page = await nuxtApp.runWithContext(() =>
          queryWordPressPageByUri('/side-projects'),
        );
      }
      if (!page) return;
      nuxtApp.static.data['side-projects-page'] = page;
      const parser = new DOMParser();
      for (const block of page.blocks) {
        if (preparedImages.length >= 2) break;
        if (block.name !== 'core/image' || !block.renderedHtml) continue;
        const image = parser
          .parseFromString(block.renderedHtml, 'text/html')
          .querySelector('img');
        if (!image) continue;
        const preview = new Image();
        preview.sizes = image.sizes || '(max-width: 767px) 100vw, 50vw';
        preview.srcset = image.srcset;
        preview.src = image.src;
        preparedImages.push(preview);
        void preview.decode().catch(() => undefined);
      }
    })().catch(() => {
      // A failed speculative request must not change navigation's ordinary fetch/error handling. Allow a later idle attempt to retry.
      contentPreparation = null;
    });
  };
  const prepareText = () => {
    if (router.currentRoute.value.path !== '/' || textPreparationQueued) return;
    textPreparationQueued = true;
    const prepare = () => {
      textPreparationQueued = false;
      if (
        router.currentRoute.value.path === '/' &&
        !routeMotionState.value.active
      ) {
        prepareRouteCrtText();
        void prepareRouteImageDissolve();
        void preloadRouteComponents('/side-projects');
        prepareContent();
      }
    };
    if (typeof requestIdleCallback === 'function')
      requestIdleCallback(prepare, { timeout: 1500 });
    else window.setTimeout(prepare, 300);
  };
  nuxtApp.hooks.hook('app:mounted', prepareText);
  const routeMotion = useRouteChoreography();
  const routeMotionState = useRouteChoreographyState();
  watch(
    () => routeMotionState.value.active,
    (active) => {
      if (!active) prepareText();
    },
  );
  window.addEventListener('resize', prepareText);
  routeMotion.reset();
  const featuredMediaTransition = useFeaturedMediaTransitionState();
  const fallbackPageTransition = useFallbackPageTransitionState();
  let pendingForwardKey: string | null = null;
  let navigationAttempt = 0;
  const {
    shouldAttemptReverseFeaturedMediaTransition,
    canStartFeaturedMediaTransitionFromRole,
    beginFeaturedMediaNavigation,
    finishFeaturedMediaNavigation,
  } = useFeaturedMediaTransition();

  router.beforeEach(async (to, from) => {
    const attempt = ++navigationAttempt;
    if (from.path === to.path) {
      return;
    }

    if (
      featuredMediaTransition.value.active ||
      sessionStorage.getItem('featured-media-transition-active') === 'true'
    ) {
      return;
    }

    const transitionKey = featuredMediaTransitionKeyFromNavigation(
      from.path,
      to.path,
    );

    if (
      transitionKey &&
      shouldAttemptReverseFeaturedMediaTransition(to.fullPath, transitionKey)
    ) {
      return;
    }

    // A history entry has no card click to initiate the forward flight. Use the same source preparation and destination handoff as a real card click.
    const forwardKey = featuredMediaTransitionKeyFromNavigation(
      to.path,
      from.path,
    );
    if (
      forwardKey &&
      canStartFeaturedMediaTransitionFromRole(forwardKey, 'source')
    ) {
      const source = document.querySelector<HTMLElement>(
        `[data-featured-media-source="${forwardKey}"]`,
      );
      const rect = source?.getBoundingClientRect();
      if (source && rect && (rect.bottom <= 0 || rect.top >= innerHeight)) {
        await scrollToHistorySource(source);
        if (attempt !== navigationAttempt) return;
      }
      if (await beginFeaturedMediaNavigation(to.fullPath, forwardKey)) {
        fallbackPageTransition.value = 'idle';
        pendingForwardKey = forwardKey;
        return;
      }
    }

    if (
      hasRouteChoreography(from.path, to.path) &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      fallbackPageTransition.value = 'idle';
      await routeMotion.leave(from.path, to.path);
      return;
    }
    routeMotion.reset();
    // Reduced motion skips the traveling screen, but keeps the same static Conway board across these routes.
    if (
      (from.path === '/' && to.path === '/side-projects') ||
      (from.path === '/side-projects' && to.path === '/')
    ) {
      prepareLifeFieldHandoff(
        document.querySelector<HTMLCanvasElement>(
          from.path === '/'
            ? '.home-page #side-projects canvas'
            : '.side-projects-page .ambient canvas',
        ),
      );
    }
    fallbackPageTransition.value = 'leaving';
  });

  router.afterEach((_to, _from, failure) => {
    if (!failure) prepareText();
    if (failure) {
      pendingForwardKey = null;
      fallbackPageTransition.value = 'idle';
      routeMotion.reset();
    }
  });

  nuxtApp.hooks.hook('page:finish', () => {
    if (pendingForwardKey) {
      const key = pendingForwardKey;
      pendingForwardKey = null;
      void finishFeaturedMediaNavigation(key);
      return;
    }
    if (
      routeMotionState.value.active &&
      routeMotionState.value.hideDestination
    ) {
      const route = router.currentRoute.value;
      void routeMotion
        .enter(route.path, route.hash)
        .catch(() => routeMotion.reset());
      return;
    }
    if (fallbackPageTransition.value !== 'leaving') {
      return;
    }

    fallbackPageTransition.value = 'entering';

    requestAnimationFrame(() => {
      // Vue Router stores the destination history entry's saved position here. Its early scroll can be clamped by the outgoing document, so restore again after the new page mounts; a fresh push has no saved position.
      const saved = window.history.state?.scroll;
      if (saved && Number.isFinite(saved.top) && Number.isFinite(saved.left)) {
        window.scrollTo({
          left: saved.left,
          top: saved.top,
          behavior: 'instant',
        });
      } else {
        scrollToHash(router.currentRoute.value.hash);
      }

      requestAnimationFrame(() => {
        fallbackPageTransition.value = 'entering-active';

        window.setTimeout(() => {
          if (fallbackPageTransition.value === 'entering-active') {
            fallbackPageTransition.value = 'idle';
          }
        }, fallbackMotionDuration());
      });
    });
  });
});
