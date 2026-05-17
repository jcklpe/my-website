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
    <div class="footer-header">
      <span class="footer-tag" aria-hidden="true">// EOF</span>
      <h2 class="heading">{{ footer.heading }}</h2>
    </div>

    <div class="inner">
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
          → {{ link.label }}
        </NuxtLink>

        <a
          v-for="link in footer.links.filter(
            (item) => !isInternalLink(item.url),
          )"
          :key="`${link.label}-${link.url}`"
          :href="link.url"
          class="link"
        >
          ↗ {{ link.label }}
        </a>
      </nav>
    </div>

    <div class="base">
      <p class="copyright">
        © {{ new Date().getFullYear() }} Aslan French.
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
        >View source</a
      >
    </div>
  </footer>
</template>

<style lang="scss" scoped>
  .site-footer {
    display: flex;
    flex-direction: column;
    min-height: 60vh;
    background: var(--color-primary);
    color: var(--color-surface);
    margin-top: var(--space-7);
  }

  .footer-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-8) var(--space-6) var(--space-6);
    border-bottom: 1px solid rgba(245, 241, 230, 0.2);
  }

  .footer-tag {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.14em;
    text-transform: uppercase;
    opacity: 0.6;
  }

  .heading {
    margin: 0;
    color: var(--color-surface);
    font-size: clamp(2rem, 5vw, 4.5rem);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    line-height: 0.98;
    letter-spacing: -0.05em;
  }

  .inner {
    flex: 1;
    padding: var(--space-7) var(--space-6);
  }

  .links {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: var(--space-2) var(--space-6);
    align-content: start;
    padding: 0;
  }

  .link {
    color: rgba(245, 241, 230, 0.8);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: var(--type-base);
    letter-spacing: 0.02em;
    padding: var(--space-2) 0;
    border-bottom: 1px solid transparent;
    transition:
      color 160ms var(--motion-snappy),
      border-color 160ms var(--motion-snappy);
  }

  .link:hover,
  .link:focus-visible {
    color: var(--color-surface);
    border-bottom-color: rgba(245, 241, 230, 0.5);
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6);
    border-top: 1px solid rgba(245, 241, 230, 0.2);
    color: rgba(245, 241, 230, 0.55);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.04em;
  }

  .copyright {
    margin: 0;
  }

  .source-link {
    color: rgba(245, 241, 230, 0.55);
    text-decoration: none;
    transition: color 160ms var(--motion-snappy);
  }

  .source-link:hover,
  .source-link:focus-visible {
    color: var(--color-surface);
  }

  @include breakpoint(phone) {
    .footer-header {
      padding-inline: var(--space-4);
    }

    .inner {
      padding-inline: var(--space-4);
    }

    .base {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-3);
      padding-inline: var(--space-4);
    }
  }
</style>
