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
    background: var(--texture-terminal-scanline);
    color: white;
    border-block: var(--border-window);
  }

  .link {
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: clamp(18rem, 32vw, 30rem);
    padding: var(--space-8) var(--space-6);
    color: inherit;
    text-decoration: none;
  }

  .link:focus-visible {
    outline-offset: -0.35rem;
  }

  /* Abstract generative diagram — crosshatch dot matrix, not a business graph */
  .link::after {
    content: '';
    position: absolute;
    right: var(--space-6);
    bottom: var(--space-6);
    width: min(36vw, 24rem);
    height: min(18vw, 12rem);
    border: 1px solid color-mix(in srgb, var(--color-terminal) 48%, transparent);
    background:
      repeating-linear-gradient(
        45deg,
        color-mix(in srgb, var(--color-terminal) 40%, transparent) 0 1px,
        transparent 1px 14px
      ),
      repeating-linear-gradient(
        -45deg,
        color-mix(in srgb, var(--color-terminal) 24%, transparent) 0 1px,
        transparent 1px 14px
      );
    opacity: 0.72;
  }

  .eyebrow {
    grid-column: 2;
    position: relative;
    z-index: 1;
    margin: 0;
    font-size: var(--type-small);
    font-family: var(--font-mono);
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    text-align: right;
    color: var(--color-terminal);
  }

  .title {
    grid-column: 2;
    position: relative;
    z-index: 1;
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
    position: relative;
    z-index: 1;
    justify-self: end;
    align-self: end;
    padding: var(--space-2) var(--space-3);
    border: 1px solid color-mix(in srgb, var(--color-terminal) 64%, transparent);
    background: color-mix(in srgb, var(--color-ink) 72%, transparent);
    font-size: var(--type-large);
    font-family: var(--font-mono);
    color: color-mix(in srgb, var(--color-terminal) 82%, white);
    text-decoration: none;
    transition:
      color 200ms var(--motion-snappy),
      border-color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    border-color: var(--color-terminal);
    color: var(--color-surface);
    transform: translateX(-0.35rem);
  }

  @include breakpoint(phone) {
    .side-projects-link {
      margin-inline: calc(var(--space-3) * -1); // match .home-page phone padding-inline exactly (space-4 bled 4px past the viewport)
    }

    .link {
      grid-template-columns: 1fr;
      min-height: 20rem;
      padding-inline: var(--space-4);
    }

    .link::after {
      right: var(--space-4);
      width: 70vw;
      height: 10rem;
      opacity: 0.45;
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
