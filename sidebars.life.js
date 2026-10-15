/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
module.exports = {
  lifeSidebar: [
    'overview',
    ...Array.from({length: 34}, (_, i) => `chapters/chapter-${String(i + 1).padStart(2, '0')}`),
    'import-notes',
  ],
};
