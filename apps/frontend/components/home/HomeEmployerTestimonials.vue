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
    <div class="inner">
      <div class="heading">
        <p class="eyebrow">Employer notes</p>
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
    padding: var(--space-5);
    background: var(--color-ink);
    color: var(--color-surface);
  }

  .inner {
    position: relative;
    display: grid;
    grid-template-columns: minmax(10rem, 0.24fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: start;
    min-height: 42rem;
    padding: var(--space-7);
    border: 1px solid currentColor;
  }

  .inner::after {
    content: 'Testimonials';
    position: absolute;
    left: 50%;
    bottom: var(--space-4);
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    text-transform: uppercase;
    transform: translateX(-50%) rotate(180deg);
  }

  .heading {
    position: sticky;
    top: var(--space-7);
    text-align: center;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    text-transform: uppercase;
  }

  .title {
    max-width: 8ch;
    margin: 0;
    color: var(--color-surface);
    font-family: var(--font-serif);
    font-size: clamp(2.5rem, 6vw, 5.5rem);
    font-weight: 400;
    line-height: 0.9;
    text-transform: uppercase;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-4);
  }

  .testimonial {
    min-height: 16rem;
    padding: var(--space-5);
    border: 1px solid var(--color-surface-softer);
    background: transparent;
  }

  .quote {
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(1.3rem, 2vw, 1.8rem);
    line-height: 1.16;
  }

  .credit {
    margin-top: var(--space-5);
  }

  .name,
  .meta {
    margin: 0;
  }

  .name {
    font-weight: 700;
  }

  .meta {
    margin-top: var(--space-2);
    color: var(--color-surface-softer);
    font-size: var(--type-small);
    font-style: italic;
    text-transform: uppercase;
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
      padding: var(--space-4);
    }

    .inner {
      min-height: 38rem;
      padding: var(--space-5);
    }
  }
</style>
