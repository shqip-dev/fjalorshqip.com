import files from './files.ts';

const GEN_DIR_PREFIX = 'src/data/gen';
const SLUG_DICTIONARY_FILENAME = `${GEN_DIR_PREFIX}/slugDictionary.json`;
const INDEX_FILENAME_DIR = `${GEN_DIR_PREFIX}/stem`;
const INDEX_FILENAME_TEMPLATE = (prefix: string) =>
  `${INDEX_FILENAME_DIR}/${prefix}.json`;
const SCRAPED_DICTIONARY_FILENAME = 'data/dictionary.json';

export const MIN_STEM_LENGTH = 3;

export interface ScrapedEntry {
  term: string;
  definition: string[];
  exact_term?: string;
  skip?: boolean;
}

export interface IntermediateDictionaryEntry {
  attributes: string[];
  definitions: string[];
}

export interface DictionaryEntry {
  term: string;
  versions: IntermediateDictionaryEntry[];
}

export interface Entry {
  term: string;
  attributes: string[];
  definitions: string[];
  stems: string[];
  slug: string;
}

export type Dictionary = {
  [key: string]: Entry;
};

export type Index = {
  [key: string]: Entry[];
};

export const getScrapedDictionary = async () => {
  return await files.readJson<ScrapedEntry[]>(SCRAPED_DICTIONARY_FILENAME);
};

export const getSlugDictionary = async () => {
  return await files.readJson<Index>(SLUG_DICTIONARY_FILENAME);
};

export const saveSlugDictionary = async (content: Index, prod?: boolean) => {
  await files.writeJson(SLUG_DICTIONARY_FILENAME, content, {
    createDir: true,
    pretty: !prod,
  });
};

const getIndex = async (prefix: string) => {
  return await files.readJson<Index>(INDEX_FILENAME_TEMPLATE(prefix));
};

export const saveIndex = async (
  content: Index,
  prefix: string,
  prod?: boolean
) => {
  await files.writeJson(INDEX_FILENAME_TEMPLATE(prefix), content, {
    createDir: true,
    pretty: !prod,
  });
};

export const getIndexes = async () => {
  const indexFilenames = await files.getFileNames(INDEX_FILENAME_DIR);
  const indexPrefixes = indexFilenames
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -5));

  return await Promise.all(
    indexPrefixes.map(async (prefix) => {
      return {
        prefix,
        index: await getIndex(prefix),
      };
    })
  );
};
