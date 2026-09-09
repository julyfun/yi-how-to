# Search

The homepage and /search share src/components/Search.astro.

## Engine

FlexSearch 0.8 uses its built-in Charset.CJK character index in both the build
and browser. No dictionaries, Intl.Segmenter, alternate tokenizations or named
exceptions are used. Candidates are checked against normalized article text:
space-separated terms must all appear, and each term must appear contiguously.
For example, 绍兴嵊州 differs from 绍兴 嵊州. English matching is case-insensitive;
technical punctuation is literal. Fuse is only a conservative metadata typo
fallback and is disabled for Chinese.

Official documentation:
- https://github.com/nextapps-de/flexsearch/blob/master/doc/encoder.md
- https://github.com/nextapps-de/flexsearch/blob/master/doc/export-import.md

## Build And Runtime

npm run build exports FlexSearch's index and article text to
dist/search-index.bin (gzip-compressed JSON). Article text is extracted from data-search-body
using linkedom and html-to-text, excluding navigation, scripts and controls.
Deploy the complete dist directory. No search server is required.

The first search downloads the compressed index once. A dedicated Worker
decompresses, imports and searches it; only visible result snippets are sent
back to the UI. The small search.json metadata list supplies title-first
results and remains available when the full index cannot load.

Failed Worker scripts or index fetches are retried using a fresh Worker.
There is no cached dynamic module import failure. Requests time out after
30 seconds. Clearing or changing a query discards stale UI updates.
Metadata fetches time out after 10 seconds. Both sources publish independently,
so a stalled source cannot hide the other source's results. Worker failures
after loading also discard the dead instance before the next search or retry.
Results render in batches of 20, with URL deduplication and safe text
highlighting. Links follow Astro's trailingSlash: never setting.

Development uses metadata plus Markdown bodies from search.json. Use build
and preview to verify production HTML extraction and the exported index.

## Verification

Run node --test tests/search.test.mjs. The index round-trip test checks every
substring of sample Chinese notes and commands, rather than just named cases.

With Playwright and Chrome installed, run node tests/search.browser.mjs
against a preview on port 4322. SEARCH_TEST_URL overrides the URL;
PLAYWRIGHT_MODULE can point to an external Playwright installation.
Browser checks include homepage-to-article navigation, Chinese contiguous
matching, command symbols, pagination, IME, stale queries, and recovery from
both Worker script and index failures.
