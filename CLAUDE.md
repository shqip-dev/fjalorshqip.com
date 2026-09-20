# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`fjalorshqip.com` — an Albanian dictionary site built with Astro 7 + Preact 10 islands. It ships as
**static files only**: no application server, no database, no request-time code. Search runs entirely in
the browser against JSON indexes generated at build time. It is served from any static host; a Docker
image is published to ghcr.io by `.github/workflows/docker-publish.yml`.

## Docs

- `docs/README.md`, `docs/kerkimi.md`, `docs/fjalez.md` and `docs/lemsh.md` are user/contributor-facing and are
  **written in Albanian — keep them that way**, as is all UI copy and page content.
- `docs/_claude/` holds English detail referenced from here. Read
  [`docs/_claude/search-indexing.md`](docs/_claude/search-indexing.md) before touching the indexing
  pipeline, the search bar, or the word-page routes, and
  [`docs/_claude/seo.md`](docs/_claude/seo.md) before touching what a page says about itself — the
  head, the social card or the JSON-LD.

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
| `pnpm fjalez:words` | Regenerate `src/data/fjalez/guesses.json` (Fjalëz guess list) |
| `pnpm lemsh:words` | Regenerate `src/data/lemsh/rounds.json` (Lëmsh days) |
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
- **The guess list is committed, not generated at build time.** `src/data/fjalez/guesses.json` (3.5k
  words) comes from `pnpm fjalez:words` and is in git, because `prebuild` is env-gated down to a
  subset in development and the game may not depend on that gate. `/api/fjaleez/fjalee.json` serves it
  and the board fetches it once.
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
  Fjalëz's guess list is: `prebuild` is env-gated down to a subset in development and a game may not
  depend on that gate. The generator validates every pooled word against `data/dictionary.json` (the
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
Three things make that affordable and are easy to undo: the cards go into `dist`, never `public`,
which `astro build` would copy a second time; they are drawn from the same slug dictionary the pages
are, so a card exists exactly when its page does; and `sharp` is a devDependency of a version `astro`
already depends on, so it adds no package — it is build-time only, the runtime image is still
`static-web-server` over static files. The fonts it draws with are committed as TrueType in
`src/assets/fonts/` because pango cannot read the woff2 the pages load. In production this is ~40k
images, ~400 MB and a few minutes; `SHOULD_SKIP_WORD_CARDS=true` turns it off and every page falls
back to the site card. Details in [`docs/_claude/seo.md`](docs/_claude/seo.md).

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
