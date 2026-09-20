/*
 * Lëmsh — the day's words, handed over in a tangle.
 *
 * A round is five or six words. Each one arrives scrambled and with a clock of
 * its own: put the letters back in order before it runs out and the word is
 * yours, with what is left of the clock added to the score. The clock belongs
 * to the word and not to the round, so a word that beats you costs you that
 * word and not the day.
 *
 * The tiles are characters, the same count Fjalëz fills boxes by — DH is two
 * tiles, and GARDH is five. See `letters.ts`.
 *
 * Everything here is pure and runs in the browser: no node imports.
 */
import { splitLetters } from './letters.ts';
import { formatDay } from './wordOfDay.ts';
import rounds from '../data/lemsh/rounds.json';

export interface RoundWord {
  word: string;
  /** The word's own page, so every answer is one click from its meaning. */
  slug: string;
  /*
   * Dealt at generation time, not in the browser: everyone playing a day gets
   * the same tiles in the same order, the way everyone gets the same word.
   */
  scramble: string;
}

export type Round = RoundWord[];

/*
 * The days, from `src/data/lemsh/rounds.json` — committed, and built by
 * `pnpm lemsh:words`. Like Fjalëz the series must not wrap: a repeat would
 * hand back words the reader has already untangled. When it runs out the page
 * says so, and the pool in `src/scripts/lemshWords.ts` is what gets extended.
 */
export const ROUNDS: Round[] = rounds;

export const START_UTC = Date.UTC(2026, 8, 20);
const DAY_MS = 86_400_000;

/*
 * The clock a word is worth: eight seconds a letter, and never under half a
 * minute. A four-tile scramble has twenty-four orders to try and a seven-tile
 * one has five thousand, so the clock grows with the word — but only gently,
 * because the letters are read, not enumerated.
 */
const SECONDS_PER_LETTER = 8;
const MIN_SECONDS = 30;

/** Points for a solved word, before the clock's share is added. */
const POINTS_PER_LETTER = 10;

export const getLetters = (word: string) => splitLetters(word) || [];

/*
 * The longest word the series holds. Every board is set to this many columns
 * and then cut to its own share of them, so a tile is the same size in a
 * four-letter word as in a seven-letter one and the boards do not jump between
 * words. Read off the rounds rather than written down: the pool is what
 * decides it.
 */
export const MAX_LETTERS = ROUNDS.reduce(
  (longest, round) =>
    round.reduce((max, entry) => Math.max(max, getLetters(entry.word).length), longest),
  0
);

export const getSeconds = (word: string) =>
  Math.max(MIN_SECONDS, SECONDS_PER_LETTER * getLetters(word).length);

/** The whole round's clock, for the line that says what the reader is in for. */
export const getRoundSeconds = (round: Round) =>
  round.reduce((total, entry) => total + getSeconds(entry.word), 0);

/** What a word was worth, and how quickly — the only thing worth storing. */
export interface WordResult {
  /** Seconds spent on the word — the whole of its clock when the clock won. */
  seconds: number;
  solved: boolean;
}

/*
 * A solved word pays for its letters and for the time it did not take. Nothing
 * is taken away for a word that beat the clock — the clock already did that,
 * by keeping the seconds it spent from the words that came after it.
 */
export const scoreWord = (entry: RoundWord, result: WordResult) => {
  if (!result.solved) {
    return 0;
  }

  const left = Math.max(0, getSeconds(entry.word) - Math.max(0, result.seconds));
  return POINTS_PER_LETTER * getLetters(entry.word).length + Math.round(left);
};

export interface Score {
  points: number;
  solved: number;
  /** Words the round asked for, whether or not they were reached. */
  words: number;
  seconds: number;
}

export const scoreRound = (round: Round, results: WordResult[]): Score => {
  let points = 0;
  let solved = 0;
  let seconds = 0;

  results.forEach((result, index) => {
    const entry = round[index];
    if (!entry) {
      return;
    }
    points += scoreWord(entry, result);
    solved += result.solved ? 1 : 0;
    seconds += Math.max(0, result.seconds);
  });

  return { points, solved, words: round.length, seconds };
};

/** `1:04` — a clock, wherever seconds are shown as a duration. */
export const formatSeconds = (seconds: number) => {
  const whole = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(whole / 60);
  const rest = whole % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
};

/*
 * The day is UTC, like `fjala e ditës` and like Fjalëz, so a round turns over
 * for everyone at the same instant rather than at whatever midnight the reader
 * is nearest.
 */
export const getDayIndex = (now: Date = new Date()) => {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.floor((today - START_UTC) / DAY_MS);
};

export const getDayDate = (day: number) => new Date(START_UTC + day * DAY_MS);

/** The last day the series covers, as a `Date`. */
export const getLastDay = () => new Date(START_UTC + (ROUNDS.length - 1) * DAY_MS);

export const getRound = (day: number): Round | null => ROUNDS[day] || null;

/** `2026-09-20` — the `d` parameter, and the key the day's events carry. */
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

const SHARE_MARKS = { solved: '🟥', missed: '⬜' };

/*
 * The shared result names the day by its number and never by its words: a
 * square a word, the score, and nothing anyone could read the answers out of.
 */
export const formatShare = (
  day: number,
  round: Round,
  results: WordResult[],
  siteUrl: string
) => {
  const score = scoreRound(round, results);
  const squares = round
    .map((_, index) =>
      results[index]?.solved ? SHARE_MARKS.solved : SHARE_MARKS.missed
    )
    .join('');

  return [
    `Lëmsh nr. ${day + 1} — ${score.points} pikë (${score.solved}/${score.words})`,
    squares,
    siteUrl,
  ].join('\n');
};

/** The archive's query parameter: `/leemsh?d=2026-09-20`. */
export const DAY_QUERY_PARAM = 'd';
