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
    <div class="inner">
      <div class="intro">
        <svg
          class="footer-mark"
          viewBox="0 0 64 64"
          role="img"
          aria-label="Desert sun mark"
        >
          <circle cx="32" cy="32" r="11" class="mark-sun" />
          <g class="mark-rays">
            <line x1="32" y1="6" x2="32" y2="15" />
            <line x1="32" y1="49" x2="32" y2="58" />
            <line x1="6" y1="32" x2="15" y2="32" />
            <line x1="49" y1="32" x2="58" y2="32" />
            <line x1="14" y1="14" x2="20" y2="20" />
            <line x1="44" y1="44" x2="50" y2="50" />
            <line x1="50" y1="14" x2="44" y2="20" />
            <line x1="20" y1="44" x2="14" y2="50" />
          </g>
        </svg>
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
  // Warm colophon footer — sandy ground, terracotta top rule, a sun mark, and
  // a Fraunces display heading. Quiet and document-like.
  .site-footer {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 70vh;
    padding: 7rem var(--space-6) 0;
    background: var(--color-surface-warmer);
    color: var(--color-ink);
    border-top: 2px solid var(--color-primary);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
  }

  .footer-mark {
    width: 2.75rem;
    height: 2.75rem;
    margin-bottom: var(--space-5);
    overflow: visible;
  }

  .mark-sun {
    fill: none;
    stroke: var(--color-primary);
    stroke-width: 2;
  }

  .mark-rays line {
    stroke: var(--color-primary);
    stroke-width: 2;
    stroke-linecap: round;
  }

  .heading {
    margin: 0;
    max-width: 18ch;
    color: var(--color-ink);
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-size: clamp(2.4rem, 5vw, 4rem);
    line-height: 1.02;
    letter-spacing: -0.01em;

    @include display-character($opsz: 144, $soft: 60, $wonk: 1);
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    padding-top: 0.5rem;
  }

  .link {
    width: fit-content;
    color: var(--color-ink-80);
    text-decoration: none;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-variant: small-caps;
    font-size: var(--type-large);
    font-weight: 540;
    letter-spacing: 0.05em;
    border-bottom: 1px solid transparent;
    transition:
      color 160ms var(--motion-snappy),
      border-color 160ms var(--motion-snappy);
  }

  .link:hover,
  .link:focus-visible {
    color: var(--color-primary);
    border-bottom-color: var(--color-primary);
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
    padding: var(--space-4) var(--space-6);
    border-top: var(--border-default);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-size: var(--type-small);
  }

  .copyright {
    margin: 0;
  }

  .source-link {
    color: var(--color-muted);
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .source-link:hover,
  .source-link:focus-visible {
    color: var(--color-primary);
  }

  @include breakpoint(phone) {
    .site-footer {
      padding: 5rem var(--space-5) 0;
    }

    .inner {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .base {
      margin-inline: calc(var(--space-5) * -1);
      padding-inline: var(--space-5);
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .link,
    .source-link {
      transition: none;
    }
  }
</style>
