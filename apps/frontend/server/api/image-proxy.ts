export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url as string;
  if (!url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url parameter' });
  }
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw createError({ statusCode: response.status, statusMessage: response.statusText });
    }
    const buffer = await response.arrayBuffer();
    setResponseHeaders(event, {
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    return Buffer.from(buffer);
  } catch (error) {
    throw createError({ statusCode: 500, statusMessage: String(error) });
  }
});
