/*
 * What a page says about itself — the title, the description, the social card
 * and the structured data — computed in one place because two different things
 * say it. `MainLayout` says it at build time for a prerendered page, and
 * `documentMeta` says it in the browser for a word page the build did not
 * prerender (`index.astro` doubles as the 404 catch-all — see
 * docs/_claude/search-indexing.md). The same word must come out the same way
 * on both paths, so neither writes these strings itself.
 *
 * Keep this file free of node-only imports: it is bundled into the islands.
 */
import type { Entry } from './dictionary.ts';
import { getGist } from './entryFormat.ts';
import { SEARCH_QUERY_PARAM } from './search.ts';

export const SITE_NAME = 'Fjalor Shqip';
export const SITE_HOST = 'fjalorshqip.com';
export const SITE_TAGLINE = 'Fjalor i gjuhës shqipe';
export const SITE_DESCRIPTION =
  'Fjalor shpjegues i gjuhës shqipe — kuptimi i fjalëve, kërkim i menjëhershëm në shfletues.';

export const LANGUAGE = 'sq';
export const LOCALE = 'sq_AL';

/*
 * The social cards. Every word page has its own — `src/scripts/ogCards.ts`
 * draws them into `dist/og/` after the build — and everything else shares the
 * site's card, which is also the fallback when a build skips the word cards.
 * Both are drawn by `src/lib/ogCard.ts`, which this file must not import: that
 * one is node-only and this one is bundled into the islands.
 */
export const SITE_CARD_FILENAME = 'og.png';
export const WORD_CARD_DIR = 'og';
export const OG_IMAGE = `/${SITE_CARD_FILENAME}`;
export const OG_IMAGE_WIDTH = '1200';
export const OG_IMAGE_HEIGHT = '630';
export const OG_IMAGE_ALT = `${SITE_NAME} — ${SITE_TAGLINE.toLowerCase()}`;

export const getWordCardPath = (slug: string) => `/${WORD_CARD_DIR}/${slug}.png`;

/*
 * The games' cards. Fjalëz and Lëmsh are the only pages besides a word's whose
 * card is worth drawing — a link to a game should unfurl as its board, not as
 * the dictionary in general. They live in `public/` beside the site's card
 * rather than in `dist/og/`: two files are not the 40k the words are, so the
 * copy `astro build` makes of them costs nothing and the pages can name them in
 * `astro dev` too. `pnpm og:site` redraws all three.
 */
export const GAME_CARD_FILENAMES = {
  fjalez: 'og-fjaleez.png',
  lemsh: 'og-leemsh.png',
} as const;

export type GameKey = keyof typeof GAME_CARD_FILENAMES;

export const getGameCardPath = (game: GameKey) => `/${GAME_CARD_FILENAMES[game]}`;

export const getWordImageAlt = (term: string) =>
  `${term} — ${SITE_TAGLINE.toLowerCase()}`;

/** The longest a `<meta name="description">` is worth writing. */
const DESCRIPTION_LIMIT = 155;

/** The longest definition text worth repeating inside a `DefinedTerm`. */
const SCHEMA_DESCRIPTION_LIMIT = 900;

const SENTENCE_END = /[.!?…:;]$/;

const withStop = (text: string) => (SENTENCE_END.test(text) ? text : `${text}.`);

/*
 * The site is prerendered as directories (`/f/acar/index.html`) and the sitemap
 * names the directory, so every canonical here does too — otherwise the two
 * disagree about what the page's address is.
 */
export const getCanonicalUrl = (pathname: string, siteUrl: string) => {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  return new URL(path.replace(/^\/+/, ''), siteUrl).href;
};

/** A site-absolute path (`/og.png`) as a full URL, honouring a sub-path site. */
export const getAssetUrl = (path: string, siteUrl: string) =>
  new URL(path.replace(/^\/+/, ''), siteUrl).href;

export const getWordUrl = (slug: string, siteUrl: string) =>
  new URL(`f/${slug}/`, siteUrl).href;

export const getWordTitle = (term: string) =>
  `${term} | Kuptimi i fjalës | ${SITE_HOST}`;

