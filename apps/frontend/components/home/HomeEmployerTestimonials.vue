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
        <p class="eyebrow">From collaborators</p>
        <h2 class="title">Word of Mouth</h2>
      </div>

      <div class="grid">
        <article
          v-for="(testimonial, index) in displayTestimonials"
          :key="testimonialKey(testimonial, index)"
          class="testimonial"
        >
          <span class="quote-mark" aria-hidden="true">“</span>
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
  // Warm band with a sticky display heading and a grid of framed-print
  // testimonial cards. The section title was "Employer notes / Testimonials";
  // reframed to "From collaborators / Word of Mouth" so it reads as peers, not
  // an employee's reference letters.
  // Stratum: golden-hour dusk — the warmest, most saturated band, just before
  // the page drops into the night-desert Side Projects below it.
  .employer-testimonials {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-stratum-dusk);
    color: var(--color-ink);
  }

  .inner {
    display: grid;
    grid-template-columns: minmax(10rem, 0.3fr) minmax(0, 1fr);
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
    @include kicker;
  }

  .title {
    max-width: 9ch;
    margin: 0;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-size: clamp(2rem, 4vw, 3.25rem);
    line-height: 0.98;
    letter-spacing: -0.01em;
    color: var(--color-ink);

    @include display-character($opsz: 110, $soft: 60, $wonk: 1);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  // Framed print: thin warm border, soft surface, gentle print shadow.
  .testimonial {
    position: relative;
    display: flex;
    flex-direction: column;
    min-height: 14rem;
    padding: var(--space-6) var(--space-5) var(--space-5);
    background: var(--color-surface-soft);
    border: var(--border-frame);
    box-shadow: var(--shadow-print);
  }

  .quote-mark {
    font-family: var(--font-display);
    font-size: 3rem;
    line-height: 0.6;
    color: var(--color-primary);
    opacity: 0.5;
  }

  // Quote in warm display italic — an editorial pull-quote voice.
  .quote {
    margin: var(--space-2) 0 0;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-style: italic;
    font-weight: 400;
    font-size: var(--type-large);
    line-height: 1.4;
    color: var(--color-ink);
  }

  .credit {
    margin-top: auto;
    padding-top: var(--space-5);
  }

  .name,
  .meta {
    margin: 0;
  }

  .name {
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-variant: small-caps;
    font-weight: 600;
    font-size: var(--type-large);
    letter-spacing: 0.04em;
    color: var(--color-ink);
  }

  .meta {
    margin-top: var(--space-2);
    @include micro-label;
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
