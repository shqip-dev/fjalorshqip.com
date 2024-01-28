import { useEffect, useState } from 'react';
import { type Entry, type Index } from '../../lib/dictionary';
import NotFound from '../notfound/NotFound';
import Entries from '../entries/Entries';
import { getStemPrefix } from '../../lib/process';

interface EntriesLoaderProps {
  slug: string;
}
const EntriesLoader = (props: EntriesLoaderProps) => {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);

  const setReponse = (entries: Entry[]) => {
    setEntries(entries);
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
      setReponse(index[props.slug]);
    } else {
      setReponse([]);
    }
  };
  useEffect(() => {
    handleInitialLoad();
  }, []);

  return loading ? (
    <div>Loading...</div>
  ) : entries.length !== 0 ? (
    <Entries entries={entries} />
  ) : (
    <NotFound />
  );
};

export default EntriesLoader;
