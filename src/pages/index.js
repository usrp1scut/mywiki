import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useGlobalData from '@docusaurus/useGlobalData';
import {useColorMode} from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';
import {Poetry} from './诗词表';

const quickNav = [
  {label: '知识库', icon: '📚', to: '/docs', desc: '运维文档与排障经验'},
  {label: '博客', icon: '✍️', to: '/blog', desc: '技术实践与回顾'},
  {label: 'SBTI', icon: '🧪', to: '/sbti', desc: '趣味人格测试'},
  {label: 'MBTI', icon: '🧠', to: '/mbti', desc: '60题性格测试'},
  {label: '联系', icon: '✉️', href: 'mailto:jacob@xiebo.fun', desc: '交流与反馈'},
];

const readingPaths = [
  {label: '新手入门路径', text: '从基础命令到排障思路，先搭好稳定的知识框架。'},
  {label: '线上故障排查', text: '面向线上问题，关注定位顺序、观察方法与应急流程。'},
  {label: '效率工具实践', text: '把脚本、自动化和模板逐步固化成自己的工作流。'},
];

function Home() {
  const {siteConfig = {}} = useDocusaurusContext();
  const globalData = useGlobalData();
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
  const isLongPoetry = Boolean(poetry?.content && poetry.content.length > 140);

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

  const featured = recentPosts[0];
  const rest = recentPosts.slice(1);

  return (
    <Layout title={siteConfig.title} description="聚焦运维、DevOps 与知识沉淀">
      <main className={styles.page}>
        <div className={styles.inkWash} aria-hidden="true" />
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.badge}>运维 · DevOps · 知识沉淀</p>
            <h1>
              <BrowserOnly fallback={siteConfig.title}>
                {() => {
                  const TypeWriter = require('../components/TypeWriter').default;
                  const {colorMode} = useColorMode();
                  if (colorMode !== 'dark') return siteConfig.title;
                  return <TypeWriter text={siteConfig.title} speed={100} />;
                }}
              </BrowserOnly>
            </h1>
            <p className={styles.subtitle}>
              这是一个面向长期积累的技术站点，强调可检索、可复用、可落地，也保留一点好玩的站内工具。
            </p>
            <div className={styles.heroActions}>
              <Link className="button button--primary button--lg" to="/blog">
                先看最新文章
              </Link>
              <Link className="button button--secondary button--lg" to="/docs">
                浏览知识库
              </Link>
            </div>
          </div>

          <aside className={styles.poetryCard} aria-label="今日诗词卡片">
            <div className={styles.poetryHeader}>
              <h2 className={styles.hanTitle}>今日诗词</h2>
              <button
                type="button"
                className={clsx('button button--sm button--outline button--primary', styles.switchButton)}
                onClick={switchPoetry}>
                换一首
              </button>
            </div>
            {poetry && (
              <div className={styles.poetryBody}>
                <div className={styles.poetryInkBg} aria-hidden="true" />
                <h3 className={styles.poetryTitle}>{poetry.title}</h3>
                <p className={styles.author}>{poetry.author}</p>
                <div
                  className={clsx(
                    styles.contentWrapper,
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
                    onClick={() => setPoetryExpanded((current) => !current)}>
                    {poetryExpanded ? '收起' : '展开全文'}
                  </button>
                )}
                <span className={styles.sealMark}>雅</span>
              </div>
            )}
          </aside>
        </header>

        {/* 最新文章 — 非对称网格 */}
        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.hanTitle}>最新文章</h2>
            <Link to="/blog" className={styles.inlineLink}>
              查看全部 →
            </Link>
          </div>
          <div className={styles.recentGrid}>
            {featured && (
              <article className={clsx(styles.card, styles.cardFeatured)}>
                <h3>{featured.title}</h3>
                <p>{featured.summary}</p>
                <Link className={styles.inlineLink} to={featured.to}>
                  阅读全文 →
                </Link>
              </article>
            )}
            <div className={styles.recentSide}>
              {rest.map((post) => (
                <article key={post.title} className={styles.card}>
                  <h3>{post.title}</h3>
                  <p>{post.summary}</p>
                  <Link className={styles.inlineLink} to={post.to}>
                    去博客查看 →
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 快捷导航 — 合并"从这里开始"和"站内工具" */}
        <section className={styles.section}>
          <h2 className={styles.hanTitle}>快捷导航</h2>
          <nav className={styles.quickNav}>
            {quickNav.map((item) => {
              const Wrapper = item.to ? Link : 'a';
              const linkProps = item.to ? {to: item.to} : {href: item.href};
              return (
                <Wrapper key={item.label} className={styles.quickNavItem} {...linkProps}>
                  <span className={styles.quickNavIcon}>{item.icon}</span>
                  <strong className={styles.quickNavLabel}>{item.label}</strong>
                  <span className={styles.quickNavDesc}>{item.desc}</span>
                </Wrapper>
              );
            })}
          </nav>
        </section>

        {/* 阅读路径 — 时间线 */}
        <section className={styles.section}>
          <h2 className={styles.hanTitle}>建议阅读路径</h2>
          <ol className={styles.timeline}>
            {readingPaths.map((path, i) => (
              <li key={path.label} className={styles.timelineItem}>
                <span className={styles.timelineStep}>{i + 1}</span>
                <div className={styles.timelineBody}>
                  <strong>{path.label}</strong>
                  <span>{path.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
