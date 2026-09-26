type RouteMotionPage = '/' | '/about' | '/writing';
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
  return (
    (from === '/' && (to === '/about' || to === '/writing')) ||
    (to === '/' && (from === '/about' || from === '/writing'))
  );
}

export function useRouteChoreography() {
  const state = useRouteChoreographyState();
  const animations = new Set<Animation>();
  const restorations: Array<() => void> = [];
  const positions = new Map<string, number>();
  let generation = 0;

  function clearEffects() {
    for (const animation of animations) animation.cancel();
    animations.clear();
    for (const restore of restorations.splice(0)) restore();
  }

  function reset() {
    generation++;
    clearEffects();
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
      const pivot = anchor?.getBoundingClientRect().top ?? innerHeight / 2;
      const sections = Array.from(home?.children ?? []).filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && visible(element),
      );
      sections.forEach((element, index) => {
        const rect = homeChoreographyPaintedRect(
          element,
          state.value.hideDestination,
        );
        let offset: string;
        if (state.value.to === '/writing' && !entering) {
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
        const unit = slit(heading, 'y');
        result.push({ ...unit, delay: 0 });
      }
      for (const paragraph of root?.querySelectorAll<HTMLElement>(
        '.body p, .now-body p',
      ) ?? []) {
        if (!visible(paragraph) || paragraph.closest('figure')) continue;
        result.push({
          ...slit(paragraph, 'y'),
          delay: timing('--route-text-delay'),
        });
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
    } else {
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
    for (const shell of document.querySelectorAll<HTMLElement>(
      '.site-nav, .site-shell > .footer, .construction-banner',
    )) {
      const rect = homeChoreographyPaintedRect(
        shell,
        state.value.hideDestination,
      );
      add(
        shell,
        shell.matches('.site-nav')
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
    const effects = units(page, entering).map(({ element, offset, delay }) => {
      const rest = getComputedStyle(element).transform;
      const animation = element.animate(
        entering
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
    return Promise.all(effects);
  }

  async function leave(from: string, to: string) {
    reset();
    const run = generation;
    positions.set(from, scrollY);
    state.value = { active: true, hideDestination: false, from, to };
    sessionStorage.setItem('route-choreography-active', 'true');
    await animate(from as RouteMotionPage, false);
    if (run !== generation) return;
    state.value.hideDestination = true;
    await nextTick();
  }

  async function enter(path: string, hash: string) {
    const run = generation;
    await nextTick();
    clearEffects();
    window.scrollTo({
      top: path === '/' ? (positions.get('/') ?? 0) : 0,
      behavior: 'instant',
    });
    if (hash && (path !== '/' || !positions.has('/'))) {
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
    // Give visible media and the archive's existing thumbnail gates a bounded chance to seat before starting the grouped entrance.
    const images = Array.from(
      document.querySelectorAll<HTMLImageElement>('main img'),
    ).filter(visible);
    await Promise.race([
      Promise.allSettled(images.map((image) => image.decode())),
      new Promise<void>((resolve) => window.setTimeout(resolve, 200)),
    ]);
    if (run !== generation) return;
    // Let layout and archive thumbnail gates settle before measuring the incoming units, without holding navigation for remote assets.
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
    if (run !== generation) return;
    const finished = animate(path as RouteMotionPage, true);
    state.value.hideDestination = false;
    await finished;
    if (run === generation) reset();
  }

  return { leave, enter, reset };
}
