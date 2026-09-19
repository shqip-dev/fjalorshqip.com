import { readJson } from './files.ts';

const GUESSES_FILENAME = 'src/data/fjalez/guesses.json';

/*
 * The list of accepted guesses, committed rather than generated: it is derived
 * from `data/dictionary.json` by `src/scripts/fjalezWords.ts`, but the game must
 * work in a development build too, where the entry pipeline is env-gated down to
 * a handful of words.
 */
export const getFjalezGuesses = async () => {
  return await readJson<string[]>(GUESSES_FILENAME);
};
