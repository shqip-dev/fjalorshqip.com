/*
 * Draws one social card per word page, plus the site's own card:
 *
 *   node ./src/scripts/ogCards.ts          # dist/og/<slug>.png
 *   node ./src/scripts/ogCards.ts --site   # public/og.png, the shared card
 *
 * `pnpm build` runs this as `postbuild`, after `astro build` has written
 * `dist`, because that is where the cards go. Going through `public/` instead
 * would make `astro build` copy several hundred megabytes a second time.
 *
 * It draws a card for every slug in `src/data/gen/slugDictionary.json` — the
 * same set `f/[slug].astro` prerenders, so every word page has its own card and
 * no card is drawn for a page that does not exist. In a development build that
 * dictionary is the env-gated subset, so this costs a handful of images; in the
 * production build it is ~40k of them, a few minutes of wall clock and ~400 MB.
 * `SHOULD_SKIP_WORD_CARDS=true` skips the word cards entirely, and skipping the
 * word pages (`SHOULD_SKIP_STATIC_WORD_PAGES`) skips them too.
 */
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { getSlugDictionary } from '../lib/dictionary.ts';
import { shouldSkipWordCards } from '../lib/env.ts';
import { createCardRenderer } from '../lib/ogCard.ts';
import { SITE_CARD_FILENAME, WORD_CARD_DIR } from '../lib/seo.ts';

const DIST_DIR = 'dist';
const SITE_CARD_PATH = `public/${SITE_CARD_FILENAME}`;

/*
 * libvips does its own threading, so the pool is about keeping every core fed
 * rather than about parallelism per image. Past the core count the wall clock
 * stops improving and the memory does not.
 */
const CONCURRENCY = Math.max(2, Math.min(8, os.availableParallelism()));

const PROGRESS_EVERY = 2000;

const main = async () => {
  const renderer = await createCardRenderer();

  if (process.argv.includes('--site')) {
    await fs.writeFile(SITE_CARD_PATH, await renderer.renderSiteCard());
    console.log(`Wrote ${SITE_CARD_PATH}`);
    return;
  }

  if (shouldSkipWordCards()) {
    console.log('Skipping the word cards; pages fall back to the site card');
    return;
  }

  // `postbuild` only ever runs after a build, but the script is also runnable
  // on its own, where an absent `dist` means the cards would go nowhere.
  const built = await fs
    .stat(DIST_DIR)
    .then((stats) => stats.isDirectory())
    .catch(() => false);
  if (!built) {
    throw new Error(
      `${DIST_DIR}/ does not exist — the cards are written into the build output, so run \`pnpm build\` (which runs this) rather than this script alone`
    );
  }

  const slugDictionary = await getSlugDictionary();
  const slugs = Object.keys(slugDictionary);
  const cardDir = path.join(DIST_DIR, WORD_CARD_DIR);
  await fs.mkdir(cardDir, { recursive: true });

  const started = Date.now();
  let drawn = 0;
  let bytes = 0;

  const queue = slugs.slice();
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let slug = queue.pop(); slug; slug = queue.pop()) {
        // The card names one word, so homographs share the first entry's
        // labels and first sense — the same thing the page leads with.
        const card = await renderer.renderWordCard(slugDictionary[slug][0]);
        await fs.writeFile(path.join(cardDir, `${slug}.png`), card);

        bytes += card.length;
        drawn++;
        if (drawn % PROGRESS_EVERY === 0) {
          console.log(`  ${drawn}/${slugs.length} cards…`);
        }
      }
    })
  );

  const seconds = (Date.now() - started) / 1000;
  console.log(
    `Wrote ${drawn} cards to ${cardDir} — ${(bytes / 1024 / 1024).toFixed(0)} MB in ${seconds.toFixed(
      1
    )}s (${CONCURRENCY} at a time)`
  );
};

main();
