import {
  type ScrapedEntry,
  getScrapedDictionary,
  type Entry,
  saveSlugDictionary,
  type Index,
  saveIndex,
  MIN_STEM_LENGTH,
} from '../lib/dictionary.ts';
import env from '../lib/env.ts';
import pcs from '../lib/process.ts';

const main = async () => {
  const production = env.isProduction();

  const scrapedEntries = await getScrapedDictionary();

  const entries = scrapedEntries.map(mapScrapedEntryToEntry);

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

  type Indexes = {
    [prefix: string]: Index;
  };

  const indexes = entriesSubSet
    .filter((entry) => !!entry.stems)
    .flatMap((entry) =>
      entry.stems.map((stem) => ({
        stem,
        entry,
      }))
    )
    .filter(
      (stemEntry) =>
        !!stemEntry.stem && stemEntry.stem.length >= MIN_STEM_LENGTH
    )
    .reduce((acc, stemEntry) => {
      const firstKey = stemEntry.stem.substring(0, MIN_STEM_LENGTH);
      const secondKey = stemEntry.stem;
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
    }, {} as Indexes);

  await Promise.all(
    Object.entries(indexes).map(([prefix, index]) =>
      saveIndex(index, prefix, production)
    )
  );
  console.debug(
    `Generated ${Object.entries(indexes).length} (sub) indexes and ${
      entriesSubSet.length
    } entries`
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

main();
