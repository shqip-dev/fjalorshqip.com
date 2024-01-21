import NotFound from '../notfound/NotFound';
import EntriesLoader from '../entriesloader/EntriesLoader';

const WORD_PATH_PREFIX = '/f/';
const SLUG_PATTERN = /^[a-z-]+$/;

const DynamicEntries = () => {
  let path = window?.location?.pathname || '';
  const homepage = isHomepage(path);
  const word = requestedWord(path);

  return homepage ? <></> : word ? <EntriesLoader slug={word} /> : <NotFound />;
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
