import React, {useMemo} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {usePluginData} from '@docusaurus/useGlobalData';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

// metadata.source looks like "@site/blog/2025-8-2.md" — pick the filename.
function sourceToFilename(source) {
  if (!source) return null;
  const parts = source.split(/[\\/]/);
  return parts[parts.length - 1] || null;
}

// djb2-style hash so thumbnail color stays stable across renders.
function hashString(input) {
  let h = 5381;
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

// Derive a deterministic gradient thumbnail from the post title so posts
// without inline images do not all share the same fallback picture.
function generateTitleThumbnail(title) {
  const safeTitle = (title || '·').trim();
  const hash = hashString(safeTitle);
  const hue = hash % 360;
  const hue2 = (hue + 48) % 360;
  const firstChar = Array.from(safeTitle)[0] || '·';
  const escapeXml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' preserveAspectRatio='xMidYMid slice'>
<defs>
<linearGradient id='g' x1='0%' y1='0%' x2='100%' y2='100%'>
<stop offset='0%' stop-color='hsl(${hue}, 45%, 48%)'/>
<stop offset='100%' stop-color='hsl(${hue2}, 55%, 28%)'/>
</linearGradient>
<radialGradient id='r' cx='30%' cy='25%' r='65%'>
<stop offset='0%' stop-color='rgba(255,255,255,0.18)'/>
<stop offset='100%' stop-color='rgba(255,255,255,0)'/>
</radialGradient>
</defs>
<rect width='400' height='300' fill='url(#g)'/>
<rect width='400' height='300' fill='url(#r)'/>
<text x='50%' y='58%' text-anchor='middle' font-family='Georgia, serif' font-size='160' font-weight='700' fill='rgba(255,255,255,0.9)'>${escapeXml(firstChar)}</text>
</svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export default function BlogPostItem({children, className}) {
  const {isBlogPostPage, assets, frontMatter, metadata} = useBlogPost();
  const containerClassName = !isBlogPostPage ? 'margin-bottom--xl' : undefined;

  const thumbnailsData = usePluginData('blog-thumbnails') || {};
  const thumbnailMap = thumbnailsData.thumbnails || {};

  const explicitThumbnail = assets?.image || frontMatter?.image;
  const filename = sourceToFilename(metadata?.source);
  const firstImageThumbnail = filename ? thumbnailMap[filename] : undefined;

  const fallbackThumbnail = useMemo(
    () => generateTitleThumbnail(frontMatter?.title || metadata?.title || filename || ''),
    [frontMatter?.title, metadata?.title, filename],
  );

  const thumbnail =
    explicitThumbnail || firstImageThumbnail || fallbackThumbnail;
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
