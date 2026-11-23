export const tools = [
  {id: 'json', title: 'JSON 格式化', group: '格式与编码', description: '格式化、压缩与校验 JSON，保留原始数字精度。', keywords: 'json format minify 校验 压缩 美化'},
  {id: 'base64', title: 'Base64 编解码', group: '格式与编码', description: '转换 UTF-8 文本，支持中文与 URL 安全格式。', keywords: 'base64 encode decode 编码 解码 中文'},
  {id: 'url', title: 'URL 编解码', group: '格式与编码', description: '编码参数值或完整 URL，处理百分号转义。', keywords: 'url uri encode decode percent 参数 百分号'},
  {id: 'timestamp', title: '时间戳转换', group: '时间与计划', description: '在 Unix 时间戳与日期之间转换，明确秒、毫秒和时区。', keywords: 'unix epoch timestamp 时间戳 日期 时区 秒 毫秒'},
  {id: 'cron', title: 'Cron 解析与生成', group: '时间与计划', description: '通过周期生成表达式，查看指定时区的未来执行时间。', keywords: 'cron crontab schedule 定时 调度'},
  {id: 'hash', title: '文本与文件哈希', group: '生成与校验', description: '计算文本或文件摘要，支持 MD5、SHA-1、SHA-256 与 SHA-512。', keywords: 'hash md5 sha1 sha256 sha512 摘要 校验 文件'},
  {id: 'uuid', title: 'UUID 生成', group: '生成与校验', description: '使用安全随机数，批量生成 UUID v4。', keywords: 'uuid guid 随机 标识符'},
  {id: 'password', title: '密码生成', group: '生成与校验', description: '选择字符类型与长度，生成随机密码。', keywords: 'password random token 密码 随机 口令'},
  {id: 'regex', title: '正则测试', group: '生成与校验', description: '测试 JavaScript 正则表达式，查看匹配位置和捕获组。', keywords: 'regex regexp regular expression 正则 匹配'},
  {id: 'subnet', title: 'IPv4 子网计算', group: '网络', description: '根据 IPv4/CIDR 计算网段、掩码与可用地址范围。', keywords: 'ipv4 ip cidr subnet mask 网络 子网 掩码 广播'},
  {id: 'yaml', title: 'YAML / JSON 转换', group: '格式与编码', description: '转换、格式化与校验 YAML，保留大整数原值。', keywords: 'yaml yml json kubernetes k8s 配置 转换 校验'},
  {id: 'diff', title: '文本 / JSON 对比', group: '格式与编码', description: '对比两份文本或配置，查看新增与删除的内容。', keywords: 'diff compare 差异 对比 配置'},
  {id: 'jwt', title: 'JWT 解析', group: '生成与校验', description: '本地查看 Header、Payload 与时间声明；仅解码，未验证签名。', keywords: 'jwt token bearer 令牌 解码 过期'},
  {id: 'docker', title: 'Docker → Compose', group: '运维配置', description: '将 docker run 命令转换为 Compose 配置。', keywords: 'docker compose run 容器 配置 命令 转换'},
  {id: 'chmod', title: 'chmod / umask', group: '运维配置', description: '在数字、符号和勾选权限之间转换，计算 umask。', keywords: 'chmod umask linux permission 权限 rwx suid sgid sticky'},
  {id: 'certificate', title: '证书解析', group: '生成与校验', description: '读取 PEM / DER 证书，查看域名、有效期和 SHA-256 指纹。', keywords: 'pem crt cer der ssl tls x509 certificate 证书 域名 指纹'},
  {id: 'ip', title: 'IP 范围与网段', group: '网络', description: '支持 IPv4 / IPv6、范围转 CIDR，以及网段包含和重叠判断。', keywords: 'ip ipv4 ipv6 cidr range subnet 网络 网段 范围 重叠'},
  {id: 'qrcode', title: '二维码', group: '格式与编码', description: '生成文本、链接或 Wi-Fi 二维码，识别本地图片。', keywords: 'qr qrcode wifi 二维码 图片 扫码'},
  {id: 'dns', title: 'DNS 查询', group: '网络', description: '通过公开 DNS over HTTPS 服务查询域名记录。', keywords: 'dns doh 域名 解析 mx txt cname aaaa', online: true},
  {id: 'public-ip', title: '公网 IP 查询', group: '网络', description: '通过 ipify 查看当前网络的 IPv4 或 IPv6 出口地址。', keywords: 'public ip ipv4 ipv6 公网 出口 代理', online: true},
];

export const relatedDocs = {
  docker: [{title: 'Docker 常用配置', to: '/docs/容器/docker常用配置'}],
  yaml: [{title: 'Kubernetes Pod 基础', to: '/docs/容器/Kubernetes/pod基础'}],
  chmod: [{title: '文件特殊权限与 umask', to: '/docs/Linux/文件特殊权限与umask'}],
  dns: [{title: 'dnsmasq 内网 DNS 配置', to: '/docs/Linux/配置dnsmasq作为内网DNS'}],
  certificate: [{title: 'Nginx HTTPS 配置', to: '/docs/Nginx/nginx常用配置'}],
  ip: [{title: '子网划分', to: '/docs/网络/子网划分'}],
  subnet: [{title: '子网划分', to: '/docs/网络/子网划分'}],
};

export function sanitizeFavorites(value) {
  return Array.isArray(value) ? [...new Set(value.filter(id => tools.some(tool => tool.id === id)))] : [];
}

export function searchTools(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return tools.filter(tool => terms.every(term => `${tool.title} ${tool.description} ${tool.keywords}`.toLowerCase().includes(term)));
}
