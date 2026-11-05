---
title: "JSONPath 速查"
description: "JSONPath 用路径表达式选择 JSON 中的值。RFC 9535 定义了标准语法，但不少旧库和 kubectl 使用自己的变体，表达式应在实际实现中验证。"
tags: [速查, 开发]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/jsonpath-memo/jsonpath.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

JSONPath 用路径表达式选择 JSON 中的值。RFC 9535 定义了标准语法，但不少旧库和 kubectl 使用自己的变体，表达式应在实际实现中验证。

## 基本路径

| 表达式 | 含义 |
| --- | --- |
| `$` | 文档根 |
| `$.service.name` | 对象字段 |
| `$['service']['name']` | 同一查询的括号写法 |
| `$['a-b']` | 名称含特殊字符的字段 |
| `$.items[0]` / `$.items[-1]` | 第一个 / 最后一个元素 |
| `$.items[*]` | 所有元素 |
| `$.items[1:3]` | 下标 1 到 2 |
| `$.items[0,2]` | 选择指定下标 |
| `$..name` | 递归查找名为 name 的成员 |
| `@` | 过滤表达式中的当前候选值 |

## 过滤示例

```json
{
  "items": [
    {"name": "api", "port": 8080, "enabled": true},
    {"name": "worker", "port": 9090, "enabled": false}
  ]
}
```

| 表达式 | 匹配结果中的值 |
| --- | --- |
| `$.items[*].name` | `api`、`worker` |
| `$.items[?(@.enabled == true)].name` | `api` |
| `$.items[?(@.port >= 9000)].name` | `worker` |
| `$.items[?(@.port)]` | 两个对象，因为都存在 port 成员 |
| `$.items[?(@.enabled == true && @.port == 8080)].name` | `api` |

存在性测试不等于真值测试：`[?(@.enabled)]` 选择有这个成员的对象，即使值是 `false`。返回值可能是节点列表、值数组或带路径的记录，取决于调用接口。

## 标准与实现差异

[RFC 9535](https://www.rfc-editor.org/rfc/rfc9535.html)提供 `length()`、`count()`、`match()`、`search()`、`value()` 等过滤函数。`=~ /regex/`、路径末尾的 `.sum()` 等写法属于某些实现的扩展，不能作为标准通用语法。

需要构造新对象、聚合或输出 CSV 时可用 [jq](./jq速查.md)。JSONPath 主要用于选择，不要把 JMESPath 的对象投影语法混入其中。

## kubectl 中的 JSONPath

```bash
kubectl get pods -o jsonpath='{.items[*].metadata.name}'
kubectl get pods -o jsonpath='{range .items[*]}{.metadata.name}{"\n"}{end}'
```

kubectl 允许省略根标记，并提供 `range/end` 模板结构；这不是 RFC 9535 的通用语法。需要跨工具迁移时参考目标库文档。[kubectl 速查](../03-容器/02-Kubernetes/05-kubectl速查.md)提供其他输出方法。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/jsonpath-memo/jsonpath.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/09-Dev/JSONPath速查.md)可用于修改和再分发。

原文另注明作者 [mackoj](https://gist.github.com/mackoj/5786f8b95da0a82e8e003f444c4295bf)。

[返回开发运维速查目录](../00-开发运维速查.md)
