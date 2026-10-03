/*
 * Shtigje — the week's theme, traced out of a grid of letters.
 *
 * Six columns by eight rows, and every one of the forty-eight cells belongs to
 * exactly one of the week's words. A word is a trail: each letter steps to a
 * cell touching the last, diagonals included, and no cell is used twice. There
 * is no filler on the board, so the letters that are left over are always the
 * words that are left over — which is the whole of the game.
 *
 * Any other word of the dictionary the grid happens to spell is a bonus word.
 * Three of them buy a hint, and a hint gives away a trail. The list of them is
 * read off the finished grid at build time (`src/scripts/shtigjeWords.ts`),
 * because working it out in the browser would mean shipping the dictionary.
 *
 * Unlike Fjalëz and Lëmsh this one turns over **weekly**, on Monday, by the
 * clock in Tirana rather than by UTC: a week is a human unit and a reader
 * should not be handed Monday's puzzle on Sunday evening. That is the one
 * place the three games disagree about what a day is, and `toLocalMidnight`
 * below is the whole of it.
 *
 * Everything here is pure and runs in the browser: no node imports.
 */
import { MONTHS } from './wordOfDay.ts';
import type { Week, WeekWord } from './shtigjeGrid.ts';
import weeks from '../data/shtigje/weeks.json';

export { CELLS, COLS, ROWS, areNeighbours, lineBetween } from './shtigjeGrid.ts';
export type { Week, WeekWord } from './shtigjeGrid.ts';

/*
 * The weeks, from `src/data/shtigje/weeks.json` — committed, and built by
 * `pnpm shtigje:words`. Like the other two series this one must not wrap: a
 * repeat would hand back a grid the reader has already emptied. When it runs
 * out the page says so, and the themes in `src/scripts/shtigjeWords.ts` are
 * what get extended.
 */
export const WEEKS: Week[] = weeks;

/** Monday, 21 September 2026 — the first week, by Tirana's calendar. */
export const START_UTC = Date.UTC(2026, 8, 21);
const WEEK_MS = 7 * 86_400_000;

/*
 * Albania's clock, not the reader's and not UTC. A week has to turn over at a
 * midnight that means something, and the one this dictionary is written for is
 * Tirana's; `Intl` is what knows when that is, standard time and summer time
 * alike, without a table of its own to go stale.
 *
 * An environment that does not know the zone — an ancient browser, a trimmed
 * ICU build — falls back to UTC, which is two hours off for part of a Sunday
 * night and never wrong about which week it is otherwise.
 */
const TIME_ZONE = 'Europe/Tirane';

const civil = (() => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: TIME_ZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (e) {
    return null;
  }
})();

/** The calendar date in Tirana, as that date's UTC midnight. */
const toLocalMidnight = (now: Date) => {
  if (!civil) {
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  }

  const parts = civil.formatToParts(now);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  return Date.UTC(read('year'), read('month') - 1, read('day'));
};

/*
 * `START_UTC` is a Monday, so flooring the whole weeks since it is the same
 * thing as asking which Monday the reader is standing after.
 */
export const getWeekIndex = (now: Date = new Date()) =>
  Math.floor((toLocalMidnight(now) - START_UTC) / WEEK_MS);

/** The Monday a week begins on, as a `Date`. */
export const getWeekDate = (week: number) => new Date(START_UTC + week * WEEK_MS);

/** The last week the series covers, by its Monday. */
export const getLastWeek = () => getWeekDate(WEEKS.length - 1);

export const getWeek = (week: number): Week | null => WEEKS[week] || null;

/** `2026-09-21` — the `j` parameter, and the key the week's events carry. */
export const toWeekParam = (week: number) =>
  getWeekDate(week).toISOString().slice(0, 10);

const WEEK_PARAM_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/*
 * A date anywhere inside a week names that week, not only its Monday: a link
 * shared on Thursday should open the puzzle that was on the board on Thursday.
 */
export const fromWeekParam = (value: string | null): number | null => {
  const match = value ? WEEK_PARAM_PATTERN.exec(value) : null;
  if (!match) {
    return null;
  }

  const [, year, month, date] = match as unknown as string[];
  const utc = Date.UTC(Number(year), Number(month) - 1, Number(date));
  if (Number.isNaN(utc)) {
    return null;
  }

  return Math.floor((utc - START_UTC) / WEEK_MS);
};

/*
 * `21–27 shtator 2026`, and `28 shtator – 4 tetor 2026` when the week straddles
 * two of them. The month is named once where both days share it, because a
 * range that says the month twice reads as two dates rather than as a week.
 */
