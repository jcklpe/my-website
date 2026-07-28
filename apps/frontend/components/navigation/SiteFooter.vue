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
  <footer class="site-footer">
    <div class="inner">
      <div class="intro">
        <h2 class="heading">{{ footer.heading }}</h2>
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75vh;
    padding: 8rem var(--space-6) 0;
    background: var(--color-surface-warm);
    color: var(--color-ink);
    border-top: 1px solid var(--color-primary);
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
</style>
