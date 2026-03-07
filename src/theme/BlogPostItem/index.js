import React, {useEffect, useRef, useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

export default function BlogPostItem({children, className}) {
  const {isBlogPostPage, assets, frontMatter, metadata} = useBlogPost();
  const containerClassName = !isBlogPostPage ? 'margin-bottom--xl' : undefined;

  const bodyRef = useRef(null);
  const [detectedThumbnail, setDetectedThumbnail] = useState(undefined);

  const explicitThumbnail = assets?.image || frontMatter?.image;
  const fallbackThumbnail = '/img/sunrise.jpeg';

  useEffect(() => {
    if (isBlogPostPage || explicitThumbnail) {
      setDetectedThumbnail(undefined);
      return;
    }

    const firstImage = bodyRef.current?.querySelector('.markdown img');
    const src = firstImage?.getAttribute('src')?.trim();
    setDetectedThumbnail(src || undefined);
  }, [isBlogPostPage, explicitThumbnail, metadata?.permalink]);

  const thumbnail = explicitThumbnail || detectedThumbnail || fallbackThumbnail;
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

      <div ref={bodyRef} className="blog-list-card__body">
        <BlogPostItemHeader />
        <BlogPostItemContent>{children}</BlogPostItemContent>
        <BlogPostItemFooter />
      </div>
    </BlogPostItemContainer>
  );
}
