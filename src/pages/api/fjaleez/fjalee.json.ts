import { getFjalezGuesses } from '../../../lib/fjalezWords.ts';

/*
 * Every five-letter word the dictionary holds, as one static file. The game
 * fetches it once to know whether a guess is a word at all — the same shape as
 * the search indexes: generated at build time, served as plain JSON, no server.
 */
export async function GET() {
  return new Response(JSON.stringify(await getFjalezGuesses()), {
    headers: { 'content-type': 'application/json' },
  });
}
