export function createFulltextEngine(base) {
  const worker = new Worker(new URL('../workers/search-worker.js', import.meta.url), {type: 'module'});
  const pending = new Map();
  let sequence = 0;
  let failure;
  const destroy = (error = new Error('Search worker stopped')) => {
    failure = error;
    worker.terminate();
    for (const {reject, timer} of pending.values()) { clearTimeout(timer); reject(error); }
    pending.clear();
  };
  worker.onerror = (event) => {
    event.preventDefault();
    destroy(new Error(event.message || 'Search worker failed to load'));
  };
  worker.onmessageerror = () => destroy(new Error('Invalid search worker response'));
  worker.onmessage = ({data: {id, result, error}}) => {
    const request = pending.get(id);
    if (!request) return;
    pending.delete(id);
    clearTimeout(request.timer);
    if (error) request.reject(new Error(error)); else request.resolve(result);
  };
  const request = (kind, query, documentId) => new Promise((resolve, reject) => {
    if (failure) { reject(failure); return; }
    const id = ++sequence;
    const timer = setTimeout(() => destroy(new Error('Search timed out')), 30000);
    pending.set(id, {resolve, reject, timer});
    worker.postMessage({id, kind, query, documentId, base});
  });
  return {
    get failed() { return Boolean(failure); },
    async search(query) {
      const ids = await request('search', query);
      return {results: ids.map((id) => ({id, data: () => request('document', query, id)}))};
    },
    destroy,
  };
}
