import { useEffect, useMemo, useRef, useState } from 'react';
import {
  DAY_QUERY_PARAM,
  MAX_GUESSES,
  PUZZLES,
  WORD_LENGTH,
  formatDayIndex,
  formatShare,
  fromDayParam,
  getDayIndex,
  getLetterMarks,
  getOutcome,
  getPuzzle,
  scoreGuess,
  toDayParam,
  type Mark,
} from '../../lib/fjalez';
import { ALPHABET, splitLetters } from '../../lib/letters';
import {
  getStats,
  readDay,
  readPlayed,
  writeDay,
  type PlayedDay,
} from '../../lib/fjalezStore';
import { track } from '../../lib/analytics';
import FjalezKeyboard from '../fjalezkeyboard/FjalezKeyboard';
import FjalezArchive from '../fjalezarchive/FjalezArchive';
import styles from './Fjalez.module.scss';

/*
 * The game. It runs entirely in the browser, like the search does: the day is
 * arithmetic on a UTC date, the answer is in the bundle, the guesses are checked
 * against a word list fetched once, and the result is written to this browser's
 * own storage. There is no server to ask and nothing to send.
 */

const MESSAGE_MS = 2400;

/** Fetched once per visit; a guess is only refused when the list is in hand. */
let guessList: Set<string> | null = null;

const loadGuessList = async () => {
  if (guessList) {
    return guessList;
  }

  try {
    const response = await fetch('/api/fjaleez/fjalee.json');
    if (!response.ok) {
      return null;
    }
    guessList = new Set((await response.json()) as string[]);
    return guessList;
  } catch (e) {
    return null;
  }
};

const solutionOf = (day: number) => {
  const puzzle = getPuzzle(day);
  return puzzle ? splitLetters(puzzle.word) : null;
};

const resolveDay = (today: number) => {
  const requested = fromDayParam(
    new URLSearchParams(window.location.search).get(DAY_QUERY_PARAM)
  );

  // An unreadable date is not worth a page of its own; the day's word is.
  return requested === null ? today : requested;
};

const LEGEND: { mark: Mark; letter: string; text: string }[] = [
  { mark: 'correct', letter: 'v', text: 'në vend' },
  { mark: 'present', letter: 'f', text: 'në fjalë, vend tjetër' },
  { mark: 'absent', letter: 'j', text: 'jo në fjalë' },
];

const MARK_LABEL: Record<Mark, string> = {
  correct: 'në vend',
  present: 'në fjalë, vend tjetër',
  absent: 'jo në fjalë',
};

