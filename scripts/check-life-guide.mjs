// Check rendered routes/anchors/navigation after yarn build, without requesting
// thousands of upstream citations or conflating access checks with fact checking.
import assert from 'node:assert/strict';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve(process.argv[2] || 'build');
const origin = 'https://xiebo.fun';
const manifest = JSON.parse(await readFile('life/_meta/import-report.json', 'utf8'));
assert.equal(manifest.total_chapters, manifest.chapters.length);
assert.ok(manifest.total_chapters > 0 && manifest.total_entries > 0);

function unescape(value) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, (entity) => {
    const names = {'&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>'};
    return names[entity] ?? String.fromCodePoint(entity.startsWith('&#x')
      ? parseInt(entity.slice(3, -1), 16) : Number(entity.slice(2, -1)));
  });
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match ? unescape(match[1]) : undefined;
}

function links(html) {
  return [...html.matchAll(/<a\b[^>]*>/g)].map(([tag]) => ({
    href: attribute(tag, 'href'), className: attribute(tag, 'class') || '',
  })).filter(({href}) => href !== undefined);
}

const cache = new Map();
async function readRoute(route) {
  const decoded = decodeURIComponent(route);
  const target = path.resolve(output, `.${decoded}`);
  assert.ok(target.startsWith(`${output}${path.sep}`) || target === output, route);
  let file = target;
  if ((await stat(target)).isDirectory()) file = path.join(target, 'index.html');
  if (!cache.has(file)) cache.set(file, await readFile(file, 'utf8'));
  return cache.get(file);
}

const chapterRoutes = manifest.chapters.map(({source}) => `/life/${path.basename(source).slice(0, 2)}`);
const routes = ['/life/', ...chapterRoutes, '/life/about'];
let checkedInternalLinks = 0;
let checkedEntryAnchors = 0;
const externalUrls = new Set();

for (const route of routes) {
  const html = await readRoute(route);
  const sidebar = html.match(/<aside\b[^>]*>[\s\S]*?<\/aside>/)?.[0];
  assert.ok(sidebar, `${route}: missing independent sidebar`);
  const sidebarPaths = new Set(links(sidebar).map(({href}) => new URL(href, origin).pathname.replace(/\/$/, '')));
  for (const chapter of chapterRoutes) assert.ok(sidebarPaths.has(chapter), `${route}: missing sidebar ${chapter}`);
  assert.ok(!sidebarPaths.has('/docs'), `${route}: knowledge-base sidebar leaked into life guide`);

  for (const {href} of links(html)) {
    const url = new URL(href, origin + route);
    if (!['http:', 'https:'].includes(url.protocol)) continue;
    if (url.origin !== origin) {
      externalUrls.add(url.href);
      continue;
    }
    const target = await readRoute(url.pathname);
    if (url.hash && url.hash !== '#') {
      const anchor = decodeURIComponent(url.hash.slice(1));
      const ids = [...target.matchAll(/\bid="([^"]*)"/g)].map(([, id]) => unescape(id));
      assert.ok(ids.includes(anchor), `${route}: missing target ${href}`);
    }
    checkedInternalLinks++;
  }

  const chapterIndex = chapterRoutes.indexOf(route);
  if (chapterIndex !== -1) {
    const item = manifest.chapters[chapterIndex];
    const entryIds = [...html.matchAll(/\bid="entry-(\d+)"/g)].map(([, n]) => Number(n));
    assert.deepEqual(entryIds, Array.from({length: item.chapter_entries}, (_, i) => i + 1), `${route}: lost or duplicate entry`);
    checkedEntryAnchors += entryIds.length;
    for (const [direction, expected] of [
      ['prev', chapterRoutes[chapterIndex - 1] || '/life'],
      ['next', chapterRoutes[chapterIndex + 1] || '/life/about'],
    ]) {
      const link = links(html).find(({className}) => className.split(' ').includes(`pagination-nav__link--${direction}`));
      assert.ok(link, `${route}: missing ${direction}`);
      assert.equal(new URL(link.href, origin).pathname.replace(/\/$/, ''), expected, `${route}: wrong ${direction}`);
    }
    assert.ok(html.includes('CC BY 4.0') && html.includes(manifest.commit.slice(0, 7)), `${route}: missing attribution`);
  }
}

const knowledgeHome = await readRoute('/docs/');
assert.ok(!knowledgeHome.includes('高性价比人生指南'), 'Life guide leaked into the knowledge-base index');
const indexes = JSON.parse(await readFile(path.join(output, 'search-index.json'), 'utf8'));
const searchContent = JSON.stringify(indexes);
for (const route of chapterRoutes) {
  assert.ok(searchContent.includes(`"u":"${route}`), `${route}: missing search entry`);
}
assert.equal(checkedEntryAnchors, manifest.total_entries);
assert.equal(await readFile(path.join(output, 'life/LICENSE-CC-BY-4.0.txt'), 'utf8'),
  await readFile('static/life/LICENSE-CC-BY-4.0.txt', 'utf8'));
console.log(JSON.stringify({pages: routes.length, chapters: manifest.total_chapters, entries: checkedEntryAnchors,
  checkedInternalLinks, preservedExternalUrls: externalUrls.size,
  navigation: 'passed', search: 'passed', license: 'passed'}, null, 2));
