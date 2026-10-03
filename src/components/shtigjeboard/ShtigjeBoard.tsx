import { useEffect, useMemo, useRef, useState } from 'react';
import {
  COLS,
  ROWS,
  areNeighbours,
  getLetters,
  getWordByName,
  judge,
  lineBetween,
  spell,
  type Week,
} from '../../lib/shtigje';
import styles from './ShtigjeBoard.module.scss';

/*
 * The grid, and the one thing the reader does to it: trace a trail.
 *
 * A trail is built the two ways a trail wants to be built — dragged through
 * with a finger or a mouse, or tapped out cell by cell — and the two are the
 * same code path, because a tap is a press that never moved. Releasing a drag
 * commits it; tapping the last cell again commits it; the key under the board
 * commits it for anyone working the cells with Tab and Enter, who has no
 * gesture to release.
 *
 * A **drag takes a cell by its middle and not by its edge**, which is the one
 * thing that makes a diagonal possible at all. Going from a cell to the one
 * diagonally beyond it, the pointer crosses a corner the two cells beside it
 * also meet at; take a cell the moment the pointer is inside it and one of
 * those two is always taken first, and the trail turns a diagonal into two
 * steps. So the drag does not watch the cells at all — it watches where the
 * pointer is on the grid, and a cell is entered only within `HIT_RADIUS` of
 * its centre. The corners are dead ground. A *tap* still takes the whole
 * cell: a press is deliberate where a drag is in passing.
 *
 * The letters stand on the open sheet and a trail is drawn **behind** them as
 * the shape a rounded square would leave if it were dragged along the trail:
 * a bead under every letter it takes, and a bar joining each letter to the
 * next one *in the order they were traced* — never to its neighbour on the
 * grid. The pieces are opaque and one colour, so the union is the silhouette
 * and no outline is ever computed.
 *
 * **The bar is as wide as the bead is across that direction, which is not one
 * number.** A rounded square is wider corner-to-corner than side-to-side, so
 * a bar of one fixed width is flush with the bead along a row or a column and
 * steps visibly inside it on a diagonal — the bead's corners stand out past
 * the bar's edges and the silhouette breaks at every diagonal junction. Only
 * a circle has one width in every direction; a rounded square has `support()`
 * below. Sizing each bar by the bead's support in the direction across it
 * makes the bar's long edges **tangent** to the bead at both ends, so the
 * union is tangent-continuous: no step on a straight run, and no step on a
 * turn either, where the silhouette runs tangent → bead arc → tangent.
 *
 * The cost is honest and is the point: a diagonal stretch is a little wider
 * than a straight one, because that is the mark a square stamp leaves when it
 * is dragged corner-first. `RADIUS` is the dial — at `SIDE / 2` the bead is a
 * circle and the two widths meet.
 *
 * A hint draws the beads and **not** the bars, which is the whole of what a
 * hint is: the cells without the order.
 *
 * The component answers for what was traced and for nothing else. Which words
 * are the week's, what a found word is worth and where any of it is kept are
 * the page's business.
 */

/** Shorter than this is not a word anywhere in the dictionary's four-letter floor. */
const MIN_TRACE = 4;
const MESSAGE_MS = 2200;

interface ShtigjeBoardProps {
  week: Week;
  /** The theme words already traced, in the order they fell. */
  found: string[];
  bonusFound: string[];
  /** Theme words a hint has given away and that are still unfound. */
  hinted: string[];
  onFound: (word: string) => void;
  onBonus: (word: string) => void;
  /** Raised when a finished trail is not a word — what was traced. */
  onMiss: (guess: string) => void;
  hintsLeft: number;
  onHint: () => void;
  /** Nothing is traced once the grid is empty. */
  done: boolean;
}

const centre = (cell: number) => ({
  x: (cell % COLS) + 0.5,
  y: Math.floor(cell / COLS) + 0.5,
});

/*
 * The bead, in cells. `SIDE` leaves a fifth of a cell of sheet showing between
 * two beads that are side by side without being joined — enough to read two
 * different words apart where their cells touch. `RADIUS` is a little under a
 * third of the side: square enough to sit on a grid, round enough that a
 * diagonal stretch is only a tenth wider than a straight one.
 */
const SIDE = 0.78;
const RADIUS = 0.27;

/*
 * How near a cell's centre a dragging pointer has to come to take it, in
 * cells. A straight diagonal passes 0.707 from the centre of each cell it
 * cuts the corner of, so anything under that leaves a diagonal unobstructed;
 * 0.42 keeps most of the slack for a hand that does not drag straight, while
 * still being over four fifths of the way across a cell for a drag along a
 * row. Below about 0.3 the board starts refusing honest drags.
 */
