import { useEffect, useRef, useState } from 'react';
import {
  DAY_QUERY_PARAM,
  ROUNDS,
  formatDayIndex,
  formatSeconds,
  formatShare,
  fromDayParam,
  getDayIndex,
  getRound,
  getRoundSeconds,
  MAX_LETTERS,
  scoreRound,
  toDayParam,
  type WordResult,
} from '../../lib/lemsh';
import {
  getStats,
  readDay,
  readPlayed,
  writeDay,
  type PlayedDay,
} from '../../lib/lemshStore';
import { track } from '../../lib/analytics';
import LemshRound, { type Reason } from '../lemshround/LemshRound';
import LemshResult from '../lemshresult/LemshResult';
import LemshArchive from '../lemsharchive/LemshArchive';
import styles from './Lemsh.module.scss';

/*
 * The page. It runs entirely in the browser, like the search does: the day is
 * arithmetic on a UTC date, the words are in the bundle, and the result is
 * written to this browser's own storage. There is no server to ask and nothing
 * to send.
 *
 * The round is played one word at a time — the board below answers for the
 * word in hand, this answers for which word that is, what has been played
 * already and where it is kept.
 */

const MESSAGE_MS = 2400;

const resolveDay = (today: number) => {
  const requested = fromDayParam(
    new URLSearchParams(window.location.search).get(DAY_QUERY_PARAM)
  );

  // An unreadable date is not worth a page of its own; the day's round is.
  return requested === null ? today : requested;
};

