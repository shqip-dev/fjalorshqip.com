/*
 * The board Shtigje is played on, and the shape of a week.
 *
 * Kept apart from `shtigje.ts` because the generator needs the grid before the
 * weeks exist: `src/scripts/shtigjeWords.ts` imports this to build
 * `src/data/shtigje/weeks.json`, and `shtigje.ts` imports both. Nothing here
 * reads a file or touches node — it is bundled into the island like the rest of
 * `src/lib`.
 *
 * Six columns by eight rows, which is forty-eight cells and a portrait board
 * that fits a phone held in one hand. Every cell belongs to exactly one of the
 * week's words; there is no filler, which is the whole point of the game and
 * the reason the generator has work to do.
 */

export const COLS = 6;
export const ROWS = 8;
export const CELLS = COLS * ROWS;

/*
 * A trail steps to any of the eight cells around it, diagonals included, and
 * never onto a cell it has already used. Two trails may cross corners — a cell
 * has one owner, a corner has none.
 */
export const NEIGHBOURS: number[][] = Array.from({ length: CELLS }, (_, cell) => {
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  const around: number[] = [];

  for (let dRow = -1; dRow <= 1; dRow++) {
    for (let dCol = -1; dCol <= 1; dCol++) {
      if (dRow === 0 && dCol === 0) {
        continue;
      }
      const nextRow = row + dRow;
      const nextCol = col + dCol;
      if (nextRow >= 0 && nextRow < ROWS && nextCol >= 0 && nextCol < COLS) {
        around.push(nextRow * COLS + nextCol);
      }
    }
  }

  return around;
});

export const areNeighbours = (from: number, to: number) =>
  (NEIGHBOURS[from] as number[]).includes(to);

/*
 * The cells a trail would pass through going from one cell straight to
 * another, not counting either end — `[]` for two cells already touching, and
 * `null` when there is no straight king-move line between them.
 *
 * This is for the pointer, not for the generator. A finger swiped quickly
 * across the board reports a handful of positions and not a position per
 * cell, so the cells in between are never entered and the trail would simply
 * stop growing. Where the jump is along a row, a column or a true diagonal
 * there is exactly one line it could have taken, and this is it; where it is
 * not, there is more than one and the trail is left alone rather than guessed
 * at.
 */
export const lineBetween = (from: number, to: number): number[] | null => {
  const dRow = Math.floor(to / COLS) - Math.floor(from / COLS);
  const dCol = (to % COLS) - (from % COLS);
  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));

  if (steps === 0 || (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol))) {
    return null;
  }

  const stepRow = Math.sign(dRow);
  const stepCol = Math.sign(dCol);

  return Array.from(
    { length: steps - 1 },
    (_, index) =>
      (Math.floor(from / COLS) + stepRow * (index + 1)) * COLS +
      ((from % COLS) + stepCol * (index + 1))
  );
};

/** Four cells is the shortest trail worth tracing, nine the longest that packs. */
export const MIN_WORD = 4;
export const MAX_WORD = 9;

/** A week is six to nine words; fewer is a list, more is a crowd. */
export const MIN_WORDS = 6;
export const MAX_WORDS = 9;

export interface WeekWord {
  word: string;
  /** The word's own page, so every answer is one click from its meaning. */
  slug: string;
  /** The cells it runs through, in order — row-major indices into the grid. */
  path: number[];
}

export interface Week {
  /** What the words have in common, said in the reader's own language. */
  theme: string;
  /** `ROWS` strings of `COLS` characters each, lowercase. */
  rows: string[];
  words: WeekWord[];
  /*
   * Every other word of the dictionary the grid happens to spell. Found ones
   * buy hints; they are not part of the cover and finding them all is not
   * asked for. Computed at build time, because enumerating them in the browser
   * would mean shipping the dictionary to do it.
   */
  bonus: string[];
}
