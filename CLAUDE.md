# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`fjalorshqip.com` — an Albanian dictionary site built with Astro 7 + React 19 islands. It ships as
**static files only**: no application server, no database, no request-time code. Search runs entirely in
the browser against JSON indexes generated at build time. Deployed to Cloudflare Pages, plus a Docker
image published to ghcr.io by `.github/workflows/docker-publish.yml`.

## Docs

- `docs/README.md` and `docs/kerkimi.md` are user/contributor-facing and are **written in Albanian —
  keep them that way**, as is all UI copy and page content.
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

## Notes

- `Dockerfile` builds with pnpm via corepack. It must set `NODE_ENV=production` explicitly (npm used to
  do that implicitly for `npm run build --production`; pnpm does not) and must copy `.npmrc`, or
  `prebuild` is skipped and `astro build` fails on the missing `src/data/gen/slug`. `pnpm install` runs
  with `--prod=false` so the devDependencies `astro check` needs survive `NODE_ENV=production`.
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
