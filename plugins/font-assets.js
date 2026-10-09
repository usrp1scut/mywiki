// Keep even small unicode font slices out of the render-blocking stylesheet.
module.exports = function fontAssetsPlugin() {
  return {
    name: 'font-assets',
    configureWebpack(config) {
      for (const rule of config.module.rules) {
        if (rule.test instanceof RegExp && rule.test.test('.woff2')) {
          for (const loader of rule.use || []) {
            if (loader.options && loader.loader?.includes('url-loader')) loader.options.limit = 0;
          }
        }
      }
      return {};
    },
  };
};
