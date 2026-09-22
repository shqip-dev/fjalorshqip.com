/*
 * The offline half of a static dictionary.
 *
 * Everything a search needs is a file — the page, the build's hashed assets and
 * one sub-index per 3-character prefix (docs/_claude/search-indexing.md) — so a
 * service worker is the whole caching story on this side. There is no server to
 * ask for anything else.
 *
 * It is served from `/sw.js` by `src/pages/sw.js.ts`, which is also what stamps
 * `VERSION` below. Not bundled, not imported by a page: this file runs outside
 * the document, which is why it is plain JavaScript and why nothing here may
 * import from `src/lib`.
 *
 * Three rules, one per kind of file:
 *
 *   a navigation  the network first, the shell only when the network is gone. A
 *                 cached page must never stand in for a live one, because `/`
 *                 doubles as the 404 catch-all: served for a word it does not
 *                 have, it is the *right* answer to the wrong address.
 *   /api/*.json   the cache first — this is what makes a second lookup of the
 *                 same prefix cost nothing — and a conditional request behind
 *                 it, so an index a deploy changed is picked up at the next
 *                 lookup rather than when `max-age` runs out.
 *   /_astro/*     the cache first and nothing behind it: those names carry a
 *                 hash of the file, so a hit cannot be stale.
 *
 * Everything else — the social cards, the icon, the OpenSearch descriptor, the
 * analytics script on its own origin — is left to the browser.
 */

/* Replaced at build time; see `src/pages/sw.js.ts`. */
const VERSION = '__VERSION__';

/*
 * The cache is named for the build, so a deploy starts a new one and `activate`
 * drops what the last one left. Nothing here calls `skipWaiting`: a new worker
 * takes over at the next navigation, which is the same moment the new HTML and
 * its new asset names arrive.
 */
const CACHE = `fjalorshqip-${VERSION}`;

/* The catch-all shell. Offline, this is what renders a word page. */
const SHELL = '/';

const isIndex = (url) =>
  url.pathname.startsWith('/api/') && url.pathname.endsWith('.json');

const isHashedAsset = (url) => url.pathname.startsWith('/_astro/');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      // `reload` so the shell is taken from the origin rather than from an HTTP
      // cache that may still hold the build this one replaces.
      .then((cache) => cache.add(new Request(SHELL, { cache: 'reload' })))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/* A page: the network, and the shell to fall back on when there isn't one. */
const fromNetwork = async (request) => {
  try {
    return await fetch(request);
  } catch (error) {
    const cached = await caches.match(SHELL, { cacheName: CACHE });
    return cached || Response.error();
  }
};

/*
 * A sub-index: the cached copy answers and the network corrects it behind the
 * reader's back. The request goes out as `no-cache`, which asks the origin to
 * confirm rather than to re-send — the files carry `last-modified`, so an
 * index that has not changed costs a 304 and no body.
 */
const fromCacheThenRevalidate = async (event) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);

  const fresh = fetch(new Request(event.request.url, { cache: 'no-cache' }))
    .then(async (response) => {
      if (response.ok) {
        await cache.put(event.request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);

  if (cached) {
    event.waitUntil(fresh);
    return cached;
  }

  return (await fresh) || Response.error();
};

/* A hashed asset: a hit is final, a miss is fetched once and kept. */
const fromCache = async (event) => {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(event.request);
    if (response.ok) {
      await cache.put(event.request, response.clone());
    }
    return response;
  } catch (error) {
    return Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fromNetwork(request));
    return;
  }

  if (isIndex(url)) {
    event.respondWith(fromCacheThenRevalidate(event));
    return;
  }

  if (isHashedAsset(url)) {
    event.respondWith(fromCache(event));
  }
});
