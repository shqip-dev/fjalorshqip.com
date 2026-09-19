/*
 * Regenerates the Fjalëz guess list from the scraped dictionary:
 *
 *   node ./src/scripts/fjalezWords.ts
 *
 * Its output — `src/data/fjalez/guesses.json` — is committed, unlike
 * `src/data/gen/`. The entry pipeline is env-gated down to a subset in a
 * development build, and the game may not depend on that gate; the list also
 * only changes when `data/dictionary.json` does.
 *
 * A word qualifies when it is a single headword written only in the Albanian
 * alphabet and is exactly five characters long — one character to a box, so
 * GARDH belongs here and SHTËPI, which is six characters, does not.
 */
import { getScrapedDictionary } from '../lib/dictionary.ts';
import { WORD_LENGTH, splitLetters } from '../lib/fjalez.ts';
import { writeJson } from '../lib/files.ts';

const GUESSES_FILENAME = 'src/data/fjalez/guesses.json';
const ALBANIAN_WORD = /^[a-zçë]+$/;

const main = async () => {
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

    const letters = splitLetters(word);
    if (letters?.length === WORD_LENGTH) {
      words.add(word);
    }
  }

  const sorted = [...words].sort();
  await writeJson(GUESSES_FILENAME, sorted, { createDir: true });

  console.debug(`Generated ${sorted.length} Fjalëz guesses`);
};

main();
