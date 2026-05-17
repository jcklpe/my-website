<template>
  <section id="side-projects" class="side-projects-link">
    <div class="section-header">
      <div class="section-header-left">
        <span class="section-index" aria-hidden="true">05</span>
        <h2 class="header-title">Side Projects</h2>
      </div>
      <span class="section-marker" aria-hidden="true">+</span>
    </div>
    <NuxtLink class="link" to="/side-projects">
      <p class="descriptor">Experiments, prototypes, and smaller builds.</p>
      <span class="cta">→ Open Side Projects</span>
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
  .side-projects-link {
    margin-inline: calc(var(--space-6) * -1);
    margin-top: var(--space-7);
    background: var(--color-primary);
    color: var(--color-surface);
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-6);
    background: rgba(0, 0, 0, 0.25);
    border-bottom: 1px solid rgba(245, 241, 230, 0.2);
  }

  .section-header-left {
    display: flex;
    align-items: baseline;
    gap: var(--space-4);
  }

  .section-index {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    letter-spacing: 0.1em;
    opacity: 0.6;
  }

  .header-title {
    margin: 0;
    font-family: var(--font-mono);
    font-size: clamp(1.1rem, 2.2vw, 1.6rem);
    font-style: normal;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    line-height: 1;
    color: var(--color-surface);
  }

  .section-marker {
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 400;
    opacity: 0.5;
  }

  .link {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    gap: var(--space-5);
    min-height: clamp(14rem, 24vw, 22rem);
    padding: var(--space-8) var(--space-6);
    color: var(--color-surface);
    text-decoration: none;
  }

  .descriptor {
    margin: 0;
    max-width: 24rem;
    font-family: var(--font-mono);
    font-size: clamp(1.4rem, 3vw, 2.4rem);
    font-weight: 600;
    line-height: 1.1;
    letter-spacing: -0.04em;
    text-wrap: balance;
  }

  .cta {
    font-family: var(--font-mono);
    font-size: var(--type-base);
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(245, 241, 230, 0.75);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    padding-bottom: 0.1em;
    align-self: flex-start;
    transition:
      color 160ms var(--motion-snappy),
      border-color 160ms var(--motion-snappy);
  }

  .link:hover .cta,
  .link:focus-visible .cta {
    color: var(--color-surface);
    border-bottom-color: var(--color-surface);
  }

  @include breakpoint(phone) {
    .side-projects-link {
      margin-inline: calc(var(--space-4) * -1);
    }

    .section-header {
      padding-inline: var(--space-4);
    }

    .link {
      padding-inline: var(--space-4);
      min-height: 18rem;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }
  }
</style>
