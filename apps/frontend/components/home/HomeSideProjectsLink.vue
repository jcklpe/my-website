<template>
  <section id="side-projects" class="side-projects">
    <NuxtLink class="scene" to="/side-projects">
      <!-- sky: moon + sparkles -->
      <svg class="moon" viewBox="0 0 48 48" aria-hidden="true">
        <path
          d="M30 4 a20 20 0 1 0 14 30 A16 16 0 1 1 30 4 Z"
          fill="var(--color-night-ink)"
          opacity="0.9"
        />
      </svg>
      <span class="spark spark-a" aria-hidden="true">✦</span>
      <span class="spark spark-b" aria-hidden="true">✧</span>
      <span class="spark spark-c" aria-hidden="true">✦</span>

      <div class="copy">
        <p class="eyebrow">Side Projects · after dark</p>
        <h2 class="title">Experiments, prototypes &amp; smaller builds.</h2>
        <span class="cta"
          >Open Side Projects <span aria-hidden="true">→</span></span
        >
      </div>

      <!-- horizon: distant mesa + a saguaro rising from the ground line -->
      <div class="horizon">
        <svg
          class="scene-art"
          viewBox="0 0 1200 220"
          preserveAspectRatio="xMidYMax meet"
          role="img"
          aria-label="A saguaro cactus rising from the desert horizon at night"
        >
          <defs>
            <linearGradient id="sp-cactus" x1="0" y1="1" x2="0.2" y2="0">
              <stop offset="0%" stop-color="var(--color-spectrum-red)" />
              <stop offset="38%" stop-color="var(--color-spectrum-amber)" />
              <stop offset="66%" stop-color="var(--color-spectrum-gold)" />
              <stop offset="100%" stop-color="var(--color-spectrum-green)" />
            </linearGradient>
          </defs>
          <!-- distant mesa silhouette -->
          <path
            class="mesa"
            d="M0 210 L0 150 L120 150 L150 120 L340 120 L370 150 L760 150 L800 96 L1000 96 L1040 150 L1200 150 L1200 210 Z"
          />
          <!-- horizon line -->
          <line class="horizon-line" x1="0" y1="186" x2="1200" y2="186" />
          <!-- saguaro rising from the horizon, right of center -->
          <g class="saguaro">
            <line x1="820" y1="186" x2="820" y2="70" />
            <path d="M820 120 C820 96 792 96 792 120 L792 150" fill="none" />
            <path d="M820 134 C820 110 850 110 850 134 L850 158" fill="none" />
          </g>
          <!-- scattered ground stones -->
          <g class="stones">
            <circle cx="360" cy="200" r="3" />
            <circle cx="980" cy="202" r="3" />
            <circle cx="600" cy="198" r="2.5" />
          </g>
        </svg>
      </div>
    </NuxtLink>
  </section>
</template>

<style lang="scss" scoped>
  // The "night desert" — a composed scene, not a band. Sky (moon, stars, copy)
  // sits above a horizon from which a gradient-monoline saguaro rises. The
  // spectrum gradient runs free here; this is the page's psychedelic peak.
  .side-projects {
    margin-inline: calc(var(--space-6) * -1);
    background: var(--texture-night-field);
    background-size: var(--texture-night-field-size);
    color: var(--color-night-ink);
    border-block: 1px solid var(--color-night-warm);
  }

  .scene {
    position: relative;
    display: block;
    min-height: clamp(26rem, 42vw, 40rem);
    padding: var(--space-8) var(--space-7) 0;
    color: inherit;
    text-decoration: none;
    overflow: hidden;
  }

  .moon {
    position: absolute;
    top: var(--space-7);
    right: clamp(var(--space-6), 12vw, 14rem);
    width: clamp(2.5rem, 4vw, 3.5rem);
    height: auto;
  }

  .spark {
    position: absolute;
    color: var(--color-spectrum-gold);
    line-height: 1;
    user-select: none;
  }

  .spark-a {
    top: 22%;
    right: 18%;
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .spark-b {
    top: 38%;
    right: 30%;
    font-size: 0.8rem;
    opacity: 0.7;
    color: var(--color-night-ink);
  }

  .spark-c {
    top: 14%;
    left: 12%;
    font-size: 0.9rem;
    opacity: 0.75;
    color: var(--color-night-ink);
  }

  .copy {
    position: relative;
    z-index: 2;
    max-width: 34rem;
  }

  .eyebrow {
    margin: 0 0 var(--space-3);
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-variant: small-caps;
    font-size: var(--type-small);
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: lowercase;
    color: var(--color-ochre);
  }

  .title {
    max-width: 16ch;
    margin: 0;
    font-family: var(--font-display);
    font-optical-sizing: auto;
    font-weight: 460;
    font-size: clamp(1.9rem, 4vw, 3.25rem);
    line-height: 1.02;
    letter-spacing: -0.01em;
    text-wrap: balance;
    color: var(--color-night-ink);

    @include display-character($opsz: 144, $soft: 60, $wonk: 1);
  }

  .cta {
    display: inline-flex;
    align-items: center;
    gap: 0.4em;
    margin-top: var(--space-5);
    font-family: var(--font-sans);
    font-size: var(--type-large);
    font-weight: 500;
    color: var(--color-ochre);
    border-bottom: 1px solid transparent;
    transition:
      color 200ms var(--motion-snappy),
      border-color 200ms var(--motion-snappy),
      transform 220ms var(--motion-snappy);
  }

  // Horizon scene anchored to the bottom, full-bleed.
  .horizon {
    position: absolute;
    inset: auto 0 0;
    z-index: 1;
    pointer-events: none;
  }

  .scene-art {
    display: block;
    width: 100%;
    height: auto;
  }

  .mesa {
    fill: var(--color-night-warm);
    stroke: none;
    opacity: 0.7;
  }

  .horizon-line {
    stroke: var(--color-ochre);
    stroke-width: 1.5;
    opacity: 0.55;
  }

  .saguaro line,
  .saguaro path {
    fill: none;
    stroke: url(#sp-cactus);
    stroke-width: 6;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .stones circle {
    fill: var(--color-ochre);
    opacity: 0.5;
  }

  .link:hover .cta,
  .scene:hover .cta,
  .scene:focus-visible .cta {
    color: var(--color-night-ink);
    border-bottom-color: var(--color-ochre);
    transform: translateX(0.25rem);
  }

  @include breakpoint(phone) {
    .side-projects {
      margin-inline: calc(var(--space-4) * -1);
    }

    .scene {
      min-height: 24rem;
      padding: var(--space-7) var(--space-4) 0;
    }

    .moon {
      right: var(--space-5);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cta {
      transition: none;
    }
  }
</style>
