<script setup lang="ts">
  import type { EmployerTestimonial, TestimonialsTexture } from '~/types/wordpress';

  const TEXTURE_STYLES: Record<TestimonialsTexture, { background: string; backgroundSize: string }> = {
    none: { background: 'none', backgroundSize: 'auto' },
    dots: {
      background: 'radial-gradient(circle at 1px 1px, var(--color-signal-soft) 0 1px, transparent 1.5px)',
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

  const innerStyle = computed(() => TEXTURE_STYLES[props.testimonialsTexture ?? 'dots']);

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
  <section class="employer-testimonials">
    <div class="inner" :style="innerStyle">
      <div class="heading">
        <p class="eyebrow">Collaborators</p>
        <h2 class="title">Testimonials</h2>
      </div>

      <div class="grid">
        <article
          v-for="(testimonial, index) in displayTestimonials"
          :key="testimonialKey(testimonial, index)"
          class="testimonial"
        >
          <blockquote class="quote">
            {{ testimonial.quote }}
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
    display: grid;
    grid-template-columns: minmax(10rem, 0.28fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: start;
    padding: var(--space-10) var(--space-6);
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
    max-width: 8ch;
    margin: 0;
    font-family: var(--font-mono);
    font-style: italic;
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 0.95;
    letter-spacing: -0.04em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .testimonial {
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
  }

  .quote {
    margin: 0;
    font-size: var(--type-base);
    line-height: 1.45;
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
      margin-inline: calc(var(--space-3) * -1); // match .home-page phone padding-inline exactly (space-4 bled 4px past the viewport)
    }

    .inner {
      padding-inline: var(--space-4);
    }
  }
</style>
