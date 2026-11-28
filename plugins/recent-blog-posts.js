/**
 * Docusaurus plugin that reads compiled blog metadata from all blog instances
 * and exposes featured engineering posts and recent weekly digests to global data.
 */
function normalizeDescription(description) {
  const value = typeof description === 'string' ? description.trim() : '';
  return value && !/^(none|null)$/i.test(value) ? value : '';
}

function formatDate(dateValue) {
  if (!dateValue) return '';
  if (typeof dateValue === 'string') return dateValue.slice(0, 10);
  if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
    return dateValue.toISOString().slice(0, 10);
  }
  return '';
}

function selectPosts(blogPosts = [], limit = 6) {
  return blogPosts
    .map((post) => post?.metadata)
    .filter((meta) => meta && !meta.unlisted && !meta.frontMatter?.draft)
    .sort((a, b) => formatDate(b.date).localeCompare(formatDate(a.date)))
    .slice(0, limit)
    .map((meta) => ({
      title: meta.title,
      description: normalizeDescription(meta.description),
      permalink: meta.permalink,
      date: formatDate(meta.date),
      tags: (meta.tags ?? []).slice(0, 3).map((tag) => tag.label),
    }));
}

function buildRecentPosts(blogPluginContent = {}) {
  const defaultPosts = blogPluginContent?.default?.blogPosts ?? [];
  const weeklyPosts = blogPluginContent?.weekly?.blogPosts ?? [];
  const featuredPosts = selectPosts(defaultPosts, 6);
  const recentWeekly = selectPosts(weeklyPosts, 3);
  return {
    featuredPosts,
    recentWeekly,
    recentPosts: featuredPosts.slice(0, 3),
  };
}

function recentBlogPostsPlugin() {
  return {
    name: 'recent-blog-posts',
    async allContentLoaded({allContent, actions}) {
      const blogPluginContent = allContent['docusaurus-plugin-content-blog'];
      actions.setGlobalData(buildRecentPosts(blogPluginContent));
    },
  };
}

recentBlogPostsPlugin.buildRecentPosts = buildRecentPosts;
recentBlogPostsPlugin.selectPosts = selectPosts;

module.exports = recentBlogPostsPlugin;
