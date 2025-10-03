#!/usr/bin/env node
import { createServer } from 'http';
import { promises as fs } from 'fs';
import { extname, join, normalize, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const docsRoot = join(__dirname, '..', 'docs');
const basePath = '/For-Iris-Hub';
const port = Number(process.env.PORT ?? 8080);

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8'
};

function getMimeType(filePath) {
  return mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
}

function resolveRequestPath(urlPath = '/') {
  if (!urlPath.startsWith(basePath)) {
    return null;
  }

  let relativePath = urlPath.slice(basePath.length);
  if (relativePath.startsWith('/')) {
    relativePath = relativePath.slice(1);
  }

  const [cleanPath] = relativePath.split(/[?#]/);
  let targetPath = cleanPath;
  if (!targetPath || targetPath.endsWith('/')) {
    targetPath = (targetPath ?? '') + 'index.html';
  }

  const normalized = normalize(targetPath);
  const absolutePath = join(docsRoot, normalized);

  if (!absolutePath.startsWith(docsRoot)) {
    return { absolutePath: null, status: 400 };
  }

  return { absolutePath, status: 200 };
}

const server = createServer(async (req, res) => {
  try {
    if (!req.url) {
      res.statusCode = 400;
      res.end('Bad request');
      return;
    }

    if (req.url === '/' || req.url === '') {
      res.statusCode = 302;
      res.setHeader('Location', `${basePath}/`);
      res.end();
      return;
    }

    const resolved = resolveRequestPath(req.url);
    if (!resolved) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    if (resolved.status !== 200 || !resolved.absolutePath) {
      res.statusCode = resolved.status;
      res.end(resolved.status === 400 ? 'Invalid path' : 'Not found');
      return;
    }

    let filePath = resolved.absolutePath;
    let stat;

    try {
      stat = await fs.stat(filePath);
    } catch {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    if (stat.isDirectory()) {
      filePath = join(filePath, 'index.html');
      try {
        await fs.access(filePath);
      } catch {
        res.statusCode = 404;
        res.end('Not found');
        return;
      }
    }

    const data = await fs.readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', getMimeType(filePath));
    res.end(data);
  } catch (error) {
    console.error('[serve-hub] Unexpected error:', error);
    res.statusCode = 500;
    res.end('Internal server error');
  }
});

server.listen(port, () => {
  console.log(`👉 Hub disponível em http://localhost:${port}${basePath}/`);
});
