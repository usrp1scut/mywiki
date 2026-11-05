export const tools = [
  {id: 'json', title: 'JSON 格式化', group: '格式与编码', description: '格式化、压缩与校验 JSON，保留原始数字精度。', keywords: 'json format minify 校验 压缩 美化'},
  {id: 'base64', title: 'Base64 编解码', group: '格式与编码', description: '转换 UTF-8 文本，支持中文与 URL 安全格式。', keywords: 'base64 encode decode 编码 解码 中文'},
  {id: 'url', title: 'URL 编解码', group: '格式与编码', description: '编码参数值或完整 URL，处理百分号转义。', keywords: 'url uri encode decode percent 参数 百分号'},
  {id: 'timestamp', title: '时间戳转换', group: '时间与计划', description: '在 Unix 时间戳与日期之间转换，明确秒、毫秒和时区。', keywords: 'unix epoch timestamp 时间戳 日期 时区 秒 毫秒'},
  {id: 'cron', title: 'Cron 解析', group: '时间与计划', description: '检查调度表达式，查看指定时区的未来执行时间。', keywords: 'cron crontab schedule 定时 调度'},
  {id: 'hash', title: '哈希计算', group: '生成与校验', description: '计算文本的 MD5、SHA-1、SHA-256 或 SHA-512 摘要。', keywords: 'hash md5 sha1 sha256 sha512 摘要 校验'},
  {id: 'uuid', title: 'UUID 生成', group: '生成与校验', description: '使用安全随机数，批量生成 UUID v4。', keywords: 'uuid guid 随机 标识符'},
  {id: 'password', title: '密码生成', group: '生成与校验', description: '选择字符类型与长度，生成随机密码。', keywords: 'password random token 密码 随机 口令'},
  {id: 'regex', title: '正则测试', group: '生成与校验', description: '测试 JavaScript 正则表达式，查看匹配位置和捕获组。', keywords: 'regex regexp regular expression 正则 匹配'},
  {id: 'subnet', title: 'IPv4 子网计算', group: '网络', description: '根据 IPv4/CIDR 计算网段、掩码与可用地址范围。', keywords: 'ipv4 ip cidr subnet mask 网络 子网 掩码 广播'},
];

export function searchTools(query) {
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return tools.filter(tool => terms.every(term => `${tool.title} ${tool.description} ${tool.keywords}`.toLowerCase().includes(term)));
}
