import {
  type ScrapedEntry,
  getScrapedDictionary,
  type Entry,
  saveSlugDictionary,
  type Index,
  saveStemSubIndex,
  MIN_STEM_LENGTH,
  saveSlugSubIndex,
} from '../lib/dictionary.ts';
import env from '../lib/env.ts';
import pcs from '../lib/process.ts';
import _ from 'lodash';

type Indexes = {
  [prefix: string]: Index;
};

const main = async () => {
  const production = env.isProduction();

  const scrapedEntries = await getScrapedDictionary();

  const entries = dedupScrapedEntries(scrapedEntries)
    .filter((scrapedEntry) => !scrapedEntry.skip)
    .map(mapScrapedEntryToEntry);

  const dictionarySubset = env.getDictionarySubset();
  const entriesSubSet = production
    ? entries
    : entries.filter((entry) => dictionarySubset.includes(entry.term));

  const slugDictionary = entriesSubSet
    .filter((entry) => !!entry.slug)
    .reduce((acc, entry) => {
      const key = entry.slug;
      if (acc[key]) {
        acc[key].push(entry);
      } else {
        acc[key] = [entry];
      }
      return acc;
    }, {} as Index);
  await saveSlugDictionary(slugDictionary, production);

  const stemSubIndexes = entriesSubSet
    .filter((entry) => !!entry.stems)
    .flatMap((entry) =>
      entry.stems.map((stem) => ({
        prefix: stem,
        entry,
      }))
    )
    .filter(
      (stemEntry) =>
        !!stemEntry.prefix && stemEntry.prefix.length >= MIN_STEM_LENGTH
    )
    .reduce(accumulateEntriesInSubIndexes, {} as Indexes);

  await Promise.all(
    Object.entries(stemSubIndexes).map(([prefix, index]) =>
      saveStemSubIndex(index, prefix, production)
    )
  );

  const slugSubIndexes = entriesSubSet
    .filter((entry) => !!entry.slug && entry.slug.length >= MIN_STEM_LENGTH)
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
    stems: pcs.stems(term),
    slug: pcs.slug(term),
  };
};

const dedupScrapedEntries = (scrapedEntries: ScrapedEntry[]) => {
  const sortedScrapedEntries = _.sortBy(scrapedEntries, (entry) => entry.term);

  for (let i = 1, j = sortedScrapedEntries.length; i < j; i++) {
    const curr = sortedScrapedEntries[i];
    const prev = sortedScrapedEntries[i - 1];

    if (
      curr &&
      prev &&
      curr.term === prev.term &&
      _.isEqual(curr.definition, prev.definition)
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
  const firstKey = stemEntry.prefix.substring(0, MIN_STEM_LENGTH);
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
