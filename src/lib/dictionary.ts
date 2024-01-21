import { readJson, writeJson, getFileNames } from './files.ts';

const GEN_DIR_PREFIX = 'src/data/gen';
const SLUG_DICTIONARY_FILENAME = `${GEN_DIR_PREFIX}/slugDictionary.json`;
const SLUG_SUBINDEX_FILENAME_DIR = `${GEN_DIR_PREFIX}/slug`;
const SLUG_SUBINDEX_FILENAME_TEMPLATE = (prefix: string) =>
  `${SLUG_SUBINDEX_FILENAME_DIR}/${prefix}.json`;
const STEM_SUBINDEX_FILENAME_DIR = `${GEN_DIR_PREFIX}/stem`;
const STEM_SUBINDEX_FILENAME_TEMPLATE = (prefix: string) =>
  `${STEM_SUBINDEX_FILENAME_DIR}/${prefix}.json`;
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
  return await readJson<ScrapedEntry[]>(SCRAPED_DICTIONARY_FILENAME);
};

export const getSlugDictionary = async () => {
  return await readJson<Index>(SLUG_DICTIONARY_FILENAME);
};

export const saveSlugDictionary = async (content: Index, prod?: boolean) => {
  await writeJson(SLUG_DICTIONARY_FILENAME, content, {
    createDir: true,
    pretty: !prod,
  });
};
export const saveSlugSubIndex = async (
  content: Index,
  prefix: string,
  prod?: boolean
) => {
  await saveSubIndex(content, SLUG_SUBINDEX_FILENAME_TEMPLATE, prefix, prod);
};

export const getSlugSubIndexes = async () => {
  return await getSubIndexes(
    SLUG_SUBINDEX_FILENAME_DIR,
    SLUG_SUBINDEX_FILENAME_TEMPLATE
  );
};

export const saveStemSubIndex = async (
  content: Index,
  prefix: string,
  prod?: boolean
) => {
  await saveSubIndex(content, STEM_SUBINDEX_FILENAME_TEMPLATE, prefix, prod);
};

export const getStemSubIndexes = async () => {
  return await getSubIndexes(
    STEM_SUBINDEX_FILENAME_DIR,
    STEM_SUBINDEX_FILENAME_TEMPLATE
  );
};

const getSubIndex = async (
  prefix: string,
  template: (prefix: string) => string
) => {
  return await readJson<Index>(template(prefix));
};

const saveSubIndex = async (
  content: Index,
  template: (prefix: string) => string,
  prefix: string,
  prod?: boolean
) => {
  await writeJson(template(prefix), content, {
    createDir: true,
    pretty: !prod,
  });
};

const getSubIndexes = async (
  subindexDir: string,
  template: (prefix: string) => string
) => {
  const indexFilenames = await getFileNames(subindexDir);
  const indexPrefixes = indexFilenames
    .filter((name) => name.endsWith('.json'))
    .map((name) => name.slice(0, -5));

  return await Promise.all(
    indexPrefixes.map(async (prefix) => {
      return {
        prefix,
        index: await getSubIndex(prefix, template),
      };
    })
  );
};
