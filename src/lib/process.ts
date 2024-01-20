const NON_ALPHA_REGEX = /[^a-zA-Z]/g;
const WHITESPACE_REGEX = /\s+/;

const stems = (term: string) => {
  return term
    .toLowerCase()
    .replace('ë', 'e')
    .replace('ç', 'c')
    .split(WHITESPACE_REGEX)
    .map((word) => word.replace(NON_ALPHA_REGEX, ''))
    .filter((word) => word !== '');
};

const slug = (term: string) => {
  return term
    .toLowerCase()
    .replace('ë', 'ee')
    .replace('ç', 'ch')
    .split(WHITESPACE_REGEX)
    .map((word) => word.replace(NON_ALPHA_REGEX, ''))
    .filter((word) => word !== '')
    .join('-');
};

export default {
  stems,
  slug,
};