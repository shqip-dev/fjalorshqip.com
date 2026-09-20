/*
 * Builds the Lëmsh rounds — the days of the scramble game:
 *
 *   node ./src/scripts/lemshWords.ts
 *
 * Its output — `src/data/lemsh/rounds.json` — is committed, like the Fjalëz
 * guess list and unlike `src/data/gen/`: the entry pipeline is env-gated down
 * to a handful of words in a development build, and a game may not depend on
 * that gate.
 *
 * The pool below is curated by hand, because a scramble is only a game when
 * the reader could plausibly know the word: the dictionary holds forty thousand
 * entries and most of them would be an anagram of nothing. Every word in it is
 * checked against `data/dictionary.json` all the same — the answer links to its
 * own entry, so a word that is not a headword would link to a page that does
 * not exist.
 */
import { getScrapedDictionary } from '../lib/dictionary.ts';
import { PUZZLES } from '../lib/fjalez.ts';
import { splitLetters } from '../lib/letters.ts';
import { getSlug } from '../lib/process.ts';
import { writeJson } from '../lib/files.ts';

const ROUNDS_FILENAME = 'src/data/lemsh/rounds.json';

/** Four tiles is the shortest scramble worth solving, seven the longest that fits a phone. */
const MIN_LETTERS = 4;
const MAX_LETTERS = 7;

/** A round is five or six words; the generator refuses a pool that cannot fill one. */
const MIN_WORDS = 5;
const MAX_WORDS = 6;

/*
 * The pool, grouped by length only for reading — the generator sorts it anyway.
 * Words are concrete and everyday on purpose, and none of them is a Fjalëz
 * answer: two games sharing a word list would read as one game played twice.
 */
const POOL = [
  // four
  'ajër', 'armë', 'bazë', 'bimë', 'borë', 'breg', 'brez', 'bukë', 'cipë',
  'copë', 'degë', 'derë', 'ditë', 'dorë', 'emër', 'fije', 'film', 'fuqi',
  'grua', 'grup', 'helm', 'inat', 'jetë', 'kafe', 'kalë', 'kënd', 'kohë',
  'kuti', 'lopë', 'majë', 'mish', 'muaj', 'natë', 'nënë', 'nuse', 'pemë',
  'petë', 'pije', 'plak', 'pulë', 'pyll', 'qejf', 'qime', 'raki', 'rrip',
  'sulm', 'thes', 'trim', 'turp', 'valë', 'vijë', 'xham', 'zonë',

  // five
  'anije', 'arsye', 'baltë', 'banor', 'barkë', 'burrë', 'byrek', 'çadër',
  'çantë', 'çorap', 'djalë', 'duhan', 'dyfek', 'dyqan', 'fener', 'ferrë',
  'fllad', 'formë', 'frikë', 'frymë', 'fshat', 'furrë', 'gabim', 'gëzim',
  'grurë', 'grykë', 'guxim', 'kalli', 'kodër', 'kulaç', 'lodër', 'mbret',
  'merak', 'moshë', 'numër', 'organ', 'pamje', 'pjatë', 'pjesë', 'plagë',
  'plazh', 'qenie', 'qilim', 'qytet', 'rrasë', 'rrobë', 'shami', 'shesh',
  'shije', 'shpat', 'shtet', 'stinë', 'stuhi', 'tavan', 'thelb', 'trung',
  'urith', 'vajzë', 'valle', 'vaskë', 'vegël', 'vello', 'vepër', 'vlerë',
  'vrimë', 'zonjë',

  // six
  'aparat', 'arushë', 'bajame', 'bardhë', 'bilbil', 'bisedë', 'brinjë',
  'bulmet', 'dallgë', 'dardhë', 'delfin', 'djathë', 'drapër', 'dyshek',
  'ëndërr', 'fëmijë', 'figurë', 'fillim', 'fjalor', 'flutur', 'ftohtë',
  'fytyrë', 'gjalpë', 'gjellë', 'gjethe', 'gjurmë', 'gozhdë', 'hudhër',
  'karotë', 'kashtë', 'këpucë', 'kokërr', 'kopsht', 'korrik', 'kurriz',
  'lakror', 'lëkurë', 'lejlek', 'makinë', 'mjaltë', 'mjedis', 'mjekër',
  'muzikë', 'natyrë', 'nevojë', 'njollë', 'nofull', 'nxënës', 'pallto',
  'patate', 'patkua', 'pllakë', 'pluhur', 'popull', 'pushkë', 'qelizë',
  'qershi', 'qetësi', 'qeveri', 'rrezik', 'shalqi', 'sheqer', 'shishe',
  'shpend', 'shpinë', 'shtrat', 'spinaq', 'stomak', 'titull', 'urtësi',
  'ushqim', 'ushtar', 'zambak', 'zbulim',

  // seven
  'bereqet', 'breshër', 'breshkë', 'budalla', 'dërrasë', 'dëshirë', 'dhelpër',
  'dritare', 'ekonomi', 'element', 'energji', 'familje', 'fanellë', 'furtunë',
  'gëlqere', 'gjarpër', 'gjelbër', 'grindje', 'harabel', 'karrige', 'këmishë',
  'kërcell', 'krahinë', 'kumbull', 'kuzhinë', 'lakuriq', 'largësi', 'llogari',
  'lumturi', 'madhësi', 'mbrëmje', 'mbulesë', 'mëngjes', 'mineral', 'mjekësi',
  'monedhë', 'ndeshje', 'nëpunës', 'pasqyrë', 'pëllumb', 'pengesë', 'pikturë',
  'prodhim', 'punëtor', 'pushtet', 'qumësht', 'rregull', 'rrethim', 'rrjedhë',
  'shëndet', 'shërbim', 'shkurre', 'shoqëri', 'shtyllë', 'tallash', 'tingull',
  'tjegull', 'velenxë', 'vjeshtë', 'vorbull', 'zemërim',
];

