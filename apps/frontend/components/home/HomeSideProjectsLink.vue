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
    background:
      linear-gradient(90deg, rgba(255, 255, 255, 0.12) 1px, transparent 1px),
      linear-gradient(180deg, var(--color-accent), var(--color-primary-heavy));
    background-size:
      28px 28px,
      auto;
    color: white;
  }

  .link {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(12rem, 0.6fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(18rem, 32vw, 30rem);
    padding: var(--space-8) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 1 / -1;
    margin: 0;
    font-size: var(--type-step--1);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
  }

  .title {
    max-width: 14ch;
    margin: 0;
    font-family: var(--font-serif);
    font-size: clamp(3rem, 8vw, 8rem);
    line-height: 0.88;
    letter-spacing: -0.07em;
    text-wrap: balance;
  }

  .cta {
    justify-self: end;
    align-self: end;
    border-bottom: 0.18em solid currentColor;
    font-size: var(--type-step-1);
    font-style: italic;
    transition:
      transform 220ms var(--motion-snappy),
      border-color 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    border-color: var(--color-ink);
    transform: translateX(0.35rem);
  }

  @media (max-width: 720px) {
    .side-projects-link {
      margin-inline: calc(var(--space-4) * -1);
    }

    .link {
      grid-template-columns: 1fr;
      min-height: 20rem;
      padding-inline: var(--space-4);
    }

    .cta {
      justify-self: start;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }
  }
</style>
