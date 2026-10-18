<script setup lang="ts">
  import {
    sneakersAlphabet,
    sneakersColorFrames,
  } from '~/utils/sneakers-colors';

  const isOpen = ref(false);
  const badgeElement = ref<HTMLElement | null>(null);
  const triggerElement = ref<HTMLButtonElement | null>(null);
  const route = useRoute();
  const titleWords = 'Bottom Line Up Front.'.split(' ');
  const explanationWords =
    'The big picture first, then the details. Explain what matters and how the parts fit together. Be clear and direct.'.split(
      ' ',
    );
  const links = [
    { label: 'Selected work', href: '#selected-work' },
    { label: 'Collaborators', href: '#collaborators' },
    { label: 'Side projects', href: '#side-projects' },
    { label: 'Latest writing', href: '#latest-writing' },
  ];
  const closedClip = 'inset(-8px -8px 100% -8px)';
  const openClip = 'inset(-8px)';
  type Glyph = {
    element: HTMLElement;
    text: string;
    startsAt: number;
    settlesAt: number;
  };
  let entrance: {
    panel: HTMLElement;
    animations: Animation[];
    glyphs: Glyph[];
    timer: number;
    done: () => void;
  } | null = null;
  let exitAnimation: Animation | null = null;
  let motionPreference: MediaQueryList | null = null;

  function reducedMotion() {
    return motionPreference?.matches ?? false;
  }

  function updateMotionPreference() {
    if (!reducedMotion()) return;
    finishEntrance();
    exitAnimation?.cancel();
  }

  function closeMenu(restoreFocus = false) {
    isOpen.value = false;
    if (restoreFocus) triggerElement.value?.focus();
  }

  function dismissOutside(event: MouseEvent) {
    if (
      isOpen.value &&
      event.target instanceof Node &&
      !badgeElement.value?.contains(event.target)
    )
      closeMenu();
  }

  function dismissWithEscape(event: KeyboardEvent) {
    if (!isOpen.value || event.key !== 'Escape') return;
    event.preventDefault();
    closeMenu(true);
  }

  function finishEntrance() {
    const current = entrance;
    if (!current) return;
    entrance = null;
    window.clearInterval(current.timer);
    current.glyphs.forEach(({ element, text }) => {
      element.textContent = text;
    });
    current.panel.style.removeProperty('clip-path');
    current.animations.forEach((animation) => animation.cancel());
    current.done();
  }

  function preparePanel(element: Element) {
    (element as HTMLElement).style.clipPath = closedClip;
  }

  function enterPanel(element: Element, done: () => void) {
    finishEntrance();
    exitAnimation?.cancel();
    const panel = element as HTMLElement;
    if (reducedMotion()) {
      panel.style.removeProperty('clip-path');
      done();
      return;
    }
    const current = {
      panel,
      animations: [] as Animation[],
      glyphs: [] as Glyph[],
      timer: 0,
      done,
    };
    entrance = current;
    const ease =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--snappy-ease-out')
        .trim() || 'cubic-bezier(0.2, 0.85, 0.32, 1)';
    const lineTops: number[] = [];
    // Word slots preserve native wrapping. Words on the same measured line share one entrance clock and a stationary bottom slit.
    const words = Array.from(
      panel.querySelectorAll<HTMLElement>('.word-clip'),
    ).map((clip) => {
      const top = clip.getBoundingClientRect().top;
      let line = lineTops.findIndex((value) => Math.abs(value - top) < 1);
      if (line === -1) {
        line = lineTops.length;
        lineTops.push(top);
      }
      return { ink: clip.firstElementChild as HTMLElement, line };
    });
    current.animations.push(
      panel.animate([{ clipPath: closedClip }, { clipPath: openClip }], {
        duration: 220,
        easing: ease,
        fill: 'both',
      }),
    );
    words.forEach(({ ink, line }) => {
      current.animations.push(
        ink.animate(
          [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }],
          { duration: 300, delay: 260 + line * 55, easing: ease, fill: 'both' },
        ),
      );
    });
    const linkStart = 260 + (lineTops.length - 1) * 55 + 140;
    panel.querySelectorAll<HTMLElement>('li').forEach((row, rowIndex) => {
      const rowDelay = linkStart + rowIndex * 70;
      current.animations.push(
        row.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 140,
          delay: rowDelay,
          fill: 'both',
        }),
      );
      const restingColor = getComputedStyle(row.querySelector('a')!).color;
      row.querySelectorAll<HTMLElement>('.glyph').forEach((glyph, index) => {
        const startsAt = rowDelay + index * 12;
        const text = glyph.textContent ?? '';
        current.glyphs.push({
          element: glyph,
          text,
          startsAt,
          settlesAt: startsAt + 420,
        });
        current.animations.push(
          glyph.animate(sneakersColorFrames(restingColor), {
            duration: 420,
            delay: startsAt,
            fill: 'both',
          }),
        );
      });
    });
    const started = performance.now();
    const scramble = () => {
      const elapsed = performance.now() - started;
      current.glyphs.forEach(
        ({ element: glyph, text, startsAt, settlesAt }) => {
          if (/\s/u.test(text) || elapsed >= settlesAt)
            glyph.textContent = text;
          else if (elapsed >= startsAt)
            glyph.textContent =
              sneakersAlphabet[
                Math.floor(Math.random() * sneakersAlphabet.length)
              ]!;
        },
      );
    };
    current.timer = window.setInterval(scramble, 50);
    Promise.all(
      current.animations.map((animation) =>
        animation.finished.catch(() => undefined),
      ),
    ).then(() => {
      if (entrance === current) finishEntrance();
    });
  }

  function leavePanel(element: Element, done: () => void) {
    const panel = element as HTMLElement;
    const currentClip = getComputedStyle(panel).clipPath;
    finishEntrance();
    if (reducedMotion()) {
      done();
      return;
    }
    const animation = panel.animate(
      [
        { clipPath: currentClip === 'none' ? openClip : currentClip },
        { clipPath: closedClip },
      ],
      { duration: 160, easing: 'ease-in', fill: 'both' },
    );
    exitAnimation = animation;
    animation.finished
      .catch(() => undefined)
      .then(() => {
        if (exitAnimation === animation) exitAnimation = null;
        done();
      });
  }

  watch(
    () => route.fullPath,
    () => closeMenu(),
  );
  onMounted(() => {
    motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionPreference.addEventListener('change', updateMotionPreference);
    document.addEventListener('click', dismissOutside, true);
    document.addEventListener('keydown', dismissWithEscape);
    window.addEventListener('resize', finishEntrance);
  });
  onBeforeUnmount(() => {
    finishEntrance();
    exitAnimation?.cancel();
    motionPreference?.removeEventListener('change', updateMotionPreference);
    document.removeEventListener('click', dismissOutside, true);
    document.removeEventListener('keydown', dismissWithEscape);
    window.removeEventListener('resize', finishEntrance);
  });
