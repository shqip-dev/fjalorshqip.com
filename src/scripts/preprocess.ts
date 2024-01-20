import type {
  OriginalDictionaryEntry,
  IntermediateDictionaryEntry,
  DictionaryEntry,
} from '../lib/dictionary.ts';
import files from '../lib/files.ts';

const INPUT_FILE = 'data/dictionary.json';
const OUTPUT_FILE = 'src/data/dictionary.json';

const developmentSubSet = [
  'ACAR',
  'AERONAUTIKË',
  'ÇLIRUES',
  'HYRJE',
  'IKACAKE',
  'PUPË IV',
];

const main = async () => {
  const production = process.env.NODE_ENV == 'production';

  const dictionaryEntries: OriginalDictionaryEntry[] = await files.readJson(
    INPUT_FILE
  );
  const temp: { [key: string]: IntermediateDictionaryEntry[] } = {};

  dictionaryEntries.forEach((entry) => {
    const originalTermParts = entry.term
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term !== '');

    const term = originalTermParts
      .filter((part) => !part.endsWith('.'))
      .join(' ');
    const attributes = originalTermParts.filter((part) => part.endsWith('.'));

    let definitions = entry.definition.map((definition) => definition.trim());
    if (definitions.length > 1) {
      definitions = definitions.map((definition) =>
        definition.replace(/^\d+\.\s*/, '')
      );
    }

    if (!temp[term]) {
      temp[term] = [];
    }
    temp[term].push({
      attributes,
      definitions,
    });
  });

  const filteredEntries = production
    ? Object.entries(temp)
    : Object.entries(temp).filter(([key]) => developmentSubSet.includes(key));

  const result: DictionaryEntry[] = filteredEntries.map(([key, value]) => ({
    term: key,
    versions: value,
  }));

  files.writeJson(OUTPUT_FILE, result, {
    createDir: true,
    pretty: true,
  });

  console.debug(`Generated ${filteredEntries.length} entries`);
};

main();
