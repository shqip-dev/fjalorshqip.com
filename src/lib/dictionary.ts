import files from './files.ts';

const GEN_DIR_PREFIX = 'src/data/gen';
const SLUG_DICTIONARY_FILENAME = `${GEN_DIR_PREFIX}/slugDictionary.json`;
const INDEX_FILENAME_TEMPLATE = (prefix: string) =>
  `${GEN_DIR_PREFIX}/stem/${prefix}.json`;
const SCRAPED_DICTIONARY_FILENAME = 'data/dictionary.json';

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
