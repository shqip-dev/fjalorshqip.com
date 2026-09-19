# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`fjalorshqip.com` — an Albanian dictionary site built with Astro 7 + React 19 islands. It ships as
**static files only**: no application server, no database, no request-time code. Search runs entirely in
the browser against JSON indexes generated at build time. Deployed to Cloudflare Pages, plus a Docker
image published to ghcr.io by `.github/workflows/docker-publish.yml`.

## Docs

- `docs/README.md`, `docs/kerkimi.md` and `docs/fjalez.md` are user/contributor-facing and are
  **written in Albanian — keep them that way**, as is all UI copy and page content.
- `docs/_claude/` holds English detail referenced from here. Read
  [`docs/_claude/search-indexing.md`](docs/_claude/search-indexing.md) before touching the indexing
  pipeline, the search bar, or the word-page routes.

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

There is no test suite and no linter beyond `astro check` (`.prettierrc`: 2 spaces, single quotes).

### Building locally requires an env gate

`prebuild` only emits entries when `NODE_ENV=production` **or** `DICTIONARY_SUBSET` is set (see
`src/lib/env.ts`). With neither, it writes zero entries and the subsequent `astro build` fails on the
missing `src/data/gen/slug` directory — that is env-gating, not a bug. For a fast, bounded end-to-end
build:

```sh
DICTIONARY_SUBSET='["AÇ","ACAR"]' pnpm build
```

Other env vars: `SHOULD_SKIP_STATIC_WORD_PAGES=true` skips prerendering `/f/<slug>` pages;
`CLOUDFLARE=true` caps static word pages at ~14k (Cloudflare Pages' 20k-file limit); `META_TAGS` is a
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

- **One character to a box.** `splitLetters` is a plain character split and is what counts a word's
  length everywhere — the puzzle list, the guess-list generator and the board all go through it. A
  letter written with two characters (DH, SH, RR, …) fills two boxes, so `GARDH` is five and `SHTËPI`
  is not a five-letter word here. The keyboard is QWERTY with Ë after P and Ç after L (no W — the
  alphabet has none).
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

## Notes

- `Dockerfile` builds with pnpm via corepack. It must set `NODE_ENV=production` explicitly (npm used to
  do that implicitly for `npm run build --production`; pnpm does not) and must copy `.npmrc`, or
  `prebuild` is skipped and `astro build` fails on the missing `src/data/gen/slug`. `pnpm install` runs
  with `--prod=false` so the devDependencies `astro check` needs survive `NODE_ENV=production`.
- The build stage is pinned to `--platform=$BUILDPLATFORM`, so it is **never emulated**. The image is
  published for amd64 and arm64, and building the site under QEMU for arm64 killed node with a SIGILL
  (`qemu: uncaught target signal 4`, exit 132) part-way through prerendering the word pages. `dist` is
  static files with nothing architecture-specific in it, so one build serves both targets; only the
  `static-web-server` runtime stage is built per architecture. Keep the `ARG BUILDPLATFORM` default
  above it — BuildKit sets the value itself, but the legacy builder leaves it empty and fails to parse
  the platform.
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
- `.design-sync/`, `.ds-sync/` and `ds-bundle/` are tooling for bundling the React components as a
  design-system package — not part of the site build. `.design-sync/NOTES.md` records the pnpm migration
  and dependency-upgrade details.
