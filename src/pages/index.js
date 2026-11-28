import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import ThemedImage from '@theme/ThemedImage';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useGlobalData from '@docusaurus/useGlobalData';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import {Poetry} from '@site/src/data/精选诗词表';
import SiteSearchForm from '@site/src/components/SiteSearchForm';
import SkillTree from '@site/src/components/SkillTree';

const quickNav = [
  {label: '知识库', to: '/docs', desc: '运维文档、速查与排障经验'},
  {label: '博客', to: '/blog', desc: '云原生、安全响应与架构实践'},
  {label: '开源周报', to: '/weekly', desc: '每周 GitHub Trending 项目拆解'},
  {label: '工具箱', to: '/tools', desc: '20 款本地开发与运维工具'},
  {label: '生活指南', to: '/life', desc: '高性价比人生指南全文查阅'},
  {label: '关于我', to: '/about', desc: '技术方向、认证与联系方式'},
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
  const markUrl = useBaseUrl('/img/wiki-mark.svg');
  const darkMarkUrl = useBaseUrl('/img/wiki-mark-dark.svg');
  const recentBlogData = globalData['recent-blog-posts']?.default;

  const featuredPosts = useMemo(() => {
    const posts = recentBlogData?.featuredPosts ?? recentBlogData?.recentPosts ?? [];
    return posts.slice(0, 5).map((post) => ({
      title: post.title,
      summary: post.description || '点击查看完整文章内容。',
      to: post.permalink,
      date: post.date || '',
      tags: post.tags ?? [],
    }));
  }, [recentBlogData]);

  const recentWeekly = useMemo(() => {
    const posts = recentBlogData?.recentWeekly ?? [];
    return posts.map((post) => ({
      title: post.title,
      to: post.permalink,
      date: post.date || '',
    }));
  }, [recentBlogData]);

  const [poetryIndex, setPoetryIndex] = useState(0);
  const [poetryExpanded, setPoetryExpanded] = useState(false);
  const [poetryTurn, setPoetryTurn] = useState(0);

  useEffect(() => {
    if (Poetry.length === 0) return;
    setPoetryIndex(Math.floor(Math.random() * Poetry.length));
  }, []);

  const poetry = useMemo(() => Poetry[poetryIndex], [poetryIndex]);
  const isLongPoetry = Boolean(poetry?.content && (poetry.content.length > 110 || poetry.content.split('\n').length > 5));

  const switchPoetry = () => {
    setPoetryExpanded(false);
    setPoetryTurn((turn) => turn + 1);
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
    <Layout title={siteConfig.title} description="聚焦运维、云原生、安全响应与知识沉淀">
      <main className={styles.page}>
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <h1>{siteConfig.title}</h1>
            <p className={styles.subtitle}>
              这是我的运维笔记本。为了避免遗忘，便于查阅。
            </p>
            <SiteSearchForm id="home-note-query" className={styles.noteSearch} />
            <nav className={styles.noteLinks} aria-label="笔记直达">
              {noteLinks.map(({label, anchor}) => (
                <Link key={anchor} to={`/docs/#notes-${anchor}`}>{label}</Link>
              ))}
            </nav>
            <div className={styles.heroActions}>
              <Link to="/docs">浏览全部笔记 <span aria-hidden="true">→</span></Link>
              <a href="#skill-tree">探索技能树 <span aria-hidden="true">↓</span></a>
              <Link to="/blog">看实战博客 <span aria-hidden="true">→</span></Link>
            </div>
          </div>

          <aside className={styles.poetryCard} aria-label="今日诗词卡片">
            <div className={styles.poetryHeader}>
              <h2 className={styles.hanTitle}>今日诗词</h2>
              <button
                type="button"
                className={styles.switchButton}
                onClick={switchPoetry}
                aria-label="随机切换一首诗词">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" style={{transform: `rotate(${poetryTurn * 180}deg)`}}>
                  <path d="M20 8a8 8 0 0 0-14-2L3 9m0-6v6h6M4 16a8 8 0 0 0 14 2l3-3m0 6v-6h-6" />
                </svg>
                换一首
              </button>
            </div>
            {poetry && (
              <div key={poetryTurn} className={clsx(styles.poetryBody, poetryTurn > 0 && styles.poetryTurning)}>
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
                  <ThemedImage className={styles.brandMark} sources={{light: markUrl, dark: darkMarkUrl}} width="42" height="42" alt="" />
                </div>
              </div>
            )}
            <span className={styles.poetryStatus} role="status">{poetryTurn > 0 && `已切换为《${poetry?.title}》`}</span>
          </aside>
        </header>

        <SkillTree />

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.hanTitle}>精选实战</h2>
            <Link to="/blog" className={styles.inlineLink}>
              全部博客 →
            </Link>
          </div>
          <div>
            {featuredPosts.map((post) => (
              <article key={post.to} className={styles.recentPost}>
                <div className={styles.postMeta}>
                  {post.date && <time dateTime={post.date}>{post.date}</time>}
                  {post.tags.length > 0 && (
                    <span className={styles.postTags}>{post.tags.join(' · ')}</span>
                  )}
                </div>
                <h3><Link to={post.to}>{post.title}</Link></h3>
                <p>{post.summary}</p>
              </article>
            ))}
          </div>
        </section>

        {recentWeekly.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2 className={styles.hanTitle}>开源周报</h2>
              <Link to="/weekly" className={styles.inlineLink}>
                查看全部周报 →
              </Link>
            </div>
            <ul className={styles.weeklyList}>
              {recentWeekly.map((post) => (
                <li key={post.to} className={styles.weeklyItem}>
                  {post.date && <time dateTime={post.date}>{post.date}</time>}
                  <Link to={post.to}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

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
