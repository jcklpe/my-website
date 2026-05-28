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
    padding: var(--space-4);
    background: var(--color-surface-warmer);
    color: var(--color-ink);
    border-top: var(--border-default);
    border-bottom: var(--border-default);
  }

  .link {
    display: grid;
    grid-template-columns: minmax(12rem, 0.4fr) minmax(0, 1fr) auto;
    gap: var(--space-5);
    align-items: end;
    min-height: clamp(14rem, 24vw, 22rem);
    padding: var(--space-5);
    border: var(--border-default);
    border-radius: 0.75rem;
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 1;
    margin: 0;
    font-size: var(--type-small);
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .title {
    grid-column: 2;
    max-width: 20ch;
    margin: 0;
    font-family: var(--font-serif);
    color: var(--color-ink);
    font-size: clamp(2.3rem, 5vw, 5.5rem);
    font-weight: 400;
    line-height: 0.88;
    text-wrap: balance;
  }

  .cta {
    grid-column: 3;
    justify-self: end;
    align-self: end;
    padding-right: 0;
    font-size: var(--type-small);
    font-style: italic;
    color: var(--color-muted);
    text-decoration: none;
    text-transform: uppercase;
    background-image: linear-gradient(currentColor, currentColor);
    background-position: 100% 100%;
    background-repeat: no-repeat;
    background-size: 0% 1px;
    transition:
      background-size 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    color: var(--color-ink);
    background-size: 100% 1px;
    transform: translateX(-0.25rem);
  }

  @include breakpoint(phone) {
    .side-projects-link {
      padding: var(--space-4);
    }

    .link {
      grid-template-columns: 1fr;
      min-height: 18rem;
    }

    .eyebrow,
    .title,
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
