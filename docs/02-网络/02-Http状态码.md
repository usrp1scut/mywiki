# HTTP 状态码速查表

## 状态码分类

| 状态码范围 | 类别 | 描述 |
|------------|------|------|
| 1xx | Informational（信息性） | 请求已接收，继续处理 |
| 2xx | Success（成功） | 请求成功处理 |
| 3xx | Redirection（重定向） | 需要进一步操作以完成请求 |
| 4xx | Client Error（客户端错误） | 客户端请求有错误 |
| 5xx | Server Error（服务器错误） | 服务器处理请求失败 |

## 常用 HTTP 状态码详解

### 1xx 信息性状态码

| 状态码 | 名称 | 描述 | 使用场景 |
|--------|------|------|----------|
| **100** | Continue | 客户端应继续发送请求 | 大文件上传前确认 |
| **101** | Switching Protocols | 服务器同意切换协议 | WebSocket 升级 |
| **102** | Processing | 服务器正在处理请求 | WebDAV 扩展操作 |
| **103** | Early Hints | 预加载提示 | 服务器提前返回部分头信息 |

### 2xx 成功状态码

| 状态码 | 名称 | 描述 | 使用场景 |
|--------|------|------|----------|
| **200** | OK | 请求成功 | 正常页面访问 |
| **201** | Created | 资源创建成功 | POST 创建新资源 |
| **202** | Accepted | 请求已接受但未处理完成 | 异步任务提交 |
| **203** | Non-Authoritative Information | 非权威信息 | 代理修改了响应 |
| **204** | No Content | 无内容返回 | 删除操作成功 |
| **205** | Reset Content | 重置内容 | 表单提交后清空 |
| **206** | Partial Content | 部分内容 | 断点续传、分片下载 |
| **207** | Multi-Status | 多状态响应 | WebDAV 多个操作结果 |
| **208** | Already Reported | 已报告 | WebDAV 绑定成员已报告 |
| **226** | IM Used | 实例操作已应用 | Delta encoding in HTTP |

### 3xx 重定向状态码

| 状态码 | 名称 | 描述 | 使用场景 |
|--------|------|------|----------|
| **300** | Multiple Choices | 多种选择 | 多个资源可用 |
| **301** | Moved Permanently | 永久重定向 | 网站改版、域名变更 |
| **302** | Found | 临时重定向 | 临时页面跳转 |
| **303** | See Other | 查看其他位置 | POST 后重定向到 GET |
| **304** | Not Modified | 未修改 | 缓存有效 |
| **305** | Use Proxy | 使用代理 | 必须通过代理访问 |
| **307** | Temporary Redirect | 临时重定向 | 保持请求方法不变 |
| **308** | Permanent Redirect | 永久重定向 | 保持请求方法不变 |

### 4xx 客户端错误状态码

| 状态码 | 名称 | 描述 | 使用场景 |
|--------|------|------|----------|
| **400** | Bad Request | 错误请求 | 请求语法错误 |
| **401** | Unauthorized | 未授权 | 需要身份验证 |
| **402** | Payment Required | 需要付款 | 保留状态码 |
| **403** | Forbidden | 禁止访问 | 无权限访问资源 |
| **404** | Not Found | 未找到 | 资源不存在 |
| **405** | Method Not Allowed | 方法不允许 | 请求方法不支持 |
| **406** | Not Acceptable | 不可接受 | 无法满足 Accept 头 |
| **407** | Proxy Authentication Required | 需要代理认证 | 代理服务器需要认证 |
| **408** | Request Timeout | 请求超时 | 服务器等待请求超时 |
| **409** | Conflict | 冲突 | 资源状态冲突 |
| **410** | Gone | 已删除 | 资源永久删除 |
| **411** | Length Required | 需要长度 | 需要 Content-Length |
| **412** | Precondition Failed | 先决条件失败 | If-Match 等条件失败 |
| **413** | Payload Too Large | 负载过大 | 请求体过大 |
| **414** | URI Too Long | URI过长 | 请求URI过长 |
| **415** | Unsupported Media Type | 不支持的媒体类型 | Content-Type 不支持 |
| **416** | Range Not Satisfiable | 范围不符合要求 | 请求范围无效 |
| **417** | Expectation Failed | 期望失败 | Expect 头无法满足 |
| **418** | I'm a teapot | 我是茶壶 | 愚人节玩笑 |
| **421** | Misdirected Request | 错误定向请求 | 服务器无法产生响应 |
| **422** | Unprocessable Entity | 不可处理的实体 | WebDAV 语义错误 |
| **423** | Locked | 已锁定 | WebDAV 资源锁定 |
| **424** | Failed Dependency | 依赖失败 | WebDAV 依赖操作失败 |
| **425** | Too Early | 太早 | 重复请求风险 |
| **426** | Upgrade Required | 需要升级 | 需要更高版本协议 |
| **428** | Precondition Required | 需要先决条件 | 需要条件请求 |
| **429** | Too Many Requests | 请求过多 | 速率限制 |
| **431** | Request Header Fields Too Large | 请求头字段太大 | 请求头过大 |
| **451** | Unavailable For Legal Reasons | 因法律原因不可用 | 法律审查 |

