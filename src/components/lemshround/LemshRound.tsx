import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MAX_LETTERS,
  formatSeconds,
  getLetters,
  getSeconds,
  scoreWord,
  type RoundWord,
  type WordResult,
} from '../../lib/lemsh';
import { ALPHABET } from '../../lib/letters';
import styles from './LemshRound.module.scss';

/*
 * One word, one clock. The tiles come in the order the generator dealt them,
 * the reader puts them back, and the component answers for exactly one thing:
 * how the word ended and how long it took. Which word it was, what it is worth
 * and where the result goes are the page's business, not this one's.
 *
 * The clock is a deadline rather than a count of ticks, so a tab that was
 * backgrounded comes back to the time that actually passed.
 */

export type Reason = 'solved' | 'timeout' | 'skip';

interface LemshRoundProps {
  entry: RoundWord;
  /** Zero-based, but shown to the reader as one of N. */
  index: number;
  total: number;
  /** The round's score so far — the running number over the board. */
  points: number;
  onDone: (result: WordResult, reason: Reason) => void;
  /** Raised once per word, the first time the tiles are re-dealt. */
  onShuffle: () => void;
}

/** Long enough to read the word that was just won or lost, and no longer. */
const REVEAL_MS = 1700;
const MESSAGE_MS = 2000;

/** Under this many seconds the clock stops being apparatus and starts being red. */
const URGENT_SECONDS = 10;

interface Tile {
  id: number;
  letter: string;
}

const shuffle = (tiles: Tile[]) => {
  const next = [...tiles];
  for (let index = next.length - 1; index > 0; index--) {
    const pick = Math.floor(Math.random() * (index + 1));
    [next[index], next[pick]] = [next[pick] as Tile, next[index] as Tile];
  }
  return next;
};

