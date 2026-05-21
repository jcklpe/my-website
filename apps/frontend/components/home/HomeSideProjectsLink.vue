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
      linear-gradient(90deg, var(--color-primary-heavy) 0 36%, transparent 36%),
      var(--color-pop-coral);
    color: var(--color-pop-cream);
    border-bottom: var(--border-strong);
  }

  .link {
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: 28rem;
    padding: var(--space-8) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    text-align: right;
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-sans);
    color: var(--color-pop-cream);
    font-size: 3rem;
    font-weight: 700;
    line-height: 0.95;
    letter-spacing: 0;
    text-wrap: balance;
    text-align: right;
    text-transform: uppercase;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    border: 2px solid var(--color-pop-cream);
    padding: 0.7rem 0.9rem;
    font-size: var(--type-large);
    font-style: normal;
    font-weight: 700;
    color: var(--color-pop-cream);
    text-decoration: none;
    box-shadow: 0.35rem 0.35rem 0 var(--color-pop-yellow);
    transition:
      color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    background: var(--color-pop-yellow);
    color: var(--color-ink);
    transform: translate(-0.2rem, -0.2rem);
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

    .title {
      font-size: 2.25rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }

    .link:hover .cta,
    .link:focus-visible .cta {
      transform: none;
    }
  }
</style>
