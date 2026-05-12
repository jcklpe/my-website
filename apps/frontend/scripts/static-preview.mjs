import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(scriptDir, '../.output/public');
const host = process.env.STATIC_PREVIEW_HOST || process.env.HOST || '127.0.0.1';
const port = Number(
  process.env.STATIC_PREVIEW_PORT || process.env.PORT || 3002,
);

const contentTypes = new Map([
  ['.avif', 'image/avif'],
  ['.css', 'text/css; charset=utf-8'],
  ['.gif', 'image/gif'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.jpeg', 'image/jpeg'],
  ['.jpg', 'image/jpeg'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.mp3', 'audio/mpeg'],
  ['.mp4', 'video/mp4'],
  ['.png', 'image/png'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
  ['.txt', 'text/plain; charset=utf-8'],
  ['.webm', 'video/webm'],
  ['.webp', 'image/webp'],
  ['.woff', 'font/woff'],
  ['.woff2', 'font/woff2'],
]);

function isInsidePublicDir(filePath) {
  const relativePath = path.relative(publicDir, filePath);

  return (
    relativePath === '' ||
    (!relativePath.startsWith('..') && !path.isAbsolute(relativePath))
  );
}

async function fileExists(filePath) {
  try {
    await access(filePath);

    return true;
  } catch {
    return false;
  }
}

async function resolveFile(requestPathname) {
  const pathname = decodeURIComponent(requestPathname);
  const normalizedPathname = pathname.replace(/^\/+/, '');
  const requestedPath = path.resolve(publicDir, normalizedPathname);

  if (!isInsidePublicDir(requestedPath)) {
    return null;
  }

  if (await fileExists(requestedPath)) {
    const fileStat = await stat(requestedPath);

    if (fileStat.isFile()) {
      return { filePath: requestedPath, statusCode: 200 };
    }

    if (fileStat.isDirectory()) {
      const indexPath = path.join(requestedPath, 'index.html');

      if (await fileExists(indexPath)) {
        return { filePath: indexPath, statusCode: 200 };
      }
    }
  }

  const routeIndexPath = path.join(requestedPath, 'index.html');

  if ((await fileExists(routeIndexPath)) && isInsidePublicDir(routeIndexPath)) {
    return { filePath: routeIndexPath, statusCode: 200 };
  }

  const fallbackPath = path.join(publicDir, '404.html');

  if (await fileExists(fallbackPath)) {
    return { filePath: fallbackPath, statusCode: 404 };
  }

  return null;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || '/', `http://${host}:${port}`);
    const resolvedFile = await resolveFile(requestUrl.pathname);

    if (!resolvedFile) {
      response.writeHead(404, {
        'Cache-Control': 'no-store',
        'Content-Type': 'text/plain; charset=utf-8',
      });
      response.end('Not found');

      return;
    }

    const extension = path.extname(resolvedFile.filePath).toLowerCase();
    const contentType =
      contentTypes.get(extension) || 'application/octet-stream';

    response.writeHead(resolvedFile.statusCode, {
      'Cache-Control': 'no-store',
      'Content-Type': contentType,
    });

    if (request.method === 'HEAD') {
      response.end();

      return;
    }

    createReadStream(resolvedFile.filePath).pipe(response);
  } catch (error) {
    console.error(error);
    response.writeHead(500, {
      'Cache-Control': 'no-store',
      'Content-Type': 'text/plain; charset=utf-8',
    });
    response.end('Static preview error');
  }
});

server.listen(port, host, () => {
  console.log(`Static preview running at http://${host}:${port}`);
  console.log(`Serving ${publicDir}`);
});
