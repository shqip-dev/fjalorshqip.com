import type { APIContext } from 'astro';
import { getOpenSearchSettings } from '../lib/env.ts';
import { SEARCH_QUERY_PARAM } from '../lib/search.ts';

const escapeXml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export function GET({ site }: APIContext) {
  const { siteUrl, shortName, description } = getOpenSearchSettings(site?.href);
  const searchUrl = `${siteUrl}?${SEARCH_QUERY_PARAM}={searchTerms}`;
  const iconUrl = new URL('favicon.ico', siteUrl).href;

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/"
                       xmlns:moz="http://www.mozilla.org/2006/browser/search/">
  <ShortName>${escapeXml(shortName)}</ShortName>
  <Description>${escapeXml(description)}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/x-icon">${escapeXml(iconUrl)}</Image>
  <Url type="text/html" method="get" template="${escapeXml(searchUrl)}"/>
  <moz:SearchForm>${escapeXml(siteUrl)}</moz:SearchForm>
</OpenSearchDescription>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/opensearchdescription+xml; charset=utf-8',
    },
  });
}
