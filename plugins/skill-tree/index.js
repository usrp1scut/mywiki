const {buildSkillTree} = require('./data');

module.exports = function skillTreePlugin() {
  return {
    name: 'skill-tree',
    async allContentLoaded({allContent, actions}) {
      const content = allContent['docusaurus-plugin-content-docs']?.default;
      const version = content?.loadedVersions.find((item) => item.versionName === 'current') ?? content?.loadedVersions[0];
      actions.setGlobalData(buildSkillTree(version?.docs));
    },
  };
};
