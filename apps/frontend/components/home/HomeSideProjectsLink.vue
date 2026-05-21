<template>
  <section id="side-projects" class="side-projects-link">
    <NuxtLink class="link" to="/side-projects">
      <p class="eyebrow">Side Projects</p>
      <h2 class="title">Experiments, prototypes, and smaller builds.</h2>
      <span class="cta">Open Side Projects</span>
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
  .side-projects-link {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-night);
    color: var(--color-night-ink);
  }

  .link {
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(18rem, 32vw, 30rem);
    padding: var(--space-8) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.32em;
    text-transform: uppercase;
    color: var(--color-night-muted);
    text-align: right;
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-display);
    color: var(--color-night-ink);
    font-size: clamp(1.8rem, 4vw, 3.2rem);
    font-style: normal;
    font-weight: 500;
    line-height: 1.05;
    letter-spacing: 0.01em;
    text-wrap: balance;
    text-align: right;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    font-family: var(--font-sans);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 400;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--color-gold);
    text-decoration: none;
    background-image: linear-gradient(var(--color-gold), var(--color-gold));
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition:
      background-size 240ms var(--motion-snappy),
      color 240ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    color: var(--color-gold);
    background-size: 100% 1px;
  }

  @include breakpoint(phone) {
    .side-projects-link {
      margin-inline: calc(var(--space-4) * -1);
    }

    .link {
      grid-template-columns: 1fr;
      min-height: 20rem;
      padding-inline: var(--space-4);
    }

    .eyebrow,
    .title {
      grid-column: 1;
      text-align: left;
      margin-left: 0;
    }

    .cta {
      grid-column: 1;
      justify-self: start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }
  }
</style>