const HIT_RADIUS = 0.42;

/*
 * How far the bead reaches from its own centre in one direction — the support
 * function of a rounded square, which is a square of side `SIDE - 2·RADIUS`
 * grown by a disc of `RADIUS`. `SIDE / 2` across a side, and more across a
 * corner. This is the whole reason a bar cannot have one fixed width.
 */
const support = (x: number, y: number) =>
  (SIDE / 2 - RADIUS) * (Math.abs(x) + Math.abs(y)) + RADIUS;

interface Bead {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  /** Degrees about `(originX, originY)`; 0 for the beads. */
  angle: number;
  originX: number;
  originY: number;
  /** Where along the trail this piece falls — the stagger the settle reads. */
  step: number;
}

/** A rounded square under one letter. */
const beadOf = (cell: number, step: number, key: string): Bead => {
  const at = centre(cell);
  return {
    key,
    x: at.x - SIDE / 2,
    y: at.y - SIDE / 2,
    width: SIDE,
    height: SIDE,
    radius: RADIUS,
    angle: 0,
    originX: at.x,
    originY: at.y,
    step,
  };
};

/*
 * The bar joining two letters, running centre to centre and as wide as the
 * bead reaches across it, so its long edges are tangent to the bead at both
 * ends and its own ends are covered by them. Square corners, because they are
 * never seen: the two end edges are chords of the beads they sit inside.
 */
const barOf = (from: number, to: number, step: number, key: string): Bead => {
  const start = centre(from);
  const end = centre(to);
  const run = Math.hypot(end.x - start.x, end.y - start.y);
  // The direction across the bar, which is the one the bead is measured in.
  const half = support(-(end.y - start.y) / run, (end.x - start.x) / run);

  return {
    key,
    x: start.x,
    y: start.y - half,
    width: run,
    height: half * 2,
    radius: 0,
    angle: (Math.atan2(end.y - start.y, end.x - start.x) * 180) / Math.PI,
    originX: start.x,
    originY: start.y,
    step,
  };
};

/**
 * One trail as the pieces that make its silhouette: a bead per letter and a
 * bar per step. The bars take the half-step between the beads they join, so a
 * trail settling cell by cell grows rather than blinking on in pieces.
 */
const piecesOf = (path: number[], key: string): Bead[] => [
  ...path.map((cell, step) => beadOf(cell, step, `${key}-b${step}`)),
  ...path
    .slice(1)
    .map((cell, step) =>
      barOf(path[step] as number, cell, step + 0.5, `${key}-j${step}`)
    ),
];

