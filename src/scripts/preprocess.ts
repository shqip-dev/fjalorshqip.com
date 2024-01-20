import {
  type ScrapedEntry,
  getScrapedDictionary,
  type Entry,
  saveSlugDictionary,
  type Index,
} from '../lib/dictionary.ts';
import env from '../lib/env.ts';
import pcs from '../lib/process.ts';

const main = async () => {
  const production = env.isProduction();

  const scrapedEntries = await getScrapedDictionary();

  const entries = scrapedEntries.map(mapScrapedEntryToEntry);

  const dictionarySubset = env.getDictionarySubset();
  const entriesSubSet = production
    ? // We have to filter some entries out since cloudflare pages has a limit on 20k files
      entries.filter((_, idx) => idx % 2 == 0)
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

  console.debug(`Generated ${entriesSubSet.length} entries`);
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
