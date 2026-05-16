function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function isRouterNavigableLink(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== '_self') {
    return false;
  }

  if (anchor.hasAttribute('download')) {
    return false;
  }

  const href = anchor.getAttribute('href') ?? '';

  if (!href || href.startsWith('#')) {
    return false;
  }

  return true;
}

function getLocalRouteFromAnchor(anchor: HTMLAnchorElement) {
  let url: URL;

  try {
    url = new URL(anchor.href);
  } catch {
    return '';
  }

  if (url.origin !== window.location.origin) {
    return '';
  }

  return `${url.pathname}${url.search}${url.hash}` || '/';
}

export default defineNuxtPlugin(() => {
  const router = useRouter();

  document.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      isModifiedClick(event)
    ) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const anchor = target.closest<HTMLAnchorElement>('a[href]');

    if (!anchor || !isRouterNavigableLink(anchor)) {
      return;
    }

    const to = getLocalRouteFromAnchor(anchor);

    if (!to) {
      return;
    }

    event.preventDefault();

    void router.push(to);
  });
});
