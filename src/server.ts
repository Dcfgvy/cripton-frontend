import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from 'redis';
import { environment } from './environments/environment';

const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

// Initialize Redis client
const redisClient = createClient({
  url: process.env['REDIS_URL'] || 'redis://localhost:6379'
});

// Connect to Redis
redisClient.connect().catch(err => {
  console.error('Redis connection error:', err);
});

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests with Redis caching
 */
app.use('/**', async (req, res, next) => {
  // Skip cache for non-GET requests
  if (req.method !== 'GET') {
    return angularApp.handle(req)
      .then(response => response ? writeResponseToNodeResponse(response, res) : next())
      .catch(next);
  }

  const cacheKey = `ssr:${req.originalUrl}`;

  try {
    // Try to get cached response
    const cachedHtml = await redisClient.get(cacheKey);
    if (cachedHtml) {
      console.log('CACHED');
      return res.send(cachedHtml);
    }

    // Not in cache - render fresh
    const response = await angularApp.handle(req);
    if (response) {
      console.log('RENDERING');
      const html = await response.text();
      await redisClient.setEx(cacheKey, environment.ssrCacheExpirySeconds, html);
      return res.send(html);
    }
    
    next();
  } catch (err) {
    console.error('Cache error:', err);
    // Fallback to non-cached response
    angularApp.handle(req)
      .then(response => response ? writeResponseToNodeResponse(response, res) : next())
      .catch(next);
  }
});

/**
 * Start the server if this module is the main entry point.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * The request handler used by the Angular CLI (dev-server and during build).
 */
export const reqHandler = createNodeRequestHandler(app);

// Graceful shutdown
process.on('SIGTERM', async () => {
  await redisClient.quit();
  process.exit(0);
});