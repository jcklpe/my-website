<script setup lang="ts">
  import type { WordPressCaseStudy } from '~/types/wordpress';

  const route = useRoute();
  const slug = computed(() => String(route.params.slug));

  const {
    data: caseStudy,
    error,
    status,
  } = await useAsyncData<WordPressCaseStudy | null>(
    () => `case-study:${slug.value}`,
    () => queryWordPressCaseStudyBySlug(slug.value),
    {
      dedupe: 'cancel',
      watch: [slug],
    },
  );

  const isLoading = computed(
    () => status.value === 'idle' || status.value === 'pending',
  );

  useSeoMeta({
    title: () => caseStudy.value?.title ?? 'Case Study',
    description: () => caseStudy.value?.excerpt ?? '',
  });

  const mediaTransitionKey = computed(() =>
    `case-study-${slug.value}`.replace(/[^a-zA-Z0-9_-]/g, '-'),
  );
  const transitionState = useFeaturedMediaTransitionState();
  const isTitleTransitioning = computed(
    () =>
      transitionState.value.active &&
      transitionState.value.key === mediaTransitionKey.value,
  );
</script>

<template>
  <article v-if="caseStudy" class="case-study-page">
    <section class="hero">
      <div class="spine-label" aria-hidden="true">CASE STUDY</div>
      <div class="dossier-bar" aria-hidden="true">
        <span class="dossier-bar-label">◈ CASE STUDY</span>
        <span class="dossier-bar-rule"></span>
        <span class="dossier-bar-status">STATUS ◉ ACTIVE</span>
      </div>

      <div
        class="dossier-body"
        :class="{
          'dossier-body--has-photo': !!caseStudy.featuredMedia?.sourceUrl,
        }"
      >
        <div class="dossier-text">
          <p class="field-label" aria-hidden="true">DESIGNATION</p>
          <h1 class="title" :data-featured-title-target="mediaTransitionKey">
            <span
              :class="{
                'is-transition-hidden': isTitleTransitioning,
              }"
            >
              {{ caseStudy.title }}
            </span>
          </h1>
          <p v-if="caseStudy.excerpt" class="excerpt-field">
            {{ caseStudy.excerpt }}
          </p>
        </div>

        <div v-if="caseStudy.featuredMedia?.sourceUrl" class="dossier-photo">
          <FeaturedMediaFrame
            class="hero-media"
            :media="caseStudy.featuredMedia"
            label="Case Study"
            :transition-key="mediaTransitionKey"
            transition-role="target"
            transition-clip-path="polygon(0 0, 100% 0, 100% 100%, 0 100%)"
          />
          <span class="photo-label" aria-hidden="true">REF IMG</span>
        </div>
      </div>

      <div class="dossier-footer" aria-hidden="true">
        <span>PORTFOLIO INDEX</span>
        <span class="footer-sep">◈</span>
        <span>A.FAZLALI</span>
      </div>
    </section>

    <BlockRenderer class="content" :blocks="caseStudy.blocks ?? []" />
  </article>

  <section v-else class="case-study-page-state" aria-live="polite">
    <p class="meta">
      {{ isLoading ? 'Loading' : error ? 'Error' : 'Not Found' }}
    </p>
    <h1>
      {{
        isLoading
          ? 'Loading case study...'
          : error
            ? 'Unable to load case study.'
            : 'Case study not found.'
      }}
    </h1>
    <p class="excerpt">
      {{
        isLoading
          ? 'Fetching this case study from WordPress.'
          : error
            ? 'The CMS request failed. Try refreshing, or check whether WordPress is running.'
            : `No case study exists for "${slug}".`
      }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
  .case-study-page {
    width: 100%;
    max-width: none;
    min-height: 55vh;
    padding: 0 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper-warm);
  }

  .hero {
    background: var(--color-ink);
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  /* Ghost index number — barely visible, anchored top-right */
  .hero::before {
    content: '01';
    position: absolute;
    top: -0.12em;
    right: -0.06em;
    font-family: var(--font-mono);
    font-size: clamp(28rem, 55vw, 88rem);
    font-style: italic;
    font-weight: 700;
    line-height: 1;
    color: rgba(255, 255, 255, 0.055);
    pointer-events: none;
    z-index: 0;
    user-select: none;
  }

  /* Vertical amber spine line */
  .hero::after {
    content: '';
    position: absolute;
    left: 2.2rem;
    top: 0;
    bottom: 0;
    width: 1px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(181, 104, 0, 0.25) 6%,
      rgba(181, 104, 0, 0.25) 94%,
      transparent 100%
    );
    pointer-events: none;
    z-index: 5;
  }

  /* Left document spine label */
  .spine-label {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 2.2rem;
    writing-mode: vertical-rl;
    transform: rotate(180deg);
    text-align: center;
    font-family: var(--font-mono);
    font-size: 0.46rem;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(181, 104, 0, 0.48);
    z-index: 6;
    pointer-events: none;
  }

  /* ─ Top amber status bar ─ */
  .dossier-bar {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    padding: 0.65rem var(--space-6);
    border-bottom: 1px solid rgba(181, 104, 0, 0.28);
    background: rgba(181, 104, 0, 0.04);
    font-family: var(--font-mono);
    font-size: 0.58rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--color-amber);
  }

  .dossier-bar-rule {
    flex: 1;
    height: 1px;
    background: linear-gradient(
      90deg,
      rgba(181, 104, 0, 0.32),
      rgba(181, 104, 0, 0.06)
    );
  }

  .dossier-bar-status {
    opacity: 0.7;
  }

  /* ─ Body: single column default, grid when photo present ─ */
  .dossier-body {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Diagonal amber diagnostic slash — full-width PCB trace cut across the body */
  .dossier-body::before {
    content: '';
    position: absolute;
    top: 52%;
    left: -5%;
    width: 110%;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(181, 104, 0, 0.24) 12%,
      rgba(181, 104, 0, 0.24) 88%,
      transparent 100%
    );
    transform: rotate(-5deg);
    pointer-events: none;
    z-index: 4;
  }

  .dossier-body--has-photo {
    display: grid;
    grid-template-columns: 1fr clamp(140px, 18%, 280px);
  }

  /* ─ Left: title field — overflow visible so title bleeds into photo column ─ */
  .dossier-text {
    padding: clamp(3rem, 6vw, 8rem) var(--space-6) clamp(3rem, 5vw, 7rem);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    min-height: clamp(26rem, 58vh, 66rem);
    border-right: 1px solid rgba(181, 104, 0, 0.18);
    overflow: visible;
    position: relative;
    z-index: 3;
  }

  .field-label {
    margin: 0 0 var(--space-3);
    font-family: var(--font-mono);
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    color: rgba(181, 104, 0, 0.6);
  }

  .is-transition-hidden {
    opacity: 0;
  }

  .title {
    color: white;
    font-family: var(--font-mono);
    font-size: clamp(5rem, 12vw, 20rem);
    line-height: 0.86;
    letter-spacing: -0.06em;
    font-style: italic;
  }

  .title span {
    display: inline;
  }

  .excerpt-field {
    margin: var(--space-5) 0 0;
    font-family: var(--font-mono);
    font-size: 0.72rem;
    line-height: 1.6;
    color: rgba(255, 255, 255, 0.28);
    max-width: 44rem;
    letter-spacing: 0.02em;
  }

  /* ─ Right: reference photo, parallelogram ─ */
  .dossier-photo {
    position: relative;
    overflow: hidden;
    clip-path: polygon(14% 0, 100% 0, 86% 100%, 0 100%);
    z-index: 1;
  }

  .dossier-photo::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        to bottom,
        transparent,
        transparent 2px,
        rgba(0, 0, 0, 0.14) 2px,
        rgba(0, 0, 0, 0.14) 3px
      ),
      linear-gradient(
        to bottom,
        rgba(12, 17, 43, 0.55) 0%,
        rgba(12, 17, 43, 0.06) 50%,
        rgba(12, 17, 43, 0.5) 100%
      );
    pointer-events: none;
    z-index: 2;
  }

  .hero-media {
    display: block;
    width: 100%;
    height: 100%;
  }

  .hero-media :deep(.image),
  .hero-media :deep(.placeholder) {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: saturate(0.45) brightness(0.62);
  }

  .photo-label {
    position: absolute;
    bottom: var(--space-4);
    right: var(--space-5);
    font-family: var(--font-mono);
    font-size: 0.46rem;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(181, 104, 0, 0.4);
    z-index: 3;
  }

  /* ─ Bottom amber data bar ─ */
  .dossier-footer {
    display: flex;
    align-items: center;
    gap: var(--space-5);
    padding: 0.65rem var(--space-6);
    border-top: 1px solid rgba(181, 104, 0, 0.2);
    font-family: var(--font-mono);
    font-size: 0.52rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: rgba(181, 104, 0, 0.42);
  }

  .footer-sep {
    color: rgba(181, 104, 0, 0.22);
  }

  .content {
    position: relative;
    z-index: 2;
    width: 100%;
    background: var(--color-paper-warm);
    padding-top: var(--space-5);
    animation: detail-content-rise var(--motion-route-transition-duration)
      var(--motion-snappy) var(--motion-route-content-delay) both;
  }

  .case-study-page-state {
    max-width: 44rem;
    min-height: 55vh;
    padding: var(--space-8) 0 var(--space-9);
    color: var(--color-ink);
    background: var(--color-paper-warm);
  }

  .meta {
    color: var(--color-muted);
  }

  @keyframes detail-content-rise {
    from {
      transform: translateY(46vh);
    }

    to {
      transform: translateY(0);
    }
  }

  @media (max-width: 767px) {
    .dossier-body--has-photo {
      display: flex;
      flex-direction: column;
    }

    .dossier-text {
      border-right: none;
      border-bottom: 1px solid rgba(181, 104, 0, 0.18);
      min-height: auto;
    }

    .dossier-photo {
      clip-path: none;
      height: clamp(180px, 30vh, 300px);
    }

    .title {
      font-size: clamp(2.8rem, 10vw, 5.5rem);
    }

    .dossier-body::before {
      display: none;
    }

    .spine-label {
      display: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .content {
      animation: none;
    }
  }
</style>
