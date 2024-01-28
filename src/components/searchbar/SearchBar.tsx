import { useEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import classNames from 'classnames';
import { type Entry, type Index } from '../../lib/dictionary';
import { getStemPrefix, getStems } from '../../lib/process';
import debounce from 'lodash/debounce';
import zip from 'lodash/zip';
import intersectionBy from 'lodash/intersectionBy';
import leven from 'leven';

const MAX_SUGGESTIONS = 10;

const stems: { [prefix: string]: Index } = {};

const loadSubIndex = debounce(
  async (
    prefixes: string[],
    onSuccess: (subIndex: Index[]) => any,
    onError: () => any
  ) => {
    const subIndexes = await Promise.all(prefixes.map(getOrFetchSubIndex));

    if (subIndexes) {
      onSuccess(subIndexes);
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
    if (!query) {
      setSuggestions([]);
      return;
    }

    const stems = getStems(query);
    if (stems.every((stem) => !stem)) {
      setSuggestions([]);
      return;
    }

    const prefixes = stems.map(getStemPrefix);

    loadSubIndex(
      prefixes,
      (subIndexes) => {
        const values =
          zip(stems, subIndexes)
            .map(([stem, subIndex]) => {
              return subIndex ? subIndex[stem || ''] : [];
            })
            .reduce((acc, next) => {
              if (acc && !next) {
                return acc;
              }
              return intersectionBy(acc, next, (a) => a.term);
            }) || [];

        const sortedValues = values
          .map((value) => ({ dist: leven(value.term, query), value }))
          .sort((a, b) => a.dist - b.dist)
          .map((a) => a.value);

        setSuggestions(sortedValues.slice(0, MAX_SUGGESTIONS));
      },
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
