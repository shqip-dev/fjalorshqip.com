# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`fjalorshqip.com` — an Albanian dictionary site built with Astro 7 + Preact 10 islands. It ships as
**static files only**: no application server, no database, no request-time code. Search runs entirely in
the browser against JSON indexes generated at build time. It is served from any static host; a Docker
image is published to ghcr.io by `.github/workflows/docker-publish.yml`.

## Docs

- `docs/README.md`, `docs/kerkimi.md`, `docs/fjalez.md`, `docs/lemsh.md` and `docs/shtigje.md` are
  user/contributor-facing and are **written in Albanian — keep them that way**, as is all UI copy and
  page content.
- `docs/_claude/` holds English detail referenced from here. Read
  [`docs/_claude/search-indexing.md`](docs/_claude/search-indexing.md) before touching the indexing
  pipeline, the search bar, or the word-page routes, and
  [`docs/_claude/seo.md`](docs/_claude/seo.md) before touching what a page says about itself — the
  head, the social card or the JSON-LD, and
  [`docs/_claude/caching.md`](docs/_claude/caching.md) before touching `sws.toml`, `src/sw.js` or
  anything about how long a file is kept.

## Commands

Package manager is **pnpm** (migrated from npm). `.npmrc` sets `enable-pre-post-scripts=true` so
`pnpm build` still runs the `prebuild` data-generation step.

| Command | Action |
| :-- | :-- |
| `pnpm install` | Install deps |
| `pnpm dev` | Dev server on `localhost:4321` |
| `pnpm prebuild` | Regenerate `src/data/gen/` from `data/dictionary.json` |
| `pnpm build` | `astro check` (typecheck) + `astro build` — runs `prebuild` first |
| `pnpm astro check` | Typecheck only |
| `pnpm preview` | Serve `./dist` |
| `pnpm lemsh:words` | Regenerate `src/data/lemsh/rounds.json` (Lëmsh days) |
| `pnpm shtigje:words` | Regenerate `src/data/shtigje/weeks.json` (Shtigje weeks) |
| `pnpm og:cards` | Redraw the per-word social cards into an existing `dist/og/` |
| `pnpm og:site` | Redraw `public/og.png`, the card every non-word page shares |

There is no test suite and no linter beyond `astro check` (`.prettierrc`: 2 spaces, single quotes).

### Building locally requires an env gate

`prebuild` only emits entries when `NODE_ENV=production` **or** `DICTIONARY_SUBSET` is set (see
`src/lib/env.ts`). With neither, it writes zero entries and the subsequent `astro build` fails on the
missing `src/data/gen/slug` directory — that is env-gating, not a bug. For a fast, bounded end-to-end
build:

```sh
DICTIONARY_SUBSET='["AÇ","ACAR"]' pnpm build
```

Other env vars: `SHOULD_SKIP_STATIC_WORD_PAGES=true` skips prerendering `/f/<slug>` pages (and with
them the per-word social cards); `SHOULD_SKIP_WORD_CARDS=true` skips only the cards; `META_TAGS` is a
JSON object injected as `<meta>` tags by `MainLayout.astro`; `SITE_URL`,
`OPENSEARCH_SHORT_NAME` and `OPENSEARCH_DESCRIPTION` override what
`src/pages/opensearch.xml.ts` emits (it falls back to `Astro.site`, then to
`https://fjalorshqip.com/`). The OpenSearch template points at `/?q={searchTerms}`, and `SearchBar`
seeds itself from that `q` param — the name lives in `src/lib/search.ts`, shared by both sides.

## Architecture in brief

`data/dictionary.json` (~14 MB, ~40k scraped entries) is preprocessed by `src/scripts/preprocess.ts` into
`src/data/gen/` (gitignored): a slug dictionary used to prerender `/f/<slug>`, plus per-prefix sub-indexes
bucketed by the first 3 characters of the key. Astro publishes those sub-indexes as plain static JSON at
`/api/{stem,slug}-index/<prefix>.json`. `SearchBar` normalizes the typed query with the *same*
`getStems` used at build time, fetches the one matching sub-index, and intersects/ranks locally.

The two sub-indexes deliberately do **not** carry the same record. The slug index holds whole `Entry`
objects, because a word page renders from it. The stem index holds `SearchEntry` — term, attributes,
slug, stems and a `gist` computed at build time by `getGist` — because a result row shows nothing else;
putting the definitions back would mean downloading the dictionary to draw ten lines of it (the `shk`
bucket costs 22 KB gzip this way, 61 KB with definitions).

