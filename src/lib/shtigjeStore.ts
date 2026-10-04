/*
 * Where a Shtigje result lives: the reader's own browser and nowhere else —
 * the same bargain the other two games make, for the same reason. The site has
 * no server to keep a score on.
 *
 * Only what was done is stored: which theme words were traced, which bonus
 * words were, and which words a hint was spent on. Everything else — whether
 * the week is finished, how many hints are still owed, how a week scores — is
 * derived from those three and from the week itself, so a stored number
 * cannot disagree with the play it came from and the hint economy can be
 * retuned without rewriting anyone's history.
 *
 * The hints are a list of words and not a count on purpose: a count has to be
 * turned back into words to draw them, and the only rule that does that
 * slides — spend a hint, trace the word it gave away, and the same hint would
 * quietly point at the next one.
 *
 * A word is written down the moment it is found rather than at the end, so a
 * week is picked up where it was left. There is no clock here to lose.
 *
 * Every access is wrapped: storage can be full, disabled, or refused outright
 * in a private window, and none of that is allowed to stop the game.
 */
import {
  fromWeekParam,
  getWeek,
  scoreWeek,
  toWeekParam,
  type Score,
} from './shtigje.ts';

const KEY = 'shtigje.v1';

export interface WeekResult {
  /** The theme words traced, in the order they fell. */
  found: string[];
  /** The other dictionary words the grid gave up along the way. */
  bonus: string[];
  /** The theme words a hint was spent on, whether or not they were then traced. */
  hinted: string[];
  /*
   * Seconds the week actually took. It is a **sum of what was done** and
   * not a tick count: each move adds the gap since the last one, capped at
   * `THINK_CAP`, so there is no interval running, nothing to flush on the
   * way out, and a board left open costs two minutes rather than an
   * afternoon. The deliberate hole is the other way round — a genuine long
   * stare at the grid is undercounted, which is the kind direction for a
   * number that only takes points away.
   */
  seconds: number;
  /** Trails committed that were not a word. Nothing limits how many. */
  misses: number;
}

export interface Progress {
  /*
   * Keyed by the week's own Monday — `2026-09-21` — and not by its index in
   * the series, which only means anything relative to `START_UTC`. A date
   * cannot drift, reads plainly in devtools, and is the same identifier the
   * `?j=` parameter and the analytics events already use.
   */
  weeks: Record<string, WeekResult>;
}

const EMPTY: Progress = { weeks: {} };

const isWordList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((word) => typeof word === 'string');

const isCount = (value: unknown) =>
  value === undefined || (typeof value === 'number' && Number.isFinite(value));

const isResult = (value: unknown): value is WeekResult =>
  !!value &&
  isWordList((value as WeekResult).found) &&
  isWordList((value as WeekResult).bonus) &&
  isWordList((value as WeekResult).hinted) &&
  // Tolerated as absent: a week stored before the score existed is a week
  // that was played, and it reads back at nought seconds and no misses.
  isCount((value as WeekResult).seconds) &&
  isCount((value as WeekResult).misses);

export const readProgress = (): Progress => {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) {
      return EMPTY;
    }

    const parsed = JSON.parse(stored) as Partial<Progress>;
    const weeks: Progress['weeks'] = {};

    Object.entries(parsed?.weeks || {}).forEach(([date, result]) => {
      if (isResult(result)) {
        weeks[date] = {
          found: result.found,
          bonus: result.bonus,
          hinted: result.hinted,
          seconds: Math.max(0, Math.round(result.seconds || 0)),
          misses: Math.max(0, Math.round(result.misses || 0)),
        };
      }
    });

    return { weeks };
  } catch (e) {
    return EMPTY;
  }
};

export const readWeek = (week: number): WeekResult | null =>
  readProgress().weeks[toWeekParam(week)] || null;

export const writeWeek = (week: number, result: WeekResult) => {
  try {
    const progress = readProgress();
    progress.weeks[toWeekParam(week)] = result;
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch (e) {
    // A result that cannot be stored is still a week that can be played.
  }
};

export interface PlayedWeek {
  week: number;
  score: Score;
}

/*
 * The weeks already played, newest first, scored against the grid they were
 * played against — the archive, and the numbers above it.
 */
export const readPlayed = (): PlayedWeek[] => {
  const progress = readProgress();

  return Object.entries(progress.weeks)
    .map(([date, stored]) => {
      const week = fromWeekParam(date);
      const puzzle = week === null ? null : getWeek(week);
      if (
        week === null ||
        !puzzle ||
        (stored.found.length === 0 && stored.bonus.length === 0)
      ) {
        return null;
      }
      return {
        week,
        score: scoreWeek(
          puzzle,
          stored.found,
          stored.bonus,
          stored.hinted,
          stored.seconds,
          stored.misses
        ),
      };
    })
    .filter((played): played is PlayedWeek => played !== null)
    .sort((a, b) => b.week - a.week);
};

export interface Stats {
  /** Weeks emptied outright. A half-played week is not one of them. */
  solved: number;
  words: number;
  bonus: number;
  /** Consecutive solved weeks counting back from the most recent one played. */
  streak: number;
  best: number;
}

export const getStats = (played: PlayedWeek[]): Stats => {
  let streak = 0;
  let expected: number | null = null;

  for (const entry of played) {
    if (!entry.score.solved || (expected !== null && entry.week !== expected)) {
      break;
    }
    streak += 1;
    expected = entry.week - 1;
  }

  return {
    solved: played.filter((entry) => entry.score.solved).length,
    words: played.reduce((total, entry) => total + entry.score.found, 0),
    bonus: played.reduce((total, entry) => total + entry.score.bonus, 0),
    streak,
    // Only a week that was emptied has a score worth being the best of one.
    best: played.reduce(
      (best, entry) => (entry.score.solved ? Math.max(best, entry.score.points) : best),
      0
    ),
  };
};
