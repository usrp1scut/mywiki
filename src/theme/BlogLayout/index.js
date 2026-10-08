import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import {useLocation} from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import './styles.css';

export default function BlogLayout({sidebar, toc, children, ...layoutProps}) {
  const {pathname} = useLocation();
  const root = useBaseUrl('/blog');
  const path = pathname.replace(/\/$/, '');
  const archive = path === `${root}/archive`;
  const tags = path.startsWith(`${root}/tags`);
  const list = path === root || path.startsWith(`${root}/page/`);
  return (
    <Layout {...layoutProps}>
      <div className={clsx('blog-shell', toc && 'blog-shell--with-toc')}>
        <nav className="blog-navigation" aria-label="博客导航">
          <Link to={root} aria-current={list ? 'page' : undefined}>全部文章</Link>
          <Link to={`${root}/archive`} aria-current={archive ? 'page' : undefined}>按年归档</Link>
          <Link to={`${root}/tags`} aria-current={tags ? 'page' : undefined}>标签</Link>
        </nav>
        <div className="blog-layout">
          <main className="blog-main">{children}</main>
          {toc && <aside className="blog-toc" aria-label="本文目录">
            <div className="blog-toc__inner"><p>本文目录</p>{toc}</div>
          </aside>}
        </div>
      </div>
    </Layout>
  );
}
