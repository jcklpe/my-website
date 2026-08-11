import { createError, proxyRequest } from 'h3';

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);

  if (!config.phonePreview) {
    throw createError({ statusCode: 404 });
  }

  const endpoint = String(config.wordpressGraphqlUrl ?? '');

  if (!endpoint) {
    throw createError({
      statusCode: 503,
      statusMessage: 'WordPress GraphQL endpoint is unavailable',
    });
  }

  const target = new URL(endpoint);

  return proxyRequest(event, target.toString(), {
    headers: { host: target.host },
  });
});
