import dotenv from 'dotenv';

dotenv.config();

const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

const shouldSkipStaticWordPages = () => {
  return process.env.SHOULD_SKIP_STATIC_WORD_PAGES === 'true';
};

const getDictionarySubset = (): string[] => {
  return JSON.parse(process.env.DICTIONARY_SUBSET || '[]');
};

export default {
  isProduction,
  getDictionarySubset,
  shouldSkipStaticWordPages,
};