</script>

<template>
  <div ref="badgeElement" class="badge" :class="{ 'is-open': isOpen }">
    <button
      ref="triggerElement"
      class="trigger"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="home-bluf-panel"
      @click="isOpen = !isOpen"
    >
      <span class="kicker">B.L.U.F.</span>
      <span class="star" aria-hidden="true">✦</span>
    </button>
    <Transition
      :css="false"
      @before-enter="preparePanel"
      @enter="enterPanel"
      @enter-cancelled="finishEntrance"
      @leave="leavePanel"
    >
      <div v-if="isOpen" id="home-bluf-panel" class="panel">
        <p class="definition">
          <template v-for="(word, index) in titleWords" :key="index"
            ><span class="word-clip"
              ><strong class="word">{{ word }}</strong></span
            >{{ ' ' }}</template
          >
        </p>
        <p>
          <template v-for="(word, index) in explanationWords" :key="index"
            ><span class="word-clip"
              ><span class="word">{{ word }}</span></span
            >{{ ' ' }}</template
          >
        </p>
        <nav aria-label="Homepage sections" @focusin="finishEntrance">
          <ul>
            <li v-for="link in links" :key="link.href">
              <a :href="link.href" :aria-label="link.label" @click="closeMenu()"
                ><span aria-hidden="true"
                  ><span
                    v-for="(letter, index) in link.label"
                    :key="index"
                    class="glyph"
                    >{{ letter }}</span
                  ></span
                ></a
              >
            </li>
          </ul>
        </nav>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
  .badge {
    color: var(--color-primary);
  }
  .trigger {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--color-primary);
    border-radius: 999px;
    background: color-mix(in srgb, var(--color-surface) 88%, transparent);
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .trigger:hover,
  .trigger:focus-visible,
  .is-open .trigger {
    color: var(--color-surface);
    background: var(--color-primary);
  }
  .panel {
    position: absolute;
    top: calc(100% + var(--space-2));
    right: 0;
    box-sizing: border-box;
    width: min(24rem, calc(100vw - var(--space-8)));
    padding: var(--space-4);
    border: var(--border-window);
    background: var(--color-surface);
    box-shadow: var(--shadow-hard-low);
    color: var(--color-ink);
    font-family: var(--font-mono);
    font-size: var(--type-small);
    line-height: 1.45;
  }
  p {
    margin: 0;
  }
  p + p {
    margin-top: 0.65em;
  }
  .word-clip {
    display: inline-block;
    overflow: hidden;
    vertical-align: top;
  }
  .word {
    display: block;
  }
  nav {
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--color-primary);
  }
  ul {
    display: grid;
    gap: 0.5rem;
    margin: 0;
    padding-left: 1.2em;
    list-style: disc;
  }
  li::marker {
    color: var(--color-primary);
  }
  a {
    @include rich-link;
  }
  a:hover,
  a:focus-visible {
    @include rich-link-hover;
  }
  .glyph {
    display: inline-block;
    width: 1ch;
    white-space: pre;
  }
  .kicker {
    font-family: var(--font-mono);
    font-size: var(--type-small);
    font-style: italic;
    font-weight: 500;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: inherit;
  }
  .star {
    display: inline-block;
    font-size: 1rem;
    line-height: 1;
    color: inherit;
    transform: scaleX(0.76);
    transform-origin: 50% 52%;
    animation: badge-star 7s linear infinite;
  }
  @keyframes badge-star {
    from {
      transform: rotate(0) scaleX(0.76);
    }
    to {
      transform: rotate(1turn) scaleX(0.76);
    }
  }
  @include breakpoint(phone) {
    .panel {
      width: min(21rem, calc(100vw - var(--space-6)));
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .star {
      animation: none;
    }
    a {
      transition: none;
    }
  }
</style>
