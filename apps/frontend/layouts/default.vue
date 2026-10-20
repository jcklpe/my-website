<script setup lang="ts">
  import { animateLifeCrtTint, crtTintFloor } from '~/utils/life-crt';

  const phosphorTint = ref<HTMLElement | null>(null);
  watch(
    phosphorTint,
    (element, _previous, onCleanup) => {
      if (element) onCleanup(animateLifeCrtTint(element));
    },
    { flush: 'post' },
  );
  const route = useRoute();
  const router = useRouter();
  const showConstructionBanner = ref(false);
  let hasNavigated = false;

  // Decide on the client: URL fragments are not available to SSR/static generation.
  onMounted(() => {
    showConstructionBanner.value =
      !hasNavigated && route.path === '/' && !route.hash;
  });

  const removeNavigationHook = router.afterEach((to, from, failure) => {
    if (failure || to.fullPath === from.fullPath) return;
    hasNavigated = true;
    showConstructionBanner.value = false;
  });
  onBeforeUnmount(removeNavigationHook);
  const routeMotion = useRouteChoreographyState();
  const fallbackPageTransition = useFallbackPageTransitionState();

  const isHomePage = computed(() => route.path === '/');
  // Pages can opt out of the interior site nav via definePageMeta({ hideSiteNav: true }).
  const showSiteNav = computed(
    () => !isHomePage.value && route.meta.hideSiteNav !== true,
  );
  const fallbackTransitionClass = computed(() =>
    fallbackPageTransition.value === 'idle'
      ? ''
      : `is-fallback-${fallbackPageTransition.value}`,
  );

  const transitionState = useFeaturedMediaTransitionState();
  // Hide ONLY the freshly-navigated destination page, and only while it's not
  // yet positioned (scrolled to the card + surroundings placed). The composable
  // owns that window via `hideDestination` — a visibility flag kept separate
  // from the clone's geometry phase, so the outgoing source page (mid exit
  // animation) is never hidden, and the destination is hidden in BOTH
  // directions until it's ready to reveal in place.
  const isFeatureMediaIncoming = computed(
    () => transitionState.value.active && transitionState.value.hideDestination,
  );

  const { data: footerSettings } = await useAsyncData('footer-settings', () =>
    queryFooterSettings(),
  );
</script>

<template>
  <div
    class="site-shell has-custom-cursors"
    :class="{
      'is-route-incoming': routeMotion.hideDestination,
      'is-side-projects': route.path === '/side-projects',
    }"
  >
    <a class="skip-link" href="#main-content">Skip to main content</a>
    <SiteNav v-if="showSiteNav" variant="interior" />

    <main
      id="main-content"
      class="site-main"
      tabindex="-1"
      :class="[
        fallbackTransitionClass,
        {
          'has-fixed-nav': showSiteNav,
          'is-home-page': isHomePage,
          'is-featured-media-incoming': isFeatureMediaIncoming,
        },
      ]"
    >
      <slot />
    </main>

    <SiteFooter v-if="footerSettings" class="footer" :footer="footerSettings" />

    <ConstructionBanner v-if="isHomePage && showConstructionBanner" />
    <FeaturedMediaTransitionLayer />
    <div
      v-if="route.path === '/side-projects'"
      ref="phosphorTint"
      class="phosphor-tint"
      :style="{ opacity: crtTintFloor }"
      aria-hidden="true"
    />
  </div>
</template>