const Fjalez = () => {
  const [today] = useState(() => getDayIndex());
  const [day, setDay] = useState(() => resolveDay(getDayIndex()));
  const [guesses, setGuesses] = useState<string[][]>([]);
  const [current, setCurrent] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [played, setPlayed] = useState<PlayedDay[]>([]);
  const [revealed, setRevealed] = useState(-1);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const activeRow = useRef<HTMLDivElement | null>(null);
  // Checking a guess awaits the word list, so two fast Enters could otherwise
  // both get through with the same row.
  const scoring = useRef(false);

  const puzzle = getPuzzle(day);
  const solution = useMemo(() => solutionOf(day) || [], [day]);
  const outcome = getOutcome(guesses, solution);
  const finished = outcome !== 'playing';
  const future = day > today;
  const ended = day >= PUZZLES.length;
  const unopened = day < 0;
  const playable = !future && !ended && !unopened && !!puzzle;

  const flash = (text: string) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  };

  /*
   * A refused guess is answered where the eye already is — the row nudges once,
   * next to the line that says why — and never under reduced motion.
   */
  const nudge = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    activeRow.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 220, easing: 'ease-in-out' }
    );
  };

  useEffect(() => {
    setGuesses(readDay(day)?.guesses || []);
    setCurrent([]);
    setMessage('');
    setCopied(false);
    setRevealed(-1);
    setPlayed(readPlayed(solutionOf));
  }, [day]);

  useEffect(() => {
    if (!playable) {
      return;
    }
    track('fjalez_open', {
      d: toDayParam(day),
      a: day === today ? 'today' : 'archive',
      s: getOutcome(readDay(day)?.guesses || [], solution),
    });
    // The word list is wanted before the first guess is finished, not after.
    loadGuessList();
  }, [day, playable]);

  // The archive navigates with the history, so Back returns to the day before.
  useEffect(() => {
    const onPopState = () => setDay(resolveDay(today));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [today]);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  const goToDay = (next: number) => {
    if (next === day) {
      return;
    }

    const url = new URL(window.location.href);
    if (next === today) {
      url.searchParams.delete(DAY_QUERY_PARAM);
    } else {
      url.searchParams.set(DAY_QUERY_PARAM, toDayParam(next));
    }
    window.history.pushState({}, '', url);
    setDay(next);
  };

  /* One box per character, so a typed key and a tapped key do the same thing. */
  const addLetter = (character: string) => {
    if (finished || !playable) {
      return;
    }

    const letter = character.toLowerCase();
    if (!ALPHABET.includes(letter)) {
      return;
    }

    setCurrent((cur) => (cur.length >= WORD_LENGTH ? cur : [...cur, letter]));
  };

  const removeLetter = () => {
    setCurrent((cur) => cur.slice(0, -1));
  };

  const submit = async () => {
    if (finished || !playable || scoring.current) {
      return;
    }

    if (current.length < WORD_LENGTH) {
      flash(`Shkruaj ${WORD_LENGTH} shkronja.`);
      nudge();
      return;
    }

    const word = current.join('');
    scoring.current = true;
    const list = await loadGuessList();
    scoring.current = false;

    if (list && !list.has(word)) {
      flash(`«${word.toUpperCase()}» nuk është në fjalor.`);
      nudge();
      track('fjalez_invalid', { d: toDayParam(day), g: word });
      return;
    }

    const next = [...guesses, current];
    const result = getOutcome(next, solution);

    setGuesses(next);
    setCurrent([]);
    setRevealed(next.length - 1);
    writeDay(day, { guesses: next });
    setPlayed(readPlayed(solutionOf));

    if (result === 'won') {
      flash(`E gjetët — ${next.length}/${MAX_GUESSES}.`);
      track('fjalez_win', {
        d: toDayParam(day),
        n: String(next.length),
        w: word,
      });
      return;
    }

    if (result === 'lost') {
      track('fjalez_lose', { d: toDayParam(day), w: solution.join('') });
      return;
    }

    if (next.length === 1) {
      track('fjalez_first_guess', { d: toDayParam(day) });
    }
  };

  // A physical keyboard is the faster way in for anyone who has one.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }

      if (event.key === 'Enter') {
        // Enter on a focused key means that key, not a guess.
        if (target?.tagName === 'BUTTON') {
          return;
        }
        event.preventDefault();
        submit();
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        removeLetter();
        return;
      }

      if (event.key.length === 1) {
        addLetter(event.key);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [current, guesses, day, finished, playable]);

  const share = async () => {
    const text = formatShare(
      day,
      guesses,
      solution,
      `${window.location.origin}/fjaleez`
    );

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      flash('Rezultati u kopjua.');
      track('fjalez_share', { d: toDayParam(day) });
    } catch (e) {
      flash('Kopjimi nuk u krye. Zgjidhni rezultatin dhe kopjojeni.');
    }
  };

  const letterMarks = useMemo(
    () => getLetterMarks(guesses, solution),
    [guesses, solution]
  );

  const stats = useMemo(() => getStats(played), [played]);

  const rows = Array.from({ length: MAX_GUESSES }, (_, index) => {
    const guess = guesses[index];
    if (guess) {
      return { letters: guess, marks: scoreGuess(guess, solution) };
    }
    if (index === guesses.length && playable && !finished) {
      return { letters: current, marks: null };
    }
    return { letters: [], marks: null };
  });

  const title = (
    <header className={styles.head}>
      <h1 className={styles.title}>Fjalëz</h1>
      <p className={`${styles.rail} sc`}>
        <span>{playable ? `nr. ${day + 1}` : 'loja e fjalëve'}</span>
        <span>{day >= 0 && day < PUZZLES.length ? formatDayIndex(day) : ''}</span>
      </p>
    </header>
  );

  const archiveToday = Math.min(today, PUZZLES.length - 1);

  if (!playable || !puzzle) {
    return (
      <div className={styles.fjalez}>
        {title}
        <p className={styles.closed}>
          {future
            ? 'Kjo fjalëz nuk ka ardhur ende. Kthehu atë ditë.'
            : unopened
              ? 'Fjalëza e parë është e 19 shtatorit 2026.'
              : 'Seria e fjalëzave mbaroi. Lista pret të zgjatet.'}
        </p>
        {today >= 0 && today < PUZZLES.length && (
          <p className={styles.closedLink}>
            <a href="/fjaleez" onClick={(event) => {
              event.preventDefault();
              goToDay(today);
            }}>
              Fjalëza e sotme
            </a>
          </p>
        )}
        {archiveToday > 0 && (
          <FjalezArchive
            day={day}
            today={archiveToday}
            played={played}
            onPick={goToDay}
          />
        )}
      </div>
    );
  }

  return (
    <div className={styles.fjalez}>
      {title}

      <p className={styles.intro}>
        Një fjalë me {WORD_LENGTH} shkronja, {MAX_GUESSES} mundësi.
      </p>

      <div className={styles.play}>
        <div
          className={styles.board}
          role="table"
          aria-label={`Fjalëz nr. ${day + 1}`}
        >
          {rows.map((row, rowIndex) => {
            const isActive = rowIndex === guesses.length && !finished;

            return (
              <div
                className={`${styles.row} ${
                  rowIndex === revealed ? styles.revealing : ''
                }`}
                role="row"
                key={rowIndex}
                ref={isActive ? activeRow : undefined}
              >
                {Array.from({ length: WORD_LENGTH }, (_, cell) => {
                  const letter = row.letters[cell];
                  const mark = row.marks?.[cell];
                  const caret = isActive && cell === row.letters.length;

                  return (
                    <div
                      className={styles.tile}
                      role="cell"
                      key={cell}
                      data-mark={mark || (letter ? 'typed' : 'empty')}
                      data-caret={caret ? 'true' : undefined}
                      data-wide={letter && letter.length === 2 ? 'true' : undefined}
                      style={{ animationDelay: `${cell * 60}ms` }}
                      aria-label={
                        letter
                          ? `${letter.toUpperCase()}${mark ? ` — ${MARK_LABEL[mark]}` : ''}`
                          : 'bosh'
                      }
                    >
                      {letter ? letter.toUpperCase() : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>

        {finished ? (
          <section className={styles.result} aria-label="Përfundimi">
            <p className={styles.verdict}>
              {outcome === 'won'
                ? `E gjetët me ${guesses.length} ${guesses.length === 1 ? 'provë' : 'prova'}.`
                : 'Nuk u gjet këtë herë.'}
            </p>

            <a
              className={styles.answer}
              href={`/f/${puzzle.slug}`}
              onClick={() => track('fjalez_definition', { w: puzzle.word })}
            >
              <span className={styles.answerTerm}>{puzzle.word.toUpperCase()}</span>
              <span className={`${styles.answerNote} sc`}>shih kuptimin</span>
            </a>

            <div className={styles.resultActions}>
              <button type="button" className={`${styles.share} sc`} onClick={share}>
                {copied ? 'U kopjua' : 'Kopjo rezultatin'}
              </button>
              {day !== today && (
                <a
                  className={`${styles.todayLink} sc`}
                  href="/fjaleez"
                  onClick={(event) => {
                    event.preventDefault();
                    goToDay(today);
                  }}
                >
                  Fjalëza e sotme
                </a>
              )}
            </div>
          </section>
        ) : (
          <FjalezKeyboard
            marks={letterMarks}
            onLetter={addLetter}
            onEnter={submit}
            onBackspace={removeLetter}
            disabled={!playable}
          />
        )}

        <dl className={styles.legend}>
          {LEGEND.map((item) => (
            <div className={styles.legendItem} key={item.mark}>
              <dt className={styles.legendTile} data-mark={item.mark} aria-hidden="true">
                {item.letter.toUpperCase()}
              </dt>
              <dd className={styles.legendText}>{item.text}</dd>
            </div>
          ))}
        </dl>

        {stats.played !== 0 && (
          <p className={`${styles.stats} sc`}>
            <span>Luajtur {stats.played}</span>
            <span>Gjetur {stats.won}</span>
            <span>Seri {stats.streak}</span>
          </p>
        )}
      </div>

      {archiveToday > 0 && (
        <FjalezArchive
          day={day}
          today={archiveToday}
          played={played}
          onPick={goToDay}
        />
      )}
    </div>
  );
};

export default Fjalez;
