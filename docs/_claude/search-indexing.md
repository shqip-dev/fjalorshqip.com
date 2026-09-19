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
- `stem/<prefix>.json` — `stem → Entry[]`, the search index.
- `slug/<prefix>.json` — `slug → Entry[]`, the client-side fallback index.

## Invariants

1. **`getStems` must be identical on both sides.** `preprocess.ts` builds the index keys with it and
   `SearchBar` normalizes the typed query with it. Changing it on one side silently returns zero results;
   changing it at all requires a rebuild of `src/data/gen/`.
2. **Stems and slugs normalize differently on purpose.** Stems fold `ë→e` / `ç→c` so a user typing
   without Albanian diacritics still matches. Slugs double them (`ë→ee` / `ç→cc`) to stay collision-free
   and reversible as URLs. Do not unify them.
3. **`getStemPrefix` (first 3 chars, else `_`) is the file-name contract.** It decides both the generated
   file names and the URL `SearchBar`/`EntriesLoader` fetch. Any change is a coordinated change across
   generation and both clients. Longer prefixes mean smaller files but more of them, against Cloudflare
   Pages' 20k-file cap.
4. **`index.astro` is also the 404 catch-all.** The Docker image serves it for unknown paths
   (`static-web-server --page404 index.html`), and the hosting is expected to do the same, which is how
   `DynamicEntries` gets a chance to render a non-prerendered `/f/<slug>`. Don't make the homepage assume
   it is only ever `/`.
5. **`src/data/gen/` is generated and gitignored.** Never hand-edit; run `pnpm prebuild`.

## Client details

`SearchBar` debounces sub-index loads by 200 ms and caches them in a module-level `stems` object keyed by
prefix, so typing further characters within the same 3-char prefix costs no network. Multi-word queries
fetch one sub-index per word and `intersectionBy(term)` the results. Ranking is `leven(entry.term, query)`
against the raw query, capped at `MAX_SUGGESTIONS = 10`. A missing sub-index (404) is treated as an empty
index, not an error. Queries are reported to Umami as a `search_v2` event with a per-document random id
(`document.__fjalorshqip__`).

## Known limitations (documented for users in `docs/kerkimi.md`)

Terms under 3 characters all collapse into `_.json`; a typo inside the first three characters can't be
recovered from, since those characters select the file; no full-text search over definitions; no
morphological analysis, so inflected forms don't resolve to their base entry.
