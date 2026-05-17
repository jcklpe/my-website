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
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 75vh;
    padding: 8rem var(--space-6) 0;
    border-top: var(--border-window);
    background: var(--texture-blueprint-field);
    background-size: var(--texture-blueprint-field-size);
    color: var(--color-ink);
  }

  .site-footer::before {
    content: "site map / outgoing channels";
    position: absolute;
    top: var(--space-5);
    left: var(--space-6);
    padding: 0.3rem 0.5rem;
    border: 1px solid var(--color-signal-soft);
    background: var(--color-surface);
    color: var(--color-signal-heavy);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    line-height: 1;
    text-transform: uppercase;
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
    border: var(--border-window);
    background: var(--color-surface);
    padding: var(--space-6);
    box-shadow: var(--shadow-hard-low);
  }

  .heading {
    margin: 0;
    color: var(--color-ink);
    font-size: clamp(2.5rem, 5vw, 4.5rem);
    font-family: var(--font-mono);
    line-height: 1.02;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  .links {
    display: grid;
    align-content: start;
    gap: var(--space-3);
    padding-top: 0.5rem;
  }

  .link {
    display: flex;
    justify-content: space-between;
    gap: var(--space-3);
    border: 1px solid var(--color-signal-soft);
    padding: 0.75rem 0.85rem;
    background: var(--color-surface-soft);
    color: var(--color-signal-heavy);
    text-decoration: none;
    font-size: var(--type-base);
    font-family: var(--font-mono);
    transition:
      background 160ms ease,
      color 160ms ease,
      transform 160ms ease;
  }

  .link::after {
    content: "->";
    color: var(--color-signal);
  }

  .link:hover,
  .link:focus-visible {
    background: var(--color-signal);
    color: var(--color-surface);
    transform: translate(-0.12rem, -0.12rem);
  }

  .link:hover::after,
  .link:focus-visible::after {
    color: currentColor;
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
    padding: var(--space-5) var(--space-6);
    border-top: var(--border-window);
    background: var(--color-surface);
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

  .source-link:hover,
  .source-link:focus-visible {
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

  @media (prefers-reduced-motion: reduce) {
    .link {
      transition: none;
    }

    .link:hover,
    .link:focus-visible {
      transform: none;
    }
  }
</style>
