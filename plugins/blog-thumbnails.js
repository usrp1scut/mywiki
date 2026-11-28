/**
 * Docusaurus plugin that scans blog and weekly markdown files and extracts
 * the first image reference and opening paragraph from each. List pages can
 * show real images and plain excerpts without rendering hidden MDX controls.
 */
const fs = require('fs');
const path = require('path');
const matter = require('@11ty/gray-matter');

const MD_IMAGE_RE = /!\[[^\]]*\]\(\s*([^)\s]+)(?:\s+"[^"]*")?\s*\)/;
const HTML_IMG_RE = /<img[^>]+src=["']([^"']+)["']/i;
const CONTENT_DIRS = ['blog', 'weekly'];

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
  return {
    name: 'blog-thumbnails',
    async loadContent() {
      const thumbnails = {};
      const summaries = {};

      for (const dirName of CONTENT_DIRS) {
        const dirPath = path.resolve(context.siteDir, dirName);
        if (!fs.existsSync(dirPath)) continue;

        const files = fs.readdirSync(dirPath).filter(
          (f) => f.endsWith('.md') || f.endsWith('.mdx'),
        );

        for (const file of files) {
          const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
          const {data, content: body} = matter(raw);
          const relKey = `${dirName}/${file}`;
          const summary = extractSummary(body);
          summaries[relKey] = summary;
          if (!(file in summaries)) summaries[file] = summary;

          const image = data.image || extractFirstImage(body);
          if (image) {
            thumbnails[relKey] = image;
            if (!(file in thumbnails)) thumbnails[file] = image;
          }
        }
      }

      return {thumbnails, summaries};
    },
    async contentLoaded({content, actions}) {
      actions.setGlobalData(content);
    },
  };
};
