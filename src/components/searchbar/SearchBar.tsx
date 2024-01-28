import { useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { type Entry, type Index } from '../../lib/dictionary';
import { getStemPrefix, getStems } from '../../lib/process';
import debounce from 'lodash/debounce';

const stems: { [prefix: string]: Index } = {};

const loadSubIndex = debounce(
  async (
    prefix: string,
    onSuccess: (subIndex: Index) => any,
    onError: () => any
  ) => {
    const subIndex = await getOrFetchSubIndex(prefix);

    if (subIndex) {
      onSuccess(subIndex);
    } else {
      onError();
    }
  },
  200
);

const getOrFetchSubIndex = async (prefix: string) => {
  if (!stems[prefix]) {
    const fetched = await fetchSubIndex(prefix);
    if (fetched) {
      stems[prefix] = fetched;
    }
  }

  return stems[prefix];
};

const fetchSubIndex = async (prefix: string) => {
  try {
    console.log('fetch l', prefix);
    const response = await fetch(`/api/stem-index/${prefix}.json`);
    if (!response.ok) {
      return response.status === 404 ? {} : null;
    }

    return (await response.json()) as Index;
  } catch (e) {
    return null;
  }
};

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef?.current?.focus();
  };

  const handleQueryChange = async (query: string) => {
    const stem = getStems(query)[0] || '';
    const prefix = getStemPrefix(stem);

    loadSubIndex(
      prefix,
      (subIndex) => setSuggestions(subIndex[stem] || []),
      () => setSuggestions([])
    );
  };

  useEffect(() => {
    handleQueryChange(query);
  }, [query]);

  return (
    <div className={styles.searchContainer}>
      <div
        className={classNames(styles.searchbar, {
          [styles.hasSuggestions]: suggestions.length !== 0,
        })}
        onClick={focusInput}
      >
        <input
          type="text"
          size={1}
          placeholder="Kërko"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className={styles.clearButton} onClick={() => setQuery('')}>
          X
        </span>
      </div>
      <div className={styles.suggestions}>
        <AnimatePresence>
          {suggestions.map((suggestion, idx) => (
            <motion.a
              key={suggestion.slug + idx}
              href={`/f/${suggestion.slug}`}
              className={styles.suggestion}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 20 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: 'ease-in' }}
            >
              {suggestion.term} {suggestion.attributes}
            </motion.a>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SearchBar;