Load-bearing details that are easy to break — the stem/slug normalization split, the 3-char prefix
contract shared by generator and clients, and `index.astro` doubling as the 404 catch-all that renders
non-prerendered word pages — are in `docs/_claude/search-indexing.md`.

## Fjalëz

`/fjaleez` (the slug rule — `ë → ee` — applies to the game's URLs the way it does to a word page's;
code identifiers keep the plain `fjalez`, as `docs/kerkimi.md` already spells `kërkimi`) is the word
game: one five-letter word a day, six guesses, played entirely in the browser.
`src/lib/fjalez.ts` holds the rules and `PUZZLES`, the day → word list (2026-09-19 → 2026-11-18, UTC
days like `getWordOfDay`, but **it must not wrap** — a repeat would hand back a solved word). Three
things are load-bearing:

- **One character to a box.** `splitLetters` — in `src/lib/letters.ts`, shared with Lëmsh — is a plain
  character split and is what counts a word's length everywhere: the puzzle list, the guess-list
  generator and the board all go through it. A letter written with two characters (DH, SH, RR, …)
  fills two boxes, so `GARDH` is five and `SHTËPI` is not a five-letter word here. The keyboard is
  QWERTY with Ë after P and Ç after L (no W — the alphabet has none).
- **The guess list is derived at build time, but not by `prebuild`.** `/api/fjaleez/fjalee.json`
  (3.5k words) is computed by `getFjalezGuesses` in `src/lib/fjalezWords.ts` straight from
  `data/dictionary.json`, not from `src/data/gen/`, because `prebuild` is env-gated down to a subset in
  development and the game may not depend on that gate. The board fetches it once.
- **Results live in `localStorage` (`fjalez.v1`) and nowhere else** — `src/lib/fjalezStore.ts`. Only
  the guesses are stored, keyed by the day's **date** rather than its index in the series (an index
  means nothing if `START_UTC` ever moves); won/lost is derived, so the two cannot disagree. Every
  access is wrapped: storage can be refused outright.

Days after today are refused client-side (the whole site is prerendered, so the check can only live
there). Umami events are `fjalez_open`, `fjalez_first_guess`, `fjalez_invalid`, `fjalez_win`,
`fjalez_lose`, `fjalez_share` and `fjalez_definition`.

## Lëmsh

`/leemsh` (same `ë → ee` slug rule; code identifiers keep the plain `lemsh`) is the scramble game: a
day is five or six words, each dealt shuffled and with a clock of its own. `src/lib/lemsh.ts` holds the
rules, the day arithmetic and the scoring; `src/lib/lemshStore.ts` the storage. Load-bearing:

- **The rounds are committed, not generated at build time** — `src/data/lemsh/rounds.json`, built by
  `pnpm lemsh:words` from the curated pool inside `src/scripts/lemshWords.ts`, for the same reason
  Fjalëz's guess list skips `src/data/gen/`: `prebuild` is env-gated down to a subset in development
  and a game may not depend on that gate. The generator validates every pooled word against `data/dictionary.json` (the
  answers link to `/f/<slug>`, so a word that is not a headword would link nowhere), refuses any word
  Fjalëz already uses, deals the pool into rounds of five or six, and **fails loudly** rather than
  writing a partial file. The series must not wrap, like Fjalëz's; `ROUNDS.length` is the end.
- **The scramble is dealt by the generator, not the browser.** Everyone playing a day gets the same
  tiles in the same order. The in-game *Përzie* only reorders that reader's own tray.
- **Only what was done is stored** (`lemsh.v1`): per word, the seconds it took and whether it was
  solved. The score is derived from that and the round, so a stored number cannot disagree with the
  play, and the scoring can be retuned without rewriting history. A word is written the moment it
  ends, so a half-played round resumes — the word in hand restarts with a full clock, which is the
  one deliberate hole.
- **The clock is a deadline, not a tick count**, and it is frozen when the word ends so the reveal
  reads the seconds that were actually left. Nothing runs until the reader presses *Fillo*: the clock
  starts when a word appears, so it may not start while the page is still being read.

Scoring is `10 × letters + seconds left` for a solved word and nothing for a missed one; the clock is
`max(30, 8 × letters)` seconds. Umami events are `lemsh_open`, `lemsh_start`, `lemsh_word_solved`,
`lemsh_word_missed` (`r` is `timeout` or `skip`), `lemsh_word_wrong` (the slots filled with something
that is not the word: `g` is what was built and `n` which attempt it was at that word),
`lemsh_shuffle`, `lemsh_finish`, `lemsh_share` and `lemsh_definition`. The board raises what happened
and the page tracks it — `LemshRound` holds no analytics of its own.

