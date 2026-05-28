<template>
  <section id="side-projects" class="side-projects-link themed dark">
    <NuxtLink class="link" to="/side-projects">
      <p class="eyebrow">Side projects ✷ the workbench</p>
      <h2 class="title">Experiments, prototypes, and smaller builds.</h2>
      <span class="cta">Open the workbench&nbsp;→</span>
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
  .side-projects-link {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--color-surface);
    color: var(--color-ink);
  }

  .link {
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(20rem, 34vw, 32rem);
    padding: var(--space-9) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 500;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-align: right;
    color: var(--color-muted);
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: var(--space-4) 0 0;
    margin-left: auto;
    font-family: var(--font-display);
    color: var(--color-ink);
    font-size: clamp(2rem, 5vw, 4rem);
    font-weight: 400;
    line-height: 0.92;
    letter-spacing: -0.03em;
    text-wrap: balance;
    text-align: right;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    padding-right: var(--space-3);
    font-family: var(--font-serif);
    font-size: var(--type-large);
    font-style: italic;
    color: var(--color-ink-80);
    text-decoration: none;
    background-image: linear-gradient(var(--color-ink), var(--color-ink));
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
    transform: translateX(0.35rem);
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
