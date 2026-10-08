import React from 'react';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';

export default function BlogPostItemHeader() {
  const {metadata, isBlogPostPage} = useBlogPost();
  const Heading = isBlogPostPage ? 'h1' : 'h2';
  // Keep date suffixes intact when long weekly-report titles wrap.
  const datedTitle = metadata.title.match(/^(.*?)([（(]\d{4}-\d{2}-\d{2}[）)])$/);
  const title = datedTitle ? <>{datedTitle[1]}<span className="blog-title-date">{datedTitle[2]}</span></> : metadata.title;
  return (
    <header className="blog-post-header">
      <Heading>{isBlogPostPage ? title : <Link to={metadata.permalink}>{title}</Link>}</Heading>
      <div className="blog-post-meta">
        <BlogPostItemHeaderInfo />
        {metadata.authors.map((author, index) => <React.Fragment key={author.key || index}>
          <span aria-hidden="true">·</span>
          <span>{author.url ? <Link to={author.url}>{author.name}</Link> : author.name}
            {isBlogPostPage && author.title && <span className="blog-author-note"> · {author.title}</span>}
          </span>
        </React.Fragment>)}
      </div>
    </header>
  );
}
