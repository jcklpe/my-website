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
  const quoteMaskStyle = ref<CSSProperties>({});
  let quoteMaskObserver: ResizeObserver | null = null;
  let quoteMaskFrame = 0;
  let quoteMaskKey = '';
  let quoteMaskUrl = '';
  let quoteFontReady = false;
  let isMounted = false;
  const textureOffset = reactive({ x: 0, y: 0 });
  const textureTarget = { x: 0, y: 0 };
  const transitionState = useFeaturedMediaTransitionState();
  let motionFrame = 0;
  let pointerActive = false;
  let orientationBaseline: { x: number; y: number } | null = null;
  let reducedMotionQuery: MediaQueryList | null = null;
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

  function clamp(value: number, minimum: number, maximum: number) {
    return Math.min(maximum, Math.max(minimum, value));
  }

  function textureTravel() {
    return 8 * testimonialTextureParallaxStrength.value;
  }

  function animateTexture() {
    motionFrame = 0;
    if (
      !enableTestimonialTextureParallax.value ||
      transitionState.value.active ||
      reducedMotionQuery?.matches
    ) {
      resetTexture();
      return;
    }

    textureOffset.x += (textureTarget.x - textureOffset.x) * 0.1;
    textureOffset.y += (textureTarget.y - textureOffset.y) * 0.1;

    if (
      Math.abs(textureTarget.x - textureOffset.x) > 0.04 ||
      Math.abs(textureTarget.y - textureOffset.y) > 0.04
    ) {
      requestTextureUpdate();
    }
  }

  function requestTextureUpdate() {
    if (!motionFrame)
      motionFrame = window.requestAnimationFrame(animateTexture);
  }

  function trackPointer(event: PointerEvent) {
    if (event.pointerType === 'touch') return;

    pointerActive = true;
    const travel = textureTravel();
    textureTarget.x =
      clamp(event.clientX / window.innerWidth - 0.5, -0.5, 0.5) * travel * 2;
    textureTarget.y =
      clamp(event.clientY / window.innerHeight - 0.5, -0.5, 0.5) * travel * 2;
    requestTextureUpdate();
  }

  function trackOrientation(event: DeviceOrientationEvent) {
    if (pointerActive || event.beta === null || event.gamma === null) return;

    const beta = (event.beta * Math.PI) / 180;
    const gamma = (event.gamma * Math.PI) / 180;
    const projectedX = Math.cos(beta) * Math.sin(gamma);
    const projectedY = Math.sin(beta);

    orientationBaseline ??= { x: projectedX, y: projectedY };
    const travel = textureTravel();
    textureTarget.x =
      clamp((projectedX - orientationBaseline.x) / 0.28, -1, 1) * travel;
    textureTarget.y =
      clamp((projectedY - orientationBaseline.y) / 0.28, -1, 1) * travel;
    requestTextureUpdate();
  }

  function resetTexture() {
    textureTarget.x = 0;
    textureTarget.y = 0;
    textureOffset.x = 0;
    textureOffset.y = 0;
  }

  function prepareQuoteMask() {
    quoteMaskFrame = 0;
    if (!isMounted || !quoteFontReady) return;

    const quote = sectionElement.value?.querySelector('.quote-mark');
    if (!quote) return;

    const rect = quote.getBoundingClientRect();
    const marker = quote.querySelector('.quote-baseline');
    if (!marker) return;
    const baseline = marker.getBoundingClientRect().top - rect.top;
    const style = window.getComputedStyle(quote);
    const density = window.devicePixelRatio;
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const key = [rect.width, rect.height, baseline, density, font].join('|');
    if (!rect.width || !rect.height || key === quoteMaskKey) return;

    // All quote marks share typography and dimensions; prepare one mask when those change, never on scroll or animation frames.
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(rect.width * density);
    canvas.height = Math.ceil(rect.height * density);
    const context = canvas.getContext('2d');
    if (!context) return;

    context.scale(density, density);
    context.font = font;
    context.fillText('”', 0, baseline);
    quoteMaskKey = key;
    const fontSize = parseFloat(style.fontSize);
    const maskWidth = canvas.width / density / fontSize;
    const maskHeight = canvas.height / density / fontSize;
    // Encode and decode before switching away from the text fallback; em sizing keeps an existing mask responsive during resize preparation.
    canvas.toBlob(async (blob) => {
      if (!blob || !isMounted || key !== quoteMaskKey) return;

      const url = URL.createObjectURL(blob);
      const image = new Image();
      image.src = url;
      try {
        await image.decode();
      } catch {
        URL.revokeObjectURL(url);
        return;
      }
      if (!isMounted || key !== quoteMaskKey) {
        URL.revokeObjectURL(url);
        return;
      }

      const previousUrl = quoteMaskUrl;
      quoteMaskUrl = url;
      quoteMaskStyle.value = {
        '--testimonial-quote-mask': `url("${url}")`,
        '--testimonial-quote-mask-size': `${maskWidth}em ${maskHeight}em`,
      } as CSSProperties;
      await nextTick();
      if (previousUrl) URL.revokeObjectURL(previousUrl);
    });
  }

  function requestQuoteMask() {
    if (!quoteMaskFrame) {
      quoteMaskFrame = window.requestAnimationFrame(prepareQuoteMask);
    }
  }

  watch(enableTestimonialTextureParallax, (enabled) => {
    if (!enabled) {
      resetTexture();
      return;
    }
    requestTextureUpdate();
  });

  watch(testimonialTextureParallaxStrength, requestTextureUpdate);
  watch(transitionState, requestTextureUpdate);

  onMounted(() => {
    isMounted = true;
    if (CSS.supports('mask-image', 'url("data:image/png;base64,")')) {
      const quote = sectionElement.value?.querySelector('.quote-mark');
      if (quote) {
        quoteMaskObserver = new ResizeObserver(requestQuoteMask);
        quoteMaskObserver.observe(quote);
        window.addEventListener('resize', requestQuoteMask, { passive: true });
        document.fonts
          .load('16px "Bodoni Z37"', '”')
          .then(() => {
            if (!isMounted) return;
            quoteFontReady = document.fonts.check('16px "Bodoni Z37"', '”');
            requestQuoteMask();
          })
          .catch(() => {
            // Keep the original text gradient if its font cannot be prepared.
          });
      }
    }
    reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionQuery.addEventListener('change', requestTextureUpdate);
    window.addEventListener('pointermove', trackPointer, {
      passive: true,
    });
    window.addEventListener('deviceorientation', trackOrientation, {
      passive: true,
    });
  });

  onBeforeUnmount(() => {
    isMounted = false;
    window.cancelAnimationFrame(quoteMaskFrame);
    quoteMaskObserver?.disconnect();
    if (quoteMaskUrl) URL.revokeObjectURL(quoteMaskUrl);
    window.removeEventListener('resize', requestQuoteMask);
    window.cancelAnimationFrame(motionFrame);
    reducedMotionQuery?.removeEventListener('change', requestTextureUpdate);
    window.removeEventListener('pointermove', trackPointer);
    window.removeEventListener('deviceorientation', trackOrientation);
  });

  const placeholderTestimonials: EmployerTestimonial[] = [
    {
      quote:
        'Testimonial quote fallback 1 — add an employer testimonial in WordPress.',
      name: 'Testimonial Placeholder 1',
      role: 'Role Placeholder',
      organization: 'Organization Placeholder',
    },
    {
      quote:
        'Testimonial quote fallback 2 — add an employer testimonial in WordPress.',
      name: 'Testimonial Placeholder 2',
      role: 'Role Placeholder',
      organization: 'Organization Placeholder',
    },
    {
      quote:
        'Testimonial quote fallback 3 — add an employer testimonial in WordPress.',
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
    id="collaborators"
    ref="sectionElement"
    class="employer-testimonials"
    :class="{
      'uses-quote-signal': useQuoteSignal,
      'has-quote-mask': Boolean(quoteMaskStyle['--testimonial-quote-mask']),
    }"
    :style="quoteMaskStyle"
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
          <span class="signal" aria-hidden="true" />
          <blockquote class="quote">
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
          <span class="quote-mark" aria-hidden="true">
            ”<span class="quote-baseline" /><span class="quote-mask"
              ><span class="quote-color"
            /></span>
          </span>
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
    padding: var(--space-6) var(--space-6) calc(var(--space-6) + 2rem);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-hard-low);
    overflow: hidden;
  }

  .signal {
    position: relative;
    display: block;
    width: 3rem;
    height: 0.55rem;
    margin-bottom: var(--space-4);
    overflow: hidden;
  }

  .signal::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 -1.8rem;
    width: calc(100% + 1.8rem);
    background: repeating-linear-gradient(
      90deg,
      var(--color-primary) 0 0.55rem,
      transparent 0.55rem 0.9rem
    );
    background-size: 1.8rem 100%;
    animation: testimonial-signal-scroll 3.8s linear infinite;
  }

  .quote {
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: var(--type-base);
    line-height: 1.45;
  }

  .quote-mark {
    position: absolute;
    z-index: 0;
    right: 0.2em;
    bottom: -0.3em;
    color: var(--color-primary);
    font-family: var(--font-bodoni);
    font-size: clamp(9rem, 13vw, 13rem);
    line-height: 1;
    opacity: 0.2;
    pointer-events: none;
  }

  .uses-quote-signal .quote-mark {
    --quote-gradient: linear-gradient(
      105deg,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 5%,
      var(--color-primary) 45%,
      color-mix(in srgb, var(--color-primary) 32%, transparent) 58%,
      var(--color-primary) 78%,
      color-mix(in srgb, var(--color-primary) 18%, transparent) 95%
    );
    color: transparent;
    background: var(--quote-gradient);
    background-clip: text;
    background-size: 240% 100%;
    opacity: 0.58;
    animation: testimonial-quote-fallback 8s ease-in-out infinite alternate;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .quote-baseline {
    display: inline-block;
    width: 0;
    height: 0;
    vertical-align: baseline;
  }

  .quote-mask {
    position: absolute;
    inset: 0;
    overflow: hidden;
    visibility: hidden;
    mask-image: var(--testimonial-quote-mask);
    mask-size: var(--testimonial-quote-mask-size);
    mask-repeat: no-repeat;
    transform: translateZ(0);
  }

  .quote-color {
    position: absolute;
    inset: 0 auto 0 0;
    width: 240%;
    background: var(--quote-gradient);
  }

  .uses-quote-signal .quote-color {
    animation: testimonial-quote-signal 8s ease-in-out infinite alternate;
  }

  .uses-quote-signal.has-quote-mask .quote-mark {
    background: none;
    background-clip: border-box;
    animation: none;
    -webkit-background-clip: border-box;
  }

  .uses-quote-signal.has-quote-mask .quote-mask {
    visibility: visible;
  }

  .quote-text {
    position: relative;
    z-index: 1;
  }

  @keyframes testimonial-signal-scroll {
    to {
      transform: translateX(1.8rem);
    }
  }

  @keyframes testimonial-quote-signal {
    to {
      // The original 240%-wide background travels by 140% of the stationary glyph width.
      transform: translateX(calc(-100% * 1.4 / 2.4));
    }
  }

  @keyframes testimonial-quote-fallback {
    to {
      background-position: 100% 0;
    }
  }

  .credit {
    position: relative;
    z-index: 1;
    margin-top: var(--space-5);
    padding-right: clamp(2rem, 5vw, 4rem);
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

    .signal::before {
      animation: none;
    }

    .inner::before {
      transform: none;
      transition: none;
    }

    .uses-quote-signal .quote-mark {
      animation: none;
    }

    .uses-quote-signal .quote-color {
      animation: none;
    }
  }
</style>
