# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Four confirmed audiences, all served by the same two surfaces (the search home page and a word page):

- **Students in Albania and Kosovo** — looking up a word for homework, an essay, or an exam, usually on
  a phone and in a hurry. The most time-pressured use.
- **Diaspora Albanians and language learners** — often typing on a keyboard without `ë` and `ç`, which is
  why search normalizes `ë → e` and `ç → c` (see `docs/kerkimi.md`).
- **Writers, translators, journalists, editors** — checking a meaning or a grammatical attribute
  mid-work, typically on desktop, often consulting several words in a session.
- **Search-engine arrivals** — people who search for a word's meaning and land directly on
  `/f/<fjala>`. They arrive for one word and may never see the home page, so a word page must stand
  alone: it carries its own search bar and its own title/description.

## Product Purpose

A dictionary of the Albanian language that answers a lookup instantly and for free. The original
fjalorshqip.com stopped working; this is a rebuild on the expired domain, open source so it cannot
quietly disappear again (`src/pages/rreth.mdx`).

Success is a user who types a word and has its meaning in front of them with no waiting, no account, no
ads, and no interruption.

## Positioning

**Instant, frictionless lookup is the promise everything else serves.** You type, it answers.

The mechanism behind it is unusual and is the thing a neighboring product could not trivially copy: the
whole dictionary — ~40k entries, ~14 MB of source data — is preprocessed at build time into hundreds of
small per-prefix JSON sub-indexes. The browser computes which single sub-index it needs, fetches a few
kilobytes, and ranks locally. One HTTP request per search, no server, no database, no request-time code.
The speed and the quiet *are* the product.

## Operating Context

- Two surfaces only: the home page (`/`, search) and the word page (`/f/<slug>`), plus a short `Rreth`
  page. The home page also doubles as the 404 catch-all and renders non-prerendered word pages client
  side.
- Entry from outside is common: an OpenSearch descriptor (`/opensearch.xml`) lets the browser search bar
  query the site directly via `/?q={searchTerms}`, and `SearchBar` seeds itself from that `q` param.
- Sessions are short and often mobile. A lookup is rarely the task — it interrupts writing, reading, or
  studying, and must return the user to it quickly.
- Deployed to Cloudflare Pages; also published as a Docker image serving the same static output.

## Capabilities and Constraints

**Confirmed capabilities**

- Type-ahead search over the dictionary with diacritic-insensitive matching, suggestions ranked by
  Levenshtein distance to the query, capped at 10.
- A permanent, linkable page per word at `/f/<slug>`, showing the term, its grammatical attributes, and
  its numbered definitions; the ones not prerendered are rendered in the browser from the same indexes.
- Grammatical attributes (`m.`, `ndajf.`, `krahin.`, …) are parsed out of the raw term and kept as
  separate data, not baked into the word.
- Browser-level search integration through OpenSearch.

**Durable constraints**

- **Static-only, forever.** No application server, no database, no request-time code. The site must stay
  deployable as a plain folder of files. This is the load-bearing constraint: every feature has to be
  expressible as build-time generation plus browser-side work.
- **No ads and no monetization.** Free and uncluttered. Analytics stay limited to the current
  lightweight Umami setup.
- **Albanian-only interface.** All UI copy, page content, and the user-facing docs (`docs/README.md`,
  `docs/kerkimi.md`) stay in Albanian. No English or multilingual UI.
- Hosting file-count limits are real: Cloudflare Pages allows 20k files, so prerendered word pages are
  capped around 14k and the rest are served dynamically from the sub-indexes.
- The 3-character prefix contract is a shared contract between the build-time generator and the browser
  client; keys shorter than 3 characters live in a `_` bucket.

**Explicitly undecided**

- How far search should go beyond exact-match (typo tolerance, inflected forms, multi-word phrases,
  searching inside definitions). `src/pages/rreth.mdx` states plainly that search is not yet advanced
  and that improving it is a goal.

## Brand Commitments

- Name: **Fjalor Shqip** / fjalorshqip.com. The domain is part of the identity — this is the revival of a
  resource people already knew by that name.
- Voice: plain, unadorned Albanian. The existing copy explains itself honestly, including its own
  limitations ("Mënyra e kërkimit nuk është e avancuar").
- Open source, publicly: the code link sits in the footer of every page, next to `ballina` and `rreth`.
- Contact channels in use: contact@shqip.dev, a Discord, and the GitHub repository.

## Evidence on Hand

- `data/dictionary.json` — ~14 MB, roughly 40k entries, the real corpus. Derived from the original
  fjalorshqip.com dictionary; `src/pages/rreth.mdx` states an MIT license is planned but not yet
  attached. Do not assert a license or rights beyond what that page already says.
- Real analytics: Umami is live in production and a `search_v2` event records queries, which has already
  been used to detect words missing from the dictionary (commit `0e92a69`).
- Existing written documentation in Albanian: `docs/README.md` and `docs/kerkimi.md`.
- The archived original site (WebArchive link in `rreth.mdx`) is the historical reference for what this
  replaces.
- No testimonials, user counts, traffic figures, press, partnerships, or funding exist. Do not invent
  any.

## Product Principles

1. **The answer beats the interface.** A user came for one word. Everything on screen is measured by how
   fast it gets them to that meaning and out again.
2. **Nothing between the user and the word.** No account, no ad, no modal, no consent wall, no
   "related products". Free and uninterrupted is a product commitment, not a phase.
3. **Static is a feature, not a limitation.** Cheap to host, impossible to break at request time,
   trivially archivable — which is exactly why the original site's death cannot repeat here. New
   features are designed to fit this, not to argue with it.
4. **Forgive the keyboard.** Many users cannot or will not type `ë` and `ç`. Input handling accommodates
   them rather than expecting correctness.
5. **Every word page stands on its own.** Most arrivals skip the home page entirely; a word page must be
   complete, searchable, and linkable by itself.

## Accessibility & Inclusion

No product-specific standard has been set. Two facts already in the build constrain future work: the
layout is mobile-first in practice (most student lookups are on phones), and the layout ships a
skip-to-content link that must survive.
