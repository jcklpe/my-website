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
      linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px),
      var(--color-night);
    background-size:
      34px 34px,
      34px 34px,
      auto;
    color: white;
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

  .link::before {
    grid-column: 1;
    grid-row: 1 / span 3;
    align-self: end;
    width: min(18rem, 34vw);
    aspect-ratio: 1;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 50%;
    background:
      linear-gradient(rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.18)) 50%
        0 / 1px 100% no-repeat,
      linear-gradient(
          90deg,
          rgba(255, 255, 255, 0.18),
          rgba(255, 255, 255, 0.18)
        )
        0 50% / 100% 1px no-repeat,
      repeating-radial-gradient(
        circle,
        transparent 0 40%,
        rgba(255, 255, 255, 0.2) 40% 41%,
        transparent 41% 57%
      );
    content: '';
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-align: right;
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-display);
    color: white;
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 0.95;
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
    font-style: italic;
    color: rgba(255, 255, 255, 0.78);
    text-decoration: none;
    background-image: linear-gradient(white, white);
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
    color: white;
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
      display: none;
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
