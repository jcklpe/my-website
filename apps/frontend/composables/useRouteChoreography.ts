import {
  animateRouteImageDissolve,
  prepareRouteImageDissolve,
} from '~/utils/route-image-dissolve';
import { sneakersAlphabet, sneakersColors } from '~/utils/sneakers-colors';
import { distortRouteCrt } from '~/utils/route-crt-distortion';
import { prepareLifeFieldHandoff } from '~/utils/life-field';
import {
  beginLifeCrtWarmup,
  crtEntryProgress,
  disposeLifeCrt,
  mirrorLifeCrt,
} from '~/utils/life-crt';

type RouteMotionPage = string;
type RouteMotionUnit = {
  element: HTMLElement;
  offset: string;
  delay: number;
};

export function useRouteChoreographyState() {
  return useState('route-choreography', () => ({
    active: false,
    hideDestination: false,
    from: '',
    to: '',
  }));
}

export function hasRouteChoreography(from: string, to: string) {
  const supported = (path: string) =>
    ['/', '/about', '/writing', '/now', '/side-projects'].includes(path) ||
    /^\/(writing|case-studies)\/[^/]+\/?$/.test(path);
  return from !== to && supported(from) && supported(to);
}

export function useRouteChoreography() {
  const { rainbow, ditherPattern, grain } = useSideProjectsPreview();
  const state = useRouteChoreographyState();
  const animations = new Set<Animation>();
  const decryptions: Promise<void>[] = [];
  const restorations: Array<() => void> = [];
  const positions = new Map<string, number>();
  let generation = 0;
  let sideProjectsPlane: HTMLElement | null = null;
  let sideProjectsCrtFrame = 0;

  function disposeSideProjectsScreens() {
    cancelAnimationFrame(sideProjectsCrtFrame);
    sideProjectsCrtFrame = 0;
    sideProjectsPlane?.querySelectorAll('canvas').forEach(disposeLifeCrt);
  }

  async function expandSideProjects() {
    const source = document.querySelector<HTMLElement>(
      '.home-page #side-projects',
    );
    if (!source || !visible(source)) return;
    const rect = source.getBoundingClientRect();
    const plane = source.cloneNode(true) as HTMLElement;
    plane.removeAttribute('id');
    plane.dataset.sideProjectsPlane = '';
    plane.setAttribute('aria-hidden', 'true');
    plane.inert = true;
    plane
      .querySelectorAll('[id]')
      .forEach((element) => element.removeAttribute('id'));
    Object.assign(plane.style, {
      position: 'fixed',
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      margin: '0',
      boxSizing: 'border-box',
      overflow: 'hidden',
      zIndex: 'var(--z-higher)',
      pointerEvents: 'none',
    });
    const link = plane.querySelector<HTMLElement>('.link')!;
    Object.assign(link.style, {
      height: '100%',
      minHeight: '0',
      boxSizing: 'border-box',
    });
    const originals = source.querySelectorAll('canvas');
    const copies = Array.from(plane.querySelectorAll('canvas'));
    copies.forEach((canvas, index) => {
      const original = originals[index];
      if (!original) return;
      canvas.width = original.width;
      canvas.height = original.height;
    });
    document.body.append(plane);
    sideProjectsPlane = plane;
    // Repaint the centered field crop at the panel's actual size; CSS scaling would stretch the cells between frames.
    let screenProgress = -1;
    const copyCells = () => {
      copies.forEach((canvas, index) => {
        const original = originals[index]?.isConnected
          ? originals[index]
          : document.querySelector<HTMLCanvasElement>(
              '.side-projects-page .ambient canvas',
            );
        if (!original?.isConnected || !original.width || !original.height)
          return;
        mirrorLifeCrt(canvas, original, screenProgress);
      });
    };
    copyCells();
    const hasCrt = copies.some(
      (canvas) => canvas.dataset.lifeRenderer === 'webgl',
    );
    const duration = timing('--side-projects-entry-duration');
    const phases = Array.from({ length: 61 }, (_, index) => index / 60);
    const visibility = source.style.visibility;
    source.style.visibility = 'hidden';
    restorations.push(() => {
      source.style.visibility = visibility;
    });
    const easing = getComputedStyle(document.documentElement)
      .getPropertyValue('--snappy-ease-out')
      .trim();
    for (const text of link.querySelectorAll<HTMLElement>(
      '.eyebrow, .title, .cta',
    )) {
      const units = sideProjectsSlits(text, false);
      for (const unit of units) {
        const exit = unit.element.animate(
          [{ transform: 'translateY(0)' }, { transform: unit.offset }],
          {
            duration: featuredMediaTransitionDuration(),
            delay: unit.delay,
            easing,
            fill: 'both',
          },
        );
        animations.add(exit);
      }
    }
    for (const canvas of copies) {
      const opacityProperty = hasCrt ? '--life-opacity' : 'opacity';
      if (hasCrt) canvas.style.opacity = '1';
      const dim = canvas.animate(
        hasCrt
          ? phases.map((phase) => ({
              [opacityProperty]: 0.2 - 0.11 * crtEntryProgress(phase),
              offset: phase,
            }))
          : [{ opacity: 0.2 }, { opacity: 0.09 }],
        {
          duration,
          easing: hasCrt ? 'linear' : easing,
          fill: 'both',
        },
      );
      if (hasCrt) canvas.style.setProperty('--life-opacity', '0.09');
      else canvas.style.opacity = '0.09';
      animations.add(dim);
    }
    if (hasCrt) beginLifeCrtWarmup();
    const expansion = plane.animate(
      phases.map((phase) => {
        const position = crtEntryProgress(phase);
        return {
          offset: phase,
          top: `${rect.top * (1 - position)}px`,
          left: `${rect.left * (1 - position)}px`,
          width: `${rect.width + (innerWidth - rect.width) * position}px`,
          height: `${rect.height + (innerHeight - rect.height) * position}px`,
        };
      }),
      {
        duration,
        easing: 'linear',
        fill: 'both',
      },
    );
    animations.add(expansion);
    // Use the expansion's actual clock so shader ignition, channel lock, and the physical panel stay together, including interrupted flights.
    const paintTube = () => {
      if (sideProjectsPlane !== plane) return;
      screenProgress = Math.min(
        1,
        Number(expansion.currentTime ?? 0) / duration,
      );
      copyCells();
      if (screenProgress < 1)
        sideProjectsCrtFrame = requestAnimationFrame(paintTube);
    };
    sideProjectsCrtFrame = requestAnimationFrame(paintTube);
    await expansion.finished.catch(() => undefined);
    if (sideProjectsPlane !== plane) return;
    cancelAnimationFrame(sideProjectsCrtFrame);
    sideProjectsCrtFrame = 0;
    screenProgress = -1;
    copyCells();
    const paintSettled = () => {
      if (sideProjectsPlane !== plane) return;
      copyCells();
      sideProjectsCrtFrame = requestAnimationFrame(paintSettled);
    };
    sideProjectsCrtFrame = requestAnimationFrame(paintSettled);
    Object.assign(plane.style, {
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100vh',
      borderWidth: '0',
    });
    // The plane survives the page swap. Its text has already exited and must not return when the outgoing effects are cleared.
    link
      .querySelectorAll<HTMLElement>('.eyebrow, .title, .cta')
      .forEach((element) => {
        element.style.visibility = 'hidden';
      });
    expansion.cancel();
    animations.delete(expansion);
  }

  function retainSideProjectsGround() {
    const source = document.querySelector<HTMLCanvasElement>(
      '.side-projects-page .ambient canvas',
    );
    const shell = document.querySelector<HTMLElement>('.site-shell');
    if (!source || !shell) return;
    const plane = document.createElement('div');
    plane.dataset.sideProjectsPlane = '';
    plane.setAttribute('aria-hidden', 'true');
    plane.inert = true;
    Object.assign(plane.style, {
      position: 'fixed',
      top: '0px',
      left: '0px',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      pointerEvents: 'none',
      zIndex: 'var(--z-higher)',
      background: getComputedStyle(shell).background,
    });
    const canvas = document.createElement('canvas');
    canvas.width = source.width;
    canvas.height = source.height;
    Object.assign(canvas.style, {
      width: '100%',
      height: '100%',
    });
    canvas.style.setProperty('--life-opacity', '0.09');
    plane.append(canvas);
    document.body.append(plane);
    sideProjectsPlane = plane;
    mirrorLifeCrt(canvas, source);
    canvas.style.opacity =
      canvas.dataset.lifeRenderer === 'webgl' ? '1' : '0.09';
    const paintTube = () => {
      if (sideProjectsPlane !== plane) return;
      const live = source.isConnected
        ? source
        : document.querySelector<HTMLCanvasElement>(
            '.home-page #side-projects canvas',
          );
      if (live?.width && live.height) mirrorLifeCrt(canvas, live);
      sideProjectsCrtFrame = requestAnimationFrame(paintTube);
    };
    sideProjectsCrtFrame = requestAnimationFrame(paintTube);
  }

  async function contractSideProjects() {
    const plane = sideProjectsPlane;
    const section = document.querySelector<HTMLElement>(
      '.home-page #side-projects',
    );
    if (!plane || !section) return releaseSideProjectsPlane();
    const rect = section.getBoundingClientRect();
    const visibility = section.style.visibility;
    section.style.visibility = 'hidden';
    restorations.push(() => {
      section.style.visibility = visibility;
    });
    const easing = getComputedStyle(document.documentElement)
      .getPropertyValue('--snappy-ease-out')
      .trim();
    const canvas = plane.querySelector('canvas');
    const effects = [
      plane.animate(
        [
          {
            top: '0px',
            left: '0px',
            width: `${innerWidth}px`,
            height: `${innerHeight}px`,
          },
          {
            top: `${rect.top}px`,
            left: `${rect.left}px`,
            width: `${rect.width}px`,
            height: `${rect.height}px`,
          },
        ],
        {
          duration: timing('--side-projects-transition-duration'),
          easing,
          fill: 'both',
        },
      ),
    ];
    if (canvas)
      effects.push(
        canvas.animate(
          canvas.dataset.lifeRenderer === 'webgl'
            ? [{ '--life-opacity': '0.09' }, { '--life-opacity': '0.2' }]
            : [{ opacity: 0.09 }, { opacity: 0.2 }],
          {
            duration: timing('--side-projects-transition-duration'),
            easing,
            fill: 'both',
          },
        ),
      );
    effects.forEach((effect) => animations.add(effect));
    await Promise.all(
      effects.map((effect) => effect.finished.catch(() => undefined)),
    );
    if (sideProjectsPlane !== plane) return;
    // Seat the actual Home surface before revealing its copy, so the section never moves twice.
    const reveals = Array.from(
      section.querySelectorAll<HTMLElement>('.eyebrow, .title, .cta'),
    ).flatMap((text) => {
      const units = sideProjectsSlits(text, true);
      return units.map((unit) => {
        const effect = unit.element.animate(
          [{ transform: unit.offset }, { transform: 'translateY(0)' }],
          {
            duration: featuredMediaTransitionDuration(),
            delay: unit.delay,
            easing,
            fill: 'both',
          },
        );
        animations.add(effect);
        return effect.finished.catch(() => undefined);
      });
    });
    section.style.visibility = visibility;
    await releaseSideProjectsPlane();
    await Promise.all(reveals);
  }

  async function releaseSideProjectsPlane() {
    const plane = sideProjectsPlane;
    if (!plane) return;
    const fade = plane.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: featuredMediaTransitionDuration(),
      fill: 'both',
    });
    animations.add(fade);
    await fade.finished.catch(() => undefined);
    if (sideProjectsPlane === plane) {
      disposeSideProjectsScreens();
      plane.remove();
      sideProjectsPlane = null;
    }
  }
  const sharedText: Array<{
    source: HTMLElement;
    clone: HTMLElement;
    text: string;
    wordIndex: number;
    left: number;
    top: number;
    visibility: string;
  }> = [];
  const sharedDestinations: Array<{
    element: HTMLElement;
    visibility: string;
  }> = [];

  function clearSharedText() {
    for (const item of sharedText.splice(0)) {
      item.clone.remove();
      item.source.style.visibility = item.visibility;
      item.source.removeAttribute('data-route-shared');
    }
    for (const item of sharedDestinations.splice(0)) {
      item.element.style.visibility = item.visibility;
      item.element.removeAttribute('data-route-shared');
    }
  }

  function textWords(element: HTMLElement) {
    const words: Array<{ text: string; rect: DOMRect; parent: HTMLElement }> =
      [];
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (const match of (node.textContent ?? '').matchAll(/\S+/g)) {
        const range = document.createRange();
        range.setStart(node, match.index!);
        range.setEnd(node, match.index! + match[0].length);
        words.push({
          text: match[0],
          rect: range.getBoundingClientRect(),
          parent: node.parentElement!,
        });
      }
    }
    return words;
  }

  function captureNowText(from: string, to: string) {
    if (from !== '/about' || to !== '/now') return;
    const selector = '.about-page .now-body p';
    for (const source of document.querySelectorAll<HTMLElement>(selector)) {
      if (!visible(source)) continue;
      const visibility = source.style.visibility;
      // Word positions preserve the actual wrapping around Now's floated portrait. The same words can then settle into About's different line breaks without a paragraph reflow jump.
      textWords(source).forEach((word, wordIndex) => {
        const clone = document.createElement('span');
        const style = getComputedStyle(word.parent);
        clone.textContent = word.text;
        Object.assign(clone.style, {
          position: 'fixed',
          top: `${word.rect.top}px`,
          left: `${word.rect.left}px`,
          font: style.font,
          letterSpacing: style.letterSpacing,
          color: style.color,
          textDecoration: style.textDecoration,
          whiteSpace: 'pre',
          margin: '0',
          pointerEvents: 'none',
          zIndex: 'var(--z-highest)',
        });
        clone.inert = true;
        clone.setAttribute('aria-hidden', 'true');
        clone.dataset.routeSharedClone = '';
        document.body.append(clone);
        const range = document.createRange();
        range.selectNodeContents(clone);
        clone.style.top = `${word.rect.top + word.rect.top - range.getBoundingClientRect().top}px`;
        sharedText.push({
          source,
          clone,
          text: source.textContent?.trim() ?? '',
          wordIndex,
          left: word.rect.left,
          top: word.rect.top,
          visibility,
        });
      });
      source.style.visibility = 'hidden';
      source.dataset.routeShared = '';
    }
  }

  function moveNowText(path: string) {
    const selector =
      path === '/now' ? '.now-page .body p' : '.about-page .now-body p';
    const destinations = new Map(
      Array.from(document.querySelectorAll<HTMLElement>(selector)).map(
        (element) => [
          element.textContent?.trim() ?? '',
          { element, words: textWords(element) },
        ],
      ),
    );
    for (const [text, destination] of destinations) {
      if (!sharedText.some((item) => item.text === text)) continue;
      sharedDestinations.push({
        element: destination.element,
        visibility: destination.element.style.visibility,
      });
      destination.element.dataset.routeShared = '';
      destination.element.style.visibility = 'hidden';
    }
    return Promise.all(
      sharedText.map(async (item) => {
        const word = destinations.get(item.text)?.words[item.wordIndex];
        if (!word) {
          item.clone.remove();
          return;
        }
        const animation = item.clone.animate(
          [
            { transform: 'translate(0, 0)' },
            {
              transform: `translate(${word.rect.left - item.left}px, ${word.rect.top - item.top}px)`,
            },
          ],
          {
            duration: featuredMediaTransitionDuration(),
            easing: getComputedStyle(document.documentElement)
              .getPropertyValue('--snappy-ease-out')
              .trim(),
            fill: 'both',
          },
        );
        animations.add(animation);
        await animation.finished.catch(() => undefined);
      }),
    );
  }

  function clearEffects() {
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const restore of restorations.splice(0)) restore();
  }

  function reset() {
    generation++;
    clearEffects();
    clearSharedText();
    disposeSideProjectsScreens();
    sideProjectsPlane?.remove();
    sideProjectsPlane = null;
    prepareLifeFieldHandoff(null);
    state.value = { active: false, hideDestination: false, from: '', to: '' };
    sessionStorage.removeItem('route-choreography-active');
  }

  function visible(element: HTMLElement) {
    const rect = homeChoreographyPaintedRect(
      element,
      state.value.hideDestination,
    );
    return rect.width > 0 && rect.bottom > 0 && rect.top < innerHeight;
  }

  // The paragraph remains the stationary clip; its opaque contents move as one unit. Restore the original DOM before Vue removes the outgoing page or after arrival.
  function slit(element: HTMLElement, axis: 'x' | 'y') {
    const inner = document.createElement('span');
    inner.style.display = 'block';
    inner.dataset.routeMotionInk = '';
    const oldClip = element.style.clipPath;
    element.style.clipPath = 'inset(0)';
    while (element.firstChild) inner.append(element.firstChild);
    element.append(inner);
    restorations.push(() => {
      inner.replaceWith(...Array.from(inner.childNodes));
      element.style.clipPath = oldClip;
    });
    return {
      element: inner,
      offset: axis === 'x' ? 'translateX(-105%)' : 'translateY(105%)',
    };
  }

  function lineSlits(
    element: HTMLElement,
    entering: boolean,
    delay = 0,
  ): RouteMotionUnit[] {
    const bounds = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    const lineHeight =
      parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.2;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const lines: Array<{
      range: Range;
      top: number;
      left: number;
      height: number;
    }> = [];
    // Read the actual inline layout, including wrapping around the floated portrait and styled links.
    while (walker.nextNode()) {
      const node = walker.currentNode;
      for (let index = 0; index < (node.textContent?.length ?? 0); index++) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (!rect.width || !rect.height) continue;
        const last = lines.at(-1);
        if (last && Math.abs(last.top - rect.top) < lineHeight / 2) {
          last.range.setEnd(node, index + 1);
          last.left = Math.min(last.left, rect.left);
          last.height = Math.max(last.height, rect.height);
        } else {
          lines.push({
            range,
            top: rect.top,
            left: rect.left,
            height: rect.height,
          });
        }
      }
    }
    if (!lines.length) return [];
    const clips = lines.map((line) => {
      const clip = document.createElement('span');
      clip.setAttribute('aria-hidden', 'true');
      clip.dataset.routeMotionLine = '';
      // Tight display leading can be negative: the glyph box extends beyond its line box. Preserve that offset so the copy lands on the original baseline.
      const leading = (lineHeight - line.height) / 2;
      Object.assign(clip.style, {
        position: 'absolute',
        left: `${line.left - bounds.left}px`,
        top: `${line.top - bounds.top - leading}px`,
        height: `${lineHeight}px`,
        overflow: 'hidden',
        pointerEvents: 'none',
        whiteSpace: 'pre',
        lineHeight: `${lineHeight}px`,
      });
      const ink = document.createElement('span');
      ink.dataset.routeMotionInk = '';
      ink.style.display = 'block';
      let contents: Node = line.range.cloneContents();
      let ancestor = line.range.commonAncestorContainer;
      if (ancestor.nodeType === Node.TEXT_NODE) ancestor = ancestor.parentNode!;
      while (ancestor !== element && element.contains(ancestor)) {
        const wrapper = ancestor.cloneNode(false);
        wrapper.appendChild(contents);
        contents = wrapper;
        ancestor = ancestor.parentNode!;
      }
      ink.append(contents);
      // Decorative copies must not introduce duplicate IDs or keyboard stops.
      ink
        .querySelectorAll<HTMLElement>('[id], a, button, [tabindex]')
        .forEach((copy) => {
          copy.removeAttribute('id');
          copy.setAttribute('tabindex', '-1');
        });
      clip.append(ink);
      return { clip, ink };
    });
    const source = document.createElement('span');
    source.style.opacity = '0';
    while (element.firstChild) source.append(element.firstChild);
    const oldPosition = element.style.position;
    if (style.position === 'static') element.style.position = 'relative';
    element.append(source, ...clips.map(({ clip }) => clip));
    // Inline and block line boxes can round their baselines differently. Seat each copy against the original glyph geometry before animating it.
    clips.forEach(({ clip, ink }, index) => {
      const textWalker = document.createTreeWalker(ink, NodeFilter.SHOW_TEXT);
      while (textWalker.nextNode()) {
        const text = textWalker.currentNode;
        if (!text.textContent?.length) continue;
        const firstGlyph = document.createRange();
        firstGlyph.setStart(text, 0);
        firstGlyph.setEnd(text, 1);
        const correction =
          lines[index]!.top - firstGlyph.getBoundingClientRect().top;
        clip.style.top = `${parseFloat(clip.style.top) + correction}px`;
        break;
      }
    });
    restorations.push(() => {
      clips.forEach(({ clip }) => clip.remove());
      source.replaceWith(...Array.from(source.childNodes));
      element.style.position = oldPosition;
    });
    return clips.map(({ ink }, index) => ({
      element: ink,
      offset: entering ? 'translateY(105%)' : 'translateY(-105%)',
      delay: delay + index * timing('--route-section-stagger'),
    }));
  }

  function sideProjectsSlits(text: HTMLElement, entering: boolean) {
    if (text.matches('.cta')) {
      // The entire button surface must pass through the slit, including its border and padding.
      const bounds = text.getBoundingClientRect();
      const style = getComputedStyle(text);
      const oldStyle = {
        display: text.style.display,
        boxSizing: text.style.boxSizing,
        width: text.style.width,
        height: text.style.height,
      };
      const clip = document.createElement('span');
      clip.dataset.routeMotionSurface = '';
      Object.assign(clip.style, {
        display: 'block',
        position: 'relative',
        overflow: 'hidden',
        gridColumn: style.gridColumn,
        gridRow: style.gridRow,
        justifySelf: style.justifySelf,
        alignSelf: style.alignSelf,
        zIndex: style.zIndex,
        width: `${bounds.width}px`,
        height: `${bounds.height}px`,
      });
      text.before(clip);
      clip.append(text);
      Object.assign(text.style, {
        display: 'block',
        boxSizing: 'border-box',
        width: '100%',
        height: '100%',
      });
      restorations.push(() => {
        clip.replaceWith(text);
        Object.assign(text.style, oldStyle);
      });
      const distance = bounds.height + 2;
      return [
        {
          element: text,
          offset: `translateY(${entering ? distance : -distance}px)`,
          delay: 0,
        },
      ];
    }
    return lineSlits(text, entering).map((unit) => {
      // Tight leading and the title's parallax letters can paint beyond the ink span's own box. Measure their full reach before choosing the travel distance.
      const clip = unit.element.parentElement!.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(unit.element);
      const bounds = [
        unit.element.getBoundingClientRect(),
        range.getBoundingClientRect(),
        ...Array.from(unit.element.querySelectorAll('*'), (child) =>
          child.getBoundingClientRect(),
        ),
      ];
      const top = Math.min(...bounds.map((rect) => rect.top));
      const bottom = Math.max(...bounds.map((rect) => rect.bottom));
      const distance = entering ? clip.bottom - top + 2 : clip.top - bottom - 2;
      return { ...unit, offset: `translateY(${distance}px)` };
    });
  }

  function decryptText(element: HTMLElement) {
    // Only decorative line copies scramble. The original CMS text and links retain their layout and accessible names.
    const duration = 600;
    const glyphs: Array<{
      span: HTMLSpanElement;
      text: string;
      settlesAt: number;
      nextChangeAt: number;
      settled: boolean;
      restingColor: string;
      colorIndex: number;
    }> = [];
    for (const unit of lineSlits(element, true)) {
      const walker = document.createTreeWalker(
        unit.element,
        NodeFilter.SHOW_TEXT,
      );
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      const replacements = nodes.map((node) => {
        const fragment = document.createDocumentFragment();
        let offset = 0;
        for (const character of node.data) {
          const range = document.createRange();
          range.setStart(node, offset);
          offset += character.length;
          range.setEnd(node, offset);
          if (/\s/u.test(character)) {
            fragment.append(character);
            continue;
          }
          const span = document.createElement('span');
          span.style.display = 'inline-block';
          span.style.width = `${range.getBoundingClientRect().width}px`;
          span.style.textAlign = 'center';
          span.textContent = character;
          fragment.append(span);
          glyphs.push({
            span,
            text: character,
            settlesAt: 120 + Math.random() * 480,
            nextChangeAt: 0,
            settled: false,
            restingColor: '',
            colorIndex: Math.floor(Math.random() * sneakersColors.length),
          });
        }
        return { node, fragment };
      });
      replacements.forEach(({ node, fragment }) => node.replaceWith(fragment));
    }
    if (!glyphs.length) return Promise.resolve();
    for (const glyph of glyphs)
      glyph.restingColor = getComputedStyle(glyph.span).color;
    return new Promise<void>((resolve) => {
      // Start together without a spatial stagger; each character changes and locks independently within the original 600ms window.
      const started = Number(
        document.timeline.currentTime ?? performance.now(),
      );
      let timer = 0;
      const finish = () => {
        window.clearInterval(timer);
        glyphs.forEach(({ span, text }) => {
          span.textContent = text;
        });
        resolve();
      };
      const paint = () => {
        const elapsed =
          Number(document.timeline.currentTime ?? performance.now()) - started;
        for (const glyph of glyphs) {
          if (glyph.settled) continue;
          if (elapsed >= glyph.settlesAt) {
            glyph.span.textContent = glyph.text;
            glyph.span.style.color = glyph.restingColor;
            glyph.settled = true;
          } else if (elapsed >= glyph.nextChangeAt) {
            glyph.span.textContent =
              sneakersAlphabet[
                Math.floor(Math.random() * sneakersAlphabet.length)
              ]!;
            glyph.nextChangeAt = elapsed + 45 + Math.random() * 65;
            if (rainbow.value) {
              glyph.span.style.color = sneakersColors[glyph.colorIndex]!;
              glyph.colorIndex = (glyph.colorIndex + 1) % sneakersColors.length;
            } else glyph.span.style.color = glyph.restingColor;
          }
        }
        if (elapsed >= duration) finish();
      };
      timer = window.setInterval(paint, 25);
      restorations.push(finish);
      paint();
    });
  }

  function dissolveImage(
    image: HTMLImageElement,
    entering: boolean,
    delay: number,
  ) {
    const duration = entering ? 600 : featuredMediaTransitionDuration();
    const effect = animateRouteImageDissolve(
      image,
      entering,
      duration,
      delay,
      ditherPattern.value,
      grain.value,
    );
    animations.add(effect.animation);
    restorations.push(effect.dispose);
    return effect.animation.finished.catch(() => undefined);
  }

  function timing(name: string) {
    const raw = getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
    const value = parseFloat(raw) * (raw.endsWith('ms') ? 1 : 1000);
    return Number.isFinite(value) ? value : 0;
  }

  function units(page: RouteMotionPage, entering: boolean): RouteMotionUnit[] {
    const result: RouteMotionUnit[] = [];
    const add = (element: HTMLElement, offset: string, delay = 0) => {
      if (visible(element)) result.push({ element, offset, delay });
    };
    if (page === '/') {
      const home = document.querySelector<HTMLElement>('.home-page');
      const targetPath = entering ? state.value.from : state.value.to;
      const links = Array.from(
        home?.querySelectorAll<HTMLAnchorElement>(`a[href="${targetPath}"]`) ??
          [],
      );
      const focusedLink = links.find((link) => link === document.activeElement);
      const anchor = focusedLink ?? links.find(visible) ?? links[0];
      const sideSection = home?.querySelector<HTMLElement>('#side-projects');
      const pivot =
        state.value.to === '/side-projects' ||
        state.value.from === '/side-projects'
          ? (sideSection?.getBoundingClientRect().top ?? innerHeight / 2)
          : (anchor?.getBoundingClientRect().top ?? innerHeight / 2);
      const sections = Array.from(home?.children ?? []).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          !(sideProjectsPlane && element === sideSection) &&
          visible(element),
      );
      sections.forEach((element, index) => {
        const rect = homeChoreographyPaintedRect(
          element,
          state.value.hideDestination,
        );
        let offset: string;
        if (
          (['/writing', '/side-projects'].includes(state.value.to) &&
            !entering) ||
          (state.value.from === '/side-projects' && entering)
        ) {
          offset =
            rect.top + rect.height / 2 < pivot
              ? `translateY(${-rect.bottom - 32}px)`
              : `translateY(${innerHeight - rect.top + 32}px)`;
        } else {
          const direction = index % 3;
          offset =
            direction === 0
              ? `translateY(${-rect.bottom - 32}px)`
              : direction === 1
                ? `translateX(${innerWidth - rect.left + 32}px)`
                : `translateX(${-rect.right - 32}px)`;
        }
        add(element, offset, index * timing('--route-section-stagger'));
      });
    } else if (page === '/about') {
      const root = document.querySelector<HTMLElement>('.about-page');
      for (const heading of root?.querySelectorAll<HTMLElement>(
        '.hero > *, .now-heading',
      ) ?? []) {
        if (!visible(heading)) continue;
        result.push(...lineSlits(heading, entering));
      }
      for (const paragraph of root?.querySelectorAll<HTMLElement>(
        '.body p, .now-body p',
      ) ?? []) {
        if (
          !visible(paragraph) ||
          paragraph.closest('figure') ||
          paragraph.hasAttribute('data-route-shared')
        )
          continue;
        result.push(
          ...lineSlits(paragraph, entering, timing('--route-text-delay')),
        );
      }
      for (const media of root?.querySelectorAll<HTMLElement>('figure') ?? []) {
        if (media.parentElement?.closest('figure')) continue;
        const rect = homeChoreographyPaintedRect(
          media,
          state.value.hideDestination,
        );
        add(
          media,
          `translateX(${innerWidth - rect.left + 32}px)`,
          timing('--route-media-delay'),
        );
      }
    } else if (page === '/writing') {
      const root = document.querySelector<HTMLElement>('main .archive');
      const rows = Array.from(
        root?.querySelectorAll<HTMLElement>('.row-item') ?? [],
      ).filter(visible);
      for (const heading of root?.querySelectorAll<HTMLElement>(
        '.section-heading > *, .year-header',
      ) ?? []) {
        if (!visible(heading)) continue;
        if (entering) result.push({ ...slit(heading, 'x'), delay: 0 });
        else
          add(
            heading,
            `translateY(${innerHeight - heading.getBoundingClientRect().top + 32}px)`,
          );
      }
      rows.forEach((row, index) => {
        const rect = row.getBoundingClientRect();
        const offset = entering
          ? `translateX(${index % 2 ? innerWidth - rect.left + 32 : -rect.right - 32}px)`
          : `translateY(${innerHeight - rect.top + 32}px)`;
        add(row, offset, index * timing('--route-row-stagger'));
      });
      for (const controls of root?.querySelectorAll<HTMLElement>(
        '.archive-actions',
      ) ?? []) {
        add(
          controls,
          `translateY(${innerHeight - controls.getBoundingClientRect().top + 32}px)`,
          rows.length * timing('--route-row-stagger'),
        );
      }
    }
    if (page === '/side-projects' && entering) {
      const root = document.querySelector<HTMLElement>('.side-projects-page');
      const selector =
        'p, h1, h2, h3, h4, h5, h6, li, figure, pre, table, details';
      const elements = Array.from(
        root?.querySelectorAll<HTMLElement>(selector) ?? [],
      );
      for (const element of elements) {
        // Animate the outer media/list unit once, preserving authored float geometry.
        if (
          elements.some(
            (parent) => parent !== element && parent.contains(element),
          )
        )
          continue;
        if (!visible(element)) continue;
        if (element.matches('figure') && element.querySelector('img')) {
          for (const caption of element.querySelectorAll<HTMLElement>(
            'figcaption',
          )) {
            if (visible(caption)) decryptions.push(decryptText(caption));
          }
        } else if (element.matches('figure, pre, table, details')) {
          result.push({ ...slit(element, 'y'), delay: 0 });
        } else {
          decryptions.push(decryptText(element));
        }
      }
    }
    if (page === '/now' || (page === '/side-projects' && !entering)) {
      const root = document.querySelector<HTMLElement>(
        page === '/now' ? '.now-page' : '.side-projects-page',
      );
      for (const child of Array.from(root?.children ?? [])) {
        if (!(child instanceof HTMLElement) || child.matches('.ambient'))
          continue;
        if (page === '/side-projects' && child.matches('.body')) {
          for (const block of Array.from(child.children)) {
            if (!(block instanceof HTMLElement)) continue;
            const image = block.matches('figure')
              ? block.querySelector('img')
              : null;
            // Let the image's dither mask own its departure; captions still use the ordinary fade.
            if (
              image &&
              visible(image) &&
              image.complete &&
              image.naturalWidth > 0
            ) {
              for (const caption of block.querySelectorAll<HTMLElement>(
                'figcaption',
              )) {
                add(caption, 'none');
              }
              continue;
            }
            const rect = block.getBoundingClientRect();
            add(block, `translateY(${-rect.bottom - 32}px)`);
          }
        } else if (page === '/now' && child.matches('.portrait')) {
          if (visible(child)) {
            result.push({
              ...slit(child, 'y'),
              offset: entering ? 'translateY(105%)' : 'translateY(-105%)',
              delay: 0,
            });
          }
        } else if (page === '/now' && child.matches('.title, .elaborate')) {
          if (visible(child)) result.push(...lineSlits(child, entering));
        } else if (page === '/now' && child.matches('.body')) {
          for (const paragraph of child.querySelectorAll<HTMLElement>('p')) {
            if (
              visible(paragraph) &&
              !paragraph.hasAttribute('data-route-shared')
            )
              result.push(...lineSlits(paragraph, entering));
          }
        } else {
          const rect = homeChoreographyPaintedRect(
            child,
            state.value.hideDestination,
          );
          add(
            child,
            entering
              ? `translateX(${innerWidth - rect.left + 32}px)`
              : page === '/side-projects'
                ? `translateY(${-rect.bottom - 32}px)`
                : `translateX(${-rect.right - 32}px)`,
          );
        }
      }
    }
    if (/^\/(writing|case-studies)\//.test(page)) {
      // Move complete article surfaces, including media and apparatus, beyond their painted bounds.
      const article = document.querySelector<HTMLElement>('main > article');
      for (const element of Array.from(article?.children ?? [])) {
        if (!(element instanceof HTMLElement)) continue;
        const rect = homeChoreographyPaintedRect(
          element,
          state.value.hideDestination,
        );
        add(
          element,
          entering
            ? `translateX(${innerWidth - rect.left + 32}px)`
            : `translateX(${-rect.right - 32}px)`,
        );
      }
    }
    for (const shell of document.querySelectorAll<HTMLElement>(
      '.site-nav, .site-shell > .footer, .construction-banner',
    )) {
      const rect = homeChoreographyPaintedRect(
        shell,
        state.value.hideDestination,
      );
      add(
        shell,
        shell.matches('.site-nav') || (page === '/side-projects' && !entering)
          ? `translateY(${-rect.bottom - 32}px)`
          : `translateY(${innerHeight - rect.top + 32}px)`,
      );
    }
    return result;
  }

  function animate(page: RouteMotionPage, entering: boolean) {
    const style = getComputedStyle(document.documentElement);
    const duration = featuredMediaTransitionDuration();
    const easing = style
      .getPropertyValue(entering ? '--snappy-ease-out' : '--snappy-ease-in')
      .trim();
    const imageEffects: Promise<unknown>[] = [];
    if (page === '/side-projects') {
      const images = Array.from(
        document.querySelectorAll<HTMLImageElement>(
          '.side-projects-page .body img',
        ),
      ).filter(
        (image) => visible(image) && image.complete && image.naturalWidth > 0,
      );
      if (!entering) images.reverse();
      images.forEach((image, index) => {
        const spacing = entering ? 80 : 35;
        const maxDelay = entering ? 160 : Math.min(70, duration / 2);
        const delay = Math.min(index * spacing, maxDelay);
        imageEffects.push(dissolveImage(image, entering, delay));
      });
    }

    const effects = units(page, entering).map(({ element, offset, delay }) => {
      const rest = getComputedStyle(element).transform;
      const animation = element.animate(
        page === '/side-projects' && !entering
          ? [{ opacity: 1 }, { opacity: 0 }]
          : entering
            ? [{ transform: offset }, { transform: rest }]
            : [{ transform: rest }, { transform: offset }],
        {
          duration,
          delay: Math.min(delay, timing('--route-max-delay')),
          easing,
          fill: 'both',
        },
      );
      animations.add(animation);
      return animation.finished.catch(() => undefined);
    });
    return Promise.all([...effects, ...imageEffects, ...decryptions.splice(0)]);
  }

  async function leave(from: string, to: string) {
    reset();
    const run = generation;
    positions.set(from, scrollY);
    state.value = { active: true, hideDestination: false, from, to };
    if (
      (from === '/' && to === '/side-projects') ||
      (from === '/side-projects' && to === '/')
    ) {
      prepareLifeFieldHandoff(
        document.querySelector<HTMLCanvasElement>(
          from === '/'
            ? '.home-page #side-projects canvas'
            : '.side-projects-page .ambient canvas',
        ),
      );
    }
    sessionStorage.setItem('route-choreography-active', 'true');
    captureNowText(from, to);
    const expansion =
      from === '/' && to === '/side-projects'
        ? expandSideProjects()
        : Promise.resolve();
    await Promise.all([animate(from as RouteMotionPage, false), expansion]);
    if (run !== generation) return;
    if (from === '/side-projects') retainSideProjectsGround();
    state.value.hideDestination = true;
    await nextTick();
  }

  async function enter(path: string, hash: string) {
    const run = generation;
    await nextTick();
    clearEffects();
    window.scrollTo({
      top:
        state.value.from === '/now' && path === '/about' && !hash
          ? 0
          : (window.history.state?.scroll?.top ??
            (path === '/' ? (positions.get('/') ?? 0) : 0)),
      behavior: 'instant',
    });
    if (
      hash &&
      !window.history.state?.scroll &&
      (path !== '/' || !positions.has('/'))
    ) {
      let id = hash.slice(1);
      try {
        id = decodeURIComponent(id);
      } catch {
        /* Keep the literal hash when malformed. */
      }
      document
        .getElementById(id)
        ?.scrollIntoView({ block: 'start', behavior: 'instant' });
    }
    if (
      state.value.from === '/side-projects' &&
      path === '/' &&
      sideProjectsPlane
    ) {
      const section = document.querySelector<HTMLElement>(
        '.home-page #side-projects',
      );
      // The return morph must land on its source section, including direct entry to Side Projects.
      if (section && !visible(section))
        section.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
    // Give visible media and the archive's existing thumbnail gates a bounded chance to seat before starting the grouped entrance.
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('main img'),
    ).filter(visible);
    await Promise.race([
      Promise.allSettled([
        ...images.map((image) => image.decode()),
        ...(path === '/side-projects'
          ? [prepareRouteImageDissolve(ditherPattern.value, grain.value)]
          : []),
      ]),
      new Promise<void>((resolve) => window.setTimeout(resolve, 200)),
    ]);
    if (run !== generation) return;
    // Let layout and archive thumbnail gates settle before measuring the incoming units, without holding navigation for remote assets.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    if (run !== generation) return;
    const groundFinished =
      state.value.from === '/side-projects' && path === '/'
        ? contractSideProjects()
        : releaseSideProjectsPlane();
    const sharedFinished = moveNowText(path);
    const finished = animate(path as RouteMotionPage, true);
    if (path === '/side-projects') {
      const root = document.querySelector<HTMLElement>('.side-projects-page');
      if (root) restorations.push(distortRouteCrt(root));
    }
    state.value.hideDestination = false;
    await Promise.all([finished, sharedFinished, groundFinished]);
    if (run === generation) reset();
  }

  return { leave, enter, reset };
}
