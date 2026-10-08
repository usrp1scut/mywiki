import React from 'react';
import clsx from 'clsx';
import {PageMetadata, HtmlClassNameProvider, ThemeClassNames} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import BlogPostItems from '@theme/BlogPostItems';
import BlogListPaginator from '@theme/BlogListPaginator';
import BlogListPageStructuredData from '@theme/BlogListPage/StructuredData';
import SearchMetadata from '@theme/SearchMetadata';

export default function BlogListPage(props) {
  const {metadata, items} = props;
  return <HtmlClassNameProvider className={clsx(ThemeClassNames.wrapper.blogPages, ThemeClassNames.page.blogListPage)}>
    <PageMetadata title={metadata.blogTitle} description={metadata.blogDescription} />
    <SearchMetadata tag="blog_posts_list" />
    <BlogListPageStructuredData {...props} />
    <BlogLayout>
      <header className="blog-heading">
        <h1>博客</h1>
        <p>{metadata.blogDescription}</p>
      </header>
      <BlogPostItems items={items} />
      <p className="blog-page-number">第 {metadata.page} / {metadata.totalPages} 页</p>
      <BlogListPaginator metadata={metadata} />
    </BlogLayout>
  </HtmlClassNameProvider>;
}