const LemshRound = ({
  entry,
  index,
  total,
  points,
  onDone,
  onShuffle,
}: LemshRoundProps) => {
  const letters = useMemo(() => getLetters(entry.word), [entry.word]);
  const limit = useMemo(() => getSeconds(entry.word), [entry.word]);

  const [tiles, setTiles] = useState<Tile[]>(() =>
    getLetters(entry.scramble).map((letter, id) => ({ id, letter }))
  );
  /** The tiles taken, by id and in the order they were taken. */
  const [picked, setPicked] = useState<number[]>([]);
  const [left, setLeft] = useState(limit);
  /** Set once, when the word ends — the clock stops and the tiles stop with it. */
  const [done, setDone] = useState<{ result: WordResult; reason: Reason } | null>(null);
  const [message, setMessage] = useState('');

  const deadline = useRef(Date.now() + limit * 1000);
  const clock = useRef<ReturnType<typeof setInterval>>(undefined);
  const messageTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const revealTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const slots = useRef<HTMLDivElement | null>(null);
  const shuffled = useRef(false);
  // The word ends once: a solve landing in the same tick as the clock running
  // out may not report twice.
  const ended = useRef(false);

  const phase = !done ? 'playing' : done.result.solved ? 'solved' : 'missed';
  const letterOf = (id: number) => tiles.find((tile) => tile.id === id)?.letter || '';
  const used = new Set(picked);

  const flash = (text: string) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  };

  /*
   * A refused word is answered where the eye already is — the slots nudge once
   * — and never under reduced motion.
   */
  const nudge = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    slots.current?.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 220, easing: 'ease-in-out' }
    );
  };

  const finish = (reason: Reason) => {
    if (ended.current) {
      return;
    }
    ended.current = true;

    // The seconds actually spent, however the word ended — a word given up
    // after five seconds took five, and only the clock running out takes the
    // whole of it. The tick that ends the word can overshoot by a fraction.
    const spent = (limit * 1000 - (deadline.current - Date.now())) / 1000;

    const result: WordResult = {
      seconds: Math.round(Math.min(limit, Math.max(0, spent))),
      solved: reason === 'solved',
    };

    // The clock stops where the word stopped: the reveal that follows reads
    // the seconds that were left, and they may not keep falling under it.
    clearInterval(clock.current);
    clearTimeout(messageTimer.current);
    setLeft(limit - result.seconds);
    setMessage('');
    setDone({ result, reason });

    revealTimer.current = setTimeout(() => onDone(result, reason), REVEAL_MS);
  };

  useEffect(() => {
    clock.current = setInterval(() => {
      const remaining = Math.ceil((deadline.current - Date.now()) / 1000);
      setLeft(Math.max(0, remaining));
      if (remaining <= 0) {
        finish('timeout');
      }
    }, 250);

    return () => clearInterval(clock.current);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(messageTimer.current);
      clearTimeout(revealTimer.current);
    },
    []
  );

  const take = (id: number) => {
    if (phase !== 'playing' || used.has(id) || picked.length >= letters.length) {
      return;
    }

    const next = [...picked, id];
    setPicked(next);

    if (next.length < letters.length) {
      return;
    }

    if (next.map(letterOf).join('') === letters.join('')) {
      finish('solved');
      return;
    }

    flash('Jo kjo — provoni një rend tjetër.');
    nudge();
  };

  const drop = (position: number) => {
    if (phase !== 'playing') {
      return;
    }
    setPicked((current) => current.filter((_, at) => at !== position));
  };

  const clear = () => {
    if (phase !== 'playing') {
      return;
    }
    setPicked([]);
  };

  const redeal = () => {
    if (phase !== 'playing') {
      return;
    }
    setTiles((current) => shuffle(current));
    if (!shuffled.current) {
      shuffled.current = true;
      onShuffle();
    }
  };

  // A physical keyboard is the faster way in for anyone who has one: a letter
  // takes the first tile still showing it.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || phase !== 'playing') {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }

      if (event.key === 'Backspace') {
        event.preventDefault();
        setPicked((current) => current.slice(0, -1));
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clear();
        return;
      }

      if (event.key.length !== 1) {
        return;
      }

      const letter = event.key.toLowerCase();
      if (!ALPHABET.includes(letter)) {
        return;
      }

      const tile = tiles.find(
        (candidate) => candidate.letter === letter && !used.has(candidate.id)
      );
      if (tile) {
        event.preventDefault();
        take(tile.id);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [tiles, picked, phase]);

  /*
   * A key pressed with a pointer gives the focus straight back, so the page
   * does not keep a ring on a tile that has already moved. A tile reached with
   * the Tab key keeps its focus — `detail` is 0 there — because that reader is
   * navigating by focus and has nowhere else to stand.
   */
  const release = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) {
      event.currentTarget.blur();
    }
  };

  const solved = phase === 'solved';
  const won = done?.result.solved ? scoreWord(entry, done.result) : 0;

  /*
   * Both grids are laid out over the longest word in the series and then cut
   * to this word's share of it — the keyboard's own trick — so the tiles keep
   * one size from word to word instead of swelling when a word is short.
   */
  const measure = {
    '--slots': letters.length,
    '--columns': MAX_LETTERS,
  } as React.CSSProperties;

  return (
    <div className={styles.round}>
      <p className={`${styles.rail} sc`}>
        <span>
          fjala {index + 1} nga {total}
        </span>
        <span>{points} pikë</span>
        <span
          className={styles.clock}
          data-urgent={left <= URGENT_SECONDS && phase === 'playing' ? 'true' : undefined}
          role="timer"
          aria-label={`${left} sekonda`}
        >
          {formatSeconds(left)}
        </span>
      </p>

      <div
        className={styles.gauge}
        role="presentation"
        data-urgent={left <= URGENT_SECONDS && phase === 'playing' ? 'true' : undefined}
      >
        <span style={{ inlineSize: `${(left / limit) * 100}%` }} />
      </div>

      <div
        className={styles.slots}
        ref={slots}
        style={measure}
        role="group"
        aria-label="Fjala që po ndërtohet"
      >
        {letters.map((_, position) => {
          const id = picked[position];
          const letter =
            phase === 'missed' ? letters[position] : id === undefined ? '' : letterOf(id);
          const taken = id !== undefined;

          return (
            <button
              key={position}
              type="button"
              className={styles.slot}
              data-state={
                phase === 'missed' ? 'missed' : solved ? 'solved' : taken ? 'set' : 'empty'
              }
              data-caret={
                phase === 'playing' && position === picked.length ? 'true' : undefined
              }
              data-wide={letter && letter.length === 2 ? 'true' : undefined}
              disabled={!taken || phase !== 'playing'}
              onClick={(event) => {
                release(event);
                drop(position);
              }}
              aria-label={letter ? `${letter.toUpperCase()} — hiqe` : 'bosh'}
            >
              {letter ? letter.toUpperCase() : ''}
            </button>
          );
        })}
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {phase === 'solved' && `E zgjidhët — ${formatSeconds(left)} mbetën, +${won} pikë.`}
        {phase === 'missed' &&
          `${done?.reason === 'skip' ? 'E kaluat' : 'Koha mbaroi'}. Fjala ishte ${entry.word.toUpperCase()}.`}
        {phase === 'playing' && message}
      </p>

      <div
        className={styles.tray}
        style={measure}
        aria-label="Shkronjat e përziera"
        role="group"
      >
        {tiles.map((tile) => (
          <button
            key={tile.id}
            type="button"
            className={styles.tile}
            data-used={used.has(tile.id) ? 'true' : undefined}
            data-wide={tile.letter.length === 2 ? 'true' : undefined}
            disabled={used.has(tile.id) || phase !== 'playing'}
            onClick={(event) => {
              release(event);
              take(tile.id);
            }}
            aria-label={
              used.has(tile.id)
                ? `${tile.letter.toUpperCase()} — e vendosur`
                : tile.letter.toUpperCase()
            }
          >
            {tile.letter.toUpperCase()}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={`${styles.action} sc`}
          onClick={(event) => {
            release(event);
            clear();
          }}
          disabled={picked.length === 0 || phase !== 'playing'}
        >
          Pastro
        </button>
        <button
          type="button"
          className={`${styles.action} sc`}
          onClick={(event) => {
            release(event);
            redeal();
          }}
          disabled={phase !== 'playing'}
        >
          Përzie
        </button>
        <button
          type="button"
          className={`${styles.action} ${styles.skip} sc`}
          onClick={(event) => {
            release(event);
            finish('skip');
          }}
          disabled={phase !== 'playing'}
        >
          Kaloje
        </button>
      </div>
    </div>
  );
};

export default LemshRound;
