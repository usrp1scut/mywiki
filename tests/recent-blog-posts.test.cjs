const test = require('node:test');
const assert = require('node:assert/strict');
const {buildRecentPosts} = require('../plugins/recent-blog-posts');

const post = (title, permalink, date, extra = {}) => ({
  metadata: {
    title,
    permalink,
    date,
    description: extra.description ?? `${title} 简介`,
    unlisted: extra.unlisted ?? false,
    frontMatter: extra.frontMatter ?? {},
    tags: extra.tags ?? [],
  },
});

test('uses compiled permalinks including filename suffixes and custom slugs', () => {
  const result = buildRecentPosts({
    default: {
      blogPosts: [
        post('GitOps 实践', '/blog/2026/04/26/gitea-actions-gitops', '2026-04-26T00:00:00.000Z', {
          tags: [{label: 'GitOps'}, {label: 'ArgoCD'}],
        }),
        post('入侵取证复盘', '/blog/2026/10/19', '2026-10-19T00:00:00.000Z'),
      ],
    },
    weekly: {
      blogPosts: [
        post('周报 11-22', '/weekly/2026/11/22', '2026-11-22T00:00:00.000Z'),
        post('周报 11-15', '/weekly/2026/11/15', '2026-11-15T00:00:00.000Z'),
      ],
    },
  });

  assert.equal(result.featuredPosts.length, 2);
  assert.equal(result.featuredPosts[0].permalink, '/blog/2026/10/19');
  assert.equal(result.featuredPosts[1].permalink, '/blog/2026/04/26/gitea-actions-gitops');
  assert.deepEqual(result.featuredPosts[1].tags, ['GitOps', 'ArgoCD']);
  assert.equal(result.recentWeekly[0].permalink, '/weekly/2026/11/22');
});

test('filters out unlisted and draft posts and strips placeholder descriptions', () => {
  const result = buildRecentPosts({
    default: {
      blogPosts: [
        post('公开文章', '/blog/2026/01/10', '2026-01-10', {description: 'none'}),
        post('归档日志', '/blog/2022/10/16', '2022-10-16', {unlisted: true}),
        post('草稿', '/blog/2026/12/01', '2026-12-01', {frontMatter: {draft: true}}),
      ],
    },
  });

  assert.equal(result.featuredPosts.length, 1);
  assert.equal(result.featuredPosts[0].title, '公开文章');
  assert.equal(result.featuredPosts[0].description, '');
});
