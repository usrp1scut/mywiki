import React from 'react';
import {HtmlClassNameProvider, PageMetadata, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

export default function BlogArchivePage({archive}) {
  const groups = new Map();
  [...archive.blogPosts].sort((a, b) => b.metadata.date.localeCompare(a.metadata.date)).forEach(({metadata}) => {
    const year = metadata.date.slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(metadata);
  });
  return <HtmlClassNameProvider className={ThemeClassNames.wrapper.blogPages}>
    <PageMetadata title="博客归档" />
    <BlogLayout>
      <header className="blog-heading"><h1>博客归档</h1><p>共 {archive.blogPosts.length} 篇，按时间排列。</p></header>
      <nav className="blog-archive-years" aria-label="跳到年份">
        {[...groups.keys()].map(year => <a key={year} href={`#year-${year}`}>{year}</a>)}
      </nav>
      {[...groups].map(([year, posts]) => <section className="blog-archive-year" key={year} aria-labelledby={`year-${year}`}>
        <Heading as="h2" id={`year-${year}`}>{year}</Heading>
        <ul>{posts.map(post => <li key={post.permalink}>
          <time dateTime={post.date}>{post.date.slice(5, 10).replace('-', '.')}</time>
          <Link to={post.permalink}>{post.title}</Link>
        </li>)}</ul>
      </section>)}
    </BlogLayout>
  </HtmlClassNameProvider>;
}
