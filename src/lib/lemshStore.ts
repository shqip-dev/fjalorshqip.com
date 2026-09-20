/*
 * Where a Lëmsh result lives: the reader's own browser and nowhere else — the
 * same bargain Fjalëz makes, for the same reason. The site has no server to
 * keep a score on.
 *
 * Only what was done is stored — the seconds each word took and whether it was
 * untangled. The score is computed from that and from the round, so a stored
 * number can never disagree with the play it came from, and the day it took to
 * tune the scoring is not a day of scores that read wrong.
 *
 * A word is written down the moment it ends, not at the end of the round, so
 * closing the tab after four words costs the fifth and not the four. The clock
 * of the word in hand is the one thing not kept: reopening a half-played round
 * starts the word that is left over again, which is a kindness for the reader
 * whose bus arrived and a small hole for the reader who wants one.
 *
 * Every access is wrapped: storage can be full, disabled, or refused outright
 * in a private window, and none of that is allowed to stop the game.
 */
import { fromDayParam, getRound, scoreRound, toDayParam, type Score } from './lemsh.ts';
import type { WordResult } from './lemsh.ts';

const KEY = 'lemsh.v1';

export interface DayResult {
  /** One entry per word played, in the round's own order. */
  results: WordResult[];
}

export interface Progress {
  /*
   * Keyed by the day's own date — `2026-09-20` — and not by its index in the
   * series, which only means anything relative to `START_UTC`. A date cannot
   * drift, reads plainly in devtools, and is the identifier the `?d=`
   * parameter and the analytics events already use.
   */
  days: Record<string, DayResult>;
}

const EMPTY: Progress = { days: {} };

const isResultList = (value: unknown): value is WordResult[] =>
  Array.isArray(value) &&
  value.every(
    (result) =>
      !!result &&
      typeof (result as WordResult).seconds === 'number' &&
      Number.isFinite((result as WordResult).seconds) &&
      typeof (result as WordResult).solved === 'boolean'
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
      if (isResultList((result as DayResult)?.results)) {
        days[date] = { results: (result as DayResult).results };
      }
    });

    return { days };
  } catch (e) {
    return EMPTY;
  }
};

export const readDay = (day: number): DayResult | null =>
  readProgress().days[toDayParam(day)] || null;

export const writeDay = (day: number, result: DayResult) => {
  try {
    const progress = readProgress();
    progress.days[toDayParam(day)] = result;
    window.localStorage.setItem(KEY, JSON.stringify(progress));
  } catch (e) {
    // A result that cannot be stored is still a round that can be played.
  }
};

export interface PlayedDay {
  day: number;
  score: Score;
  /** A round is done when every word in it has been answered for. */
  done: boolean;
}

/*
 * The days already played, newest first, scored against the round they were
 * played against — the archive, and the numbers above it.
 */
export const readPlayed = (): PlayedDay[] => {
  const progress = readProgress();

  return Object.entries(progress.days)
    .map(([date, stored]) => {
      const day = fromDayParam(date);
      const round = day === null ? null : getRound(day);
      if (day === null || !round || stored.results.length === 0) {
        return null;
      }
      return {
        day,
        score: scoreRound(round, stored.results),
        done: stored.results.length >= round.length,
      };
    })
    .filter((played): played is PlayedDay => played !== null)
    .sort((a, b) => b.day - a.day);
};

export interface Stats {
  played: number;
  /** Words untangled across every finished round. */
  solved: number;
  best: number;
}

export const getStats = (played: PlayedDay[]): Stats => {
  const finished = played.filter((entry) => entry.done);

  return {
    played: finished.length,
    solved: finished.reduce((total, entry) => total + entry.score.solved, 0),
    best: finished.reduce((best, entry) => Math.max(best, entry.score.points), 0),
  };
};
