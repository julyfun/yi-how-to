import {readFile, writeFile} from 'node:fs/promises';
import {gzipSync} from 'node:zlib';
import {parseHTML} from 'linkedom';
import {convert} from 'html-to-text';
import {createIndex, documentText} from '../utils/search-index-core.mjs';

export function searchIndex() {
  return {
    name: 'search-index',
    hooks: {
      'astro:build:done': async ({dir, logger}) => {
        const documents = JSON.parse(await readFile(new URL('search.json', dir), 'utf8'));
        const index = createIndex();
        for (const [id, doc] of documents.entries()) {
          const html = await readFile(new URL(`${doc.slug}/index.html`, dir), 'utf8');
          const article = parseHTML(html).document.querySelector('[data-search-body]');
          if (!article) throw new Error(`Search article missing: ${doc.slug}`);
          article.querySelectorAll('script, style, button, svg').forEach((node) => node.remove());
          doc.body = convert(article.outerHTML, {wordwrap: false, selectors: [
            {selector: 'a', options: {ignoreHref: true}},
            {selector: 'img', format: 'skip'},
            ...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((selector) => ({selector, options: {uppercase: false}})),
          ]});
          index.add(id, documentText(doc));
        }
        const entries = {};
        await index.export((key, value) => { entries[key] = value; });
        const data = gzipSync(JSON.stringify({entries, documents}));
        await writeFile(new URL('search-index.bin', dir), data);
        logger.info(`Search index: ${documents.length} articles, ${Math.round(data.length / 1024)} KiB compressed`);
      },
    },
  };
}
