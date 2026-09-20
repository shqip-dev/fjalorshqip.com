# Search & indexing internals

English companion to `docs/kerkimi.md` (which is the Albanian, user-facing explanation). This file is
the file-level map plus the invariants that are easy to break while editing.

## Why it is built this way

The site ships as static files only — no application server, no database, no request-time code. The
dictionary source is ~14 MB / ~40k entries, so the search index is computed at build time and split into
small per-prefix JSON files. The browser resolves a query to exactly one file name, fetches it, and does
the rest of the work locally.

## Pipeline

| Stage | File | Output |
| :-- | :-- | :-- |
| Source | `data/dictionary.json` | `{term, definition[], exact_term?, skip?}[]`, ~40k records |
| Build-time generation | `src/scripts/preprocess.ts` (`pnpm prebuild`) | `src/data/gen/**` (gitignored) |
| Key derivation | `src/lib/process.ts` | `getStems`, `getSlug`, `getStemPrefix` |
| Read/write helpers | `src/lib/dictionary.ts`, `src/lib/files.ts` | path templates live here, not in callers |
| Static JSON endpoints | `src/pages/api/{stem,slug}-index/[...].json.ts` | `/api/{stem,slug}-index/<prefix>.json` |
| Prerendered word pages | `src/pages/f/[slug].astro` | `/f/<slug>/index.html` |
| Client search | `src/components/searchbar/SearchBar.tsx` | — |
| Client fallback rendering | `DynamicEntries` → `EntriesLoader` | — |

`preprocess.ts` dedups (sort by term, drop adjacent records with equal term + deep-equal definitions),
drops `skip: true`, then maps each record: whitespace-split the term, parts ending in `.` become
`attributes`, the rest is `term`; leading `1. ` numbering is stripped from definitions only when there is
more than one definition.

Three artifacts land in `src/data/gen/`:
- `slugDictionary.json` — `slug → Entry[]`, consumed by `getStaticPaths` in `f/[slug].astro`.
- `stem/<prefix>.json` — `stem → SearchEntry[]`, the search index.
- `slug/<prefix>.json` — `slug → Entry[]`, the client-side fallback index.

`SearchEntry` is not `Entry`: it is `{term, attributes, stems, slug, gist}`, where `gist` is
`getGist(entry.definitions)` computed at build time. A result row renders exactly those fields, so the
definitions never travel with a search — the `shk` bucket is 87 KB / 22 KB gzip instead of 198 KB /
61 KB. The definitions are in the slug index, which is what a word page reads. Putting them back in the
stem index would cost every search the difference.

## Invariants

1. **`getStems` must be identical on both sides.** `preprocess.ts` builds the index keys with it and
   `SearchBar` normalizes the typed query with it. Changing it on one side silently returns zero results;
   changing it at all requires a rebuild of `src/data/gen/`.
2. **Stems and slugs normalize differently on purpose.** Stems fold `ë→e` / `ç→c` so a user typing
   without Albanian diacritics still matches. Slugs double them (`ë→ee` / `ç→cc`) to stay collision-free
   and reversible as URLs. Do not unify them.
3. **`getStemPrefix` (first 3 chars, else `_`) is the file-name contract.** It decides both the generated
   file names and the URL `SearchBar`/`EntriesLoader` fetch. Any change is a coordinated change across
   generation and both clients. Longer prefixes mean smaller files but more of them, which a static host
   may cap.
4. **`index.astro` is also the 404 catch-all.** The Docker image serves it for unknown paths
   (`static-web-server --page404 index.html`), and the hosting is expected to do the same, which is how
   `DynamicEntries` gets a chance to render a non-prerendered `/f/<slug>`. Don't make the homepage assume
   it is only ever `/`. That includes its `<head>`, which arrives describing the home page and is
   rewritten by `src/lib/documentMeta.ts` — see [`seo.md`](seo.md).
5. **`src/data/gen/` is generated and gitignored.** Never hand-edit; run `pnpm prebuild`.

## Client details

`SearchBar` debounces sub-index loads by 200 ms and caches them in a module-level `stems` object keyed by
prefix, so typing further characters within the same 3-char prefix costs no network. Within the fetched
bucket it takes the exact stem key *plus every key that starts with it* (`matchStem`), which is what makes
three characters behave as type-ahead — the bucket is already in memory, so this costs no request and no
change to the generated indexes. Multi-word queries fetch one sub-index per word and `intersectBy(term)`
(`src/lib/utils.ts` — there is no lodash) the results. Ranking is exact-stem first, then
`Intl.Collator('sq')` on the term, then `leven` between the joined stems and the joined query stems as a
tie-break — so edit distance only separates entries the collator calls equal, i.e. homographs sharing a
headword. Capped at `MAX_SUGGESTIONS = 10`; candidates per bucket are capped at
`MAX_CANDIDATES = 800`. A missing sub-index (404) is treated as an empty index, not an error. Queries
are reported to Umami as a `search_v2` event with a per-document random id (`document.__fjalorshqip__`).

## Known limitations (documented for users in `docs/kerkimi.md`)

Terms under 3 characters all collapse into `_.json`; a typo inside the first three characters can't be
recovered from, since those characters select the file; no full-text search over definitions; no
morphological analysis, so inflected forms don't resolve to their base entry.

## Render-time entry formatting

`src/lib/entryFormat.ts` parses the structure the scraped definitions already carry — `*` opens the idiom
block, `shih te BËJ` names a cross-reference target in capitals — and `Entries` renders those as a labelled
block and as real links. This runs at render time on purpose: `preprocess.ts` and `src/data/gen/` are
untouched, so the prefix contract is unaffected. Moving it to build time later is an optimisation, not a
rewrite. `getTermFromSlug` reverses the `ë → ee` / `ç → cc` doubling to name a word the dictionary lacks.

## Guide words: one rule, two implementations

The neighbours shown above a headword span the **3-character sub-index the word lives in**, not the whole
dictionary. `f/[slug].astro` buckets by `getStemPrefix(slug)` at build time and `EntriesLoader.getNeighbours`
buckets the fetched `/api/slug-index/<prefix>.json` in the browser; both sort by term with
`Intl.Collator('sq')`. They must keep agreeing — most word pages are not prerendered, so the same word would
otherwise name different neighbours depending on which path rendered it. A word at a bucket edge has no
neighbour on that side, which is correct: a printed page ends too.