## Shtigje

`/shtigje` (no `ë`, so the slug is the word) is the **weekly** game — a Strands-style grid: six
columns by eight rows, one theme, and every one of the forty-eight cells belongs to exactly one of
the week's words. A word is a self-avoiding king-move trail; there is no filler, so the letters left
over are always the words left over. `src/lib/shtigjeGrid.ts` holds the board (shared with the
generator, which needs it before `weeks.json` exists), `src/lib/shtigje.ts` the rules and the week
arithmetic, `src/lib/shtigjeStore.ts` the storage. Load-bearing:

- **The week is Monday in Tirana, not UTC** — the one place the three games disagree about what a day
  is. `toLocalMidnight` in `src/lib/shtigje.ts` asks `Intl` for the civil date in `Europe/Tirane` and
  floors whole weeks since `START_UTC`, itself a Monday; an environment without the zone falls back
  to UTC. `?j=<any date inside the week>` opens that week, so a link shared on Thursday still works.
- **The weeks are committed, not generated at build time** — `src/data/shtigje/weeks.json`, built by
  `pnpm shtigje:words` from the themes inside `src/scripts/shtigjeWords.ts`, for the same reason the
  other two games' lists are. Each theme carries a *pool* larger than a week needs; the generator
  picks the subset whose letters total exactly 48, packs it into the grid as disjoint paths, and
  **fails loudly** rather than writing a partial file. It reports every theme that failed, not the
  first. The series must not wrap; `WEEKS.length` is the end.
- **The bonus words are read off the finished grid, from the dictionary** — every other word of 4–8
  letters the grid can be made to spell, found with a trie at build time because enumerating them in
  the browser would mean shipping the dictionary. Three of them buy a hint. They are most of
  `weeks.json`'s 62 KB (19 KB gzip), which is why the page is the only thing that imports it.
- **The score is a base that only adds and a pool that only drains.** The words are the base — 10
  points a letter, Lëmsh's rate, so a full 48-cell grid is 480 whatever else happened. Over it sits
  one `BONUS_POOL` of 720 that time (1/second), wrong trails (`MISS_COST` 10) and hints
  (`HINT_COST` 60) eat into, floored at zero. That floor is what makes the game neither timed nor
  capped, which was the requirement: there is no clock to beat and no limit on trails, you simply
  stop earning from the pool, and a slow messy week still scores its 480. The pool pays **only for
  a week that was emptied** — otherwise the fastest week would be the one where a reader traced one
  word and left.
- **The clock is a sum of what was done, not a tick count.** There is no interval anywhere: every
  move adds the gap since the move before it, capped at `THINK_CAP` (120s), and `lastAt` resets
  when the tab becomes visible again. So nothing has to be started, stopped or flushed on the way
  out, a board left open over lunch costs two minutes rather than an afternoon, and a backgrounded
  tab costs nothing. The deliberate hole runs the kind way: a genuine long stare at the grid is
  undercounted, which is right for a number that only ever takes points away.
- **A hint stores the word it gave away, not a count.** A count has to be turned back into words to
  draw them, and the only rule that does that slides: spend a hint, trace the word, and the same hint
  silently points at the next one. A hint sinks a word's *cells* and never their order.
- **The trail is beads and bars, and it is the one rounded thing on the site.** The letters stand on
  the open sheet (no ruled table here, unlike the other two boards) and the trail is drawn behind
  them in an SVG whose `0 0 6 8` viewBox is one unit to a cell: a rounded square (`SIDE` 0.78,
  `RADIUS` 0.27) under every letter the trail takes, plus a bar from each letter to the next *in the
  order traced* — never to its grid neighbour. The pieces are opaque and one colour; the union is
  the silhouette, and no outline is ever computed, which is the whole reason this construction
  holds. **A bar is as wide as the bead is across that direction, which is not one number**: a
  rounded square is wider corner-to-corner than side-to-side (`support()`), so one fixed bar width
  is flush along a row and steps visibly inside the bead at every diagonal junction — only a circle
  has one width in every direction. Sizing each bar by the bead's support across it makes its long
  edges tangent to the beads at both ends and the union tangent-continuous, on a straight run and
  on a turn alike, where the silhouette goes tangent → bead arc → tangent. The honest cost is that
  a diagonal stretch is ~10% wider than a straight one, which is the mark a square stamp leaves
  dragged corner-first; `RADIUS` is the dial, and at `SIDE / 2` the bead is a circle and the two
  widths meet. Drawing a bar edge-to-edge instead of centre-to-centre breaks the tangency too. A
  cell's ground says how resolved it is — `--stock-sunk` hinted, `--cloth-wash` found,
  `--cloth` in hand — and **a hint draws beads with no bars**, which is the whole of what a hint is:
  the cells without the order. The rounded corners are a deliberate, user-directed exception to the
  system's `radius: 0`, scoped to this one object; the keys under the board and everything else stay
  square. Two earlier attempts are recorded in case they look tempting: a fat polyline through the
  cell centres (wedges and chisel caps at an acute turn) and a ruled table with 3px leaders between
  the letters (legible, but it reads as a diagram rather than as a trail).
