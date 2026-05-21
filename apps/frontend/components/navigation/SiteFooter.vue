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
    background:
      linear-gradient(90deg, transparent 0 72%, var(--color-pop-coral) 72%),
      var(--color-pop-navy);
    color: var(--color-pop-cream);
    overflow: hidden;
  }

  .site-footer::before {
    content: '';
    position: absolute;
    top: var(--space-7);
    left: var(--space-6);
    width: 9rem;
    height: 1.4rem;
    border: 2px solid var(--color-pop-cream);
    background: var(--color-pop-yellow);
    box-shadow: 0.45rem 0.45rem 0 var(--color-pop-aqua);
  }

  .inner {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(12rem, 1fr);
    gap: var(--space-7);
  }

  .heading {
    margin: 0;
    color: var(--color-pop-cream);
    font-size: 4.8rem;
    font-family: var(--font-sans);
    font-weight: 700;
    line-height: 0.95;
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
    width: fit-content;
    border-bottom: 0.18rem solid var(--color-pop-yellow);
    color: var(--color-pop-cream);
    text-decoration: none;
    font-size: var(--type-base);
    font-family: var(--font-mono);
    transition:
      background 160ms ease,
      color 160ms ease;
  }

  .link:hover {
    background: var(--color-pop-yellow);
    color: var(--color-ink);
    text-decoration: none;
  }

  .base {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
    padding: var(--space-5) var(--space-6);
    border-top: 2px solid var(--color-pop-cream);
    color: var(--color-pop-cream);
    font-size: var(--type-small);
  }

  .note {
    margin: 0;
  }

  .source-link {
    color: var(--color-pop-yellow);
    text-decoration: none;
    transition: color 160ms ease;
  }

  .source-link:hover {
    color: var(--color-pop-aqua);
  }

  @include breakpoint(phone) {
    .site-footer {
      padding: 5rem var(--space-5) 0;
    }

    .site-footer::before {
      top: var(--space-5);
      left: var(--space-5);
      width: 6rem;
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

    .heading {
      font-size: 2.8rem;
    }
  }
</style>
