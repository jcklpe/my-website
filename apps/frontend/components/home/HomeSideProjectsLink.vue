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
    margin-inline: calc(var(--space-6) * -1);
    background:
      radial-gradient(
        70% 90% at 88% 0%,
        rgba(0, 176, 255, 0.16) 0%,
        transparent 55%
      ),
      radial-gradient(
        60% 80% at 8% 100%,
        rgba(38, 87, 235, 0.18) 0%,
        transparent 55%
      ),
      var(--color-moss);
    color: var(--color-ink);
    border-block: 2px solid var(--color-primary);
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
    color: var(--color-primary);
    text-align: right;
    @include specimen-label;
  }

  .title {
    grid-column: 2;
    margin: 0;
    margin-left: auto;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: clamp(1.9rem, 4vw, 3.1rem);
    line-height: 1.4;
    letter-spacing: 0.01em;
    text-transform: uppercase;
    text-wrap: balance;
    text-align: right;
    @include marker-box;
  }

  .cta {
    grid-column: 2;
    justify-self: end;
    align-self: end;
    padding-right: var(--space-3);
    font-size: var(--type-large);
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
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
