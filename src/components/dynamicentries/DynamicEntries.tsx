import NotFound from '../notfound/NotFound';
import EntriesLoader from '../entriesloader/EntriesLoader';

const WORD_PATH_PREFIX = '/f/';
const SLUG_PATTERN = /^[a-z-]+$/;

const DynamicEntries = () => {
  const word = requestedWord();
  return word ? <EntriesLoader slug={word} /> : <NotFound />;
};

const requestedWord = () => {
  let path = window?.location?.pathname || '';

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
