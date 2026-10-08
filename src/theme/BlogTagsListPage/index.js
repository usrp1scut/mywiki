import React from 'react';
import clsx from 'clsx';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import SearchMetadata from '@theme/SearchMetadata';
import Link from '@docusaurus/Link';

export default function BlogTagsListPage({tags}) {
  const sorted = [...tags].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'zh-CN'));
  return <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogTagsListPage)}>
    <PageMetadata title="博客标签" />
    <SearchMetadata tag="blog_tags_list" />
    <BlogLayout>
      <header className="blog-heading"><h1>标签</h1><p>按主题翻阅，数字为文章篇数。</p></header>
      <ul className="blog-tag-index">
        {sorted.map(tag => <li key={tag.permalink}><Link to={tag.permalink}>
          <span>{tag.label}</span><span className="blog-tag-count">{tag.count} 篇</span>
        </Link></li>)}
      </ul>
    </BlogLayout>
  </HtmlClassNameProvider>;
}
