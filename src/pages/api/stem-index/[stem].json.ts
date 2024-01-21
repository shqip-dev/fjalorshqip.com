import type { APIContext } from 'astro';
import { getStemSubIndexes } from '../../../lib/dictionary.ts';

export async function getStaticPaths() {
  const indexes = await getStemSubIndexes();
  return indexes.map((index) => ({
    params: { stem: index.prefix },
    props: index.index,
  }));
}

export function GET({ props }: APIContext) {
  return new Response(JSON.stringify(props));
}
