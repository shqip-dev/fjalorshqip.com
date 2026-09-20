/*
 * The head of a page the build did not write.
 *
 * `index.astro` is also the 404 catch-all, so a word page that was not
 * prerendered arrives with the home page's `<head>`: its title, its
 * description, its canonical and its JSON-LD. The island that renders the word
 * rewrites all of it here, from the same `seo.ts` helpers the prerendered page
 * uses, so the two paths describe a word identically. A crawler that runs the
 * page's JavaScript sees the corrected head; one that does not sees the home
 * page's, which is the cost of having no server to render for it.
 */
import type { Entry } from './dictionary.ts';
import {
  OG_IMAGE_ALT,
  SITE_HOST,
  getMissingWordTitle,
  getWordDescription,
  getWordSchema,
  getWordSocialTitle,
  getWordTitle,
  getCanonicalUrl,
  getWordUrl,
  serializeSchema,
} from './seo.ts';

const SCHEMA_ID = 'schema-org';

const getSiteUrl = () => `${window.location.origin}/`;

const setMeta = (
  attribute: 'name' | 'property',
  key: string,
  value: string
) => {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`
  );

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute('content', value);
};

const setCanonical = (url: string) => {
  let element = document.head.querySelector<HTMLLinkElement>(
    'link[rel="canonical"]'
  );

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
};

const setSchema = (json: string | null) => {
  document.getElementById(SCHEMA_ID)?.remove();
  if (!json) {
    return;
  }

  const script = document.createElement('script');
  script.id = SCHEMA_ID;
  script.type = 'application/ld+json';
  script.textContent = json;
  document.head.appendChild(script);
};

const setHead = ({
  title,
  socialTitle,
  description,
  url,
  type,
}: {
  title: string;
  socialTitle: string;
  description: string;
  url: string;
  type: 'website' | 'article';
}) => {
  document.title = title;
  setMeta('name', 'description', description);
  setCanonical(url);

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:title', socialTitle);
  setMeta('property', 'og:description', description);
  setMeta('property', 'og:url', url);
  setMeta('property', 'og:image:alt', OG_IMAGE_ALT);

  setMeta('name', 'twitter:title', socialTitle);
  setMeta('name', 'twitter:description', description);
};

export const applyWordMeta = (entries: Entry[]) => {
  const siteUrl = getSiteUrl();
  const term = entries[0].term;
  const url = getWordUrl(entries[0].slug, siteUrl);

  setHead({
    title: getWordTitle(term),
    socialTitle: getWordSocialTitle(term),
    description: getWordDescription(entries),
    url,
    type: 'article',
  });

  // No `robots` directive: indexable is the default, and this code only runs
  // on a page the host answered 404 for. Asking for it to be indexed anyway
  // would contradict the status the same request carried. The prerendered word
  // page — the one served with a 200 — is what asks to be indexed, by saying
  // nothing at all.
  setSchema(serializeSchema(getWordSchema(entries, siteUrl)));
};

/*
 * A word the dictionary does not have, and any other address that fell through
 * to the 404 page. Neither is worth indexing — `follow` so the links out of the
 * page are still crawled — and neither has structured data to carry.
 */
export const applyMissingMeta = (word?: string) => {
  const url = getCanonicalUrl(window.location.pathname, getSiteUrl());

  setHead({
    title: word
      ? getMissingWordTitle(word)
      : `Faqja nuk u gjet | ${SITE_HOST}`,
    socialTitle: word ? `${word} — nuk u gjet në fjalor` : 'Faqja nuk u gjet',
    description: word
      ? `Fjala ${word} nuk gjendet në fjalorin e gjuhës shqipe.`
      : `Kjo adresë nuk ekziston në ${SITE_HOST}.`,
    url,
    type: 'website',
  });

  setMeta('name', 'robots', 'noindex,follow');
  setSchema(null);
};
