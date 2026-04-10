/**
 * Docusaurus plugin that reads blog markdown files and exposes
 * recent posts to global data for the homepage.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

module.exports = function recentBlogPostsPlugin(context) {
  const blogDir = path.resolve(context.siteDir, 'blog');

  return {
    name: 'recent-blog-posts',
    async loadContent() {
      if (!fs.existsSync(blogDir)) return {recentPosts: []};

      const files = fs.readdirSync(blogDir)
        .filter((f) => /^\d{4}-\d{1,2}-\d{1,2}/.test(f) && (f.endsWith('.md') || f.endsWith('.mdx')));

      // Parse dates and sort descending
      const parsed = files.map((file) => {
        const match = file.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
        const year = match[1];
        const month = match[2];
        const day = match[3];
        const sortKey = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        return {file, year, month, day, sortKey};
      });
      parsed.sort((a, b) => b.sortKey.localeCompare(a.sortKey));

      const recent = parsed.slice(0, 3);
      const posts = recent.map(({file, year, month, day}) => {
        const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const {data} = matter(raw);
        return {
          title: data.title || file,
          description: data.description || '',
          permalink: `/blog/${year}/${month}/${day}`,
        };
      });

      return {recentPosts: posts};
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
