import { useEffect, useRef, useState } from 'react';
import {
  BONUS_PER_HINT,
  WEEKS,
  WEEK_QUERY_PARAM,
  formatShare,
  formatWeekIndex,
  fromWeekParam,
  getBonusToNextHint,
  getHintsLeft,
  getOpenHints,
  getWeek,
  getWeekIndex,
  getWordByName,
  isSolved,
  nextHint,
  toWeekParam,
} from '../../lib/shtigje';
import {
  getStats,
  readPlayed,
  readWeek,
  writeWeek,
  type PlayedWeek,
} from '../../lib/shtigjeStore';
import { getSlug } from '../../lib/process';
import { track } from '../../lib/analytics';
import ShtigjeBoard from '../shtigjeboard/ShtigjeBoard';
import ShtigjeArchive from '../shtigjearchive/ShtigjeArchive';
import styles from './Shtigje.module.scss';

/*
 * The page. Like the other two games it runs entirely in the browser: the week
 * is arithmetic on a date in Tirana, the grid is in the bundle, and what the
 * reader found is written to this browser's own storage. There is no server to
 * ask and nothing to send.
 *
 * The board below answers for what was traced; this answers for which week it
 * was, what has been found already, what a hint costs and where it all lives.
 */

const MESSAGE_MS = 2600;

const resolveWeek = (current: number) => {
  const requested = fromWeekParam(
    new URLSearchParams(window.location.search).get(WEEK_QUERY_PARAM)
  );

  // An unreadable date is not worth a page of its own; this week's grid is.
  return requested === null ? current : requested;
};

