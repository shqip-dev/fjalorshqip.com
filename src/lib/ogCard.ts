/*
 * The social cards, drawn the way the page is: academy stock, a cloth band top
 * and bottom, the headword in small caps, a hairline rule, the gist under it.
 * One card per word plus the site's own, from one drawing routine, so a link to
 * a word unfurls as that word rather than as the site in general.
 *
 * Node-only — it loads `sharp` and reads font files. Nothing in `src/components`
 * may import it; the browser gets `src/lib/seo.ts`, which only names the paths.
 *
 * Text is drawn by pango through sharp, which reads TrueType and not the woff2
 * the pages load, hence `src/assets/fonts` (see the README there).
 */
import { fileURLToPath } from 'node:url';
import sharp, { type Sharp } from 'sharp';
import type { Entry } from './dictionary.ts';
import { getGist } from './entryFormat.ts';
import { SITE_HOST, SITE_TAGLINE, SITE_NAME, type GameKey } from './seo.ts';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

// `src/styles/global.scss`, so a card and a page are the same sheet.
const CLOTH = '#6b1d1f';
const STOCK = '#e9e4d7';
const INK = '#241d17';
const INK_MUTED = '#5c5145';
const RULE = '#837a66';
const ON_CLOTH = '#f0eae0';

// The board's own greys: a cell the guess ruled out, and the cloth at 22% over
// the stock — `--stock-sunk` and `--cloth-wash` in `global.scss`, resolved here
// because pango takes a hex and not a `color-mix`.
const STOCK_SUNK = '#e0dbcc';
const CLOTH_WASH = '#cdb8af';
// The hairline between two cells is 1px on a page and 2px here: the card is
// drawn at roughly twice the board's size, and a 1px rule at that scale reads
// as a seam rather than as the ruled ground it is.
const CELL_RULE = 2;
const CELL = 96;
const CELL_TEXT = 54;

const HEAD_RULE = 14;
const FOOT_BAND = 96;
const MARGIN = 110;
const COLUMN = CARD_WIDTH - MARGIN * 2;

const FONT_SC = fileURLToPath(
  new URL('../assets/fonts/alegreya-sc-700.ttf', import.meta.url)
);
const FONT_ROMAN = fileURLToPath(
  new URL('../assets/fonts/alegreya-variable.ttf', import.meta.url)
);

/*
 * Pango measures letter spacing in 1024ths of a point and adds it after the
 * last letter as well, so a spaced line's raster is that much wider than the
 * glyphs: centring it needs half of that back.
 */
const spacingOffset = (spacing: number) => Math.round(spacing / 1024 / 2);

const escape = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

interface Drawn {
  buffer: Buffer;
  width: number;
  height: number;
  offset: number;
}

interface TextOptions {
  size: number;
  font: string;
  colour: string;
  spacing?: number;
  /** Set to wrap on words instead of drawing one long line. */
  width?: number;
}

const draw = async (text: string, options: TextOptions): Promise<Drawn> => {
  const spacing = options.spacing ?? 0;
  const markup = `<span foreground="${options.colour}"${
    spacing ? ` letter_spacing="${spacing}"` : ''
  }>${escape(text)}</span>`;

  const buffer = await sharp({
    text: {
      text: markup,
      font: `${options.font === FONT_SC ? 'Alegreya SC' : 'Alegreya'} ${options.size}`,
      fontfile: options.font,
      rgba: true,
      ...(options.width
        ? { width: options.width, wrap: 'word' as const, align: 'centre' as const }
        : {}),
    },
  })
    .png()
    .toBuffer();

  const { width = 0, height = 0 } = await sharp(buffer).metadata();
  return { buffer, width, height, offset: spacingOffset(spacing) };
};

/*
 * The headword is set as large as its column allows and steps down only when it
 * has to: `ACAR` gets the full display size, `DARËPRERËSE` a smaller one, and a
 * term long enough to exhaust the list is drawn at the last size and left to
 * run — every step down is one extra raster, so the list is short on purpose.
 */
const HEADWORD_SIZES = [96, 80, 66, 54, 44, 36];

const drawHeadword = async (term: string) => {
  for (const size of HEADWORD_SIZES) {
    const spacing = size > 60 ? 10000 : 6000;
    const drawn = await draw(term, {
      size,
      font: FONT_SC,
      colour: CLOTH,
      spacing,
    });

    if (drawn.width - drawn.offset * 2 <= COLUMN || size === HEADWORD_SIZES.at(-1)) {
      return drawn;
    }
  }

  throw new Error(`Could not draw the headword ${term}`);
};

