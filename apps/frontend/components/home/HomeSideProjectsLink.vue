<template>
  <section id="side-projects" class="side-projects-link">
    <NuxtLink class="link" to="/side-projects">
      <p class="eyebrow">Side projects</p>
      <h2 class="title">Experiments, prototypes, and smaller builds.</h2>
      <span class="cta"
        >Open side projects <span aria-hidden="true">→</span></span
      >
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
  // Side Projects is the green moment of the site — dark surface with a
  // quiet terminal-green scanline texture. Honest CTA, no "Lab Terminal" or
  // other BTAK chrome.
  .side-projects-link {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--texture-terminal-scanline);
    color: var(--color-surface);
    border-block: 1px solid var(--color-accent-green-heavy);
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
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--color-accent-green);
    text-align: right;
  }

  .title {
    grid-column: 2;
    max-width: 18ch;
    margin: var(--space-3) 0 0;
    margin-left: auto;
    font-family: var(--font-mono);
    font-style: normal;
    font-weight: 600;
    color: var(--color-surface);
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 1;
    letter-spacing: -0.025em;
    text-wrap: balance;
    text-align: right;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    margin-top: var(--space-5);
    padding: 0.5em 0;
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-accent-green);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition:
      color 180ms var(--motion-snappy),
      border-color 180ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    color: var(--color-surface);
    border-bottom-color: var(--color-accent-green);
    transform: translateX(-0.25rem);
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
