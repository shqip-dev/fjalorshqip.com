import type { APIContext } from 'astro';
import { getIndexes } from '../../../lib/dictionary.ts';

export async function getStaticPaths() {
  const indexes = await getIndexes();
  return indexes.map((index) => ({
    params: { stem: index.prefix },
    props: index.index,
  }));
}

export function GET({ props }: APIContext) {
  return new Response(JSON.stringify(props));
}
