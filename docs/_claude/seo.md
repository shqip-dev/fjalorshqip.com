# Head metadata, social cards & structured data

English detail for what a page says about itself. The user-facing docs say nothing about this on
purpose — it is invisible to a reader and only matters to a crawler or a chat client drawing a preview.

## Where it is written

| Piece | File |
| :-- | :-- |
| The strings and the JSON-LD | `src/lib/seo.ts` |
| The `<head>` of a prerendered page | `src/layouts/MainLayout.astro` |
| The `<head>` of a page rendered in the browser | `src/lib/documentMeta.ts` |
| The card drawing | `src/lib/ogCard.ts` (node-only — never import it from a component) |
| The card build step | `src/scripts/ogCards.ts`, run as `postbuild` |
| The fonts it draws with | `src/assets/fonts/*.ttf` (see the README there) |

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

## The cards

**Every word page has its own card**, the two games have one each, and everything else shares
`public/og.png`. A link to a word unfurls in WhatsApp, Discord, Slack or a timeline as that word —
headword in small caps, its labels, the hairline rule, the opening of its first sense — drawn on the
same sheet the page is. A link to a game unfurls as its board: one row of the game's own cells over
the name and a line of its own, Fjalëz's coloured the way a guessed row is (in place, elsewhere,
absent) and Lëmsh's a tray still shuffled, which the name under the rule then solves.

`src/lib/ogCard.ts` draws all of them, so the site's card, the games' and 40k word cards cannot drift
apart. `src/scripts/ogCards.ts` drives it:

    pnpm build            # astro check && astro build, then postbuild draws the word cards
    pnpm og:cards         # redraw the word cards into an existing dist/
    pnpm og:site          # redraw public/og.png and the two game cards

Things worth knowing before changing any of it:

- **The cards are written into `dist/og/`, not `public/og/`.** Anything in `public/` is copied into
  `dist` by `astro build`; at ~400 MB that copy is not worth paying for. This is why the step is
  `postbuild` rather than part of `prebuild` — it needs a `dist` to write into, and says so if there
  isn't one.
- **The set of cards is the set of prerendered pages.** Both come from `src/data/gen/slugDictionary.json`,
  so a card exists exactly when the page does — in a development build that is the env-gated subset,
  in production it is all of them. `f/[slug].astro` asks `shouldSkipWordCards()` before pointing at
  one, and falls back to the site card, so a build that skipped them never advertises an image that
  was never drawn. `SHOULD_SKIP_WORD_CARDS=true` skips them; `SHOULD_SKIP_STATIC_WORD_PAGES` skips
  them too, since there would be no page to hang them on.
- **The game cards go the other way — into `public/`, and into git.** There are two of them at ~9 KB,
  so the copy `astro build` makes costs nothing, and being committed they are there for `astro dev`
  and for a build that skipped the word cards. `GAME_CARD_FILENAMES` in `seo.ts` names them and
  `getGameCardPath` is what `fjaleez.astro` and `leemsh.astro` pass as `image`; the drawing recipe —
  name, tagline and the row of cells — is `GAME_CARDS` in `ogCard.ts`, node-side, where the colours
  are. Redraw them with `pnpm og:site` whenever the palette moves, the same as the site's.
- **A cell's letter is drawn between two invisible anchors.** Pango returns the glyph's ink box and
  nothing else — `Ë` is 47px tall where `L` is 37 — so centring those boxes in their cells would set
  a row on five different baselines. `drawCellLetter` draws the letter between two `alpha="1"` spans
  reading `ËJ`, the tallest and the deepest thing a row holds, which pins every raster to the same
  extents, then crops the ink back to its own columns: centred on its ink across the cell, on the
  shared baseline down it.
- In `astro dev` the word cards do not exist — `postbuild` only runs for a real build — so a word page
  there names a `/og/<slug>.png` that would 404 if anything fetched it. Nothing does: an unfurler
  reads the tag off a deployed page, and the browser never requests `og:image`.
- **The browser-side head does not touch `og:image`.** `documentMeta` could point at a word's card,
  but nothing that unfurls a link runs JavaScript, so the only thing that would ever see it is
  something that does not need it — and on a build with the cards skipped it would point at a 404.
- **`sharp` is a devDependency, not a new dependency.** `astro` already depends on the same version,
  and the lockfile already carried `@img/sharp-linuxmusl-x64` for the alpine build stage; declaring it
  is what lets our own code import it under pnpm's strict layout. It is build-time only — the runtime
  image is `static-web-server` and a directory of files.
- **The fonts are committed as TrueType** in `src/assets/fonts/`, because pango reads font files
  through FreeType and will not take the woff2 the pages load. Silently falling back to a system sans
  is what a wrong path looks like, not an error. Their README has the `woff2_decompress` recipe.

Costs, measured on the real dictionary (39,898 words, 16 cores):

| | |
| :-- | :-- |
| Per card | ~11 ms, ~10 KB (1200×630, 16-colour palette PNG) |
| The word cards | ~400 MB, a few minutes of wall clock |
| `dist` | ~790 MB of HTML and JSON before the cards, ~1.2 GB after |

The sheet and the footer are rasterized once and composited into every card, which is most of why a
card costs milliseconds. 16 colours is chosen deliberately: the art is flat, so nothing bands, and a
full palette costs a third more across 40k files. Re-run `pnpm og:site` when the palette in
`src/styles/global.scss` moves or Alegreya is upgraded — and remember the word cards are drawn from
that same module, so they change with it on the next build.
