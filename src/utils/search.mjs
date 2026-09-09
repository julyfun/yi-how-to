import Fuse from 'fuse.js';

import {normalize, termsFor} from './search-index-core.mjs';
export {normalize, termsFor, matchingSnippet} from './search-index-core.mjs';
const labels = (value) => Array.isArray(value) ? value.join(' ') : value ?? '';

export function articleUrl(value, origin) {
  const url = new URL(value, origin);
  // Normalize directory URLs for Astro's trailingSlash: "never".
  url.pathname = url.pathname.replace(/\/+$/, '') || '/';
  return url.pathname + url.search + url.hash;
}

export function createMetadataSearch(records) {
  const documents = records.map((item) => ({
    item,
    title: normalize(item.title),
    description: normalize(item.description),
    tags: normalize(labels(item.tags)),
    category: normalize(labels(item.category)),
    slug: normalize(item.slug),
    body: normalize(item.body),
  }));
  const fuzzy = new Fuse(documents, {
    includeScore: true,
    ignoreLocation: true,
    threshold: 0.25,
    keys: [{name: 'title', weight: 4}, {name: 'tags', weight: 2}, 'slug', 'description'],
  });
  return (query, allowFuzzy = false) => {
    const terms = termsFor(query);
    if (!terms.length) return [];
    const exact = documents.filter((doc) => {
      const fields = [doc.title, doc.description, doc.tags, doc.category, doc.slug, doc.body];
      return terms.every((term) => fields.some((field) => field.includes(term)));
    }).map((doc) => {
      const inTitle = terms.every((term) => doc.title.includes(term));
      const rank = doc.title === normalize(query).trim() ? 0 : inTitle ? 1 : 2;
      return {item: doc.item, rank};
    }).sort((a, b) => a.rank - b.rank || a.item.title.length - b.item.title.length);
    if (exact.length || !allowFuzzy || terms.some((term) => term.length < 4 || /\p{Script=Han}|[^\p{L}\p{N}]/u.test(term))) return exact;
    const matches = terms.map((term) => fuzzy.search(term));
    return matches[0].filter((result) => matches.every((list) => list.some((r) => r.refIndex === result.refIndex)))
      .map((result) => ({item: result.item.item, rank: 3}));
  };
}

export function highlightText(element, text, query) {
  const terms = termsFor(query).sort((a, b) => b.length - a.length);
  element.replaceChildren();
  if (!terms.length) { element.textContent = text; return; }
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(escaped.join('|'), 'giu');
  let last = 0;
  for (const match of text.matchAll(regex)) {
    element.append(document.createTextNode(text.slice(last, match.index)));
    const mark = document.createElement('mark');
    mark.textContent = match[0];
    element.append(mark);
    last = match.index + match[0].length;
  }
  element.append(document.createTextNode(text.slice(last)));
}