/*
 * The scramble is generated once, here, rather than in the browser: everyone
 * playing a day should be handed the same tiles in the same order, the way
 * everyone is handed the same word. Seeded from the word itself, so running
 * the generator again over an unchanged pool rewrites the same file.
 */
const seedOf = (word: string) => {
  let hash = 0x811c9dc5;
  for (const character of word) {
    hash ^= character.codePointAt(0) as number;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
};

const randomOf = (seed: number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

/*
 * A scramble that leaves a letter where it was is a scramble that gives it
 * away, so the shuffle is retried until no tile sits in its own place. A word
 * whose letters cannot be deranged — AAB and the like — is not in the pool,
 * but the attempt is bounded all the same and falls back to merely different.
 */
const scrambleOf = (letters: string[], seed: number) => {
  const random = randomOf(seed);
  let fallback: string[] | null = null;

  for (let attempt = 0; attempt < 200; attempt++) {
    const shuffled = [...letters];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const pick = Math.floor(random() * (index + 1));
      [shuffled[index], shuffled[pick]] = [
        shuffled[pick] as string,
        shuffled[index] as string,
      ];
    }

    if (shuffled.every((letter, index) => letter !== letters[index])) {
      return shuffled.join('');
    }
    if (!fallback && shuffled.join('') !== letters.join('')) {
      fallback = shuffled;
    }
  }

  return (fallback || letters).join('');
};

/** Every headword the dictionary holds as a single word of the alphabet. */
const getHeadwords = async () => {
  const scrapedEntries = await getScrapedDictionary();
  const headwords = new Set<string>();

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

    if (parts.length === 1) {
      headwords.add((parts[0] as string).toLowerCase());
    }
  }

  return headwords;
};

interface RoundWord {
  word: string;
  slug: string;
  scramble: string;
}

const main = async () => {
  const headwords = await getHeadwords();
  const taken = new Set(PUZZLES.map((puzzle) => puzzle.word));
  const seen = new Set<string>();
  const rejected: string[] = [];
  const words: { word: string; slug: string; scramble: string; length: number }[] = [];

  for (const entry of POOL) {
    const word = entry.toLowerCase();
    const letters = splitLetters(word);

    if (seen.has(word)) {
      rejected.push(`${word} — përsëritet`);
      continue;
    }
    seen.add(word);

    if (!letters || letters.length < MIN_LETTERS || letters.length > MAX_LETTERS) {
      rejected.push(`${word} — ${MIN_LETTERS}-${MAX_LETTERS} shkronja`);
      continue;
    }
    if (!headwords.has(word)) {
      rejected.push(`${word} — nuk është në fjalor`);
      continue;
    }
    if (taken.has(word)) {
      rejected.push(`${word} — është fjalë e Fjalëzës`);
      continue;
    }

    words.push({
      word,
      slug: getSlug(word),
      scramble: scrambleOf(letters, seedOf(word)),
      length: letters.length,
    });
  }

  if (rejected.length !== 0) {
    console.error(`Rejected ${rejected.length}:\n  ${rejected.join('\n  ')}`);
    process.exitCode = 1;
    return;
  }

  /*
   * Sorted by length and then dealt round-robin, so a round climbs from its
   * shortest word to its longest — the day warms up — and no round is all
   * four-letter words while the next is all seven.
   */
  const sorted = words
    .map((word, index) => ({ word, index }))
    .sort((a, b) => a.word.length - b.word.length || a.index - b.index)
    .map((entry) => entry.word);

  const count = Math.ceil(sorted.length / MAX_WORDS);
  const rounds: RoundWord[][] = Array.from({ length: count }, () => []);

  sorted.forEach((word, index) => {
    (rounds[index % count] as RoundWord[]).push({
      word: word.word,
      slug: word.slug,
      scramble: word.scramble,
    });
  });

  const short = rounds.findIndex((round) => round.length < MIN_WORDS);
  if (short !== -1) {
    console.error(
      `Round ${short + 1} has ${rounds[short]?.length} words; the pool needs at least ${
        count * MIN_WORDS
      }.`
    );
    process.exitCode = 1;
    return;
  }

  await writeJson(ROUNDS_FILENAME, rounds, { createDir: true });

  console.debug(
    `Generated ${rounds.length} Lëmsh rounds from ${sorted.length} words`
  );
};

main();
