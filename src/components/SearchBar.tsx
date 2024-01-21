import { useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.scss';
import { MIN_STEM_LENGTH, type Index, type Entry } from '../lib/dictionary';
import pcs from '../lib/process';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef?.current?.focus();
  };

  const handleQueryChange = async (query: string) => {
    const stem = pcs.stems(query)[0] || '';
    if (stem.length >= MIN_STEM_LENGTH) {
      const prefix = stem.substring(0, MIN_STEM_LENGTH);
      const response = await fetch(`/api/stem-index/${prefix}.json`);
      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      const index = (await response.json()) as Index;
      if (index[stem]) {
        setSuggestions(index[stem]);
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  };

  useEffect(() => {
    handleQueryChange(query).catch((e) => {
      // TODO: Handle errors
      console.log('error handling query change', e);
    });
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
