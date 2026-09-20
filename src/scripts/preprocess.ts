import {
  type ScrapedEntry,
  getScrapedDictionary,
  type Entry,
  saveSlugDictionary,
  type Index,
  saveStemSubIndex,
  saveSlugSubIndex,
} from '../lib/dictionary.ts';
import { isProduction, getDictionarySubset } from '../lib/env.ts';
import { getStems, getSlug, getStemPrefix } from '../lib/process.ts';
import { groupBy, isSameList, sortByKey } from '../lib/utils.ts';

type Indexes = {
  [prefix: string]: Index;
};

const main = async () => {
  const production = isProduction();

  const scrapedEntries = await getScrapedDictionary();

  const entries = dedupScrapedEntries(scrapedEntries)
    .filter((scrapedEntry) => !scrapedEntry.skip)
    .map(mapScrapedEntryToEntry);

  const dictionarySubset = getDictionarySubset();
  const entriesSubSet = production
    ? entries
    : entries.filter((entry) => dictionarySubset.includes(entry.term));

  const slugDictionary = groupBy(
    entriesSubSet.filter((entry) => !!entry.slug),
    (entry) => entry.slug
  );
  await saveSlugDictionary(slugDictionary, production);

  const stemSubIndexes = entriesSubSet
    .filter((entry) => !!entry.stems)
    .flatMap((entry) =>
      entry.stems.map((stem) => ({
        prefix: stem,
        entry,
      }))
    )
    .filter((stemEntry) => !!stemEntry.prefix)
    .reduce(accumulateEntriesInSubIndexes, {} as Indexes);

  await Promise.all(
    Object.entries(stemSubIndexes).map(([prefix, index]) =>
      saveStemSubIndex(index, prefix, production)
    )
  );

  const slugSubIndexes = entriesSubSet
    .filter((entry) => !!entry.slug)
    .map((entry) => ({
      prefix: entry.slug,
      entry,
    }))
    .reduce(accumulateEntriesInSubIndexes, {} as Indexes);

  await Promise.all(
    Object.entries(slugSubIndexes).map(([prefix, index]) =>
      saveSlugSubIndex(index, prefix, production)
    )
  );

  console.debug(
    `Generated ${Object.entries(stemSubIndexes).length} stem sub indexes, ${
      Object.entries(slugDictionary).length
    } slug sub indexes and ${entriesSubSet.length} entries`
  );
};

const mapScrapedEntryToEntry = (scrapedEntry: ScrapedEntry): Entry => {
  const scrapedTermParts = scrapedEntry.term
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term !== '');

  const term = scrapedTermParts.filter((part) => !part.endsWith('.')).join(' ');
  const attributes = scrapedTermParts.filter((part) => part.endsWith('.'));

  let definitions = scrapedEntry.definition.map((definition) =>
    definition.trim()
  );
  if (definitions.length > 1) {
    definitions = definitions.map((definition) =>
      // Replace leading numbered indexes
      definition.replace(/^\d+\.\s*/, '')
    );
  }
  // The scrape left stray sense numbers behind as definitions of their own
  // ('  5. ', ' 2.3.'), which the strip above turns into empty strings; a word
  // page then numbers a sense that says nothing. A definition with no letter in
  // it is not a definition, so it never reaches the index. This drops nothing
  // the dictionary says: no entry in the corpus loses its last definition.
  definitions = definitions.filter((definition) => hasLetter(definition));

  return {
    term: term,
    attributes: attributes,
    definitions: definitions,
    stems: getStems(term),
    slug: getSlug(term),
  };
};

// Albanian, and any other alphabet: a character that is a letter in Unicode
// terms, as opposed to a digit, a punctuation mark or a space.
const hasLetter = (text: string) => /\p{L}/u.test(text);

const dedupScrapedEntries = (scrapedEntries: ScrapedEntry[]) => {
  const sortedScrapedEntries = sortByKey(scrapedEntries, (entry) => entry.term);

  for (let i = 1, j = sortedScrapedEntries.length; i < j; i++) {
    const curr = sortedScrapedEntries[i];
    const prev = sortedScrapedEntries[i - 1];

    if (
      curr &&
      prev &&
      curr.term === prev.term &&
      isSameList(curr.definition, prev.definition)
    ) {
      sortedScrapedEntries.splice(i, 1);
      i--;
      j--;
    }
  }

  return sortedScrapedEntries;
};

const accumulateEntriesInSubIndexes = (
  acc: Indexes,
  stemEntry: { prefix: string; entry: Entry }
) => {
  const firstKey = getStemPrefix(stemEntry.prefix);
  const secondKey = stemEntry.prefix;
  if (acc[firstKey]) {
    if (acc[firstKey][secondKey]) {
      acc[firstKey][secondKey].push(stemEntry.entry);
    } else {
      acc[firstKey][secondKey] = [stemEntry.entry];
    }
  } else {
    acc[firstKey] = {
      [secondKey]: [stemEntry.entry],
    };
  }
  return acc;
};

main();
