import { getSlug } from './process.ts';

/*
 * The scraped definitions carry more structure than they look like they do:
 * a `*` opens the entry's idiom block, and the book's cross-references are
 * written as `shih te BËJ` with the target set in capitals. This module turns
 * both into something renderable.
 *
 * `formatDefinition` runs at render time on purpose — `src/scripts/preprocess.ts`
 * and the generated indexes stay untouched, so the 3-char prefix contract and
 * the shape of `src/data/gen/` are unaffected. `getGist` below is the one part
 * that does run at build time, because what it produces is all the search index
 * needs to keep.
 */

export interface TextPart {
  kind: 'text';
  text: string;
}

export interface RefPart {
  kind: 'ref';
  text: string;
  slug: string;
}

export type Part = TextPart | RefPart;

export interface FormattedDefinition {
  sense: Part[];
  idioms: Part[][];
}

// `shih te BËJ`, `shih të HEDH`, `shih tek ARI I MADH` — the target is the
// run of capitals that follows, which is how the printed dictionary sets it.
const CROSS_REFERENCE = /\bshih\s+t[eë]k?\s+([A-ZÇËÊÁÍÚ]{2,}(?:[\s-][A-ZÇËÊÁÍÚ]{2,})*)/g;

const IDIOM_SEPARATOR = '*';

const linkCrossReferences = (text: string): Part[] => {
  const parts: Part[] = [];
  let consumed = 0;

  for (const match of text.matchAll(CROSS_REFERENCE)) {
    const target = match[1];
    const slug = getSlug(target);
    if (!slug) {
      continue;
    }

    const matchStart = match.index ?? 0;
    const targetStart = matchStart + match[0].length - target.length;

    if (targetStart > consumed) {
      parts.push({ kind: 'text', text: text.slice(consumed, targetStart) });
    }
    parts.push({ kind: 'ref', text: target, slug });
    consumed = matchStart + match[0].length;
  }

  if (consumed < text.length) {
    parts.push({ kind: 'text', text: text.slice(consumed) });
  }

  return parts.length !== 0 ? parts : [{ kind: 'text', text }];
};

export const formatDefinition = (definition: string): FormattedDefinition => {
  const [sense = '', ...idioms] = definition
    .split(IDIOM_SEPARATOR)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk !== '');

  return {
    sense: linkCrossReferences(sense),
    idioms: idioms.map(linkCrossReferences),
  };
};

// The first sense, flattened and shortened — what a search result shows so the
// visitor chooses a word instead of guessing at one. `preprocess.ts` calls this
// and stores the result as `SearchEntry.gist`, so the definitions themselves
// never have to be downloaded to draw a row.
export const getGist = (definitions: string[], limit = 120) => {
  const first = (definitions[0] || '').split(IDIOM_SEPARATOR)[0].trim();
  if (first.length <= limit) {
    return first;
  }

  const cut = first.slice(0, limit);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > limit * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:]$/, '')}…`;
};

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

export const getHomographMark = (index: number) => ROMAN[index] || String(index + 1);

export interface Neighbour {
  slug: string;
  term: string;
}

/*
 * Slugs double `ë → ee` and `ç → cc` precisely so the mapping stays
 * reversible; this is that reverse, used to name the word a visitor asked for
 * when the dictionary does not have it.
 */
export const getTermFromSlug = (slug: string) => {
  return slug
    .replaceAll('ee', 'ë')
    .replaceAll('cc', 'ç')
    .replaceAll('-', ' ')
    .toUpperCase();
};
