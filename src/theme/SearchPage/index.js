import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import useIsBrowser from '@docusaurus/useIsBrowser';
import {useLocation} from '@docusaurus/router';
import SiteSearchForm from '@site/src/components/SiteSearchForm';
import useSiteSearch from '@site/src/search/useSiteSearch';
import styles from './styles.module.css';

export default function SearchPage() {
  const location = useLocation();
  const isBrowser = useIsBrowser();
  const query = isBrowser ? new URLSearchParams(location.search).get('q')?.trim() || '' : '';
  const {items, limited, status, retry} = useSiteSearch(query);
  const failed = status === 'error';
  const ready = status === 'ready';

  return (
    <Layout title={query ? `搜索：${query}` : '站内搜索'}>
      <Head><meta name="robots" content="noindex, follow" /></Head>
      <main className={styles.page}>
        <h1>站内搜索</h1>
        <SiteSearchForm id="site-search-query" query={query} />
        <div role="status" aria-live="polite" className={styles.status}>
          {!query ? '输入关键词查找内容，也可以按原来的分类浏览笔记。'
            : failed ? '搜索暂时无法加载，请重试。'
            : !ready ? '正在加载搜索索引…'
            : items.length ? (limited ? `显示 ${items.length} 条匹配结果，可增加关键词查看更多。` : `找到 ${items.length} 条匹配结果`)
            : process.env.NODE_ENV !== 'production' ? '本地开发模式不生成搜索索引，请构建后预览。'
            : '没有找到匹配内容，试试更短的关键词或命令名称。'}
        </div>
        {failed && <button className={styles.retry} type="button" onClick={retry}>重新加载</button>}
        {(!query || (ready && !items.length)) && <Link to="/docs/">浏览笔记目录 →</Link>}
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
