import { createError, getRequestURL, getRouterParam, proxyRequest } from 'h3';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  if (!config.phonePreview) {
    throw createError({ statusCode: 404 });
  }

  const assetPath = getRouterParam(event, 'path');

  if (!assetPath || assetPath.split('/').includes('..')) {
    throw createError({ statusCode: 404 });
  }

  const endpoint = String(config.wordpressGraphqlUrl ?? '');

  if (!endpoint) {
    throw createError({
      statusCode: 503,
      statusMessage: 'WordPress media endpoint is unavailable',
    });
  }

  const target = new URL(`/wp-content/uploads/${assetPath}`, endpoint);
  target.search = getRequestURL(event).search;

  return proxyRequest(event, target.toString(), {
    headers: { host: target.host },
  });
});
