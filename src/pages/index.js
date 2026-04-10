import React, {useEffect, useMemo, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useGlobalData from '@docusaurus/useGlobalData';
import styles from './styles.module.css';
import {Poetry} from './诗词表';

const featuredSections = [
  {
    title: '运维知识库',
    description: '系统整理 Linux、网络、容器与排障经验，适合快速检索和复盘。',
    to: '/docs',
    cta: '进入知识库',
  },
  {
    title: '技术博客',
    description: '记录真实场景里的踩坑、实践与回顾，偏向能直接落地的方法。',
    to: '/blog',
    cta: '查看博客列表',
  },
  {
    title: '联系交流',
    description: '欢迎交流运维、DevOps 与自动化实践，也欢迎反馈站点改进建议。',
    href: 'mailto:jacob@xiebo.fun',
    cta: '邮件联系我',
  },
];

const readingPaths = [
  {label: '新手入门路径', text: '从基础命令到排障思路，先搭好稳定的知识框架。'},
  {label: '线上故障排查', text: '面向线上问题，关注定位顺序、观察方法与应急流程。'},
  {label: '效率工具实践', text: '把脚本、自动化和模板逐步固化成自己的工作流。'},
];

const toolSpotlight = {
  title: 'SBTI 测试',
  description: '把外部趣味人格测试整合进站内，进入后可以直接在 wiki 里答题和查看结果。',
  to: '/sbti',
  cta: '打开测试',
};

function Home() {
  const {siteConfig = {}} = useDocusaurusContext();
  const globalData = useGlobalData();
  const blogPluginData = globalData['docusaurus-plugin-content-blog']?.default;

  const recentPosts = useMemo(() => {
    const posts = blogPluginData?.blogPosts ?? [];
    return posts.slice(0, 3).map((post) => ({
      title: post.metadata.title,
      summary: post.metadata.description || '点击查看完整文章内容。',
      to: post.metadata.permalink,
    }));
  }, [blogPluginData]);

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

  return (
    <Layout title={siteConfig.title} description="聚焦运维、DevOps 与知识沉淀">
      <main className={styles.page}>
        <div className={styles.inkWash} aria-hidden="true" />
        <header className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.badge}>运维 · DevOps · 知识沉淀</p>
            <h1>{siteConfig.title}</h1>
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
              <>
                <h3 className={styles.poetryTitle}>{poetry.title}</h3>
                <span className={styles.sealMark}>雅</span>
                <p className={styles.author}>{poetry.author}</p>
                <div
                  className={clsx(
                    styles.contentWrapper,
                    poetryExpanded && styles.contentExpanded,
                  )}>
                  <p
                    className={styles.content}
                    dangerouslySetInnerHTML={{
                      __html: poetry.content.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
                {isLongPoetry && (
                  <button
                    type="button"
                    className={clsx(
                      'button button--sm button--outline button--secondary',
                      styles.expandButton,
                    )}
                    onClick={() => setPoetryExpanded((current) => !current)}>
                    {poetryExpanded ? '收起长诗词' : '展开完整诗词'}
                  </button>
                )}
              </>
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
          <div className={styles.recentGrid}>
            {recentPosts.map((post) => (
              <article key={post.title} className={styles.card}>
                <h3>{post.title}</h3>
                <p>{post.summary}</p>
                <Link className={styles.inlineLink} to={post.to}>
                  去博客查看 →
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionTitle}>
            <h2 className={styles.hanTitle}>站内工具</h2>
            <Link to={toolSpotlight.to} className={styles.inlineLink}>
              进入 SBTI 测试 →
            </Link>
          </div>
          <div className={styles.cardGrid}>
            <article className={styles.card}>
              <h3>{toolSpotlight.title}</h3>
              <p>{toolSpotlight.description}</p>
              <Link className={styles.inlineLink} to={toolSpotlight.to}>
                {toolSpotlight.cta} →
              </Link>
            </article>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.hanTitle}>你可以从这里开始</h2>
          <div className={styles.cardGrid}>
            {featuredSections.map((item) => {
              const linkProps = item.to ? {to: item.to} : {href: item.href};
              return (
                <article key={item.title} className={styles.card}>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <Link className={styles.inlineLink} {...linkProps}>
                    {item.cta} →
                  </Link>
                </article>
              );
            })}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.hanTitle}>建议阅读路径</h2>
          <ul className={styles.pathList}>
            {readingPaths.map((path) => (
              <li key={path.label}>
                <strong>{path.label}</strong>
                <span>{path.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
