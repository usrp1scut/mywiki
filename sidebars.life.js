/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  lifeSidebar: [
    'overview',
    ...require('./life/_meta/import-report.json').chapters.map(({source}) =>
      `chapters/chapter-${source.split('/').pop().slice(0, 2)}`),
    'import-notes',
  ],
};
