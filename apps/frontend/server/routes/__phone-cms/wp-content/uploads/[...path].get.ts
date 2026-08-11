import { createError, getRequestURL, getRouterParam, proxyRequest } from 'h3';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  if (!config.phonePreview) {
    throw createError({ statusCode: 404 });
  }

  const rawAssetPath = getRouterParam(event, 'path');
  let assetSegments: string[];

  try {
    assetSegments = decodeURIComponent(rawAssetPath ?? '').split('/');
  } catch {
    throw createError({ statusCode: 404 });
  }

  if (
    assetSegments.length === 0 ||
    assetSegments.some(
      (segment) => !segment || segment === '.' || segment === '..',
    )
  ) {
    throw createError({ statusCode: 404 });
  }

  const endpoint = String(config.wordpressGraphqlUrl ?? '');

  if (!endpoint) {
    throw createError({
      statusCode: 503,
      statusMessage: 'WordPress media endpoint is unavailable',
    });
  }

  const assetPath = assetSegments.map(encodeURIComponent).join('/');
  const target = new URL(`/wp-content/uploads/${assetPath}`, endpoint);
  target.search = getRequestURL(event).search;

  return proxyRequest(event, target.toString(), {
    headers: { host: target.host },
  });
});
