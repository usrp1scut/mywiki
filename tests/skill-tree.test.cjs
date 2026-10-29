const {test} = require('node:test');
const assert = require('node:assert/strict');
const {buildSkillTree} = require('../plugins/skill-tree/data');

const note = (source, extra = {}) => ({source: `@site/docs/${source}`, title: source, permalink: `/docs/${source}`, ...extra});
const skillsOf = (tree) => Object.fromEntries(tree.branches.flatMap((branch) => branch.skills).map((skill) => [skill.id, skill.notes]));

test('shared directories assign security, network and observability notes once', () => {
  const tree = buildSkillTree([
    note('01-Linux/18-sudo权限分配与管理.md'),
    note('01-Linux/04-配置dnsmasq作为内网DNS.md'),
    note('01-Linux/22-Linux进程调度与系统状态.md'),
    note('03-容器/12-EKS一体化可观测平台.md'),
    note('03-容器/02-Kubernetes/k8sHA.md'),
  ]);
  const skills = skillsOf(tree);
  assert.equal(tree.noteCount, 5);
  assert.equal(tree.skillCount, 5);
  for (const id of ['security', 'dns-vpn', 'linux', 'observability', 'kubernetes']) assert.equal(skills[id].length, 1);
  assert.equal(tree.branches[0].skills[0].id, 'linux');
});

test('drafts, unlisted notes, navigation pages and unrelated subjects stay out', () => {
  const tree = buildSkillTree([
    note('01-Linux/draft.md', {draft: true}),
    note('01-Linux/private.md', {unlisted: true}),
    note('07-Terraform/00-Home.md'),
    note('00-写作模板.md'),
    note('其他/CFA/01-概念.md'),
  ]);
  assert.equal(tree.noteCount, 0);
  assert.equal(tree.skillCount, 0);
});

test('compiled permalinks and titles survive custom slugs, base URLs and duplicate input', () => {
  const doc = note('01-Linux/22-Linux进程调度与系统状态.md', {title: 'Linux 进程调度与系统状态', permalink: '/wiki/docs/linux-process-scheduling'});
  const tree = buildSkillTree([doc, doc]);
  assert.equal(tree.noteCount, 1);
  assert.deepEqual(skillsOf(tree).linux, [{title: doc.title, permalink: doc.permalink}]);
});

test('an empty knowledge base retains empty branches without inventing progress', () => {
  const tree = buildSkillTree();
  assert.equal(tree.branches.length, 6);
  assert.equal(tree.skillCount, 0);
  assert.equal(tree.noteCount, 0);
});
