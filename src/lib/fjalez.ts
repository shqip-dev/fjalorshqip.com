/*
 * Fjalëz — the day's word, guessed six times.
 *
 * The rules are Wordle's and the alphabet is Albanian's, one character to a
 * box: Ë and Ç have keys of their own, and a letter written with two
 * characters — DH, SH, RR and the rest — fills two boxes, the way it is typed.
 * GARDH is five boxes. That count lives in `letters.ts`, shared with Lëmsh.
 *
 * Everything here is pure and runs in the browser: no node imports.
 */
import { formatDay } from './wordOfDay.ts';

export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export interface Puzzle {
  word: string;
  /** The word's own page, so the answer is always one click from its meaning. */
  slug: string;
}

/*
 * One word per day, 2026-09-19 → 2026-11-18. Unlike `fjala e ditës` this list
 * must not wrap: a repeat would hand back a word the reader has already solved
 * and stored. When the series runs out the page says so — extend the array to
 * carry it further.
 */
export const START_UTC = Date.UTC(2026, 8, 19);
const DAY_MS = 86_400_000;

export const PUZZLES: Puzzle[] = [
  { word: 'fjalë', slug: 'fjalee' },
  { word: 'diell', slug: 'diell' },
  { word: 'rrugë', slug: 'rrugee' },
  { word: 'gisht', slug: 'gisht' },
  { word: 'zjarr', slug: 'zjarr' },
  { word: 'thikë', slug: 'thikee' },
  { word: 'qiell', slug: 'qiell' },
  { word: 'gomar', slug: 'gomar' },
  { word: 'letër', slug: 'leteer' },
  { word: 'mollë', slug: 'mollee' },
  { word: 'burim', slug: 'burim' },
  { word: 'gjumë', slug: 'gjumee' },
  { word: 'flakë', slug: 'flakee' },
  { word: 'dhomë', slug: 'dhomee' },
  { word: 'kripë', slug: 'kripee' },
  { word: 'portë', slug: 'portee' },
  { word: 'njeri', slug: 'njeri' },
  { word: 'fushë', slug: 'fushee' },
  { word: 'vatër', slug: 'vateer' },
  { word: 'hekur', slug: 'hekur' },
  { word: 'lepur', slug: 'lepur' },
  { word: 'dimër', slug: 'dimeer' },
  { word: 'kockë', slug: 'kockee' },
  { word: 'peshë', slug: 'peshee' },
  { word: 'unazë', slug: 'unazee' },
  { word: 'lakër', slug: 'lakeer' },
  { word: 'plumb', slug: 'plumb' },
  { word: 'këngë', slug: 'keengee' },
  { word: 'motër', slug: 'moteer' },
  { word: 'gropë', slug: 'gropee' },
  { word: 'klasë', slug: 'klasee' },
  { word: 'barrë', slug: 'barree' },
  { word: 'gjemb', slug: 'gjemb' },
  { word: 'mulli', slug: 'mulli' },
  { word: 'perde', slug: 'perde' },
  { word: 'thumb', slug: 'thumb' },
  { word: 'gardh', slug: 'gardh' },
  { word: 'miell', slug: 'miell' },
  { word: 'brumë', slug: 'brumee' },
  { word: 'rrush', slug: 'rrush' },
  { word: 'gjoks', slug: 'gjoks' },
  { word: 'pellg', slug: 'pellg' },
  { word: 'akull', slug: 'akull' },
  { word: 'avull', slug: 'avull' },
  { word: 'oxhak', slug: 'oxhak' },
  { word: 'çekan', slug: 'ccekan' },
  { word: 'libër', slug: 'libeer' },
  { word: 'misër', slug: 'miseer' },
  { word: 'fyell', slug: 'fyell' },
  { word: 'kullë', slug: 'kullee' },
  { word: 'gushë', slug: 'gushee' },
  { word: 'kapak', slug: 'kapak' },
  { word: 'dasmë', slug: 'dasmee' },
  { word: 'barut', slug: 'barut' },
  { word: 'skenë', slug: 'skenee' },
  { word: 'kanal', slug: 'kanal' },
  { word: 'oborr', slug: 'oborr' },
  { word: 'bletë', slug: 'bletee' },
  { word: 'sapun', slug: 'sapun' },
  { word: 'darkë', slug: 'darkee' },
  { word: 'çelës', slug: 'ccelees' },
];

