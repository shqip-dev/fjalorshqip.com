# design-sync notes — fjalorshqip.com

This repo is an **Astro website** (Albanian dictionary), not a component library. The
synced "design system" is the handful of React island components under `src/components/`.
Source shape is **package / synth-entry** (no `dist/`, no `.d.ts` — components are bundled
straight from `src/`).

## Toolchain / install
- Package manager is **pnpm** (migrated from npm 2026-06-17). `.npmrc` sets
  `enable-pre-post-scripts=true` so `pnpm build` runs the `prebuild` data-gen step the way
  `npm run build` used to. Native build scripts (esbuild, sharp, @parcel/watcher) are
  approved in `pnpm-workspace.yaml` `allowBuilds`.
- All deps upgraded to latest 2026-06-17 (astro 6, react 19, framer-motion 12). `pnpm audit`
  is clean; transitive `esbuild`/`yaml` pinned via `pnpm-workspace.yaml` `overrides`.
- Two upgrade fixes landed in source: `framer-motion` `transition={{ type:'ease-in' }}` →
  `{{ ease:'easeIn' }}` (SearchBar), and `import '@fontsource-variable/eb-garamond'` →
  `.../index.css` (MainLayout) for type resolution.

## Build / data
- `prebuild` (`src/scripts/preprocess.ts`, ts-node/esm) generates `src/data/gen/` from the
  14 MB `data/dictionary.json` (39,897 entries). It only emits entries when
  `NODE_ENV=production` OR `DICTIONARY_SUBSET=["term",...]` is set — otherwise 0 entries and
  the full `astro build` fails on missing `src/data/gen/slug` (pre-existing, env-gated, not a
  bug). A bounded build with `DICTIONARY_SUBSET='["AÇ","ACAR"]'` builds clean end-to-end.

## Component-bundling risks (for the converter)
- `SearchBar`, `Entries`, `NotFound` import `.module.scss` (CSS-modules SCSS). The converter's
  esbuild has no `.scss` loader — this is the main bundling blocker to solve.
- App-coupled behavior to handle in previews: `SearchBar` uses a `umami` global + `fetch`;
  `EntriesLoader` fetches on mount (renders "Loading..." statically); `DynamicEntries` reads
  `window.location.pathname`. `Entries`, `NotFound`, `FooterLinks` are pure/presentational.
