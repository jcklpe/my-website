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
      linear-gradient(var(--color-primary-tint) 1px, transparent 1px),
      linear-gradient(90deg, var(--color-primary-tint) 1px, transparent 1px),
      var(--color-ink);
    background-size:
      2rem 2rem,
      2rem 2rem,
      auto;
    color: var(--color-surface);
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
    border-block: var(--border-strong);
    box-shadow: inset 0 0 0 1px var(--color-primary);
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-style: normal;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-align: right;
    color: var(--color-primary);
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-mono);
    color: var(--color-surface);
    font-size: 2.8rem;
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
    padding: var(--space-3) var(--space-4);
    border: 1px solid var(--color-primary);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: normal;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--color-surface);
    text-decoration: none;
    background-image: linear-gradient(var(--color-primary), var(--color-primary));
    background-position: 0% 100%;
    background-repeat: no-repeat;
    background-size: 0% 100%;
    transition:
      background-size 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    color: var(--color-surface);
    background-size: 100% 100%;
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

    .title {
      font-size: 2rem;
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
