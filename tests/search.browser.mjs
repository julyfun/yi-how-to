import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.SEARCH_TEST_URL || 'http://127.0.0.1:4322';
const browser = await chromium.launch({channel: 'chrome', headless: true});
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  const resources = [];
  page.on('pageerror', (error) => errors.push(error.message));
  // Context-level responses include the search worker requests.
  context.on('response', (response) => {
    if (/search-worker|search-index|search\.json/.test(response.url())) resources.push(response);
  });
  await page.goto(`${base}/search`);
  const input = page.locator('#search');
  const titles = () => page.locator('#resultsList article > a:first-child').allTextContents();
  async function query(text) {
    await input.fill(text);
    await page.waitForFunction(() => document.querySelector('#searchResults').getAttribute('aria-busy') === 'false' && /Showing|No results|Unable/.test(document.querySelector('#searchReadout').textContent));
    return titles();
  }
  const start = performance.now();
  const tmux = await query('tmux');
  assert(tmux[0].includes('tmux'));
  assert(!tmux.includes('3.4.softmax'));
  let bytes = 0;
  for (const response of [...resources]) bytes += Number(await response.headerValue('content-length') || 0);
  console.log(JSON.stringify({coldSearchMs: Math.round(performance.now() - start),searchResponseBytes: bytes,tmux}));
  for (const q of ['show-origin', '--show-origin']) {
    const found = await query(q);
    assert.deepEqual(found, ['show-config']);
    assert((await page.locator('#resultsList [data-snippet]').innerText()).includes(q));
  }
  const cpp = await query('C++');
  assert.equal(cpp[0], 'C++ to Python');
  assert(cpp.length > 1, 'C++ must search bodies too');
  for (const q of ['嵊', '嵊州', '绍兴 嵊州', '不知道干嘛', '不知道 干嘛', '德基']) {
    const found = await query(q);
    assert(found.includes('绍兴旅游记'), `Missing travel note for ${q}`);
    assert.equal(found.length, new Set(found).size);
    const travel = page.locator('#resultsList article').filter({has: page.locator('a', {hasText: '绍兴旅游记'})});
    if (!q.includes(' ')) assert((await travel.locator('[data-snippet]').innerText()).includes(q));
  }
  assert.deepEqual(await query('绍兴嵊州'), []);
  assert((await query('绍兴 嵊州')).includes('绍兴旅游记'));
  const chinese = await query('搜索');
  assert.equal(chinese.length, 20);
  await page.locator('#loadMore').click();
  await page.waitForFunction(() => document.querySelectorAll('#resultsList article').length > 20);
  const urls = await page.locator('#resultsList article > a:first-child').evaluateAll((nodes) => nodes.map((n) => n.href));
  assert.equal(urls.length, new Set(urls).size);
  const ordered = await query('git config');
  const reversed = await query('config git');
  assert.deepEqual(ordered.slice(0, 5), reversed.slice(0, 5));
  for (const q of ['[', '(', '.', '<script>', 'git config --list --show-origin', 'zzzznonexistent9999']) await query(q);
  await input.fill('');
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#resultsList article').count(), 0);
  assert.equal(new URL(page.url()).searchParams.has('q'), false);
  await input.dispatchEvent('compositionstart');
  await input.fill('搜索');
  await page.waitForTimeout(350);
  assert.equal(await page.locator('#resultsList article').count(), 0);
  await input.dispatchEvent('compositionend');
  await page.waitForFunction(() => document.querySelectorAll('#resultsList article').length > 0);
  await page.setViewportSize({width: 1440, height: 1000});
  await query('--show-origin');
  await page.screenshot({path: '/tmp/yi-how-to-search-desktop.png', fullPage: true});
  await page.setViewportSize({width: 390, height: 844});
  await page.screenshot({path: '/tmp/yi-how-to-search-mobile.png', fullPage: true});
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  assert.deepEqual(errors, []);
  assert.equal((await page.goto(`${base}/`)).status(), 200);
  assert(await page.locator('#blog-postList').isVisible());
  assert((await query('嵊州')).includes('绍兴旅游记'));
  assert(await page.locator('#blog-postList').isHidden());
  const travelLink = page.locator('#resultsList article > a:first-child').filter({hasText: '绍兴旅游记'});
  const travelUrl = await travelLink.getAttribute('href');
  const articleResponse = page.waitForResponse((response) => response.request().isNavigationRequest());
  await travelLink.click();
  assert.equal((await articleResponse).status(), 200);
  await page.locator('h1', {hasText: '绍兴旅游记'}).waitFor();
  assert.equal(decodeURI(new URL(page.url()).pathname).replace(/\/$/, ''), decodeURI(travelUrl).replace(/\/$/, ''));
  await page.goBack();
  await page.waitForFunction(() => document.querySelector('#resultsList').textContent.includes('绍兴旅游记'));
  await input.fill('');
  assert(await page.locator('#blog-postList').isVisible());
  assert.deepEqual(await query('绍兴嵊州'), []);
  assert((await query('绍兴 嵊州')).includes('绍兴旅游记'));
  assert.deepEqual(errors, []);
  await context.close();

  // Slow first fetch, then clear the query: the delayed completion must stay hidden.
  const slow = await browser.newPage();
  let release;
  let reached;
  const blocked = new Promise((resolve) => { release = resolve; });
  const started = new Promise((resolve) => { reached = resolve; });
  await slow.route('**/search.json', async (route) => { reached(); await blocked; await route.continue(); });
  await slow.goto(`${base}/search?q=tmux`);
  await started;
  await slow.locator('#search').fill('');
  release();
  await slow.waitForTimeout(800);
  assert.equal(await slow.locator('#resultsList article').count(), 0);
  assert.equal(await slow.locator('#searchReadout').innerText(), '');
  await slow.close();

  // A delayed source must not block the other source's ready results.
  for (const [pattern, query, expected] of [
    ['**/search.json', '不知道干嘛', '绍兴旅游记'],
    ['**/search-index.bin', 'tmux', 'tmux'],
  ]) {
    const independent = await browser.newPage();
    let unblock;
    const gate = new Promise((resolve) => { unblock = resolve; });
    await independent.context().route(pattern, async (route) => { await gate; await route.continue(); });
    try {
      await independent.goto(`${base}/?q=${encodeURIComponent(query)}`);
      await independent.waitForFunction((text) => document.querySelector('#resultsList').textContent.includes(text), expected, {timeout: 5000});
      assert.equal(await independent.locator('#searchResults').getAttribute('aria-busy'), 'true');
    } finally { unblock(); }
    await independent.waitForFunction(() => document.querySelector('#searchResults').getAttribute('aria-busy') === 'false');
    assert(await independent.locator('#retry').isHidden());
    await independent.close();
  }

  // A worker can fail after initial loading, including during pagination.
  const crash = await browser.newPage();
  await crash.addInitScript(() => {
    const NativeWorker = window.Worker;
    window.searchTestWorkers = [];
    window.Worker = class extends NativeWorker {
      constructor(...args) { super(...args); window.searchTestWorkers.push(this); }
    };
  });
  await crash.goto(`${base}/?q=${encodeURIComponent('搜索')}`);
  await crash.waitForFunction(() => document.querySelector('#searchReadout').textContent.startsWith('Showing') && document.querySelector('#searchResults').getAttribute('aria-busy') === 'false');
  await crash.evaluate(() => window.searchTestWorkers[0].dispatchEvent(new ErrorEvent('error', {message: 'Simulated worker failure'})));
  await crash.locator('#loadMore').click();
  await crash.locator('#retry').waitFor({state: 'visible'});
  await crash.locator('#retry').click();
  await crash.waitForFunction(() => document.querySelector('#searchReadout').textContent.startsWith('Showing') && document.querySelector('#retry').hidden && document.querySelector('#searchResults').getAttribute('aria-busy') === 'false');
  assert.equal(await crash.evaluate(() => window.searchTestWorkers.length), 2);
  await crash.close();

  // Recreate workers after both script and index failures, without reloading.
  for (const pattern of ['**/search-index.bin', '**/search-worker-*.js']) {
    const failure = await browser.newPage();
    await failure.context().route(pattern, (route) => route.abort());
    await failure.goto(`${base}/search?q=tmux`);
    await failure.locator('#retry').waitFor({state: 'visible'});
    assert((await failure.locator('#resultsList article').count()) > 0);
    await failure.context().unroute(pattern);
    await failure.locator('#retry').click();
    await failure.waitForFunction(() => document.querySelector('#searchReadout').textContent.startsWith('Showing') && document.querySelector('#retry').hidden);
    await failure.locator('#search').fill('不知道干嘛');
    await failure.waitForFunction(() => document.querySelector('#resultsList').textContent.includes('绍兴旅游记'));
    await failure.close();
  }
  console.log('Browser search regression checks passed.');
} finally {
  await browser.close();
}
