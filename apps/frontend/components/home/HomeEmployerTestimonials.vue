<script setup lang="ts">
  import type { EmployerTestimonial } from '~/types/wordpress';

  const props = defineProps<{
    testimonials: EmployerTestimonial[];
  }>();

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
    <div class="section-header">
      <div class="section-header-left">
        <span class="section-index" aria-hidden="true">03</span>
        <h2 class="title">Testimonials</h2>
      </div>
      <span class="section-marker" aria-hidden="true">+</span>
    </div>

    <div class="inner">
      <div class="grid">
        <article
          v-for="(testimonial, index) in displayTestimonials"
          :key="testimonialKey(testimonial, index)"
          class="testimonial"
        >
          <div class="testimonial-header" aria-hidden="true">
            <span class="testimonial-index">{{ String(index + 1).padStart(2, '0') }}</span>
          </div>
          <blockquote class="quote">
            {{ testimonial.quote }}
          </blockquote>

          <footer
            v-if="testimonial.name || attribution(testimonial)"
            class="credit"
          >
            <p v-if="testimonial.name" class="name">{{ testimonial.name }}</p>
            <p v-if="attribution(testimonial)" class="meta">
              // {{ attribution(testimonial) }}
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
    margin-top: var(--space-7);
    background: var(--color-surface);
    color: var(--color-ink);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .section-header-left {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
  }

  .section-index {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .title {
    margin: 0;
    color: var(--color-surface);
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
  }

  .section-marker {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.5;
  }

  .inner {
    padding: var(--space-7) var(--space-6);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0;
    border: var(--border-default);
  }

  .testimonial {
    padding: var(--space-5);
    border-right: var(--border-default);
    border-bottom: var(--border-default);
    background: transparent;
  }

  .testimonial:nth-child(3n) {
    border-right: none;
  }

  .testimonial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-3);
    border-bottom: var(--border-blue);
  }

  .testimonial-index {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    color: var(--color-primary);
    font-weight: 600;
  }

  .quote {
    margin: 0;
    font-size: var(--type-base);
    line-height: 1.55;
  }

  .credit {
    margin-top: var(--space-4);
    padding-top: var(--space-3);
    border-top: var(--border-subtle);
  }

  .name,
  .meta {
    margin: 0;
  }

  .name {
    font-weight: 700;
    font-size: var(--type-small);
  }

  .meta {
    margin-top: var(--space-1);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.02em;
  }

  @media (max-width: 900px) {
    .grid {
      grid-template-columns: 1fr 1fr;
    }

    .testimonial:nth-child(3n) {
      border-right: var(--border-default);
    }

    .testimonial:nth-child(2n) {
      border-right: none;
    }
  }

  @include breakpoint(phone) {
    .employer-testimonials {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      padding-inline: var(--space-4);
    }

    .inner {
      padding-inline: var(--space-4);
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .testimonial:nth-child(n) {
      border-right: none;
    }
  }
</style>
