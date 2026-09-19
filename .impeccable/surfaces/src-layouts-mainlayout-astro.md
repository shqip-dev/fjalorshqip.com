---
version: 1
slug: "src-layouts-mainlayout-astro"
primary_target: "src/layouts/MainLayout.astro"
related_targets: ["src/pages/index.astro","src/pages/f/[slug].astro","src/pages/rreth.mdx","src/components/searchbar/SearchBar.tsx","src/components/entries/Entries.tsx","src/components/notfound/NotFound.tsx"]
---

Scope: whole site — home/search, `/f/<slug>`, `Rreth`, 404, shared layout. Visitor mode: **Operate**.

Audience and job: students in AL/XK mid-homework on a phone (often typing without `ë`/`ç`), diaspora and learners, translators mid-work on desktop, and search-engine arrivals who land straight on a word page and never see the home page. A lookup always interrupts something else; success is word in, meaning out, back to work.

Content truth the design exists to expose: 39,897 entries, a 25-label grammatical taxonomy (`sh.` 15,891 · `f.` 10,512 · `m.` 9,979 · `kal.` 3,054 … `zool.` `bot.` `mjek.`), 2,113 homograph words with up to 6 entries, `*` idiom blocks, `a) b)` sub-senses, `shih te BËJ` cross-references. All of it currently ships as one grey paragraph.

Constraints: static-only, Albanian-only UI, no ads. Untouched: `/f/<slug>` URLs and per-word title/description, the Umami `search_v2` event, `/opensearch.xml` and the `q` param, the build-time indexing pipeline and the 3-char prefix contract.

Memorable moment: the guide words. A printed dictionary's running head tells you where in the alphabet you stand; here it is also literally which prefix shard the browser fetched, so metaphor and mechanism are the same object.

Unresolved: whether idiom/cross-reference parsing moves into `src/scripts/preprocess.ts`. Built render-side for now, deliberately, so the index contract is untouched.

## Direction contract

THESIS: The dictionary that happens to be a website, not a search engine with a dictionary behind it. The *Fjalor i Gjuhës së Sotme Shqipe* (1980) rebuilt as an interface — guide words, label stack, numbered senses, cross-references as links. It refuses the centered box on white that every dictionary ships, and refuses equally the soft cream-and-literary-serif rendition of "old book" that the incumbent site and every AI tool default to.

OWN-WORLD: Two materials, not one. Cover cloth — oxblood `#6B1D1F`, deep `#4A1214`, gold foil `#C9A227` — owns the chrome at page scale. Text block — cool grey-green academy stock `#E4E5DC`, ink `#1C1A17`, muted `#55514A`, hairline rules `#B9B8AE`. Alegreya (variable) for everything set, Alegreya SC for guide words and cross-references. Bold caps headwords, italic abbreviation stack, bold sense numbers, hairline column rule. No shadows, no radii above 2px, no gradients: this world is printed, so depth is rule weight and ink density.

STORY: The visitor types two or three letters without diacritics, sees real entries (headword, labels, first sense) rather than bare terms, presses Enter or clicks, and reads a set entry whose structure is visible — senses numbered, idioms separated, cross-references live. They leave in seconds and can link the page to someone else.

FIRST VIEWPORT: Home — cloth field across the top carrying the wordmark and the guide-word rail; the search field set on the rule beneath it at full measure, caret already in it; below, calm stock and nothing else until a key is pressed. Word page — the same cloth head, guide words showing the word's alphabetical neighbours, then the headword at display scale on stock, its label stack beneath, senses numbered down a single measure (two columns from 900px), idioms and cross-references as their own blocks. Primary action is the field, present on every page, `/` to focus.

FORM: Fjalori 1980, position 1 on my ordered grounded list, chosen by the user over the roll's assignment (index 4, Programi); seed key ae55ec38. Code-led build.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
