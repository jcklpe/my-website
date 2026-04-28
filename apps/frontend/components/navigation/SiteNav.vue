<script setup lang="ts">
  const route = useRoute();

  const props = withDefaults(
    defineProps<{
      variant?: 'home' | 'interior';
    }>(),
    {
      variant: 'interior',
    },
  );

  const { navigateFromFeaturedMediaTarget } = useFeaturedMediaTransition();
  const navItems = [
    { label: 'Case Studies', to: '/#selected-work' },
    { label: 'Side Projects', to: '/side-projects' },
  ];

  const isWritingDetail = computed(() =>
    /^\/writing\/[^/]+\/?$/.test(route.path),
  );
  const isWritingIndex = computed(() => /^\/writing\/?$/.test(route.path));
  const isCaseStudyDetail = computed(() =>
    /^\/case-studies\/[^/]+\/?$/.test(route.path),
  );
  const isSideProjectsIndex = computed(() =>
    /^\/side-projects\/?$/.test(route.path),
  );
  const isAboutPage = computed(() => /^\/about\/?$/.test(route.path));
  const isLocal = computed(
    () =>
      props.variant === 'interior' &&
      (isWritingDetail.value ||
        isWritingIndex.value ||
        isCaseStudyDetail.value ||
        isSideProjectsIndex.value ||
        isAboutPage.value),
  );
  const visibleNavItems = computed(() => {
    if (isWritingDetail.value) {
      return [{ label: 'Writing', to: '/writing' }];
    }

    if (
      isWritingIndex.value ||
      isCaseStudyDetail.value ||
      isSideProjectsIndex.value ||
      isAboutPage.value
    ) {
      return [];
    }

    if (props.variant !== 'home') {
      return [{ label: 'Writing', to: '/writing' }, ...navItems];
    }

    return navItems;
  });

  const showHomeLink = computed(() => route.path !== '/');
  const homeTarget = computed(() => {
    if (isCaseStudyDetail.value) {
      return '/#selected-work';
    }

    if (isWritingDetail.value) {
      return '/#latest-writing';
    }

    return '/';
  });
  const detailTransitionKey = computed(() => {
    const slugParam = route.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam.join('-') : slugParam;
    const prefix = isWritingDetail.value ? 'post' : 'case-study';

    return `${prefix}-${String(slug ?? '')}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  });
  const isVisible = ref(true);
  const isInterior = computed(() => props.variant === 'interior');
  const transitionState = useFeaturedMediaTransitionState();
  const isTransitioning = computed(() => transitionState.value.active);

  let lastScrollY = 0;
  let ticking = false;

  function updateNavVisibility() {
    const currentScrollY = window.scrollY;
    const scrollDelta = currentScrollY - lastScrollY;

    if (currentScrollY < 24) {
      isVisible.value = true;
    } else if (Math.abs(scrollDelta) > 6) {
      isVisible.value = scrollDelta < 0;
    }

    lastScrollY = currentScrollY;
    ticking = false;
  }

  function handleScroll() {
    if (!isInterior.value || ticking) {
      return;
    }

    ticking = true;
    window.requestAnimationFrame(updateNavVisibility);
  }

  function handleHomeClick(event: MouseEvent) {
    if (!isCaseStudyDetail.value && !isWritingDetail.value) {
      return;
    }

    void navigateFromFeaturedMediaTarget(
      event,
      homeTarget.value,
      detailTransitionKey.value,
    );
  }

  function handleNavItemClick(
    event: MouseEvent,
    item: { label: string; to: string },
  ) {
    if (!isWritingDetail.value || item.to !== '/writing') {
      return;
    }

    void navigateFromFeaturedMediaTarget(
      event,
      item.to,
      detailTransitionKey.value,
    );
  }

  onMounted(() => {
    if (!isInterior.value) {
      return;
    }

    lastScrollY = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
  });
</script>

<template>
  <header
    class="site-nav"
    :class="[
      variant,
      {
        'is-hidden': isInterior && !isVisible && !isTransitioning,
        'is-local': isLocal,
        'is-transitioning': isTransitioning,
      },
    ]"
  >
    <NuxtLink
      v-if="showHomeLink"
      :to="homeTarget"
      class="home-link"
      @click="handleHomeClick"
    >
      Home
    </NuxtLink>
    <div v-else class="home-placeholder" aria-hidden="true" />

    <nav v-if="visibleNavItems.length" class="items" aria-label="Primary">
      <NuxtLink
        v-for="item in visibleNavItems"
        :key="item.to"
        :to="item.to"
        class="link"
        @click="handleNavItemClick($event, item)"
      >
        {{ item.label }}
      </NuxtLink>
    </nav>
  </header>
</template>

<style lang="scss" scoped>
  .site-nav {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-6) var(--space-5);
    color: white;
    transition:
      transform 220ms var(--motion-snappy),
      background 220ms var(--motion-snappy);
  }

  .home {
    position: sticky;
    z-index: 1000;
    top: 0;
    margin-inline: calc(var(--space-6) * -1);
    background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
    background-attachment: fixed;
    background-position: top left;
    background-size: 100vw 100vh;
  }

  .interior {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
  }

  .interior.is-local {
    right: auto;
    left: var(--space-5);
    width: auto;
    padding: 0;
    background: transparent;
  }

  .is-hidden {
    transform: translateY(-105%);
  }

  .is-transitioning {
    transform: translateY(0);
  }

  .home-link,
  .link {
    color: white;
    text-decoration: none;
  }

  .home-link {
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  .home-placeholder {
    min-height: 1.5rem;
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-4);
  }

  .link {
    background-image: linear-gradient(white, white);
    background-repeat: no-repeat;
    background-size: 120% 0.2em;
    background-position: -0.25rem 100%;
    border-bottom: 0;
    padding-inline: 0.2em;
    transition: background-size 220ms var(--motion-snappy);
  }

  .link:hover,
  .link:focus-visible {
    background-size: 120% 88%;
    background-image: linear-gradient(black, black);
  }

  .is-local {
    justify-content: flex-start;
    gap: var(--space-3);
  }

  .is-local .items {
    justify-content: flex-start;
    gap: var(--space-3);
  }

  .is-local .home-link,
  .is-local .link {
    display: inline-block;
    border-bottom: 0.18em solid currentColor;
    padding: 0.2em 0;
    background: var(--color-ink);
    background-image: none;
    box-shadow:
      0.45em 0 0 var(--color-ink),
      -0.45em 0 0 var(--color-ink);
    color: white;
    font-size: var(--type-step--1);
    font-style: italic;
    font-weight: 400;
    letter-spacing: 0.08em;
    line-height: 1.2;
    text-transform: uppercase;
    transition:
      color 180ms var(--motion-snappy),
      transform 180ms var(--motion-snappy);
  }

  .is-local .home-link:hover,
  .is-local .home-link:focus-visible,
  .is-local .link:hover,
  .is-local .link:focus-visible {
    background-image: none;
    color: var(--color-primary);
    transform: translateY(-0.12rem);
  }

  @media (max-width: 720px) {
    .site-nav {
      flex-direction: column;
      align-items: flex-start;
      padding-inline: var(--space-4);
    }

    .home {
      margin-inline: calc(var(--space-4) * -1);
    }

    .interior.is-local {
      left: var(--space-4);
    }

    .site-nav.is-local {
      flex-direction: row;
      align-items: center;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-nav {
      transition: none;
    }
  }
</style>
