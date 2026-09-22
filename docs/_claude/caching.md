# Caching: the origin's headers and the service worker

English detail for how often a reader re-downloads the site. There is no application server here, so
this is the whole of it: `sws.toml`, which is what the origin says about a file, and `src/sw.js`,
which is what the browser does with it afterwards.

| Piece | File |
| :-- | :-- |
| The origin's cache-control rules | `sws.toml`, copied to `/etc/sws.toml` by the `Dockerfile` |
| The service worker | `src/sw.js` |
| The worker, stamped and served at `/sw.js` | `src/pages/sw.js.ts` |
| Registration | `REGISTER_WORKER` in `src/layouts/MainLayout.astro` |

## What the origin sends, and what it used to

static-web-server writes cache-control headers of its own, and they are chosen by extension: an hour
for JSON, a day for HTML, a year for anything that looks like an asset. On this site two of those
three were wrong.

- **A day on HTML was a live hazard**, not just a slow update. A page names the hashed assets of the
  build that rendered it, and `dist` is replaced whole on deploy, so those names are gone afterwards.
  A reader holding yesterday's HTML asks for scripts that no longer exist, and the islands — the
  search bar among them — quietly never mount.
- **An hour on the sub-indexes** meant the files a search actually costs were re-fetched hourly by
  exactly the readers who use the site most.

`sws.toml` replaces those with four rules. They are matched in order and **the last match wins**,
which is why the catch-all is first:

| Path | Cache-Control | Why |
| :-- | :-- | :-- |
| everything else | `no-cache` | HTML, `/sw.js`, `robots.txt`, the sitemap, `opensearch.xml`. `no-cache` keeps the copy and revalidates it; `last-modified` makes that a 304 with no body. |
| `/_astro/**` | `public, max-age=31536000, immutable` | The name carries a hash of the file. |
| `/og/**`, `/*.png`, `/favicon.ico` | `public, max-age=604800` | Not hashed, but a word's card changes only when the dictionary does. |
| `/api/**/*.json` | `public, max-age=86400, stale-while-revalidate=604800` | Regenerated only by a deploy. |

Two things that are **not** in this repository and cannot be:

- **`public/_headers` would do nothing.** That file is read by Cloudflare Pages and by Netlify. This
  site is the Docker image behind a Cloudflare proxy, so the origin's own config is the only lever.
- **Cloudflare does not cache the sub-indexes at the edge** — `cf-cache-status: DYNAMIC` on every one
  of them. Its default cache is chosen by file extension and `.json` is not in the list, whatever the
  origin's headers say. Changing that takes a Cache Rule in the dashboard, not a commit. The service
  worker is what makes it not matter much: a repeat lookup never reaches the network at all.

## The worker

`src/sw.js` is ~140 lines and has one rule per kind of file:

- **A navigation goes to the network first**, and falls back to the cached shell only when there
  isn't one. A cached page may never stand in for a live one here, because `/` doubles as the 404
  catch-all (`search-indexing.md`, invariant 4): served for a word the dictionary does not have, it
  is the right answer to the wrong address, and it must not become the answer to every address.
- **A sub-index is served from the cache and revalidated behind the reader's back.** This is the
  point of the whole exercise — a prefix looked up twice costs no request. The background request
  goes out as `cache: 'no-cache'`, which asks the origin to confirm rather than to re-send, so an
  index a deploy changed is picked up at the next lookup rather than when `max-age` runs out.
- **A hashed asset is served from the cache with nothing behind it.** A hit cannot be stale.

Everything else — the social cards, the icon, the analytics script on its own origin — is left to the
browser. The worker never rewrites a response; it only keeps one.

**Offline, the site still answers.** The cached shell renders, `DynamicEntries` reads the slug out of
the address, and `EntriesLoader` finds the sub-index in the cache — so any word whose prefix the
reader has already touched comes up in full, head and all. A prefix never fetched is a 404 page, the
same as a word the dictionary does not have.

Load-bearing details:

- **The cache is named for the build.** `sw.js.ts` stamps `__VERSION__` with the build time, the
  worker names its cache after it, and `activate` deletes every cache that is not the current one. A
  deploy therefore starts clean rather than accumulating the hashed assets of every build ever
  shipped.
- **Nothing calls `skipWaiting`.** A new worker takes over at the next navigation, which is the same
  moment the new HTML and its new asset names arrive. Swapping mid-page would pair new assets with a
  document that never asked for them.
- **`/sw.js` must stay uncached** — a worker held in an HTTP cache is a worker that cannot be
  replaced. The catch-all rule covers it.
- **The registration script is a string, not a `<script>` body.** Astro takes a script element's
  contents as raw text, so an expression written inside one is emitted verbatim and never runs. That
  is how the first version of this shipped: the page looked correct, the tag was there, and no worker
  was ever registered. `set:html={REGISTER_WORKER}` is the same way the JSON-LD gets onto the page.
- It registers **only in a real build** (`import.meta.env.PROD`). A worker registered by `astro dev`
  outlives the build that registered it.

## Checking it

The headers are the origin's, so they need the origin — `pnpm preview` says nothing about them:

```sh
DICTIONARY_SUBSET='["AÇ","ACAR"]' pnpm build
docker run --rm -p 8099:80 -v "$PWD/dist:/public:ro" -v "$PWD/sws.toml:/etc/sws.toml:ro" \
  joseluisq/static-web-server:2 --config-file /etc/sws.toml
curl -sI http://localhost:8099/api/stem-index/aca.json | grep -i cache-control
```

For the worker, open `http://localhost:8099/` (a service worker needs a secure context, and localhost
counts as one), search for something, then **stop the container** and navigate to `/f/acar/`: the
entry should still render. `caches.keys()` and `caches.open(<name>).then(c => c.keys())` in the
console say what is actually held.
