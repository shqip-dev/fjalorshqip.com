# Head metadata, social cards & structured data

English detail for what a page says about itself. The user-facing docs say nothing about this on
purpose — it is invisible to a reader and only matters to a crawler or a chat client drawing a preview.

## Where it is written

| Piece | File |
| :-- | :-- |
| The strings and the JSON-LD | `src/lib/seo.ts` |
| The `<head>` of a prerendered page | `src/layouts/MainLayout.astro` |
| The `<head>` of a page rendered in the browser | `src/lib/documentMeta.ts` |
| The card image | `public/og.png`, drawn by `tools/og-image.mjs` |

`MainLayout` emits, for every page: `description`, `canonical`, the Open Graph set
(`type`, `site_name`, `locale`, `title`, `description`, `url`, `image` + dimensions + `alt`), the
Twitter set (`summary_large_image`, title, description, image) and — when the page passes one — a
single `<script id="schema-org" type="application/ld+json">` holding one `@graph`.

Pages pass `socialTitle` when the `<title>` is too long for a card: a preview shows the site's name
separately (`og:site_name`), so repeating `| fjalorshqip.com` in the title wastes the line.

## The invariant that matters

**The same word must describe itself the same way whether the build rendered it or the browser did.**
`index.astro` is the 404 catch-all (see [`search-indexing.md`](search-indexing.md), invariant 4), so a
word page that was not prerendered arrives carrying the *home page's* head. `EntriesLoader` rewrites it
through `documentMeta` the moment the sub-index resolves, and both sides call the same `seo.ts`
helpers — `getWordTitle`, `getWordSocialTitle`, `getWordDescription`, `getWordSchema` — rather than
writing the strings themselves. Change a string in one place and it changes on both paths.

What the browser cannot fix is the head a client sees *without* running JavaScript: a link unfurler
that only reads the served HTML sees the home page's card for a non-prerendered word. The production
image prerenders every word page (`SHOULD_SKIP_STATIC_WORD_PAGES` is unset in `Dockerfile`), which is
what keeps that case theoretical — turning that flag on trades away every word's social card.

The rest of the rules, split between `documentMeta` and the host:

- **Nothing on the 404 path asks to be indexed.** A word the dictionary does not have, and any other
  address that fell through to the 404 page, get `robots: noindex,follow` and no structured data —
  there is nothing there worth indexing, and the links out of the page are still worth following. The
  found-word case deliberately sets *no* `robots` directive at all: indexable is already the default,
  and that code only ever runs on a response the host sent as a 404, so an `index` there would
  contradict the status it arrived with. The prerendered word page, the one served with a 200, asks to
  be indexed by saying nothing.
- The status codes are the host's half of that, and `static-web-server --page404 index.html` gets them
  right: `/` and `/f/<slug>/` answer 200, an unknown address answers **404** with the catch-all body,
  and `/f/<slug>` (no trailing slash) answers 308 to the directory form — which is the form every
  canonical and every sitemap entry names. Any other hosting has to behave the same way, or the
  catch-all starts answering 200 and every junk URL becomes a soft 404.
- Canonicals name the **directory** (`/f/acar/`), because the build writes `/f/acar/index.html` and
  `@astrojs/sitemap` lists the directory form. `getCanonicalUrl` is what enforces it; if the two
  disagreed, every word page would advertise an address its own sitemap does not.

## Structured data

Dictionary results are read as `DefinedTerm`, so that is what a word page carries: one node per
homograph (`#fjala`, or `#fjala-1`, `#fjala-2`, … when there is more than one), each with the senses
flattened into `description`, pointing at one `DefinedTermSet` — the dictionary itself, `@id`
`<site>/#fjalor`. The home page carries `WebSite` (with a `SearchAction` naming the same `?q=` entry
point `opensearch.xml.ts` uses, through the shared `SEARCH_QUERY_PARAM`) plus that same
`DefinedTermSet`.

`serializeSchema` escapes `<` in the serialized JSON. A definition containing one would otherwise end
the inline `<script>` early.

## The card image

One image for the whole site, at `public/og.png` (1200×630, ~15 KB). A per-word card would be 40k
renders, which a static build with no image pipeline is not going to do — and it would buy little: the
preview's own text already names the word.

`tools/og-image.mjs` draws it and is run **by hand**, never by the build. Its header has the exact
commands; the shape of it is that `sharp` is not a dependency of this site (it is added and removed
around the run) and that pango needs real font files, so the packaged Alegreya woff2 has to be
decompressed first. Re-run it when the palette in `src/styles/global.scss` moves or Alegreya changes.
