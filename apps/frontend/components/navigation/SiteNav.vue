<script setup lang="ts">
const route = useRoute()

const navItems = [
  { label: 'Writing', to: '/writing' },
  { label: 'Case Studies', to: '/case-studies' },
  { label: 'Side Projects', to: '/side-projects' },
]

const props = withDefaults(defineProps<{
  variant?: 'home' | 'interior'
}>(), {
  variant: 'interior',
})

const showHomeLink = computed(() => route.path !== '/')
const isVisible = ref(true)
const isInterior = computed(() => props.variant === 'interior')

let lastScrollY = 0
let ticking = false

function updateNavVisibility() {
  const currentScrollY = window.scrollY
  const scrollDelta = currentScrollY - lastScrollY

  if (currentScrollY < 24) {
    isVisible.value = true
  } else if (Math.abs(scrollDelta) > 6) {
    isVisible.value = scrollDelta < 0
  }

  lastScrollY = currentScrollY
  ticking = false
}

function handleScroll() {
  if (!isInterior.value || ticking) {
    return
  }

  ticking = true
  window.requestAnimationFrame(updateNavVisibility)
}

onMounted(() => {
  if (!isInterior.value) {
    return
  }

  lastScrollY = window.scrollY
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <header
    class="site-nav"
    :class="[
      `site-nav--${variant}`,
      { 'site-nav--hidden': isInterior && !isVisible },
    ]"
  >
    <NuxtLink v-if="showHomeLink" to="/" class="site-nav__home">Home</NuxtLink>
    <div v-else class="site-nav__home-placeholder" aria-hidden="true" />

    <nav class="site-nav__items" aria-label="Primary">
      <NuxtLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="site-nav__link"
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
  gap: $space-4;
  padding: $space-4 $space-6 $space-5;
  color: white;
  transition: transform 220ms $motion-snappy;
}

.site-nav--home {
  position: sticky;
  z-index: 10;
  top: 0;
  margin-inline: calc($space-6 * -1);
  background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
  background-attachment: fixed;
  background-position: top left;
  background-size: 100vw 100vh;
}

.site-nav--interior {
  position: fixed;
  z-index: 10;
  top: 0;
  right: 0;
  left: 0;
  background: linear-gradient(145deg, #1f38c5 0%, #2657eb 58%, #4d72ef 100%);
}

.site-nav--hidden {
  transform: translateY(-105%);
}

.site-nav__home,
.site-nav__link {
  color: white;
  text-decoration: none;
}

.site-nav__home {
  font-weight: 600;
  letter-spacing: 0.02em;
}

.site-nav__home-placeholder {
  min-height: 1.5rem;
}

.site-nav__items {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: $space-4;
}

.site-nav__link {
  background-image: linear-gradient(black, black);
  background-repeat: no-repeat;
  background-size: 120% 0.2em;
  background-position: -0.25rem 100%;
  border-bottom: 0;
  padding-inline: 0.2em;
  transition: background-size 220ms $motion-snappy;
}

.site-nav__link:hover,
.site-nav__link:focus-visible {
  background-size: 120% 88%;
}

@media (max-width: 720px) {
  .site-nav {
    flex-direction: column;
    align-items: flex-start;
    padding-inline: $space-4;
  }

  .site-nav--home {
    margin-inline: calc($space-4 * -1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-nav {
    transition: none;
  }
}
</style>
