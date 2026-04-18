import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

const FALLBACK_THUMBNAIL = '/img/sunrise.jpeg';

// metadata.source looks like "@site/blog/2025-8-2.md" — pick the filename.
function sourceToFilename(source) {
  if (!source) return null;
  const parts = source.split(/[\\/]/);
  return parts[parts.length - 1] || null;
}

export default function BlogPostItem({children, className}) {
  const {isBlogPostPage, assets, frontMatter, metadata} = useBlogPost();
  const containerClassName = !isBlogPostPage ? 'margin-bottom--xl' : undefined;

  const thumbnailsData = usePluginData('blog-thumbnails') || {};
  const thumbnailMap = thumbnailsData.thumbnails || {};

  const explicitThumbnail = assets?.image || frontMatter?.image;
  const filename = sourceToFilename(metadata?.source);
  const firstImageThumbnail = filename ? thumbnailMap[filename] : undefined;

  const thumbnail =
    explicitThumbnail || firstImageThumbnail || FALLBACK_THUMBNAIL;
  const thumbnailTitle = frontMatter?.title || metadata?.title || 'Blog thumbnail';

  if (isBlogPostPage) {
    return (
      <BlogPostItemContainer className={clsx(containerClassName, className)}>
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />
      </BlogPostItemContainer>
    );
  }

  return (
    <BlogPostItemContainer
      className={clsx(containerClassName, className, 'blog-list-card', {
        'blog-list-card--with-thumb': Boolean(thumbnail),
        'blog-list-card--no-thumb': !thumbnail,
      })}>
      {thumbnail && (
        <Link className="blog-list-card__thumb" to={metadata.permalink}>
          <img src={thumbnail} alt={thumbnailTitle} loading="lazy" decoding="async" />
        </Link>
      )}

      <div className="blog-list-card__body">
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />
      </div>
    </BlogPostItemContainer>
  );
}
