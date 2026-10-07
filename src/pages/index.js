import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useGlobalData from '@docusaurus/useGlobalData';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import {Poetry} from './精选诗词表';

const quickNav = [
  {label: '知识库', to: '/docs', desc: '运维文档与排障经验'},
  {label: '博客', to: '/blog', desc: '技术实践与回顾'},
  {label: 'SBTI', to: '/sbti', desc: '趣味人格测试'},
  {label: 'MBTI', to: '/mbti', desc: '60题性格测试'},
  {label: '联系', href: 'mailto:jacob@xiebo.fun', desc: '交流与反馈'},
];

const noteLinks = [
  {label: 'Linux', anchor: 'linux'},
  {label: 'Windows', anchor: 'windows'},
  {label: '网络', anchor: '网络'},
  {label: 'Kubernetes', anchor: '容器-kubernetes'},
  {label: 'Nginx', anchor: 'nginx'},
  {label: 'MySQL', anchor: '数据库-mysql'},
  {label: 'Oracle', anchor: '数据库-oracle'},
  {label: 'Ceph', anchor: 'ceph'},
];

function Home() {
  const {siteConfig = {}} = useDocusaurusContext();
  const globalData = useGlobalData();
  const docsUrl = useBaseUrl('/docs/');
  const markUrl = useBaseUrl('/img/wiki-mark.svg');
  const darkMarkUrl = useBaseUrl('/img/wiki-mark-dark.svg');
  const recentBlogData = globalData['recent-blog-posts']?.default;

  const recentPosts = useMemo(() => {
    const posts = recentBlogData?.recentPosts ?? [];
    return posts.map((post) => ({
      title: post.title,
      summary: post.description || '点击查看完整文章内容。',
      to: post.permalink,
    }));
  }, [recentBlogData]);

  const [poetryIndex, setPoetryIndex] = useState(0);
  const [poetryExpanded, setPoetryExpanded] = useState(false);

  useEffect(() => {
    if (Poetry.length === 0) return;
    setPoetryIndex(Math.floor(Math.random() * Poetry.length));
  }, []);

  const poetry = useMemo(() => Poetry[poetryIndex], [poetryIndex]);
  const isLongPoetry = Boolean(poetry?.content && (poetry.content.length > 110 || poetry.content.split('\n').length > 5));

  const switchPoetry = () => {
    setPoetryExpanded(false);
    setPoetryIndex((current) => {
      if (Poetry.length <= 1) return current;
      let next = current;
      while (next === current) {
        next = Math.floor(Math.random() * Poetry.length);
      }
      return next;
    });
  };

  return (
    <Layout title={siteConfig.title} description="聚焦运维、DevOps 与知识沉淀">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>{siteConfig.title}</h1>
            <p className={styles.subtitle}>
              这是我的运维笔记本。为了避免遗忘，便于查阅。
            </p>
            <form className={styles.noteSearch} action={docsUrl} method="get" role="search" aria-label="按标题查找笔记">
              <label htmlFor="home-note-query">找一篇笔记</label>
              <div className={styles.searchField}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>
                <input id="home-note-query" name="q" type="search" placeholder="标题或分类，例如 k8s 内存" />
                <button type="submit">查笔记</button>
              </div>
            </form>
            <nav className={styles.noteLinks} aria-label="笔记直达">
              {noteLinks.map(({label, anchor}) => (
                <Link key={anchor} to={`/docs/#notes-${anchor}`}>{label}</Link>
              ))}
            </nav>
            <div className={styles.heroActions}>
              <Link to="/docs">浏览全部笔记 <span aria-hidden="true">→</span></Link>
              <Link to="/blog">看博客 <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <aside className={styles.poetryCard} aria-label="今日诗词卡片">
            <div className={styles.poetryHeader}>
              <h2 className={styles.hanTitle}>今日诗词</h2>
              <button
                type="button"
                className={clsx('button button--sm button--outline button--primary', styles.switchButton)}
                onClick={switchPoetry}
                aria-label="随机切换一首诗词">
                换一首
              </button>
            </div>
            {poetry && (
              <div className={styles.poetryBody}>
                <h3 className={styles.poetryTitle}>{poetry.title}</h3>
                <div
                  id="daily-poetry-content"
                  className={clsx(
                    isLongPoetry && !poetryExpanded && styles.contentCollapsed,
                  )}>
                  <div className={styles.poetryLines}>
                    {poetry.content.split('\n').map((line, i) => (
                      <span key={i} className={styles.poetryLine}>{line}</span>
                    ))}
                  </div>
                </div>
                {isLongPoetry && (
                  <button
                    type="button"
                    className={clsx(
                      'button button--sm button--outline button--secondary',
                      styles.expandButton,
                    )}
                    aria-expanded={poetryExpanded}
                    aria-controls="daily-poetry-content"
                    onClick={() => setPoetryExpanded((current) => !current)}>
                    {poetryExpanded ? '收起' : '展开全文'}
                  </button>
                )}
                <div className={styles.poetryFooter}>
                  <p className={styles.author}>{poetry.author}</p>
                  <ThemedImage className={styles.brandMark} sources={{light: markUrl, dark: darkMarkUrl}} width="30" height="30" alt="" />
                </div>
              </div>
            )}
          </aside>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.hanTitle}>最新文章</h2>
            <Link to="/blog" className={styles.inlineLink}>
              查看全部 →
            </Link>
          </div>
          <div>
            {recentPosts.map((post) => (
              <article key={post.to} className={styles.recentPost}>
                <h3><Link to={post.to}>{post.title}</Link></h3>
                <p>{post.summary}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 快捷导航 — 合并"从这里开始"和"站内工具" */}
        <section className={styles.section}>
          <h2 className={styles.hanTitle}>快捷导航</h2>
          <nav className={styles.quickNav} aria-label="快捷导航">
            {quickNav.map((item) => {
              const Wrapper = item.to ? Link : 'a';
              const linkProps = item.to ? {to: item.to} : {href: item.href};
              return (
                <Wrapper key={item.label} className={styles.quickNavItem} {...linkProps}>
                  <strong className={styles.quickNavLabel}>{item.label}</strong>
                  <span className={styles.quickNavDesc}>{item.desc}</span>
                </Wrapper>
              );
            })}
          </nav>
        </section>

      </main>
    </Layout>
  );
}

export default Home;
