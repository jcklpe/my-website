<script setup lang="ts">
  const route = useRoute();

  const navItems = [
    { label: 'Writing', to: '/writing' },
    { label: 'Case Studies', to: '/case-studies' },
    { label: 'Side Projects', to: '/side-projects' },
  ];

  const props = withDefaults(
    defineProps<{
      variant?: 'home' | 'interior';
    }>(),
    {
      variant: 'interior',
    },
  );

  const showHomeLink = computed(() => route.path !== '/');
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
        'is-transitioning': isTransitioning,
      },
    ]"
  >
    <div class="brand">
      <NuxtLink v-if="showHomeLink" to="/" class="home-link" aria-label="Home">
        <span class="brand-mark" aria-hidden="true">A.F</span>
        <span class="home-label">← home</span>
      </NuxtLink>
      <div v-else class="brand-mark is-home" aria-hidden="true">A.F</div>
    </div>

    <nav class="items" aria-label="Primary">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="link"
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
    padding: 0 var(--space-6);
    height: 3.25rem;
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
    background: var(--color-ink);
    border-bottom: 1px solid rgba(200, 124, 32, 0.22);
  }

  .interior {
    position: fixed;
    z-index: 1000;
    top: 0;
    right: 0;
    left: 0;
    background: rgba(12, 17, 43, 0.94);
    backdrop-filter: blur(18px) saturate(1.1);
    -webkit-backdrop-filter: blur(18px) saturate(1.1);
    border-bottom: 1px solid rgba(181, 104, 0, 0.2);
  }

  .is-hidden {
    transform: translateY(-105%);
  }

  .is-transitioning {
    transform: translateY(0);
  }

  .brand {
    display: flex;
    align-items: center;
  }

  .brand-mark {
    font-family: var(--font-mono);
    font-size: 0.78rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--color-amber-warm);
  }

  .home-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    color: white;
    text-decoration: none;
  }

  .home-label {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.45);
    text-transform: uppercase;
    transition: color 180ms ease;
  }

  .home-link:hover .home-label {
    color: rgba(255, 255, 255, 0.8);
  }

  .items {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: var(--space-5);
  }

  .link {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.72);
    text-decoration: none;
    padding-bottom: 0.12em;
    border-bottom: 1px solid transparent;
    transition:
      color 160ms ease,
      border-color 160ms ease;
  }

  .link:hover,
  .link:focus-visible {
    color: white;
    border-bottom-color: var(--color-amber-warm);
  }

  .link.router-link-active {
    color: white;
    border-bottom-color: rgba(200, 124, 32, 0.5);
  }

  @media (max-width: 720px) {
    .site-nav {
      padding-inline: var(--space-4);
    }

    .home {
      margin-inline: calc(var(--space-4) * -1);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-nav {
      transition: none;
    }
  }
</style>
