/*
 * The whole analytics surface of the site: Umami, one call, and no identifier
 * beyond a random token that groups the events of a single visit. The token
 * lives on `document` so that separate islands — the search field and the day's
 * word are siblings, not parent and child — report against one visit.
 */

declare global {
  interface Document {
    __fjalorshqip__: string;
  }
  const umami: any;
}

const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

export const getVisitToken = () => {
  if (!document.__fjalorshqip__) {
    document.__fjalorshqip__ = randomString();
  }

  return document.__fjalorshqip__;
};

/**
 * Umami loads async and may be blocked outright; nothing here is allowed to
 * take a page down with it.
 */
export const track = (event: string, data: Record<string, string>) => {
  try {
    umami.track(event, { ...data, rs: getVisitToken() });
  } catch (e) {
    console.error('unexpected error', e);
  }
};