- **A drag takes a cell by its middle, not by its edge.** The drag is followed with a window-level
  `pointermove` against the grid's own box, and a cell is entered only within `HIT_RADIUS` (0.42
  cell) of its centre; the corners are dead ground. `pointerenter` on the cells — the obvious
  implementation, and what this replaced — makes a diagonal impossible: going from a cell to the
  one diagonally beyond it the pointer crosses a corner the two cells beside it also meet at, so
  one of those is always taken first and the diagonal becomes two steps. A straight diagonal passes
  0.707 from those centres, which is the ceiling the radius has to stay under. A *tap* still takes
  the whole cell — a press is deliberate where a drag is in passing.
- **A theme word is matched by its letters, not by the trail** — a grid can spell the same word twice,
  and the canonical path is what then lights up. The board is the only place `touch-action: none`
  appears on this site (a trail is dragged across it), which is also why `--play` sizes the grid off
  the viewport's **height**: a board running past the fold leaves nothing to scroll the page by
  except the ~400px of text above it.
- `lineBetween` bridges the cells a fast swipe skipped, but only along a row, a column or a true
  diagonal — anywhere else there is more than one line it could have taken.

`shtigje.v1` stores five things per week — the theme words found, the bonus words found, the words a
hint was spent on, the seconds and the misses — and every number shown is derived from those, so a
stored value cannot disagree with the play and the scoring can be retuned without rewriting anyone's
history. Umami events are `shtigje_open`, `shtigje_word`, `shtigje_bonus`, `shtigje_miss`,
`shtigje_hint`, `shtigje_solve` (carries `p` points, `t` seconds, `m` misses, `b` bonus, `h` hints),
`shtigje_share` and `shtigje_definition`.

## Head metadata and social cards

Every page's `<head>` — description, canonical, Open Graph, Twitter card and JSON-LD — is written by
`MainLayout.astro` from the strings in `src/lib/seo.ts`, and a word page the build did not prerender
has its head rewritten in the browser by `src/lib/documentMeta.ts` from those same helpers. Both sides
must keep calling `seo.ts` rather than spelling a title or a description out: `index.astro` is the 404
catch-all, so the same word is described by whichever of the two rendered it. A word page carries
`DefinedTerm` (one node per homograph) inside the site's `DefinedTermSet`; the home page carries
`WebSite` with the `?q=` `SearchAction`. Canonicals name the directory (`/f/acar/`) because that is
what `@astrojs/sitemap` lists. Nothing on the 404 path asks to be indexed.

**Every word page has its own social card.** `src/lib/ogCard.ts` draws them — the headword, its
labels and its first sense on the page's own sheet — and `src/scripts/ogCards.ts` runs as `postbuild`
to write one per prerendered slug into `dist/og/<slug>.png`, plus `public/og.png` for everything else.
The three games have a card each as well, drawn by the same module as a row of the game's own cells:
they are three files, so they live in `public/` beside the site's card and are committed rather than
built, and `pnpm og:site` redraws all four.
Three things make that affordable and are easy to undo: the cards go into `dist`, never `public`,
which `astro build` would copy a second time; they are drawn from the same slug dictionary the pages
are, so a card exists exactly when its page does; and `sharp` is a devDependency of a version `astro`
already depends on, so it adds no package — it is build-time only, the runtime image is still
`static-web-server` over static files. The fonts it draws with are committed as TrueType in
`src/assets/fonts/` because pango cannot read the woff2 the pages load. In production this is ~40k
images, ~400 MB and a few minutes; `SHOULD_SKIP_WORD_CARDS=true` turns it off and every page falls
back to the site card. Details in [`docs/_claude/seo.md`](docs/_claude/seo.md).

## Caching and the service worker

Nothing is cached by a server here, so the two levers are `sws.toml` — the static-web-server config
the `Dockerfile` copies to `/etc/sws.toml`, which also carries the `--page404` catch-all the CLI flags
used to — and `src/sw.js`, the service worker. The worker serves the sub-indexes from its own cache
and revalidates them conditionally, so a prefix looked up twice costs no request and the site keeps
answering offline; `src/pages/sw.js.ts` stamps it with the build, which is what invalidates the cache.
Three things are easy to undo: the registration in `MainLayout` is a **string** passed to `set:html`,
because Astro emits an expression written inside a `<script>` verbatim and it silently never runs;
`/sw.js` must stay `no-cache`; and a `public/_headers` file would do nothing, since this is the Docker
image behind a Cloudflare proxy rather than Cloudflare Pages. Details, including how to check any of
it, in [`docs/_claude/caching.md`](docs/_claude/caching.md).

## Notes

- `Dockerfile` builds with pnpm via corepack. It must set `NODE_ENV=production` explicitly (npm used to
  do that implicitly for `npm run build --production`; pnpm does not) and must copy `.npmrc`, or
  `prebuild` is skipped and `astro build` fails on the missing `src/data/gen/slug`. `pnpm install` runs
  with `--prod=false` so the devDependencies `astro check` needs survive `NODE_ENV=production`.
- The image is published for **linux/amd64 only**. arm64 was dropped from `docker-publish.yml` because
  building the site under QEMU killed node with a SIGILL (`qemu: uncaught target signal 4`, exit 132)
  part-way through prerendering the word pages. If it ever comes back, add it on a native arm64 runner
  rather than through emulation — and leave the build stage's `--platform=$BUILDPLATFORM` pin in place,
  which keeps that stage on the builder's architecture (`dist` is static files, so one build serves any
  target; only the `static-web-server` runtime stage is per-architecture). The `ARG BUILDPLATFORM`
  default above it is for the legacy builder, which leaves the value empty and fails to parse the
  platform; BuildKit sets it itself.
- `prebuild` runs `src/scripts/preprocess.ts` through node's native type stripping — no ts-node. That
  needs node >= 22.18 (see `engines`) and is why the `.ts` imports carry explicit `.ts` extensions.
- `pnpm-workspace.yaml` `overrides` are security floors for transitive deps. Re-check `pnpm audit`
  after any upgrade and drop the entries that are no longer needed.
- `typescript` is held at `^6` on purpose: `@astrojs/check` still declares a
  `^5.0.0 || ^6.0.0` peer range, so bumping to 7 breaks `astro check` (and therefore `pnpm build`).
- There is no lodash. `src/lib/utils.ts` holds the small replacements (`sortByKey`, `isSameList`,
  `intersectBy`, `debounce`). `intersectBy` deliberately keeps lodash `intersectionBy`'s dedupe-by-key
  behaviour, and `SearchBar` relies on an absent stem key staying `undefined` rather than `[]` — an
  empty list there would wipe out the intersection instead of being skipped.
- **The islands are Preact with `compat` on**, which is what `preact({ compat: true })` in
  `astro.config.mjs` buys: the components still `import … from 'react'` and Vite aliases that to
  `preact/compat`. Three things hang off that and are easy to undo by accident. `compat` is what
  rewrites `onChange` to `oninput` on a text input — turn it off and the search field stops filtering
  until it loses focus, silently. `client:only` islands must say `"preact"`, not `"react"`, or they
  never mount. And `tsconfig.json` repeats the alias in `paths`, because Vite's alias means nothing to
  `astro check`. Preact's typings are stricter in two places worth knowing: a timer ref is
  `useRef<ReturnType<typeof setTimeout> | undefined>(undefined)`, and DOM props are spelled the HTML
  way (`spellcheck`), not React's.
- `src/styles/fonts.scss` declares Alegreya's `@font-face` blocks by hand instead of importing
  `@fontsource-variable/alegreya/index.css`, which would also ship Cyrillic, Greek and Vietnamese —
  ten woff2 files no page here can ask for. Only the Latin subsets are declared, pointing straight at
  the package's `files/*.woff2`. When the package is upgraded, check those file names: nothing fails
  loudly if one is renamed.
- `.design-sync/`, `.ds-sync/` and `ds-bundle/` are tooling for bundling the UI components as a
  design-system package — not part of the site build. `.design-sync/NOTES.md` records the pnpm migration
  and dependency-upgrade details.
