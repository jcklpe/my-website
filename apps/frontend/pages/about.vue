<script setup lang="ts">
  useSeoMeta({
    title: 'About',
    description:
      'About Aslan French, a design technologist and researcher working across frontend systems, publishing, and experimental interfaces.',
  });
</script>

<template>
  <article class="about-page">
    <header class="hero">
      <p class="eyebrow">About</p>
      <h1 class="title">Design technology, research, and web-shaped craft.</h1>
    </header>

    <div class="body">
      <p>
        I am Aslan French, a design technologist and researcher interested in
        the places where interface craft, publishing systems, and experimental
        tools start to overlap.
      </p>

      <p>
        This site is both portfolio and workshop: a place for selected case
        studies, writing, smaller side projects, and notes about building more
        humane digital systems.
      </p>

      <div class="links" aria-label="About page links">
        <NuxtLink to="/#selected-work">Selected Work</NuxtLink>
        <NuxtLink to="/writing">Writing</NuxtLink>
        <NuxtLink to="/side-projects">Side Projects</NuxtLink>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
  .about-page {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(20rem, 1.1fr);
    gap: var(--space-7);
    min-height: 70vh;
    padding: var(--space-8) var(--space-6) var(--space-7);
  }

  .hero {
    align-self: start;
  }

  .eyebrow {
    margin: 0 0 var(--space-4);
    color: var(--color-primary-heavy);
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: 11ch;
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(3.5rem, 8vw, 8rem);
    line-height: 0.9;
    letter-spacing: -0.07em;
  }

  .body {
    align-self: center;
    max-width: 44rem;
    font-size: var(--type-step-1);
    line-height: 1.55;
  }

  .body p {
    margin: 0;
  }

  .body p + p {
    margin-top: var(--space-5);
  }

  .links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-4);
    margin-top: var(--space-6);
  }

  .links a {
    color: var(--color-ink);
    font-style: italic;
    text-decoration-color: var(--color-primary);
    text-decoration-thickness: 0.16em;
    text-underline-offset: 0.18em;
  }

  @media (max-width: 820px) {
    .about-page {
      grid-template-columns: 1fr;
      padding-inline: var(--space-4);
    }

    .body {
      align-self: start;
    }
  }
</style>
