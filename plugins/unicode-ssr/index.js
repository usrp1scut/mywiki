const path = require('node:path');
const {NormalModuleReplacementPlugin} = require('webpack');

// React 18's Node stream renderer can insert NUL bytes at UTF-8 boundaries,
// corrupting Chinese links and anchors. Replace only Docusaurus's SSG renderer.
// Revisit when upgrading React/Docusaurus: https://github.com/react/react/issues/31134
module.exports = function unicodeSsrPlugin() {
  const clientDir = path.dirname(
    require.resolve('@docusaurus/core/lib/client/serverEntry.js'),
  );

  return {
    name: 'unicode-ssr',
    configureWebpack(_config, isServer) {
      if (!isServer) return {};

      return {
        plugins: [
          new NormalModuleReplacementPlugin(/^\.\/renderToHtml(?:\.js)?$/, resource => {
            if (resource.context === clientDir) {
              resource.request = path.join(__dirname, 'renderToHtml.mjs');
            }
          }),
        ],
      };
    },
  };
};
