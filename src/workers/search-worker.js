import {createIndex, documentText, findDocuments, matchingSnippet} from '../utils/search-index-core.mjs';

let loading;
async function load(base) {
  // A neutral extension avoids servers treating the stored gzip as HTTP encoding.
  const response = await fetch(`${base}/search-index.bin`);
  if (!response.ok) throw new Error(`Search index: ${response.status}`);
  const stream = response.body.pipeThrough(new DecompressionStream('gzip'));
  const {entries, documents} = await new Response(stream).json();
  const index = createIndex();
  for (const [key, data] of Object.entries(entries)) await index.import(key, data);
  return {index, documents, texts: documents.map(documentText)};
}

self.onmessage = async ({data: {id, kind, base, query, documentId}}) => {
  try {
    const state = await (loading ??= load(base));
    let result;
    if (kind === 'search') result = findDocuments(state.index, state.texts, query);
    else {
      const {body, ...meta} = state.documents[documentId];
      result = {url: `${base}/${meta.slug}`, meta,
        plain: matchingSnippet(body, query) || matchingSnippet(state.texts[documentId], query)};
    }
    self.postMessage({id, result});
  } catch (error) {
    loading = undefined;
    self.postMessage({id, error: String(error)});
  }
};
