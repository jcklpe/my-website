<script setup lang="ts">
  import type { EmployerTestimonial } from '~/types/wordpress';

  defineProps<{
    testimonials: EmployerTestimonial[];
  }>();

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
  <section v-if="testimonials.length" class="employer-testimonials">
    <div class="inner">
      <div class="heading">
        <p class="eyebrow">Employer notes</p>
        <h2 class="title">Testimonials</h2>
      </div>

      <div class="grid">
        <article
          v-for="(testimonial, index) in testimonials"
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
    background: var(--color-surface);
    color: var(--color-ink);
    border-top: 1px solid var(--color-card-border);
    border-bottom: 1px solid var(--color-card-border);
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
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: 8ch;
    margin: 0;
    font-family: var(--font-serif);
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
    min-height: 14rem;
    border: 1px solid var(--color-card-border);
    border-radius: 0;
    padding: var(--space-5);
    background: var(--color-card-surface);
  }

  .quote {
    margin: 0;
    font-size: var(--type-step-1);
    line-height: 1.35;
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
    font-size: var(--type-step--1);
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

  @media (max-width: 720px) {
    .employer-testimonials {
      margin-inline: calc(var(--space-4) * -1);
    }

    .inner {
      padding-inline: var(--space-4);
    }
  }
</style>
