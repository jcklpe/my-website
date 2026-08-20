<script setup lang="ts">
  import type { CSSProperties } from 'vue';
  import type {
    EmployerTestimonial,
    TestimonialsTexture,
  } from '~/types/wordpress';

  const TEXTURE_STYLES: Record<
    TestimonialsTexture,
    { background: string; backgroundSize: string }
  > = {
    none: { background: 'none', backgroundSize: 'auto' },
    dots: {
      background:
        'radial-gradient(circle at 1px 1px, var(--color-signal-soft) 0 1px, transparent 1.5px)',
      backgroundSize: '20px 20px',
    },
    paper_grid: {
      background: 'var(--texture-paper-grid)',
      backgroundSize: 'var(--texture-paper-grid-size)',
    },
    paper_grid_ink: {
      background: 'var(--texture-paper-grid-ink)',
      backgroundSize: 'var(--texture-paper-grid-ink-size)',
    },
    paper_grid_signal_dots: {
      background: 'var(--texture-paper-grid-signal-dots)',
      backgroundSize: 'var(--texture-paper-grid-signal-dots-size)',
    },
    blueprint: {
      background: 'var(--texture-blueprint-field)',
      backgroundSize: 'var(--texture-blueprint-field-size)',
    },
    scanline: {
      background: 'var(--texture-terminal-scanline)',
      backgroundSize: 'auto',
    },
  };

  const props = defineProps<{
    testimonials: EmployerTestimonial[];
    testimonialsTexture?: TestimonialsTexture;
  }>();
  const sectionElement = ref<HTMLElement | null>(null);
  const headingElement = ref<HTMLElement | null>(null);
  const { letterStyle: headingLetterStyle } =
    useHomeHeadingParallax(headingElement);
  const headingText = 'Testimonials';
  const textureOffset = reactive({ x: 0, y: 0 });
  let scrollFrame = 0;
  const {
    enableTestimonialTextureParallax,
    testimonialTextureParallaxStrength,
    useQuoteSignal,
  } = useHomeMotionDebug();

  const innerStyle = computed<CSSProperties>(() => {
    const texture = TEXTURE_STYLES[props.testimonialsTexture ?? 'dots'];
    return {
      '--testimonial-texture': texture.background,
      '--testimonial-texture-size': texture.backgroundSize,
      '--testimonial-texture-x': `${textureOffset.x}px`,
      '--testimonial-texture-y': `${textureOffset.y}px`,
    } as CSSProperties;
  });

  function updateTextureFromScroll() {
    const bounds = sectionElement.value?.getBoundingClientRect();
    if (!bounds) return;
    const viewportCenter = window.innerHeight / 2;
    const sectionCenter = bounds.top + bounds.height / 2;
    const normalizedDistance = Math.max(
      -1,
      Math.min(1, (viewportCenter - sectionCenter) / viewportCenter),
    );
    const travel = 24 * testimonialTextureParallaxStrength.value;
    textureOffset.x = 0;
    textureOffset.y = normalizedDistance * travel;
  }

  function scheduleTextureUpdate() {
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(updateTextureFromScroll);
  }

  function resetTexture() {
    textureOffset.x = 0;
    textureOffset.y = 0;
  }

  watch(enableTestimonialTextureParallax, (enabled) => {
    if (!enabled) {
      resetTexture();
      return;
    }
    scheduleTextureUpdate();
  });

  watch(testimonialTextureParallaxStrength, scheduleTextureUpdate);

  onMounted(() => {
    window.addEventListener('scroll', scheduleTextureUpdate, { passive: true });
    window.addEventListener('resize', scheduleTextureUpdate, { passive: true });
    scheduleTextureUpdate();
  });

  onBeforeUnmount(() => {
    window.cancelAnimationFrame(scrollFrame);
    window.removeEventListener('scroll', scheduleTextureUpdate);
    window.removeEventListener('resize', scheduleTextureUpdate);
  });

  const placeholderTestimonials: EmployerTestimonial[] = [
    {
      quote:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      name: 'Testimonial Placeholder 1',
      role: 'Role Placeholder',
      organization: 'Organization Placeholder',
    },
    {
      quote:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
      name: 'Testimonial Placeholder 2',
      role: 'Role Placeholder',
      organization: 'Organization Placeholder',
    },
    {
      quote:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit.',
      name: 'Testimonial Placeholder 3',
      role: 'Role Placeholder',
      organization: 'Organization Placeholder',
    },
  ];

  const displayTestimonials = computed(() =>
    props.testimonials.length ? props.testimonials : placeholderTestimonials,
  );
  function testimonialKey(
    testimonial: EmployerTestimonial,
    index: number,
  ): string {
    return [
      testimonial.name,
      testimonial.organization,
      testimonial.quote.slice(0, 24),
      index,
    ]
      .filter(Boolean)
      .join('-');
  }

  function attribution(testimonial: EmployerTestimonial): string {
    return [testimonial.role, testimonial.organization]
      .filter(Boolean)
      .join(', ');
  }
</script>