/*
 * One row of the games' board, drawn the way both boards are drawn: a single
 * rule-coloured ground under a hairline grid, cells laid on top of it, no cell
 * carrying a border of its own.
 */
type CellState = 'plain' | 'placed' | 'elsewhere' | 'absent';

const CELL_FILL: Record<CellState, string> = {
  plain: STOCK,
  placed: CLOTH,
  elsewhere: CLOTH_WASH,
  absent: STOCK_SUNK,
};

const CELL_INK: Record<CellState, string> = {
  plain: INK,
  placed: ON_CLOTH,
  elsewhere: INK,
  absent: INK_MUTED,
};

/*
 * A letter for one cell. Pango hands back the glyph's ink box and nothing else
 * — `Ë` is 47px tall where `L` is 37 — so centring those boxes in their cells
 * would set the row on five different baselines. The letter is therefore drawn
 * between two invisible anchors, `ËJ` being the tallest and the deepest thing
 * a row holds: they pin every raster to the same extents, and the ink is then
 * cropped back to its own columns, so a letter is centred on its ink across the
 * cell and on the shared baseline down it.
 */
const CELL_ANCHOR = '<span alpha="1">ËJ</span>';

const drawCellLetter = async (
  letter: string,
  colour: string
): Promise<Drawn> => {
  const framed = await sharp({
    text: {
      text: `${CELL_ANCHOR}<span foreground="${colour}">${escape(letter)}</span>${CELL_ANCHOR}`,
      font: `Alegreya SC ${CELL_TEXT}`,
      fontfile: FONT_SC,
      rgba: true,
    },
  })
    .png()
    .toBuffer();

  // The anchors draw nothing, so every pixel with ink here is the letter's.
  const { data, info } = await sharp(framed)
    .raw()
    .toBuffer({ resolveWithObject: true });

  let left = info.width;
  let right = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[(y * info.width + x) * info.channels + 3] !== 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
      }
    }
  }

  const width = right - left + 1;
  const buffer = await sharp(framed)
    .extract({ left, top: 0, width, height: info.height })
    .png()
    .toBuffer();

  return { buffer, width, height: info.height, offset: 0 };
};

const drawRow = async (row: [string, CellState][]): Promise<Drawn> => {
  const step = CELL + CELL_RULE;
  const width = row.length * step + CELL_RULE;
  const height = CELL + CELL_RULE * 2;

  const cells = row
    .map(
      ([, state], index) =>
        `<rect x="${CELL_RULE + index * step}" y="${CELL_RULE}" width="${CELL}" height="${CELL}" fill="${CELL_FILL[state]}"/>`
    )
    .join('');

  const ground = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="${RULE}"/>${cells}</svg>`
  );

  const letters = await Promise.all(
    row.map(([letter, state]) => drawCellLetter(letter, CELL_INK[state]))
  );

  const buffer = await sharp(ground)
    .composite(
      letters.map((letter, index) => ({
        input: letter.buffer,
        left: CELL_RULE + index * step + Math.round((CELL - letter.width) / 2),
        top: CELL_RULE + Math.round((CELL - letter.height) / 2),
      }))
    )
    .png()
    .toBuffer();

  return { buffer, width, height, offset: 0 };
};

/*
 * What each game's card says. The row is the game itself rather than an
 * ornament: Fjalëz shows a guessed row as the board would colour it — in place,
 * elsewhere, absent — and Lëmsh a tray still shuffled, which the name under the
 * rule then solves.
 */
interface GameCardSpec {
  name: string;
  tagline: string;
  row: [string, CellState][];
}

const GAME_CARDS: Record<GameKey, GameCardSpec> = {
  fjalez: {
    name: 'Fjalëz',
    tagline: 'Një fjalë e re çdo ditë, gjashtë mundësi',
    row: [
      ['F', 'placed'],
      ['J', 'absent'],
      ['A', 'elsewhere'],
      ['L', 'placed'],
      ['Ë', 'absent'],
    ],
  },
  lemsh: {
    name: 'Lëmsh',
    tagline: 'Rendit shkronjat e përziera, nxirr fjalët e ditës',
    row: [
      ['M', 'plain'],
      ['H', 'plain'],
      ['Ë', 'plain'],
      ['L', 'plain'],
      ['S', 'plain'],
    ],
  },
};

const centre = (drawn: Drawn) =>
  Math.round((CARD_WIDTH - drawn.width) / 2) + drawn.offset;

const ruleSvg = (width: number) =>
  Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="1"><rect width="${width}" height="1" fill="${RULE}"/></svg>`
  );

const sheetSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="${STOCK}"/>
  <rect x="0" y="0" width="${CARD_WIDTH}" height="${HEAD_RULE}" fill="${CLOTH}"/>
  <rect x="0" y="${CARD_HEIGHT - FOOT_BAND}" width="${CARD_WIDTH}" height="${FOOT_BAND}" fill="${CLOTH}"/>
</svg>`;

/*
 * 16 colours is enough for flat art — stock, cloth, ink and the ramps the text
 * antialiases through — and costs a third of what the full palette does across
 * 40k cards. Anything photographic would band; nothing here is.
 */
const encode = (image: Sharp) =>
  image
    .png({ compressionLevel: 9, palette: true, colours: 16, dither: 0 })
    .toBuffer();

/*
 * The sheet and the footer are identical on every card, so they are rasterized
 * once and composited 40k times. This is most of why a card costs ~11 ms.
 */
export const createCardRenderer = async () => {
  const sheet = await sharp(Buffer.from(sheetSvg)).png().toBuffer();
  const footer = await draw(SITE_HOST.toUpperCase(), {
    size: 28,
    font: FONT_SC,
    colour: ON_CLOTH,
    spacing: 6000,
  });
  const footerLayer = {
    input: footer.buffer,
    left: centre(footer),
    top:
      CARD_HEIGHT -
      FOOT_BAND +
      Math.round((FOOT_BAND - footer.height) / 2),
  };

  /* Stacks the block and centres it between the two bands. */
  const compose = async (parts: (Drawn | 'rule')[], gaps: number[]) => {
    const height = parts.reduce<number>(
      (total, part, index) =>
        total + (part === 'rule' ? 1 : part.height) + (gaps[index] || 0),
      0
    );

    let top = Math.round(
      HEAD_RULE + (CARD_HEIGHT - FOOT_BAND - HEAD_RULE - height) / 2
    );

    const layers = parts.map((part, index) => {
      const layer =
        part === 'rule'
          ? { input: ruleSvg(COLUMN), left: MARGIN, top }
          : { input: part.buffer, left: centre(part), top };

      top += (part === 'rule' ? 1 : part.height) + (gaps[index] || 0);
      return layer;
    });

    return await encode(sharp(sheet).composite([...layers, footerLayer]));
  };

  return {
    /** The card for one word page: the headword, its labels and its first sense. */
    renderWordCard: async (entry: Entry) => {
      const attributes = entry.attributes.join(' ');
      const gist = getGist(entry.definitions, 150);

      const parts: (Drawn | 'rule')[] = [await drawHeadword(entry.term)];
      const gaps = [18];

      if (attributes) {
        parts.push(
          await draw(attributes, { size: 30, font: FONT_ROMAN, colour: INK_MUTED })
        );
        gaps.push(22);
      }

      parts.push('rule');
      gaps.push(30);

      if (gist) {
        parts.push(
          await draw(gist, {
            size: 36,
            font: FONT_ROMAN,
            colour: INK,
            width: COLUMN,
          })
        );
        gaps.push(0);
      }

      return await compose(parts, gaps);
    },

    /** A game's card: one row of its board over the name and the tagline. */
    renderGameCard: async (game: GameKey) => {
      const spec = GAME_CARDS[game];

      const row = await drawRow(spec.row);
      const name = await draw(spec.name.toUpperCase(), {
        size: 84,
        font: FONT_SC,
        colour: CLOTH,
        spacing: 10000,
      });
      const tagline = await draw(spec.tagline, {
        size: 36,
        font: FONT_ROMAN,
        colour: INK,
        width: COLUMN,
      });

      return await compose([row, name, 'rule', tagline], [46, 24, 30, 0]);
    },

    /** The card every other page shares — `public/og.png`. */
    renderSiteCard: async () => {
      const wordmark = await draw(SITE_NAME.toUpperCase(), {
        size: 96,
        font: FONT_SC,
        colour: CLOTH,
        spacing: 12000,
      });
      const tagline = await draw(SITE_TAGLINE, {
        size: 44,
        font: FONT_ROMAN,
        colour: INK,
      });

      return await compose([wordmark, 'rule', tagline], [40, 40, 0]);
    },
  };
};