### 5xx 服务器错误状态码

| 状态码 | 名称 | 描述 | 使用场景 |
|--------|------|------|----------|
| **500** | Internal Server Error | 服务器内部错误 | 服务器代码错误 |
| **501** | Not Implemented | 未实现 | 请求方法未实现 |
| **502** | Bad Gateway | 错误网关 | 上游服务器无效响应 |
| **503** | Service Unavailable | 服务不可用 | 服务器过载或维护 |
| **504** | Gateway Timeout | 网关超时 | 上游服务器响应超时 |
| **505** | HTTP Version Not Supported | HTTP版本不支持 | 不支持的HTTP版本 |
| **506** | Variant Also Negotiates | 变体协商 | 透明内容协商错误 |
| **507** | Insufficient Storage | 存储空间不足 | WebDAV 磁盘空间不足 |
| **508** | Loop Detected | 检测到循环 | WebDAV 无限循环 |
| **510** | Not Extended | 未扩展 | 需要扩展请求 |
| **511** | Network Authentication Required | 需要网络认证 | 需要网络访问认证 |

## 常用状态码速查

| 状态码 | 名称 | 频率 | 处理建议 |
|--------|------|------|----------|
| **200** | OK | ⭐⭐⭐⭐⭐ | 正常处理 |
| **301** | Moved Permanently | ⭐⭐⭐⭐ | 更新书签和链接 |
| **302** | Found | ⭐⭐⭐⭐ | 临时跳转 |
| **304** | Not Modified | ⭐⭐⭐⭐ | 使用缓存 |
| **400** | Bad Request | ⭐⭐⭐⭐ | 检查请求格式 |
| **401** | Unauthorized | ⭐⭐⭐ | 提供认证信息 |
| **403** | Forbidden | ⭐⭐⭐ | 检查权限 |
| **404** | Not Found | ⭐⭐⭐⭐⭐ | 检查URL或重定向 |
| **500** | Internal Server Error | ⭐⭐⭐⭐ | 服务器端排查 |
| **502** | Bad Gateway | ⭐⭐⭐ | 检查上游服务 |
| **503** | Service Unavailable | ⭐⭐⭐ | 重试或等待恢复 |
| **504** | Gateway Timeout | ⭐⭐ | 检查网络或服务超时 |

## 开发调试技巧

```bash
# 使用 curl 查看状态码
curl -s -o /dev/null -w "%{http_code}" https://example.com

# 查看详细响应头
curl -I https://example.com

# 测试重定向
curl -L https://example.com

# 自定义请求方法
curl -X POST https://api.example.com

# 带认证的请求
curl -u username:password https://api.example.com
```

## 监控建议

1. **重点关注**：4xx 和 5xx 状态码比例
2. **告警设置**：5xx 状态码突然增加
3. **性能指标**：响应时间与状态码关联分析
4. **用户体验**：404 页面优化和重定向配置

## 最佳实践

1. **正确使用重定向**：
   - 永久移动使用 301
   - 临时移动使用 302 或 307
   - POST 后重定向使用 303

2. **错误处理**：
   - 提供有意义的错误页面
   - 记录详细的错误日志
   - 返回机器可读的错误信息

3. **缓存控制**：
   - 正确使用 304 状态码
   - 设置合适的缓存头

> 💡 **提示**：完整的 HTTP 状态码列表请参考 [IANA HTTP Status Code Registry](https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml)