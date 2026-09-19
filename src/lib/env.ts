import { config } from 'dotenv';

config();

export const isProduction = () => {
  return process.env.NODE_ENV === 'production';
};

export const shouldSkipStaticWordPages = () => {
  return process.env.SHOULD_SKIP_STATIC_WORD_PAGES === 'true';
};

export const isCloudflarePages = () => {
  return process.env.CLOUDFLARE === 'true';
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