/** The last day the series covers, as a `Date`. */
export const getLastDay = () => new Date(START_UTC + (PUZZLES.length - 1) * DAY_MS);

/*
 * The day is UTC, like `fjala e ditës`, so a word turns over for everyone at
 * the same instant rather than at whatever midnight the reader is nearest.
 */
export const getDayIndex = (now: Date = new Date()) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - START_UTC) / DAY_MS);
};

export const getDayDate = (day: number) => new Date(START_UTC + day * DAY_MS);

export const getPuzzle = (day: number): Puzzle | null => PUZZLES[day] || null;

/** `2026-09-19` — the `d` parameter, and the key the day's events carry. */
export const toDayParam = (day: number) =>
  getDayDate(day).toISOString().slice(0, 10);

const DAY_PARAM_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export const fromDayParam = (value: string | null): number | null => {
  const match = value ? DAY_PARAM_PATTERN.exec(value) : null;
  if (!match) {
    return null;
  }

  const [, year, month, date] = match as unknown as string[];
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(date));
  if (Number.isNaN(utc)) {
    return null;
  }

  return Math.floor((utc - START_UTC) / DAY_MS);
};

export const formatDayIndex = (day: number) => formatDay(getDayDate(day));

export type Mark = 'correct' | 'present' | 'absent';

/*
 * A letter the answer has only once cannot be marked twice, so the placed
 * letters are taken out of the pool first and the misplaced ones draw from
 * what is left — the ordinary Wordle rule, written out because getting it
 * wrong is invisible until the day a word repeats a letter.
 */
export const scoreGuess = (guess: string[], solution: string[]): Mark[] => {
  const marks: Mark[] = guess.map(() => 'absent');
  const pool = new Map<string, number>();

  solution.forEach((letter, index) => {
    if (guess[index] === letter) {
      marks[index] = 'correct';
    } else {
      pool.set(letter, (pool.get(letter) || 0) + 1);
    }
  });

  guess.forEach((letter, index) => {
    if (marks[index] === 'correct') {
      return;
    }
    const left = pool.get(letter) || 0;
    if (left > 0) {
      marks[index] = 'present';
      pool.set(letter, left - 1);
    }
  });

  return marks;
};

const RANK: Record<Mark, number> = { absent: 0, present: 1, correct: 2 };

/** The keyboard remembers the best thing ever learned about a letter. */
export const getLetterMarks = (guesses: string[][], solution: string[]) => {
  const learned: Record<string, Mark> = {};

  for (const guess of guesses) {
    scoreGuess(guess, solution).forEach((mark, index) => {
      const letter = guess[index] as string;
      const known = learned[letter];
      if (!known || RANK[mark] > RANK[known]) {
        learned[letter] = mark;
      }
    });
  }

  return learned;
};

export type Outcome = 'playing' | 'won' | 'lost';

export const getOutcome = (guesses: string[][], solution: string[]): Outcome => {
  const last = guesses[guesses.length - 1];
  if (last && last.join('') === solution.join('')) {
    return 'won';
  }
  return guesses.length >= MAX_GUESSES ? 'lost' : 'playing';
};

const SHARE_MARKS: Record<Mark, string> = {
  correct: '🟥',
  present: '🟨',
  absent: '⬜',
};

/*
 * The shared result names the day by its number and never by its word, and the
 * squares take the binding's red for a placed letter — the same thing the tiles
 * do on the page.
 */
export const formatShare = (
  day: number,
  guesses: string[][],
  solution: string[],
  siteUrl: string
) => {
  const outcome = getOutcome(guesses, solution);
  const score = outcome === 'won' ? `${guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
  const rows = guesses.map((guess) =>
    scoreGuess(guess, solution)
      .map((mark) => SHARE_MARKS[mark])
      .join('')
  );

  return [`Fjalëz nr. ${day + 1} — ${score}`, ...rows, siteUrl].join('\n');
};

/** The archive's query parameter: `/fjaleez?d=2026-09-19`. */
export const DAY_QUERY_PARAM = 'd';
