<script setup lang="ts">
  import type { FooterSettings } from '~/types/wordpress';

  defineProps<{
    footer: FooterSettings;
  }>();

  const route = useRoute();
  const config = useRuntimeConfig();
  const { navigateFromFeaturedMediaTarget } = useFeaturedMediaTransition();
  const { prefetchInitialArchivePage } = useWritingArchive();
  const { enableFooterQuietSignal, enableFooterTicker } =
    useHomeMotionDebug();
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

      // WordPress stores absolute URLs using its own configured domain (e.g.
      // cms.my-website.localhost) which differs from the frontend siteUrl
      // (my-website.localhost) in development. Accept links from either the
      // exact origin or any subdomain of the siteUrl host so CMS-authored
      // internal links navigate via the SPA router rather than doing a full
      // page load to the WP admin URL.
      const isSameSite =
        linkUrl.origin === siteUrl.origin ||
        linkUrl.host.endsWith(`.${siteUrl.host}`);

      if (!isSameSite) {
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
    const target = normalizedInternalTarget(url);

    // Not a reverse-transition source: plain SPA nav (custom-mode anchor means
    // we own the default). Let modified clicks fall through to native handling.
    if (!isCaseStudyDetail.value || !isSelectedWorkTarget(url)) {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      event.preventDefault();
      void navigateTo(target);
      return;
    }

    void navigateFromFeaturedMediaTarget(
      event,
      target,
      detailTransitionKey.value,
    );
  }
</script>

<template>
  <footer
    class="site-footer"
    :class="{
      'has-quiet-signal': enableFooterQuietSignal,
      'has-heading-ticker': enableFooterTicker,
    }"
  >
    <div class="inner">
      <div class="intro">
        <h2 class="heading">
          <span class="heading-label">{{ footer.heading }}</span>
          <span v-if="enableFooterTicker" class="ticker" aria-hidden="true">
            <span v-for="index in 4" :key="index" class="ticker-copy">
              {{ footer.heading }}
              <span class="ticker-separator">✦</span>
            </span>
          </span>
        </h2>
      </div>

      <nav class="links" aria-label="Footer">
        <!-- Custom mode so our click handler owns navigation timing; a plain
             NuxtLink pushes the route immediately and would race the reverse
             transition's body-exit hold. Matches the SiteNav Home link. -->
        <NuxtLink
          v-for="link in footer.links.filter((item) =>
            isInternalLink(item.url),
          )"
          :key="`${link.label}-${link.url}`"
          v-slot="{ href }"
          :to="normalizedInternalTarget(link.url)"
          custom
        >
          <a
            :href="href"
            class="link"
            @focus="prefetchFooterLink(link.url)"
            @pointerdown="prefetchFooterLink(link.url)"
            @pointerenter="prefetchFooterLink(link.url)"
            @click="handleFooterLinkClick($event, link.url)"
          >
            {{ link.label }}
          </a>
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
        © 2014–{{ new Date().getFullYear() }} Aslan French. Content licensed
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
    // Positioned stacking context with a positive z-index so this opaque
    // footer paints over the home page's fixed reaction-diffusion canvas
    // (position: fixed; z-index: -1), which otherwise bleeds across it.
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75vh;
    padding: 8rem var(--space-6) 0;
    background: var(--color-surface-warm);
    color: var(--color-ink);
    border-top: 1px solid var(--color-primary);
    overflow: hidden;
  }

  .site-footer::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 0;
    width: min(18rem, 28vw);
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent,
      var(--color-primary),
      transparent
    );
    opacity: 0;
    transform: translateX(-110%);
    pointer-events: none;
  }

  .site-footer.has-quiet-signal::before {
    animation: footer-quiet-signal 12s ease-in-out infinite;
  }

  @keyframes footer-quiet-signal {
    0%,
    8% {
      opacity: 0;
      transform: translateX(-110%);
    }

    11% {
      opacity: 0.8;
    }

    31% {
      opacity: 0.8;
      transform: translateX(calc(100vw + 110%));
    }

    34%,
    100% {
      opacity: 0;
      transform: translateX(calc(100vw + 110%));
    }
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
  }

  .heading {
    margin: 0;
    color: var(--color-ink);
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-family: var(--font-mono);
    font-style: italic;
    font-weight: 600;
    line-height: 1.02;
    letter-spacing: -0.04em;
  }

  .heading-label {
    display: block;
  }

  .ticker {
    display: none;
  }

  .has-heading-ticker .inner {
    display: block;
    margin-inline: calc(var(--space-6) * -1);
  }

  .has-heading-ticker .intro {
    overflow: hidden;
    border-block: 1px solid var(--color-primary);
    padding-block: var(--space-3);
  }

  .has-heading-ticker .heading-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .has-heading-ticker .ticker {
    display: flex;
    width: max-content;
    animation: footer-heading-ticker 32s linear infinite;
  }

  .ticker-copy {
    display: inline-flex;
    align-items: center;
    gap: 0.55em;
    padding-right: 0.55em;
    white-space: nowrap;
  }

  .ticker-separator {
    color: var(--color-primary);
    font-size: 0.55em;
  }

  @keyframes footer-heading-ticker {
    to {
      transform: translateX(-25%);
    }
  }

  .has-heading-ticker .links {
    width: min(28rem, calc(100% - 4rem));
    margin: var(--space-7) var(--space-6) 0 auto;
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
    font-weight: 500;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    transition: color 160ms var(--snappy-ease-out);
  }

  .link:hover,
  .link:focus-visible {
    color: var(--color-primary);
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
    padding: var(--space-5) var(--space-6);
    color: var(--color-muted);
    font-size: var(--type-small);
  }

  .note {
    margin: 0;
  }

  .source-link {
    color: var(--color-muted);
    text-decoration: none;
    transition: color 160ms ease;
  }

  .source-link:hover {
    color: var(--color-ink);
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

  @media print {
    // Hide the big footer block; .base (copyright line) stays visible.
    .inner {
      display: none;
    }

    .site-footer {
      min-height: auto;
      padding: var(--space-4) var(--space-5);
      border-top: none;
    }

    // Keep the CC licence credit; drop the GitHub source link.
    .base > .source-link {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .site-footer.has-quiet-signal::before,
    .has-heading-ticker .ticker {
      animation: none;
    }
  }
</style>
