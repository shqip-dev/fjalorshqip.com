import { useEffect } from 'react';
import { applyMissingMeta } from '../../lib/documentMeta';
import NotFound from '../notfound/NotFound';
import EntriesLoader from '../entriesloader/EntriesLoader';
import WordOfDay from '../wordofday/WordOfDay';

const WORD_PATH_PREFIX = '/f/';
const SLUG_PATTERN = /^[a-z-]+$/;

const DynamicEntries = () => {
  let path = window?.location?.pathname || '';
  const homepage = isHomepage(path);
  const word = requestedWord(path);

  // An address that is neither the home page nor a word page is the 404 the
  // home page's head does not describe; `EntriesLoader` owns the word case,
  // where the answer is only known once the sub-index has been fetched.
  useEffect(() => {
    if (!homepage && !word) {
      applyMissingMeta();
    }
  }, [homepage, word]);

  return homepage ? (
    <WordOfDay />
  ) : word ? (
    <EntriesLoader slug={word} />
  ) : (
    <NotFound />
  );
};

const isHomepage = (path: string) => {
  return path === '' || path === '/';
};

const requestedWord = (path: string) => {
  if (!path.startsWith(WORD_PATH_PREFIX)) {
    return null;
  }

  if (path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  const word = path.substring(WORD_PATH_PREFIX.length);
  if (!SLUG_PATTERN.test(word)) {
    return null;
  }

  return word;
};

export default DynamicEntries;
