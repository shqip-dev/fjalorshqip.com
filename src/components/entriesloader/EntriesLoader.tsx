import { useEffect, useState } from 'react';
import type { Entry, Index } from '../../lib/dictionary';
import NotFound from '../notfound/NotFound';
import Entries from '../entries/Entries';
import { applyMissingMeta, applyWordMeta } from '../../lib/documentMeta';
import { getStemPrefix } from '../../lib/process';
import { getTermFromSlug, type Neighbour } from '../../lib/entryFormat';
import styles from './EntriesLoader.module.scss';

interface EntriesLoaderProps {
  slug: string;
}

interface Neighbours {
  prev: Neighbour | null;
  next: Neighbour | null;
}

const NO_NEIGHBOURS: Neighbours = { prev: null, next: null };

/*
 * A word page rendered in the browser — one the build did not prerender — has
 * no guide words handed to it, so they come from the sub-index it fetched
 * anyway. It holds every slug sharing the first three characters, which is the
 * same span the printed dictionary would have had on one page.
 */
const getNeighbours = (index: Index, slug: string): Neighbours => {
  const collator = new Intl.Collator('sq');
  const ordered = Object.keys(index)
    .map((key) => ({ slug: key, term: index[key]?.[0]?.term || key }))
    .sort((a, b) => collator.compare(a.term, b.term));

  const position = ordered.findIndex((entry) => entry.slug === slug);
  if (position === -1) {
    return NO_NEIGHBOURS;
  }

  return {
    prev: ordered[position - 1] || null,
    next: ordered[position + 1] || null,
  };
};

const EntriesLoader = (props: EntriesLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [neighbours, setNeighbours] = useState<Neighbours>(NO_NEIGHBOURS);

  /*
   * The head this page arrived with is the home page's — it is the 404
   * catch-all rendering a word — so whatever the fetch settled on is said
   * there too, not just drawn on the page.
   */
  const setReponse = (entries: Entry[], neighbours = NO_NEIGHBOURS) => {
    if (entries.length !== 0) {
      applyWordMeta(entries);
    } else {
      applyMissingMeta(getTermFromSlug(props.slug));
    }

    setEntries(entries);
    setNeighbours(neighbours);
    setLoading(false);
  };

  const handleInitialLoad = async () => {
    const prefix = getStemPrefix(props.slug);
    let response;
    try {
      response = await fetch(`/api/slug-index/${prefix}.json`);
    } catch (e) {
      setReponse([]);
      return;
    }
    if (!response?.ok) {
      setReponse([]);
      return;
    }

    const index = (await response.json()) as Index;
    if (index[props.slug]) {
      setReponse(index[props.slug], getNeighbours(index, props.slug));
    } else {
      setReponse([]);
    }
  };

  useEffect(() => {
    handleInitialLoad();
  }, []);

  if (loading) {
    return (
      <p className={styles.loading} role="status">
        Po hapet {getTermFromSlug(props.slug)}…
      </p>
    );
  }

  return entries.length !== 0 ? (
    <Entries entries={entries} prev={neighbours.prev} next={neighbours.next} />
  ) : (
    <NotFound word={getTermFromSlug(props.slug)} />
  );
};

export default EntriesLoader;
