import {Index, Charset} from 'flexsearch';

export const normalize = (value) => String(value ?? '').normalize('NFKC').toLowerCase();
export const termsFor = (query) => normalize(query).trim().split(/\s+/u).filter(Boolean);
export const createIndex = () => new Index({encoder: Charset.CJK, tokenize: 'strict', resolution: 1});
export const documentText = (doc) => normalize([doc.title, doc.slug, doc.description,
  Array.isArray(doc.tags) ? doc.tags.join(' ') : doc.tags,
  Array.isArray(doc.category) ? doc.category.join(' ') : doc.category, doc.body].filter(Boolean).join('\n'));

export function findDocuments(index, texts, query) {
  const terms = termsFor(query);
  if (!terms.length) return [];
  // FlexSearch supplies character-index candidates, independent of dictionaries.
  // Exact verification preserves contiguous terms and AND semantics across spaces.
  return index.search(terms.join(''), {limit: texts.length})
    .filter((id) => terms.every((term) => texts[id].includes(term)));
}

export function matchingSnippet(content, query) {
  const text = String(content || '');
  const lower = text.toLowerCase();
  const terms = termsFor(query).sort((a, b) => b.length - a.length);
  const term = terms.find((term) => lower.includes(term));
  if (!term) return '';
  const start = Math.max(0, lower.indexOf(term) - 80);
  return `${start ? '...' : ''}${text.slice(start, start + 280)}${start + 280 < text.length ? '...' : ''}`;
}