const Lemsh = () => {
  const [today] = useState(() => getDayIndex());
  const [day, setDay] = useState(() => resolveDay(getDayIndex()));
  const [results, setResults] = useState<WordResult[]>([]);
  /*
   * The clock starts the moment a word appears, so it may not start while the
   * page is still being read: nothing runs until the reader says it should.
   */
  const [started, setStarted] = useState(false);
  const [played, setPlayed] = useState<PlayedDay[]>([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState('');
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const round = getRound(day);
  const future = day > today;
  const over = day >= ROUNDS.length;
  const unopened = day < 0;
  const playable = !future && !over && !unopened && !!round;
  const finished = !!round && results.length >= round.length;

  const flash = (text: string) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  };

  useEffect(() => {
    setResults(readDay(day)?.results || []);
    setStarted(false);
    setCopied(false);
    setMessage('');
    setPlayed(readPlayed());
  }, [day]);

  useEffect(() => {
    if (!playable || !round) {
      return;
    }

    const stored = readDay(day)?.results || [];
    track('lemsh_open', {
      d: toDayParam(day),
      a: day === today ? 'today' : 'archive',
      s:
        stored.length === 0
          ? 'new'
          : stored.length >= round.length
            ? 'done'
            : 'resumed',
    });
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

  const start = () => {
    if (!round) {
      return;
    }
    setStarted(true);
    track('lemsh_start', {
      d: toDayParam(day),
      n: String(round.length),
      i: String(results.length),
    });
  };

  const onDone = (result: WordResult, reason: Reason) => {
    if (!round) {
      return;
    }

    const entry = round[results.length];
    const next = [...results, result];

    setResults(next);
    writeDay(day, { results: next });
    setPlayed(readPlayed());

    if (entry) {
      const common = {
        d: toDayParam(day),
        i: String(results.length + 1),
        w: entry.word,
      };
      if (reason === 'solved') {
        track('lemsh_word_solved', { ...common, t: String(result.seconds) });
      } else {
        track('lemsh_word_missed', { ...common, r: reason });
      }
    }

    if (next.length >= round.length) {
      const score = scoreRound(round, next);
      track('lemsh_finish', {
        d: toDayParam(day),
        p: String(score.points),
        k: String(score.solved),
        n: String(score.words),
        t: String(score.seconds),
      });
    }
  };

  const share = async () => {
    if (!round) {
      return;
    }

    const text = formatShare(
      day,
      round,
      results,
      `${window.location.origin}/leemsh`
    );

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      flash('Rezultati u kopjua.');
      track('lemsh_share', { d: toDayParam(day) });
    } catch (e) {
      flash('Kopjimi nuk u krye. Zgjidhni rezultatin dhe kopjojeni.');
    }
  };

  const stats = getStats(played);
  const archiveToday = Math.min(today, ROUNDS.length - 1);

  /*
   * How wide the widest word in the series is. It belongs to the page rather
   * than to a round, because the play measure below is floored by it: the
   * board may not be squeezed narrower than its own tiles, or the ruled ground
   * stops short of the last one.
   */
  const measure = {
    '--columns': MAX_LETTERS,
  } as React.CSSProperties;

  const title = (
    <header className={styles.head}>
      <h1 className={styles.title}>Lëmsh</h1>
      <p className={`${styles.rail} sc`}>
        <span>{playable ? `nr. ${day + 1}` : 'loja e shkronjave'}</span>
        <span>{day >= 0 && day < ROUNDS.length ? formatDayIndex(day) : ''}</span>
      </p>
    </header>
  );

  const archive = archiveToday > 0 && (
    <LemshArchive day={day} today={archiveToday} played={played} onPick={goToDay} />
  );

  if (!playable || !round) {
    return (
      <div className={styles.lemsh} style={measure}>
        {title}
        <p className={styles.closed}>
          {future
            ? 'Ky lëmsh nuk ka ardhur ende. Kthehu atë ditë.'
            : unopened
              ? `Lëmshi i parë është më ${formatDayIndex(0)}.`
              : 'Seria e lëmshave mbaroi. Lista pret të zgjatet.'}
        </p>
        {today >= 0 && today < ROUNDS.length && (
          <p className={styles.closedLink}>
            <a
              href="/leemsh"
              onClick={(event) => {
                event.preventDefault();
                goToDay(today);
              }}
            >
              Lëmshi i sotëm
            </a>
          </p>
        )}
        {archive}
      </div>
    );
  }

  return (
    <div className={styles.lemsh} style={measure}>
      {title}

      <p className={styles.intro}>
        {round.length} fjalë të përziera, secila me orën e vet. Rendisni shkronjat
        para se të mbarojë ora e fjalës.
      </p>

      <div className={styles.play}>
        {finished ? (
          <LemshResult
            round={round}
            results={results}
            copied={copied}
            onShare={share}
            onDefinition={(word) => track('lemsh_definition', { w: word })}
            onToday={day === today ? undefined : () => goToDay(today)}
          />
        ) : started ? (
          <LemshRound
            key={`${day}-${results.length}`}
            entry={round[results.length]!}
            index={results.length}
            total={round.length}
            points={scoreRound(round, results).points}
            onDone={onDone}
            onShuffle={() =>
              track('lemsh_shuffle', {
                d: toDayParam(day),
                i: String(results.length + 1),
              })
            }
            onWrong={(guess, attempt) =>
              track('lemsh_word_wrong', {
                d: toDayParam(day),
                i: String(results.length + 1),
                w: round[results.length]!.word,
                g: guess,
                n: String(attempt),
              })
            }
          />
        ) : (
          <section className={styles.opening} aria-label="Nisja">
            <dl className={styles.rules}>
              <div className={styles.rule}>
                <dt className={`${styles.ruleLabel} sc`}>Fjalë</dt>
                <dd className={styles.ruleValue}>{round.length}</dd>
              </div>
              <div className={styles.rule}>
                <dt className={`${styles.ruleLabel} sc`}>Koha</dt>
                <dd className={styles.ruleValue}>
                  {formatSeconds(getRoundSeconds(round))}
                </dd>
              </div>
              <div className={styles.rule}>
                <dt className={`${styles.ruleLabel} sc`}>Luajtur</dt>
                <dd className={styles.ruleValue}>
                  {results.length}/{round.length}
                </dd>
              </div>
            </dl>

            <p className={styles.how}>
              Klikoni shkronjat për t’i vendosur me radhë, ose shkruajini me
              tastierë. Fjala kontrollohet vetë sapo të mbushen kutitë. Ora e një
              fjale nis kur shfaqet ajo fjalë dhe vlen vetëm për të — një fjalë e
              humbur nuk e mbyll ditën.
            </p>

            <div className={styles.startStrip}>
              <button type="button" className={`${styles.start} sc`} onClick={start}>
                {results.length === 0 ? 'Fillo' : 'Vazhdo'}
              </button>
            </div>
          </section>
        )}

        <p className={styles.status} role="status" aria-live="polite">
          {message}
        </p>

        {stats.played !== 0 && (
          <p className={`${styles.stats} sc`}>
            <span>Luajtur {stats.played}</span>
            <span>Fjalë {stats.solved}</span>
            <span>Më i miri {stats.best}</span>
          </p>
        )}
      </div>

      {archive}
    </div>
  );
};

export default Lemsh;
