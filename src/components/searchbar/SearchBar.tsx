import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import styles from './SearchBar.module.scss';
import type { Entry, Index } from '../../lib/dictionary';
import { getStemPrefix, getStems } from '../../lib/process';
import { debounce, intersectBy } from '../../lib/utils';
import { getGist } from '../../lib/entryFormat';
import leven from 'leven';
import { SEARCH_QUERY_PARAM } from '../../lib/search';
import { track } from '../../lib/analytics';

const MAX_SUGGESTIONS = 10;
const MAX_CANDIDATES = 800;
const PREFIX_LENGTH = 3;

type Status = 'idle' | 'pending' | 'ok' | 'none' | 'error';

const stems: { [prefix: string]: Index } = {};

const loadSubIndex = debounce(
  async (
    prefixes: string[],
    onSuccess: (subIndex: Index[]) => any,
    onError: () => any
  ) => {
    const subIndexes = await Promise.all(prefixes.map(getOrFetchSubIndex));

    if (subIndexes.every(Boolean)) {
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

const push_query = (query: string) => {
  track('search_v2', { q: query });
};

/*
 * The fetched sub-index already holds every stem sharing the query's first
 * three characters, so matching the whole bucket by prefix costs no extra
 * request and no change to the generated indexes — it is the difference
 * between having to know the word and being able to look it up.
 */
const matchStem = (subIndex: Index, stem: string) => {
  const exact = subIndex[stem];
  const matched: Entry[] = exact ? [...exact] : [];

  for (const key of Object.keys(subIndex)) {
    if (key !== stem && key.startsWith(stem)) {
      matched.push(...subIndex[key]);
      if (matched.length >= MAX_CANDIDATES) {
        break;
      }
    }
  }

  return matched;
};

const collator = new Intl.Collator('sq');

/*
 * What you typed comes first; everything else is in alphabetical order, because
 * this is a dictionary and the alphabet is the order its readers expect. Edit
 * distance only breaks ties between entries sharing a headword.
 */
const rank = (entries: Entry[], queryStems: string[]) => {
  const typed = queryStems.join(' ');

  return entries
    .map((entry) => ({
      entry,
      exact: entry.stems.join(' ') === typed ? 0 : 1,
      distance: leven(entry.stems.join(' '), typed),
    }))
    .sort(
      (a, b) =>
        a.exact - b.exact ||
        collator.compare(a.entry.term, b.entry.term) ||
        a.distance - b.distance
    )
    .map((scored) => scored.entry);
};

/*
 * The guide words of the printed page, and the one place where they are also
 * literally true of the machinery: this is the alphabetical span of the
 * sub-index the browser just fetched.
 */
const spans: { [prefix: string]: [string, string] | null } = {};

const getSpan = (prefix: string) => {
  if (!(prefix in spans)) {
    const subIndex = stems[prefix];
    if (!subIndex) {
      return null;
    }

    const terms = new Set<string>();
    for (const key of Object.keys(subIndex)) {
      for (const entry of subIndex[key]) {
        terms.add(entry.term);
      }
    }

    const sorted = [...terms].sort(collator.compare);
    spans[prefix] =
      sorted.length !== 0 ? [sorted[0], sorted[sorted.length - 1]] : null;
  }

  return spans[prefix];
};

/*
 * A row's identity is the entry it shows, never its position in the list, so a
 * word that survives the next keystroke keeps its DOM node instead of being
 * torn down and rebuilt.
 */
const getRowKey = (entry: Entry) =>
  `${entry.slug}|${entry.attributes.join('-')}|${entry.term}`;

// React runs layout effects before paint; on the server there is no layout.
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const MOTION = { duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' };
const EXIT_MS = 200;

interface Row {
  entry: Entry;
  leaving: boolean;
}

const ClearIcon = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="square"
    />
  </svg>
);

interface SearchBarProps {
  autoFocus?: boolean;
  /** On a word page the field is the way out, not the subject: it steps back
      so the entry leads the viewport. */
  compact?: boolean;
}

const SearchBar = ({ autoFocus = false, compact = false }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Entry[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [active, setActive] = useState(-1);
  const [span, setSpan] = useState<[string, string] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const latestQuery = useRef('');
  const [rendered, setRendered] = useState<Row[]>([]);
  const rows = useRef(new Map<string, HTMLLIElement>());
  const previousRects = useRef(new Map<string, DOMRect>());
  const exitTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  /*
   * A row that stops matching has to be given the chance to leave. It stays in
   * the list at the position it already held, collapsing while the rows around
   * it close the gap, so narrowing a search reads as the list settling rather
   * than as one list being swapped for another.
   */
  useEffect(() => {
    setRendered((current) => {
      const matching = new Set(suggestions.map(getRowKey));
      const merged: Row[] = suggestions.map((entry) => ({
        entry,
        leaving: false,
      }));

      current.forEach((row, index) => {
        if (row.leaving || matching.has(getRowKey(row.entry))) {
          return;
        }
        merged.splice(Math.min(index, merged.length), 0, {
          entry: row.entry,
          leaving: true,
        });
      });

      return merged;
    });

    clearTimeout(exitTimer.current);
    exitTimer.current = setTimeout(
      () => setRendered((current) => current.filter((row) => !row.leaving)),
      EXIT_MS
    );

    return () => clearTimeout(exitTimer.current);
  }, [suggestions]);

  /*
   * Narrowing a search rearranges a list far more often than it replaces one.
   * Rows that survive animate from where they were to where they now are, new
   * rows fade in, and leaving rows collapse. Measuring before paint is what
   * keeps the move from flashing.
   */
  useIsomorphicLayoutEffect(() => {
    const settled = !window.matchMedia('(prefers-reduced-motion: reduce)')
      .matches;
    const current = new Map<string, DOMRect>();

    rows.current.forEach((element, key) => {
      const rect = element.getBoundingClientRect();
      const leaving = element.dataset.leaving === 'true';

      if (!leaving) {
        current.set(key, rect);
      }
      if (!settled || rect.height === 0) {
        return;
      }

      if (leaving) {
        element.animate(
          [
            { height: `${rect.height}px`, opacity: 1 },
            { height: '0px', opacity: 0 },
          ],
          { ...MOTION, duration: EXIT_MS, fill: 'forwards' }
        );
        return;
      }

      const previous = previousRects.current.get(key);
      if (!previous) {
        element.animate(
          [
            { opacity: 0, transform: 'translateY(5px)' },
            { opacity: 1, transform: 'none' },
          ],
          MOTION
        );
        return;
      }

      const shift = previous.top - rect.top;
      if (Math.abs(shift) > 1) {
        element.animate(
          [{ transform: `translateY(${shift}px)` }, { transform: 'none' }],
          MOTION
        );
      }
    });

    previousRects.current = current;
  }, [rendered]);

  const handleQueryChange = async (query: string) => {
    latestQuery.current = query;

    if (!query) {
      setSuggestions([]);
      setStatus('idle');
      return;
    }

    const stems = getStems(query);
    if (stems.every((stem) => !stem)) {
      setSuggestions([]);
      setStatus('idle');
      return;
    }

    setStatus('pending');
    const prefixes = stems.map(getStemPrefix);

    loadSubIndex(
      prefixes,
      (subIndexes) => {
        if (latestQuery.current !== query) {
          return;
        }

        const values =
          stems
            .map((stem, idx) => {
              const subIndex = subIndexes[idx];
              // An absent sub-index stays `undefined` on purpose: the reduce
              // below skips it, whereas an empty list would wipe out the
              // intersection.
              return subIndex ? matchStem(subIndex, stem) : undefined;
            })
            .reduce((acc, next) => {
              if (acc && !next) {
                return acc;
              }
              return intersectBy(acc || [], next || [], (a) => a.term);
            }) || [];

        const topSuggestions = rank(values, stems).slice(0, MAX_SUGGESTIONS);

        setSuggestions(topSuggestions);
        setSpan(getSpan(prefixes[0]));
        setStatus(topSuggestions.length !== 0 ? 'ok' : 'none');
        setActive(-1);
        push_query(query);
      },
      () => {
        if (latestQuery.current !== query) {
          return;
        }
        setSuggestions([]);
        setStatus('error');
      }
    );
  };

  useEffect(() => {
    const initialQuery = new URLSearchParams(window.location.search).get(
      SEARCH_QUERY_PARAM
    );
    if (initialQuery) {
      setQuery(initialQuery);
    }

    // A pointer-fine device gets the caret placed for it; on a phone that
    // would only throw the keyboard over the page before it has been read.
    if (autoFocus && window.matchMedia('(pointer: fine)').matches) {
      inputRef.current?.focus();
    }
  }, []);

  useEffect(() => {
    handleQueryChange(query);
  }, [query]);

  // Searching and the day's word are two states of one column, and the islands
  // that render them are siblings; the document carries the flag between them.
  useEffect(() => {
    document.documentElement.dataset.searching = query !== '' ? 'true' : 'false';
  }, [query]);

  // `/` puts the caret in the field from anywhere on the page, the way every
  // reference tool its readers already use behaves.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const open = (index: number) => {
    const suggestion = suggestions[index];
    if (suggestion) {
      window.location.href = `/f/${suggestion.slug}`;
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      if (suggestions.length === 0) {
        return;
      }
      event.preventDefault();
      const step = event.key === 'ArrowDown' ? 1 : -1;
      setActive((current) => {
        const next = current + step;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === 'Enter') {
      if (suggestions.length !== 0) {
        event.preventDefault();
        open(active === -1 ? 0 : active);
      }
      return;
    }

    if (event.key === 'Escape' && query) {
      event.preventDefault();
      setQuery('');
    }
  };

  const shortQuery =
    query !== '' && getStems(query).every((stem) => stem.length < PREFIX_LENGTH);

  const statusText = () => {
    if (status === 'error') {
      return 'Indeksi nuk u lexua dot. Kontrolloni lidhjen dhe provoni sërish.';
    }
    if (shortQuery) {
      return 'Shkruani të paktën tri shkronja.';
    }
    if (status === 'pending') {
      return 'Po kërkohet…';
    }
    if (status === 'none') {
      return `Asnjë fjalë me «${query.trim()}».`;
    }
    if (status === 'ok') {
      return suggestions.length === MAX_SUGGESTIONS
        ? `${MAX_SUGGESTIONS} fjalët më të afërta`
        : `${suggestions.length} fjalë`;
    }
    return compact ? '' : 'Shkruani pa «ë» dhe «ç» — fjala gjendet njësoj.';
  };

  return (
    <div className={`${styles.search} ${compact ? styles.compact : ''}`}>
      <div className={styles.field}>
        <label htmlFor="kerko" className="screenreader-text">
          Kërko një fjalë në fjalor
        </label>
        <input
          id="kerko"
          type="text"
          className={styles.input}
          placeholder="Kërko një fjalë"
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          role="combobox"
          aria-expanded={suggestions.length !== 0}
          aria-controls="rezultatet"
          aria-autocomplete="list"
          aria-activedescendant={
            active >= 0 ? `rezultat-${active}` : undefined
          }
        />
        {query !== '' && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Pastro kërkimin"
          >
            <ClearIcon />
          </button>
        )}
      </div>

      <div
        className={`${styles.head} ${
          status === 'ok' && span ? styles.headRuled : ''
        }`}
        aria-live="polite"
      >
        {status === 'ok' && span ? (
          <p className={`${styles.rail} sc`}>
            <span className={styles.railEnd}>{span[0]}</span>
            <span className={styles.leader}>
              <span className={styles.count}>{statusText()}</span>
            </span>
            <span className={styles.railEnd}>{span[1]}</span>
          </p>
        ) : (
          <p className={styles.status}>{statusText()}</p>
        )}
      </div>

      <ul
        className={styles.results}
        id="rezultatet"
        role="listbox"
        aria-label="Fjalët e gjetura"
      >
        {rendered.map(({ entry: suggestion, leaving }) => {
          const idx = leaving ? -1 : suggestions.indexOf(suggestion);

          return (
            <li
              key={getRowKey(suggestion)}
              ref={(element) => {
                const key = getRowKey(suggestion);
                if (element) {
                  rows.current.set(key, element);
                } else {
                  rows.current.delete(key);
                }
              }}
              data-leaving={leaving ? 'true' : 'false'}
              id={leaving ? undefined : `rezultat-${idx}`}
              role={leaving ? 'presentation' : 'option'}
              aria-selected={leaving ? undefined : idx === active}
              aria-hidden={leaving || undefined}
              className={`${styles.result} ${leaving ? styles.leaving : ''}`}
            >
              <a
                href={`/f/${suggestion.slug}`}
                className={`${styles.link} ${idx === active ? styles.active : ''}`}
                tabIndex={-1}
                onMouseEnter={() => !leaving && setActive(idx)}
              >
                <span className={styles.term}>{suggestion.term}</span>
                {suggestion.attributes.length !== 0 && (
                  <span className={styles.attributes}>
                    {suggestion.attributes.join(' ')}
                  </span>
                )}
                <span className={styles.gist}>
                  {getGist(suggestion.definitions)}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SearchBar;
