import React, {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
import TOCItems from '@theme/TOCItems';

function PostThumbnail({src}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return <img className="blog-entry__image" src={src} alt="" width="160" height="120"
    loading="lazy" decoding="async" onError={() => setFailed(true)} />;
}

function excerpt(text) {
  const chars = Array.from(text.trim().replace(/\s+/g, ' '));
  if (chars.length <= 120) return chars.join('');
  const opening = chars.slice(0, 120).join('');
  const sentenceEnd = Math.max(...['。', '！', '？', '；'].map(mark => opening.lastIndexOf(mark)));
  if (sentenceEnd >= 50) return opening.slice(0, sentenceEnd + 1);
  const pause = Math.max(opening.lastIndexOf('，'), opening.lastIndexOf('、'));
  return `${(pause >= 60 ? opening.slice(0, pause) : opening.replace(/[A-Za-z0-9_-]+$/, '')).trimEnd()}…`;
}

export default function BlogPostItem({children, className}) {
  const {isBlogPostPage, assets, frontMatter, metadata, toc} = useBlogPost();
  const {thumbnails = {}, summaries = {}} = usePluginData('blog-thumbnails') || {};
  const filename = metadata.source?.split(/[\\/]/).pop();
  const thumbnail = assets?.image || frontMatter.image || thumbnails[filename];
  const description = metadata.description?.trim();
  const summary = description && !/^(none|null)$/i.test(description)
    ? description : summaries[filename] || '';

  if (isBlogPostPage) {
    return (
      <BlogPostItemContainer className={clsx('blog-article', className)}>
        <BlogPostItemHeader />
        {!frontMatter.hide_table_of_contents && toc.length > 0 && (
          <details className="blog-article__mobile-toc">
            <summary>本文目录</summary>
            <TOCItems toc={toc} minHeadingLevel={frontMatter.toc_min_heading_level}
              maxHeadingLevel={frontMatter.toc_max_heading_level} />
          </details>
        )}
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />
      </BlogPostItemContainer>
    );
  }

  return (
    <BlogPostItemContainer className={clsx('blog-entry', className)}>
      <div className="blog-entry__content">
        <BlogPostItemHeader />
        {summary && <p className="blog-entry__summary">{excerpt(summary)}</p>}
        <footer className="blog-entry__footer">
          {metadata.tags.length > 0 && <ul className="blog-entry__tags" aria-label="文章标签">
            {metadata.tags.map(tag => <li key={tag.permalink}><Link to={tag.permalink}>{tag.label}</Link></li>)}
          </ul>}
          <Link className="blog-entry__read" to={metadata.permalink} aria-label={`阅读全文：${metadata.title}`}>
            阅读全文 <span aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
      {thumbnail && <PostThumbnail key={thumbnail} src={thumbnail} />}
    </BlogPostItemContainer>
  );
}
