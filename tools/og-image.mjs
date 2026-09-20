/*
 * Draws `public/og.png`, the one social card the whole site shares — the sheet
 * a link previews as in WhatsApp, Discord, Slack or a timeline.
 *
 * It is run by hand, not by the build: the site ships static files and has no
 * image pipeline, and a per-word card would be 40k renders of it. Run it again
 * when the palette in `src/styles/global.scss` moves or Alegreya is upgraded.
 *
 *   # sharp is not a dependency of this site — it is only needed here.
 *   pnpm add -D sharp
 *   # pango reads real font files; the packaged Alegreya is woff2.
 *   # (`woff2_decompress` ships with the `woff2` package on most systems.)
 *   mkdir -p /tmp/alegreya
 *   cp node_modules/@fontsource/alegreya-sc/files/alegreya-sc-latin-700-normal.woff2 \
 *      node_modules/@fontsource-variable/alegreya/files/alegreya-latin-wght-normal.woff2 \
 *      /tmp/alegreya/
 *   (cd /tmp/alegreya && woff2_decompress *.woff2)
 *   FONT_DIR=/tmp/alegreya node tools/og-image.mjs
 *   pnpm remove sharp
 */
import { writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const FONT_DIR = process.env.FONT_DIR || '/tmp/alegreya';
const SMALL_CAPS = `${FONT_DIR}/alegreya-sc-latin-700-normal.ttf`;
const ROMAN = `${FONT_DIR}/alegreya-latin-wght-normal.ttf`;
const OUTPUT = 'public/og.png';

// The page's own palette, from `src/styles/global.scss`.
const CLOTH = '#6b1d1f';
const STOCK = '#e9e4d7';
const INK = '#241d17';
const RULE = '#837a66';
const ON_CLOTH = '#f0eae0';

const WIDTH = 1200;
const HEIGHT = 630;
const BAND = 96;

// Pango measures letter spacing in 1024ths of a point and adds it after the
// last letter too, so a spaced line is centred half a step to the left.
const SPACING = { wordmark: 12000, note: 6000 };
const trail = (spacing) => Math.round(spacing / 1024 / 2);

const render = async (markup, font, fontfile) => {
  const buffer = await sharp({
    text: { text: markup, font, fontfile, rgba: true },
  })
    .png()
    .toBuffer();

  const { width, height } = await sharp(buffer).metadata();
  return { buffer, width, height };
};

const wordmark = await render(
  `<span foreground="${CLOTH}" letter_spacing="${SPACING.wordmark}">FJALOR SHQIP</span>`,
  'Alegreya SC 96',
  SMALL_CAPS
);
const tagline = await render(
  `<span foreground="${INK}">Fjalor i gjuhës shqipe</span>`,
  'Alegreya 44',
  ROMAN
);
const note = await render(
  `<span foreground="${ON_CLOTH}" letter_spacing="${SPACING.note}">FJALORSHQIP.COM</span>`,
  'Alegreya SC 28',
  SMALL_CAPS
);

// Rules and bands only — no text, so this stays a plain shape drawing.
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${STOCK}"/>
  <rect x="0" y="0" width="${WIDTH}" height="14" fill="${CLOTH}"/>
  <rect x="96" y="352" width="${WIDTH - 192}" height="1" fill="${RULE}"/>
  <rect x="0" y="${HEIGHT - BAND}" width="${WIDTH}" height="${BAND}" fill="${CLOTH}"/>
</svg>`;

const centre = (item, spacing = 0) =>
  Math.round((WIDTH - item.width) / 2) + trail(spacing);

const png = await sharp(Buffer.from(sheet))
  .composite([
    {
      input: wordmark.buffer,
      left: centre(wordmark, SPACING.wordmark),
      top: 232 - Math.round(wordmark.height / 2),
    },
    { input: tagline.buffer, left: centre(tagline), top: 400 },
    {
      input: note.buffer,
      left: centre(note, SPACING.note),
      top: HEIGHT - BAND + Math.round((BAND - note.height) / 2),
    },
  ])
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

await writeFile(OUTPUT, png);
console.log(`${OUTPUT}: ${WIDTH}×${HEIGHT}, ${(png.length / 1024).toFixed(1)} KB`);
