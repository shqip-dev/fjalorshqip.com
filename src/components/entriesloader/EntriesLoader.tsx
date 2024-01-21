import { useEffect, useState } from 'react';
import { MIN_STEM_LENGTH, type Entry, type Index } from '../../lib/dictionary';
import NotFound from '../notfound/NotFound';
import Entries from '../entries/Entries';

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
    if (props.slug.length >= MIN_STEM_LENGTH) {
      const prefix = props.slug.substring(0, MIN_STEM_LENGTH);
      console.debug('get info for ', prefix);
      let response;
      try {
        response = await fetch(`/api/slug-index/${prefix}.json`).catch(
          (e) => {}
        );
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