<style lang="scss" scoped>
  // Match the shader's green phosphor. This layer remains above text/images after the temporary CRT surfaces leave.
  .phosphor-tint {
    position: fixed;
    inset: 0;
    z-index: var(--z-highest);
    background: rgb(31, 173, 82);
    pointer-events: none;
  }

  .site-shell.is-route-incoming {
    visibility: hidden;
  }

  .site-shell {
    min-height: 100vh;
    color: var(--color-ink);
  }

  // Side Projects inherits the Home terminal container's ground, with readable editorial colors for longer content and the surrounding navigation/footer.
  .site-shell.is-side-projects {
    --color-surface: #0c112b;
    --color-surface-warm: #101726;
    --color-surface-warmer: #142031;
    --color-surface-soft: #1a2937;
    --color-ink: #f7f5ef;
    --color-ink-90: rgba(247, 245, 239, 0.9);
    --color-ink-80: rgba(247, 245, 239, 0.8);
    --color-ink-60: rgba(247, 245, 239, 0.6);
    --color-ink-30: rgba(247, 245, 239, 0.3);
    --color-ink-20: rgba(247, 245, 239, 0.2);
    --color-ink-10: rgba(247, 245, 239, 0.1);
    --color-muted: #b4c4ba;
    --color-primary: #8add9c;
    --color-primary-heavy: #b8edc4;
    --color-primary-soft: #22472e;
    --type-body-color: var(--color-ink-90);
    --type-heading-color: var(--color-ink);
    --border-window: 2px solid var(--color-ink-30);
    --border-strong: 2px solid var(--color-ink-30);
    background: var(--texture-terminal-scanline);

    &:has(.ambient [data-life-renderer='webgl']) {
      background: linear-gradient(180deg, #0c112b 0%, #00030f 100%);
      // Match the full-screen traveling plane instead of stretching the gradient down the entire article.
      background-attachment: fixed;
    }

    :deep(:focus-visible) {
      outline-color: var(--color-primary);
    }
  }

  :global(body:has(.site-shell.is-side-projects)) {
    background: #00030f;
  }

  .skip-link {
    position: fixed;
    top: var(--space-3);
    left: var(--space-3);
    z-index: var(--z-highest);
    padding: var(--space-2) var(--space-3);
    border: 2px solid var(--color-ink);
    background: var(--color-surface);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-weight: 700;
    text-decoration: none;
    transform: translateY(calc(-100% - var(--space-4)));
  }

  .skip-link:focus-visible {
    transform: translateY(0);
  }

  @media (pointer: fine) {
    .has-custom-cursors {
      cursor:
        url('/images/cursors/arrow.png') 6 2,
        auto;
      :deep(p),
      :deep(h1),
      :deep(h2),
      :deep(h3),
      :deep(h4),
      :deep(h5),
      :deep(h6),
      :deep(li),
      :deep(blockquote),
      :deep(pre),
      :deep(code),
      :deep(input),
      :deep(textarea) {
        cursor:
          url('/images/cursors/text.png') 16 16,
          text;
      }
      // Interactive descendants override reading-text cursors, including card excerpts, dates and headings.
      :deep(a),
      :deep(a *),
      :deep(.card-image-area),
      :deep(button),
      :deep(button *),
      :deep(summary),
      :deep(summary *),
      :deep(input[type='checkbox']) {
        cursor:
          url('/images/cursors/pointer.png') 12 2,
          pointer;
      }
      // Lightbox semantics take precedence over the generic link/button hand.
      :deep(.image-lightbox-trigger),
      :deep(.has-lightbox),
      :deep(.has-lightbox img),
      :deep(.mega-gallery-trigger),
      :deep(.in-note-content img),
      :deep(.sidenote-text img) {
        cursor:
          url('/images/cursors/zoom.png') 12 10,
          zoom-in;
      }
    }
  }

  .site-main {
    padding: 0 0 var(--space-7);
  }

  .site-main.is-home-page {
    // Scope the home page's fixed reaction-diffusion canvas (z-index: -1) to
    // this subtree. This isolation MUST stay home-only: applying it to interior
    // routes traps their z-index 2/3 destination grounds below the teleported
    // media clone at z-index 1, defeating the explicit A/B overlap handoff and
    // exposing the hero image when the text clone leaves.
    isolation: isolate;
  }

  .site-main.is-fallback-leaving,
  .site-main.is-fallback-entering,
  .site-main.is-fallback-entering-active {
    transition:
      opacity var(--featured-media-flight-duration) var(--snappy-ease-out),
      transform var(--featured-media-flight-duration) var(--snappy-ease-out);
    will-change: opacity, transform;
  }

  .site-main.is-fallback-leaving,
  .site-main.is-fallback-entering {
    pointer-events: none;
  }

  .site-main.is-fallback-entering {
    opacity: 0;
    transform: translateY(0.85rem);
    transition-duration: 0ms;
  }

  .site-main.is-fallback-leaving {
    opacity: 0;
    transform: translateY(-0.65rem);
    /* Snap to hidden instantly so Nuxt's scroll-to-top can't briefly reveal
       the old page (e.g. the BLUF hero) mid-transition. The arrival fade-in
       is what the user watches; the departure doesn't need to animate. */
    transition-duration: 0ms;
  }

  .site-main.is-featured-media-incoming {
    opacity: 0;
    pointer-events: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .site-main.is-fallback-leaving,
    .site-main.is-fallback-entering,
    .site-main.is-fallback-entering-active {
      transition: opacity 120ms ease;
    }

    .site-main.is-fallback-leaving,
    .site-main.is-fallback-entering {
      opacity: 0;
      transform: none;
    }
  }
</style>
