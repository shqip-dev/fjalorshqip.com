/*
 * `/sw.js` — the service worker, stamped with the build it belongs to.
 *
 * The source is `src/sw.js`, pulled in as text rather than imported as a
 * module: it runs outside the document and belongs to no bundle. It has to be
 * served from the site root, or its scope would not cover `/f/<slug>`, which is
 * the half of the site worth caching. (`?raw` and not `fs`: this endpoint is
 * rendered from a bundle in `dist/.prerender/`, where `src/sw.js` is not.)
 *
 * The stamp is the whole cache-invalidation story — the worker names its cache
 * after it, so a deploy starts a new one and drops the last. See
 * docs/_claude/caching.md.
 */
import source from '../sw.js?raw';

export function GET() {
  const body = source.replace('__VERSION__', new Date().toISOString());

  return new Response(body, {
    headers: { 'Content-Type': 'text/javascript; charset=utf-8' },
  });
}
