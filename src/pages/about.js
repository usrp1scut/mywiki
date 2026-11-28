import React, {useMemo} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useGlobalData from '@docusaurus/useGlobalData';
import styles from './about.module.css';

const CERTIFICATIONS = [
  {
    name: 'CKS',
    fullName: 'Certified Kubernetes Security Specialist',
    label: 'Kubernetes 认证安全专家',
    image: '/img/CKS.png',
  },
  {
    name: 'CKA',
    fullName: 'Certified Kubernetes Administrator',
    label: 'Kubernetes 认证管理员',
    image: '/img/CKA.png',
  },
  {
    name: 'RHCE',
    fullName: 'Red Hat Certified Engineer',
    label: '红帽认证工程师',
    image: '/img/RHCE.png',
  },
];

const SITE_SECTIONS = [
  {title: '知识库', to: '/docs', desc: '覆盖 Linux、网络、Nginx、Kubernetes、Istio、数据库、Ceph 与开发运维速查。'},
  {title: '实战博客', to: '/blog', desc: '云原生架构、CI/CD、可观测性建设与安全事件响应复盘。'},
  {title: '开源周报', to: '/weekly', desc: '每周追踪 GitHub Trending，梳理 AI 与工程基础设施的真实趋势。'},
  {title: '原生工具箱', to: '/tools', desc: '20 款开发运维常用本地工具，不依赖后端，不持久化用户输入。'},
];

function CertCard({cert}) {
  const imageUrl = useBaseUrl(cert.image);
  return (
    <figure className={styles.certCard}>
      <img
        src={imageUrl}
        alt={`${cert.name} ${cert.label}证书`}
        loading="lazy"
        decoding="async"
      />
      <figcaption>
        <strong>{cert.name}</strong>
        <span>{cert.label}</span>
      </figcaption>
    </figure>
  );
}

export default function AboutPage() {
  const globalData = useGlobalData();
  const skillData = globalData['skill-tree']?.default;
  const featuredPosts = useMemo(
    () => (globalData['recent-blog-posts']?.default?.featuredPosts ?? []).slice(0, 6),
    [globalData],
  );
  const rssUrl = useBaseUrl('/blog/rss.xml');

  return (
    <Layout title="关于我" description="Jacob 的技术背景、认证记录与代表作索引">
      <main className={styles.page}>
        <header className={styles.header}>
          <h1>关于我</h1>
          <p className={styles.lead}>
            我是 Jacob，一名长期关注 Linux、云原生基础设施、自动化交付与生产稳定性的运维 / SRE 工程师。
            这个站点最初是我的个人运维笔记本——为了避免遗忘，也为了把踩过的坑沉淀成可复用的参考。
          </p>
          <div className={styles.stats}>
            <span>{skillData?.noteCount ?? 135}+ 篇分类笔记</span>
            <span aria-hidden="true">·</span>
            <span>20 款原生工具</span>
            <span aria-hidden="true">·</span>
            <span>CKS / CKA / RHCE</span>
          </div>
        </header>

        <section className={styles.section} aria-labelledby="about-certs">
          <h2 id="about-certs">专业认证</h2>
          <div className={styles.certGrid}>
            {CERTIFICATIONS.map((cert) => (
              <CertCard key={cert.name} cert={cert} />
            ))}
          </div>
        </section>

        {featuredPosts.length > 0 && (
          <section className={styles.section} aria-labelledby="about-works">
            <div className={styles.sectionHeader}>
              <h2 id="about-works">代表文章</h2>
              <Link to="/blog">全部博客 →</Link>
            </div>
            <ul className={styles.postList}>
              {featuredPosts.map((post) => (
                <li key={post.permalink}>
                  {post.date && <time dateTime={post.date}>{post.date}</time>}
                  <Link to={post.permalink}>{post.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className={styles.section} aria-labelledby="about-site">
          <h2 id="about-site">站点内容</h2>
          <div className={styles.sectionGrid}>
            {SITE_SECTIONS.map((item) => (
              <Link key={item.to} to={item.to} className={styles.siteCard}>
                <strong>{item.title}</strong>
                <span>{item.desc}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-contact">
          <h2 id="about-contact">联系与订阅</h2>
          <ul className={styles.contactList}>
            <li>邮箱：<a href="mailto:jacob@xiebo.fun">jacob@xiebo.fun</a></li>
            <li>GitHub：<a href="https://github.com/usrp1scut/mywiki" target="_blank" rel="noopener noreferrer">github.com/usrp1scut/mywiki</a></li>
            <li>RSS：<a href={rssUrl} target="_blank" rel="noopener noreferrer">订阅博客更新</a></li>
          </ul>
        </section>
      </main>
    </Layout>
  );
}