/** What a shared link is titled: the headword, without the site's own name. */
export const getWordSocialTitle = (term: string) => `${term} — kuptimi i fjalës`;

export const getMissingWordTitle = (term: string) =>
  `${term} | Fjala nuk u gjet | ${SITE_HOST}`;

export const getWordDescription = (entries: Entry[]) => {
  const term = entries[0]?.term || '';
  const lead = `Kuptimi i fjalës ${term}`;
  const gist = getGist(
    entries[0]?.definitions || [],
    Math.max(40, DESCRIPTION_LIMIT - lead.length - 2)
  );

  return gist
    ? `${lead}: ${withStop(gist)}`
    : `${lead} në gjuhën shqipe. Definicioni i ${term}.`;
};

/*
 * The definitions as one run of plain text. The `*` that opens the idiom block
 * is structure for `formatDefinition` to render, not punctuation, so it is
 * dropped rather than shown to a parser that expects prose.
 */
const getPlainDefinitions = (definitions: string[]) => {
  const text = definitions
    .map((definition) =>
      definition
        .split('*')
        .map((chunk) => chunk.trim())
        .filter((chunk) => chunk !== '')
        .join(' ')
    )
    .filter((definition) => definition !== '')
    .join(' ');

  if (text.length <= SCHEMA_DESCRIPTION_LIMIT) {
    return text;
  }

  const cut = text.slice(0, SCHEMA_DESCRIPTION_LIMIT);
  const lastSpace = cut.lastIndexOf(' ');
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}…`;
};

type SchemaNode = Record<string, unknown>;

const getDictionaryId = (siteUrl: string) => new URL('#fjalor', siteUrl).href;

const getDictionaryNode = (siteUrl: string): SchemaNode => ({
  '@type': 'DefinedTermSet',
  '@id': getDictionaryId(siteUrl),
  name: SITE_NAME,
  alternateName: SITE_HOST,
  description: SITE_DESCRIPTION,
  url: siteUrl,
  inLanguage: LANGUAGE,
});

/*
 * A word page's structured data: the entry (or one node per homograph) as a
 * `DefinedTerm` inside the dictionary it belongs to. This is the shape a
 * dictionary result is read for, and it is the only thing on the page that
 * carries the senses in a machine-readable form.
 */
export const getWordSchema = (
  entries: Entry[],
  siteUrl: string
): SchemaNode[] => {
  if (entries.length === 0) {
    return [];
  }

  const url = getWordUrl(entries[0].slug, siteUrl);
  const homographs = entries.length > 1;

  return [
    getDictionaryNode(siteUrl),
    ...entries.map((entry, index) => {
      const description = getPlainDefinitions(entry.definitions);

      return {
        '@type': 'DefinedTerm',
        '@id': homographs ? `${url}#fjala-${index + 1}` : `${url}#fjala`,
        name: entry.term,
        url,
        inLanguage: LANGUAGE,
        ...(description ? { description } : {}),
        inDefinedTermSet: { '@id': getDictionaryId(siteUrl) },
      } satisfies SchemaNode;
    }),
  ];
};

/*
 * The home page's structured data. The `SearchAction` names the same `?q=`
 * entry point the OpenSearch descriptor does — `SEARCH_QUERY_PARAM` is shared
 * so the three of them cannot drift apart.
 */
export const getSiteSchema = (siteUrl: string): SchemaNode[] => [
  {
    '@type': 'WebSite',
    '@id': new URL('#faqja', siteUrl).href,
    name: SITE_NAME,
    alternateName: SITE_HOST,
    description: SITE_DESCRIPTION,
    url: siteUrl,
    inLanguage: LANGUAGE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}?${SEARCH_QUERY_PARAM}={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  },
  getDictionaryNode(siteUrl),
];

/*
 * JSON-LD goes into an inline `<script>`, so a `<` that survives from a
 * definition would end the element early. Escaping it is the whole guard.
 */
export const serializeSchema = (nodes: SchemaNode[]) =>
  JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': nodes,
  }).replaceAll('<', '\\u003c');