const Shtigje = () => {
  const [current] = useState(() => getWeekIndex());
  const [week, setWeek] = useState(() => resolveWeek(getWeekIndex()));
  const [found, setFound] = useState<string[]>([]);
  const [bonus, setBonus] = useState<string[]>([]);
  const [hinted, setHinted] = useState<string[]>([]);
  const [played, setPlayed] = useState<PlayedWeek[]>([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const puzzle = getWeek(week);
  const future = week > current;
  const over = week >= WEEKS.length;
  const unopened = week < 0;
  const playable = !future && !over && !unopened && !!puzzle;
  const solved = !!puzzle && isSolved(puzzle, found);

  const flash = (text: string) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  };

  useEffect(() => {
    const stored = readWeek(week);
    setFound(stored?.found || []);
    setBonus(stored?.bonus || []);
    setHinted(stored?.hinted || []);
    setCopied(false);
    setMessage('');
    setPlayed(readPlayed());
  }, [week]);

  useEffect(() => {
    if (!playable || !puzzle) {
      return;
    }

    const stored = readWeek(week);
    track('shtigje_open', {
      j: toWeekParam(week),
      a: week === current ? 'current' : 'archive',
      s: !stored?.found.length
        ? 'new'
        : stored.found.length >= puzzle.words.length
          ? 'done'
          : 'resumed',
    });
  }, [week, playable]);

  // The archive navigates with the history, so Back returns to the week before.
  useEffect(() => {
    const onPopState = () => setWeek(resolveWeek(current));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [current]);

  useEffect(() => () => clearTimeout(messageTimer.current), []);

  const goToWeek = (next: number) => {
    if (next === week) {
      return;
    }

    const url = new URL(window.location.href);
    if (next === current) {
      url.searchParams.delete(WEEK_QUERY_PARAM);
    } else {
      url.searchParams.set(WEEK_QUERY_PARAM, toWeekParam(next));
    }
    window.history.pushState({}, '', url);
    setWeek(next);
  };

  const store = (next: {
    found?: string[];
    bonus?: string[];
    hinted?: string[];
  }) => {
    const result = {
      found: next.found || found,
      bonus: next.bonus || bonus,
      hinted: next.hinted || hinted,
    };
    writeWeek(week, result);
    setPlayed(readPlayed());
    return result;
  };

  const onFound = (word: string) => {
    if (!puzzle) {
      return;
    }

    const next = [...found, word];
    setFound(next);
    store({ found: next });

    track('shtigje_word', {
      j: toWeekParam(week),
      w: word,
      i: String(next.length),
      n: String(puzzle.words.length),
    });

    if (next.length >= puzzle.words.length) {
      track('shtigje_solve', {
        j: toWeekParam(week),
        b: String(bonus.length),
        h: String(hinted.length),
      });
    }
  };

  const onBonus = (word: string) => {
    const next = [...bonus, word];
    setBonus(next);
    store({ bonus: next });

    track('shtigje_bonus', {
      j: toWeekParam(week),
      w: word,
      b: String(next.length),
    });
  };

  const onHint = () => {
    if (!puzzle) {
      return;
    }

    const word = nextHint(puzzle, found, hinted);
    if (!word) {
      return;
    }

    const next = [...hinted, word];
    setHinted(next);
    store({ hinted: next });
    flash('Shkronjat e një fjale u ndriçuan — rendi mbetet i juaji.');

    track('shtigje_hint', {
      j: toWeekParam(week),
      w: word,
      h: String(next.length),
    });
  };

  const share = async () => {
    if (!puzzle) {
      return;
    }

    const text = formatShare(
      week,
      puzzle,
      found,
      bonus,
      hinted.length,
      `${window.location.origin}/shtigje`
    );

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      flash('Rezultati u kopjua.');
      track('shtigje_share', { j: toWeekParam(week) });
    } catch (e) {
      flash('Kopjimi nuk u krye. Zgjidhni rezultatin dhe kopjojeni.');
    }
  };

  const stats = getStats(played);
  const archiveCurrent = Math.min(current, WEEKS.length - 1);

  const title = (
    <header className={styles.head}>
      <h1 className={styles.title}>Shtigje</h1>
      <p className={`${styles.rail} sc`}>
        <span>{playable ? `java nr. ${week + 1}` : 'loja javore'}</span>
        <span>{week >= 0 && week < WEEKS.length ? formatWeekIndex(week) : ''}</span>
      </p>
    </header>
  );

  const archive = archiveCurrent > 0 && (
    <ShtigjeArchive
      week={week}
      current={archiveCurrent}
      played={played}
      onPick={goToWeek}
    />
  );

  if (!playable || !puzzle) {
    return (
      <div className={styles.shtigje}>
        {title}
        <p className={styles.closed}>
          {future
            ? 'Kjo javë nuk ka ardhur ende. Kthehu të hënën.'
            : unopened
              ? `Java e parë nis më ${formatWeekIndex(0)}.`
              : 'Seria e javëve mbaroi. Lista pret të zgjatet.'}
        </p>
        {current >= 0 && current < WEEKS.length && (
          <p className={styles.closedLink}>
            <a
              href="/shtigje"
              onClick={(event) => {
                event.preventDefault();
                goToWeek(current);
              }}
            >
              Shtigjet e kësaj jave
            </a>
          </p>
        )}
        {archive}
      </div>
    );
  }

  const hintsLeft = getHintsLeft(bonus, hinted);

  return (
    <div className={styles.shtigje}>
      {title}

      <p className={styles.intro}>
        Të gjitha shkronjat e rrjetit i përkasin fjalëve të temës — asnjë nuk
        është e tepërt. Lidhni shkronjat ngjitur, edhe tërthorazi, për të nxjerrë
        një shteg.
      </p>

      <div className={styles.play}>
        <section className={styles.theme} aria-label="Tema e javës">
          <p className={`${styles.themeLabel} sc`}>Tema</p>
          <p className={styles.themeTitle}>{puzzle.theme}</p>
          <p className={`${styles.count} sc`}>
            <span>
              {found.length} nga {puzzle.words.length} fjalë
            </span>
            <span>
              {solved
                ? 'rrjeti u zbraz'
                : bonus.length === 0
                  ? `${BONUS_PER_HINT} fjalë shtesë për një ndihmë`
                  : hintsLeft !== 0
                    ? `${hintsLeft} ndihmë në dorë`
                    : `edhe ${getBonusToNextHint(bonus)} për një ndihmë`}
            </span>
          </p>
        </section>

        <ShtigjeBoard
          week={puzzle}
          found={found}
          bonusFound={bonus}
          hinted={getOpenHints(found, hinted)}
          onFound={onFound}
          onBonus={onBonus}
          onMiss={(guess) =>
            track('shtigje_miss', { j: toWeekParam(week), g: guess })
          }
          hintsLeft={hintsLeft}
          onHint={onHint}
          done={solved}
        />

        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>

        {found.length !== 0 && (
          <section className={styles.words} aria-label="Fjalët e gjetura">
            <h2 className={`${styles.wordsLabel} sc`}>
              <span>{solved ? 'Fjalët e javës' : 'Të gjetura'}</span>
              <span>
                {found.length}/{puzzle.words.length}
              </span>
            </h2>
            <ul className={styles.wordList}>
              {found.map((word) => (
                <li className={styles.wordRow} key={word}>
                  <a
                    className={styles.wordLink}
                    href={`/f/${getWordByName(puzzle, word)?.slug || getSlug(word)}`}
                    onClick={() => track('shtigje_definition', { w: word })}
                  >
                    <span className={styles.term}>{word.toUpperCase()}</span>
                    <span className={`${styles.letters} sc`}>
                      {getWordByName(puzzle, word)?.path.length} shkronja
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {solved && (
          <div className={styles.actions}>
            <button type="button" className={`${styles.share} sc`} onClick={share}>
              {copied ? 'U kopjua' : 'Kopjo rezultatin'}
            </button>
            {week !== current && (
              <a
                className={`${styles.currentLink} sc`}
                href="/shtigje"
                onClick={(event) => {
                  event.preventDefault();
                  goToWeek(current);
                }}
              >
                Java e tanishme
              </a>
            )}
          </div>
        )}

        {bonus.length !== 0 && (
          <section className={styles.bonus} aria-label="Fjalët shtesë">
            <h2 className={`${styles.bonusLabel} sc`}>
              <span>Fjalë shtesë</span>
              <span>{bonus.length}</span>
            </h2>
            <p className={styles.bonusList}>
              {bonus.map((word, index) => (
                <span key={word}>
                  {index !== 0 && <span aria-hidden="true"> · </span>}
                  <a
                    href={`/f/${getSlug(word)}`}
                    onClick={() => track('shtigje_definition', { w: word })}
                  >
                    {word}
                  </a>
                </span>
              ))}
            </p>
            <p className={styles.bonusNote}>
              Fjalë që rrjeti i shkruan rastësisht dhe nuk i përkasin temës. Çdo{' '}
              {BONUS_PER_HINT} prej tyre blejnë një ndihmë.
            </p>
          </section>
        )}

        {stats.solved !== 0 && (
          <p className={`${styles.stats} sc`}>
            <span>Javë të plota {stats.solved}</span>
            <span>Fjalë {stats.words}</span>
            <span>Varg {stats.streak}</span>
          </p>
        )}
      </div>

      {archive}
    </div>
  );
};

export default Shtigje;
