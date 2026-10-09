import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useLocation} from '@docusaurus/router';
import SiteSearchForm from '@site/src/components/SiteSearchForm';
// Reuse the plugin's index, ranking and escaping; no second search engine.
import {fetchIndexes} from '@easyops-cn/docusaurus-search-local/dist/client/client/theme/SearchBar/fetchIndexes';
import {SearchSourceFactory} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/SearchSourceFactory';
import {SearchDocumentType} from '@easyops-cn/docusaurus-search-local/dist/client/shared/interfaces';
import {highlight} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlight';
import {highlightStemmed} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/highlightStemmed';
import {getStemmedPositions} from '@easyops-cn/docusaurus-search-local/dist/client/client/utils/getStemmedPositions';
import styles from './styles.module.css';

const RESULT_LIMIT = 100;

export default function SearchPage() {
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const baseUrl = useBaseUrl('/');
  const query = isBrowser ? new URLSearchParams(location.search).get('q')?.trim() || '' : '';
  const hasQuery = Boolean(query);
  const [source, setSource] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!hasQuery) return undefined;
    let active = true;
    setFailed(false);
    fetchIndexes(baseUrl, '').then(({wrappedIndexes, zhDictionary}) => {
      if (active) setSource(() => SearchSourceFactory(wrappedIndexes, zhDictionary, RESULT_LIMIT));
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [baseUrl, hasQuery]);

  const results = useMemo(() => {
    let matches = [];
    if (source && query) source(query, (items) => { matches = items; });
    // A heading and its body may point to the same anchor. Keep one result,
    // preserving the title's rank and the body's useful excerpt.
    const targets = new Map();
    for (const match of matches) {
      const key = match.document.u + (match.document.h || '');
      const excerpt = [SearchDocumentType.Content, SearchDocumentType.Description].includes(match.type) ? match : null;
      if (!targets.has(key)) targets.set(key, {...match, excerpt});
      else if (excerpt && !targets.get(key).excerpt) targets.get(key).excerpt = excerpt;
    }
    return {
      items: [...targets.values()].sort((a, b) => Number(b.type === SearchDocumentType.Title) - Number(a.type === SearchDocumentType.Title)),
      limited: matches.length === RESULT_LIMIT,
    };
  }, [source, query]);

  return (
    <Layout title={query ? `搜索：${query}` : '站内搜索'}>
      <Head><meta name="robots" content="noindex, follow" /></Head>
      <main className={styles.page}>
        <h1>站内搜索</h1>
        <SiteSearchForm id="site-search-query" query={query} />
        <div role="status" aria-live="polite" className={styles.status}>
          {!query ? '输入关键词查找内容，也可以按原来的分类浏览笔记。'
            : failed ? '搜索索引暂时无法加载，请刷新重试。'
            : !source ? '正在加载搜索索引…'
            : results.items.length ? (results.limited ? `显示 ${results.items.length} 条匹配结果，可增加关键词查看更多。` : `找到 ${results.items.length} 条匹配结果`)
            : process.env.NODE_ENV !== 'production' ? '本地开发模式不生成搜索索引，请构建后预览。'
            : '没有找到匹配内容，试试更短的关键词或命令名称。'}
        </div>
        {failed && <button className={styles.retry} type="button" onClick={() => window.location.reload()}>刷新重试</button>}
        {(!query || (source && !results.items.length)) && <Link to="/docs/">浏览笔记目录 →</Link>}
        {query && !source && !failed && <div className={styles.loading} aria-hidden="true"><span /><span /><span /></div>}
        {results.items.length > 0 && <section aria-label="搜索结果">
          {results.items.map((result) => <SearchResult key={result.document.i} result={result} />)}
        </section>}
      </main>
    </Layout>
  );
}

function SearchResult({result: {document, page, type, tokens, metadata, excerpt}}) {
  const isTitle = type === SearchDocumentType.Title;
  const isContent = type === SearchDocumentType.Content;
  const isDescription = type === SearchDocumentType.Description;
  const isKeywords = type === SearchDocumentType.Keywords;
  const titleRelated = isTitle || isDescription || isKeywords;
  const title = isContent || isDescription || isKeywords ? document.s : document.t;
  const path = [...(isTitle ? document.b : page.b)];
  if (!titleRelated) path.push(page.t);
  const params = new URLSearchParams();
  tokens.forEach((token) => params.append('_highlight', token));
  const href = `${document.u}${params.size ? `?${params}` : ''}${document.h || ''}`;

  return (
    <article className={styles.result}>
      <h2><Link to={href} dangerouslySetInnerHTML={{__html: isContent || isDescription || isKeywords
        ? highlight(title, tokens)
        : highlightStemmed(title, getStemmedPositions(metadata, 't'), tokens, 100)}} /></h2>
      {path.length > 0 && <p className={styles.path}>{path.join(' / ')}</p>}
      {excerpt && <p className={styles.summary} dangerouslySetInnerHTML={{
        __html: highlightStemmed(excerpt.document.t, getStemmedPositions(excerpt.metadata, 't'), excerpt.tokens, 160),
      }} />}
    </article>
  );
}
