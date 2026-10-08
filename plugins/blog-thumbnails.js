/**
 * Docusaurus plugin that scans blog markdown files and extracts the first
 * image reference and opening paragraph from each. List pages can show
 * real images and plain excerpts without rendering hidden MDX controls.
 */
const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Match markdown image: ![alt](url)  — also tolerates surrounding whitespace.
const MD_IMAGE_RE = /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/;
// Match HTML <img src="...">
const HTML_IMG_RE = /<img[^>]+src=["']([^"']+)["']/i;

function extractFirstImage(body) {
  const md = body.match(MD_IMAGE_RE);
  if (md) return md[1];
  const html = body.match(HTML_IMG_RE);
  if (html) return html[1];
  return null;
}

function extractSummary(body) {
  const opening = body.split(/<!--\s*(?:truncate|more)\s*-->/i)[0]
    .replace(/```[\s\S]*?```/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/^\s*#{1,6}\s+.*$/gm, '')
    .replace(/^\s*>\s?/gm, '');
  const paragraph = opening.split(/\n\s*\n/).find(part => part.trim()) || '';
  return paragraph.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim();
}

module.exports = function blogThumbnailsPlugin(context) {
  const blogDir = path.resolve(context.siteDir, 'blog');

  return {
    name: 'blog-thumbnails',
    async loadContent() {
      if (!fs.existsSync(blogDir)) return {thumbnails: {}, summaries: {}};

      const files = fs.readdirSync(blogDir).filter(
        (f) => f.endsWith('.md') || f.endsWith('.mdx'),
      );

      const thumbnails = {};
      const summaries = {};
      for (const file of files) {
        const raw = fs.readFileSync(path.join(blogDir, file), 'utf-8');
        const {data, content: body} = matter(raw);
        summaries[file] = extractSummary(body);
        // Respect explicit frontmatter image
        if (data.image) {
          thumbnails[file] = data.image;
          continue;
        }
        const firstImage = extractFirstImage(body);
        if (firstImage) thumbnails[file] = firstImage;
      }

      return {thumbnails, summaries};
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
