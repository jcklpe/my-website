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
    margin-inline: calc(var(--space-6) * -1);
    background:
      linear-gradient(
          90deg,
          transparent calc(100% - 1px),
          var(--color-ink-025) 0
        )
        0 0 / 4.5rem 100%,
      var(--color-surface-warm);
    color: var(--color-ink);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(10rem, 0.28fr) minmax(0, 1fr);
    gap: var(--space-7);
    align-items: start;
    padding: var(--space-8) var(--space-6);
  }

  .heading {
    position: sticky;
    top: var(--space-7);
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-muted);
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: 8ch;
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    line-height: 0.95;
    letter-spacing: 0;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .testimonial {
    position: relative;
    min-height: 14rem;
    border: 1px solid var(--color-slip-border);
    border-radius: 1.4rem;
    padding: var(--space-5);
    background: var(--color-surface-soft);
    box-shadow: var(--shadow-soft-low);
  }

  .testimonial::before {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 1.2rem;
    height: 1.2rem;
    border-top: 1px solid var(--color-gold);
    border-right: 1px solid var(--color-gold);
    content: '';
  }

  .quote {
    margin: 0;
    font-family: var(--font-display);
    font-size: clamp(1.35rem, 2.2vw, 1.85rem);
    line-height: 1.18;
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
      margin-inline: calc(var(--space-4) * -1);
    }

    .inner {
      padding-inline: var(--space-4);
    }
  }
</style>
