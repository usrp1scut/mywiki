import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {useHistory, useLocation} from '@docusaurus/router';
import SiteSearchForm from '@site/src/components/SiteSearchForm';
import useSiteSearch from '@site/src/search/useSiteSearch';
import styles from './styles.module.css';

const SCOPES = [
  {id: '', label: '笔记与博客'},
  {id: 'life', label: '生活指南'},
];

export default function SearchPage() {
  const location = useLocation();
  const history = useHistory();
  const searchUrl = useBaseUrl('/search');
  const isBrowser = useIsBrowser();
  const params = isBrowser ? new URLSearchParams(location.search) : null;
  const query = params?.get('q')?.trim() || '';
  const scope = params?.get('scope') === 'life' ? 'life' : '';
  const {items, limited, status, retry} = useSiteSearch(query, true, scope);
  const failed = status === 'error';
  const ready = status === 'ready';

  function switchScope(nextScope) {
    if (nextScope === scope) return;
    const nextParams = new URLSearchParams();
    if (query) nextParams.set('q', query);
    if (nextScope) nextParams.set('scope', nextScope);
    history.push(`${searchUrl}${nextParams.size ? `?${nextParams}` : ''}`);
  }

  return (
    <Layout title={query ? `搜索：${query}` : '站内搜索'}>
      <Head><meta name="robots" content="noindex, follow" /></Head>
      <main className={styles.page}>
        <h1>站内搜索</h1>
        <div className={styles.scopes} role="tablist" aria-label="搜索范围">
          {SCOPES.map((item) => (
            <button
              key={item.id || 'default'}
              type="button"
              role="tab"
              aria-selected={scope === item.id}
              className={scope === item.id ? styles.scopeActive : styles.scopeButton}
              onClick={() => switchScope(item.id)}>
              {item.label}
            </button>
          ))}
        </div>
        <SiteSearchForm
          id="site-search-query"
          label={scope === 'life' ? '搜索生活指南' : '搜索笔记与博客'}
          query={query}
          scope={scope}
        />
        <div role="status" aria-live="polite" className={styles.status}>
          {!query ? (scope === 'life' ? '输入关键词检索《高性价比人生指南》全文。' : '输入关键词查找内容，也可以按原来的分类浏览笔记。')
            : failed ? '搜索暂时无法加载，请重试。'
            : !ready ? '正在加载搜索索引…'
            : items.length ? (limited ? `显示 ${items.length} 条匹配结果，可增加关键词查看更多。` : `找到 ${items.length} 条匹配结果`)
            : process.env.NODE_ENV !== 'production' ? '本地开发模式不生成搜索索引，请构建后预览。'
            : '没有找到匹配内容，试试更短的关键词或切换搜索范围。'}
        </div>
        {failed && <button className={styles.retry} type="button" onClick={retry}>重新加载</button>}
        {(!query || (ready && !items.length)) && (
          <Link to={scope === 'life' ? '/life/' : '/docs/'}>
            {scope === 'life' ? '浏览生活指南目录 →' : '浏览笔记目录 →'}
          </Link>
        )}
        {query && !ready && !failed && <div className={styles.loading} aria-hidden="true"><span /><span /><span /></div>}
        {items.length > 0 && <section aria-label="搜索结果">
          {items.map((result) => <SearchResult key={result.id} result={result} />)}
        </section>}
      </main>
    </Layout>
  );
}

function SearchResult({result}) {
  return (
    <article className={styles.result}>
      <h2><Link to={result.href} dangerouslySetInnerHTML={{__html: result.titleHtml}} /></h2>
      {result.path && <p className={styles.path}>{result.path}</p>}
      {result.excerptHtml && <p className={styles.summary} dangerouslySetInnerHTML={{__html: result.excerptHtml}} />}
    </article>
  );
}