const ShtigjeBoard = ({
  week,
  found,
  bonusFound,
  hinted,
  onFound,
  onBonus,
  onMiss,
  hintsLeft,
  onHint,
  done,
}: ShtigjeBoardProps) => {
  const letters = useMemo(() => getLetters(week), [week]);

  const [path, setPath] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  /** Set for as long as a found word's trail is worth a moment of attention. */
  const [lit, setLit] = useState<string | null>(null);

  const dragging = useRef(false);
  const moved = useRef(false);
  const cells = useRef<HTMLDivElement | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const litTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  /*
   * The trail at the moment the pointer is released. `setPath` is queued, so a
   * release reading the state would read the cell before last.
   */
  const live = useRef<number[]>([]);

  const flash = (text: string) => {
    setMessage(text);
    clearTimeout(messageTimer.current);
    messageTimer.current = setTimeout(() => setMessage(''), MESSAGE_MS);
  };

  const trail = (next: number[]) => {
    live.current = next;
    setPath(next);
  };

  /* The cells every found word owns, so the board can draw what is settled. */
  const foundTrails = useMemo(
    () =>
      found
        .map((word) => getWordByName(week, word))
        .filter((entry): entry is NonNullable<typeof entry> => !!entry),
    [week, found]
  );

  const settled = useMemo(
    () => new Set(foundTrails.flatMap((entry) => entry.path)),
    [foundTrails]
  );

  const hintCells = useMemo(
    () =>
      new Set(
        hinted.flatMap((word) => getWordByName(week, word)?.path || [])
      ),
    [week, hinted]
  );

  const submit = () => {
    const current = live.current;
    trail([]);

    if (current.length === 0) {
      return;
    }

    const guess = spell(letters, current);

    if (current.length < MIN_TRACE) {
      flash(`Një fjalë ka së paku ${MIN_TRACE} shkronja.`);
      return;
    }

    switch (judge(week, guess, found, bonusFound)) {
      case 'theme':
        setLit(guess);
        clearTimeout(litTimer.current);
        litTimer.current = setTimeout(() => setLit(null), 1400);
        onFound(guess);
        return;
      case 'bonus':
        flash(`${guess.toUpperCase()} — fjalë shtesë.`);
        onBonus(guess);
        return;
      case 'known':
        flash(`${guess.toUpperCase()} — e keni gjetur.`);
        return;
      default:
        flash(`${guess.toUpperCase()} nuk është fjalë.`);
        onMiss(guess);
    }
  };

  /*
   * One press, whether it arrived from a finger, a mouse or the Enter key on a
   * focused cell. Pressing the last cell of a trail commits it, pressing a cell
   * already in the trail cuts it back to there, and pressing anywhere else
   * either extends the trail or starts a new one.
   */
  const press = (cell: number) => {
    if (done) {
      return;
    }

    const current = live.current;
    const last = current[current.length - 1];

    if (current.length === 1 && cell === last) {
      trail([]);
      return;
    }
    if (cell === last) {
      submit();
      return;
    }

    const at = current.indexOf(cell);
    if (at !== -1) {
      trail(current.slice(0, at + 1));
      return;
    }
    if (last !== undefined && areNeighbours(last, cell)) {
      trail([...current, cell]);
      return;
    }

    trail([cell]);
  };

  /**
   * A cell the pointer dragged onto: forward, or back the way it came.
   *
   * A pointer reports where it is and not every cell it crossed, so a quick
   * swipe arrives two or three cells along. Where those cells lie on one
   * straight line the trail is filled in behind it; where they do not, the
   * trail waits — there would be more than one way it could have gone, and
   * drawing the wrong one is worse than drawing nothing.
   */
  const drag = (cell: number) => {
    if (!dragging.current || done) {
      return;
    }

    const current = live.current;
    const last = current[current.length - 1];
    if (last === undefined || cell === last) {
      return;
    }

    moved.current = true;

    // Dragging back over the trail cuts it to there, however far back it went.
    const at = current.indexOf(cell);
    if (at !== -1) {
      trail(current.slice(0, at + 1));
      return;
    }

    if (areNeighbours(last, cell)) {
      trail([...current, cell]);
      return;
    }

    const between = lineBetween(last, cell);
    if (between && between.every((step) => !current.includes(step))) {
      trail([...current, ...between, cell]);
    }
  };

  /**
   * Which cell a pointer is *in the middle of*, or `null` for the ground
   * between them. Read off the grid's own box rather than off the element
   * under the pointer, because the question is how close to a centre it is
   * and not which cell it happens to be inside.
   */
  const cellAt = (clientX: number, clientY: number) => {
    const box = cells.current?.getBoundingClientRect();
    if (!box || box.width === 0 || box.height === 0) {
      return null;
    }

    const acrossX = ((clientX - box.left) / box.width) * COLS;
    const acrossY = ((clientY - box.top) / box.height) * ROWS;
    if (acrossX < 0 || acrossY < 0 || acrossX >= COLS || acrossY >= ROWS) {
      return null;
    }

    const col = Math.floor(acrossX);
    const row = Math.floor(acrossY);
    const off = Math.hypot(acrossX - (col + 0.5), acrossY - (row + 0.5));

    return off > HIT_RADIUS ? null : row * COLS + col;
  };

  /*
   * The drag is followed on the window and not on the cells: a pointer moves
   * through the ground between two centres without being over either, and a
   * finger that leaves the board and comes back should pick the trail up
   * again rather than end it.
   */
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (!dragging.current) {
        return;
      }
      const cell = cellAt(event.clientX, event.clientY);
      if (cell !== null) {
        drag(cell);
      }
    };

    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  });

  /*
   * A release anywhere ends the drag, not only a release over the board: a
   * finger lifted past the last row still means the trail that was drawn.
   */
  useEffect(() => {
    const onUp = () => {
      if (!dragging.current) {
        return;
      }
      dragging.current = false;
      if (moved.current) {
        submit();
      }
    };

    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  });

  useEffect(
    () => () => {
      clearTimeout(messageTimer.current);
      clearTimeout(litTimer.current);
    },
    []
  );

  // A new week, or a week read back out of storage, starts with a clean board.
  useEffect(() => {
    trail([]);
    setMessage('');
  }, [week]);

  /*
   * The word just traced settles one cell at a time along its own trail, the
   * way the scored row of a Fjalëz board settles left to right: it is read in
   * the order it was written. The cells carry their step, the stylesheet turns
   * it into a delay.
   */
  const litPath = lit ? getWordByName(week, lit)?.path : undefined;

  const measure = {
    '--cols': COLS,
    '--rows': ROWS,
  } as React.CSSProperties;

  const draw = (
    key: string,
    pieces: Bead[],
    className: string,
    settling?: boolean
  ) => (
    <g key={key} className={className} data-settling={settling ? 'true' : undefined}>
      {pieces.map((piece) => (
        <rect
          key={piece.key}
          x={piece.x}
          y={piece.y}
          width={piece.width}
          height={piece.height}
          rx={piece.radius}
          ry={piece.radius}
          transform={
            piece.angle === 0
              ? undefined
              : `rotate(${piece.angle} ${piece.originX} ${piece.originY})`
          }
          style={{ '--step': piece.step } as React.CSSProperties}
        />
      ))}
    </g>
  );

  return (
    <div className={styles.board}>
      <div className={styles.grid} style={measure}>
        {/* Under the letters: the trail is the ground a letter stands on. */}
        <svg
          className={styles.trails}
          viewBox={`0 0 ${COLS} ${ROWS}`}
          aria-hidden="true"
        >
          {/* A hint draws beads and no bars — the cells, never the order. */}
          {draw(
            'hint',
            [...hintCells].map((cell) => beadOf(cell, 0, `hint-${cell}`)),
            styles.hintTrail
          )}

          {foundTrails.map((entry) =>
            draw(
              entry.word,
              piecesOf(entry.path, entry.word),
              styles.foundTrail,
              lit === entry.word
            )
          )}

          {path.length !== 0 &&
            draw('live', piecesOf(path, 'live'), styles.liveTrail)}
        </svg>

        <div
          className={styles.cells}
          ref={cells}
          role="group"
          aria-label="Rrjeti i shkronjave"
        >
          {letters.map((letter, cell) => {
            const inTrail = path.includes(cell);
            const state = inTrail
              ? 'live'
              : settled.has(cell)
                ? 'found'
                : hintCells.has(cell)
                  ? 'hint'
                  : 'plain';
            const step = litPath ? litPath.indexOf(cell) : -1;

            return (
              <button
                key={cell}
                type="button"
                className={styles.cell}
                data-state={state}
                data-settling={step === -1 ? undefined : 'true'}
                style={
                  step === -1
                    ? undefined
                    : ({ '--step': step } as React.CSSProperties)
                }
                disabled={done}
                onPointerDown={(event) => {
                  /*
                   * A touch is captured by the element it started on, so
                   * without this every later move would be reported against
                   * that one cell and the drag would never leave it.
                   */
                  const target = event.currentTarget;
                  if (target.hasPointerCapture?.(event.pointerId)) {
                    target.releasePointerCapture(event.pointerId);
                  }
                  event.preventDefault();
                  dragging.current = true;
                  moved.current = false;
                  press(cell);
                }}
                /* Enter and Space on a focused cell arrive here and nowhere else. */
                onClick={(event) => {
                  if (event.detail === 0) {
                    press(cell);
                  }
                }}
                aria-label={`${letter.toUpperCase()}${
                  inTrail
                    ? ' — në shteg'
                    : settled.has(cell)
                      ? ' — e gjetur'
                      : hintCells.has(cell)
                        ? ' — ndihmë'
                        : ''
                }`}
                aria-pressed={inTrail}
              >
                {letter.toUpperCase()}
              </button>
            );
          })}
        </div>
      </div>

      <p className={styles.status} role="status" aria-live="polite">
        {message}
      </p>

      {/* An empty grid has nothing left to clear, check or be helped with, so
          the keys go rather than stand there greyed out. */}
      {!done && (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.action} sc`}
            onClick={() => trail([])}
            disabled={path.length === 0}
          >
            Pastro
          </button>
          <button
            type="button"
            className={`${styles.action} ${styles.check} sc`}
            onClick={submit}
            disabled={path.length === 0}
          >
            Kontrollo
          </button>
          <button
            type="button"
            className={`${styles.action} sc`}
            onClick={onHint}
            disabled={hintsLeft === 0}
          >
            Ndihmë{hintsLeft !== 0 ? ` ${hintsLeft}` : ''}
          </button>
        </div>
      )}
    </div>
  );
};

export default ShtigjeBoard;
