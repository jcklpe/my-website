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
    position: relative;
    overflow: hidden;
    background: var(--color-charcoal);
    color: var(--color-surface);
    clip-path: polygon(0 0, 100% 5vw, 100% 100%, 0 100%);
    margin-top: -5vw;
  }

  .side-projects-link::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(38, 87, 235, 0.22), rgba(0, 0, 0, 0.4)),
      repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0 1px, transparent 1px 5rem);
  }

  .link {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(12rem, 0.6fr) minmax(0, 1.4fr);
    gap: var(--space-6);
    align-items: end;
    min-height: 30rem;
    padding: calc(var(--space-8) + 5vw) var(--space-6) var(--space-8);
    color: inherit;
    text-decoration: none;
  }

  .eyebrow {
    grid-column: 2;
    margin: 0;
    font-size: var(--type-small);
    font-style: italic;
    letter-spacing: 0;
    text-transform: uppercase;
    text-align: right;
    width: fit-content;
    margin-left: auto;
    padding: 0.1em 0.35em;
    background: var(--color-notice);
    color: var(--color-black);
    font-weight: 700;
  }

  .title {
    grid-column: 2;
    max-width: 14ch;
    margin: 0;
    margin-left: auto;
    padding: 0.04em 0.2em 0.12em;
    background: var(--color-black);
    box-shadow: var(--shadow-label);
    font-family: var(--font-display);
    color: var(--color-surface);
    font-size: 3rem;
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
    @include rich-link;
    color: var(--color-surface);
    transition:
      background-size 200ms var(--motion-snappy),
      color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    @include rich-link-hover;
    transform: translateX(-0.35rem);
  }

  @include breakpoint(phone) {
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
      font-size: 2.35rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }
  }
</style>