<template>
  <section
    ref="sectionElement"
    class="employer-testimonials"
    :class="{ 'uses-quote-signal': useQuoteSignal }"
  >
    <div class="inner" :style="innerStyle">
      <div class="heading">
        <p class="eyebrow">Collaborators'</p>
        <h2 ref="headingElement" class="title" :aria-label="headingText">
          <span
            v-for="(letter, index) in headingText"
            :key="`${letter}-${index}`"
            class="letter-entry"
            :data-heading-position="`testimonial-${index}`"
            aria-hidden="true"
          >
            <span
              class="letter-depth"
              :style="headingLetterStyle(`testimonial-${index}`)"
              >{{ letter }}</span
            >
          </span>
        </h2>
      </div>

      <div class="grid">
        <article
          v-for="(testimonial, index) in displayTestimonials"
          :key="testimonialKey(testimonial, index)"
          class="testimonial"
        >
          <blockquote class="quote">
            <span class="quote-mark" aria-hidden="true">“</span>
            <span class="quote-text">{{ testimonial.quote }}</span>
          </blockquote>

          <footer
            v-if="testimonial.name || attribution(testimonial)"
            class="credit"
          >
            <p v-if="testimonial.name" class="name">{{ testimonial.name }}</p>
            <p v-if="attribution(testimonial)" class="meta">
              {{ attribution(testimonial) }}
            </p>
          </footer>
        </article>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
  .employer-testimonials {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-surface-screen);
    color: var(--color-ink);
    border-top: var(--border-strong);
    border-bottom: var(--border-strong);
  }

  .inner {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(10rem, 0.28fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: start;
    padding: var(--space-10) var(--space-6);
  }

  .inner::before {
    content: '';
    position: absolute;
    z-index: -1;
    inset: -2rem;
    background: var(--testimonial-texture);
    background-size: var(--testimonial-texture-size);
    transform: translate3d(
      var(--testimonial-texture-x),
      var(--testimonial-texture-y),
      0
    );
    pointer-events: none;
    will-change: transform;
  }

  .heading {
    position: sticky;
    top: var(--space-7);
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary);
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: none;
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    // Scale down through the mid range so the sticky title stops overrunning
    // its narrow column into the cards as the window narrows toward the
    // single-column breakpoint.
    font-size: clamp(1.5rem, 3vw, 3rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
    overflow: visible;
    white-space: nowrap;
  }

  .letter-entry,
  .letter-depth {
    display: inline-block;
    overflow: visible;
  }

  .letter-depth {
    will-change: transform;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .testimonial {
    position: relative;
    border: var(--border-window);
    padding: var(--space-5);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
  }

  .testimonial::before {
    content: '';
    display: block;
    width: 3rem;
    height: 0.55rem;
    margin-bottom: var(--space-4);
    background: repeating-linear-gradient(
      90deg,
      var(--color-primary) 0 0.55rem,
      transparent 0.55rem 0.9rem
    );
    background-size: 1.8rem 100%;
    animation: testimonial-signal-scroll 3.8s linear infinite;
  }

  .uses-quote-signal .testimonial::before {
    visibility: hidden;
  }

  .quote {
    position: relative;
    margin: 0;
    font-size: var(--type-base);
    line-height: 1.45;
  }

  .quote-mark {
    position: absolute;
    z-index: 0;
    top: -0.14em;
    left: -0.08em;
    color: var(--color-primary);
    font-family: var(--font-bodoni);
    font-size: clamp(11rem, 16vw, 16rem);
    line-height: 1;
    opacity: 0.2;
    pointer-events: none;
  }

  .uses-quote-signal .quote-mark {
    color: transparent;
    background: linear-gradient(
      105deg,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 5%,
      var(--color-primary) 45%,
      color-mix(in srgb, var(--color-primary) 32%, transparent) 58%,
      var(--color-primary) 78%,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 95%
    );
    background-clip: text;
    background-size: 240% 100%;
    opacity: 0.42;
    animation: testimonial-quote-signal 8s ease-in-out infinite alternate;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .quote-text {
    position: relative;
    z-index: 1;
  }

  @keyframes testimonial-signal-scroll {
    to {
      background-position: 1.8rem 0;
    }
  }

  @keyframes testimonial-quote-signal {
    to {
      background-position: 100% 0;
    }
  }

  .credit {
    margin-top: var(--space-5);
  }

  .name,
  .meta {
    margin: 0;
  }

  .name {
    font-family: var(--font-mono);
    font-weight: 700;
  }

  .meta {
    margin-top: var(--space-2);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-style: italic;
  }

  @media (max-width: 900px) {
    .inner,
    .grid {
      grid-template-columns: 1fr;
    }

    .heading {
      position: static;
    }
  }

  @include breakpoint(phone) {
    .employer-testimonials {
      margin-inline: calc(
        var(--space-3) * -1
      ); // match .home-page phone padding-inline exactly (space-4 bled 4px past the viewport)
    }

    .inner {
      padding-inline: var(--space-4);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .letter-depth {
      transform: none !important;
    }

    .testimonial::before {
      animation: none;
    }

    .inner::before {
      transform: none;
      transition: none;
    }

    .uses-quote-signal .quote-mark {
      animation: none;
    }
  }
</style>
