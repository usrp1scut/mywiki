import lunr from 'lunr';
import {searchIndexUrl} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/proxiedGenerated';
import {SearchSourceFactory} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/SearchSourceFactory';
import {SearchDocumentType} from '@easyops-cn/docusaurus-search-local/dist/client/shared/interfaces';
import {highlight} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlight';
import {highlightStemmed} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlightStemmed';
import {getStemmedPositions} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/getStemmedPositions';
import {loadSearchIndex} from './load-index.mjs';

const RESULT_LIMIT = 100;
let sourcePromise;
function loadSource(baseUrl) {
  if (!sourcePromise) {
    sourcePromise = (async () => {
      if (process.env.NODE_ENV !== 'production') return () => [];
      const url = new URL(`${baseUrl}${searchIndexUrl.replace('{dir}', '')}`, self.location.origin);
      if (url.origin !== self.location.origin) throw new Error('搜索索引地址无效');
      const json = await loadSearchIndex(url);
      const wrappedIndexes = json.map(({documents, index}, type) => ({type, documents, index: lunr.Index.load(index)}));
      const dictionary = new Set();
      for (const {index} of json) {
        for (const [word] of index.invertedIndex) {
          if (/\p{Unified_Ideograph}/u.test(word[0])) dictionary.add(word);
        }
      }
      return SearchSourceFactory(wrappedIndexes, [...dictionary], RESULT_LIMIT);
    })().catch((error) => {
      sourcePromise = undefined;
      throw error;
    });
  }
  return sourcePromise;
}

export async function search(query, baseUrl) {
  if (!query.trim()) return {items: [], limited: false};
  const source = await loadSource(baseUrl);
  let matches = [];
  source(query, (items) => { matches = items; });
  const targets = new Map();
  for (const match of matches) {
    const key = match.document.u + (match.document.h || '');
    const excerpt = [SearchDocumentType.Content, SearchDocumentType.Description].includes(match.type) ? match : null;
    if (!targets.has(key)) targets.set(key, {...match, excerpt});
    else if (excerpt && !targets.get(key).excerpt) targets.get(key).excerpt = excerpt;
  }
  return {
    items: [...targets.values()]
      .sort((a, b) => Number(b.type === SearchDocumentType.Title) - Number(a.type === SearchDocumentType.Title))
      .map(formatResult),
    limited: matches.length === RESULT_LIMIT,
  };
}

function formatResult({document, page, type, tokens, metadata, excerpt}) {
  const isTitle = type === SearchDocumentType.Title;
  const summaryTitle = [SearchDocumentType.Content, SearchDocumentType.Description, SearchDocumentType.Keywords].includes(type);
  const title = summaryTitle ? document.s : document.t;
  const path = [...(isTitle ? document.b : page.b)];
  if ([SearchDocumentType.Heading, SearchDocumentType.Content].includes(type)) path.push(page.t);
  const params = new URLSearchParams();
  tokens.forEach((token) => params.append('_highlight', token));
  return {
    id: document.i,
    href: `${document.u}${params.size ? `?${params}` : ''}${document.h || ''}`,
    titleHtml: summaryTitle ? highlight(title, tokens) : highlightStemmed(title, getStemmedPositions(metadata, 't'), tokens, 100),
    path: path.join(' / '),
    excerptHtml: excerpt ? highlightStemmed(excerpt.document.t, getStemmedPositions(excerpt.metadata, 't'), excerpt.tokens, 160) : '',
  };
}
