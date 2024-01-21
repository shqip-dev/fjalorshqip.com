import type { APIContext } from 'astro';
import { getSlugSubIndexes } from '../../../lib/dictionary.js';

export async function getStaticPaths() {
  const indexes = await getSlugSubIndexes();
  return indexes.map((index) => ({
    params: { slug: index.prefix },
    props: index.index,
  }));
}

export function GET({ props }: APIContext) {
  return new Response(JSON.stringify(props));
}
