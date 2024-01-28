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
import isEqual from 'lodash/isEqual.js';
import sortBy from 'lodash/sortBy.js';
import { groupBy } from '../lib/utils.ts';

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

  return {
    term: term,
    attributes: attributes,
    definitions: definitions,
    stems: getStems(term),
    slug: getSlug(term),
  };
};

const dedupScrapedEntries = (scrapedEntries: ScrapedEntry[]) => {
  const sortedScrapedEntries = sortBy(scrapedEntries, (entry) => entry.term);

  for (let i = 1, j = sortedScrapedEntries.length; i < j; i++) {
    const curr = sortedScrapedEntries[i];
    const prev = sortedScrapedEntries[i - 1];

    if (
      curr &&
      prev &&
      curr.term === prev.term &&
      isEqual(curr.definition, prev.definition)
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
