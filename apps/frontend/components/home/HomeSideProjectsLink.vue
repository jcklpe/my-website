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
      linear-gradient(rgba(21, 21, 34, 0.88), rgba(21, 21, 34, 0.88)),
      radial-gradient(circle at 82% 20%, rgba(216, 77, 57, 0.28), transparent 14rem),
      var(--color-night);
    color: var(--color-surface);
  }

  .link {
    position: relative;
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(18rem, 32vw, 30rem);
    padding: var(--space-8) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .link::before {
    content: '';
    grid-column: 1;
    grid-row: 1 / span 3;
    align-self: end;
    width: min(16rem, 42vw);
    aspect-ratio: 1;
    border: 1px solid rgba(185, 130, 51, 0.62);
    border-radius: 999px;
    background:
      linear-gradient(90deg, transparent 49%, rgba(185, 130, 51, 0.5) 49% 51%, transparent 51%),
      linear-gradient(0deg, transparent 49%, rgba(185, 130, 51, 0.5) 49% 51%, transparent 51%);
    opacity: 0.72;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0;
    text-transform: uppercase;
    text-align: right;
    color: var(--color-copper);
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-serif);
    color: var(--color-surface);
    font-size: 3rem;
    line-height: 1;
    letter-spacing: 0;
    text-wrap: balance;
    text-align: right;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    padding-right: var(--space-3);
    font-size: var(--type-large);
    font-family: var(--font-mono);
    color: rgba(247, 240, 227, 0.78);
    text-decoration: none;
    background-image: linear-gradient(var(--color-copper), var(--color-copper));
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
    color: var(--color-surface);
    background-size: 100% 1px;
    transform: translateX(-0.35rem);
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

    .link::before {
      grid-row: 1;
      width: 9rem;
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
