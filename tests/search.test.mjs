import test from 'node:test';
import assert from 'node:assert/strict';
import {createMetadataSearch, highlightText, articleUrl} from '../src/utils/search.mjs';

const search = createMetadataSearch([
  {title: '3.4.softmax', slug: 'softmax'},
  {title: 'A very long title with instructions to configure and automatically start tmux', slug: 'tools/tmux'},
  {title: 'show-config', slug: 'git/config/show', tags: ['git', 'config']},
  {title: 'C++ to Python', slug: 'cpp'},
  {title: 'Chinese note', slug: 'notes', body: '正文包含搜索功能'},
]);

test('result URLs follow Astro trailingSlash never while preserving query and anchors', () => {
  assert.equal(articleUrl('/notes/travel/?q=test#section', 'http://localhost'), '/notes/travel?q=test#section');
  assert.equal(articleUrl('/notes/travel', 'http://localhost'), '/notes/travel');
  assert.equal(articleUrl('/', 'http://localhost'), '/');
  assert.equal(decodeURI(articleUrl('/26/08/绍兴旅游记/', 'http://localhost')), '/26/08/绍兴旅游记');
});

test('literal title match wins without location penalties or fuzzy noise', () => {
  assert.deepEqual(search('tmux').map((r) => r.item.slug), ['tools/tmux']);
});
test('multiple terms match across metadata in either order', () => {
  assert.deepEqual(search('git config'), search('config git'));
  assert.equal(search('git config')[0].item.title, 'show-config');
});
test('empty queries, technical punctuation, Chinese and development body', () => {
  assert.deepEqual(search('  '), []);
  assert.equal(search('C++')[0].item.slug, 'cpp');
  assert.equal(search('搜索')[0].item.slug, 'notes');
  assert.deepEqual(search('[', true), []);
});
test('fuzzy search is optional and excludes short or symbol queries', () => {
  assert.deepEqual(search('pythno'), []);
  assert.equal(search('pythn', true)[0].item.slug, 'cpp');
  assert.deepEqual(search('tmz', true), []);
});
test('highlights regex metacharacters and keeps markup as text', () => {
  const saved = globalThis.document;
  const element = () => ({children: [], replaceChildren() {this.children = [];}, append(child) {this.children.push(child);}});
  globalThis.document = {createElement: element, createTextNode: (text) => ({textContent: text})};
  try {
    for (const query of ['C++', '[', '(', '.', '*', '<script>']) {
      const target = element();
      highlightText(target, `before ${query} after`, query);
      assert.equal(target.children.map((c) => c.textContent).join(''), `before ${query} after`);
      assert.equal(target.children[1].textContent, query);
    }
  } finally { globalThis.document = saved; }
});


test('exported CJK index retrieves every literal substring, including unknown names', async () => {
  const {createIndex, documentText, findDocuments} = await import('../src/utils/search-index-core.mjs');
  const docs = [
    {title: '绍兴旅游记', body: '晚饭肯德基，然后不知道干嘛，出发去嵊州。'},
    {title: 'Commands', body: 'C++ git config --list --show-origin'},
    {title: 'Scattered words', body: '搜索相关功能，嵊 州'},
    {title: 'Literal words', body: '正文包含搜索功能'},
  ];
  const texts = docs.map(documentText);
  const index = createIndex();
  texts.forEach((text, id) => index.add(id, text));
  const entries = {};
  await index.export((key, data) => { entries[key] = data; });
  const restored = createIndex();
  for (const [key, data] of Object.entries(entries)) await restored.import(key, data);
  for (const [id, doc] of docs.entries()) {
    const chars = Array.from(doc.body);
    for (let start = 0; start < chars.length; start++) {
      for (let end = start + 1; end <= chars.length; end++) {
        const query = chars.slice(start, end).join('').trim();
        if (query) assert(findDocuments(restored, texts, query).includes(id), query);
      }
    }
  }
  assert.deepEqual(findDocuments(restored, texts, '绍兴嵊州'), []);
  assert.deepEqual(findDocuments(restored, texts, '绍兴 嵊州'), [0]);
  assert.deepEqual(findDocuments(restored, texts, '搜索功能'), [3]);
  assert.deepEqual(findDocuments(restored, texts, '嵊州'), [0]);
  assert.deepEqual(findDocuments(restored, texts, 'git config'), findDocuments(restored, texts, 'config git'));
});
