// Node's built-in .env loader. Same precedence as dotenv: variables already present in
// the real environment (shell, CI, Docker) win over the file.
try {
  process.loadEnvFile();
} catch (error) {
  // A missing .env is normal — everything can come from the environment instead.
  if ((error as { code?: string })?.code !== 'ENOENT') {
    throw error;
  }
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export const shouldSkipStaticWordPages = () => {
  return process.env.SHOULD_SKIP_STATIC_WORD_PAGES === 'true';
};

/*
 * The per-word social cards are the expensive half of a production build — ~40k
 * images, a few minutes and ~400 MB. Skipping the word pages skips them too:
 * there would be no prerendered page to hang them on.
 */
export const shouldSkipWordCards = () => {
  return (
    process.env.SHOULD_SKIP_WORD_CARDS === 'true' || shouldSkipStaticWordPages()
  );
};

export const getDictionarySubset = (): string[] => {
  return JSON.parse(process.env.DICTIONARY_SUBSET || '[]');
};

const DEFAULT_SITE_URL = 'https://fjalorshqip.com/';
const DEFAULT_OPENSEARCH_SHORT_NAME = 'Fjalor Shqip';
const DEFAULT_OPENSEARCH_DESCRIPTION =
  'Kërko kuptimin e fjalëve në gjuhën shqipe';

export const getSiteUrl = (fallback?: string) => {
  return new URL(process.env.SITE_URL || fallback || DEFAULT_SITE_URL).href;
};

export const getOpenSearchSettings = (fallbackSiteUrl?: string) => {
  return {
    siteUrl: getSiteUrl(fallbackSiteUrl),
    shortName:
      process.env.OPENSEARCH_SHORT_NAME || DEFAULT_OPENSEARCH_SHORT_NAME,
    description:
      process.env.OPENSEARCH_DESCRIPTION || DEFAULT_OPENSEARCH_DESCRIPTION,
  };
};
