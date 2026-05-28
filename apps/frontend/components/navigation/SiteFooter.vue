<script setup lang="ts">
  import type { FooterSettings } from '~/types/wordpress';

  defineProps<{
    footer: FooterSettings;
  }>();

  const route = useRoute();
  const config = useRuntimeConfig();
  const { navigateFromFeaturedMediaTarget } = useFeaturedMediaTransition();
  const { prefetchInitialArchivePage } = useWritingArchive();
  const isCaseStudyDetail = computed(() =>
    /^\/case-studies\/[^/]+\/?$/.test(route.path),
  );
  const detailTransitionKey = computed(() => {
    const slugParam = route.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam.join('-') : slugParam;

    return `case-study-${String(slug ?? '')}`.replace(/[^a-zA-Z0-9_-]/g, '-');
  });

  function normalizedInternalTarget(url: string) {
    if (url.startsWith('#')) {
      return `/${url}`;
    }

    if (url.startsWith('/')) {
      return url;
    }

    try {
      const siteUrl = new URL(config.public.siteUrl as string);
      const linkUrl = new URL(url);

      if (linkUrl.origin !== siteUrl.origin) {
        return '';
      }

      return `${linkUrl.pathname}${linkUrl.search}${linkUrl.hash}`;
    } catch {
      return '';
    }
  }

  function isInternalLink(url: string) {
    return Boolean(normalizedInternalTarget(url));
  }

  function isSelectedWorkTarget(url: string) {
    const target = normalizedInternalTarget(url);

    return target === '/#selected-work' || target === '#selected-work';
  }

  function isWritingArchiveTarget(url: string) {
    return normalizedInternalTarget(url) === '/writing';
  }

  function prefetchFooterLink(url: string) {
    if (!isWritingArchiveTarget(url)) {
      return;
    }

    prefetchInitialArchivePage();
  }

  function handleFooterLinkClick(event: MouseEvent, url: string) {
    if (!isCaseStudyDetail.value || !isSelectedWorkTarget(url)) {
      return;
    }

    void navigateFromFeaturedMediaTarget(
      event,
      normalizedInternalTarget(url),
      detailTransitionKey.value,
    );
  }
</script>

<template>
  <footer class="site-footer">
    <div class="dispatch-ticker" aria-hidden="true">
      <div class="ticker-track">
        <span class="ticker-content"
          >DISPATCHES FROM THE DESIGN MACHINE &mdash; DESIGN &times; TECHNOLOGY
          &mdash; FIELD NOTES FROM THE EDGE &mdash;
        </span>
        <span class="ticker-content"
          >DISPATCHES FROM THE DESIGN MACHINE &mdash; DESIGN &times; TECHNOLOGY
          &mdash; FIELD NOTES FROM THE EDGE &mdash;
        </span>
      </div>
    </div>

    <div class="inner">
      <div class="intro">
        <h2 class="heading">{{ footer.heading }}</h2>
      </div>

      <nav class="links" aria-label="Footer">
        <NuxtLink
          v-for="link in footer.links.filter((item) =>
            isInternalLink(item.url),
          )"
          :key="`${link.label}-${link.url}`"
          :to="normalizedInternalTarget(link.url)"
          class="link"
          @focus="prefetchFooterLink(link.url)"
          @pointerdown="prefetchFooterLink(link.url)"
          @pointerenter="prefetchFooterLink(link.url)"
          @click="handleFooterLinkClick($event, link.url)"
        >
          {{ link.label }}
        </NuxtLink>

        <a
          v-for="link in footer.links.filter(
            (item) => !isInternalLink(item.url),
          )"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
          class="link"
        >
          {{ link.label }}
        </a>
      </nav>
    </div>

    <div class="base">
      <p class="copyright">
        © {{ new Date().getFullYear() }} Aslan French. Content licensed
        <a
          href="https://creativecommons.org/licenses/by/4.0/"
          class="source-link"
          target="_blank"
          rel="noopener noreferrer"
          >CC BY 4.0</a
        >.
      </p>
      <a
        href="https://github.com/jcklpe/my-website"
        class="source-link"
        target="_blank"
        rel="noopener noreferrer"
        >View source on GitHub</a
      >
    </div>
  </footer>
</template>

<style lang="scss" scoped>
  .site-footer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75vh;
    padding: 0 0 0;
    background: var(--color-surface);
    color: var(--color-ink);
  }

  @keyframes ticker-scroll {
    from {
      transform: translateX(0);
    }

    to {
      transform: translateX(-50%);
    }
  }

  .dispatch-ticker {
    overflow: hidden;
    white-space: nowrap;
    padding: var(--space-3) 0;
    border-bottom: var(--border-default);
  }

  .ticker-track {
    display: inline-flex;
    animation: ticker-scroll 28s linear infinite;
  }

  .ticker-content {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--color-ink-30);
    padding-right: var(--space-8);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
    padding: 6rem var(--space-6) var(--space-8);
    flex: 1;
  }

  .heading {
    margin: 0;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-size: clamp(3rem, 6vw, 6rem);
    line-height: 0.95;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    padding-top: 0.5rem;
  }

  .link {
    color: var(--color-ink-80);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    transition: color 160ms ease;
  }

  .link:hover {
    color: var(--color-ink);
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-top: var(--border-default);
    color: var(--color-ink-30);
    font-family: var(--font-mono);
    font-size: var(--type-small);
  }

  .copyright {
    margin: 0;
    letter-spacing: 0.06em;
  }

  .source-link {
    color: var(--color-ink-30);
    text-decoration: none;
    letter-spacing: 0.06em;
    transition: color 160ms ease;
  }

  .source-link:hover {
    color: var(--color-ink);
  }

  @media (prefers-reduced-motion: reduce) {
    .ticker-track {
      animation-play-state: paused;
    }
  }

  @include breakpoint(phone) {
    .inner {
      grid-template-columns: 1fr;
      gap: var(--space-6);
      padding: 4rem var(--space-5) var(--space-7);
    }

    .base {
      padding-inline: var(--space-5);
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
  }
</style>
