import { getScrapedDictionary } from './dictionary.ts';
import { WORD_LENGTH } from './fjalez.ts';
import { splitLetters } from './letters.ts';

const ALBANIAN_WORD = /^[a-zçë]+$/;

/*
 * The list of accepted guesses, derived from `data/dictionary.json` at build
 * time by the endpoint that serves it. It reads the scraped dictionary itself
 * rather than `src/data/gen/`, because `prebuild` is env-gated down to a handful
 * of words in a development build and the game may not depend on that gate.
 *
 * A word qualifies when it is a single headword written only in the Albanian
 * alphabet and is exactly five characters long — one character to a box, so
 * GARDH belongs here and SHTËPI, which is six characters, does not.
 */
export const getFjalezGuesses = async () => {
  const scrapedEntries = await getScrapedDictionary();
  const words = new Set<string>();

  for (const entry of scrapedEntries) {
    if (entry.skip) {
      continue;
    }

    // The scraped term carries its grammatical labels — `ACAR m.` — and every
    // part that ends in a full stop is one of those, not part of the word.
    const parts = entry.term
      .split(/\s+/)
      .map((part) => part.trim())
      .filter((part) => part !== '' && !part.endsWith('.'));

    if (parts.length !== 1) {
      continue;
    }

    const word = (parts[0] as string).toLowerCase();
    if (!ALBANIAN_WORD.test(word)) {
      continue;
    }

    if (splitLetters(word)?.length === WORD_LENGTH) {
      words.add(word);
    }
  }

  return [...words].sort();
};
