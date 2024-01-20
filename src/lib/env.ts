import dotenv from 'dotenv';

dotenv.config();

const isProduction = () => {
  return process.env.NODE_ENV == 'production';
};

const getDictionarySubset = (): string[] => {
  return JSON.parse(process.env.DICTIONARY_SUBSET || '[]');
};

export default {
  isProduction,
  getDictionarySubset,
};
