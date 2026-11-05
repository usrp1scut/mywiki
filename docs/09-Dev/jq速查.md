---
title: "jq 速查"
description: "jq 在命令行中读取、筛选和重组 JSON。下面的过滤表达式放在单引号中，避免被 shell 提前展开；PowerShell 等环境需按自身引用规则调整。"
tags: [速查, 开发]
updated: "2026-11-05"
license: GPL-3.0
source: https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/jq-memo/jq.md
source_commit: e7758934a80ea454497a857720db311ab152cf07
---

jq 在命令行中读取、筛选和重组 JSON。下面的过滤表达式放在单引号中，避免被 shell 提前展开；PowerShell 等环境需按自身引用规则调整。

## 输入与输出

```bash
jq . data.json                    # 格式化
jq -c . data.json                 # 每个输出值压成一行
jq -S . data.json                 # 对象键排序
jq -r '.name' data.json           # 字符串去掉 JSON 引号
jq -s . events.ndjson             # 多个 JSON 输入合成数组
jq -R -s . input.txt              # 整个文本作为一个字符串
jq -n '{service: "wiki", port: 8080}'
```

`-r` 不代表把任意 JSON 转成 CSV，只改变字符串输出。`jq . file > file` 会先截断源文件，应输出到新文件后再替换。

## 取值与遍历

| 表达式 | 含义 |
| --- | --- |
| `.name` | 对象字段 |
| `.["a-b"]` | 带特殊字符的键 |
| `.items[0]` / `.items[-1]` | 首个 / 末个元素 |
| `.items[1:3]` | 下标 1 到 2，右边界不包含 |
| `.items[]` | 把数组元素逐个输出 |
| `.items[]?` | 可选遍历，无法遍历时不报错 |
| `keys` / `length` / `type` | 键列表 / 长度 / 类型 |
| `.nickname // .name` | 左侧为 `null` 或 `false` 时取右侧 |

## 过滤与重新组装

```bash
jq '.items[] | select(.enabled == true)' data.json
jq '[.items[] | select(.price < 100) | {id, name}]' data.json
jq '.items | map(.name)' data.json
jq '.items | sort_by(.price)' data.json
jq '.items | unique_by(.id)' data.json
jq '.items | group_by(.status)' data.json
jq '.items | map(.amount) | add' data.json
```

管道左边可能产生多个结果，右边会分别处理；外层 `[...]` 把输出流收集成一个数组。

## 从 shell 传参

```bash
jq --arg env prod '.items[] | select(.env == $env)' data.json
jq --argjson limit 10 '.items[] | select(.count > $limit)' data.json
```

`--arg` 传入字符串，`--argjson` 解析 JSON 值，适合数字、布尔、对象和数组。不要通过拼接过滤表达式直接插入不可信文本。

## 更新、合并与 CSV

```bash
jq '.enabled = true | del(.debug)' config.json
jq '.items |= map(.price *= 1.1)' data.json
jq -s '.[0] * .[1]' base.json override.json
jq -r '["id","name"], (.items[] | [.id,.name]) | @csv' data.json
```

CSV 明确指定列顺序，避免不同对象的键顺序造成错列。`*` 对对象递归合并，不是对所有类型都代表同一种操作。

## 条件与退出码

```bash
jq 'if .enabled then "on" else "off" end' config.json
jq 'try .items[] catch "invalid items"' data.json
jq -e '.errors | length == 0' report.json
```

`-e` 按最后输出值是否为 `false` 或 `null` 设置状态；没有输出和解析失败也有不同退出码。涉及大整数时先核对 jq 版本和数值处理行为，避免把精确 ID 当浮点数计算。浏览器格式化入口见 [JSON 工具](/tools#json)。

## 来源与许可

本页由 Jacob’s Wiki 于 2026-11-05 对 [IT-Tools 原文](https://github.com/sharevb/it-tools/blob/e7758934a80ea454497a857720db311ab152cf07/src/tools/jq-memo/jq.md)作中文摘译、重组和补充，保留常用操作，并非逐行全译。原文归 IT-Tools 项目贡献者所有。

本页译文与改编内容按 [GNU GPL 3.0](/licenses/it-tools-notes-GPL-3.0.txt) 提供，不附带担保；[本站 Markdown 源码](https://github.com/usrp1scut/mywiki/blob/main/docs/09-Dev/jq速查.md)可用于修改和再分发。

[返回开发运维速查目录](../00-开发运维速查.md)
