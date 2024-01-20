export interface OriginalDictionaryEntry {
  term: string;
  definition: string[];
}

export interface IntermediateDictionaryEntry {
  attributes: string[];
  definitions: string[];
}

export interface DictionaryEntry {
  term: string;
  versions: IntermediateDictionaryEntry[];
}
