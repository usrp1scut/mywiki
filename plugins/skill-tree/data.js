// Match source paths, but keep titles and URLs from Docusaurus's compiled metadata.
// The first matching skill owns a note, so totals never double count it.
const branches = [
  {
    id: 'systems', title: '系统根基', icon: 'terminal',
    skills: [
      {id: 'security', title: '安全与审计', summary: '权限分配、文件审计与主机异常排查。', hint: '权限 · 审计', match: /^01-Linux\/.*(?:sudo|特殊权限|audit|挖矿)/},
      {id: 'linux', title: 'Linux', summary: '从 Shell、进程与内核，到磁盘管理和系统调优。', hint: '内核 · 进程', match: /^01-Linux\/(?!.*(?:dnsmasq|L2tp))/},
      {id: 'windows', title: 'Windows', summary: 'Windows Server、远程桌面、域服务与批处理。', hint: '域服务 · 远程管理', match: /^01-Windows\//},
    ],
  },
  {
    id: 'network', title: '网络服务', icon: 'network',
    skills: [
      {id: 'networking', title: '网络基础', summary: '子网划分、协议分层、路由与端口诊断。', hint: '协议 · 路由', match: /^02-网络\//},
      {id: 'dns-vpn', title: 'DNS / VPN', summary: '内网 DNS 解析与 VPN 服务搭建。', hint: '解析 · 互联', match: /^01-Linux\/.*(?:dnsmasq|L2tp)/},
      {id: 'nginx', title: 'Nginx', summary: '反向代理、缓存、流量限制与访问控制。', hint: '代理 · 流量管理', match: /^04-Nginx\//},
    ],
  },
  {
    id: 'cloud', title: '云原生', icon: 'cluster',
    skills: [
      {id: 'docker', title: 'Docker', summary: '容器运行环境、镜像代理与资源视图适配。', hint: '容器 · 运行时', match: /^03-容器\/.*(?:docker|LXCFS)/i},
      {id: 'kubernetes', title: 'Kubernetes', summary: '从 Pod 与调度，到高可用集群搭建和资源问题排查。', hint: '编排 · 高可用', match: /^03-容器\/02-Kubernetes\//},
      {id: 'istio', title: 'Istio', summary: '服务网格中的流量治理、熔断、故障注入与安全。', hint: '网格 · 服务治理', match: /^03-容器\/06-Istio\//},
    ],
  },
  {
    id: 'data', title: '数据与存储', icon: 'database',
    skills: [
      {id: 'mysql', title: 'MySQL', summary: 'SQL 查询、事务隔离、权限管理与备份恢复。', hint: '查询 · 事务', match: /^08-数据库\/(?:02-MySQL\/|05-事务隔离级别)/},
      {id: 'oracle', title: 'Oracle', summary: '表空间、会话与锁排查，以及 RMAN 和数据泵备份。', hint: '排障 · 备份', match: /^08-数据库\/01-Oracle\//},
      {id: 'redis', title: 'Redis', summary: 'Redis 数据类型与常用命令速查。', hint: '缓存 · 数据类型', match: /^08-数据库\/04-Redis\//},
      {id: 'ceph', title: 'Ceph', summary: '分布式存储集群、存储池、块设备与 CephFS。', hint: '分布式存储', match: /^06-Ceph\//},
    ],
  },
  {
    id: 'delivery', title: '自动化交付', icon: 'workflow',
    skills: [
      {id: 'gitlab', title: 'Git / GitLab', summary: '版本管理、GitLab 部署、迁移升级与认证配置。', hint: '版本 · 协作', match: /^05-Gitlab\//},
      {id: 'ansible', title: 'Ansible', summary: '用 Inventory、Playbook 与 Role 组织自动化运维。', hint: '配置自动化', match: /^10-Ansible\//},
      {id: 'terraform', title: 'Terraform', summary: '通过代码定义和管理基础设施。', hint: '基础设施即代码', match: /^07-Terraform\//},
      {id: 'coding', title: 'Go / Python', summary: 'Go 语言学习、常用代码片段与 Python 工具脚本。', hint: '编程 · 工具脚本', match: /^09-Dev\//},
    ],
  },
  {
    id: 'platform', title: '平台与稳定性', icon: 'pulse',
    skills: [
      {id: 'openstack', title: 'OpenStack', summary: '私有云部署、节点服务与 KVM 虚拟机管理。', hint: '私有云 · 虚拟化', match: /^07-Openstack\//},
      {id: 'observability', title: '可观测性', summary: 'Loki 日志收集，以及 EKS 的指标、日志与链路追踪。', hint: '指标 · 日志 · 链路', match: /^03-容器\/.*(?:Loki|可观测)/},
      {id: 'sre', title: 'SRE', summary: 'SLI、SLO、错误预算与灾备目标的核心概念。', hint: '可靠性 · 服务目标', match: /^08-SRE\//},
    ],
  },
];

function buildSkillTree(docs = []) {
  const assigned = new Set();
  const availableDocs = docs.filter((doc) => !doc.draft && !doc.unlisted &&
    !/\/00-(?:Home|写作模板|零散文档索引)\.mdx?$/.test(doc.source));
  const tree = branches.map((branch) => ({
    id: branch.id,
    title: branch.title,
    icon: branch.icon,
    skills: branch.skills.map(({match, ...skill}) => ({
      ...skill,
      notes: availableDocs.filter((doc) => {
        if (assigned.has(doc.permalink) || !match.test(doc.source.replace(/^@site\/docs\//, ''))) return false;
        assigned.add(doc.permalink);
        return true;
      }).map((doc) => ({title: doc.title, permalink: doc.permalink}))
        .sort((a, b) => a.title.localeCompare(b.title, 'zh-CN', {numeric: true})),
    })),
  }));
  // Display foundational Linux before its specializations while matching security first.
  tree[0].skills.sort((a, b) => ['linux', 'windows', 'security'].indexOf(a.id) - ['linux', 'windows', 'security'].indexOf(b.id));
  return {
    branches: tree,
    noteCount: assigned.size,
    skillCount: tree.flatMap((branch) => branch.skills).filter((skill) => skill.notes.length > 0).length,
  };
}

module.exports = {buildSkillTree};
