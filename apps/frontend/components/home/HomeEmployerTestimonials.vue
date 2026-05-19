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
        <p class="eyebrow">From the field</p>
        <h2 class="title">On the record</h2>
      </div>

      <div class="grid">
        <article
          v-for="(testimonial, index) in displayTestimonials"
          :key="testimonialKey(testimonial, index)"
          class="testimonial"
        >
          <span class="dash" aria-hidden="true" />

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
  // Section title was "Employer notes" / "Testimonials"; renamed to "From the
  // field" / "On the record" because the prior framing put the author in an
  // employee position. The CMS prop name stays `EmployerTestimonial` for
  // compatibility — only the visible labels change.
  .employer-testimonials {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-surface);
    color: var(--color-ink);
    border-top: 1px solid var(--color-primary);
    border-bottom: 1px solid var(--color-primary);
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
    margin: 0 0 var(--space-3);
    color: var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  .title {
    max-width: 12ch;
    margin: 0;
    font-family: var(--font-mono);
    font-style: normal;
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 600;
    line-height: 0.98;
    letter-spacing: -0.02em;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  // Card vocabulary from blue1.2 — windowed border + printed hard shadow.
  // The periwinkle dash swatch from blue1.3 sits at the top of each card as
  // the section signal instead of a "NOTE" label.
  .testimonial {
    min-height: 14rem;
    padding: var(--space-5);
    background: var(--color-surface-soft);
    border: var(--border-window);
    box-shadow: var(--shadow-hard-low);
  }

  .dash {
    @include blue-dash;

    margin-bottom: var(--space-4);
  }

  .quote {
    margin: 0;
    font-family: var(--font-sans);
    font-style: normal;
    font-size: var(--type-base);
    line-height: 1.5;
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
    font-weight: 600;
    font-size: var(--type-small);
    letter-spacing: 0.04em;
  }

  .meta {
    margin-top: var(--space-2);
    color: var(--color-muted);
    font-family: var(--font-mono);
    font-style: normal;
    font-size: var(--type-small);
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
