import React from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useIsBrowser from '@docusaurus/useIsBrowser';
import SiteSearchForm from '@site/src/components/SiteSearchForm';
import styles from './404.module.css';

export default function NotFound() {
  const {pathname} = useLocation();
  const isBrowser = useIsBrowser();
  return (
    <Layout title="404 · 页面未找到">
      <Head><meta name="robots" content="noindex, follow" /></Head>
      <main className={styles.page}>
        <h1>404 · 页面未找到</h1>
        <p className={styles.description}>页面可能已移动，或链接有误。可以搜索关键词，也可以回到笔记目录继续查找。</p>
        {isBrowser && <p className={styles.path}>请求路径：<code>{pathname}</code></p>}
        <SiteSearchForm id="not-found-query" />
        <nav className={styles.actions} aria-label="继续浏览">
          <Link to="/docs/">浏览笔记目录</Link>
          <Link to="/">返回首页</Link>
        </nav>
      </main>
    </Layout>
  );
}