export const formatWeekIndex = (week: number) => {
  const from = getWeekDate(week);
  const to = new Date(from.getTime() + 6 * 86_400_000);

  const fromMonth = MONTHS[from.getUTCMonth()];
  const toMonth = MONTHS[to.getUTCMonth()];
  const fromYear = from.getUTCFullYear();
  const toYear = to.getUTCFullYear();

  if (fromYear !== toYear) {
    return `${from.getUTCDate()} ${fromMonth} ${fromYear} – ${to.getUTCDate()} ${toMonth} ${toYear}`;
  }
  if (fromMonth !== toMonth) {
    return `${from.getUTCDate()} ${fromMonth} – ${to.getUTCDate()} ${toMonth} ${toYear}`;
  }

  return `${from.getUTCDate()}–${to.getUTCDate()} ${fromMonth} ${fromYear}`;
};

/** The grid as one flat run of `CELLS` characters, row-major. */
export const getLetters = (week: Week) => [...week.rows.join('')];

/** The cells a word owns, for the trails the board draws over them. */
export const getWordByName = (week: Week, word: string): WeekWord | undefined =>
  week.words.find((entry) => entry.word === word);

/*
 * What the reader just traced. A theme word is matched by its letters and not
 * by the trail it was traced along — a grid can spell the same word twice, and
 * refusing the second way of writing it would be a puzzle about the generator
 * rather than about the word. The canonical trail is what then lights up.
 */
export type Verdict = 'theme' | 'bonus' | 'known' | 'none';

export const judge = (
  week: Week,
  guess: string,
  found: string[],
  bonusFound: string[]
): Verdict => {
  if (found.includes(guess) || bonusFound.includes(guess)) {
    return 'known';
  }
  if (week.words.some((entry) => entry.word === guess)) {
    return 'theme';
  }
  return week.bonus.includes(guess) ? 'bonus' : 'none';
};

/** Bonus words to the hint. Three is a found word every other minute or so. */
export const BONUS_PER_HINT = 3;

export const getHintsEarned = (bonusFound: string[]) =>
  Math.floor(bonusFound.length / BONUS_PER_HINT);

export const getHintsLeft = (bonusFound: string[], hinted: string[]) =>
  Math.max(0, getHintsEarned(bonusFound) - hinted.length);

/** How far into the next hint the reader is — the meter under the button. */
export const getBonusToNextHint = (bonusFound: string[]) =>
  BONUS_PER_HINT - (bonusFound.length % BONUS_PER_HINT);

/*
 * The word the next hint would give away: the longest one still missing that a
 * hint has not already pointed at. Which words were hinted is stored rather
 * than derived from a count, because a count slides — spend one hint, find
 * that word, and the same hint would silently point at the next one.
 */
export const nextHint = (week: Week, found: string[], hinted: string[]) =>
  week.words.find(
    (entry) => !found.includes(entry.word) && !hinted.includes(entry.word)
  )?.word;

/** The hinted words still to be traced — the cells the board sinks. */
export const getOpenHints = (found: string[], hinted: string[]) =>
  hinted.filter((word) => !found.includes(word));

export const isSolved = (week: Week, found: string[]) =>
  found.length >= week.words.length;

export interface Score {
  found: number;
  words: number;
  bonus: number;
  hints: number;
  solved: boolean;
}

export const scoreWeek = (
  week: Week,
  found: string[],
  bonusFound: string[],
  hinted: string[]
): Score => ({
  found: found.length,
  words: week.words.length,
  bonus: bonusFound.length,
  hints: hinted.length,
  solved: isSolved(week, found),
});

const SHARE_MARKS = { found: '🟥', missing: '⬜' };

/*
 * The shared result names the week by its number and never by its theme: a
 * square a word, in the order they fell, and a line for the hints if any were
 * spent. Nothing anyone could read the grid out of.
 */
export const formatShare = (
  week: number,
  puzzle: Week,
  found: string[],
  bonusFound: string[],
  hints: number,
  siteUrl: string
) => {
  const squares = puzzle.words
    .map((_, index) =>
      index < found.length ? SHARE_MARKS.found : SHARE_MARKS.missing
    )
    .join('');

  const lines = [
    `Shtigje nr. ${week + 1} — ${found.length}/${puzzle.words.length}`,
    squares,
  ];

  if (hints !== 0) {
    lines.push(`💡 ${hints}`);
  }
  if (bonusFound.length !== 0) {
    lines.push(`+${bonusFound.length} fjalë shtesë`);
  }

  lines.push(siteUrl);
  return lines.join('\n');
};

/** The archive's query parameter: `/shtigje?j=2026-09-21`. */
export const WEEK_QUERY_PARAM = 'j';

/*
 * A guess is read off the board, so its letters are the board's and can only
 * be of the alphabet; this is the same split the other two games count by, and
 * it is here so that a trail and a headword are measured the same way.
 */
export const spell = (letters: string[], path: number[]) =>
  path.map((cell) => letters[cell] || '').join('');
