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
    background: var(--color-surface-dark);
    color: white;
    border-top: var(--border-window);
    border-bottom: var(--border-window);
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
    background:
      radial-gradient(
        circle at 16% 22%,
        var(--color-secondary-signal-soft),
        transparent 20rem
      ),
      var(--texture-dark-crosshatch),
      linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px);
    background-size:
      auto,
      min(36vw, 24rem) min(18vw, 12rem),
      min(36vw, 24rem) min(18vw, 12rem),
      5rem 100%;
    background-position:
      0 0,
      var(--space-6) var(--space-6),
      var(--space-6) var(--space-6),
      0 0;
  }

  .link::after {
    content: '';
    grid-column: 1;
    grid-row: 1 / span 3;
    align-self: end;
    width: min(32vw, 22rem);
    height: min(18vw, 12rem);
    border: 1px solid rgba(43, 196, 106, 0.5);
    background:
      radial-gradient(
        circle at 68% 42%,
        var(--color-secondary-signal) 0 0.28rem,
        transparent 0.3rem
      ),
      var(--texture-dark-crosshatch);
    opacity: 0.82;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-align: right;
    color: var(--color-secondary-signal);
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-mono);
    color: var(--color-surface);
    font-size: clamp(1.8rem, 4vw, 3rem);
    line-height: 0.95;
    letter-spacing: -0.035em;
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
    color: rgba(247, 245, 239, 0.82);
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
    color: var(--color-secondary-signal);
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

    .link::after {
      grid-column: 1;
      grid-row: auto;
      width: min(100%, 18rem);
      height: 8rem;
      opacity: 0.52;
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
