/*
 * Where a Fjalëz result lives: the reader's own browser and nowhere else. The
 * site has no server to keep a score on, which is the whole architecture, so
 * `localStorage` is not a shortcut here — it is the only honest place for it.
 *
 * Every access is wrapped: storage can be full, disabled, or refused outright
 * in a private window, and none of that is allowed to stop the game.
 */
import {
  fromDayParam,
  getOutcome,
  toDayParam,
  type Outcome,
} from './fjalez.ts';

const KEY = 'fjalez.v1';

/** Guesses only — the outcome is derived, so the two can never disagree. */
export interface DayResult {
  guesses: string[][];
}

export interface Progress {
  /*
   * Keyed by the day's own date — `2026-09-19` — and not by its index in the
   * series. The index only means anything relative to `START_UTC`, so re-dating
   * the series would silently re-point every stored result at a different word;
   * a date cannot drift, reads plainly in devtools, and is the same identifier
   * the `?d=` parameter and the analytics events already use.
   */
  days: Record<string, DayResult>;
}

const EMPTY: Progress = { days: {} };

const isGuessList = (value: unknown): value is string[][] =>
  Array.isArray(value) &&
  value.every(
    (guess) =>
      Array.isArray(guess) && guess.every((letter) => typeof letter === 'string')
  );

export const readProgress = (): Progress => {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (!stored) {
      return EMPTY;
    }

    const parsed = JSON.parse(stored) as Partial<Progress>;
    const days: Progress['days'] = {};

    Object.entries(parsed?.days || {}).forEach(([date, result]) => {
      if (isGuessList((result as DayResult)?.guesses)) {
        days[date] = { guesses: (result as DayResult).guesses };
      }
    });

    return { days };
  } catch (e) {
    return EMPTY;
  }
};

export const readDay = (day: number): DayResult | null => {
  return readProgress().days[toDayParam(day)] || null;
};

export const writeDay = (day: number, result: DayResult) => {
  try {
    const progress = readProgress();
    progress.days[toDayParam(day)] = result;
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch (e) {
    // A result that cannot be stored is still a game that can be played.
  }
};

export interface PlayedDay {
  day: number;
  guesses: string[][];
  outcome: Outcome;
}

/*
 * The days already played, newest first, scored against the answer they were
 * played against — the archive, and the numbers above it.
 */
export const readPlayed = (
  solutionOf: (day: number) => string[] | null
): PlayedDay[] => {
  const progress = readProgress();

  return Object.entries(progress.days)
    .map(([date, result]) => {
      const day = fromDayParam(date);
      const solution = day === null ? null : solutionOf(day);
      if (day === null || !solution || result.guesses.length === 0) {
        return null;
      }
      return {
        day,
        guesses: result.guesses,
        outcome: getOutcome(result.guesses, solution),
      };
    })
    .filter((played): played is PlayedDay => played !== null)
    .sort((a, b) => b.day - a.day);
};

export interface Stats {
  played: number;
  won: number;
  /** Consecutive solved days counting back from the most recent day played. */
  streak: number;
}

export const getStats = (played: PlayedDay[]): Stats => {
  const finished = played.filter((entry) => entry.outcome !== 'playing');
  let streak = 0;
  let expected: number | null = null;

  for (const entry of finished) {
    if (entry.outcome !== 'won' || (expected !== null && entry.day !== expected)) {
      break;
    }
    streak += 1;
    expected = entry.day - 1;
  }

  return {
    played: finished.length,
    won: finished.filter((entry) => entry.outcome === 'won').length,
    streak,
  };
};
